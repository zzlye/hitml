import { pages } from "./content.js?v=20261010-mj-task-contract";
import { escapeHtml, pageMarkdown, renderPage, resolveRoute } from "./document.js?v=20261010-mj-task-contract";

const content = document.querySelector("#docs-content");
const nav = document.querySelector("#docs-nav");
const currentTitle = document.querySelector("#docs-current-title");
const toast = document.querySelector("#docs-toast");
let currentPage;
let toastTimer;

// 目录与正文使用同一份配置，避免新增章节时遗漏菜单。
nav.innerHTML = pages.map((page, index) => '<a href="#/' + page.id + '" data-route="' + page.id + '"><span class="docs-nav-index">' + String(index + 1).padStart(2, "0") + '</span><span>' + escapeHtml(page.label) + '</span></a>').join("");

const showToast = (message) => {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2500);
};

const render = (focusContent = false) => {
  currentPage = pages.find((page) => page.id === resolveRoute(location.hash));
  content.innerHTML = renderPage(currentPage);
  currentTitle.textContent = currentPage.label;
  document.title = currentPage.title + " · 文运工坊接口文档";
  nav.querySelectorAll("a").forEach((link) => {
    const active = link.dataset.route === currentPage.id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  // 公共章节的旧链接回到默认模型，不沿用旧页面的章节索引。
  const requestedRoute = location.hash.replace(/^#\/?/, "").split("?")[0];
  const section = requestedRoute === currentPage.id ? new URLSearchParams(location.hash.split("?")[1] || "").get("section") : null;
  const heading = section && /^\d+$/.test(section) ? document.getElementById("section-" + section) : null;
  if (heading) {
    // 深链接和浏览器前进后退直接定位章节，避免长文档每次回到顶部。
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: "instant", block: "start" });
  } else if (focusContent) {
    // 手机切换后直接显示正文，顶部目录按钮仍可返回章节列表。
    content.focus({ preventScroll: true });
    const top = document.querySelector(".docs-main").getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "instant" });
  }
};

const downloadMarkdown = (value, name) => {
  const url = URL.createObjectURL(new Blob([value], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name.replace(/[<>:"/\\|?*]/g, "-") + ".md";
  document.body.append(link);
  link.click();
  link.remove();
  // 延后释放地址，避免浏览器尚未开始下载就失去数据。
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

document.querySelector("#docs-export").addEventListener("click", () => {
  downloadMarkdown(pageMarkdown(currentPage), "文运工坊-" + currentPage.title);
  showToast("已导出当前章节");
});
document.querySelector("#docs-export-all").addEventListener("click", () => {
  downloadMarkdown(pages.map(pageMarkdown).join("\n\n"), "文运工坊-图片与视频接口文档");
  showToast("已导出全部文档");
});
document.querySelector("#docs-menu").addEventListener("click", () => {
  document.querySelector(".docs-sidebar").scrollIntoView({ behavior: "instant" });
  nav.querySelector("[aria-current]").focus({ preventScroll: true });
});

content.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-copy-index]");
  if (!button) return;
  const block = currentPage.blocks[Number(button.dataset.copyIndex)];
  if (block?.type !== "code") return;
  try {
    await navigator.clipboard.writeText(block.value.trim());
    showToast("示例已复制");
  } catch {
    // 剪贴板访问不可用时选中代码，用户仍可手动复制。
    const range = document.createRange();
    range.selectNodeContents(button.closest(".code-example").querySelector("code"));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    showToast("已选中示例，请手动复制");
  }
});

window.addEventListener("hashchange", () => render(true));
render();
