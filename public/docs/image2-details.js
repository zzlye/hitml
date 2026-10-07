// 这些字段和限制来自西米露图片页面的实际配置，供网页和Markdown导出共同使用。
export const IMAGE2_MODEL_BLOCKS = [
  {
    type: "heading",
    value: "西米露图片模型与选择"
  },
  {
    type: "paragraph",
    value: "请求中的model必须填写平台提供的完整模型名称。模型后缀只用于区分平台已配置的版本，不要自行拼接新的名称；同一套Images请求可以用于文生图和图片编辑。"
  },
  {
    type: "table",
    headers: ["模型名称", "模型系列", "适用场景", "可选尺寸档位"],
    rows: [
      ["gpt-image-2", "Image 2", "通用文生图、参考图编辑", "以西米露页面实际可选项为准"],
      ["gpt-image-2-4k", "Image 2", "需要更大输出尺寸的文生图、图片编辑", "4K版本可选项"],
      ["gpt-image-2.5-flare", "Image 2.5 Flare", "通用图片生成与编辑", "以西米露页面实际可选项为准"],
      ["gpt-image-2.5-flare-4k", "Image 2.5 Flare", "大尺寸图片生成与编辑", "4K版本可选项"],
      ["gpt-image-2.5-flare-满血", "Image 2.5 Flare", "需要完整模型能力的生成与编辑", "以西米露页面实际可选项为准"],
      ["gpt-image-2.5-sunburst", "Image 2.5 Sunburst", "通用图片生成与编辑", "以西米露页面实际可选项为准"],
      ["gpt-image-2.5-sunburst-4k", "Image 2.5 Sunburst", "大尺寸图片生成与编辑", "4K版本可选项"],
      ["gpt-image-2.5-sunburst-满血", "Image 2.5 Sunburst", "需要完整模型能力的生成与编辑", "以西米露页面实际可选项为准"]
    ]
  },
  {
    type: "note",
    value: "1K、2K、4K是西米露页面中的尺寸档位；直接调用接口时应提交页面根据比例换算出的具体像素尺寸，例如1024x1024。某个模型未显示的尺寸或质量选项不要强行提交。"
  }
];

export const IMAGE2_GENERATION_TABLE = {
  type: "table",
  headers: ["字段", "类型", "要求", "西米露适配说明"],
  rows: [
    ["model", "string", "必填", "填写完整模型名称，不能只写Image 2或自定义后缀"],
    ["prompt", "string", "必填", "填写主体、动作、构图、风格、文字内容和需要保留的细节"],
    ["size", "string", "选填", "使用具体像素格式WxH；支持的比例和合法尺寸见下方尺寸表"],
    ["quality", "string", "选填", "auto、low、medium、high；部分模型还支持xhigh、max"],
    ["background", "string", "选填", "auto、opaque、transparent；只有页面展示背景选项的模型才传"],
    ["n", "integer", "选填", "生成数量，最小为1；最大值取决于当前模型、渠道和账户配置"],
    ["response_format", "string", "选填", "按接口实际响应选择url或b64_json；优先读取返回结果，不要假定两者同时存在"],
    ["output_format", "string", "不建议主动传", "当前西米露图片页面未将其作为统一控制项；输出格式以url、b64_json和下载响应的Content-Type为准"],
    ["user", "string", "不建议主动传", "当前页面没有统一使用该字段，除非服务端明确返回支持说明"]
  ]
};

export const IMAGE2_EDIT_BLOCKS = [
  {
    type: "paragraph",
    value: "图生图使用POST /v1/images/edits，通过multipart/form-data上传参考图。单图字段使用image，多图按兼容格式重复提交image[]；不要把图片转成普通JSON字符串，也不要手动填写Content-Type的boundary。"
  },
  {
    type: "table",
    headers: ["字段", "传输方式", "限制与说明"],
    rows: [
      ["model", "表单字段", "填写完整图片模型名称"],
      ["prompt", "表单字段", "说明哪些内容保留、修改或替换，并明确多张参考图的用途"],
      ["image / image[]", "文件字段", "参考图最多16张；使用真实图片文件，不要提交本机路径或未经处理的File对象文本"],
      ["size", "表单字段", "填写合法的WxH像素尺寸；编辑结果同样受比例、像素和16倍数限制"],
      ["quality", "表单字段", "只提交当前模型页面可选的质量档位"],
      ["background", "表单字段", "需要透明背景时使用transparent，模型未提供该选项时不要提交"],
      ["mask", "文件字段", "只有服务端明确启用局部重绘时才提交，并确保它和参考图尺寸及格式匹配"]
    ]
  },
  {
    type: "paragraph",
    value: "参考图顺序会影响模型理解。多图请求应在prompt中写清楚“第一张图是主体、第二张图是服装”等对应关系；上传成功不代表模型一定会保留所有细节，结果仍需检查。"
  }
];

