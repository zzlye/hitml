import "./styles.css";

import { introModule, supportModule, tutorialModules, type ContactItem, type TutorialCard, type TutorialModule, type TutorialNote } from "./content";

const app = document.querySelector<HTMLDivElement>("#app");
const DORO_TARGET_URL = "https://zzlye.xyz:90";
const DORO_CLICK_LIMIT = 20;

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
  link.textContent = shortLabel;
  return link;
};

const renderDirectory = () => {
  const aside = createElement("aside", "toc");
  aside.setAttribute("aria-label", "页面目录");
  aside.append(
    createElement("p", "toc-label", "目录"),
    createNavLink("#intro", "跳转到标题区域", "1. 标题"),
    createNavLink("#support", "跳转到售后区域", "2. 售后进群"),
    createNavLink("#tutorial-visual", "跳转到在线使用区域", "3. 在线使用"),
    createNavLink("#tutorial-notes", "跳转到教程二区域", "4. 教程二")
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
  // 点击 doro 时生成一次往上飘的提示文字。
  const text = createElement("span", "doro-pop-text", "orange");
  text.style.left = `${47 + Math.random() * 10}%`;
  container.append(text);
  window.setTimeout(() => text.remove(), 1120);
};

const setDoroDirection = (doro: HTMLElement, velocityX: number) => {
  doro.classList.toggle("is-facing-left", velocityX < 0);
  doro.classList.toggle("is-facing-right", velocityX >= 0);
  doro.classList.remove("is-turning");
  void doro.offsetWidth;
  doro.classList.add("is-turning");
};

const setupDoro = () => {
  const doro = document.querySelector<HTMLDivElement>(".doro-widget");
  if (!doro) return;

  // doro 会在视口内自动移动；拖动后会从新位置继续跑。
  let clickCount = 0;
  let isDragging = false;
  let hasDragged = false;
  let left = window.innerWidth - doro.offsetWidth - 18;
  let top = 18;
  let velocityX = -0.025;
  let velocityY = 0.018;
  let lastTime = performance.now();
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

  const moveDoro = (nextLeft: number, nextTop: number) => {
    const next = clampPosition(nextLeft, nextTop);
    left = next.left;
    top = next.top;
    doro.style.left = `${next.left}px`;
    doro.style.top = `${next.top}px`;
    doro.style.right = "auto";
    doro.style.bottom = "auto";
  };

  const tick = (time: number) => {
    const elapsed = Math.min(32, time - lastTime);
    lastTime = time;

    if (!isDragging) {
      const rect = doro.getBoundingClientRect();
      left += velocityX * elapsed;
      top += velocityY * elapsed;

      if (left <= 8 || left + rect.width >= window.innerWidth - 8) {
        velocityX *= -1;
        setDoroDirection(doro, velocityX);
        left = Math.min(Math.max(8, left), window.innerWidth - rect.width - 8);
      }

      if (top <= 8 || top + rect.height >= window.innerHeight - 8) {
        velocityY *= -1;
        top = Math.min(Math.max(8, top), window.innerHeight - rect.height - 8);
      }

      moveDoro(left, top);
    }

    window.requestAnimationFrame(tick);
  };

  moveDoro(left, top);
  setDoroDirection(doro, velocityX);
  window.requestAnimationFrame(tick);

  const startDrag = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const rect = doro.getBoundingClientRect();
    isDragging = true;
    hasDragged = false;
    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    left = rect.left;
    top = rect.top;
    doro.classList.add("is-dragging");
    doro.setPointerCapture(event.pointerId);
  };

  doro.addEventListener("pointerdown", (event) => {
    startDrag(event);
  });

  doro.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 6) hasDragged = true;
    moveDoro(startLeft + deltaX, startTop + deltaY);
  });

  const stopDragging = (event: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    doro.classList.remove("is-dragging");
    if (doro.hasPointerCapture(event.pointerId)) {
      doro.releasePointerCapture(event.pointerId);
    }

    if (!hasDragged) {
      clickCount += 1;
      doro.classList.remove("is-bouncing");
      void doro.offsetWidth;
      doro.classList.add("is-bouncing");
      createFloatText(doro);

      if (clickCount >= DORO_CLICK_LIMIT) {
        window.open(DORO_TARGET_URL, "_blank", "noopener,noreferrer");
        clickCount = 0;
      }
    }
  };

  doro.addEventListener("pointerup", stopDragging);
  doro.addEventListener("pointercancel", stopDragging);
};

