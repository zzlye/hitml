const BASE_URL = "https://api.zzlye.xyz/v1";

const content = document.querySelector("#docs-content");
const routeLinks = [...document.querySelectorAll("[data-route]")];
const currentTitle = document.querySelector("#docs-current-title");
const exportButton = document.querySelector("#docs-export");
const toast = document.querySelector("#docs-toast");
const documentMeta = {
  image2: {
    label: "GPT Image 2",
    pageTitle: "image2 接口",
    fileName: "文运工坊-GPT-Image-2-接口文档.md"
  },
  banana: {
    label: "Nano Banana",
    pageTitle: "香蕉系列接口",
    fileName: "文运工坊-Nano-Banana-接口文档.md"
  }
};
let toastTimer = 0;

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
      [inlineCode("response_format"), "string", "否", inlineCode("b64_json"), `${inlineCode("b64_json")} 或 ${inlineCode("url")}`],
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
    <h3>${inlineCode("response_format=b64_json")}（默认）</h3>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "b64_json": "iVBORw0KGgo..."
    }
  ]
}`, "json")}

    <h3>${inlineCode("response_format=url")}</h3>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "url": "data:image/png;base64,iVBORw0KGgo..."
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
    size="1024x1024",
    response_format="url"
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
        "size": "1024x1024",
        "response_format": "url"
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
    "size": "1024x1536",
    "response_format": "url"
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
  size: "1536x1024",
  response_format: "url"
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
    size: "1024x1024",
    response_format: "url"
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
    <footer>© 文运工坊 · zzlye.xyz</footer>
  </article>
`;

const renderBanana = () => `
  <article class="doc-page">
    <h1>Nano Banana 接口</h1>
    <p class="lead">Nano Banana 在文运工坊里走 OpenAI Images 兼容接口，接入 NewAPI 时不需要让客户端再走 Gemini 原生格式。</p>
    ${infoBox(`<strong>重要</strong>：请使用 ${inlineCode("/v1/images/generations")} 和 ${inlineCode("/v1/images/edits")}。不要选择 Gemini 原生通道，否则 NewAPI 会进入额外转换链路，日志和 token 统计可能异常放大。`)}

    <h2>模型</h2>
    ${table(["外号", "模型名", "说明"], [
      ["香蕉2", inlineCode("nano-banana-2"), "速度档，适合日常出图、预览和批量尝试"],
      ["香蕉pro", inlineCode("nano-banana-pro"), "画质档，适合成品图、复杂画面和高质量输出"]
    ])}
    <p>两个模型调用方式一致，只需要替换 ${inlineCode("model")} 字段。</p>

    <h2>鉴权</h2>
    <p>在请求头里填写文运工坊获取的 API Key：</p>
    ${codeBlock(`Authorization: Bearer <API_KEY>
Content-Type: application/json`)}

    <h2>接口地址</h2>
    ${table(["场景", "接口"], [
      ["文生图", inlineCode(`POST ${BASE_URL}/images/generations`)],
      ["图生图 / 改图", inlineCode(`POST ${BASE_URL}/images/edits`)]
    ])}
    ${infoBox(`Base URL 填 ${inlineCode(BASE_URL)}，客户端端点按 OpenAI Images 自动拼接即可。`, "green")}

    <h2>文生图</h2>
    <p>根据提示词直接生成图片，使用 JSON 请求体。</p>
    ${codeBlock(`POST ${BASE_URL}/images/generations`)}
    ${table(["参数", "类型", "必填", "默认", "说明"], [
      [inlineCode("model"), "string", "是", "-", `填写 ${inlineCode("nano-banana-2")} 或 ${inlineCode("nano-banana-pro")}`],
      [inlineCode("prompt"), "string", "是", "-", "图片提示词"],
      [inlineCode("size"), "string", "否", inlineCode("1024x1024"), `常用 ${inlineCode("1024x1024")} / ${inlineCode("1536x1024")} / ${inlineCode("1024x1536")} / ${inlineCode("1792x1024")} / ${inlineCode("1024x1792")}`],
      [inlineCode("response_format"), "string", "否", inlineCode("b64_json"), `${inlineCode("b64_json")} 或 ${inlineCode("url")}`],
      [inlineCode("n"), "number", "否", inlineCode("1"), "生成张数，建议保持 1"]
    ])}

    <h3>文生图示例</h3>
    ${codeBlock(`{
  "model": "nano-banana-2",
  "prompt": "一张银色跑车的城市夜景海报，高反差，高质感",
  "size": "1024x1024",
  "response_format": "b64_json"
}`, "json")}

    ${codeBlock(`curl "${BASE_URL}/images/generations" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "nano-banana-2",
    "prompt": "一张银色跑车的城市夜景海报，高反差，高质感",
    "size": "1024x1024",
    "response_format": "b64_json"
  }'`, "bash")}

    <h2>图生图</h2>
    <p>上传参考图后让模型改图，使用 multipart 表单请求。</p>
    ${codeBlock(`POST ${BASE_URL}/images/edits`)}
    ${table(["参数", "类型", "必填", "默认", "说明"], [
      [inlineCode("image"), "file", "是", "-", "输入图片，支持 PNG / JPEG / WebP"],
      [inlineCode("model"), "string", "是", "-", `填写 ${inlineCode("nano-banana-2")} 或 ${inlineCode("nano-banana-pro")}`],
      [inlineCode("prompt"), "string", "是", "-", "改图提示词"],
      [inlineCode("size"), "string", "否", inlineCode("auto"), "不填时尽量沿用参考图比例，也可以传 1024x1024 等 OpenAI Images 尺寸"],
      [inlineCode("response_format"), "string", "否", inlineCode("b64_json"), `${inlineCode("b64_json")} 或 ${inlineCode("url")}`],
      [inlineCode("n"), "number", "否", inlineCode("1"), "生成张数，建议保持 1"]
    ])}

    <h3>图生图示例</h3>
    ${codeBlock(`curl "${BASE_URL}/images/edits" \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -F "model=nano-banana-pro" \\
  -F "image=@input.png" \\
  -F "prompt=把这张图改成日系水彩风，保留主体和构图" \\
  -F "size=1024x1024" \\
  -F "response_format=b64_json"`, "bash")}

    <h2>返回格式</h2>
    <p>默认返回 OpenAI Images 兼容结构：</p>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "b64_json": "iVBORw0KGgo..."
    }
  ]
}`, "json")}
    <p>如果 ${inlineCode("response_format")} 填 ${inlineCode("url")}，则返回：</p>
    ${codeBlock(`{
  "created": 1710000000,
  "data": [
    {
      "url": "data:image/png;base64,iVBORw0KGgo..."
    }
  ]
}`, "json")}

    <h2>接入 NewAPI 的建议</h2>
    <ul>
      <li>渠道类型走 OpenAI 兼容，不要走 Gemini 原生。</li>
      <li>Base URL 填 ${inlineCode(BASE_URL)}。</li>
      <li>模型名填 ${inlineCode("nano-banana-2")} 或 ${inlineCode("nano-banana-pro")}。</li>
      <li>文生图只用 ${inlineCode("/v1/images/generations")}。</li>
      <li>图生图和改图只用 ${inlineCode("/v1/images/edits")}。</li>
    </ul>

    <h2>香蕉pro 还是 香蕉2？</h2>
    <p>两者接口一致，区别主要在输出取向：${inlineCode("nano-banana-pro")} 更偏画质和成品图，${inlineCode("nano-banana-2")} 更偏速度和预览。大多数用户先用香蕉2，需要更高质量时再换香蕉pro。</p>
    <footer>© 文运工坊 · zzlye.xyz</footer>
  </article>
`;

