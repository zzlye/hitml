// 两款模型分别列出参数，避免把Niji的动作与风格控制套用到高速版。
export const MJ_SIZES = ['auto', '1:1', '3:2', '2:3', '4:3', '3:4', '5:4', '4:5', '16:9', '9:16', '21:9', '9:21'];
export const MJ_ACTIONS = ['upscale', 'variation', 'high_variation', 'low_variation', 'reroll', 'zoom', 'pan', 'blend', 'edits', 'describe'];

const heading = (value) => ({ type: 'heading', value });
const paragraph = (value) => ({ type: 'paragraph', value });
const note = (value) => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const code = (lang, value) => ({ type: 'code', lang, value });
const json = (value) => code('json', JSON.stringify(value, null, 2));

export const mjCommonRows = (model) => [
  ['model', 'string', '是', model, '完整填写公开模型名称`' + model + '`。'],
  ['prompt', 'string', '是', '至少1个字符', '描述主体、场景、构图、画风、光线及参考图需要保留或修改的部分。'],
  ['size', 'string', '否', '默认9:16；见下表', '填写画面比例，例如`16:9`，不是`1024x1024`这样的像素尺寸。'],
  ['image', 'string', '否', '公网图片URL或data:image/...', '单张参考图；有多张时使用`images`。'],
  ['images', 'string[]', '否', '1–5张', '每项为图片URL或data:image/...；数组顺序保留。单张和多张写法选一种即可。'],
  ['raw', 'boolean', '否', '默认false', '`true`启用Raw原始风格；传JSON布尔值，不要传字符串"true"。'],
  ['n', 'integer', '否', '固定1', '表示一次提交，普通生成一次返回4张单图；不要为了四张图设置`n:4`。']
];

export const MJ_NIJI_STYLE_ROWS = [
  ['negative_prompt', 'string', '否', '按需填写', '写需要排除的内容，例如文字、水印；与正向提示词区分。'],
  ['seed', 'integer', '否', '可选随机种子', '记录种子用于复现构图；同一组输入也不保证图片完全一致。'],
  ['stylize', 'number', '否', '0–1000；默认100', '调整模型的风格化程度；先使用默认值，再逐步调整。'],
  ['chaos', 'number', '否', '0–100；默认0', '调整同一次生成中构图的差异程度。'],
  ['weird', 'number', '否', '0–3000；默认0', '调整非常规、实验性的视觉表现。'],
  ['tile', 'boolean', '否', '按需开启', '要求适合重复平铺的图案，例如纹样、壁纸。'],
  ['iw', 'number', '否', '0–3', '控制普通参考图相对提示词的影响程度；配合`image`或`images`使用。'],
  ['cref', 'string', '否', '角色参考图URL', '提供角色外观参考，配合`cw`调整影响程度。'],
  ['sref', 'string', '否', '风格参考图URL', '提供色调、笔触和视觉风格参考，配合`sw`使用。'],
  ['dref', 'string', '否', '深度参考图URL', '提供深度参考，配合`dw`使用。'],
  ['cw', 'number', '否', '0–100', '角色参考权重，配合`cref`使用。'],
  ['sw', 'number', '否', '0–1000', '风格参考权重，配合`sref`使用。'],
  ['dw', 'number', '否', '0–100', '深度参考权重，配合`dref`使用。'],
  ['quality', 'number', '否', '0.25、0.5、1、2；默认1', '数值型生成质量档位；不要填写GPT Image的`low`、`medium`或`high`。']
];