export const IMAGE2_SIZE_BLOCKS = [
  {
    type: "heading",
    value: "比例、尺寸与像素限制"
  },
  {
    type: "paragraph",
    value: "西米露支持1K、2K、4K三个尺寸档位，并提供8种比例。直接调用时size使用具体的宽高字符串，不要把1:1、16:9这类比例文本直接当作size；比例用于选择合法的宽高，最终请求应使用对应的WxH。"
  },
  {
    type: "table",
    headers: ["比例", "常用示例尺寸", "适用方向"],
    rows: [
      ["1:1", "1024x1024", "头像、图标、方形产品图"],
      ["3:2", "1152x768", "横向摄影、商品展示"],
      ["2:3", "768x1152", "竖向摄影、海报"],
      ["16:9", "1280x720", "横屏封面、视频画面"],
      ["9:16", "720x1280", "手机壁纸、竖屏封面"],
      ["4:3", "1024x768", "演示配图、传统横图"],
      ["3:4", "768x1024", "商品详情、竖版卡片"],
      ["21:9", "1680x720", "超宽横幅、电影感画面"]
    ]
  },
  {
    type: "table",
    headers: ["约束", "具体要求", "处理建议"],
    rows: [
      ["宽高倍数", "宽和高都必须是16的倍数", "使用1024x1024、1280x720等合法尺寸，不要使用1000x1000"],
      ["最大边长", "宽或高的最大值为3840px", "超出时降低对应边长，并重新检查总像素"],
      ["宽高比", "最长边与最短边的比例不能超过3:1", "21:9可以使用；更极端的自定义比例会被拒绝"],
      ["总像素", "655360至8294400像素", "宽乘高必须落在范围内，不能只检查单边长度"],
      ["服务端规整", "不合法尺寸可能被规整或直接报错", "生产请求先在客户端校验，结果保存时再读取实际图片宽高"]
    ]
  },
  {
    type: "heading",
    value: "质量、背景与数量参数"
  },
  {
    type: "table",
    headers: ["参数", "可用值", "说明"],
    rows: [
      ["quality", "auto / low / medium / high", "基础质量档位，auto由模型选择；适用于页面展示基础选项的模型"],
      ["quality扩展值", "xhigh / max", "西米露部分模型提供的扩展档位；以所选模型实际可选项为准"],
      ["background", "auto / opaque / transparent", "自动、不透明、透明背景；只对服务端启用背景控制的模型生效"],
      ["n", "大于等于1的整数", "一次请求的图片数量；数量较大时会产生多个独立生成结果"],
      ["参考图", "最多16张", "文生图也可按模型能力使用参考图；图生图必须遵守16张上限"]
    ]
  },
  {
    type: "note",
    value: "建议先使用quality=auto、background=auto、n=1和1024x1024完成链路验证，再逐项增加尺寸、质量、背景和数量。不要将未在西米露页面出现的参数批量发送给所有图片模型。"
  }
];

export const IMAGE2_RESPONSE_BLOCKS = [
  {
    type: "heading",
    value: "图片结果字段与格式"
  },
  {
    type: "table",
    headers: ["返回字段", "类型", "处理方式"],
    rows: [
      ["data", "array", "逐项处理每一张生成结果，不要只读取data[0]后丢弃其余图片"],
      ["data[].url", "string，可选", "按地址下载；地址可能是临时地址，拿到后及时保存"],
      ["data[].b64_json", "string，可选", "去掉可能存在的Data URL前缀后Base64解码保存"],
      ["data[].revised_prompt", "string，可选", "服务端修订后的提示词；没有该字段不代表生成失败"],
      ["Content-Type", "响应头", "下载时检查实际图片类型，不要只根据文件扩展名判断"]
    ]
  },
  {
    type: "paragraph",
    value: "同步返回的HTTP 2xx只代表请求处理成功，仍需确认data中存在url或b64_json。异步返回的result沿用同一套图片结构，网关不会要求客户端把图片内容转换成另一种协议。"
  }
];
