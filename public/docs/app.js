const BASE_URL = "https://zzlye.xyz:60/v1";
const GEMINI_BASE_URL = "https://zzlye.xyz:60/v1beta";

const content = document.querySelector("#docs-content");
const navLinks = [...document.querySelectorAll("[data-route]")];

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const codeBlock = (value) => `<pre class="code-block"><code>${escapeHtml(value.trim())}</code></pre>`;
const inlineCode = (value) => `<code class="inline-code">${escapeHtml(value)}</code>`;

const table = (headers, rows) => `
  <div class="doc-table-wrap">
    <table class="doc-table">
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
  <header class="doc-hero">
    <p class="doc-kicker">API DOCUMENT</p>
    <h1>GPT Image 2 接口</h1>
    <p>用于文生图、图像编辑和扩展的图片接口。基础地址使用文运工坊地址，鉴权方式兼容常见 OpenAI Images API 客户端。</p>
  </header>

  <section class="doc-section">
    <h2>基础地址</h2>
    <p>所有请求都从下面的地址开始：</p>
    ${codeBlock(BASE_URL)}
  </section>

  <section class="doc-section">
    <h2>鉴权</h2>
    <p>请求头里填写自己的 key：</p>
    ${codeBlock(`Authorization: Bearer <API_KEY>
Content-Type: application/json`)}
  </section>

  <section class="doc-section">
    <h2>模型</h2>
    ${table(["模型名称", "适合场景", "常用分辨率"], [
      [inlineCode("gpt-image-2"), "普通图片生成与编辑", "1K"],
      [inlineCode("gpt-image-2-4k"), "高清图片生成与编辑", "1K / 2K / 4K"]
    ])}
  </section>

  <section class="doc-section">
    <h2>文生图</h2>
    <p>根据文字提示词生成图片。</p>
    ${codeBlock(`POST ${BASE_URL}/images/generations`)}
    ${table(["参数", "类型", "必填", "说明"], [
      [inlineCode("model"), "string", "是", "模型名称，例如 gpt-image-2"],
      [inlineCode("prompt"), "string", "是", "图片提示词"],
      [inlineCode("size"), "string", "否", "输出尺寸，例如 1024x1024、1024x1536、1536x1024，也可以使用 auto"],
      [inlineCode("response_format"), "string", "否", "返回 url 或 b64_json"],
      [inlineCode("n"), "number", "否", "生成张数，建议保持 1"]
    ])}
    ${codeBlock(`curl "${BASE_URL}/images/generations" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "湖蓝色调的山谷，清晨薄雾，极简插画风",
    "size": "1024x1024"
  }'`)}
  </section>

  <section class="doc-section">
    <h2>图片编辑</h2>
    <p>上传参考图后，根据提示词进行修改、重绘或扩展。</p>
    ${codeBlock(`POST ${BASE_URL}/images/edits`)}
    ${table(["参数", "类型", "必填", "说明"], [
      [inlineCode("image"), "file", "是", "参考图片，支持 PNG / JPEG / WebP"],
      [inlineCode("prompt"), "string", "是", "想要修改成什么效果"],
      [inlineCode("model"), "string", "是", "模型名称"],
      [inlineCode("size"), "string", "否", "不填或 auto 会尽量沿用参考图比例"]
    ])}
    ${codeBlock(`curl "${BASE_URL}/images/edits" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -F "model=gpt-image-2" \\
  -F "image=@input.png" \\
  -F "prompt=给角色戴上一顶橙色贝雷帽，保持主体和构图"`)}
  </section>

  <section class="doc-section">
    <h2>OpenAI SDK 示例</h2>
    ${codeBlock(`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.WENYUN_API_KEY,
  baseURL: "${BASE_URL}"
});

const result = await client.images.generate({
  model: "gpt-image-2",
  prompt: "一张柔和灯光下的未来感工作台",
  size: "1024x1024"
});

console.log(result.data[0].url);`)}
    <div class="doc-note">浏览器前端不要直接暴露 API key，正式项目建议走自己的后端代理。</div>
  </section>