const renderDoroWidget = () => {
  const widget = createElement("div", "doro-widget");
  widget.setAttribute("aria-label", "可拖动 doro");
  widget.innerHTML = `
    <span class="doro-runner">
      <span class="doro-orange" aria-hidden="true"></span>
      <img class="doro-image" src="/images/doro-2.png" alt="doro" width="2560" height="1440" draggable="false" />
    </span>
  `;
  return widget;
};

const renderContactCard = (item: ContactItem) => {
  const card = createElement("article", "support-card reveal");
  const media = createElement("button", "support-media") as HTMLButtonElement;
  media.type = "button";
  media.setAttribute("aria-label", `放大查看${item.title}二维码`);

  const hint = createElement("span", "support-media-hint", "点击放大");
  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.alt;
  image.loading = "lazy";
  image.width = 240;
  image.height = 240;
  media.append(image, hint);
  media.addEventListener("click", () => openQrPreview(item));
  media.addEventListener("pointerenter", () => media.classList.add("is-previewing"));
  media.addEventListener("pointerleave", () => media.classList.remove("is-previewing"));
  media.addEventListener("focus", () => media.classList.add("is-previewing"));
  media.addEventListener("blur", () => media.classList.remove("is-previewing"));

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
  const mascot = document.createElement("img");
  mascot.className = "support-doro";
  mascot.src = "/images/doro-3.png";
  mascot.alt = "";
  mascot.width = 1110;
  mascot.height = 794;
  mascot.setAttribute("aria-hidden", "true");

  const grid = createElement("div", "support-grid");
  supportModule.contacts.forEach((item) => grid.append(renderContactCard(item)));

  const serviceList = createElement("div", "support-services");
  supportModule.services.forEach((item) => serviceList.append(createElement("span", "support-service", item)));

  card.append(
    mascot,
    renderModuleHeader(supportModule.title, supportModule.description),
    serviceList,
    grid
  );
  section.append(card);
  return section;
};

const closeImagePreview = () => {
  document.querySelector(".image-preview")?.remove();
};

const openImagePreview = (imageSrc: string, imageAlt: string, label: string) => {
  closeImagePreview();

  const overlay = createElement("div", "image-preview") as HTMLDivElement;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", label);

  const panel = createElement("div", "image-preview-panel");
  const image = document.createElement("img");
  image.src = imageSrc;
  image.alt = imageAlt;
  image.width = 720;
  image.height = 720;

  panel.append(image);
  overlay.append(panel);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target === panel) closeImagePreview();
  });

  document.body.append(overlay);
  panel.tabIndex = -1;
  panel.focus();
};

const openQrPreview = (item: ContactItem) => {
  openImagePreview(item.image, item.alt, `放大查看${item.title}二维码`);
};

const renderTutorialNote = (note: TutorialNote) => {
  const item = createElement("li");
  if (typeof note === "string") {
    item.textContent = note;
    return item;
  }

  item.append(document.createTextNode(note.text));
  const link = createElement("a", "tutorial-note-link", note.label) as HTMLAnchorElement;
  link.href = note.href;
  link.target = "_blank";
  link.rel = "noreferrer";
  item.append(link);
  return item;
};

const renderTutorialCard = (cardData: TutorialCard, tone: TutorialModule["tone"]) => {
  const card = createElement("article", `tutorial-card tutorial-card--${tone} reveal`);
  const badge = createElement("span", "card-tag", cardData.tag);

  if (cardData.image) {
    const media = createElement("button", "tutorial-media") as HTMLButtonElement;
    media.type = "button";
    media.setAttribute("aria-label", `放大查看${cardData.title}图片`);
    const image = document.createElement("img");
    image.src = cardData.image;
    image.alt = cardData.title;
    image.loading = "lazy";
    image.width = 640;
    image.height = 400;
    media.append(image);
    media.addEventListener("click", () => openImagePreview(cardData.image ?? "", cardData.title, `放大查看${cardData.title}图片`));
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
  cardData.notes.forEach((note) => notes.append(renderTutorialNote(note)));
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
  if (event.key === "Escape") closeImagePreview();
});
