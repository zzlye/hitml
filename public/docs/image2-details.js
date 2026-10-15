// 参数按型号区分，页面和Markdown导出共用正文。
export const IMAGE2_MODEL_BLOCKS = [
  { type: 'paragraph', value: '下列型号均使用Images接口。model必须保留完整名称及后缀，文生图与图片编辑使用相同的型号，尺寸和质量按对应行选择。' },
  {
    type: 'table', headers: ['模型名称', '尺寸档位', '文生图quality', 'background', 'mask局部编辑'],
    rows: [
      ['gpt-image-2', '1K', 'auto / low / medium / high', '不传', '不开放'],
      ['gpt-image-2-4k', '1K、2K、4K', 'auto / low / medium / high', '不传', '不开放'],
      ['gpt-image-2.5-flare', '1K', 'auto / low / medium / high / xhigh / max', '不传', '不开放'],
      ['gpt-image-2.5-flare-4k', '1K、2K、4K', 'auto / low / medium / high', '不传', '不开放'],
      ['gpt-image-2.5-flare-满血', '1K、2K、4K', 'auto / low / medium / high / xhigh / max', 'auto / opaque / transparent', '支持'],
      ['gpt-image-2.5-sunburst', '1K', 'auto / low / medium / high / xhigh / max', '不传', '不开放'],
      ['gpt-image-2.5-sunburst-4k', '1K、2K、4K', 'auto / low / medium / high', '不传', '不开放'],
      ['gpt-image-2.5-sunburst-满血', '1K、2K、4K', 'auto / low / medium / high / xhigh / max', 'auto / opaque / transparent', '支持']
    ]
  },
  { type: 'note', value: '实际请求的size必须是具体像素，例如1024x1024或3840x2160，不是1K、4K或16:9。-4k型号不支持xhigh/max；只有两款“满血”型号发送background。' }
];

export const IMAGE2_GENERATION_TABLE = {
  type: 'table', headers: ['字段', '类型', '要求 / 默认建议', '取值与说明'],
  rows: [
    ['model', 'string', '必填', '选择型号表中的完整名称'],
    ['prompt', 'string', '必填', '描述主体、构图、风格、文字内容及需要保留的细节'],
    ['size', 'string', '建议显式填写', '宽x高，英文小写x，例如1024x1024；具体值见尺寸表'],
    ['quality', 'string', '建议auto', 'auto、low、medium、high；xhigh、max仅用于型号表允许的版本'],
    ['background', 'string', '满血型号可选，建议auto', 'auto自动，opaque不透明，transparent透明；其他型号省略'],
    ['n', 'integer', '建议1', '输出数量，不是参考图数量；批量生成建议拆成独立n=1请求并控制并发'],
    ['response_format', 'string', '兼容渠道可选', 'url或b64_json；读取data[].url或data[].b64_json。满血型号可省略'],
    ['output_format', 'string', '建议png', 'PNG可用于透明背景；不使用此字段代替response_format，实际格式读取文件MIME'],
    ['output_compression', 'integer', 'PNG时省略', '0–100，JPEG/WebP的压缩设置，不适用于PNG；基础示例不发送'],
    ['moderation', 'string', '可选，默认auto', 'auto使用默认审核策略；low使用较宽松的审核级别，仍会执行内容安全检查，不代表关闭审核']
  ]
};