const normalizeInlineText = (value) => value.replace(/\s+/g, " ").trim();

const inlineMarkdown = (node) => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  const children = [...node.childNodes].map(inlineMarkdown).join("");
  if (node.tagName === "CODE") return `\`${normalizeInlineText(children).replaceAll("`", "\\`")}\``;
  if (node.tagName === "STRONG" || node.tagName === "B") return `**${normalizeInlineText(children)}**`;
  if (node.tagName === "EM" || node.tagName === "I") return `*${normalizeInlineText(children)}*`;
  if (node.tagName === "A") return `[${normalizeInlineText(children)}](${node.href})`;
  if (node.tagName === "BR") return "\n";
  return children;
};

const tableMarkdown = (tableElement) => {
  const rows = [...tableElement.rows].map((row) => [...row.cells].map((cell) => (
    normalizeInlineText(inlineMarkdown(cell)).replaceAll("|", "\\|")
  )));
  if (!rows.length) return "";

  const [header, ...body] = rows;
  const headerLine = `| ${header.join(" | ")} |`;
  const dividerLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map((row) => `| ${row.join(" | ")} |`);
  return [headerLine, dividerLine, ...bodyLines].join("\n");
};

const blockMarkdown = (element) => {
  const headingLevel = Number(element.tagName.slice(1));
  if (/^H[1-4]$/.test(element.tagName)) {
    return `${"#".repeat(headingLevel)} ${normalizeInlineText(inlineMarkdown(element))}`;
  }

  if (element.tagName === "P") return normalizeInlineText(inlineMarkdown(element));
  if (element.tagName === "PRE") {
    const language = element.dataset.lang || "text";
    const code = element.querySelector("code")?.textContent?.trim() ?? "";
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  if (element.matches(".callout")) {
    const calloutText = normalizeInlineText(inlineMarkdown(element));
    return calloutText.split("\n").map((line) => `> ${line}`).join("\n");
  }

  if (element.matches(".table-wrap")) {
    const tableElement = element.querySelector("table");
    return tableElement ? tableMarkdown(tableElement) : "";
  }

  if (element.tagName === "UL" || element.tagName === "OL") {
    const ordered = element.tagName === "OL";
    return [...element.children].map((item, index) => (
      `${ordered ? `${index + 1}.` : "-"} ${normalizeInlineText(inlineMarkdown(item))}`
    )).join("\n");
  }

  if (element.tagName === "FOOTER") return `---\n\n${normalizeInlineText(inlineMarkdown(element))}`;
  return [...element.children].map(blockMarkdown).filter(Boolean).join("\n\n");
};

const createMarkdown = (article) => (
  [...article.children]
    .map(blockMarkdown)
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n"
);

const showToast = (message) => {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

const exportCurrentDocument = () => {
  const article = content.querySelector(".doc-page");
  if (!article) return;

  // 将当前渲染的文档转换为 Markdown，再交给浏览器下载。
  const route = getRoute();
  const markdown = createMarkdown(article);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = documentMeta[route].fileName;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  showToast(`${documentMeta[route].label} 文档已导出`);
};

const getRoute = () => {
  const route = window.location.hash.replace(/^#\/?/, "");
  return route === "banana" ? "banana" : "image2";
};

const render = () => {
  // 根据 hash 切换两份静态文档，方便直接复制链接给用户。
  const route = getRoute();
  content.innerHTML = route === "banana" ? renderBanana() : renderImage2();
  routeLinks.forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  currentTitle.textContent = documentMeta[route].label;
  document.title = documentMeta[route].pageTitle;
  window.scrollTo({ top: 0 });
};

window.addEventListener("hashchange", render);
exportButton.addEventListener("click", exportCurrentDocument);
render();
