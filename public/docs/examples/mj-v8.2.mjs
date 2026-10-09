import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };
const model = process.env.WENYUN_MJ_MODEL || 'mj-v8.2';
// 当前示例只接受本页型号，防止请求文件与文档使用不同的模型。
if (model !== 'mj-v8.2') throw new Error('本示例仅适用于mj-v8.2');

function ownUrl(path) {
  const url = new URL(path, ORIGIN);
  if (url.origin !== ORIGIN) throw new Error('查询地址必须属于本站');
  return url;
}
async function readJson(response) {
  let value;
  try { value = JSON.parse(await response.text()); }
  catch { throw new Error('接口未返回JSON，HTTP ' + response.status); }
  if (!response.ok || value.error || value.error_code || value.error_message) {
    throw new Error(value.error?.message || value.error_message || value.message || 'HTTP ' + response.status);
  }
  return value;
}
function intervalFor(response) {
  const raw = response.headers.get('Retry-After');
  if (!raw) return 3000;
  const seconds = Number(raw);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(raw) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;
}

let saved;
let interval = 3000;
if (process.argv[2]) {
  // 恢复已有任务时仅查询，不再次提交或生成。
  saved = JSON.parse(await readFile(process.argv[2], 'utf8'));
} else {
  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录生成');
  const request = process.env.WENYUN_MJ_REQUEST
    ? JSON.parse(await readFile(process.env.WENYUN_MJ_REQUEST, 'utf8'))
    : { model, prompt: '浅色背景上的橘子汽水，柔和光线，细腻插画', size: '1:1', raw: false, n: 1 };
  if (request.model !== model) throw new Error('请求文件中的模型名称必须为mj-v8.2');
  if (request.n != null && request.n !== 1) throw new Error('MJ的n固定为1');
  const response = await fetch(ORIGIN + '/v1/midjourney/generations', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(120000)
  });
  const submitted = await readJson(response);
  const id = submitted.data?.task_id || response.headers.get('X-NewAPI-Task-Id');
  if (!id) throw new Error('未返回task_id，请保留响应并核对任务记录，不要自动重新生成');
  saved = { task_id: id, model: request.model };
  await writeFile('task.json', JSON.stringify(saved, null, 2), { flag: 'wx' });
  console.log('任务已保存：' + id);
  interval = intervalFor(response);
}
if (typeof saved.task_id !== 'string' || !saved.task_id) throw new Error('任务文件缺少task_id');
if (saved.model && saved.model !== model) throw new Error('任务文件中的模型名称必须为mj-v8.2');
const pollUrl = ownUrl('/v1/tasks/' + encodeURIComponent(saved.task_id));
const deadline = Date.now() + 30 * 60 * 1000;
let task;
while (Date.now() + interval < deadline) {
  await delay(interval);
  let response;
  try {
    response = await fetch(pollUrl, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  } catch {
    // 网络错误只重试查询，禁止自动重发生成请求。
    interval = Math.min(interval * 2, 30000);
    continue;
  }
  if (response.status === 429 || response.status >= 500) {
    await response.body?.cancel();
    interval = Math.max(intervalFor(response), Math.min(interval * 2, 30000));
    continue;
  }
  interval = intervalFor(response);
  const payload = await readJson(response);
  task = payload.data;
  if (!task || typeof task.status !== 'string') throw new Error('任务响应缺少data.status');
  if (task.error_code || task.error_message || ['failed', 'failure', 'cancelled'].includes(task.status)) {
    throw new Error(task.error_message || task.error?.message || task.status);
  }
  if (task.status === 'completed') break;
}
if (task?.status !== 'completed') throw new Error('等待已结束，可传入task.json恢复查询');
await writeFile('result.json', JSON.stringify(task, null, 2));
const result = task.result?.data;
const urls = result?.image_urls || [];
if (!Array.isArray(urls)) throw new Error('image_urls必须是数组');
if (!urls.length) {
  throw new Error('任务没有图片，请检查result.json');
} else {
  // 封面与四张单图分别保存，不能把封面计入生成的单图数量。
  const files = urls.map((url, index) => ({ url, name: 'image-' + (index + 1) }));
  if (result.grid_image_url) files.push({ url: result.grid_image_url, name: 'grid-cover' });
  for (const item of files) {
    const url = new URL(item.url);
    if (url.protocol !== 'https:') throw new Error('结果地址必须使用HTTPS');
    // 图片地址可能属于外部CDN，下载时不携带文运工坊Key。
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(120000) });
    if (!response.ok || !response.body) throw new Error('图片下载失败，HTTP ' + response.status);
    const mime = (response.headers.get('Content-Type') || '').split(';')[0].trim();
    const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[mime];
    if (!ext) throw new Error('图片下载返回了非图片内容：' + mime);
    const name = item.name + '.' + ext;
    try {
      await pipeline(Readable.fromWeb(response.body), createWriteStream(name + '.part'));
      await rename(name + '.part', name);
    } catch (error) {
      await rm(name + '.part', { force: true });
      throw error;
    }
  }
  console.log('已保存' + urls.length + '张单图' + (result.grid_image_url ? '和四宫格封面' : ''));
}
