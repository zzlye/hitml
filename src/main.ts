import "./styles.css";

import { introModule, supportModule, tutorialModules, type ContactItem, type TutorialCard, type TutorialModule } from "./content";

const app = document.querySelector<HTMLDivElement>("#app");
const DORO_TARGET_URL = "https://zzlye.xyz:90";
const DORO_CLICK_LIMIT = 10;

if (!app) {
  throw new Error("未找到页面挂载节点");
}

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = ""
) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const createIcon = (name: "note" | "arrowUp") => {
  const icons = {
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M15 3.5V8h4"/><path d="M8.5 11.5h7M8.5 15h5"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 5 11h4v9h6v-9h4L12 4z"/></svg>'
  };
  const span = createElement("span", "icon");
  span.innerHTML = icons[name];
  return span;
};

const renderModuleHeader = (title: string, description: string) => {
  const header = createElement("div", "module-header reveal");
  header.append(createElement("h2", "module-title", title), createElement("p", "module-description", description));
  return header;
};

const createNavLink = (href: string, label: string, shortLabel: string) => {
  const link = createElement("a", "toc-link") as HTMLAnchorElement;
  link.href = href;
  link.setAttribute("aria-label", label);

  const mark = createElement("span", "toc-mark");
  const text = createElement("span", "toc-text");
  text.textContent = shortLabel;

  link.append(mark, text);
  return link;
};

const renderDirectory = () => {
  const aside = createElement("aside", "toc");
  aside.setAttribute("aria-label", "页面目录");
  aside.append(
    createElement("p", "toc-label", "目录"),
    createNavLink("#intro", "跳转到标题区域", "标题"),
    createNavLink("#support", "跳转到售后区域", "售后"),
    createNavLink("#tutorial-visual", "跳转到教程一区域", "教程一"),
    createNavLink("#tutorial-notes", "跳转到教程二区域", "教程二")
  );
  return aside;
};

const renderTopButton = () => {
  const anchor = createElement("a", "to-top") as HTMLAnchorElement;
  anchor.href = "#intro";
  anchor.setAttribute("aria-label", "返回顶部");
  anchor.append(createIcon("arrowUp"));
  return anchor;
};

const renderIntroModule = () => {
  const section = createElement("section", "module module-intro reveal is-visible");
  section.id = introModule.id;

  const card = createElement("article", "module-card module-card--intro");
  const action = createElement("a", "intro-action", introModule.actionLabel) as HTMLAnchorElement;
  action.href = introModule.actionUrl;
  action.target = "_blank";
  action.rel = "noreferrer";

  card.append(createElement("h1", "intro-title", introModule.title), action);
  section.append(card);
  return section;
};

const createFloatText = (container: HTMLElement) => {
  // 点击橘子时生成一次往上飘的提示文字。
  const text = createElement("span", "doro-pop-text", "orange");
  text.style.left = `${52 + Math.random() * 18}%`;
  container.append(text);
  window.setTimeout(() => text.remove(), 920);
};

const setupDoro = () => {
  const doro = document.querySelector<HTMLDivElement>(".doro-widget");
  const orange = doro?.querySelector<HTMLButtonElement>(".doro-orange");
  if (!doro || !orange) return;

  // doro 既能拖动定位，也能通过橘子点击触发跳动和累计跳转。
  let clickCount = 0;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const clampPosition = (left: number, top: number) => {
    const rect = doro.getBoundingClientRect();
    return {
      left: Math.min(Math.max(8, left), window.innerWidth - rect.width - 8),
      top: Math.min(Math.max(8, top), window.innerHeight - rect.height - 8)
    };
  };

  const moveDoro = (left: number, top: number) => {
    const next = clampPosition(left, top);
    doro.style.left = `${next.left}px`;
    doro.style.top = `${next.top}px`;
    doro.style.right = "auto";
    doro.style.bottom = "auto";
  };

  doro.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const rect = doro.getBoundingClientRect();
    isDragging = true;
    hasMoved = false;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    doro.classList.add("is-dragging");
    doro.setPointerCapture(event.pointerId);
  });

  doro.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) hasMoved = true;
    moveDoro(startLeft + deltaX, startTop + deltaY);
  });

  const stopDragging = (event: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    doro.classList.remove("is-dragging");
    if (doro.hasPointerCapture(event.pointerId)) {
      doro.releasePointerCapture(event.pointerId);
    }
  };

  doro.addEventListener("pointerup", stopDragging);
  doro.addEventListener("pointercancel", stopDragging);

  orange.addEventListener("click", (event) => {
    if (hasMoved) return;
    event.stopPropagation();
    clickCount += 1;
    doro.classList.remove("is-bouncing");
    void doro.offsetWidth;
    doro.classList.add("is-bouncing");
    createFloatText(doro);

    if (clickCount >= DORO_CLICK_LIMIT) {
      window.location.href = DORO_TARGET_URL;
    }
  });
};