export const IMAGE2_EDIT_BLOCKS = [
  { type: 'paragraph', value: 'POST /v1/images/edits支持上传本地图片或在JSON中传入图片URL。两种方式使用同一组模型和编辑指令，不需要转换成Gemini或聊天协议；根据图片来源选择一种请求格式。' },
  { type: 'table', headers: ['图片来源', 'Content-Type', '参考图字段', '写法'], rows: [
    ['本地文件', 'multipart/form-data', 'image / image[]', '单图上传image；多图重复image[]文件字段'],
    ['远程图片URL', 'application/json', 'images', 'URL字符串数组，例如["https://example.com/product.png"]'],
    ['单张URL兼容写法', 'application/json', 'image', 'URL字符串；与images二选一，不在同一请求混传']
  ] },
  { type: 'table', headers: ['字段', '类型 / 要求', '限制与说明'], rows: [
    ['model', 'string，必填', '与文生图使用同一型号表'],
    ['prompt', 'string，必填', '说明保留、修改或替换的内容，明确多张参考图的用途'],
    ['image / image[]', 'multipart文件，与JSON参考图二选一', '参考图最多16张，上传真实PNG、JPEG或WebP文件，不传本机路径字符串'],
    ['images', 'string[]，JSON请求时使用', '参考图URL数组，最多16张；单图也可使用长度为1的数组，顺序即参考顺序'],
    ['image', 'string，JSON单图兼容字段', '填写一张图片的HTTPS直链，不与images同时发送'],
    ['size', 'string，建议填写', '使用具体像素尺寸，遵守型号档位范围'],
    ['quality', 'string，可选', '满血型号可按型号表发送；其他型号的整图编辑基础请求省略'],
    ['background', 'string，可选', '只用于满血型号；透明背景用transparent并选择PNG'],
    ['moderation', 'string，可选，默认auto', 'auto为默认审核策略；low为较宽松审核，不等于关闭安全检查；JSON和multipart均可传入'],
    ['n', 'integer，建议1', '输出数量，与image[]参考图数量无关'],
    ['mask', '文件，可选，仅满血型号', '透明区域表示修改区域，尺寸与第一张参考图相同；主图与遮罩各不超过50MiB；其他型号不传']
  ] },
  { type: 'paragraph', value: '参考图按文件或URL数组的顺序编号，例如“保留第一张图的人物，使用第二张图的服装”。两种输入方式的参考图上限相同。mask是局部编辑输入，不是透明背景开关。' },
  { type: 'heading', value: 'URL图生图：JSON请求' },
  { type: 'paragraph', value: '图片已在可公开访问的存储上时，直接把HTTPS直链放入images，无需先在客户端下载或Base64编码。以下使用两张参考图；单图时只保留一项。response_format=url控制生成结果的返回方式，与输入URL字段images不同。' },
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: respond-async' \\
  --data '${JSON.stringify({
    model: 'gpt-image-2-4k',
    prompt: '保留第一张图的商品，参考第二张图的构图，背景改成纯白',
    images: ['https://example.com/product.png', 'https://example.com/style.jpg'],
    size: '2560x1440', moderation: 'auto', n: 1
  }, null, 2)}'` },
  { type: 'note', value: 'URL必须直接返回图片文件，不能是网页、网盘预览页、本机路径或需要Cookie登录的地址。签名URL需在排队及生成期间保持有效。不要把URL放在Base64字段中，也不要用image=@https://...上传远程链接。' },
  { type: 'heading', value: '本地图片上传：multipart请求' },
  { type: 'paragraph', value: '单图使用image，多图重复提交image[]。让HTTP客户端自动生成boundary，不手动设置Content-Type。' },
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Prefer: respond-async' \\
  -F 'model=gpt-image-2-4k' \\
  -F 'prompt=保留第一张图的商品，参考第二张图的构图，背景改成纯白' \\
  -F 'image[]=@product.png' \\
  -F 'image[]=@style.png' \\
  -F 'size=2560x1440' \\
  -F 'n=1'` },
  { type: 'note', value: '普通图生图以model、prompt、参考图、size为基础。需要mask、background或编辑质量控制时选择gpt-image-2.5-flare-满血或gpt-image-2.5-sunburst-满血，不能用-4k后缀代替这两款型号。' },
  { type: 'heading', value: '遮罩局部编辑：仅满血型号' },
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Prefer: respond-async' \\
  -F 'model=gpt-image-2.5-sunburst-满血' \\
  -F 'prompt=只修改遮罩透明区域中的背景，保留人物与衣服' \\
  -F 'image=@original.png' \\
  -F 'mask=@mask.png' \\
  -F 'size=1024x1024' \\
  -F 'quality=high' \\
  -F 'moderation=auto' \\
  -F 'output_format=png' \\
  -F 'n=1'` }
];

export const IMAGE2_SIZE_ROWS = [
  ['1:1', '1024x1024', '2048x2048', '2880x2880'],
  ['3:2', '1536x1024', '2160x1440', '3456x2304'],
  ['2:3', '1024x1536', '1440x2160', '2304x3456'],
  ['16:9', '1280x720', '2560x1440', '3840x2160'],
  ['9:16', '720x1280', '1440x2560', '2160x3840'],
  ['4:3', '1024x768', '2048x1536', '3200x2400'],
  ['3:4', '768x1024', '1536x2048', '2400x3200'],
  ['21:9', '1280x544', '2560x1088', '3840x1600']
];

