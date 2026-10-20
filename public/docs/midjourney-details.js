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
  ['prompt', 'string', '是', '1–1023个字符', '描述主体、场景、构图、画风、光线；参考图用途也写在这里。长度限制针对prompt字段，不是1023个单词或tokens。'],
  ['size', 'string', '否', '默认9:16；见下表', '填写画面比例，例如`16:9`，不是`1024x1024`这样的像素尺寸。'],
  ['image', 'string', '否', '公网图片URL或data:image/...', '单张参考图；有多张时使用`images`。'],
  ['images', 'string[]', '否', '1–5张', '每项为图片URL或data:image/...；数组顺序保留。单张和多张写法选一种即可。'],
  ['raw', 'boolean', '否', '默认false', '`true`启用Raw原始风格；传JSON布尔值，不要传字符串"true"。'],
  ['negative_prompt', 'string', '否', '按需填写', '描述希望排除的主体、元素或画面特征；不替代正向prompt。'],
  ['seed', 'integer', '否', '按需填写', '随机种子；未约定统一的默认值和数值范围，不保证不同参数组合复现相同画面。'],
  ['stylize', 'number', '否', '0–1000；默认100', '风格化强度，数值越高越偏向模型自身的美学表现。'],
  ['chaos', 'number', '否', '0–100；默认0', '控制结果之间的变化程度。'],
  ['weird', 'number', '否', '0–3000；默认0', '控制画面的非传统、怪异风格。'],
  ['tile', 'boolean', '否', '按需填写', '平铺纹理开关；使用JSON布尔值，不传字符串。'],
  ['iw', 'number', '否', '0–3', '普通参考图权重，与image或images配合，不代替参考图字段。'],
  ['cref', 'string', '否', '角色参考图URL', '用于角色参考；需要调整角色权重时配合cw。'],
  ['sref', 'string', '否', '风格参考图URL', '用于风格参考；需要调整风格权重时配合sw。'],
  ['dref', 'string', '否', '深度参考图URL', '用于深度参考；需要调整深度权重时配合dw。'],
  ['cw', 'number', '否', '0–100', '角色参考权重，与cref配合。'],
  ['sw', 'number', '否', '0–1000', '风格参考权重，与sref配合。'],
  ['dw', 'number', '否', '0–100', '深度参考权重，与dref配合。'],
  ['quality', 'number', '否', '0.25 / 0.5 / 1 / 2；默认1', '发送JSON数值，不是GPT Image的low、medium、high，也不是数字字符串。'],
  ['hd', 'boolean', '否', '默认false', 'HD高清开关；不等同于size比例，也不约定固定输出像素。'],
  ['n', 'integer', '否', '固定1', '表示一次提交；普通生成一次返回4张单图，不要设置为4。'],
  ['action', 'string', '否', '见后续动作表', '对已有任务执行操作；普通文生图与参考生图不需要填写。'],
  ['task_id', 'string', '否', '父任务ID', '执行后续动作时指定原任务，不用于替换model或当前请求的鉴权。'],
  ['index', 'integer', '否', '按原任务操作指定', '选择原任务中的某张图片；未约定统一的索引范围，不自行假定0起始或1起始。'],
  ['custom_id', 'string', '否', '原任务提供的按钮ID', '执行对应按钮操作时填写，不自行拼接按钮编号。'],
  ['direction', 'string', '否', '按平移动作指定', '平移方向；示例值left，不将未列出的方向视为固定枚举。'],
  ['zoom_ratio', 'number', '否', '按扩图操作指定', '扩图倍数；未约定统一的范围和默认值。'],
  ['dimensions', 'string', '否', '按融图操作指定', '融图画幅；示例值SQUARE，不是像素尺寸，也不是size的替代字段。']
];

