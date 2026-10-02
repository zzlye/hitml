// 文档按本站已启用的公开媒体模型维护；内部渠道、凭据和用户任务内容不进入页面。
export const API_ORIGIN = "https://api.zzlye.xyz";

export const mediaModels = [
  {
    "name": "gpt-image-2",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2-4k",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-flare",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-flare-4k",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-flare-满血",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-sunburst",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-sunburst-4k",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "gpt-image-2.5-sunburst-满血",
    "page": "image2",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "nano-banana-2",
    "page": "banana",
    "kind": "图片",
    "protocol": "Gemini 原生"
  },
  {
    "name": "nano-banana-pro",
    "page": "banana",
    "kind": "图片",
    "protocol": "Gemini 原生"
  },
  {
    "name": "seedream-5-pro",
    "page": "seedream",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "sd5p",
    "page": "seedream",
    "kind": "图片",
    "protocol": "Images"
  },
  {
    "name": "wan-3.0",
    "page": "video",
    "kind": "视频",
    "protocol": "Videos"
  },
  {
    "name": "wan-3.0-1080p",
    "page": "video",
    "kind": "视频",
    "protocol": "Videos"
  }
];

export const pages = [
  {
    "id": "start",
    "label": "接入指南",
    "title": "图片与视频接口文档",
    "lead": "从选择模型到保存生成结果，按你使用的模型协议完成接入。",
    "blocks": [
      {
        "type": "heading",
        "value": "基础地址与鉴权"
      },
      {
        "type": "table",
        "headers": [
          "用途",
          "地址或请求头"
        ],
        "rows": [
          [
            "服务域名",
            "https://api.zzlye.xyz"
          ],
          [
            "Images / Videos / 任务查询",
            "https://api.zzlye.xyz/v1"
          ],
          [
            "Gemini 原生",
            "https://api.zzlye.xyz/v1beta"
          ],
          [
            "鉴权",
            "Authorization: Bearer <API_KEY>"
          ]
        ]
      },
      {
        "type": "note",
        "value": "客户端设置中的 Base URL 通常填到 `/v1`；本文 cURL 示例使用完整地址。Gemini 原生接口使用 `/v1beta`，不要拼成 `/v1/v1beta`。"
      },
      {
        "type": "paragraph",
        "value": "将 API Key 保存在环境变量或服务端配置中。不要把个人 Key 写入公开网页、仓库或分享链接。下面的 `<API_KEY>` 需要替换为自己的 Key。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "export WENYUN_API_KEY=\"<API_KEY>\""
      },
      {
        "type": "code",
        "lang": "powershell",
        "value": "$env:WENYUN_API_KEY = \"<API_KEY>\""
      },
      {
        "type": "heading",
        "value": "先选接口，再选模型"
      },
      {
        "type": "table",
        "headers": [
          "模型系列",
          "生成接口",
          "参考图方式"
        ],
        "rows": [
          [
            "GPT Image 2 / 2.5",
            "POST /v1/images/generations",
            "POST /v1/images/edits 上传文件"
          ],
          [
            "Nano Banana",
            "POST /v1beta/models/{model}:generateContent",
            "在 contents.parts 中加入 inlineData"
          ],
          [
            "Seedream / sd5p",
            "POST /v1/images/generations",
            "POST /v1/images/edits 上传文件"
          ],
          [
            "Wan 3.0",
            "POST /v1/videos",
            "input_reference.image_url"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "一条完整的接入流程"
      },
      {
        "type": "list",
        "items": [
          "使用自己的 Key 查询 `/v1/models`，确认模型名称和令牌权限。",
          "按对应模型章节提交一次生成请求；本文主要示例使用显式任务模式。",
          "收到 HTTP 202 后保存 `task_id` 和 `poll_url`，继续查询原任务，不重复提交。",
          "任务变为 `succeeded` 后读取 `result` 或下载 `media`；及时保存到自己的存储。"
        ]
      },
      {
        "type": "note",
        "value": "HTTP 202 表示已受理，不表示生成完成；HTTP 200 的任务查询也可能返回 `failed`。请同时检查 HTTP 状态和任务状态。"
      },
      {
        "type": "heading",
        "value": "示例说明"
      },
      {
        "type": "paragraph",
        "value": "cURL 示例按 Bash 写法提供；在 PowerShell 中运行时使用 `curl.exe` 并调整换行与变量语法。JavaScript 示例适用于支持内置 fetch 的 Node.js。示例中的任务编号、文件名和占位图片数据均需替换，不代表一次真实生成结果。"
      },
      {
        "type": "links",
        "items": [
          {
            "id": "models",
            "label": "选择图片或视频模型"
          },
          {
            "id": "image2",
            "label": "GPT Image 图片生成"
          },
          {
            "id": "banana",
            "label": "Nano Banana 原生接入"
          },
          {
            "id": "video",
            "label": "Wan 视频生成"
          }
        ]
      }
    ]
  },
  {
    "id": "models",
    "label": "模型列表",
    "title": "图片与视频模型",
    "lead": "模型名称按原样填写，后缀和中文也是名称的一部分。",
    "blocks": [
      {
        "type": "heading",
        "value": "模型与协议"
      },
      {
        "type": "table",
        "headers": [
          "模型名称",
          "类型",
          "推荐接口协议"
        ],
        "rows": [
          [
            "`gpt-image-2`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2-4k`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-flare`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-flare-4k`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-flare-满血`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-sunburst`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-sunburst-4k`",
            "图片",
            "Images"
          ],
          [
            "`gpt-image-2.5-sunburst-满血`",
            "图片",
            "Images"
          ],
          [
            "`nano-banana-2`",
            "图片",
            "Gemini 原生"
          ],
          [
            "`nano-banana-pro`",
            "图片",
            "Gemini 原生"
          ],
          [
            "`seedream-5-pro`",
            "图片",
            "Images"
          ],
          [
            "`sd5p`",
            "图片",
            "Images"
          ],
          [
            "`wan-3.0`",
            "视频",
            "Videos"
          ],
          [
            "`wan-3.0-1080p`",
            "视频",
            "Videos"
          ]
        ]
      },
      {
        "type": "note",
        "value": "公开模型列表不等于你的 Key 一定有访问权限。实际可用模型取决于令牌限制、分组及渠道状态；以当前 Key 查询到的模型列表为准。"
      },
      {
        "type": "heading",
        "value": "查询当前 Key 的模型"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/models' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "paragraph",
        "value": "从返回的 `data[].id` 读取模型名称。若账户提供了专属别名，使用返回的完整别名，不要自行删除前缀或后缀。"
      },
      {
        "type": "heading",
        "value": "名称、尺寸和价格"
      },
      {
        "type": "list",
        "items": [
          "`-4k`、`-满血` 都是独立的接入名称，不要把它们改成 quality 参数，也不要只修改请求尺寸就假定切换了版本。",
          "GPT Image 的 `size` 使用像素字符串；香蕉使用 `generationConfig.imageConfig`；视频使用 `duration`、`resolution`、`aspect_ratio`。这些字段不可互换。",
          "价格、分组倍率及余额以平台当前展示为准。这里不把实时价格写成固定承诺。"
        ]
      },
      {
        "type": "links",
        "items": [
          {
            "id": "image2",
            "label": "GPT Image 参数"
          },
          {
            "id": "banana",
            "label": "Nano Banana 参数"
          },
          {
            "id": "seedream",
            "label": "Seedream 参数"
          },
          {
            "id": "video",
            "label": "Wan 参数"
          }
        ]
      }
    ]
  },
  {
    "id": "image2",
    "label": "GPT Image",
    "title": "GPT Image 2 / 2.5",
    "lead": "使用 Images 协议完成文生图和上传参考图编辑。",
    "blocks": [
      {
        "type": "heading",
        "value": "选择模型"
      },
      {
        "type": "table",
        "headers": [
          "系列",
          "可用名称"
        ],
        "rows": [
          [
            "Image 2",
            "`gpt-image-2`、`gpt-image-2-4k`"
          ],
          [
            "Image 2.5 Flare",
            "`gpt-image-2.5-flare`、`gpt-image-2.5-flare-4k`、`gpt-image-2.5-flare-满血`"
          ],
          [
            "Image 2.5 Sunburst",
            "`gpt-image-2.5-sunburst`、`gpt-image-2.5-sunburst-4k`、`gpt-image-2.5-sunburst-满血`"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "文生图"
      },
      {
        "type": "code",
        "lang": "http",
        "value": "POST https://api.zzlye.xyz/v1/images/generations"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "要求",
          "说明"
        ],
        "rows": [
          [
            "model",
            "string",
            "必填",
            "完整模型名"
          ],
          [
            "prompt",
            "string",
            "必填",
            "描述主体、构图、风格及需要保留的细节"
          ],
          [
            "size",
            "string",
            "选填",
            "像素字符串，例如 1024x1024、1280x720、720x1280；也可由模型决定"
          ],
          [
            "n",
            "integer",
            "选填",
            "生成张数，示例使用 1；实际支持数量由所选模型决定"
          ],
          [
            "response_format",
            "string",
            "选填",
            "url 或 b64_json；是否支持、最终格式以所选渠道返回为准"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/images/generations' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: respond-async' \\\n  --data '{\n  \"model\": \"gpt-image-2.5-flare\",\n  \"prompt\": \"一张温暖明亮的橘子汽水产品海报，干净背景，主体清晰\",\n  \"size\": \"1024x1024\",\n  \"n\": 1\n}'"
      },
      {
        "type": "heading",
        "value": "图生图 / 图片编辑"
      },
      {
        "type": "paragraph",
        "value": "使用 multipart/form-data 直接上传参考图。cURL 的 `-F` 会自动生成正确的 Content-Type 和 boundary，不要手动写一个缺少 boundary 的 Content-Type。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/images/edits' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Prefer: respond-async' \\\n  -F 'model=gpt-image-2.5-flare' \\\n  -F 'prompt=保留人物和姿态，把背景换成温暖的咖啡馆' \\\n  -F 'image=@reference.png' \\\n  -F 'size=1024x1024' \\\n  -F 'n=1'"
      },
      {
        "type": "paragraph",
        "value": "多图编辑可重复提交 `image[]` 文件字段，并在提示词中说明每张图的用途。不要把本机文件路径当作网络 URL 传给接口。"
      },
      {
        "type": "heading",
        "value": "尺寸与扩展参数"
      },
      {
        "type": "paragraph",
        "value": "先用 `1024x1024` 完成接入，再按实际模型选择横图、竖图或高清版本。请求尺寸与最终输出尺寸可能不同，处理结果时读取图片本身的宽高。"
      },
      {
        "type": "paragraph",
        "value": "`quality`、`background`、`output_format` 等扩展字段是否生效取决于选中的模型与渠道，不再统一标为“被忽略”。没有明确支持时先不传入；不要把某个模型的参数组合照搬给全部模型。"
      },
      {
        "type": "heading",
        "value": "读取结果"
      },
      {
        "type": "paragraph",
        "value": "显式任务模式下，先查询 `poll_url`。完成后的 `result` 是生成接口的响应正文，常见结构如下；也可以直接使用任务的 `media` 下载归档图片。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"created\": 1790870400,\n  \"data\": [\n    {\n      \"b64_json\": \"<BASE64_IMAGE_DATA>\"\n    }\n  ]\n}"
      },
      {
        "type": "paragraph",
        "value": "若返回 `data[].url`，可能是 HTTPS 地址或 `data:image/...;base64,...`。HTTPS 地址直接下载；Data URL 去掉前缀后解码。不要把纯 Base64 传给 fetch 当作网址。"
      },
      {
        "type": "links",
        "items": [
          {
            "id": "tasks",
            "label": "查看任务查询与下载示例"
          },
          {
            "id": "errors",
            "label": "查看常见问题"
          }
        ]
      }
    ]
  },
  {
    "id": "banana",
    "label": "Nano Banana",
    "title": "Nano Banana 原生图片接口",
    "lead": "当前推荐使用 Gemini 原生 generateContent，模型名仍填写平台提供的香蕉别名。",
    "blocks": [
      {
        "type": "heading",
        "value": "模型与接口"
      },
      {
        "type": "table",
        "headers": [
          "模型",
          "接口"
        ],
        "rows": [
          [
            "nano-banana-2",
            "POST /v1beta/models/nano-banana-2:generateContent"
          ],
          [
            "nano-banana-pro",
            "POST /v1beta/models/nano-banana-pro:generateContent"
          ]
        ]
      },
      {
        "type": "note",
        "value": "本章节使用 Gemini 原生请求与响应，不要套用 Images 的 prompt、image、size 字段。图片读取自 `candidates[].content.parts[].inlineData`，不是 `data[].b64_json`。"
      },
      {
        "type": "heading",
        "value": "文生图"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1beta/models/nano-banana-2:generateContent' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: respond-async' \\\n  --data '{\n  \"contents\": [\n    {\n      \"role\": \"user\",\n      \"parts\": [\n        {\n          \"text\": \"画一只抱着橘子的小猫，柔和水彩风，浅色背景\"\n        }\n      ]\n    }\n  ],\n  \"generationConfig\": {\n    \"responseModalities\": [\n      \"TEXT\",\n      \"IMAGE\"\n    ],\n    \"imageConfig\": {\n      \"aspectRatio\": \"1:1\",\n      \"imageSize\": \"1K\"\n    }\n  }\n}'"
      },
      {
        "type": "heading",
        "value": "参数说明"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "说明"
        ],
        "rows": [
          [
            "contents",
            "array",
            "对话内容；单次生成传一条 role 为 user 的内容即可"
          ],
          [
            "contents[].parts[].text",
            "string",
            "提示词"
          ],
          [
            "contents[].parts[].inlineData",
            "object",
            "参考图，包含 mimeType 和纯 Base64 编码的 data"
          ],
          [
            "generationConfig.responseModalities",
            "array",
            "示例使用 [\"TEXT\", \"IMAGE\"]，请求输出图片"
          ],
          [
            "generationConfig.imageConfig.aspectRatio",
            "string",
            "画面比例，例如 1:1、16:9、9:16"
          ],
          [
            "generationConfig.imageConfig.imageSize",
            "string",
            "分辨率档位，例如 1K；其他档位按模型支持情况选择，保持大小写"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "模型别名放在请求路径中，无需在请求体再填写 model。Key 使用文运工坊的 Key，不是上游厂商 Key。"
      },
      {
        "type": "heading",
        "value": "带参考图的请求体"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"contents\": [\n    {\n      \"role\": \"user\",\n      \"parts\": [\n        {\n          \"text\": \"保持主体外观，把画面改成柔和水彩风\"\n        },\n        {\n          \"inlineData\": {\n            \"mimeType\": \"image/png\",\n            \"data\": \"<BASE64_IMAGE_DATA>\"\n          }\n        }\n      ]\n    }\n  ],\n  \"generationConfig\": {\n    \"responseModalities\": [\n      \"TEXT\",\n      \"IMAGE\"\n    ],\n    \"imageConfig\": {\n      \"aspectRatio\": \"1:1\",\n      \"imageSize\": \"1K\"\n    }\n  }\n}"
      },
      {
        "type": "paragraph",
        "value": "将每张参考图作为独立的 inlineData 项加入 parts，并保留顺序。data 只放 Base64 数据，不包含 `data:image/png;base64,` 前缀；mimeType 必须与文件实际格式一致。"
      },
      {
        "type": "heading",
        "value": "Node.js 读取本地参考图并提交"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile } from 'node:fs/promises';\n\n// 图片只在客户端编码一次，不额外转成另一种接口协议。\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst image = await readFile('reference.png');\nconst response = await fetch('https://api.zzlye.xyz/v1beta/models/nano-banana-2:generateContent', {\n  method: 'POST',\n  headers: {\n    Authorization: 'Bearer ' + key,\n    'Content-Type': 'application/json',\n    Prefer: 'respond-async'\n  },\n  body: JSON.stringify({\n    contents: [{ role: 'user', parts: [\n      { text: '保持主体外观，替换为纯白背景' },\n      { inlineData: { mimeType: 'image/png', data: image.toString('base64') } }\n    ] }],\n    generationConfig: {\n      responseModalities: ['TEXT', 'IMAGE'],\n      imageConfig: { aspectRatio: '1:1', imageSize: '1K' }\n    }\n  }),\n  signal: AbortSignal.timeout(120000)\n});\nconst payload = await response.json();\nif (!response.ok) throw new Error(JSON.stringify(payload));\nconsole.log(payload); // 保存返回的 task_id 与 poll_url，继续查询同一任务。\n"
      },
      {
        "type": "heading",
        "value": "读取原生图片结果"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"candidates\": [\n    {\n      \"content\": {\n        \"parts\": [\n          {\n            \"text\": \"示意说明文字\"\n          },\n          {\n            \"inlineData\": {\n              \"mimeType\": \"image/png\",\n              \"data\": \"<BASE64_IMAGE_DATA>\"\n            }\n          }\n        ]\n      }\n    }\n  ]\n}"
      },
      {
        "type": "paragraph",
        "value": "任务模式下，上面的结构在 `result` 中。遍历所有 candidates 和 parts；文本项与图片项可能同时出现。如果没有图片项，检查 finishReason、promptFeedback 及错误信息，不要把仅有文字的响应当作已出图。"
      },
      {
        "type": "paragraph",
        "value": "响应中可能同时保留原生字段与归档媒体地址。优先下载任务的 `media`，或按 `inlineData.mimeType` 保存解码后的图片。"
      },
      {
        "type": "links",
        "items": [
          {
            "id": "tasks",
            "label": "查看任务查询与下载示例"
          },
          {
            "id": "errors",
            "label": "查看常见问题"
          }
        ]
      }
    ]
  },
  {
    "id": "seedream",
    "label": "Seedream",
    "title": "Seedream 图片生成",
    "lead": "seedream-5-pro 与 sd5p 使用平台公布的原始名称接入，不互相替换名称。",
    "blocks": [
      {
        "type": "heading",
        "value": "模型选择"
      },
      {
        "type": "table",
        "headers": [
          "模型",
          "使用方式"
        ],
        "rows": [
          [
            "seedream-5-pro",
            "Images 文生图与图片编辑"
          ],
          [
            "sd5p",
            "Images 文生图与图片编辑；独立模型名，不假定与 seedream-5-pro 完全等价"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "`seedream-5-pro` 的模型配置标注支持 1K / 2K 和最多 10 张参考图。该说明不自动适用于 sd5p；其他限制以及组合支持以所选模型返回为准。"
      },
      {
        "type": "heading",
        "value": "文生图"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/images/generations' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: respond-async' \\\n  --data '{\n  \"model\": \"seedream-5-pro\",\n  \"prompt\": \"一幅花店门口的清晨插画，柔和日光，保留自然细节\",\n  \"n\": 1\n}'"
      },
      {
        "type": "note",
        "value": "先不传 size 可以避免把 GPT Image 的像素格式与供应商的分辨率档位混用。需要指定尺寸时，使用所选模型明确支持的值。"
      },
      {
        "type": "heading",
        "value": "参考图编辑"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/images/edits' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Prefer: respond-async' \\\n  -F 'model=seedream-5-pro' \\\n  -F 'prompt=保留第一张图片中的商品，参考第二张图片的色调和构图' \\\n  -F 'image[]=@product.png' \\\n  -F 'image[]=@style.png' \\\n  -F 'n=1'"
      },
      {
        "type": "heading",
        "value": "常用字段"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "文生图",
          "编辑",
          "说明"
        ],
        "rows": [
          [
            "model",
            "必填",
            "必填",
            "seedream-5-pro 或 sd5p"
          ],
          [
            "prompt",
            "必填",
            "必填",
            "明确每张参考图的作用"
          ],
          [
            "image / image[]",
            "不需要",
            "必填",
            "表单文件，不是 JSON 中的本机路径"
          ],
          [
            "n",
            "可选",
            "可选",
            "先用 1 张结果完成接入"
          ],
          [
            "size / response_format",
            "可选",
            "可选",
            "按当前模型支持情况填写，不推断所有版本相同"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "读取结果"
      },
      {
        "type": "paragraph",
        "value": "使用本文请求头会先收到任务编号。待任务 succeeded 后，从 `result.data` 读取图片或从 `media` 下载结果；不要在 HTTP 202 的提交响应里直接寻找成品图片。"
      },
      {
        "type": "links",
        "items": [
          {
            "id": "tasks",
            "label": "查看任务查询与下载示例"
          },
          {
            "id": "errors",
            "label": "查看常见问题"
          }
        ]
      }
    ]
  },
  {
    "id": "video",
    "label": "Wan 视频",
    "title": "Wan 3.0 视频生成",
    "lead": "视频生成需要时间。提交后保留任务编号，使用查询接口跟踪结果。",
    "blocks": [
      {
        "type": "heading",
        "value": "模型与端点"
      },
      {
        "type": "table",
        "headers": [
          "项目",
          "值"
        ],
        "rows": [
          [
            "模型",
            "wan-3.0、wan-3.0-1080p"
          ],
          [
            "提交",
            "POST https://api.zzlye.xyz/v1/videos"
          ],
          [
            "显式任务查询",
            "GET https://api.zzlye.xyz/v1/tasks/{task_id}"
          ],
          [
            "Videos 兼容查询",
            "GET https://api.zzlye.xyz/v1/videos/{video_id}"
          ],
          [
            "Videos 兼容下载",
            "GET https://api.zzlye.xyz/v1/videos/{video_id}/content"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "文生视频"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/videos' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: respond-async' \\\n  --data '{\n  \"model\": \"wan-3.0-1080p\",\n  \"prompt\": \"海边清晨，镜头缓慢向前推进，海浪轻轻拍打沙滩\",\n  \"duration\": 8,\n  \"resolution\": \"1080p\",\n  \"aspect_ratio\": \"16:9\"\n}'"
      },
      {
        "type": "heading",
        "value": "请求字段"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "要求",
          "说明"
        ],
        "rows": [
          [
            "model",
            "string",
            "必填",
            "完整名称，1080p 示例使用 wan-3.0-1080p"
          ],
          [
            "prompt",
            "string",
            "必填",
            "描述主体动作、镜头、场景和变化"
          ],
          [
            "duration",
            "number",
            "示例填写",
            "时长，单位秒；此处使用 duration，不套用其他供应商的 seconds"
          ],
          [
            "resolution",
            "string",
            "按模型填写",
            "例如 1080p；与模型、时长组合必须匹配"
          ],
          [
            "aspect_ratio",
            "string",
            "可选",
            "例如 16:9、9:16；不是像素大小"
          ],
          [
            "input_reference",
            "object",
            "参考图生成时填写",
            "对象中的 image_url 指向可读取的参考图地址"
          ],
          [
            "generate_audio",
            "boolean",
            "可选",
            "仅在渠道支持时设置；未指定和 false 含义不同"
          ],
          [
            "seed",
            "integer",
            "可选",
            "仅在模型支持时设置；0 是有效输入，不表示省略"
          ]
        ]
      },
      {
        "type": "note",
        "value": "8 秒、1080p、16:9 是请求写法示例，不代表每个模型支持所有时长与清晰度组合。接口不会因为参数不受支持而保证自动降级。"
      },
      {
        "type": "heading",
        "value": "图生视频"
      },
      {
        "type": "paragraph",
        "value": "在文生视频请求体中增加 `input_reference`，其余字段保留。参考图 URL 必须由供应商直接读取；本地磁盘路径与仅本机可访问的地址不可作为参考图 URL。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"model\": \"wan-3.0-1080p\",\n  \"prompt\": \"保持参考图的角色和构图，让人物轻轻转头，镜头稳定\",\n  \"duration\": 8,\n  \"resolution\": \"1080p\",\n  \"aspect_ratio\": \"16:9\",\n  \"input_reference\": {\n    \"image_url\": \"https://example.com/reference.png\"\n  }\n}"
      },
      {
        "type": "heading",
        "value": "两种查询方式不要混用"
      },
      {
        "type": "table",
        "headers": [
          "提交方式",
          "返回与后续操作"
        ],
        "rows": [
          [
            "添加 Prefer: respond-async 或 ?async=true",
            "返回 202 和 async_ 开头的父任务编号，按 poll_url 查询 /v1/tasks/{task_id}"
          ],
          [
            "不添加显式异步开关",
            "按 Videos 响应取得 id，再查询 /v1/videos/{video_id}；提交成功仍不等于视频已完成"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "保存返回的原始编号，不把 async_ 父任务编号当作 video_id。兼容模式的状态通常为 queued、in_progress、completed、failed；显式任务模式使用下一章的状态表。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "# 仅适用于 Videos 兼容响应中的 video_id，不用于 async_ 编号。\ncurl --fail-with-body 'https://api.zzlye.xyz/v1/videos/<VIDEO_ID>' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\"\n\ncurl --fail-with-body 'https://api.zzlye.xyz/v1/videos/<VIDEO_ID>/content' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.mp4"
      },
      {
        "type": "heading",
        "value": "提交超时后怎么办"
      },
      {
        "type": "paragraph",
        "value": "不要立即重新创建视频。先查已经记录的任务编号；如果收到 `X-New-Api-Task-Id` 响应头，可保留它用于查询。没有取到编号时，在平台任务记录确认是否已受理后再重试，避免重复生成和扣费。"
      },
      {
        "type": "links",
        "items": [
          {
            "id": "tasks",
            "label": "查看任务查询与下载示例"
          },
          {
            "id": "errors",
            "label": "查看常见问题"
          }
        ]
      }
    ]
  },
  {
    "id": "tasks",
    "label": "任务与下载",
    "title": "异步任务与结果下载",
    "lead": "同一套任务流程适用于本平台的图片和视频生成，不需要把结果格式统一转换成另一种协议。",
    "blocks": [
      {
        "type": "heading",
        "value": "启用显式任务模式"
      },
      {
        "type": "code",
        "lang": "http",
        "value": "Prefer: respond-async"
      },
      {
        "type": "paragraph",
        "value": "向原生成接口增加这个请求头，或使用查询参数 `?async=true`。如果同时使用两种开关，async 查询参数优先。不要把 async 当成所有模型都识别的请求体字段。"
      },
      {
        "type": "paragraph",
        "value": "不加开关时，服务器仍会记录后台任务，并按原接口方式返回响应。图片客户端可能一直等待到生成完成；视频原接口可能先返回自身的任务编号。"
      },
      {
        "type": "heading",
        "value": "提交响应"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"object\": \"image_generation\",\n  \"status\": \"pending\",\n  \"created\": 1790870400,\n  \"model\": \"gpt-image-2.5-flare\",\n  \"poll_url\": \"/v1/tasks/async_example\",\n  \"request_path\": \"/v1/images/generations\"\n}"
      },
      {
        "type": "paragraph",
        "value": "此处为结构示意。提交返回 HTTP 202，`Location` 指向查询地址，`Retry-After` 提示下一次查询间隔。object 随原接口类型变化，不要依赖它猜测查询地址。"
      },
      {
        "type": "heading",
        "value": "查询任务"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/tasks/<TASK_ID>' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "paragraph",
        "value": "查询使用同一账户的有效 Key；不要把 Key 放入 URL 查询参数。查询 HTTP 200 只表示读取成功，生成结果由 status 判断。"
      },
      {
        "type": "table",
        "headers": [
          "status",
          "含义",
          "客户端操作"
        ],
        "rows": [
          [
            "pending",
            "任务已排队",
            "继续查询同一任务"
          ],
          [
            "processing",
            "请求正在处理",
            "继续查询同一任务"
          ],
          [
            "waiting",
            "等待上游图片或视频任务完成",
            "继续查询，不重新提交"
          ],
          [
            "succeeded",
            "生成成功",
            "检查 result_expired 后读取结果或下载"
          ],
          [
            "failed",
            "生成失败",
            "读取 error.message 后停止查询"
          ],
          [
            "cancelled",
            "任务已取消",
            "停止查询；不假设存在取消接口"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "完成响应与过期"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"task_id\": \"async_example\",\n  \"status\": \"succeeded\",\n  \"result_expired\": false,\n  \"expires_at\": 1790956800,\n  \"response_status_code\": 200,\n  \"content_type\": \"application/json\",\n  \"result\": {\n    \"data\": [\n      {\n        \"url\": \"https://example.com/result.png\"\n      }\n    ]\n  },\n  \"media\": [\n    {\n      \"url\": \"/v1/tasks/async_example/media/0\",\n      \"preview_url\": \"https://example.com/temporary-preview\",\n      \"kind\": \"image\",\n      \"content_type\": \"image/png\"\n    }\n  ]\n}"
      },
      {
        "type": "list",
        "items": [
          "`result` 保留原接口的响应结构。Images 常见为 data；香蕉原生为 candidates；视频按原协议返回。",
          "`media[].url` 是需要鉴权的文件接口，可按返回的 content_type 保存。列表索引从 0 开始，多个结果按数组逐一下载。",
          "`preview_url` 是临时展示地址，不应长期保存为永久外链。",
          "检查 `result_expired` 和 `expires_at`。过期后任务仍可能是 succeeded，但文件接口返回 410；及时保存结果。"
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body 'https://api.zzlye.xyz/v1/tasks/<TASK_ID>/media/0' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.png"
      },
      {
        "type": "heading",
        "value": "完整 Node.js 提交、查询和下载示例"
      },
      {
        "type": "paragraph",
        "value": "把下面内容保存为 generate.mjs，设置 WENYUN_API_KEY 后执行 `node generate.mjs`。接入视频或香蕉时替换提交端点与请求体。恢复已提交的任务请运行 `node generate.mjs task.json`，不要再次运行无参数的创建命令。"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile, writeFile } from 'node:fs/promises';\nimport { createWriteStream } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\n\n// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。\nfunction ownUrl(path) {\n  const url = new URL(path, ORIGIN);\n  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');\n  return url;\n}\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction nextInterval(response) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return 3000;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;\n}\n\nlet submitted;\nlet interval = 3000;\nif (process.argv[2]) {\n  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。\n  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));\n} else {\n  const response = await fetch(ORIGIN + '/v1/images/generations', {\n    method: 'POST',\n    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },\n    body: JSON.stringify({ model: 'gpt-image-2.5-flare', prompt: '浅色背景上的一杯橘子汽水', n: 1 }),\n    redirect: 'error',\n    signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');\n  interval = nextInterval(response);\n  await writeFile('task.json', JSON.stringify(submitted, null, 2));\n  console.log('任务已保存：', submitted.task_id);\n}\nif (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');\nconst pollUrl = ownUrl(submitted.poll_url);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() < deadline) {\n  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。\n  if (Date.now() + interval >= deadline) break;\n  await delay(interval);\n  let check;\n  try {\n    check = await fetch(pollUrl, {\n      headers, redirect: 'error', signal: AbortSignal.timeout(30000)\n    });\n  } catch {\n    // 查询网络错误只重试查询，绝不重新提交生成。\n    interval = Math.min(interval * 2, 15000);\n    continue;\n  }\n  interval = nextInterval(check);\n  if ([429, 500, 502, 503, 504].includes(check.status)) {\n    await check.body?.cancel();\n    interval = Math.max(interval, 5000);\n    continue;\n  }\n  task = await readJson(check);\n  if (task.status === 'succeeded') break;\n  if (['failed', 'cancelled'].includes(task.status)) {\n    throw new Error(task.error?.message || task.status);\n  }\n  if (!['pending', 'processing', 'waiting'].includes(task.status)) {\n    throw new Error('未识别的任务状态：' + task.status);\n  }\n}\nif (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');\nif (task.result_expired) throw new Error('结果文件已过期');\nawait writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));\nconst files = task.media ?? [];\nfor (const [index, item] of files.entries()) {\n  const file = await fetch(ownUrl(item.url), {\n    headers, redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);\n  if (!file.body) throw new Error('下载响应缺少文件内容');\n  const mime = item.content_type || file.headers.get('Content-Type') || '';\n  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';\n  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。\n  await pipeline(Readable.fromWeb(file.body), createWriteStream('result-' + index + '.' + ext));\n}\nconsole.log(files.length ? '文件已保存' : '没有归档文件，请读取 result.json 中的原生结果');\n"
      },
      {
        "type": "heading",
        "value": "失败与重新提交"
      },
      {
        "type": "paragraph",
        "value": "本地停止等待或关闭页面不等于取消服务器任务。不要通过刷新、网络自动重试或循环 POST 制造重复任务。只有确认原任务失败且处理好错误后，才发起新的生成请求。"
      }
    ]
  },
  {
    "id": "errors",
    "label": "常见问题",
    "title": "常见错误与排查",
    "lead": "先保留任务编号和错误正文，再判断需要修正参数、等待查询还是联系售后。",
    "blocks": [
      {
        "type": "heading",
        "value": "HTTP 状态与处理"
      },
      {
        "type": "table",
        "headers": [
          "状态",
          "可能原因",
          "建议"
        ],
        "rows": [
          [
            "400",
            "模型字段、请求格式或参数组合不正确",
            "核对具体模型章节，保留错误正文"
          ],
          [
            "401",
            "Key 缺失、错误或失效",
            "检查 Authorization: Bearer 与当前 Key"
          ],
          [
            "403",
            "令牌或分组权限限制",
            "检查模型权限和来源限制"
          ],
          [
            "404",
            "路径、模型或任务不匹配",
            "确认地址与原始 task_id，使用任务所属账户查询"
          ],
          [
            "409",
            "结果尚未就绪",
            "继续查询任务状态，再下载媒体"
          ],
          [
            "410",
            "生成文件已过期",
            "任务日志可能仍存在，但原结果需重新生成"
          ],
          [
            "413",
            "上传体积超过限制",
            "缩小或减少参考文件后再提交"
          ],
          [
            "429",
            "请求频率或并发受限",
            "等待后重试查询；创建请求先确认是否已受理"
          ],
          [
            "5xx",
            "代理、上游或服务临时异常",
            "优先查询原任务，保留时间、任务编号与错误信息"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "请求成功，但没有图片"
      },
      {
        "type": "list",
        "items": [
          "提交接口返回 202 时只有任务编号，先等待最终状态。",
          "Images、Gemini 和 Videos 的响应结构不同；香蕉的图片不在 data 中。",
          "检查 `result_expired`、`error.message`、`response_status_code`。",
          "原生响应可能只有文字或被拦截说明，不能仅凭 HTTP 200 认定已生成图片。"
        ]
      },
      {
        "type": "heading",
        "value": "参考图似乎没有生效"
      },
      {
        "type": "list",
        "items": [
          "Images 编辑需要文件上传；检查 image / image[] 字段和 multipart boundary。",
          "香蕉参考图放入 contents.parts.inlineData，检查 Base64、mimeType 和图片顺序。",
          "视频参考图放入 input_reference.image_url，并确认地址对供应商可读。",
          "描述“图一的主体、图二的风格”等具体用途；任务成功只说明请求完成，不保证每个编辑意图都被准确遵循。"
        ]
      },
      {
        "type": "heading",
        "value": "视频时长、清晰度不符合预期"
      },
      {
        "type": "paragraph",
        "value": "使用 Wan 章节的 `duration`、`resolution` 和 `aspect_ratio`；不要把 `seconds`、像素 size 或其他供应商的 mode 直接混入。若返回结果仍不符合，保留请求中的非敏感参数、模型名、任务编号和结果，交给售后定位。"
      },
      {
        "type": "heading",
        "value": "下载地址打不开"
      },
      {
        "type": "paragraph",
        "value": "`media[].url` 需要 Bearer 鉴权，用浏览器地址栏直接打开可能返回 401。使用带鉴权的下载请求；临时 preview_url 过期后也会失效。不要在 URL 中附上自己的 API Key。"
      },
      {
        "type": "heading",
        "value": "提交故障时提供哪些信息"
      },
      {
        "type": "list",
        "items": [
          "模型名称、请求端点、请求时间。",
          "task_id 或响应中的 X-New-Api-Task-Id。",
          "HTTP 状态、error.message 以及去掉 Key 后的参数。",
          "实际现象与预期效果。不要发送完整 API Key 或后台登录信息。"
        ]
      }
    ]
  }
];