`;

const renderBanana = () => `
  <header class="doc-hero">
    <p class="doc-kicker">API DOCUMENT</p>
    <h1>Nano Banana 接口</h1>
    <p>Nano Banana 系列适合图片生成、参考图改图和需要 Gemini 图片格式的客户端。常规客户端优先使用 OpenAI 兼容写法。</p>
  </header>

  <section class="doc-section">
    <h2>基础地址</h2>
    <p>OpenAI 兼容客户端填写这个地址：</p>
    ${codeBlock(BASE_URL)}
    <p>如果客户端要求 Gemini 原生路径，使用同域的 v1beta 路径：</p>
    ${codeBlock(GEMINI_BASE_URL)}
  </section>

  <section class="doc-section">
    <h2>模型</h2>
    ${table(["名称", "模型名", "说明"], [
      ["Nano Banana 2", inlineCode("nano-banana-2"), "速度档，适合日常出图和预览"],
      ["Nano Banana Pro", inlineCode("nano-banana-pro"), "画质档，适合成品图和复杂画面"]
    ])}
  </section>

  <section class="doc-section">
    <h2>OpenAI 兼容写法</h2>
    <p>如果工具支持 OpenAI Images API，把模型名换成 Nano Banana 即可。</p>
    ${codeBlock(`curl "${BASE_URL}/images/generations" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "nano-banana-pro",
    "prompt": "一张现代感很强的银色跑车海报，商业摄影风格",
    "size": "1024x1024"
  }'`)}
  </section>

  <section class="doc-section">
    <h2>Gemini 原生写法</h2>
    <p>部分客户端会按 Gemini 的 generateContent 方式调用，路径里直接填模型名。</p>
    ${codeBlock(`POST ${GEMINI_BASE_URL}/models/{model}:generateContent
POST ${GEMINI_BASE_URL}/models/{model}:streamGenerateContent`)}
    ${table(["参数", "说明"], [
      [inlineCode("{model}"), "填写 nano-banana-2 或 nano-banana-pro"],
      [inlineCode("contents[].parts[].text"), "文字提示词"],
      [inlineCode("generationConfig.imageConfig.aspectRatio"), "图片比例，例如 1:1、16:9、9:16、4:3、3:4"],
      [inlineCode("generationConfig.imageConfig.imageSize"), "分辨率档位，例如 1K、2K、4K"],
      [inlineCode("generationConfig.responseModalities"), "返回 IMAGE、TEXT 或 IMAGE + TEXT"]
    ])}
  </section>

  <section class="doc-section">
    <h2>文生图示例</h2>
    ${codeBlock(`curl -X POST "${GEMINI_BASE_URL}/models/nano-banana-pro:generateContent" \\
  -H "x-goog-api-key: $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          { "text": "一颗放在木桌上的红苹果，棚拍光线，极简背景" }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "1:1",
        "imageSize": "1K"
      }
    }
  }'`)}
  </section>

  <section class="doc-section">
    <h2>图生图示例</h2>
    <p>可以传 base64 图片，也可以传可访问的图片 URL；返回内容通常在 candidates 的 parts 里读取。</p>
    ${codeBlock(`{
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
}`)}
  </section>

  <section class="doc-section">
    <h2>常见说明</h2>
    <ul class="doc-list">
      <li>OpenAI 兼容写法适合 Cherry Studio、OpenAI SDK 等通用客户端。</li>
      <li>Gemini 原生写法适合只支持 generateContent 的客户端。</li>
      <li>如果生成失败，先检查 key、余额、模型名和基础地址是否填写正确。</li>
      <li>浏览器前端不要直接暴露 API key，正式项目建议走自己的后端代理。</li>
    </ul>
  </section>
`;

const getRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, "");
  return route === "banana" ? "banana" : "image2";
};

const render = () => {
  // 根据 hash 切换两份文档，保证纯静态部署时也能直接跳转。
  const route = getRoute();
  content.innerHTML = route === "banana" ? renderBanana() : renderImage2();
  navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.route === route));
  document.title = route === "banana" ? "Nano Banana 接口文档" : "GPT Image 2 接口文档";
};

window.addEventListener("hashchange", render);
render();
