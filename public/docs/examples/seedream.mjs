import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置 WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };

// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。
function ownUrl(path) {
  const url = new URL(path, ORIGIN);
  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');
  return url;
}
async function readJson(response) {
  const text = await response.text();
  let value;
  try { value = JSON.parse(text); }
  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }
  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);
  return value;
}
function nextInterval(response) {
  const value = response.headers.get('Retry-After');
  if (!value) return 3000;
  const seconds = Number(value);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;
}

let submitted;
let interval = 3000;
if (process.argv[2]) {
  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。
  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));
} else {
  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录创建新任务');
  const response = await fetch(ORIGIN + '/v1/images/generations', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },
    body: JSON.stringify({ model: 'seedream-5-pro', prompt: '浅色背景上的一杯橘子汽水', n: 1 }),
    redirect: 'error',
    signal: AbortSignal.timeout(120000)
  });
  submitted = await readJson(response);
  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');
  interval = nextInterval(response);
  console.log('请保留任务编号：', submitted.task_id);
  await writeFile('task.json', JSON.stringify(submitted, null, 2), { flag: 'wx' });
  console.log('任务已保存：', submitted.task_id);
}
if (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');
const pollUrl = ownUrl(submitted.poll_url);
const deadline = Date.now() + 30 * 60 * 1000;
let task;
while (Date.now() < deadline) {
  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。
  if (Date.now() + interval >= deadline) break;
  await delay(interval);
  let check;
  try {
    check = await fetch(pollUrl, {
      headers, redirect: 'error', signal: AbortSignal.timeout(30000)
    });
  } catch {
    // 查询网络错误只重试查询，绝不重新提交生成。
    interval = Math.min(interval * 2, 30000);
    continue;
  }
  if (check.status === 429 || check.status >= 500) {
    await check.body?.cancel();
    interval = Math.max(nextInterval(check), Math.min(interval * 2, 30000));
    continue;
  }
  interval = nextInterval(check);
  task = await readJson(check);
  if (task.status === 'succeeded') break;
  if (['failed', 'cancelled'].includes(task.status)) {
    throw new Error(task.error?.message || task.status);
  }
  if (!['pending', 'processing', 'waiting'].includes(task.status)) {
    throw new Error('未识别的任务状态：' + task.status);
  }
}
if (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');
if (task.result_expired) throw new Error('结果文件已过期');
await writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));
const files = task.media ?? [];
for (const [index, item] of files.entries()) {
  const file = await fetch(ownUrl(item.url), {
    headers, redirect: 'error', signal: AbortSignal.timeout(120000)
  });
  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);
  if (!file.body) throw new Error('下载响应缺少文件内容');
  const mime = item.content_type || file.headers.get('Content-Type') || '';
  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';
  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。
  const name = 'result-' + index + '.' + ext;
  try {
    await pipeline(Readable.fromWeb(file.body), createWriteStream(name + '.part'));
    await rename(name + '.part', name);
  } catch (error) {
    await rm(name + '.part', { force: true });
    throw error;
  }
}
if (!files.length) throw new Error('没有归档媒体，请检查result.json中的原生图片结果或失败原因');
console.log('文件已保存');
