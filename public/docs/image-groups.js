import { IMAGE2_SIZE_ROWS, IMAGE2_RESPONSE_BLOCKS } from './image2-details.js?v=20261027-groups';

const heading = value => ({ type: 'heading', value });
const paragraph = value => ({ type: 'paragraph', value });
const note = value => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const code = (lang, value) => ({ type: 'code', lang, value });
const bases = ['gpt-image-2', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst'];
const adobeAliases = ['gpt-image-2-4k', ...bases.slice(1).flatMap(name => ['-4k', '-满血'].map(suffix => name + suffix))];

// 分组和完整模型名共同决定能力，不能把同名的1K线路与Adobe线路合并。
export const IMAGE_GROUPS = [
  { id: 'image-1k', label: '1k-image', title: '1k-image · GPT Image', kind: 'basic', models: bases },
  { id: 'image-az', label: 'az-image', title: 'az-image · GPT Image', kind: 'official', models: bases.map(name => 'AZ-' + name) },
  { id: 'image-adobe', label: 'adobe-image', title: 'adobe-image · GPT Image', kind: 'adobe', models: bases },
  { id: 'image-official', label: '官key-image', title: '官key-image · GPT Image', kind: 'official', models: bases.map(name => '官-' + name) },
  { id: 'image2', label: '默认分组', title: '默认分组 · GPT Image', kind: 'default', models: [...bases, ...adobeAliases] }
];

export const imageCapability = (group, name) => {
  const adobe = group.kind === 'adobe' || group.kind === 'default' && adobeAliases.includes(name);
  const full = adobe || group.kind === 'official';
  const image25 = name.includes('2.5');
  return {
    adobe, full,
    sizes: full ? '1K、2K、4K' : '仅1K',
    quality: adobe ? 'auto / low / medium / high / xhigh / max' : image25 ? 'auto / low / medium / high / xhigh / max' : 'auto / low / medium / high',
    // Adobe Image 2不支持背景透明度；2.5的能力单独判断，不按后缀猜测。
    background: full && (!adobe || image25),
    mask: full,
    responseFormat: group.kind !== 'official'
  };
};

const curlJson = (path, body) => code('bash', `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz${path}' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: respond-async' \\
  --data '${JSON.stringify(body, null, 2)}'`);

function sizeBlocks(group) {
  const basic = group.kind === 'basic';
  return [
    heading('比例、尺寸与像素限制'),
    paragraph(basic
      ? '本分组只使用1K列；不要因为模型名称与Adobe分组相同，就发送2K或4K尺寸。size填写具体的宽x高，使用英文小写x。'
      : group.kind === 'default'
        ? 'size填写具体像素宽x高，不填写1K、4K或16:9。不带后缀的三个基础型号只使用1K列；本页Adobe后缀型号可使用1K、2K、4K。'
        : 'size填写具体像素宽x高，不填写1K、4K或16:9。本页型号可使用下表的1K、2K、4K尺寸。'),
    table(basic ? ['比例', '1K：size'] : ['比例', '1K：size', '2K：size', '4K：size'], IMAGE2_SIZE_ROWS.map(row => basic ? row.slice(0, 2) : row)),
    table(['约束', '要求'], [
      ['宽高对齐', '宽和高均为16的倍数'],
      ['最长边', '不超过3840px'],
      ['长宽比', '最长边 / 最短边不超过3'],
      ['总像素', '655360至8294400像素；同时遵守型号的档位限制'],
      ...(basic ? [] : [['4K方图', '2880x2880，不是4096x4096']]),
      ['自定义尺寸', '同时满足对齐、最长边、长宽比和总像素要求；读取实际结果确认最终尺寸']
    ]),
    ...(group.kind === 'adobe' || group.kind === 'default' ? [note('Adobe高分辨率需要明确画幅，推荐直接传size，例如2048x2048或3840x2160。不要在2K、4K请求里使用auto来代替具体尺寸。')] : [])
  ];
}

function parameterBlocks(group) {
  const hasAdobe = ['adobe', 'default'].includes(group.kind);
  const hasFull = group.kind !== 'basic';
  return [
    heading('文生图参数'),
    table(['字段', '类型', '要求与说明'], [
      ['model', 'string，必填', '完整填写本页列出的模型名，保留AZ-、官-或规格后缀'],
      ['prompt', 'string，必填', hasAdobe ? '描述主体、构图、风格及画中文字；Adobe型号非空且不超过32768字节（不是32768个汉字）' : '描述主体、构图、风格及画中文字，不能为空'],
      ['size', 'string，建议显式填写', '具体像素宽x高，按本页型号能力和尺寸表选择'],
      ['quality', 'string，可选', '按型号表选择；quality改变细节偏好，不改变size的格式'],
      ['n', 'integer，建议1', hasAdobe ? 'Adobe支持1–4，省略为1；基础和其他线路建议每次1张。输出数量与参考图张数不同' : '建议每次1张，多张独立结果分别创建并保存任务编号'],
      ['background', 'string，可选', hasFull ? '仅型号表标明支持时使用auto、opaque或transparent；Adobe的gpt-image-2及gpt-image-2-4k不发送此字段' : '本分组不提供背景参数，省略'],
      ['response_format', 'string，可选', group.kind === 'official' ? '不发送，包括url和b64_json；此分组按官方请求协议提交，读取实际返回的data[].b64_json或任务media' : 'url或b64_json，控制返回结果，与输入参考图URL无关'],
      ['output_format', 'string，可选', hasAdobe ? 'Adobe兼容输入接受png、jpeg、webp；保存时以实际Content-Type为准，不能保证此参数使上游按指定格式编码' : 'png、jpeg、webp；透明背景选择png或webp'],
      ['output_compression', 'integer，可选', hasAdobe ? 'Adobe线路不提供独立压缩控制，省略；其他线路JPEG/WebP可选0–100，PNG省略' : 'JPEG/WebP压缩设置0–100；PNG省略'],
      ['moderation', 'string，可选', hasAdobe ? 'Adobe未提供独立审核级别控制，Adobe型号省略；基础1K型号仍可使用auto或low' : 'auto为默认审核，low为较宽松级别，不代表关闭内容审核']
    ]),
    ...(hasAdobe ? [
      heading('Adobe的画质与透明背景'),
      table(['模型', '画质映射', '透明背景'], [
        ['GPT Image 2（含默认分组gpt-image-2-4k）', 'low→1；medium/auto→3；high/max→5；xhigh兼容映射为max', '不支持background和transparent_background，请省略'],
        ['GPT Image 2.5 Flare / Sunburst的Adobe型号', 'low→1；medium/auto→3；high→5；max/xhigh→7', '支持auto、opaque、transparent']
      ]),
      paragraph('画质映射是Adobe线路的细节等级。不要把官key或AZ的扩展品质行为套到Adobe；也不要把透明PNG遮罩与生成透明背景混为一谈。Image 2可以使用编辑遮罩，但不提供生成透明背景参数。')
    ] : []),
    ...(group.kind === 'official' ? [note('AZ和官key分组不发送response_format，也不在失败后把它改成另一个值重新生成。output_format控制文件格式，不能代替response_format。')] : [])
  ];
}

function editBlocks(group, model) {
  const capability = imageCapability(group, model);
  const adobeOnly = group.kind === 'adobe';
  const request = { model, prompt: '保留第一张图的商品，参考第二张图的构图，背景改成浅色', size: capability.full ? '2560x1440' : '1280x720', n: 1 };
  const references = ['https://example.com/product.png', 'https://example.com/style.jpg'];
  return [
    heading('图生图与图片编辑'),
    paragraph('POST /v1/images/edits可使用本地文件或公开图片URL。单图JSON用image字符串；多图字段按下表的线路格式填写。不要把本机路径或网页预览地址当成图片URL。'),
    table(['输入方式', 'Content-Type', '字段和限制'], [
      ['本地文件', 'multipart/form-data', '单图image；多图重复image[]，PNG、JPEG或WebP，最多16张参考图'],
      ['单张URL', 'application/json', 'image为一张公开图片URL；与images二选一'],
      ['多张URL', 'application/json', adobeOnly ? 'Adobe使用images:[{"image_url":"https://..."}]，最多16项' : group.kind === 'default' ? '基础1K使用images字符串数组；Adobe后缀型号使用images对象数组，每项含image_url' : 'images为图片URL字符串数组，最多16项'],
      ['mask', 'multipart文件，可选', group.kind === 'default' ? '仅本页Adobe后缀型号支持；基础1K不开放' : capability.mask ? '支持局部编辑；透明区域为修改区域，与第一张参考图尺寸相同' : '本分组基础1K不开放遮罩，省略']
    ]),
    table(['编辑字段', '类型 / 要求', '填写方式'], [
      ['model', 'string，必填', '使用本页型号表中的完整名称，文生图和编辑的型号相同'],
      ['prompt', 'string，必填', '写清保留、替换或修改的内容，多图按顺序说明各图用途'],
      ['size', 'string，建议填写', '使用具体像素，遵守本页型号档位和尺寸限制'],
      ['quality', 'string，可选', 'Adobe、AZ和官key按型号表选择；基础1K的整图编辑请求省略'],
      ['n', 'integer，建议1', '输出数量，不是参考图张数；Adobe支持1–4'],
      ['background', 'string，可选', '仅型号表标明支持时传入；Adobe Image 2不发送'],
      ['moderation', 'string，可选', '基础1K、AZ和官key可选auto或low；Adobe不提供独立控制，省略'],
      ['response_format', 'string，可选', group.kind === 'official' ? '本分组省略，不发送url或b64_json' : 'url或b64_json；与参考图片的输入方式无关'],
      ['output_format', 'string，可选', 'png、jpeg、webp；实际结果按Content-Type保存'],
      ['mask', '文件，可选', '仅支持局部编辑的型号使用；透明区域表示修改范围']
    ]),
    heading('单张URL参考图'),
    curlJson('/v1/images/edits', { ...request, image: references[0] }),
    heading('多张URL参考图'),
    curlJson('/v1/images/edits', { ...request, images: adobeOnly ? references.map(image_url => ({ image_url })) : references }),
    ...(group.kind === 'default' ? [
      paragraph('默认分组的满血、4k后缀型号使用Adobe多图格式：'),
      curlJson('/v1/images/edits', { ...request, model: 'gpt-image-2.5-flare-满血', size: '2560x1440', images: references.map(image_url => ({ image_url })) })
    ] : []),
    heading('本地图片上传'),
    code('bash', `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Prefer: respond-async' \\
  -F 'model=${model}' \\
  -F 'prompt=保留第一张图的商品，参考第二张图的构图' \\
  -F 'image[]=@product.png' \\
  -F 'image[]=@style.jpg' \\
  -F 'size=${request.size}' \\
  -F 'n=1'`),
    note('multipart上传由HTTP客户端自动生成boundary，不手动填写Content-Type。URL必须直接返回图片文件且在排队、生成期间保持有效；不要使用image=@https://...。'),
    ...(group.kind !== 'basic' ? [
      heading('遮罩局部编辑'),
      paragraph(group.kind === 'official'
        ? 'mask与生成透明背景是不同功能。主图、遮罩各不超过50MiB；遮罩带透明通道，宽高与第一张源图相同，透明区域为修改区域。'
        : 'mask与生成透明背景是不同功能。Adobe参考图与遮罩合计受64MiB请求限制；遮罩必须是带透明通道的PNG或WebP，宽高与第一张源图相同。' + (group.kind === 'default' ? '本页基础1K型号不使用mask。' : '')),
      code('bash', `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Prefer: respond-async' \\
  -F 'model=${group.kind === 'default' ? 'gpt-image-2.5-flare-满血' : model}' \\
  -F 'prompt=只替换遮罩透明区域中的背景，保留人物与衣服' \\
  -F 'image=@original.png' \\
  -F 'mask=@mask.png' \\
  -F 'size=1024x1024' \\
  -F 'quality=high' \\
  -F 'n=1'`)
    ] : []),
    ...(group.kind === 'adobe' || group.kind === 'default' ? [note('Adobe参考图和遮罩仅使用PNG、JPEG或WebP，总请求体不超过64MiB；Base64会增大请求体积。上传本地文件时优先multipart，避免多张图片编码后超限。')] : [])
  ];
}

export function createImageGroupPage(group, legacyPage) {
  const model = group.models.find(name => name.includes('flare') && !name.endsWith('-满血')) || group.models[0];
  const capability = imageCapability(group, model);
  const asyncStart = legacyPage.blocks.findIndex(block => block.type === 'heading' && block.value === '异步：提交、查询与下载');
  const faqStart = legacyPage.blocks.findIndex(block => block.type === 'heading' && block.value === '常见问题');
  // 复用已验证的持久任务闭环，只替换示例的完整模型名，保留查询与下载协议。
  const asyncBlocks = legacyPage.blocks.slice(asyncStart, faqStart).map(block => {
    if (block.type !== 'code') return block;
    if (block.lang === 'javascript') return { ...block, value: block.value.replace("model: 'gpt-image-2.5-flare'", "model: '" + model + "'") };
    // 提交响应中的模型名也跟随分组，避免前缀型号的返回示例仍显示默认型号。
    if (block.lang === 'json') {
      const response = JSON.parse(block.value);
      if (response.model) return { ...block, value: JSON.stringify({ ...response, model }, null, 2) };
    }
    return block;
  });
  return {
    id: group.id, label: group.label, title: group.title,
    lead: group.kind === 'default' ? '默认分组的基础1K与Adobe兼容型号，分别列出模型、画质、比例尺寸、参考图、局部编辑和任务处理。' : '本分组的模型名称、参数能力、比例尺寸、URL或本地参考图、图片编辑与任务处理。',
    blocks: [
      heading('接入方式与鉴权'),
      table(['项目', '填写方式'], [
        ['Base URL', 'https://api.zzlye.xyz/v1'], ['文生图', 'POST /v1/images/generations'], ['图生图 / 编辑', 'POST /v1/images/edits'],
        ['鉴权', 'Authorization: Bearer YOUR_API_KEY'], ['分组', group.label === '默认分组' ? 'default（默认分组）' : group.label]
      ]),
      code('bash', 'export WENYUN_API_KEY="YOUR_API_KEY"'),
      code('powershell', '$env:WENYUN_API_KEY = "YOUR_API_KEY"'),
      paragraph('使用获准访问本分组的Key。同名模型可以出现在不同分组中，仅修改model不会切换Key的分组选路。普通Key使用自身分组；生图和视频Key按获授权的分组顺序匹配，需要固定某条线路时使用对应分组的普通Key。'),
      heading('选择模型'),
      table(['模型名称', '尺寸档位', 'quality', 'background', 'mask局部编辑', '线路'], group.models.map(name => {
        const cap = imageCapability(group, name);
        return [name, cap.sizes, cap.quality, cap.background ? 'auto / opaque / transparent' : '不提供，省略', cap.mask ? '支持' : '不开放', cap.adobe ? 'Adobe' : group.kind === 'official' ? group.label : '基础1K'];
      })),
      ...(group.kind === 'default' ? [note('不带后缀的gpt-image-2、gpt-image-2.5-flare、gpt-image-2.5-sunburst保持基础1K能力。-满血、-4k后缀按Adobe线路使用。')] : []),
      ...parameterBlocks(group), ...sizeBlocks(group),
      heading('文生图完整请求'),
      curlJson('/v1/images/generations', { model, prompt: '清晨花店门口，柔和日光，精致商业摄影', size: capability.full ? '2560x1440' : '1280x720', quality: 'high', n: 1 }),
      ...editBlocks(group, model),
      ...(group.kind !== 'basic' ? [
        heading('透明背景'),
        paragraph(group.kind === 'official' ? '使用background:transparent并选择PNG或WebP。opaque表示不透明，auto由模型决定。' : 'Adobe仅GPT Image 2.5 Flare和Sunburst提供背景透明度参数；GPT Image 2及gpt-image-2-4k不支持，必须省略background和transparent_background。基础1K型号也不发送background。'),
        curlJson('/v1/images/generations', { model: group.kind === 'default' ? 'gpt-image-2.5-flare-满血' : model, prompt: '一个独立的橘子图标，透明背景，无投影', size: '1024x1024', quality: 'high', background: 'transparent', output_format: 'png', n: 1 })
      ] : []),
      ...IMAGE2_RESPONSE_BLOCKS,
      ...asyncBlocks,
      heading('常见问题'),
      table(['情况', '处理方式'], [
        ['模型不存在或无可用渠道', '核对Key所属分组、授权范围及完整模型名；AZ使用flare，不是flara'],
        ['response_format被拒绝', 'AZ与官key请求省略此字段，不改成b64_json后自动重新提交'],
        ['透明背景参数被拒绝', 'Adobe的GPT Image 2不提供此功能；仅在本页型号表标明支持时发送'],
        ['上传成功但参考图未生效', '核对image、images的线路格式及数组顺序，在prompt里说明每张参考图用途'],
        ['连接超时或客户端关闭', '先查任务日志或已保存的任务编号，不自动重新创建收费任务'],
        ['查询成功但生成失败', 'HTTP 200只代表查询成功，仍需检查status、error和result_expired'],
        ['价格不同', '同名模型在不同分组中可能使用不同计费规则和倍率，以当前Key报价和实际账单为准']
      ])
    ]
  };
}

// 全部模型页复用这段说明，明确内部执行方式与客户端响应方式的边界。
export const INTERNAL_TASK_BLOCKS = [
  heading('服务器内部异步与任务恢复'),
  paragraph('图片和视频请求进入服务器后台持久任务，已受理后可在账号的任务日志中查看状态、请求参数和结果。服务器内部异步与客户端选择的响应模式是两件事。'),
  table(['客户端方式', '返回和后续处理'], [
    ['原协议方式：不加异步选项', '服务器后台执行并等待，再返回原协议响应。Images返回图片结果，Gemini返回原生内容；Videos或Midjourney仍可返回其自身的任务编号'],
    ['显式网关任务：Prefer: respond-async或?async=true', '返回HTTP 202及task_id、poll_url，按poll_url查询；成功succeeded，失败failed或cancelled'],
    ['响应头X-New-Api-Task-Id', '服务器内部任务编号；与视频原生id可能不同，恢复网关任务用/v1/tasks/{task_id}'],
    ['任务日志', '登录创建任务所属账号，在任务日志查询；网络断开后先核对已有任务，不重复提交生成']
  ]),
  note('网关任务的succeeded与视频原生任务的completed不要混用。查询使用创建账号的有效Key；MJ使用提交时的同一个Key。遵循Retry-After，保存task_id和poll_url；超时不表示服务端任务已经取消。')
];
