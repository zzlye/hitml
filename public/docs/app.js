const BASE_URL = "https://zzlye.xyz:60/v1";
const GEMINI_BASE_URL = "https://zzlye.xyz:60/v1beta";

const content = document.querySelector("#docs-content");
const routeLinks = [...document.querySelectorAll("[data-route]")];

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const inlineCode = (value) => `<code>${escapeHtml(value)}</code>`;
const codeBlock = (value, lang = "text") => `<pre class="code-block" data-lang="${lang}"><code>${escapeHtml(value.trim())}</code></pre>`;
const infoBox = (children, tone = "blue") => `<div class="callout callout--${tone}">${children}</div>`;

const table = (headers, rows) => `
  <div class="table-wrap">
    <table>
      <thead>
        <tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((item) => `<td>${item}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  </div>
`;

const renderImage2 = () => `
  <article class="doc-page">
    <h1>image2 接口</h1>
    <p class="lead">${inlineCode("gpt-image-2")} 为图片生成与图片编辑接口，兼容 OpenAI Images API 常见写法，基础地址统一使用 ${inlineCode(BASE_URL)}。</p>

    ${infoBox(`<strong>说明</strong>：把客户端里的 OpenAI 地址改成 ${inlineCode(BASE_URL)}，API Key 填写文运工坊获取的 key 即可。`)}

    <h2>文生图</h2>
    <h3>场景说明</h3>
    <p>根据文字提示词生成图片。适合头像、海报、插画、商品图、场景图等内容。</p>
    ${infoBox(`建议优先使用 ${inlineCode("size")} 指定尺寸；需要高清图时使用 ${inlineCode("gpt-image-2-4k")}。`)}

    <h3>接口地址</h3>
    ${codeBlock(`POST ${BASE_URL}/images/generations`)}
    ${table(["项目", "值"], [
      ["基础地址", inlineCode(BASE_URL)],
      ["端点", inlineCode("/images/generations")],
      ["方法", inlineCode("POST")],
      ["内容类型", inlineCode("application/json")],
      ["鉴权", inlineCode("Authorization: Bearer <API_KEY>")]
    ])}

    <h3>请求参数</h3>
    ${table(["参数", "类型", "必填", "默认", "说明"], [
      [inlineCode("model"), "string", "是", "-", `模型名称，例如 ${inlineCode("gpt-image-2")} / ${inlineCode("gpt-image-2-4k")}`],
      [inlineCode("prompt"), "string", "是", "-", "图片提示词，中文或英文都可以"],
      [inlineCode("size"), "string", "否", inlineCode("auto"), `输出尺寸，例如 ${inlineCode("1024x1024")} / ${inlineCode("1024x1536")} / ${inlineCode("1536x1024")} / ${inlineCode("auto")}`],
      [inlineCode("response_format"), "string", "否", inlineCode("url"), `${inlineCode("url")} 或 ${inlineCode("b64_json")}`],
      [inlineCode("n"), "number", "否", inlineCode("1"), "生成张数，当前建议保持 1"],
      [inlineCode("user"), "string", "否", "-", "可选用户标识，会透传到请求链路"]
    ])}
    ${infoBox(`${inlineCode("size")} 可以直接传 OpenAI 常见像素字符串；其它比例会自动对齐到最接近档位。`)}

    <h3>不支持/无效的参数</h3>
    ${table(["参数", "当前行为"], [
      [inlineCode("quality"), "会被忽略，默认按 medium 质量处理"],
      [inlineCode("background"), "会被忽略"],
      [inlineCode("moderation"), "会被忽略"],
      [inlineCode("output_format"), "会被忽略，返回格式由 response_format 控制"],
      [inlineCode("output_compression"), "会被忽略"],
      [inlineCode("style"), "会被忽略，不影响实际生成"]
    ])}

    <h3>尺寸路由</h3>
    <p>${inlineCode("gpt-image-2")} 支持常用比例，系统会按传入尺寸自动匹配到最近的分辨率档位。</p>
    ${table(["aspect_ratio", "1K", "2K", "4K"], [
      [inlineCode("1:1"), inlineCode("1024x1024"), inlineCode("2048x2048"), inlineCode("2880x2880")],
      [inlineCode("4:3"), inlineCode("1152x864"), inlineCode("2304x1728"), inlineCode("3264x2448")],
      [inlineCode("3:4"), inlineCode("864x1152"), inlineCode("1728x2304"), inlineCode("2448x3264")],
      [inlineCode("16:9"), inlineCode("1280x720"), inlineCode("2560x1440"), inlineCode("3840x2160")],
      [inlineCode("9:16"), inlineCode("720x1280"), inlineCode("1440x2560"), inlineCode("2160x3840")],
      [inlineCode("5:4"), inlineCode("1120x896"), inlineCode("2240x1792"), inlineCode("3200x2560")],
      [inlineCode("4:5"), inlineCode("896x1120"), inlineCode("1792x2240"), inlineCode("2560x3200")],
      [inlineCode("3:2"), inlineCode("1248x832"), inlineCode("2496x1664"), inlineCode("3504x2336")],
      [inlineCode("2:3"), inlineCode("832x1248"), inlineCode("1664x2496"), inlineCode("2336x3504")],
      [inlineCode("21:9"), inlineCode("1456x624"), inlineCode("3024x1296"), inlineCode("3696x1584")]
    ])}

    <h4>自动对齐示例</h4>
    ${table(["你传 size", "实际路由到"], [
      [inlineCode("1024x1024"), inlineCode("1024x1024")],
      [inlineCode("1024x1536"), inlineCode("832x1248")],
      [inlineCode("1536x1024"), inlineCode("1248x832")],
      [inlineCode("1920x1080"), inlineCode("1280x720")]
    ])}

    <h2>响应格式</h2>
    <h3>${inlineCode("response_format=url")}（默认）</h3>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "url": "https://example.com/generated-image.png"
    }
  ]
}`, "json")}
    ${infoBox(`返回 URL 时请及时下载或转存，临时链接可能会失效。`)}

    <h3>${inlineCode("response_format=b64_json")}</h3>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "b64_json": "iVBORw0KGgo..."
    }
  ]
}`, "json")}

    <h3>字段说明</h3>
    ${table(["字段", "类型", "说明"], [
      [inlineCode("url"), "string", "图片临时访问地址"],
      [inlineCode("b64_json"), "string", "base64 图片内容"],
      [inlineCode("created"), "number", "创建时间戳"]
    ])}

    <h2>代码示例</h2>
    <h3>Python · OpenAI SDK</h3>
    ${codeBlock(`from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxxxxxx",
    base_url="${BASE_URL}"
)

result = client.images.generate(
    model="gpt-image-2",
    prompt="湖蓝色调的山谷，清晨薄雾，极简插画风",
    size="1024x1024"
)

print(result.data[0].url)`, "python")}

    <h3>Python · requests</h3>
    ${codeBlock(`import requests

resp = requests.post(
    "${BASE_URL}/images/generations",
    headers={
        "Authorization": "Bearer sk-xxxxxxxx",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2",
        "prompt": "一张柔和灯光下的未来感工作台",
        "size": "1024x1024"
    },
    timeout=300
)

print(resp.json()["data"][0]["url"])`, "python")}

    <h3>cURL</h3>
    ${codeBlock(`curl "${BASE_URL}/images/generations" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "湖蓝色调的山谷，清晨薄雾，极简插画风",
    "size": "1024x1536"
  }'`, "bash")}

    <h3>Node.js · OpenAI SDK</h3>
    ${codeBlock(`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-xxxxxxxx",
  baseURL: "${BASE_URL}"
});

const result = await client.images.generate({
  model: "gpt-image-2",
  prompt: "一张商业摄影风格的银色跑车海报",
  size: "1536x1024"
});

console.log(result.data[0].url);`, "javascript")}

    <h3>浏览器 · fetch</h3>
    ${codeBlock(`const resp = await fetch("${BASE_URL}/images/generations", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk-xxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-image-2",
    prompt: "一张现代感很强的城市夜景海报",
    size: "1024x1024"
  })
});

const data = await resp.json();
console.log(data.data[0].url);`, "javascript")}
    ${infoBox(`浏览器端直接调用会暴露 API key，只适合演示或测试；正式使用建议走自己的后端。`)}

    <h2>图像编辑</h2>
    <p>上传参考图后，根据提示词对图片进行编辑、扩展或重绘。</p>

    <h3>接口地址</h3>
    ${codeBlock(`POST ${BASE_URL}/images/edits`)}
    ${table(["项目", "值"], [
      ["基础地址", inlineCode(BASE_URL)],
      ["端点", inlineCode("/images/edits")],
      ["方法", inlineCode("POST")],
      ["内容类型", inlineCode("multipart/form-data")],
      ["鉴权", inlineCode("Authorization: Bearer <API_KEY>")]
    ])}

    <h3>请求参数</h3>
    ${table(["参数", "类型", "必填", "默认", "说明"], [
      [inlineCode("image"), "file", "是", "-", "参考图，支持 PNG / JPEG / WebP"],
      [inlineCode("prompt"), "string", "是", "-", "描述希望修改成什么效果"],
      [inlineCode("model"), "string", "是", "-", "同文生图模型"],
      [inlineCode("size"), "string", "否", inlineCode("auto"), "不填时尽量沿用参考图比例"]
    ])}

    <h3>代码示例</h3>
    ${codeBlock(`curl "${BASE_URL}/images/edits" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -F "model=gpt-image-2" \\
  -F "image=@input.png" \\
  -F "prompt=把这张图改成杂志封面风格，增强光影层次"`, "bash")}

    ${codeBlock(`import requests

with open("input.png", "rb") as image:
    resp = requests.post(
        "${BASE_URL}/images/edits",
        headers={"Authorization": "Bearer sk-xxxxxxxx"},
        files={"image": image},
        data={
            "model": "gpt-image-2",
            "prompt": "改成日系水彩风，保留主体和构图"
        },
        timeout=300
    )

print(resp.json()["data"][0]["url"])`, "python")}

    <h2>常见问题</h2>
    <p><strong>问：OpenAI SDK 可以直接用吗？</strong></p>
    <p>答：可以，把 ${inlineCode("baseURL")} 改成 ${inlineCode(BASE_URL)}，模型名换成文运工坊支持的模型即可。</p>
    <p><strong>问：为什么 ${inlineCode("n=2")} 只返回 1 张？</strong></p>
    <p>答：当前建议一次生成 1 张，多张请循环调用接口。</p>
    <p><strong>问：图片 URL 过期了怎么办？</strong></p>
    <p>答：拿到响应后尽快下载或转存到自己的对象存储。</p>

    <h2>兼容性说明</h2>
    <p>相对 OpenAI Images API，主要差异集中在基础地址、部分忽略参数和当前只建议单张生成，其余常见字段保持兼容。</p>
    <footer>© 八方 AI · zzlye.xyz</footer>
  </article>
