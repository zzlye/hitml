import { Buffer } from 'node:buffer';
import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const API_BASE = ORIGIN + '/v1';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };
const model = 'mj-v8.2';
const success = new Set(['completed', 'succeeded', 'success']);
const failure = new Set(['failed', 'failure', 'cancelled', 'canceled', 'error']);
const retryable = new Set([408, 429, 500, 502, 503, 504]);

function apiUrl(path) {
  const url = new URL(path, API_BASE + '/');
  if (url.origin !== ORIGIN || !url.pathname.startsWith('/v1/')) throw new Error('查询地址必须属于本站 API');
  return url;
}
function resultUrl(source) {
  if (typeof source !== 'string' || !source.trim()) throw new Error('结果图片地址为空');
  if (/^data:image\//i.test(source)) return source;
  const url = new URL(source, ORIGIN + '/v1/');
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('结果地址必须使用HTTP或HTTPS');
  return url;
}
async function readJson(response, { allowEmpty = false } = {}) {
  const text = await response.text();
  if (!text.trim()) {
    if (allowEmpty) return {};
    throw new Error('接口未返回JSON，HTTP ' + response.status);
  }
  let value;
  try { value = JSON.parse(text); }
  catch { throw new Error('接口未返回JSON，HTTP ' + response.status); }
  const error = value.error?.message || value.error_message || value.error_code || (!response.ok && (value.detail || value.message));
  if (!response.ok || error) throw new Error(String(error || 'HTTP ' + response.status));
  return value;
}
function intervalFor(response, fallback = 3000) {
  const raw = response.headers.get('Retry-After');
  if (!raw) return fallback;
  const seconds = Number(raw);
  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(raw) - Date.now();
  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : fallback;
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
  const resultExpired = data.result_expired === true || root.result_expired === true;
  return { taskId, status: statusValue.toLowerCase(), images, error: String(error || ''), resultExpired, raw: value };
}
function checkTerminal(parsed) {
  if (failure.has(parsed.status)) throw new Error(parsed.error || parsed.status);
  if (parsed.resultExpired) throw new Error('任务已完成，但图片结果已过期，请重新提交生成');
  if (success.has(parsed.status)) {
    if (!parsed.images.length) throw new Error('任务完成但没有image_urls，请检查原始响应');
    return true;
  }
  return false;
}

let parsed;
let interval = 3000;
if (process.argv[2]) {
  // 恢复已有任务时仅查询，不再次提交或生成。
  const saved = JSON.parse(await readFile(process.argv[2], 'utf8'));
  parsed = normalize(saved);
} else {
  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复查询，或在新目录生成');
  const request = process.env.WENYUN_MJ_REQUEST
    ? JSON.parse(await readFile(process.env.WENYUN_MJ_REQUEST, 'utf8'))
    : { model, prompt: '浅色背景上的橘子汽水，柔和光线，细腻插画', size: '1:1', raw: false, n: 1 };
  if (request.model !== model) throw new Error('请求文件中的模型名称必须为mj-v8.2');
  if (request.n != null && request.n !== 1) throw new Error('MJ的n固定为1');
  const response = await fetch(API_BASE + '/midjourney/generations', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(120000)
  });
  const submitted = normalize(await readJson(response, { allowEmpty: true }), response.headers.get('X-NewAPI-Task-Id') || '');
  if (submitted.error) throw new Error(submitted.error);
  if (checkTerminal(submitted)) {
    parsed = submitted;
  } else {
    if (!submitted.taskId) throw new Error('未返回task_id，请保留响应并核对任务记录，不要自动重新生成');
    parsed = { taskId: submitted.taskId, status: '', images: [], error: '', resultExpired: false, raw: { task_id: submitted.taskId } };
    await writeFile('task.json', JSON.stringify({ task_id: submitted.taskId }, null, 2), { flag: 'wx' });
    console.log('任务已保存：' + submitted.taskId);
    interval = intervalFor(response, interval);
  }
}

if (!checkTerminal(parsed)) {
  if (typeof parsed.taskId !== 'string' || !parsed.taskId) throw new Error('任务文件缺少task_id');
  const pollUrl = apiUrl('/v1/tasks/' + encodeURIComponent(parsed.taskId));
  const deadline = Date.now() + 30 * 60 * 1000;
  while (true) {
    if (Date.now() + interval >= deadline) throw new Error('等待已结束，可传入task.json恢复查询');
    await delay(interval);
    let response;
    try {
      response = await fetch(pollUrl, { headers, redirect: 'error', signal: AbortSignal.timeout(30000), cache: 'no-store' });
    } catch {
      // 网络错误只重试查询，禁止自动重发生成请求。
      interval = Math.min(interval * 2, 30000);
      continue;
    }
    if (retryable.has(response.status)) {
      await response.body?.cancel();
      interval = Math.max(intervalFor(response, interval), Math.min(interval * 2, 30000));
      continue;
    }
    parsed = normalize(await readJson(response), parsed.taskId);
    interval = intervalFor(response, interval);
    if (checkTerminal(parsed)) break;
    if (!parsed.status) throw new Error('查询响应缺少status，请保留原始响应排查');
  }
}

await writeFile('result.json', JSON.stringify(parsed.raw, null, 2));
for (const [index, source] of parsed.images.entries()) {
  const name = 'image-' + (index + 1);
  if (/^data:image\//i.test(source)) {
    const match = source.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) throw new Error('Data URL必须是PNG、JPEG或WebP的Base64图片');
    const ext = match[1].toLowerCase() === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    await writeFile(name + '.' + ext, Buffer.from(match[2], 'base64'));
    continue;
  }
  const response = await fetch(resultUrl(source), { redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!response.ok || !response.body) throw new Error('图片下载失败，HTTP ' + response.status);
  const mime = (response.headers.get('Content-Type') || '').split(';')[0].trim();
  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[mime];
  if (!ext) throw new Error('图片下载返回了非图片内容：' + mime);
  try {
    await pipeline(Readable.fromWeb(response.body), createWriteStream(name + '.' + ext + '.part'));
    await rename(name + '.' + ext + '.part', name + '.' + ext);
  } catch (error) {
    await rm(name + '.' + ext + '.part', { force: true });
    throw error;
  }
}
console.log('已保存' + parsed.images.length + '张单图');
