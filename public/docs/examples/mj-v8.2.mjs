import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };
const model = 'mj-v8.2';

function ownUrl(path) {
  const url = new URL(path, ORIGIN);
  if (url.origin !== ORIGIN) throw new Error('查询地址必须属于本站');
  return url;
}
async function readJson(response) {
  let value;
  try { value = JSON.parse(await response.text()); }
  catch { throw new Error('接口未返回JSON，HTTP ' + response.status); }
  const error = value.error?.message || value.error_message || value.message || value.detail || value.error_code;
  if (!response.ok || error) throw new Error(String(error || 'HTTP ' + response.status));
  return value;
}
function intervalFor(response) {
  const raw = response.headers.get('Retry-After');
  if (!raw) return 3000;
  const seconds = Number(raw);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(raw) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;
}
function normalize(value, headerTaskId = '') {
  const root = value && typeof value === 'object' ? value : {};
  const data = root.data && typeof root.data === 'object' && !Array.isArray(root.data) ? root.data : root;
  const result = data.result && typeof data.result === 'object' ? data.result : data;
  const output = result.data && typeof result.data === 'object' && !Array.isArray(result.data) ? result.data : result;
  const taskId = typeof data.task_id === 'string' ? data.task_id : typeof root.task_id === 'string' ? root.task_id : headerTaskId;
  const statusValue = typeof data.status === 'string' ? data.status : typeof root.status === 'string' ? root.status : '';
  const images = Array.isArray(output.image_urls) ? output.image_urls.filter(item => typeof item === 'string' && item.trim()) : [];
  const error = data.error_message || root.error_message || data.error_code || root.error_code || data.error?.message || root.error?.message || '';
  return { taskId, status: statusValue.toLowerCase(), images, error, raw: value };
}
const success = new Set(['completed', 'succeeded', 'success']);
const failure = new Set(['failed', 'failure', 'cancelled', 'canceled', 'error']);

let task;
let interval = 3000;
if (process.argv[2]) {
  // 恢复已有任务时仅查询，不再次提交或生成。
  task = JSON.parse(await readFile(process.argv[2], 'utf8'));
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
  const submitted = normalize(await readJson(response), response.headers.get('X-NewAPI-Task-Id') || '');
  if (submitted.error) throw new Error(submitted.error);
  if (submitted.images.length && success.has(submitted.status)) {
    task = submitted;
  } else {
    if (!submitted.taskId) throw new Error('未返回task_id，请保留响应并核对任务记录，不要自动重新生成');
    task = { task_id: submitted.taskId };
    await writeFile('task.json', JSON.stringify(task, null, 2), { flag: 'wx' });
    console.log('任务已保存：' + submitted.taskId);
    interval = intervalFor(response);
  }
}
const taskId = task.task_id || task.taskId;
if (typeof taskId !== 'string' || !taskId) throw new Error('任务文件缺少task_id');
const pollUrl = ownUrl('/v1/tasks/' + encodeURIComponent(taskId));
const deadline = Date.now() + 30 * 60 * 1000;
let parsed = normalize(task, taskId);
while (!parsed.images.length || !success.has(parsed.status)) {
  if (failure.has(parsed.status)) throw new Error(parsed.error || parsed.status);
  if (Date.now() + interval >= deadline) break;
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
  parsed = normalize(await readJson(response), taskId);
  if (parsed.error && failure.has(parsed.status)) throw new Error(parsed.error);
}
if (!success.has(parsed.status)) throw new Error('等待已结束，可传入task.json恢复查询');
if (!parsed.images.length) throw new Error('任务完成但没有image_urls，请检查原始响应');
await writeFile('result.json', JSON.stringify(parsed.raw, null, 2));
for (const [index, source] of parsed.images.entries()) {
  const url = new URL(source);
  if (url.protocol !== 'https:') throw new Error('结果地址必须使用HTTPS');
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok || !response.body) throw new Error('图片下载失败，HTTP ' + response.status);
  const mime = (response.headers.get('Content-Type') || '').split(';')[0].trim();
  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[mime];
  if (!ext) throw new Error('图片下载返回了非图片内容：' + mime);
  const name = 'image-' + (index + 1) + '.' + ext;
  try {
    await pipeline(Readable.fromWeb(response.body), createWriteStream(name + '.part'));
    await rename(name + '.part', name);
  } catch (error) {
    await rm(name + '.part', { force: true });
    throw error;
  }
}
console.log('已保存' + parsed.images.length + '张单图');