`;

const renderBanana = () => `
  <article class="doc-page">
    <h1>香蕉系列(Gemini 图像)接口</h1>
    ${infoBox(`<strong>说明</strong><br>Gemini 原生结构化接口使用 ${inlineCode("inline_data")} / ${inlineCode("file_data")} / ${inlineCode("candidates[].content.parts")}。`)}

    <h2>模型</h2>
    ${table(["外号", "模型名", "说明"], [
      ["香蕉pro", inlineCode("nano-banana-pro"), "画质档，适合成品图"],
      ["香蕉2", inlineCode("nano-banana-2"), "速度档，适合预览和批量尝试"]
    ])}
    <p>两者调用方式一致，只需要替换模型名；比例和分辨率通过请求体里的 ${inlineCode("imageConfig")} 指定。</p>

    <h2>鉴权</h2>
    <p>在请求头里填写文运工坊获取的 API Key：</p>
    ${codeBlock(`x-goog-api-key: <API_KEY>
Content-Type: application/json`)}
    <p>也兼容下面这种写法：</p>
    ${codeBlock(`Authorization: Bearer <API_KEY>`)}

    <h2>接口地址</h2>
    ${codeBlock(`POST ${GEMINI_BASE_URL}/models/{model}:generateContent
POST ${GEMINI_BASE_URL}/models/{model}:streamGenerateContent    # 流式`)}
    <p>${inlineCode("{model}")} 填模型名，例如 ${inlineCode("nano-banana-pro")}。</p>

    <h2>请求体</h2>
    ${codeBlock(`{
  "contents": [
    {
      "role": "user",
      "parts": [
        { "text": "提示词写这里" }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9",
      "imageSize": "2K"
    }
  }
}`, "json")}
    <ul>
      <li>${inlineCode("contents[].parts[].text")}：文本提示词，支持多轮内容。</li>
      <li>${inlineCode("generationConfig.imageConfig.aspectRatio")}：图片比例，例如 ${inlineCode("1:1")} / ${inlineCode("16:9")} / ${inlineCode("9:16")}。</li>
      <li>${inlineCode("generationConfig.imageConfig.imageSize")}：分辨率档位，例如 ${inlineCode("1K")} / ${inlineCode("2K")} / ${inlineCode("4K")}。</li>
      <li>${inlineCode("generationConfig.responseModalities")}：返回类型，例如 ${inlineCode("IMAGE")} 或 ${inlineCode("IMAGE, TEXT")}。</li>
    </ul>

    <h2>比例与分辨率</h2>
    <p>下面这些比例两个模型都支持，${inlineCode("1K")} / ${inlineCode("2K")} / ${inlineCode("4K")} 三档可选。</p>
    ${table(["比例", "1K", "2K", "4K"], [
      [inlineCode("1:1"), "1024×1024", "2048×2048", "4096×4096"],
      [inlineCode("16:9"), "1376×768", "2752×1536", "5504×3072"],
      [inlineCode("9:16"), "768×1376", "1536×2752", "3072×5504"],
      [inlineCode("4:3"), "1200×896", "2400×1792", "4800×3584"],
      [inlineCode("3:4"), "896×1200", "1792×2400", "3584×4800"],
      [inlineCode("3:2"), "1264×848", "2528×1696", "5056×3392"],
      [inlineCode("2:3"), "848×1264", "1696×2528", "3392×5056"],
      [inlineCode("5:4"), "1152×928", "2304×1856", "4608×3712"],
      [inlineCode("4:5"), "928×1152", "1856×2304", "3712×4608"],
      [inlineCode("21:9"), "1584×672", "3168×1344", "6336×2688"]
    ])}

    <h3>极端宽幅 / 长条（仅香蕉2）</h3>
    <p>${inlineCode("nano-banana-2")} 额外支持超宽和长条比例；${inlineCode("nano-banana-pro")} 不建议使用这几类比例。</p>
    ${table(["比例（仅香蕉2）", "1K", "2K", "4K"], [
      [inlineCode("8:1"), "2928×352", "5856×704", "11712×1408"],
      [inlineCode("4:1"), "2064×512", "4128×1024", "8256×2048"],
      [inlineCode("1:4"), "512×2064", "1024×4128", "2048×8256"],
      [inlineCode("1:8"), "352×2928", "704×5856", "1408×11712"]
    ])}
    ${infoBox(`${inlineCode("imageSize")} 的 K 一律大写，比例和分辨率组合不匹配时会自动对齐到下一档。`, "green")}

    <h2>auto / 缺省</h2>
    <p>${inlineCode("aspectRatio")} 和 ${inlineCode("imageSize")} 都可以省略，或直接填写 ${inlineCode("auto")}。最实用的写法是只填比例，系统按默认分辨率输出。</p>
    <p>纯文生图想要确定尺寸时，建议显式传 ${inlineCode("aspectRatio")} + ${inlineCode("imageSize")}。</p>

    <h2>返回模式</h2>
    ${table(["responseModalities", "返回内容", "读取位置"], [
      [inlineCode('["IMAGE"]'), "base64 图片", inlineCode("candidates[0].content.parts[0].inline_data.data")],
      [inlineCode('["TEXT"]'), "图片 URL", inlineCode("candidates[0].content.parts[0].text")],
      [inlineCode('["IMAGE", "TEXT"]'), "base64 + URL", "上面两个位置都会返回"],
      ["不传", `同 ${inlineCode('["IMAGE"]')}`, "-"]
    ])}
    ${infoBox(`如果同时需要 base64 和 URL，可以使用 ${inlineCode('["IMAGE", "TEXT"]')}；读取时通常按 parts 顺序处理。`, "green")}

    <h2>图生图</h2>
    <h3>输入图片 base64</h3>
    ${codeBlock(`curl -X POST "${GEMINI_BASE_URL}/models/nano-banana-pro:generateContent" \\
  -H "x-goog-api-key: $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "把这张图改成日系水彩风，保留主体和构图" },
          {
            "inline_data": {
              "mime_type": "image/png",
              "data": "<BASE64_INPUT_IMAGE>"
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "3:4",
        "imageSize": "1K"
      }
    }
  }'`, "bash")}

    <h3>输入图片 URL</h3>
    ${codeBlock(`curl -X POST "${GEMINI_BASE_URL}/models/nano-banana-2:generateContent" \\
  -H "x-goog-api-key: $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "把这张图做成杂志封面风格" },
          {
            "file_data": {
              "mime_type": "image/png",
              "file_uri": "https://example.com/input.png"
            }
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "4:3",
        "imageSize": "2K"
      }
    }
  }'`, "bash")}

    <h3>同时返回 base64 和 URL（推荐兼容写法）</h3>
    ${codeBlock(`curl -X POST "${GEMINI_BASE_URL}/models/nano-banana-pro:generateContent" \\
  -H "x-goog-api-key: $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "一张银色跑车的城市夜景海报，高反差，高质感" }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE", "TEXT"],
      "imageConfig": {
        "aspectRatio": "1:1",
        "imageSize": "1K"
      }
    }
  }'`, "bash")}

    <h2>香蕉pro 还是 香蕉2？</h2>
    <p>两者接口一致，区别主要在输出取向：${inlineCode("nano-banana-pro")} 更偏画质和成品图，${inlineCode("nano-banana-2")} 更偏速度和预览。需要超宽幅或长条比例时，优先使用香蕉2。</p>
    <footer>© 八方 AI · zzlye.xyz</footer>
  </article>
`;

const getRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, "");
  return route === "banana" ? "banana" : "image2";
};

const render = () => {
  // 根据 hash 切换两份静态文档，方便直接复制链接给用户。
  const route = getRoute();
  content.innerHTML = route === "banana" ? renderBanana() : renderImage2();
  routeLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.route === route));
  document.title = route === "banana" ? "香蕉系列接口" : "image2 接口";
  window.scrollTo({ top: 0 });
};

window.addEventListener("hashchange", render);
render();
