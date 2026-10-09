// 只保留线上实际提供的MJ模型，并让文档示例与当前服务的返回解析保持一致。
export const MJ_SIZES = ['auto', '1:1', '3:2', '2:3', '4:3', '3:4', '5:4', '4:5', '16:9', '9:16', '21:9', '9:21'];

const heading = (value) => ({ type: 'heading', value });
const paragraph = (value) => ({ type: 'paragraph', value });
const note = (value) => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const code = (lang, value) => ({ type: 'code', lang, value });
const json = (value) => code('json', JSON.stringify(value, null, 2));

export const mjCommonRows = [
  ['model', 'string', '是', 'mj-v8.2', '固定填写公开模型名称`mj-v8.2`。'],
  ['prompt', 'string', '是', '至少1个字符', '描述主体、场景、构图、画风、光线及参考图需要保留或修改的部分。'],
  ['size', 'string', '否', '默认9:16；见下表', '填写画面比例，例如`16:9`，不是`1024x1024`这样的像素尺寸。'],
  ['image', 'string', '否', '公网图片URL或data:image/...', '单张参考图；有多张时使用`images`。'],
  ['images', 'string[]', '否', '1–5张', '每项为图片URL或data:image/...；数组顺序保留。单张和多张写法选一种即可。'],
  ['raw', 'boolean', '否', '默认false', '`true`启用Raw原始风格；传JSON布尔值，不要传字符串"true"。'],
  ['n', 'integer', '否', '固定1', '表示一次提交；普通生成一次返回4张单图，不要设置为4。']
];

const sizeRows = [
  ['auto', '由模型结合提示词或参考图判断'], ['1:1', '正方形、头像、商品图'],
  ['3:2', '横向摄影'], ['2:3', '竖向摄影'], ['4:3', '横向插画'], ['3:4', '竖向插画'],
  ['5:4', '横向展示'], ['4:5', '竖向海报'], ['16:9', '横向宽屏'], ['9:16', '竖屏；默认比例'],
  ['21:9', '超宽横图'], ['9:21', '超长竖图']
];

const curl = (body) => code('bash', `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/midjourney/generations' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  --data '${JSON.stringify(body, null, 2)}'`);

