// 图片与视频接口正文统一维护，网页和Markdown导出共用此内容。
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
        "value": "接入方式与鉴权"
      },
      {
        "type": "table",
        "headers": [
          "项目",
          "值"
        ],
        "rows": [
          [
            "服务地址",
            "https://api.zzlye.xyz"
          ],
          [
            "创建",
            "POST /v1/images/generations"
          ],
          [
            "鉴权",
            "Authorization: Bearer <API_KEY>"
          ],
          [
            "推荐模式",
            "Prefer: respond-async：提交 → 保存task_id → 查询poll_url → succeeded → 下载"
          ],
          [
            "同步模式",
            "省略异步开关，等待原生生成结果；长时间生成优先使用异步"
          ],
          [
            "任务查询",
            "GET /v1/tasks/{task_id}，使用创建账户的有效Key"
          ]
        ]
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
        "type": "note",
        "value": "cURL示例采用Bash语法；PowerShell请用curl.exe并调整变量与换行。Key仅保存在本机环境变量或后端，不嵌入公开网页。尖括号内容需要替换；示例任务编号和时间用于说明返回结构。"
      },
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
        "value": "同步响应与结果保存"
      },
      {
        "type": "paragraph",
        "value": "省略Prefer请求头和async查询参数时，成功响应直接返回以下Images结构。HTTP 2xx不保证一定包含可用图片，应校验实际图片项。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"created\": 1790900000,\n  \"data\": [\n    {\n      \"b64_json\": \"<BASE64_IMAGE_DATA>\"\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "读取方式"
        ],
        "rows": [
          [
            "created",
            "integer",
            "Unix时间戳，单位秒"
          ],
          [
            "data",
            "array",
            "逐项读取图片结果"
          ],
          [
            "data[].b64_json",
            "string，可选",
            "纯Base64，解码成图片文件"
          ],
          [
            "data[].url",
            "string，可选",
            "可能是HTTPS地址或Data URL，按实际格式处理"
          ],
          [
            "data[].revised_prompt",
            "string，可选",
            "提示词修订；并非所有型号提供"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "b64_json使用Base64解码；data:image/...;base64,...先移除逗号前的前缀再解码。HTTPS结果地址通常有有效期，应及时保存；向第三方存储下载时不要携带平台Key。"
      },
      {
        "type": "heading",
        "value": "异步：提交、查询与下载"
      },
      {
        "type": "paragraph",
        "value": "前面的创建示例已带Prefer: respond-async。创建成功返回HTTP 202，先保存task_id和poll_url。成功后的result仍是本页的原生响应结构，不需要在服务器额外转换协议。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"object\": \"image_generation\",\n  \"status\": \"pending\",\n  \"created\": 1790900000,\n  \"model\": \"gpt-image-2.5-flare\",\n  \"poll_url\": \"/v1/tasks/async_example\",\n  \"request_path\": \"/v1/images/generations\"\n}"
      },
      {
        "type": "table",
        "headers": [
          "提交字段或响应头",
          "含义"
        ],
        "rows": [
          [
            "task_id / id",
            "网关任务编号，保存后用于恢复"
          ],
          [
            "poll_url",
            "查询路径；相对路径以https://api.zzlye.xyz为基准"
          ],
          [
            "Location",
            "HTTP响应头中的查询地址"
          ],
          [
            "Retry-After",
            "建议的查询等待时间；秒数或HTTP日期"
          ],
          [
            "status",
            "pending不代表生成完成"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/tasks/async_example' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "code",
        "lang": "text",
        "value": "pending → processing → waiting → succeeded → 下载media\n                     ↘ failed / cancelled → 停止并检查error"
      },
      {
        "type": "paragraph",
        "value": "pending、processing、waiting继续查询同一任务；中间状态可能被跳过。succeeded读取结果，failed或cancelled停止，未知状态保留响应并排查。HTTP 200只表示查询成功。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"succeeded\",\n  \"result_expired\": false,\n  \"expires_at\": 1790986520,\n  \"response_status_code\": 200,\n  \"content_type\": \"application/json\",\n  \"result\": {\n    \"created\": 1790900000,\n    \"data\": [\n      {\n        \"b64_json\": \"<BASE64_IMAGE_DATA>\"\n      }\n    ]\n  },\n  \"media\": [\n    {\n      \"kind\": \"image\",\n      \"content_type\": \"image/png\",\n      \"url\": \"/v1/tasks/async_example/media/0\"\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "完成字段",
          "说明"
        ],
        "rows": [
          [
            "result",
            "生成接口的原生响应，按本页同步结构读取"
          ],
          [
            "media[].url",
            "归档文件地址，使用Bearer鉴权下载"
          ],
          [
            "media[].content_type",
            "文件格式提示，也检查下载响应的Content-Type"
          ],
          [
            "result_expired",
            "true表示归档结果过期；任务成功不等于文件仍可下载"
          ],
          [
            "expires_at",
            "结果保留截止时间，Unix秒；以实际返回为准"
          ],
          [
            "preview_url",
            "若返回则为临时展示地址，不代表永久公开文件"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/tasks/async_example/media/0' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.png"
      },
      {
        "type": "heading",
        "value": "失败响应与重试边界"
      },
      {
        "type": "paragraph",
        "value": "请求失败可能返回非2xx和error；已受理的任务也可能在查询时返回failed。以下只展示结构，具体错误码和文字以实际响应为准。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"error\": {\n    \"message\": \"模型参数不匹配，请检查请求字段\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_parameter\"\n  }\n}"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"failed\",\n  \"error\": {\n    \"message\": \"参考素材读取失败\"\n  }\n}"
      },
      {
        "type": "table",
        "headers": [
          "状态或现象",
          "处理"
        ],
        "rows": [
          [
            "400",
            "核对模型、字段类型、尺寸和图片实际格式"
          ],
          [
            "401 / 403",
            "检查Bearer鉴权、令牌和模型权限；不要持续重试"
          ],
          [
            "413",
            "请求或参考图过大，减少素材体积"
          ],
          [
            "429 / 临时5xx",
            "查询按Retry-After退避重试；创建不盲目重发"
          ],
          [
            "404 / 410",
            "核对任务归属、路径及结果是否过期"
          ],
          [
            "failed / cancelled",
            "停止查询，记录task_id和error；处理原因后再决定是否重新创建"
          ],
          [
            "创建超时、断网",
            "先确认原任务是否已受理，不把客户端超时当成重复生成的依据"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "Node.js完整示例：生成到保存文件"
      },
      {
        "type": "paragraph",
        "value": "使用Node.js 22或更新版本，无额外依赖。保存为generate.mjs，在独立目录设置WENYUN_API_KEY后运行。脚本只创建一次，收到任务立即保存到task.json；查询临时故障退避，结果流式下载，完整下载前使用.part扩展名。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "node generate.mjs\n# 恢复同一任务，不重复生成\nnode generate.mjs task.json"
      },
      {
        "type": "note",
        "value": "30分钟为客户端等待期限，不是服务端生成时限。超时后可继续查询原任务。已有task.json时直接运行创建命令会停止，避免覆盖编号；确需新任务请使用新目录。"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile, writeFile, rename, rm } from 'node:fs/promises';\nimport { createWriteStream, existsSync } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\n\n// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。\nfunction ownUrl(path) {\n  const url = new URL(path, ORIGIN);\n  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');\n  return url;\n}\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction nextInterval(response) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return 3000;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;\n}\n\nlet submitted;\nlet interval = 3000;\nif (process.argv[2]) {\n  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。\n  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));\n} else {\n  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录创建新任务');\n  const response = await fetch(ORIGIN + '/v1/images/generations', {\n    method: 'POST',\n    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },\n    body: JSON.stringify({ model: 'gpt-image-2.5-flare', prompt: '浅色背景上的一杯橘子汽水', n: 1 }),\n    redirect: 'error',\n    signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');\n  interval = nextInterval(response);\n  console.log('请保留任务编号：', submitted.task_id);\n  await writeFile('task.json', JSON.stringify(submitted, null, 2), { flag: 'wx' });\n  console.log('任务已保存：', submitted.task_id);\n}\nif (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');\nconst pollUrl = ownUrl(submitted.poll_url);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() < deadline) {\n  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。\n  if (Date.now() + interval >= deadline) break;\n  await delay(interval);\n  let check;\n  try {\n    check = await fetch(pollUrl, {\n      headers, redirect: 'error', signal: AbortSignal.timeout(30000)\n    });\n  } catch {\n    // 查询网络错误只重试查询，绝不重新提交生成。\n    interval = Math.min(interval * 2, 30000);\n    continue;\n  }\n  if (check.status === 429 || check.status >= 500) {\n    await check.body?.cancel();\n    interval = Math.max(nextInterval(check), Math.min(interval * 2, 30000));\n    continue;\n  }\n  interval = nextInterval(check);\n  task = await readJson(check);\n  if (task.status === 'succeeded') break;\n  if (['failed', 'cancelled'].includes(task.status)) {\n    throw new Error(task.error?.message || task.status);\n  }\n  if (!['pending', 'processing', 'waiting'].includes(task.status)) {\n    throw new Error('未识别的任务状态：' + task.status);\n  }\n}\nif (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');\nif (task.result_expired) throw new Error('结果文件已过期');\nawait writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));\nconst files = task.media ?? [];\nfor (const [index, item] of files.entries()) {\n  const file = await fetch(ownUrl(item.url), {\n    headers, redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);\n  if (!file.body) throw new Error('下载响应缺少文件内容');\n  const mime = item.content_type || file.headers.get('Content-Type') || '';\n  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';\n  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。\n  const name = 'result-' + index + '.' + ext;\n  try {\n    await pipeline(Readable.fromWeb(file.body), createWriteStream(name + '.part'));\n    await rename(name + '.part', name);\n  } catch (error) {\n    await rm(name + '.part', { force: true });\n    throw error;\n  }\n}\nif (!files.length) throw new Error('没有归档媒体，请检查result.json中的原生图片结果或失败原因');\nconsole.log('文件已保存');\n"
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
        "value": "接入方式与鉴权"
      },
      {
        "type": "table",
        "headers": [
          "项目",
          "值"
        ],
        "rows": [
          [
            "服务地址",
            "https://api.zzlye.xyz"
          ],
          [
            "创建",
            "POST /v1beta/models/nano-banana-2:generateContent"
          ],
          [
            "鉴权",
            "Authorization: Bearer <API_KEY>"
          ],
          [
            "推荐模式",
            "Prefer: respond-async：提交 → 保存task_id → 查询poll_url → succeeded → 下载"
          ],
          [
            "同步模式",
            "省略异步开关，等待原生生成结果；长时间生成优先使用异步"
          ],
          [
            "任务查询",
            "GET /v1/tasks/{task_id}，使用创建账户的有效Key"
          ]
        ]
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
        "type": "note",
        "value": "cURL示例采用Bash语法；PowerShell请用curl.exe并调整变量与换行。Key仅保存在本机环境变量或后端，不嵌入公开网页。尖括号内容需要替换；示例任务编号和时间用于说明返回结构。"
      },
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
        "value": "同步响应与结果保存"
      },
      {
        "type": "paragraph",
        "value": "省略Prefer请求头和async查询参数时，成功响应直接返回以下Gemini原生结构。HTTP 2xx不保证一定包含可用图片，应校验实际图片项。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"candidates\": [\n    {\n      \"content\": {\n        \"parts\": [\n          {\n            \"inlineData\": {\n              \"mimeType\": \"image/png\",\n              \"data\": \"<BASE64_IMAGE_DATA>\"\n            }\n          }\n        ]\n      }\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "读取方式"
        ],
        "rows": [
          [
            "candidates",
            "array",
            "遍历所有候选项，不固定只取第一个"
          ],
          [
            "content.parts",
            "array",
            "同一响应可能同时包含文字和图片"
          ],
          [
            "inlineData.mimeType",
            "string",
            "按实际MIME保存扩展名"
          ],
          [
            "inlineData.data",
            "string",
            "纯Base64，客户端解码后写入文件"
          ],
          [
            "finishReason / promptFeedback",
            "可选",
            "无图片时检查结束原因或内容拦截提示"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "遍历candidates[].content.parts[]，对包含inlineData.data的项解码。文本响应、空candidates或仅有promptFeedback都不应标记为出图成功。"
      },
      {
        "type": "heading",
        "value": "异步：提交、查询与下载"
      },
      {
        "type": "paragraph",
        "value": "前面的创建示例已带Prefer: respond-async。创建成功返回HTTP 202，先保存task_id和poll_url。成功后的result仍是本页的原生响应结构，不需要在服务器额外转换协议。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"object\": \"gemini_image_generation\",\n  \"status\": \"pending\",\n  \"created\": 1790900000,\n  \"model\": \"nano-banana-2\",\n  \"poll_url\": \"/v1/tasks/async_example\",\n  \"request_path\": \"/v1beta/models/nano-banana-2:generateContent\"\n}"
      },
      {
        "type": "table",
        "headers": [
          "提交字段或响应头",
          "含义"
        ],
        "rows": [
          [
            "task_id / id",
            "网关任务编号，保存后用于恢复"
          ],
          [
            "poll_url",
            "查询路径；相对路径以https://api.zzlye.xyz为基准"
          ],
          [
            "Location",
            "HTTP响应头中的查询地址"
          ],
          [
            "Retry-After",
            "建议的查询等待时间；秒数或HTTP日期"
          ],
          [
            "status",
            "pending不代表生成完成"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/tasks/async_example' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "code",
        "lang": "text",
        "value": "pending → processing → waiting → succeeded → 下载media\n                     ↘ failed / cancelled → 停止并检查error"
      },
      {
        "type": "paragraph",
        "value": "pending、processing、waiting继续查询同一任务；中间状态可能被跳过。succeeded读取结果，failed或cancelled停止，未知状态保留响应并排查。HTTP 200只表示查询成功。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"succeeded\",\n  \"result_expired\": false,\n  \"expires_at\": 1790986520,\n  \"response_status_code\": 200,\n  \"content_type\": \"application/json\",\n  \"result\": {\n    \"candidates\": [\n      {\n        \"content\": {\n          \"parts\": [\n            {\n              \"inlineData\": {\n                \"mimeType\": \"image/png\",\n                \"data\": \"<BASE64_IMAGE_DATA>\"\n              }\n            }\n          ]\n        }\n      }\n    ]\n  },\n  \"media\": [\n    {\n      \"kind\": \"image\",\n      \"content_type\": \"image/png\",\n      \"url\": \"/v1/tasks/async_example/media/0\"\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "完成字段",
          "说明"
        ],
        "rows": [
          [
            "result",
            "生成接口的原生响应，按本页同步结构读取"
          ],
          [
            "media[].url",
            "归档文件地址，使用Bearer鉴权下载"
          ],
          [
            "media[].content_type",
            "文件格式提示，也检查下载响应的Content-Type"
          ],
          [
            "result_expired",
            "true表示归档结果过期；任务成功不等于文件仍可下载"
          ],
          [
            "expires_at",
            "结果保留截止时间，Unix秒；以实际返回为准"
          ],
          [
            "preview_url",
            "若返回则为临时展示地址，不代表永久公开文件"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/tasks/async_example/media/0' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.png"
      },
      {
        "type": "heading",
        "value": "失败响应与重试边界"
      },
      {
        "type": "paragraph",
        "value": "请求失败可能返回非2xx和error；已受理的任务也可能在查询时返回failed。以下只展示结构，具体错误码和文字以实际响应为准。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"error\": {\n    \"message\": \"模型参数不匹配，请检查请求字段\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_parameter\"\n  }\n}"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"failed\",\n  \"error\": {\n    \"message\": \"参考素材读取失败\"\n  }\n}"
      },
      {
        "type": "table",
        "headers": [
          "状态或现象",
          "处理"
        ],
        "rows": [
          [
            "400",
            "核对模型、字段类型、尺寸和图片实际格式"
          ],
          [
            "401 / 403",
            "检查Bearer鉴权、令牌和模型权限；不要持续重试"
          ],
          [
            "413",
            "请求或参考图过大，减少素材体积"
          ],
          [
            "429 / 临时5xx",
            "查询按Retry-After退避重试；创建不盲目重发"
          ],
          [
            "404 / 410",
            "核对任务归属、路径及结果是否过期"
          ],
          [
            "failed / cancelled",
            "停止查询，记录task_id和error；处理原因后再决定是否重新创建"
          ],
          [
            "创建超时、断网",
            "先确认原任务是否已受理，不把客户端超时当成重复生成的依据"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "Node.js完整示例：生成到保存文件"
      },
      {
        "type": "paragraph",
        "value": "使用Node.js 22或更新版本，无额外依赖。保存为generate.mjs，在独立目录设置WENYUN_API_KEY后运行。脚本只创建一次，收到任务立即保存到task.json；查询临时故障退避，结果流式下载，完整下载前使用.part扩展名。"
      },
      {
        "type": "paragraph",
        "value": "参考图示例需要同目录的reference.png。纯文生图时删除读取reference.png及对应inlineData项即可；恢复任务时不会重新读取参考图。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "node generate.mjs\n# 恢复同一任务，不重复生成\nnode generate.mjs task.json"
      },
      {
        "type": "note",
        "value": "30分钟为客户端等待期限，不是服务端生成时限。超时后可继续查询原任务。已有task.json时直接运行创建命令会停止，避免覆盖编号；确需新任务请使用新目录。"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile, writeFile, rename, rm } from 'node:fs/promises';\nimport { createWriteStream, existsSync } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\n\n// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。\nfunction ownUrl(path) {\n  const url = new URL(path, ORIGIN);\n  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');\n  return url;\n}\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction nextInterval(response) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return 3000;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;\n}\n\nlet submitted;\nlet interval = 3000;\nif (process.argv[2]) {\n  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。\n  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));\n} else {\n  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录创建新任务');\n  const image = await readFile('reference.png');\n  const response = await fetch(ORIGIN + '/v1beta/models/nano-banana-2:generateContent', {\n    method: 'POST',\n    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },\n    body: JSON.stringify({\n      contents: [{ role: 'user', parts: [\n        { text: '保持主体外观，替换为纯白背景' },\n        { inlineData: { mimeType: 'image/png', data: image.toString('base64') } }\n      ] }],\n      generationConfig: { responseModalities: ['TEXT', 'IMAGE'],\n        imageConfig: { aspectRatio: '1:1', imageSize: '1K' } }\n    }),\n    redirect: 'error',\n    signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');\n  interval = nextInterval(response);\n  console.log('请保留任务编号：', submitted.task_id);\n  await writeFile('task.json', JSON.stringify(submitted, null, 2), { flag: 'wx' });\n  console.log('任务已保存：', submitted.task_id);\n}\nif (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');\nconst pollUrl = ownUrl(submitted.poll_url);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() < deadline) {\n  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。\n  if (Date.now() + interval >= deadline) break;\n  await delay(interval);\n  let check;\n  try {\n    check = await fetch(pollUrl, {\n      headers, redirect: 'error', signal: AbortSignal.timeout(30000)\n    });\n  } catch {\n    // 查询网络错误只重试查询，绝不重新提交生成。\n    interval = Math.min(interval * 2, 30000);\n    continue;\n  }\n  if (check.status === 429 || check.status >= 500) {\n    await check.body?.cancel();\n    interval = Math.max(nextInterval(check), Math.min(interval * 2, 30000));\n    continue;\n  }\n  interval = nextInterval(check);\n  task = await readJson(check);\n  if (task.status === 'succeeded') break;\n  if (['failed', 'cancelled'].includes(task.status)) {\n    throw new Error(task.error?.message || task.status);\n  }\n  if (!['pending', 'processing', 'waiting'].includes(task.status)) {\n    throw new Error('未识别的任务状态：' + task.status);\n  }\n}\nif (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');\nif (task.result_expired) throw new Error('结果文件已过期');\nawait writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));\nconst files = task.media ?? [];\nfor (const [index, item] of files.entries()) {\n  const file = await fetch(ownUrl(item.url), {\n    headers, redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);\n  if (!file.body) throw new Error('下载响应缺少文件内容');\n  const mime = item.content_type || file.headers.get('Content-Type') || '';\n  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';\n  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。\n  const name = 'result-' + index + '.' + ext;\n  try {\n    await pipeline(Readable.fromWeb(file.body), createWriteStream(name + '.part'));\n    await rename(name + '.part', name);\n  } catch (error) {\n    await rm(name + '.part', { force: true });\n    throw error;\n  }\n}\nif (!files.length) throw new Error('没有归档媒体，请检查result.json中的原生图片结果或失败原因');\nconsole.log('文件已保存');\n"
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
        "value": "接入方式与鉴权"
      },
      {
        "type": "table",
        "headers": [
          "项目",
          "值"
        ],
        "rows": [
          [
            "服务地址",
            "https://api.zzlye.xyz"
          ],
          [
            "创建",
            "POST /v1/images/generations"
          ],
          [
            "鉴权",
            "Authorization: Bearer <API_KEY>"
          ],
          [
            "推荐模式",
            "Prefer: respond-async：提交 → 保存task_id → 查询poll_url → succeeded → 下载"
          ],
          [
            "同步模式",
            "省略异步开关，等待原生生成结果；长时间生成优先使用异步"
          ],
          [
            "任务查询",
            "GET /v1/tasks/{task_id}，使用创建账户的有效Key"
          ]
        ]
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
        "type": "note",
        "value": "cURL示例采用Bash语法；PowerShell请用curl.exe并调整变量与换行。Key仅保存在本机环境变量或后端，不嵌入公开网页。尖括号内容需要替换；示例任务编号和时间用于说明返回结构。"
      },
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
        "value": "同步响应与结果保存"
      },
      {
        "type": "paragraph",
        "value": "省略Prefer请求头和async查询参数时，成功响应直接返回以下Images结构。HTTP 2xx不保证一定包含可用图片，应校验实际图片项。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"created\": 1790900000,\n  \"data\": [\n    {\n      \"b64_json\": \"<BASE64_IMAGE_DATA>\"\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "读取方式"
        ],
        "rows": [
          [
            "created",
            "integer",
            "Unix时间戳，单位秒"
          ],
          [
            "data",
            "array",
            "逐项读取图片结果"
          ],
          [
            "data[].b64_json",
            "string，可选",
            "纯Base64，解码成图片文件"
          ],
          [
            "data[].url",
            "string，可选",
            "可能是HTTPS地址或Data URL，按实际格式处理"
          ],
          [
            "data[].revised_prompt",
            "string，可选",
            "提示词修订；并非所有型号提供"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "b64_json使用Base64解码；data:image/...;base64,...先移除逗号前的前缀再解码。HTTPS结果地址通常有有效期，应及时保存；向第三方存储下载时不要携带平台Key。"
      },
      {
        "type": "heading",
        "value": "异步：提交、查询与下载"
      },
      {
        "type": "paragraph",
        "value": "前面的创建示例已带Prefer: respond-async。创建成功返回HTTP 202，先保存task_id和poll_url。成功后的result仍是本页的原生响应结构，不需要在服务器额外转换协议。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"object\": \"image_generation\",\n  \"status\": \"pending\",\n  \"created\": 1790900000,\n  \"model\": \"seedream-5-pro\",\n  \"poll_url\": \"/v1/tasks/async_example\",\n  \"request_path\": \"/v1/images/generations\"\n}"
      },
      {
        "type": "table",
        "headers": [
          "提交字段或响应头",
          "含义"
        ],
        "rows": [
          [
            "task_id / id",
            "网关任务编号，保存后用于恢复"
          ],
          [
            "poll_url",
            "查询路径；相对路径以https://api.zzlye.xyz为基准"
          ],
          [
            "Location",
            "HTTP响应头中的查询地址"
          ],
          [
            "Retry-After",
            "建议的查询等待时间；秒数或HTTP日期"
          ],
          [
            "status",
            "pending不代表生成完成"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/tasks/async_example' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "code",
        "lang": "text",
        "value": "pending → processing → waiting → succeeded → 下载media\n                     ↘ failed / cancelled → 停止并检查error"
      },
      {
        "type": "paragraph",
        "value": "pending、processing、waiting继续查询同一任务；中间状态可能被跳过。succeeded读取结果，failed或cancelled停止，未知状态保留响应并排查。HTTP 200只表示查询成功。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"succeeded\",\n  \"result_expired\": false,\n  \"expires_at\": 1790986520,\n  \"response_status_code\": 200,\n  \"content_type\": \"application/json\",\n  \"result\": {\n    \"created\": 1790900000,\n    \"data\": [\n      {\n        \"b64_json\": \"<BASE64_IMAGE_DATA>\"\n      }\n    ]\n  },\n  \"media\": [\n    {\n      \"kind\": \"image\",\n      \"content_type\": \"image/png\",\n      \"url\": \"/v1/tasks/async_example/media/0\"\n    }\n  ]\n}"
      },
      {
        "type": "table",
        "headers": [
          "完成字段",
          "说明"
        ],
        "rows": [
          [
            "result",
            "生成接口的原生响应，按本页同步结构读取"
          ],
          [
            "media[].url",
            "归档文件地址，使用Bearer鉴权下载"
          ],
          [
            "media[].content_type",
            "文件格式提示，也检查下载响应的Content-Type"
          ],
          [
            "result_expired",
            "true表示归档结果过期；任务成功不等于文件仍可下载"
          ],
          [
            "expires_at",
            "结果保留截止时间，Unix秒；以实际返回为准"
          ],
          [
            "preview_url",
            "若返回则为临时展示地址，不代表永久公开文件"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/tasks/async_example/media/0' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.png"
      },
      {
        "type": "heading",
        "value": "失败响应与重试边界"
      },
      {
        "type": "paragraph",
        "value": "请求失败可能返回非2xx和error；已受理的任务也可能在查询时返回failed。以下只展示结构，具体错误码和文字以实际响应为准。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"error\": {\n    \"message\": \"模型参数不匹配，请检查请求字段\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_parameter\"\n  }\n}"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"failed\",\n  \"error\": {\n    \"message\": \"参考素材读取失败\"\n  }\n}"
      },
      {
        "type": "table",
        "headers": [
          "状态或现象",
          "处理"
        ],
        "rows": [
          [
            "400",
            "核对模型、字段类型、尺寸和图片实际格式"
          ],
          [
            "401 / 403",
            "检查Bearer鉴权、令牌和模型权限；不要持续重试"
          ],
          [
            "413",
            "请求或参考图过大，减少素材体积"
          ],
          [
            "429 / 临时5xx",
            "查询按Retry-After退避重试；创建不盲目重发"
          ],
          [
            "404 / 410",
            "核对任务归属、路径及结果是否过期"
          ],
          [
            "failed / cancelled",
            "停止查询，记录task_id和error；处理原因后再决定是否重新创建"
          ],
          [
            "创建超时、断网",
            "先确认原任务是否已受理，不把客户端超时当成重复生成的依据"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "Node.js完整示例：生成到保存文件"
      },
      {
        "type": "paragraph",
        "value": "使用Node.js 22或更新版本，无额外依赖。保存为generate.mjs，在独立目录设置WENYUN_API_KEY后运行。脚本只创建一次，收到任务立即保存到task.json；查询临时故障退避，结果流式下载，完整下载前使用.part扩展名。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "node generate.mjs\n# 恢复同一任务，不重复生成\nnode generate.mjs task.json"
      },
      {
        "type": "note",
        "value": "30分钟为客户端等待期限，不是服务端生成时限。超时后可继续查询原任务。已有task.json时直接运行创建命令会停止，避免覆盖编号；确需新任务请使用新目录。"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile, writeFile, rename, rm } from 'node:fs/promises';\nimport { createWriteStream, existsSync } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\n\n// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。\nfunction ownUrl(path) {\n  const url = new URL(path, ORIGIN);\n  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');\n  return url;\n}\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction nextInterval(response) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return 3000;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;\n}\n\nlet submitted;\nlet interval = 3000;\nif (process.argv[2]) {\n  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。\n  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));\n} else {\n  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录创建新任务');\n  const response = await fetch(ORIGIN + '/v1/images/generations', {\n    method: 'POST',\n    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },\n    body: JSON.stringify({ model: 'seedream-5-pro', prompt: '浅色背景上的一杯橘子汽水', n: 1 }),\n    redirect: 'error',\n    signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');\n  interval = nextInterval(response);\n  console.log('请保留任务编号：', submitted.task_id);\n  await writeFile('task.json', JSON.stringify(submitted, null, 2), { flag: 'wx' });\n  console.log('任务已保存：', submitted.task_id);\n}\nif (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');\nconst pollUrl = ownUrl(submitted.poll_url);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() < deadline) {\n  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。\n  if (Date.now() + interval >= deadline) break;\n  await delay(interval);\n  let check;\n  try {\n    check = await fetch(pollUrl, {\n      headers, redirect: 'error', signal: AbortSignal.timeout(30000)\n    });\n  } catch {\n    // 查询网络错误只重试查询，绝不重新提交生成。\n    interval = Math.min(interval * 2, 30000);\n    continue;\n  }\n  if (check.status === 429 || check.status >= 500) {\n    await check.body?.cancel();\n    interval = Math.max(nextInterval(check), Math.min(interval * 2, 30000));\n    continue;\n  }\n  interval = nextInterval(check);\n  task = await readJson(check);\n  if (task.status === 'succeeded') break;\n  if (['failed', 'cancelled'].includes(task.status)) {\n    throw new Error(task.error?.message || task.status);\n  }\n  if (!['pending', 'processing', 'waiting'].includes(task.status)) {\n    throw new Error('未识别的任务状态：' + task.status);\n  }\n}\nif (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');\nif (task.result_expired) throw new Error('结果文件已过期');\nawait writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));\nconst files = task.media ?? [];\nfor (const [index, item] of files.entries()) {\n  const file = await fetch(ownUrl(item.url), {\n    headers, redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);\n  if (!file.body) throw new Error('下载响应缺少文件内容');\n  const mime = item.content_type || file.headers.get('Content-Type') || '';\n  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';\n  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。\n  const name = 'result-' + index + '.' + ext;\n  try {\n    await pipeline(Readable.fromWeb(file.body), createWriteStream(name + '.part'));\n    await rename(name + '.part', name);\n  } catch (error) {\n    await rm(name + '.part', { force: true });\n    throw error;\n  }\n}\nif (!files.length) throw new Error('没有归档媒体，请检查result.json中的原生图片结果或失败原因');\nconsole.log('文件已保存');\n"
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
    "title": "Wan 3.0 视频生成 API",
    "lead": "文生视频、图片与音视频参考、任务查询及视频下载。默认使用Videos异步任务，同时提供网关异步模式。",
    "blocks": [
      {
        "type": "heading",
        "value": "1. 基础信息与接入流程"
      },
      {
        "type": "table",
        "headers": [
          "项目",
          "说明"
        ],
        "rows": [
          [
            "API Base URL",
            "`https://api.zzlye.xyz/v1`"
          ],
          [
            "创建视频",
            "`POST /v1/videos`"
          ],
          [
            "查询视频",
            "`GET /v1/videos/{id}`"
          ],
          [
            "下载视频",
            "`GET /v1/videos/{id}/content`"
          ],
          [
            "主要接入模式",
            "异步：创建 → 保存id → 查询 → completed → 下载"
          ],
          [
            "模型权限",
            "以当前Key在`GET /v1/models`返回的名称为准"
          ]
        ]
      },
      {
        "type": "table",
        "headers": [
          "模型",
          "分辨率",
          "时长与参考素材"
        ],
        "rows": [
          [
            "`wan-3.0`",
            "`720p`",
            "整数秒，最长30秒；最多2张参考图；支持视频和音频URL参考"
          ],
          [
            "`wan-3.0-1080p`",
            "`1080p`",
            "独立高清型号；不自动继承720p版本的时长和素材数量限制，具体组合以该型号支持情况为准"
          ]
        ]
      },
      {
        "type": "note",
        "value": "本页主示例使用wan-3.0的720p协议。模型名称中的连字符和后缀必须原样保留。本文的task_example、async_example和示例时间仅用于说明返回结构。"
      },
      {
        "type": "heading",
        "value": "2. 鉴权与请求格式"
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
        "type": "code",
        "lang": "http",
        "value": "Authorization: Bearer <API_KEY>\nContent-Type: application/json"
      },
      {
        "type": "paragraph",
        "value": "创建使用JSON，查询和下载只需要Authorization。cURL示例采用Bash换行语法；PowerShell请使用curl.exe并调整变量及换行。Key放在服务端或本机环境变量中，不写入公开网页。"
      },
      {
        "type": "heading",
        "value": "3. 请求参数"
      },
      {
        "type": "table",
        "headers": [
          "字段",
          "类型",
          "必填",
          "规则"
        ],
        "rows": [
          [
            "`model`",
            "string",
            "是",
            "`wan-3.0`；高清型号使用完整名称`wan-3.0-1080p`"
          ],
          [
            "`prompt`",
            "string",
            "是",
            "描述主体、动作、场景、镜头和素材用途"
          ],
          [
            "`duration`",
            "integer",
            "是",
            "视频秒数；wan-3.0使用正整数，最大30；不要用字符串或混传seconds"
          ],
          [
            "`resolution`",
            "string",
            "建议显式传入",
            "wan-3.0填写`720p`；1080p型号填写`1080p`"
          ],
          [
            "`aspect_ratio`",
            "string",
            "否",
            "例如`16:9`、`9:16`、`1:1`；是比例，不是像素尺寸"
          ],
          [
            "`image_urls`",
            "string[]",
            "否",
            "公网图片URL数组；wan-3.0最多2张"
          ],
          [
            "`video_urls`",
            "string[]",
            "否",
            "公网参考视频URL数组；不要推断其数量限制与图片相同"
          ],
          [
            "`audio_urls`",
            "string[]",
            "否",
            "公网参考音频URL数组；用于音频参考，不是generate_audio开关"
          ]
        ]
      },
      {
        "type": "table",
        "headers": [
          "推荐字段",
          "旧字段别名"
        ],
        "rows": [
          [
            "`image_urls`",
            "`images`、`reference_image_urls`"
          ],
          [
            "`video_urls`",
            "`videos`、`reference_videos`"
          ],
          [
            "`audio_urls`",
            "`audios`、`reference_audios`"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "新接入只使用推荐字段，不混传同类素材的新旧名称。旧工具可能生成input_reference，请改用本页的image_urls；字段能被网关转发不代表上游一定采用它。seed、generate_audio等未在本页承诺的参数，不作为基础接入的必要字段。"
      },
      {
        "type": "heading",
        "value": "4. 文生视频"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/videos' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  --data '{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍，镜头自然推进\",\n  \"duration\": 10,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"16:9\"\n}'"
      },
      {
        "type": "paragraph",
        "value": "这个请求不添加Prefer: respond-async。视频接口本身就是异步接口：创建返回的是视频任务，不是MP4文件。保存返回的id，再按第8节查询。"
      },
      {
        "type": "heading",
        "value": "5. 单图、双图与30秒图生视频"
      },
      {
        "type": "paragraph",
        "value": "单图参考：把图片地址放入image_urls，并在prompt中明确要求保留的身份、商品外观和构图。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/videos' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  --data '{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"保持参考图中商品的造型和颜色，镜头从正面缓慢移动到侧面，光线柔和，不新增文字\",\n  \"duration\": 10,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"9:16\",\n  \"image_urls\": [\n    \"https://cdn.example.com/product.jpg\"\n  ]\n}'"
      },
      {
        "type": "paragraph",
        "value": "双图参考：数组顺序就是提示词中“第一张图”“第二张图”的顺序。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"第一张图用于人物身份，第二张图用于服装设计，人物自然转身展示衣服，镜头稳定\",\n  \"duration\": 15,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"9:16\",\n  \"image_urls\": [\n    \"https://cdn.example.com/person.jpg\",\n    \"https://cdn.example.com/outfit.jpg\"\n  ]\n}"
      },
      {
        "type": "paragraph",
        "value": "30秒示例适用于wan-3.0的720p版本。较长镜头可以在提示词中按时间段组织动作；这不是分段调用，也不需要提交三次任务。"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"保留参考图主体。前10秒缓慢推近展示全景，中间10秒展示商品细节，最后10秒回到稳定正面构图，镜头连贯自然\",\n  \"duration\": 30,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"16:9\",\n  \"image_urls\": [\n    \"https://cdn.example.com/product.jpg\"\n  ]\n}"
      },
      {
        "type": "heading",
        "value": "6. 视频、音频参考与素材要求"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/videos' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  --data '{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"保持参考图人物外观，参考视频的镜头节奏，让人物动作与参考音频节拍自然配合\",\n  \"duration\": 15,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"16:9\",\n  \"image_urls\": [\n    \"https://cdn.example.com/person.jpg\"\n  ],\n  \"video_urls\": [\n    \"https://cdn.example.com/motion.mp4\"\n  ],\n  \"audio_urls\": [\n    \"https://cdn.example.com/rhythm.mp3\"\n  ]\n}'"
      },
      {
        "type": "list",
        "items": [
          "URL必须能被生成服务直接读取，使用公开的HTTP或HTTPS媒体文件地址。",
          "不依赖Cookie、登录状态、Referer或额外请求头；地址直接返回媒体，不返回网页或预览页。",
          "图片、视频和音频的Content-Type应与实际内容一致。",
          "签名地址在排队、提交及生成期间都要有效，不使用即将过期的链接。",
          "本地磁盘路径不能直接传入JSON；先上传到可公开读取的存储。",
          "不要把Base64或data:字符串放入URL数组。无需为接入本协议增加视频转码或Base64包装。",
          "请求中只传本次需要的素材类型；同类字段不要重复传别名。"
        ]
      },
      {
        "type": "heading",
        "value": "7. 创建任务响应"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"task_example\",\n  \"object\": \"video\",\n  \"model\": \"wan-3.0\",\n  \"status\": \"queued\",\n  \"progress\": 0,\n  \"created_at\": 1790900000\n}"
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
            "`id`",
            "string",
            "本站视频任务编号，后续查询与下载使用此值"
          ],
          [
            "`task_id`",
            "string，可选",
            "旧客户端可能收到的兼容字段；优先使用id，不要求两者同时存在"
          ],
          [
            "`object`",
            "string",
            "`video`"
          ],
          [
            "`model`",
            "string",
            "本次请求的公开模型名称"
          ],
          [
            "`status`",
            "string",
            "通常为queued；具体含义见状态表"
          ],
          [
            "`progress`",
            "integer",
            "0—100的进度提示；不是带百分号的字符串，也不代表剩余秒数"
          ],
          [
            "`created_at`",
            "integer",
            "Unix时间戳，单位秒"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "创建成功接收2xx响应（通常200或202），同时校验JSON中的id。HTTP成功只代表任务已受理，不代表视频生成完成。不要把上游私有编号替代本站id。"
      },
      {
        "type": "heading",
        "value": "8. 查询任务与状态机"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/videos/task_example' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"task_example\",\n  \"object\": \"video\",\n  \"model\": \"wan-3.0\",\n  \"status\": \"in_progress\",\n  \"progress\": 45,\n  \"created_at\": 1790900000\n}"
      },
      {
        "type": "code",
        "lang": "text",
        "value": "queued → in_progress → completed → GET /v1/videos/{id}/content\n                    ↘ failed    → 记录错误并停止查询"
      },
      {
        "type": "table",
        "headers": [
          "status",
          "含义",
          "客户端动作"
        ],
        "rows": [
          [
            "`queued`",
            "等待处理",
            "继续查询相同id"
          ],
          [
            "`in_progress`",
            "正在提交或生成",
            "继续查询，不重新创建"
          ],
          [
            "`completed`",
            "生成成功",
            "开始下载文件"
          ],
          [
            "`failed`",
            "生成失败",
            "保存响应和错误信息，停止查询"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "建议从5秒一次开始查询；遇到Retry-After遵循服务端提示，429和临时5xx只重试查询并退避。设置本地等待期限，超时后保留id继续查询，而不是再次POST创建。未知状态不要当成成功。"
      },
      {
        "type": "heading",
        "value": "9. 成功响应与结果字段"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"task_example\",\n  \"object\": \"video\",\n  \"model\": \"wan-3.0\",\n  \"status\": \"completed\",\n  \"progress\": 100,\n  \"created_at\": 1790900000,\n  \"completed_at\": 1790900120\n}"
      },
      {
        "type": "paragraph",
        "value": "completed_at是生成完成时间，单位秒。不同协议可能附带video_urls、metadata或其他扩展字段，但这些不是本站客户端必须依赖的契约。本站不会保证暴露上游私有下载地址；统一使用内容下载接口。"
      },
      {
        "type": "heading",
        "value": "10. 下载与保存视频"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 300 \\\n  'https://api.zzlye.xyz/v1/videos/task_example/content' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  --output result.mp4"
      },
      {
        "type": "list",
        "items": [
          "只在status为completed后下载，响应正文是媒体字节，不是JSON。",
          "内容接口需要Bearer鉴权，直接粘贴到浏览器地址栏可能返回401。",
          "保存到自己的存储；任务记录存在不代表归档文件永久有效，过期文件可能返回410。",
          "程序采用流式写文件，避免把完整视频一次性加载到内存。",
          "下载网络错误可重试同一文件；不要因此重新生成视频。"
        ]
      },
      {
        "type": "heading",
        "value": "11. 失败响应与排错"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"task_example\",\n  \"object\": \"video\",\n  \"model\": \"wan-3.0\",\n  \"status\": \"failed\",\n  \"progress\": 100,\n  \"created_at\": 1790900000,\n  \"error\": {\n    \"message\": \"参考素材读取失败，请检查媒体地址\",\n    \"code\": \"generation_failed\"\n  }\n}"
      },
      {
        "type": "paragraph",
        "value": "此处为失败结构示意，具体message和code由实际错误决定，error字段可能省略。始终以status判断是否失败；HTTP 200的查询响应也可能携带failed。"
      },
      {
        "type": "table",
        "headers": [
          "HTTP状态",
          "可能原因",
          "处理方式"
        ],
        "rows": [
          [
            "400",
            "参数类型、时长、分辨率或素材地址不匹配",
            "核对模型表与字段，保存错误正文"
          ],
          [
            "401",
            "Key无效或缺失",
            "检查Bearer请求头及当前Key"
          ],
          [
            "402 / 403",
            "余额、额度或权限限制",
            "结合error中的原因检查账户余额、令牌与分组权限"
          ],
          [
            "404",
            "路径错误、任务不存在或不属于当前账户",
            "核对完整id和创建时使用的账户"
          ],
          [
            "400 / 409",
            "视频未完成就请求下载",
            "先查询到completed；不同下载入口的状态码可能不同"
          ],
          [
            "410",
            "归档结果已过期",
            "及时保存文件；先确认结果确实过期再决定是否重新生成"
          ],
          [
            "429",
            "限流或并发过高",
            "尊重Retry-After；降低查询频率"
          ],
          [
            "502 / 503 / 504",
            "上游、代理或网络临时异常",
            "查询请求可退避重试；创建超时先确认原任务是否已经受理"
          ]
        ]
      },
      {
        "type": "heading",
        "value": "12. 网关异步模式：与Videos任务的区别"
      },
      {
        "type": "table",
        "headers": [
          "模式",
          "创建方式",
          "编号与查询",
          "完成状态"
        ],
        "rows": [
          [
            "Videos任务（本页默认）",
            "不添加异步请求头",
            "`task_...` → `/v1/videos/{id}`",
            "`completed`"
          ],
          [
            "网关异步任务",
            "添加`Prefer: respond-async`或`?async=true`",
            "`async_...` → 返回的`poll_url`，通常`/v1/tasks/{id}`",
            "`succeeded`"
          ]
        ]
      },
      {
        "type": "paragraph",
        "value": "两种方式均能异步完成生成，但返回对象与状态机不同。按创建响应选择一套流程，不把completed与succeeded、task_编号与async_编号混用。下面给出网关模式的完整请求和结果结构。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/videos' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" \\\n  -H 'Content-Type: application/json' \\\n  -H 'Prefer: respond-async' \\\n  --data '{\n  \"model\": \"wan-3.0\",\n  \"prompt\": \"晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍，镜头自然推进\",\n  \"duration\": 10,\n  \"resolution\": \"720p\",\n  \"aspect_ratio\": \"16:9\"\n}'"
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"object\": \"video_generation\",\n  \"status\": \"pending\",\n  \"created\": 1790900000,\n  \"model\": \"wan-3.0\",\n  \"poll_url\": \"/v1/tasks/async_example\",\n  \"request_path\": \"/v1/videos\"\n}"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/tasks/async_example' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\""
      },
      {
        "type": "table",
        "headers": [
          "网关status",
          "含义"
        ],
        "rows": [
          [
            "pending / processing / waiting",
            "排队、处理或等待视频任务完成，继续查询"
          ],
          [
            "succeeded",
            "已完成，检查result_expired并读取media"
          ],
          [
            "failed / cancelled",
            "终止查询，读取error.message"
          ]
        ]
      },
      {
        "type": "code",
        "lang": "json",
        "value": "{\n  \"id\": \"async_example\",\n  \"task_id\": \"async_example\",\n  \"status\": \"succeeded\",\n  \"result_expired\": false,\n  \"expires_at\": 1790986520,\n  \"response_status_code\": 200,\n  \"content_type\": \"application/json\",\n  \"result\": {\n    \"id\": \"task_example\",\n    \"object\": \"video\",\n    \"model\": \"wan-3.0\",\n    \"status\": \"completed\",\n    \"progress\": 100,\n    \"created_at\": 1790900000,\n    \"completed_at\": 1790900120\n  },\n  \"media\": [\n    {\n      \"url\": \"/v1/tasks/async_example/media/0\",\n      \"kind\": \"video\",\n      \"content_type\": \"video/mp4\"\n    }\n  ]\n}"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "curl --fail-with-body --max-time 300 'https://api.zzlye.xyz/v1/tasks/async_example/media/0' \\\n  -H \"Authorization: Bearer $WENYUN_API_KEY\" --output result.mp4"
      },
      {
        "type": "paragraph",
        "value": "media[].url需要鉴权；preview_url若存在是临时展示地址。result_expired为true时停止下载。网关模式的通用示例在“任务与下载”章节，第13、14节直接使用Videos任务接口。"
      },
      {
        "type": "heading",
        "value": "13. Node.js完整示例"
      },
      {
        "type": "paragraph",
        "value": "Node.js 22或更新版本，无额外依赖。保存为video.mjs，设置WENYUN_API_KEY，在新目录执行。此示例使用默认Videos任务，不加Prefer请求头。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "node video.mjs\n# 恢复同一任务\nnode video.mjs video-task.json"
      },
      {
        "type": "code",
        "lang": "javascript",
        "value": "import { readFile, writeFile, rename, rm } from 'node:fs/promises';\nimport { createWriteStream, existsSync } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\nconst taskFile = process.argv[2] || 'video-task.json';\nconst request = {\n  model: 'wan-3.0',\n  prompt: '晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍',\n  duration: 10, resolution: '720p', aspect_ratio: '16:9'\n  // 图生视频时增加 image_urls: ['https://你的域名/参考图.jpg']。\n};\n\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction retryAfter(response, fallback = 5000) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return fallback;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms >= 0 ? Math.max(ms, 1000) : fallback;\n}\n\nlet submitted;\nlet interval = 5000;\nif (process.argv[2]) {\n  // 恢复时只读取已保存的编号，不再次创建收费任务。\n  submitted = JSON.parse(await readFile(taskFile, 'utf8'));\n} else {\n  if (existsSync(taskFile)) throw new Error('已有video-task.json，请传入此文件恢复，或在新目录创建新任务');\n  // 创建请求只发送一次；连接超时也不自动重发。\n  const response = await fetch(ORIGIN + '/v1/videos', {\n    method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },\n    body: JSON.stringify(request), redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (!submitted.id && !submitted.task_id) throw new Error('响应缺少视频任务id');\n  console.log('请保留任务编号：', submitted.id || submitted.task_id);\n  await writeFile(taskFile, JSON.stringify(submitted, null, 2), { flag: 'wx' });\n  interval = retryAfter(response);\n}\nconst id = submitted.id || submitted.task_id;\nif (typeof id !== 'string' || !id || id.startsWith('async_')) {\n  throw new Error('需要Videos任务id；async_编号请使用网关任务示例');\n}\nconst endpoint = ORIGIN + '/v1/videos/' + encodeURIComponent(id);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() + interval < deadline) {\n  await delay(interval);\n  let response;\n  try {\n    response = await fetch(endpoint, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });\n  } catch {\n    // 网络故障只重试查询，不重新提交生成。\n    interval = Math.min(interval * 2, 30000);\n    continue;\n  }\n  if (response.status === 429 || response.status >= 500) {\n    interval = Math.max(retryAfter(response), Math.min(interval * 2, 30000));\n    await response.body?.cancel();\n    continue;\n  }\n  task = await readJson(response);\n  interval = retryAfter(response);\n  console.log('任务状态：', task.status, '进度：', task.progress ?? '未提供');\n  if (task.status === 'completed') break;\n  if (task.status === 'failed') throw new Error(task.error?.message || '视频生成失败：' + id);\n  if (!['queued', 'in_progress'].includes(task.status)) throw new Error('未知视频状态：' + task.status);\n}\nif (task?.status !== 'completed') throw new Error('本地等待结束；传入任务文件继续查询，服务端任务不会因此取消');\nawait writeFile('video-result.json', JSON.stringify(task, null, 2));\n\n// 流式下载；完成前使用临时扩展名，避免把不完整视频误认为成品。\nconst response = await fetch(endpoint + '/content', {\n  headers, redirect: 'error', signal: AbortSignal.timeout(300000)\n});\nif (!response.ok) throw new Error('视频下载失败，HTTP ' + response.status + '；可以用原任务文件重试');\nif (!response.body) throw new Error('下载响应缺少文件内容');\nconst mime = (response.headers.get('Content-Type') || '').split(';')[0];\nif (mime && !mime.startsWith('video/') && mime !== 'application/octet-stream') {\n  throw new Error('下载返回的不是视频：' + mime);\n}\ntry {\n  await pipeline(Readable.fromWeb(response.body), createWriteStream('result.mp4.part'));\n  await rename('result.mp4.part', 'result.mp4');\n} catch (error) {\n  await rm('result.mp4.part', { force: true });\n  throw error;\n}\nconsole.log('已保存 result.mp4');\n"
      },
      {
        "type": "heading",
        "value": "14. Python完整示例"
      },
      {
        "type": "paragraph",
        "value": "Python 3.10或更新版本，仅使用标准库，无需pip安装。保存为video.py，与Node.js示例任选一个运行，不要为同一目标同时运行两个创建示例。"
      },
      {
        "type": "code",
        "lang": "bash",
        "value": "python video.py\n# 恢复同一任务\npython video.py video-task.json"
      },
      {
        "type": "code",
        "lang": "python",
        "value": "import json\nimport os\nimport sys\nimport time\nimport urllib.error\nimport urllib.parse\nimport urllib.request\nfrom datetime import datetime, timezone\nfrom email.utils import parsedate_to_datetime\nfrom pathlib import Path\n\nORIGIN = 'https://api.zzlye.xyz'\nKEY = os.environ.get('WENYUN_API_KEY')\nif not KEY:\n    raise SystemExit('请设置 WENYUN_API_KEY')\nTASK_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else 'video-task.json')\nBODY = {\n    'model': 'wan-3.0',\n    'prompt': '晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍',\n    'duration': 10, 'resolution': '720p', 'aspect_ratio': '16:9',\n    # 图生视频时增加 image_urls: ['https://你的域名/参考图.jpg']。\n}\n\n\nclass NoRedirect(urllib.request.HTTPRedirectHandler):\n    # 不向跳转后的其他地址转发鉴权信息。\n    def redirect_request(self, req, fp, code, msg, headers, newurl):\n        return None\n\n\nOPENER = urllib.request.build_opener(NoRedirect())\n\n\ndef open_request(path, data=None, timeout=30):\n    headers = {'Authorization': 'Bearer ' + KEY}\n    if data is not None:\n        headers['Content-Type'] = 'application/json'\n    request = urllib.request.Request(ORIGIN + path, data=data, headers=headers)\n    return OPENER.open(request, timeout=timeout)\n\n\ndef retry_after(headers, fallback=5):\n    value = headers.get('Retry-After')\n    if not value:\n        return fallback\n    try:\n        return max(float(value), 1)\n    except ValueError:\n        try:\n            return max((parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds(), 1)\n        except (TypeError, ValueError, OverflowError):\n            return fallback\n\n\ndef main():\n    interval = 5\n    if len(sys.argv) > 1:\n        # 传入保存的任务文件恢复查询，不创建新任务。\n        submitted = json.loads(TASK_FILE.read_text(encoding='utf-8'))\n    else:\n        if TASK_FILE.exists():\n            raise RuntimeError('已有video-task.json，请传入此文件恢复，或在新目录创建新任务')\n        data = json.dumps(BODY, ensure_ascii=False).encode('utf-8')\n        # 创建只尝试一次；超时不等于服务端没有受理。\n        with open_request('/v1/videos', data, timeout=120) as response:\n            submitted = json.load(response)\n            interval = retry_after(response.headers)\n        task_id = submitted.get('id') or submitted.get('task_id')\n        if not task_id:\n            raise RuntimeError('响应缺少视频任务id')\n        print('请保留任务编号：', task_id)\n        with TASK_FILE.open('x', encoding='utf-8') as file:\n            json.dump(submitted, file, ensure_ascii=False, indent=2)\n    task_id = submitted.get('id') or submitted.get('task_id')\n    if not isinstance(task_id, str) or not task_id or task_id.startswith('async_'):\n        raise RuntimeError('需要Videos任务id；async_编号请使用网关任务示例')\n    endpoint = '/v1/videos/' + urllib.parse.quote(task_id, safe='')\n    deadline = time.monotonic() + 30 * 60\n    task = {}\n    while time.monotonic() + interval < deadline:\n        time.sleep(interval)\n        try:\n            with open_request(endpoint) as response:\n                task = json.load(response)\n                interval = retry_after(response.headers)\n        except urllib.error.HTTPError as error:\n            if error.code == 429 or error.code >= 500:\n                interval = max(retry_after(error.headers), min(interval * 2, 30))\n                error.close()\n                continue\n            raise\n        except (urllib.error.URLError, TimeoutError, ConnectionError):\n            interval = min(interval * 2, 30)\n            continue\n        print('任务状态：', task.get('status'), '进度：', task.get('progress', '未提供'))\n        if task.get('status') == 'completed':\n            break\n        if task.get('status') == 'failed':\n            raise RuntimeError((task.get('error') or {}).get('message') or '视频生成失败：' + task_id)\n        if task.get('status') not in ('queued', 'in_progress'):\n            raise RuntimeError('未知视频状态：' + str(task.get('status')))\n    if task.get('status') != 'completed':\n        raise RuntimeError('本地等待结束；传入任务文件继续查询，服务端任务不会因此取消')\n    Path('video-result.json').write_text(json.dumps(task, ensure_ascii=False, indent=2), encoding='utf-8')\n    partial = Path('result.mp4.part')\n    try:\n        # 固定大小分块下载，不把整个视频加载到内存。\n        with open_request(endpoint + '/content', timeout=300) as response:\n            mime = response.headers.get('Content-Type', '').split(';')[0]\n            if mime and not mime.startswith('video/') and mime != 'application/octet-stream':\n                raise RuntimeError('下载返回的不是视频：' + mime)\n            with partial.open('wb') as file:\n                while True:\n                    chunk = response.read(1024 * 1024)\n                    if not chunk:\n                        break\n                    file.write(chunk)\n        partial.replace('result.mp4')\n    finally:\n        partial.unlink(missing_ok=True)\n    print('已保存 result.mp4')\n\n\nif __name__ == '__main__':\n    try:\n        main()\n    except urllib.error.HTTPError as error:\n        # 输出有限长度的错误正文，避免把大型非JSON响应写满终端。\n        print('HTTP', error.code, error.read(4096).decode('utf-8', errors='replace'), file=sys.stderr)\n        error.close()\n        sys.exit(1)\n    except Exception as error:\n        print(str(error), file=sys.stderr)\n        sys.exit(1)\n"
      },
      {
        "type": "note",
        "value": "两个示例立即保存video-task.json，等待completed后流式写入result.mp4；失败停止，429和临时查询故障退避。30分钟是客户端等待期限，不取消服务端任务。下载失败可用原任务文件重试，不重新生成。Python的timeout用于阻塞网络操作，Node.js的AbortSignal用于请求超时。"
      },
      {
        "type": "heading",
        "value": "15. 重试、计费与接入检查"
      },
      {
        "type": "list",
        "items": [
          "生成费用按平台实际价格、时长和账户分组结算，不把文档示例中的时长当作固定价格。",
          "POST创建不做自动重试。连接断开、504或本地超时，不证明服务端没有接收任务。",
          "收到id后立即落盘，后续继续查询这个id。查询和下载的重试不应再触发创建。",
          "只有确认原任务失败并处理原因后，才考虑创建新任务。不要承诺所有失败都会按同一种方式退款。",
          "向售后提供模型、任务id、请求时间、HTTP状态和去掉Key的参数，避免发送完整API Key。"
        ]
      },
      {
        "type": "links",
        "items": [
          {
            "id": "tasks",
            "label": "网关异步任务完整示例"
          },
          {
            "id": "errors",
            "label": "统一错误与排查"
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
        "value": "import { readFile, writeFile, rename, rm } from 'node:fs/promises';\nimport { createWriteStream, existsSync } from 'node:fs';\nimport { Readable } from 'node:stream';\nimport { pipeline } from 'node:stream/promises';\nimport { setTimeout as delay } from 'node:timers/promises';\n\nconst ORIGIN = 'https://api.zzlye.xyz';\nconst key = process.env.WENYUN_API_KEY;\nif (!key) throw new Error('请设置 WENYUN_API_KEY');\nconst headers = { Authorization: 'Bearer ' + key };\n\n// 只向本站地址发送 Key，不把鉴权头转发给第三方结果地址。\nfunction ownUrl(path) {\n  const url = new URL(path, ORIGIN);\n  if (url.origin !== ORIGIN) throw new Error('收到非本站的鉴权接口地址');\n  return url;\n}\nasync function readJson(response) {\n  const text = await response.text();\n  let value;\n  try { value = JSON.parse(text); }\n  catch { throw new Error('接口未返回 JSON，HTTP ' + response.status); }\n  if (!response.ok) throw new Error(value.error?.message || value.message || 'HTTP ' + response.status);\n  return value;\n}\nfunction nextInterval(response) {\n  const value = response.headers.get('Retry-After');\n  if (!value) return 3000;\n  const seconds = Number(value);\n  const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - Date.now();\n  return Number.isFinite(ms) && ms > 0 ? Math.max(ms, 1000) : 3000;\n}\n\nlet submitted;\nlet interval = 3000;\nif (process.argv[2]) {\n  // 传入已保存的任务文件时只恢复查询，不重新生成或扣费。\n  submitted = JSON.parse(await readFile(process.argv[2], 'utf8'));\n} else {\n  if (existsSync('task.json')) throw new Error('已有task.json，请传入此文件恢复，或在新目录创建新任务');\n  const response = await fetch(ORIGIN + '/v1/images/generations', {\n    method: 'POST',\n    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'respond-async' },\n    body: JSON.stringify({ model: 'gpt-image-2.5-flare', prompt: '浅色背景上的一杯橘子汽水', n: 1 }),\n    redirect: 'error',\n    signal: AbortSignal.timeout(120000)\n  });\n  submitted = await readJson(response);\n  if (response.status !== 202) throw new Error('未收到预期的异步任务响应');\n  interval = nextInterval(response);\n  console.log('请保留任务编号：', submitted.task_id);\n  await writeFile('task.json', JSON.stringify(submitted, null, 2), { flag: 'wx' });\n  console.log('任务已保存：', submitted.task_id);\n}\nif (!submitted.poll_url || !submitted.task_id) throw new Error('任务缺少 task_id 或 poll_url');\nconst pollUrl = ownUrl(submitted.poll_url);\nconst deadline = Date.now() + 30 * 60 * 1000;\nlet task;\nwhile (Date.now() < deadline) {\n  // 尊重服务端的查询间隔；超过本地等待期限后仍保留任务编号。\n  if (Date.now() + interval >= deadline) break;\n  await delay(interval);\n  let check;\n  try {\n    check = await fetch(pollUrl, {\n      headers, redirect: 'error', signal: AbortSignal.timeout(30000)\n    });\n  } catch {\n    // 查询网络错误只重试查询，绝不重新提交生成。\n    interval = Math.min(interval * 2, 30000);\n    continue;\n  }\n  if (check.status === 429 || check.status >= 500) {\n    await check.body?.cancel();\n    interval = Math.max(nextInterval(check), Math.min(interval * 2, 30000));\n    continue;\n  }\n  interval = nextInterval(check);\n  task = await readJson(check);\n  if (task.status === 'succeeded') break;\n  if (['failed', 'cancelled'].includes(task.status)) {\n    throw new Error(task.error?.message || task.status);\n  }\n  if (!['pending', 'processing', 'waiting'].includes(task.status)) {\n    throw new Error('未识别的任务状态：' + task.status);\n  }\n}\nif (task?.status !== 'succeeded') throw new Error('等待已结束，可运行 node generate.mjs task.json 恢复查询');\nif (task.result_expired) throw new Error('结果文件已过期');\nawait writeFile('result.json', JSON.stringify(task.result ?? task, null, 2));\nconst files = task.media ?? [];\nfor (const [index, item] of files.entries()) {\n  const file = await fetch(ownUrl(item.url), {\n    headers, redirect: 'error', signal: AbortSignal.timeout(120000)\n  });\n  if (!file.ok) throw new Error('下载失败，HTTP ' + file.status);\n  if (!file.body) throw new Error('下载响应缺少文件内容');\n  const mime = item.content_type || file.headers.get('Content-Type') || '';\n  const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4' })[mime.split(';')[0].trim()] || 'bin';\n  // 流式写入图片和视频，避免把整个视频文件一次性加载到内存。\n  const name = 'result-' + index + '.' + ext;\n  try {\n    await pipeline(Readable.fromWeb(file.body), createWriteStream(name + '.part'));\n    await rename(name + '.part', name);\n  } catch (error) {\n    await rm(name + '.part', { force: true });\n    throw error;\n  }\n}\nif (!files.length) throw new Error('没有归档媒体，请检查result.json中的原生图片结果或失败原因');\nconsole.log('文件已保存');\n"
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
