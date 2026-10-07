import { IMAGE2_SIZE_ROWS } from './image2-details.js?v=20261008-customer-docs';

// 各模型独立列出可用参数，不向客户展示内部参考工具或渠道地址。
const heading = (value) => ({ type: 'heading', value });
const paragraph = (value) => ({ type: 'paragraph', value });
const note = (value) => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const json = (value) => ({ type: 'code', lang: 'json', value: JSON.stringify(value, null, 2) });

export const BANANA_MODELS = [
  ['nano-banana-2', '512、1K、2K、4K', '14种', '支持512档位'],
  ['nano-banana-2.1', '1K、2K、4K', '14种', '不支持512档位'],
  ['nano-banana-pro', '1K、2K、4K', '10种', '不支持1:4、4:1、1:8、8:1']
];
export const BANANA_MODEL_BLOCKS = [
  table(['模型名称', 'imageSize可用值', '比例数量', '型号差异', '参考图上限'], BANANA_MODELS.map(row => [...row, '最多14张'])),
  table(['模型', '文生图 / 图生图接口'], BANANA_MODELS.map(([model]) => [model, `POST /v1beta/models/${model}:generateContent`])),
  note('香蕉三款型号统一使用Gemini原生接口，model写在URL里，不在JSON顶层添加model。文生图和图生图只相差parts中是否有参考图，不需要转换成Images或Chat格式。')
];