export const MJ_NIJI_ACTION_ROWS = [
  ['action', 'string', '动作请求必填', MJ_ACTIONS.join('、'), '普通文生图不传；后续操作或图片独立操作传对应动作名。'],
  ['task_id', 'string', '依动作而定', '已完成的父任务编号', '放大、变体、重生成、扩图和平移需要父任务；不是本次新任务的编号。'],
  ['index', 'integer', '依动作而定', '1–4', '选择四张单图中的一张，按返回顺序从1开始编号。'],
  ['custom_id', 'string', '可选', '服务返回的按钮ID', '保留返回的完整按钮ID，不根据按钮文字自行拼接。'],
  ['direction', 'string', 'pan必填', '例如left', '平移扩图方向；其他方向按任务返回的可用动作填写。'],
  ['zoom_ratio', 'number', 'zoom按需填写', '扩图倍数', '用于已放大的单图扩图；不要把它当成像素分辨率或图片张数。'],
  ['dimensions', 'string', 'blend按需填写', '例如SQUARE', '融合图片的画幅选项；普通生成的比例仍使用`size`。']
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

// 原始示例作为网页与独立文件的共同正文，由契约测试检查逐字一致。
export const MJ_CLIENT = String.raw`import { readFile, writeFile, rename, rm } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';

const ORIGIN = 'https://api.zzlye.xyz';
const key = process.env.WENYUN_API_KEY;
if (!key) throw new Error('请设置WENYUN_API_KEY');
const headers = { Authorization: 'Bearer ' + key };
const model = process.env.WENYUN_MJ_MODEL || '__MODEL__';
if (!['mj-niji7', 'mj-v8.2'].includes(model)) throw new Error('请填写公开MJ模型名称');

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
  if (!['mj-niji7', 'mj-v8.2'].includes(request.model)) throw new Error('请求文件中的模型名称错误');
  if (request.n != null && request.n !== 1) throw new Error('MJ的n固定为1');
  const response = await fetch(ORIGIN + '/v1/midjourney/generations', {
    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(120000)
  });
  const submitted = await readJson(response);
  const id = submitted.data?.task_id || response.headers.get('X-NewAPI-Task-Id');
  if (!id) throw new Error('未返回task_id，请保留响应并核对任务记录，不要自动重新生成');
  saved = { task_id: id, model: request.model, action: request.action || 'generate' };
  await writeFile('task.json', JSON.stringify(saved, null, 2), { flag: 'wx' });
  console.log('任务已保存：' + id);
  interval = intervalFor(response);
}
if (typeof saved.task_id !== 'string' || !saved.task_id) throw new Error('任务文件缺少task_id');
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
  if (saved.action !== 'describe') throw new Error('任务没有图片，请检查result.json');
  console.log('反推提示词结果已保存到result.json');
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
`;

function resultBlocks(model) {
  const niji = model === 'mj-niji7';
  return [
    heading('异步任务：提交、查询、保存'),
    paragraph('生成接口先受理任务，首响应不等于图片已经生成。保存`data.task_id`，或读取响应头`X-NewAPI-Task-Id`；随后使用同一个Key查询`GET /v1/tasks/{task_id}`。任务编号不要与其他接口的编号混用。'),
    json({ data: { task_id: 'task_mj_example', status: 'submitted', progress: '0%' } }),
    code('bash', `curl --fail-with-body 'https://api.zzlye.xyz/v1/tasks/task_mj_example' \\
  -H "Authorization: Bearer $WENYUN_API_KEY"`),
    table(['返回字段', '含义与处理'], [
      ['data.task_id', '本次任务编号；保存下来用于恢复查询。'],
      ['data.status', '`submitted`表示受理，`completed`表示完成；其他非终态继续查询，失败时读取错误字段。'],
      ['data.progress', '进度字符串，例如`0%`、`100%`；不要按整数解析。'],
      ['data.result.data.image_urls', niji ? '普通生成返回4张单图URL；upscale返回1张。' : '普通生成返回4张单图URL。'],
      ['data.result.data.grid_image_url', '可选的四宫格封面；没有这个字段也可以正常获得4张单图。'],
      ['data.error_code / data.error_message', '失败原因；停止等待，不要把失败当作空图片成功。']
    ]),
    paragraph('查询可间隔2–5秒；如果响应有`Retry-After`，优先遵循它。查询遇到429、5xx或网络中断时退避重试查询，不自动重新提交生成。首个提交超时但无法确认是否已受理时，先核对任务记录，避免重复生成。'),
    json({ data: { task_id: 'task_mj_example', status: 'completed', progress: '100%', result: { data: {
      image_urls: [1, 2, 3, 4].map(index => 'https://example.com/image-' + index + '.png'),
      grid_image_url: 'https://example.com/grid-cover.png'
    } } } }),
    paragraph('按数组顺序保存4张单图，四宫格封面可选。结果URL可能有有效期，完成后及时下载；下载外部图片地址不需要携带本站Key。' + (niji ? 'describe动作返回提示词文本，不应按图片下载。' : '')),
    heading('完整示例：生成、断点恢复与图片下载'),
    paragraph('将下面代码保存为`' + model + '.mjs`，使用Node.js 22或更新版本运行。设置`WENYUN_API_KEY`，执行`node ' + model + '.mjs`；中断后执行`node ' + model + '.mjs task.json`恢复查询。结果保存为`result.json`、`image-1.png`等，封面单独保存为`grid-cover.png`；后缀会按实际图片类型调整。'),
    code('bash', `export WENYUN_API_KEY='YOUR_API_KEY'
export WENYUN_MJ_MODEL='${model}'
node ${model}.mjs

# 中断后仅恢复查询，不重复提交。
node ${model}.mjs task.json`),
    paragraph('可设置`WENYUN_MJ_MODEL`切换两款模型。自定义请求可保存为JSON文件，再设置`WENYUN_MJ_REQUEST`为该文件路径。' + (niji ? '后续动作的JSON请求也使用此方式。' : '') + '恢复已有任务不会重新读取请求文件，也不会再次生成。'),
    code('javascript', MJ_CLIENT.replace('__MODEL__', model)),
    heading('常见错误与处理'),
    table(['情况', '处理方式'], [
      ['鉴权失败', '确认使用文运工坊Key，并对提交和查询使用同一个Key。'],
      ['模型不存在', 'Niji填写`mj-niji7`，高速版填写`mj-v8.2`，不要使用展示标题代替模型名称。'],
      ['比例不合法', '填写本页比例枚举；`size`不是GPT Image的像素尺寸字段。'],
      ['参考图加载失败', '确认URL无需登录即可读取图片，或提供完整data:image/...内容；检查张数和顺序。'],
      ['只有task_id、没有图片', '受理响应是异步任务凭据，继续查询，直到`data.status`为`completed`。'],
      ['n设置为4', '改为1；普通生成的一次任务已经包含4张单图。'],
      ['查询超时或网络断开', '保留task.json恢复查询，不要自动重新发起生成。'],
      ...(niji ? [['动作没有可操作结果', '父任务必须已完成；zoom与pan使用已放大的单图任务。']] : [])
    ]),
    note('价格以模型列表与实际账单为准；不要依据返回图片数组长度推算其他模型的价格。')
  ];
}

function commonBlocks(model, niji) {
  return [
    heading('模型与接口'),
    table(['项目', '填写方式'], [
      ['模型名称', model], ['Base URL', 'https://api.zzlye.xyz/v1'],
      ['创建任务', 'POST /v1/midjourney/generations'], ['查询任务', 'GET /v1/tasks/{task_id}'],
      ['鉴权', 'Authorization: Bearer YOUR_API_KEY'], ['请求格式', 'Content-Type: application/json'],
      ['普通生成输出', '一次任务4张单图；可选四宫格封面'], ['参考图片', '单张image或1–5张images']
    ]),
    paragraph(niji ? 'Niji 7面向动漫和插画风格，支持文生图、参考图生成、风格与角色控制，以及任务完成后的放大和变体等动作。' : '高速版支持文生图和参考图生成，结构化参数为本页列出的7项。Niji专属的风格控制和action字段不属于高速版参数。'),
    heading('请求参数'),
    table(['参数', '类型', '必填', '取值或默认值', '用途'], mjCommonRows(model)),
    heading('画面比例与Raw'),
    table(['size', '适用画幅'], sizeRows),
    note('`size`填写比例，不提供固定输出像素保证；`n`固定1，普通生成返回4张单图。默认比例为9:16，推荐在请求中明确指定所需比例。'),
    paragraph('Raw通过`raw: true`开启。' + (niji ? '比例使用size填写，Raw使用布尔值填写。' : '高速版会将size、raw补充到提示词中；提示词已有`--ar`、`--raw`等参数时保留已有参数并避免重复追加。为避免冲突，结构化字段与提示词中的比例应保持一致。')),
    heading('文生图'),
    curl({ model, prompt: niji ? '橘子汽水店门口的少女，清新日系插画，暖色自然光' : '一杯橘子汽水，玻璃杯上的水珠，清晨自然光，精致商业摄影', size: '1:1', raw: false, n: 1 }),
    heading('单张与多张参考图'),
    paragraph('图片URL必须能从公网直接读取。使用Base64时传完整的`data:image/png;base64,...`或对应图片类型的Data URL，不能只传裸Base64。多图按数组顺序说明各张图的用途，最多5张。'),
    curl({ model, prompt: '保留参考图主体外形，改为夜晚街道的电影感构图', size: '16:9', image: 'https://example.com/reference.jpg', raw: true, n: 1 }),
    curl({ model, prompt: '保留第一张图中的主体，参考第二张图的配色和光线', size: '4:5', images: ['https://example.com/subject.jpg', 'https://example.com/style.jpg'], n: 1 })
  ];
}

const nijiActions = [
  heading('Niji专属风格与参考控制'),
  table(['参数', '类型', '必填', '取值或默认值', '用途'], MJ_NIJI_STYLE_ROWS),
  paragraph('未标出数值范围的字段按类型填写，不套用其他模型的枚举或默认值。普通参考图权重`iw`、角色权重`cw`、风格权重`sw`和深度权重`dw`作用不同，应与相应参考图字段配对。'),
  curl({ model: 'mj-niji7', prompt: '柔和水彩风格的城市街角，细腻线条', size: '3:4', stylize: 200, chaos: 10, weird: 0, quality: 1, sref: 'https://example.com/style.jpg', sw: 100, n: 1 }),
  heading('Niji后续动作与输入要求'),
  table(['参数', '类型', '必填', '取值或默认值', '用途'], MJ_NIJI_ACTION_ROWS),
  table(['action', '是否需要父task_id', '其他输入', '结果或用途'], [
    ['upscale', '是：已完成四图任务', 'index为1–4，或返回的custom_id', '放大选中的图片，返回1张单图。'],
    ['variation', '是', '选中图片的index或custom_id', '生成所选图片的变体。'],
    ['high_variation', '是', 'index或custom_id', '更明显的变体。'],
    ['low_variation', '是', 'index或custom_id', '变化较小的变体。'],
    ['reroll', '是', '完成的生成任务', '重新生成四宫格。'],
    ['zoom', '是：已放大的单图任务', 'zoom_ratio或对应custom_id', '扩展单图画面。'],
    ['pan', '是：已放大的单图任务', 'direction，例如left', '按指定方向平移扩图。'],
    ['blend', '否', 'images包含2–4张；dimensions按需填写', '融合参考图。'],
    ['edits', '否', 'image或images以及prompt', '根据提示词改写参考图。'],
    ['describe', '否', '参考图', '反推提示词，返回文本，不返回图片。']
  ]),
  paragraph('后续动作仍提交到同一个创建接口，并产生新的task_id，需要再次查询。父task_id必须来自已完成任务；index按四张单图的返回顺序从1开始，不能使用0。custom_id只使用服务返回的完整按钮ID。'),
  heading('放大指定图片'),
  curl({ model: 'mj-niji7', prompt: '放大第二张图片', action: 'upscale', task_id: 'task_mj_parent', index: 2, n: 1 }),
  heading('变体与重新生成'),
  curl({ model: 'mj-niji7', prompt: '保留主体，生成第一张图片的变体', action: 'variation', task_id: 'task_mj_parent', index: 1, n: 1 }),
  paragraph('需要强变体或弱变体时，将上例action改为`high_variation`或`low_variation`。重新生成使用`reroll`，带完成的父task_id，不需要选择四图index。'),
  curl({ model: 'mj-niji7', prompt: '重新生成这组图片', action: 'reroll', task_id: 'task_mj_parent', n: 1 }),
  heading('已放大单图的扩图与平移'),
  paragraph('先完成upscale并保存该单图任务的新task_id，再将它作为下方父task_id。扩图示例使用服务返回的扩图按钮custom_id；填写前替换占位符，不要自行构造按钮ID。'),
  curl({ model: 'mj-niji7', prompt: '扩展图片四周的场景', action: 'zoom', task_id: 'task_mj_upscaled', custom_id: '<返回的扩图按钮ID>', n: 1 }),
  curl({ model: 'mj-niji7', prompt: '向左侧扩展场景', action: 'pan', task_id: 'task_mj_upscaled', direction: 'left', n: 1 }),
  heading('独立图片操作'),
  curl({ model: 'mj-niji7', prompt: '融合两张参考图的主体和配色', action: 'blend', images: ['https://example.com/a.jpg', 'https://example.com/b.jpg'], dimensions: 'SQUARE', n: 1 }),
  curl({ model: 'mj-niji7', prompt: '保留商品外形，把背景改为浅蓝色', action: 'edits', image: 'https://example.com/product.jpg', n: 1 }),
  curl({ model: 'mj-niji7', prompt: '描述这张参考图的内容、构图和风格', action: 'describe', image: 'https://example.com/reference.jpg', n: 1 })
];

export const MIDJOURNEY_PAGES = [
  { id: 'mj-niji7', label: 'Niji 7', title: 'Midjourney Niji 7', lead: '动漫插画模型：比例、28项参数、参考图、放大与变体、异步任务和图片下载。', blocks: [...commonBlocks('mj-niji7', true), ...nijiActions, ...resultBlocks('mj-niji7')] },
  { id: 'mj-v8.2', label: 'MJ v8.2', title: 'Midjourney v8.2 高速', lead: '高速四图生成：7项参数、12种比例、Raw、参考图与可恢复的异步任务示例。', blocks: [...commonBlocks('mj-v8.2', false), ...resultBlocks('mj-v8.2')] }
];
