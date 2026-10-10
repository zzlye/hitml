import { pages } from "./content.js?v=20261010-mj-reference";

// 页面和导出都从同一份结构化正文生成，避免示例、参数表出现两个版本。
export const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const inline = (value) => escapeHtml(value).replace(/`([^`]+)`/g, "<code>$1</code>");

export const resolveRoute = (hash) => {
  const id = hash.replace(/^#\/?/, "").split("?")[0];
  return pages.some((page) => page.id === id) ? id : "image2";
};

export const renderPage = (page) => {
  // 正文直接展示，保留章节锚点以兼容已有深链接，不再插入本页目录。
  const blocks = page.blocks.map((block, index) => {
    if (block.type === "heading") return `<h2 id="section-${index}">${inline(block.value)}</h2>`;
    if (block.type === "paragraph") return `<p>${inline(block.value)}</p>`;
    if (block.type === "note") return `<div class="callout callout--blue">${inline(block.value)}</div>`;
    if (block.type === "list") return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
    if (block.type === "links") return `<div class="doc-links">${block.items.map((item) => `<a href="#/${escapeHtml(item.id)}">${escapeHtml(item.label)} <span aria-hidden="true">→</span></a>`).join("")}</div>`;
    if (block.type === "table") return `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(block.headers.join("、"))}"><table><thead><tr>${block.headers.map((cell) => `<th scope="col">${inline(cell)}</th>`).join("")}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    if (block.type === "code") return `<div class="code-example"><div class="code-caption"><span>${escapeHtml(block.lang)}</span><button type="button" class="code-copy" data-copy-index="${index}" aria-label="复制${escapeHtml(block.lang)}示例">复制</button></div><pre class="code-block" data-lang="${escapeHtml(block.lang)}"><code>${escapeHtml(block.value.trim())}</code></pre></div>`;
    return "";
  }).join("\n");
  return `<article class="doc-page"><p class="doc-eyebrow">文运工坊 · 图片与视频</p><h1>${escapeHtml(page.title)}</h1><p class="lead">${inline(page.lead)}</p>${blocks}<footer>© 文运工坊</footer></article>`;
};

const markdownCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", "<br>");
export const pageMarkdown = (page) => {
  const blocks = page.blocks.map((block) => {
    if (block.type === "heading") return `## ${block.value}`;
    if (block.type === "paragraph") return block.value;
    if (block.type === "note") return `> ${block.value}`;
    if (block.type === "list") return block.items.map((item) => `- ${item}`).join("\n");
    // 使用完整网址，导出的文档离开本站后仍能返回对应章节。
    if (block.type === "links") return block.items.map((item) => `- [${item.label}](https://zzlye.site/docs/index.html#/${item.id})`).join("\n");
    if (block.type === "table") return [block.headers, block.headers.map(() => "---"), ...block.rows].map((row) => `| ${row.map(markdownCell).join(" | ")} |`).join("\n");
    if (block.type === "code") {
      const fence = "`".repeat(Math.max(3, ...(block.value.match(/`+/g) || []).map((match) => match.length + 1)));
      return `${fence}${block.lang}\n${block.value.trim()}\n${fence}`;
    }
    return "";
  });
  return [`# ${page.title}`, page.lead, ...blocks, "---\n\n© 文运工坊"].filter(Boolean).join("\n\n") + "\n";
};