// 香蕉像素映射不经过GPT Image的像素预算或3:1比例规整。
export const BANANA_SIZE_ROWS = [
  ['1:1', '512x512', '1024x1024', '2048x2048', '4096x4096'],
  ['3:2', '632x424', '1264x848', '2528x1696', '5056x3392'],
  ['2:3', '424x632', '848x1264', '1696x2528', '3392x5056'],
  ['16:9', '688x384', '1376x768', '2752x1536', '5504x3072'],
  ['9:16', '384x688', '768x1376', '1536x2752', '3072x5504'],
  ['4:3', '600x448', '1200x896', '2400x1792', '4800x3584'],
  ['3:4', '448x600', '896x1200', '1792x2400', '3584x4800'],
  ['4:5', '464x576', '928x1152', '1856x2304', '3712x4608'],
  ['5:4', '576x464', '1152x928', '2304x1856', '4608x3712'],
  ['21:9', '792x168', '1584x672', '3168x1344', '6336x2688'],
  ['1:4', '256x1024', '512x2048', '1024x4096', '2048x8192'],
  ['4:1', '1024x256', '2048x512', '4096x1024', '8192x2048'],
  ['1:8', '192x1536', '384x3072', '768x6144', '1536x12288'],
  ['8:1', '1536x192', '3072x384', '6144x768', '12288x1536']
];
export const BANANA_PARAMETER_BLOCKS = [
  table(['字段', '类型', '要求 / 默认建议', '说明'], [
    ['contents', 'array', '必填', '单次生成传一条user消息，不用Images的prompt字段替代'],
    ['contents[].role', 'string', '建议user', '当前用户的生成要求'],
    ['contents[].parts', 'array', '必填', '至少一个text提示词，可追加多个inlineData参考图'],
    ['contents[].parts[].text', 'string', '必填', '多图时按排列顺序说明参考图用途'],
    ['contents[].parts[].inlineData.mimeType', 'string', '图生图必填', 'image/png、image/jpeg、image/webp，与文件内容一致'],
    ['contents[].parts[].inlineData.data', 'string', '图生图必填', '纯Base64，不带data:image/png;base64,前缀，不使用本机路径'],
    ['generationConfig.responseModalities', 'string[]', '建议["IMAGE"]', '如需同时读取文字可用["TEXT","IMAGE"]'],
    ['generationConfig.imageConfig.aspectRatio', 'string', '建议1:1', '枚举值见下表，不使用1376x768等像素字符串'],
    ['generationConfig.imageConfig.imageSize', 'string', '建议1K', '1K、2K、4K区分大小写；仅nano-banana-2支持字符串"512"，不是512px或数字512']
  ]),
  paragraph('quality、background、output_format、n、size不是这份原生请求的控制字段。需要多张独立结果时创建多个请求并分别保存任务编号，不靠添加n保证批量出图。'),
  heading('香蕉比例与输出尺寸'),
  paragraph('请求只发送aspectRatio与imageSize，下表宽高用于说明输出尺寸，不作为size字段发送。前10种比例三款型号均支持；后4种超宽/超长比例仅用于nano-banana-2和nano-banana-2.1。512列仅用于nano-banana-2。'),
  table(['aspectRatio', '512：仅Banana 2', '1K', '2K', '4K'], BANANA_SIZE_ROWS),
  note('Pro的1K、2K、4K分别对应1024、2048、4096像素方图；2.1不支持512档位。21:9的512尺寸单独列出，不从1K等比推算；保存时读取实际图片宽高。'),
  heading('Nano Banana 2.1完整请求'),
  paragraph('下面是新增型号的16:9、2K创建请求。添加Prefer请求头后返回网关异步任务，随后按poll_url查询。'),
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1beta/models/nano-banana-2.1:generateContent' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: respond-async' \\
  --data '{"contents":[{"role":"user","parts":[{"text":"花店门口的清晨插画，柔和日光，横版构图"}]}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9","imageSize":"2K"}}}'` },
  heading('512档位：仅Nano Banana 2'),
  paragraph('以下JSON只用于nano-banana-2:generateContent，不发送给2.1或Pro。'),
  json({ contents: [{ role: 'user', parts: [{ text: '一个橘子图标，白色背景' }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1', imageSize: '512' } } })
];
export const BANANA_REFERENCE_BLOCKS = [
  paragraph('文字与参考图放在同一个contents[0].parts数组里，第一项写要求，后续inlineData逐张提供图片。客户端读取文件并Base64编码即可，不需要额外图片转换服务。'),
  json({ contents: [{ role: 'user', parts: [
    { text: '保留第一张图的人物，使用第二张图的服装，背景改成纯白' },
    { inlineData: { mimeType: 'image/png', data: '<FIRST_IMAGE_BASE64>' } },
    { inlineData: { mimeType: 'image/jpeg', data: '<SECOND_IMAGE_BASE64>' } }
  ] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '3:4', imageSize: '2K' } } }),
  table(['检查项', '要求'], [
    ['格式', 'PNG、JPEG或WebP，mimeType与实际内容一致'],
    ['Base64', '不含Data URL前缀，不把URL或文件名放入data'],
    ['多图顺序', '提示词中的第一张、第二张对应inlineData排列顺序'],
    ['数量', '三款型号总输入最多14张参考图，不将参考图数量等同于输出数量'],
    ['体积', 'Base64约比原文件大三分之一，大图先在客户端压缩；413后不要原样重复提交']
  ]),
  heading('参考图组合与主体一致性'),
  table(['型号', '物体参考', '人物一致性参考', '独立风格参考', '总上限'], [
    ['nano-banana-2', '最多10张', '最多4张', '使用提示词描述风格', '14张'],
    ['nano-banana-2.1', '最多10张', '最多4张', '使用提示词描述风格', '14张'],
    ['nano-banana-pro', '最多6张', '最多5张', '最多3张', '14张']
  ]),
  note('上表描述参考主体的高保真组合能力，不表示一定逐像素保留原图。将人物、商品与风格用途写进text，所有inlineData合计不超过14项；不要通过重复同一图片填满数量。')
];

export const SEEDREAM_MODEL_BLOCKS = [
  table(['模型名称', '接口', '尺寸档位', '参考图上限'], [['seedream-5-pro', 'Images文生图与图片编辑', '1K、2K', '最多10张']]),
  paragraph('文生图使用JSON，图片编辑使用multipart/form-data；不需要封装香蕉的contents，也不需要在服务器增加图片格式转换服务。')
];
export const SEEDREAM_PARAMETER_BLOCKS = [
  table(['字段', '类型', '要求 / 默认建议', '说明'], [
    ['model', 'string', '必填', 'seedream-5-pro'],
    ['prompt', 'string', '必填', '生成内容；编辑时按顺序说明参考图用途与保留细节'],
    ['size', 'string', '建议1024x1024', '使用下表具体宽高，不发送1K、2K或16:9'],
    ['image / image[]', '文件', '图生图必填', '单图用image，多图重复image[]；最多10张PNG/JPEG/WebP参考图'],
    ['n', 'integer', '建议1', '输出数量，多次生成分别保存任务编号，不等同于参考图数量'],
    ['response_format', 'string', '建议b64_json', '读取data[].b64_json或data[].url，以实际响应为准'],
    ['quality', 'string', '基础示例省略', '不用GPT Image的xhigh/max，也不靠quality选择分辨率'],
    ['background / mask', '扩展字段', '基础示例不传', '当前公开接入不承诺透明背景或局部遮罩能力；替换背景写入prompt']
  ]),
  heading('Seedream比例与具体尺寸'),
  paragraph('支持1K和2K，下表列出8种常用比例的size。不要使用4K尺寸，或直接复制香蕉的5504x3072等尺寸。'),
  table(['比例', '1K：size', '2K：size'], IMAGE2_SIZE_ROWS.map(([ratio, small, medium]) => [ratio, small, medium])),
  note('最多10张参考图，size使用英文x分隔。21:9会作像素对齐，输出以返回图片实际宽高为准。')
];
