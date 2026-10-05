import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置 WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };
const taskFile = process.argv[2] || 'video-task.json';
const request = {
  model: 'sd-2.0',
  prompt: '晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍',
  duration: 6, resolution: '720p', aspect_ratio: '16:9'
  // 图生视频时在提示词中引用@Image1，并增加 image_refs: ['https://你的域名/参考图.jpg']。
};

async function readJson(response) {
  const text = await response.text();
  let value;
  try { value = JSON.parse(text); }
  catch { throw new Error('接口未返回JSON，HTTP ' + response.status); }
  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);
  return value;
}
function retryAfter(response, fallback = 15000) {
  const value = response.headers.get('Retry-After');
  if (!value) return fallback;
  const seconds = Number(value);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();
  return Number.isFinite(ms) && ms >= 0 ? Math.max(ms, 1000) : fallback;
}

let submitted;
let interval = 15000;
if (process.argv[2]) {
  // 恢复时只读取已保存的编号，不再次创建收费任务。
  submitted = JSON.parse(await readFile(taskFile, 'utf8'));
} else {
  if (existsSync(taskFile)) throw new Error('已有video-task.json，请传入此文件恢复，或在新目录创建新任务');
  // 创建请求只发送一次；连接超时也不自动重发。
  const response = await fetch(ORIGIN + '/v1/videos', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(120000)
  });
  submitted = await readJson(response);
  if (!submitted.id && !submitted.task_id) throw new Error('响应缺少视频任务id');
  console.log('请保留任务编号：', submitted.id || submitted.task_id);
  await writeFile(taskFile, JSON.stringify(submitted, null, 2), { flag: 'wx' });
  interval = retryAfter(response);
}
const id = submitted.id || submitted.task_id;
if (typeof id !== 'string' || !id || id.startsWith('async_')) {
  throw new Error('需要Videos任务id；async_编号请使用网关任务示例');
}
const endpoint = ORIGIN + '/v1/videos/' + encodeURIComponent(id);
const deadline = Date.now() + 30 * 60 * 1000;
let task;
while (Date.now() + interval < deadline) {
  await delay(interval);
  let response;
  try {
    response = await fetch(endpoint, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  } catch {
    // 网络故障只重试查询，不重新提交生成。
    interval = Math.min(interval * 2, 30000);
    continue;
  }
  if (response.status === 429 || response.status >= 500) {
    interval = Math.max(retryAfter(response), Math.min(interval * 2, 30000));
    await response.body?.cancel();
    continue;
  }
  task = await readJson(response);
  interval = retryAfter(response);
  console.log('任务状态：', task.status, '进度：', task.progress ?? '未提供');
  if (task.status === 'completed') break;
  if (task.status === 'failed') throw new Error(task.error?.message || '视频生成失败：' + id);
  if (!['queued', 'in_progress'].includes(task.status)) throw new Error('未知视频状态：' + task.status);
}
if (task?.status !== 'completed') throw new Error('本地等待结束；传入任务文件继续查询，服务端任务不会因此取消');
await writeFile('video-result.json', JSON.stringify(task, null, 2));

// 流式下载；完成前使用临时扩展名，避免把不完整视频误认为成品。
const response = await fetch(endpoint + '/content', {
  headers, redirect: 'error', signal: AbortSignal.timeout(300000)
});
if (!response.ok) throw new Error('视频下载失败，HTTP ' + response.status + '；可以用原任务文件重试');
if (!response.body) throw new Error('下载响应缺少文件内容');
const mime = (response.headers.get('Content-Type') || '').split(';')[0];
if (mime && !mime.startsWith('video/') && mime !== 'application/octet-stream') {
  throw new Error('下载返回的不是视频：' + mime);
}
try {
  await pipeline(Readable.fromWeb(response.body), createWriteStream('result.mp4.part'));
  await rename('result.mp4.part', 'result.mp4');
} catch (error) {
  await rm('result.mp4.part', { force: true });
  throw error;
}
console.log('已保存 result.mp4');