export const MJ_ACTIONS = ['upscale', 'variation', 'high_variation', 'low_variation', 'remix_strong', 'remix_subtle', 'reroll', 'zoom', 'pan', 'blend', 'edits', 'describe'];

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
  // 只校验文档已经明确的输入限制，不改写任务返回或静默截断提示词。
  const promptLength = typeof request.prompt === 'string' ? Array.from(request.prompt).length : 0;
  if (promptLength < 1 || promptLength > 1023) throw new Error('prompt长度必须为1–1023个字符');
  if (request.image != null && request.images != null) throw new Error('image与images请选择一种');
  const validReference = value => {
    if (typeof value !== 'string' || !value.trim()) return false;
    if (/^data:image\/[^;,]+;base64,.+/i.test(value)) return true;
    try { return ['https:', 'http:'].includes(new URL(value).protocol); }
    catch { return false; }
  };
  if (request.image != null && !validReference(request.image)) throw new Error('image必须是图片URL或完整Data URL');
  if (request.images != null && (!Array.isArray(request.images) || request.images.length < 1 || request.images.length > 5 || !request.images.every(validReference))) {
    throw new Error('images必须包含1–5张图片URL或完整Data URL');
  }
  const ranges = { stylize: [0, 1000], chaos: [0, 100], weird: [0, 3000], iw: [0, 3], cw: [0, 100], sw: [0, 1000], dw: [0, 100] };
  for (const [field, [min, max]] of Object.entries(ranges)) {
    if (request[field] != null && (typeof request[field] !== 'number' || !Number.isFinite(request[field]) || request[field] < min || request[field] > max)) {
      throw new Error(field + '必须为' + min + '–' + max + '之间的数值');
    }
  }
  if (request.quality != null && ![0.25, 0.5, 1, 2].includes(request.quality)) throw new Error('quality必须为数值0.25、0.5、1或2');
  for (const field of ['raw', 'hd', 'tile']) {
    if (request[field] != null && typeof request[field] !== 'boolean') throw new Error(field + '必须为JSON布尔值');
  }
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
    paragraph('完成响应的图片字段以`image_urls`为准。返回地址可能是带签名的相对地址，需以当前API域名补全；地址可能过期，完成后及时下载。下载图片时不要携带西米露Key。'),
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
      ['鉴权失败', '确认使用西米露Key，并对提交和查询使用同一个Key。'],
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
      ['普通生成输出', '一次任务4张单图'], ['提示词长度', 'prompt为1–1023个字符'],
      ['参考图片', '单张image或1–5张images；URL或完整Data URL']
    ]),
    paragraph('`mj-v8.2`支持文生图和参考生图，可提供单张或多张参考图片。任务接口的外层字段兼容顶层和`data`包装，完成结果从`image_urls`读取。'),
    heading('请求参数'),
    table(['参数', '类型', '必填', '取值或默认值', '用途'], mjCommonRows),
    note('prompt最长1023个字符。不要按tokens或单词数计算，也不要把参考图片的Base64拼进prompt；图片内容通过image或images单独提交。超长时先精简提示词，不依靠客户端静默截断。'),
    heading('画面比例与Raw'),
    table(['size', '适用画幅'], sizeRows),
    note('`size`填写比例，不提供固定输出像素保证；`n`固定1，普通生成返回4张单图。默认比例为9:16，推荐在请求中明确指定所需比例。'),
    paragraph('Raw通过`raw: true`开启。优先使用size、raw及下表列出的独立参数，不在prompt中重复拼接相互冲突的--ar、--raw等指令。quality填写数值0.25、0.5、1或2，不使用其他图片模型的质量档位名称。'),
    heading('文生图'),
    curl({ model: 'mj-v8.2', prompt: '一杯橘子汽水，玻璃杯上的水珠，清晨自然光，精致商业摄影', size: '1:1', raw: false, n: 1 }),
    heading('画质与风格控制'),
    paragraph('以下是在普通生成请求中加入可选参数的写法。stylize、chaos、weird分别控制风格化、画面变化和怪异程度；negative_prompt描述不希望出现的内容。hd与raw为布尔值，quality及强度参数为数值。'),
    curl({ model: 'mj-v8.2', prompt: '清晨花店门口，柔和日光，精致商业摄影', negative_prompt: '模糊，多余文字', size: '4:5', raw: false, quality: 1, hd: false, stylize: 100, chaos: 0, weird: 0, n: 1 }),
    // 参考图用于生成新图片，统一使用参考生图的功能名称。
    heading('参考生图（单张与多张参考图）'),
    paragraph('提供参考图片并配合提示词生成新的图片。单张参考图使用`image`，多张参考图使用`images`；在提示词中说明希望参考的主体、配色、光线或构图。'),
    paragraph('创建接口仍为POST /v1/midjourney/generations，使用application/json，不是multipart文件上传。图片URL必须直接返回公网可读的图片文件，不能是网页、本机路径或需要登录的地址。使用Base64时传完整的`data:image/png;base64,...`或对应图片类型的Data URL，不能只传裸Base64。多图按数组顺序说明各张图的用途，最多5张。'),
    curl({ model: 'mj-v8.2', prompt: '参考图片中的主体外形，生成夜晚街道场景，电影感构图', size: '16:9', image: 'https://example.com/reference.jpg', iw: 1, raw: true, n: 1 }),
    curl({ model: 'mj-v8.2', prompt: '参考第一张图中的主体、第二张图的配色和光线，生成一张商业海报', size: '4:5', images: ['https://example.com/subject.jpg', 'https://example.com/style.jpg'], iw: 1.5, n: 1 }),
    paragraph('Data URL同样放入image或images。下例中的Base64占位内容需替换为真实图片编码，MIME应与文件格式一致；不要把图片地址写进prompt来代替参考图字段。'),
    json({ model: 'mj-v8.2', prompt: '参考主体的形状与配色，生成明亮的商业插画', image: 'data:image/png;base64,<图片文件的Base64编码>', size: '1:1', n: 1 }),
    heading('角色、风格与深度参考'),
    table(['参考用途', '图片字段', '权重字段与范围'], [
      ['普通图片参考', 'image或images', 'iw：0–3'],
      ['角色参考', 'cref：角色参考图URL', 'cw：0–100'],
      ['风格参考', 'sref：风格参考图URL', 'sw：0–1000'],
      ['深度参考', 'dref：深度参考图URL', 'dw：0–100']
    ]),
    paragraph('cref、sref、dref是不同用途的参考图URL字段，不是images的别名；对应权重只用于相应参考用途。没有该用途时省略图片和权重字段，不把普通参考图的5张上限解释为这些字段各自都可再传5张。'),
    curl({ model: 'mj-v8.2', prompt: '以参考主体创作自然光下的静物海报，借鉴风格参考图的色调', image: 'https://example.com/subject.jpg', iw: 1, sref: 'https://example.com/style.jpg', sw: 100, size: '4:5', quality: 1, n: 1 }),
    heading('后续动作参数'),
    paragraph('普通文生图与参考生图不填写action。需要对已有任务进行操作时，再按动作使用父任务task_id、图片索引index或原任务提供的custom_id；不要把所有动作相关字段一起发送。'),
    table(['action', '用途'], MJ_ACTIONS.map((action, index) => [action, ['放大图片', '生成变体', '高变化变体', '低变化变体', '强混合重绘', '轻混合重绘', '重新生成', '扩图', '平移画面', '融图', '图片编辑', '描述图片'][index]])),
    note('action仅使用表中列出的值。index、custom_id、direction、zoom_ratio与dimensions未约定统一的全部取值范围；按原任务可用操作填写。文档中的left和SQUARE只是示例值，不表示完整枚举。后续动作不改变本站的任务查询方式。')
  ];
}

export const MIDJOURNEY_PAGES = [
  { id: 'mj-v8.2', label: 'mj-v8.2', title: 'mj-v8.2', lead: '29项请求参数、提示词长度、12种比例、URL与Data URL参考生图、质量与风格控制，以及异步任务示例。', blocks: [...commonBlocks(), ...resultBlocks()] }
];