// 按线上前端实际使用的层级解析任务响应，兼容顶层和data包装。
export const parseMjTaskResponse = (value, headerTaskId = '', baseUrl = '') => {
  const root = value && typeof value === 'object' ? value : {};
  const data = root.data && typeof root.data === 'object' && !Array.isArray(root.data) ? root.data : root;
  const result = data.result && typeof data.result === 'object' ? data.result : data;
  const output = result.data && typeof result.data === 'object' && !Array.isArray(result.data) ? result.data : result;
  const taskId = typeof data.task_id === 'string' ? data.task_id : typeof root.task_id === 'string' ? root.task_id : headerTaskId;
  const statusValue = typeof data.status === 'string' ? data.status : typeof root.status === 'string' ? root.status : '';
  const images = Array.isArray(output.image_urls) ? output.image_urls.filter((item) => typeof item === 'string' && item.trim()) : [];
  const error = data.error_message ?? root.error_message ?? data.error_code ?? root.error_code ?? data.error?.message ?? root.error?.message ?? '';
  const resultExpired = data.result_expired === true || root.result_expired === true;
  const resolveImage = (source) => {
    if (typeof source !== 'string' || !source.trim()) return '';
    if (/^data:image\//i.test(source)) return source;
    try {
      const url = new URL(source, baseUrl || undefined);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
    } catch {
      return '';
    }
  };
  return { taskId, status: statusValue.toLowerCase(), images: images.map(resolveImage).filter(Boolean), error: String(error || ''), resultExpired, raw: value };
};

// 页面代码示例与独立下载文件使用同一份固定型号正文。
const MJ_CLIENT = String.raw`import { Buffer } from 'node:buffer';
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
`;

export const createMjClient = () => MJ_CLIENT;

function resultBlocks() {
  return [
    heading('异步任务：提交、查询、保存'),
    paragraph('提交接口先返回任务受理信息，不代表图片已经生成完成。任务号优先读取响应体中的`task_id`，也兼容`data.task_id`和响应头`X-NewAPI-Task-Id`；拿到任务号后使用同一个Key调用`GET /v1/tasks/{task_id}`，直到任务进入完成或失败状态。'),
    json({ id: 'task_mj_example', task_id: 'task_mj_example', status: 'processing', result_expired: false, data: { task_id: 'task_mj_example', status: 'processing', progress: '0%' } }),
    code('bash', `curl --fail-with-body 'https://api.zzlye.xyz/v1/tasks/task_mj_example' \\
  -H "Authorization: Bearer $WENYUN_API_KEY"`),
    table(['返回字段', '实际兼容位置', '含义与处理'], [
      ['task_id', '顶层或data.task_id；也兼容X-NewAPI-Task-Id', '本次任务编号，保存后用于恢复查询。'],
      ['status', '顶层或data.status', '`submitted`、`pending`、`processing`、`waiting`、`queued`、`running`表示继续查询。'],
      ['完成状态', '顶层或data.status', '`completed`、`succeeded`、`success`均按成功处理。'],
      ['失败状态', '顶层或data.status', '`failed`、`failure`、`cancelled`、`canceled`、`error`停止查询并读取错误字段。'],
      ['image_urls', 'data.result.data.image_urls、result.data.image_urls或data.image_urls', '图片URL数组；按数组顺序下载4张单图。'],
      ['result_expired', '顶层或data.result_expired', '为`true`表示任务记录仍在但图片文件已过期，不能继续取图。'],
      ['error_message / error_code / error.message', '顶层或data对象', '失败原因；停止等待，不要把失败当作空图片成功。']
    ]),
    json({ id: 'task_mj_example', task_id: 'task_mj_example', status: 'succeeded', result_expired: false, data: { task_id: 'task_mj_example', status: 'completed', progress: '100%', result: { data: {
      image_urls: [1, 2, 3, 4].map(index => '/task-media/task_mj_example/media/' + (index - 1) + '?expires=...&signature=...')
    } } }, result: { data: { image_urls: [1, 2, 3, 4].map(index => '/task-media/task_mj_example/media/' + (index - 1) + '?expires=...&signature=...') } } }),
    paragraph('完成响应的图片字段以`image_urls`为准。返回地址可能是带签名的相对地址，需以当前API域名补全；地址可能过期，完成后及时下载。下载图片时不要携带文运工坊Key。'),
    heading('完整示例：生成、断点恢复与图片下载'),
    paragraph('将下面代码保存为`mj-v8.2.mjs`，使用Node.js 22或更新版本运行。设置`WENYUN_API_KEY`，执行`node mj-v8.2.mjs`；中断后执行`node mj-v8.2.mjs task.json`恢复查询。结果保存为`result.json`和`image-1.png`等。'),
    code('bash', `export WENYUN_API_KEY='YOUR_API_KEY'
node mj-v8.2.mjs

# 中断后仅恢复查询，不重复提交。
node mj-v8.2.mjs task.json`),
    paragraph('本示例固定使用`mj-v8.2`。自定义请求可保存为JSON文件，再设置`WENYUN_MJ_REQUEST`为该文件路径，请求中的`model`也填写`mj-v8.2`。恢复已有任务不会重新读取请求文件，也不会再次生成。'),
    code('javascript', createMjClient()),
    heading('常见错误与处理'),
    table(['情况', '处理方式'], [
      ['鉴权失败', '确认使用文运工坊Key，并对提交和查询使用同一个Key。'],
      ['模型不存在', '请求的`model`必须填写`mj-v8.2`。'],
      ['提交后取不到任务号', '按顶层`task_id`、`data.task_id`、`X-NewAPI-Task-Id`的顺序读取，保留原始响应后再排查。'],
      ['查询响应没有data.status', '同时兼容顶层`status`和`data.status`，不要只读取固定一层。'],
      ['完成但没有图片', '读取`image_urls`所在的`result.data`层级；同时检查`result_expired`，保留原始响应排查。'],
      ['比例不合法', '填写本页比例枚举；`size`不是GPT Image的像素尺寸字段。'],
      ['参考图加载失败', '确认URL无需登录即可读取，或提供完整data:image/...内容；检查张数和顺序。'],
      ['查询超时或网络断开', '保留task.json恢复查询，不要自动重新发起生成。']
    ]),
    note('价格以模型列表与实际账单为准；不要依据返回图片数组长度推算其他模型的价格。')
  ];
}

function commonBlocks() {
  return [
    heading('模型与接口'),
    table(['项目', '填写方式'], [
      ['模型名称', 'mj-v8.2'], ['Base URL', 'https://api.zzlye.xyz/v1'],
      ['创建任务', 'POST /v1/midjourney/generations'], ['查询任务', 'GET /v1/tasks/{task_id}'],
      ['鉴权', 'Authorization: Bearer YOUR_API_KEY'], ['请求格式', 'Content-Type: application/json'],
      ['普通生成输出', '一次任务4张单图'], ['参考图片', '单张image或1–5张images']
    ]),
    paragraph('`mj-v8.2`支持文生图、单张参考图和多张参考图生成。任务接口的外层字段兼容顶层和`data`包装，完成结果从`image_urls`读取。'),
    heading('请求参数'),
    table(['参数', '类型', '必填', '取值或默认值', '用途'], mjCommonRows),
    heading('画面比例与Raw'),
    table(['size', '适用画幅'], sizeRows),
    note('`size`填写比例，不提供固定输出像素保证；`n`固定1，普通生成返回4张单图。默认比例为9:16，推荐在请求中明确指定所需比例。'),
    paragraph('Raw通过`raw: true`开启。`mj-v8.2`会将size、raw补充到提示词中；提示词已有`--ar`、`--raw`等参数时保留已有参数并避免重复追加。为避免冲突，结构化字段与提示词中的比例应保持一致。'),
    heading('文生图'),
    curl({ model: 'mj-v8.2', prompt: '一杯橘子汽水，玻璃杯上的水珠，清晨自然光，精致商业摄影', size: '1:1', raw: false, n: 1 }),
    heading('单张与多张参考图'),
    paragraph('图片URL必须能从公网直接读取。使用Base64时传完整的`data:image/png;base64,...`或对应图片类型的Data URL，不能只传裸Base64。多图按数组顺序说明各张图的用途，最多5张。'),
    curl({ model: 'mj-v8.2', prompt: '保留参考图主体外形，改为夜晚街道的电影感构图', size: '16:9', image: 'https://example.com/reference.jpg', raw: true, n: 1 }),
    curl({ model: 'mj-v8.2', prompt: '保留第一张图中的主体，参考第二张图的配色和光线', size: '4:5', images: ['https://example.com/subject.jpg', 'https://example.com/style.jpg'], n: 1 })
  ];
}

export const MIDJOURNEY_PAGES = [
  { id: 'mj-v8.2', label: 'mj-v8.2', title: 'mj-v8.2', lead: '四图生成：7项参数、12种比例、Raw、参考图与兼容实际返回结构的异步任务示例。', blocks: [...commonBlocks(), ...resultBlocks()] }
];