const renderDoroWidget = () => {
  const widget = createElement("div", "doro-widget");
  widget.setAttribute("aria-label", "可拖动 doro");
  widget.innerHTML = `
    <button class="doro-orange" type="button" aria-label="点击橘子"></button>
    <img class="doro-image" src="/images/doro-1.png" alt="doro" width="240" height="135" draggable="false" />
  `;
  return widget;
};

const renderContactCard = (item: ContactItem) => {
  const card = createElement("article", "support-card reveal");
  const media = createElement("button", "support-media") as HTMLButtonElement;
  media.type = "button";
  media.setAttribute("aria-label", `放大查看${item.title}二维码`);

  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.loading = "lazy";
  image.width = 240;
  image.height = 240;
  media.append(image);
  media.addEventListener("click", () => openQrPreview(item));

  const body = createElement("div", "support-body");
  const title = createElement("h3", "support-card-title", item.title);
  body.append(title);

  if (item.actionLabel && item.actionUrl) {
    const link = createElement("a", "support-link", item.actionLabel) as HTMLAnchorElement;
    link.href = item.actionUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    body.append(link);
  }

  card.append(media, body);
  return card;
};

const renderSupportModule = () => {
  const section = createElement("section", "module reveal");
  section.id = supportModule.id;

  const card = createElement("article", "module-card module-card--support");
  const grid = createElement("div", "support-grid");
  supportModule.contacts.forEach((item) => grid.append(renderContactCard(item)));

  const serviceList = createElement("div", "support-services");
  supportModule.services.forEach((item) => serviceList.append(createElement("span", "support-service", item)));

  card.append(
    renderModuleHeader(supportModule.title, supportModule.description),
    serviceList,
    grid
  );
  section.append(card);
  return section;
};

const closeQrPreview = () => {
  document.querySelector(".qr-preview")?.remove();
};

const openQrPreview = (item: ContactItem) => {
  closeQrPreview();

  const overlay = createElement("div", "qr-preview") as HTMLDivElement;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `放大查看${item.title}二维码`);

  const panel = createElement("div", "qr-preview-panel");
  const closeButton = createElement("button", "qr-preview-close", "关闭") as HTMLButtonElement;
  closeButton.type = "button";
  closeButton.addEventListener("click", closeQrPreview);

  const title = createElement("h3", "qr-preview-title", item.title);
  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.width = 720;
  image.height = 720;

  panel.append(closeButton, title, image);
  overlay.append(panel);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeQrPreview();
  });

  document.body.append(overlay);
  closeButton.focus();
};

const renderTutorialCard = (cardData: TutorialCard, tone: TutorialModule["tone"]) => {
  const card = createElement("article", `tutorial-card tutorial-card--${tone} reveal`);
  const badge = createElement("span", "card-tag", cardData.tag);

  if (cardData.image) {
    const media = createElement("div", "tutorial-media");
    const image = document.createElement("img");
    image.src = cardData.image;
    image.alt = cardData.title;
    image.loading = "lazy";
    image.width = 640;
    image.height = 400;
    media.append(image);
    card.append(media);
  } else {
    const visual = createElement("div", "tutorial-visual tutorial-visual--notes");
    visual.append(createIcon("note"));
    card.append(visual);
  }

  const body = createElement("div", "tutorial-body");
  body.append(
    badge,
    createElement("h3", "tutorial-card-title", cardData.title),
    createElement("p", "tutorial-card-description", cardData.description)
  );

  const notes = createElement("ul", "note-list");
  cardData.notes.forEach((note) => notes.append(createElement("li", "", note)));
  body.append(notes);

  card.append(body);
  return card;
};

const renderTutorialModule = (moduleData: TutorialModule) => {
  const section = createElement("section", "module reveal");
  section.id = moduleData.id;

  const card = createElement("article", `module-card module-card--${moduleData.tone}`);
  const grid = createElement("div", `tutorial-grid tutorial-grid--${moduleData.tone}`);
  moduleData.cards.forEach((item) => grid.append(renderTutorialCard(item, moduleData.tone)));

  card.append(renderModuleHeader(moduleData.title, moduleData.description), grid);
  section.append(card);
  return section;
};

const renderApp = () => {
  const shell = createElement("main", "page-shell");
  shell.append(renderIntroModule(), renderSupportModule(), ...tutorialModules.map(renderTutorialModule));
  app.replaceChildren(renderDirectory(), shell, renderTopButton(), renderDoroWidget());
};

const setupReveal = () => {
  // 滚动进入视口后再显示模块，静态环境下没有观察器时直接展示全部内容。
  const revealItems = document.querySelectorAll<HTMLElement>(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

renderApp();
setupReveal();
setupDoro();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeQrPreview();
});