export const IMAGE2_SIZE_BLOCKS = [
  { type: 'heading', value: '比例、尺寸与像素限制' },
  { type: 'paragraph', value: '以下是1K、2K、4K档位对应的请求尺寸，复制到size即可。只有1K档位的型号不能使用2K或4K列。21:9会做像素对齐，实际比例略有偏差；4K方图是2880x2880，不是4096x4096。' },
  { type: 'table', headers: ['比例', '1K：size', '2K：size', '4K：size'], rows: IMAGE2_SIZE_ROWS },
  { type: 'table', headers: ['约束', '具体要求', '示例'], rows: [
    ['宽高倍数', '宽和高都必须是16的倍数', '1024x1024合法；1000x1000不符合倍数要求'],
    ['最大边长', '宽或高最大3840px', '3840x2160合法；4096x4096超限'],
    ['最大宽高比', '最长边 / 最短边≤3', '21:9可用；8:1超限'],
    ['总像素', '655360至8294400像素', '512x512低于下限；3840x3840高于上限'],
    ['自定义尺寸', '同时满足以上条件和型号档位', '不要只校验最长边；下载后读取图片实际宽高']
  ] },
  { type: 'heading', value: '审核参数moderation' },
  { type: 'table', headers: ['取值', '作用', '请求方式'], rows: [
    ['auto', '默认审核策略；不传时使用默认行为', 'JSON："moderation":"auto"；multipart：-F moderation=auto'],
    ['low', '较宽松的审核级别，仍可能拒绝不符合内容安全要求的提示词、参考图或结果', 'JSON："moderation":"low"；multipart：-F moderation=low']
  ] },
  { type: 'paragraph', value: 'moderation用于文生图和图片编辑，不改变quality、size或background。只使用auto、low，不传off、none、false或数字；low不是完全关闭审核。内容安全拒绝时读取error中的原因，不把它当成上传解析失败。' },
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/generations' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: respond-async' \\
  --data '${JSON.stringify({
    model: 'gpt-image-2.5-flare-满血',
    prompt: '浅色背景上的一杯橘子汽水，商业摄影',
    size: '1024x1024', quality: 'high', moderation: 'low', n: 1
  }, null, 2)}'` },
  { type: 'heading', value: '质量、透明背景与数量' },
  { type: 'paragraph', value: 'quality不改变size的格式。auto由模型选择，基础档位为low、medium、high，xhigh/max仅用于型号表允许的版本。需要多张独立结果时分次创建并保存各任务编号；参考图16张上限不等于输出数量n的上限。' },
  { type: 'code', lang: 'bash', value: `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/images/generations' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Prefer: respond-async' \\
  --data '{"model":"gpt-image-2.5-flare-满血","prompt":"一个独立的橘子图标，透明背景，无投影","size":"1024x1024","quality":"high","background":"transparent","output_format":"png","n":1}'` },
  { type: 'note', value: '透明背景不能保存成JPEG。不要把GPT Image的3840边长、3:1比例和总像素限制套用到Nano Banana；香蕉有独立的aspectRatio、imageSize配置。' }
];

export const IMAGE2_RESPONSE_BLOCKS = [
  { type: 'heading', value: '图片结果字段与格式' },
  { type: 'table', headers: ['返回字段', '类型', '处理方式'], rows: [
    ['data', 'array', '逐项处理生成结果，不丢弃后续图片'],
    ['data[].url', 'string，可选', '及时下载保存，临时URL不是永久存储'],
    ['data[].b64_json', 'string，可选', 'Base64解码成图片文件，不把编码文本直接写入.png'],
    ['data[].revised_prompt', 'string，可选', '修订提示词，缺少此字段不等于生成失败'],
    ['size / quality / background', '可选', '返回时记录实际参数，不凭请求值推断图片最终宽高'],
    ['Content-Type', '文件下载响应头', '按实际MIME确定格式，不只根据URL后缀判断']
  ] },
  { type: 'paragraph', value: '同步响应需要在data中找到url或b64_json才算拿到图片。异步任务的result保留相同结构，有media归档地址时直接鉴权下载，客户端不需要转换接口协议。' }
];
