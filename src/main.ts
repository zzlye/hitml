import "./styles.css";

import { contacts, siteIntro, tutorialSteps, type ContactItem, type TutorialStep } from "./content";

const app = document.querySelector<HTMLDivElement>("#app");

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

const createIcon = (name: "spark" | "chat" | "book" | "arrow" | "top") => {
  const icons = {
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/><path d="M19 15l.8 2.7L22 18.5l-2.2.8L19 22l-.8-2.7-2.2-.8 2.2-.8L19 15z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.8A4.8 4.8 0 0 1 9.8 2h4.4A4.8 4.8 0 0 1 19 6.8v2.4a4.8 4.8 0 0 1-4.8 4.8H12l-4.4 3.3A1 1 0 0 1 6 16.5V14h-.2A4.8 4.8 0 0 1 1 9.2V6.8z"/><path d="M18 8.5A4 4 0 0 1 22 12.5v1.7a4 4 0 0 1-4 4h-.1v1.5a.9.9 0 0 1-1.4.7l-3-2.2h-1.7a4 4 0 0 1-3.9-3.2"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H21v16H7.5A2.5 2.5 0 0 0 5 20.5v-16z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H21v-5H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M9 6h8M9 10h6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"/><path d="M13 6l6 6-6 6"/></svg>',
    top: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l-7 7"/><path d="M12 5l7 7"/><path d="M12 6v13"/></svg>'
  };
  const span = createElement("span", "icon");
  span.innerHTML = icons[name];
  return span;
};

const createAnchorButton = (href: string, label: string, icon: "chat" | "book" | "arrow") => {
  const anchor = createElement("a", "hero-action") as HTMLAnchorElement;
  anchor.href = href;
  anchor.append(createIcon(icon), document.createTextNode(label));
  return anchor;
};

const renderHero = () => {
  const section = createElement("section", "hero reveal is-visible");
  section.id = "top";

  const copy = createElement("div", "hero-copy");
  const eyebrow = createElement("p", "eyebrow");
  eyebrow.append(createIcon("spark"), document.createTextNode(siteIntro.eyebrow));
  copy.append(
    eyebrow,
    createElement("h1", "", siteIntro.title),
    createElement("p", "hero-subtitle", siteIntro.subtitle)
  );

  const actions = createElement("div", "hero-actions");
  actions.append(
    createAnchorButton("#support", siteIntro.primaryAction, "chat"),
    createAnchorButton("#tutorial", siteIntro.secondaryAction, "book")
  );
  copy.append(actions);

  const mascot = createElement("div", "hero-mascot");
  mascot.setAttribute("aria-label", "可爱的页面装饰");
  mascot.innerHTML = `
    <img src="/images/mascot.webp" alt="粉色可爱风格装饰角色" width="720" height="405" />
    <div class="mascot-shadow"></div>
  `;

  section.append(copy, mascot, renderDecorations());
  return section;
};

const renderDecorations = () => {
  const wrapper = createElement("div", "decorations");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML = `
    <span class="deco deco-1"></span>
    <span class="deco deco-2"></span>
    <span class="deco deco-3"></span>
  `;
  return wrapper;
};

const renderSectionHeader = (kicker: string, title: string, description: string) => {
  const header = createElement("div", "section-header reveal");
  header.append(
    createElement("p", "section-kicker", kicker),
    createElement("h2", "", title),
    createElement("p", "", description)
  );
  return header;
};

const renderContactCard = (item: ContactItem) => {
  const card = createElement("article", "contact-card reveal");
  const imageWrap = createElement("div", "qr-frame");
  const image = document.createElement("img");
  image.src = item.image;
  image.alt = `${item.title}二维码`;
  image.loading = "lazy";
  image.width = 360;
  image.height = 360;
  imageWrap.append(image);

  const body = createElement("div", "card-body");
  const title = createElement("h3", "", item.title);
  const description = createElement("p", "", item.description);
  const hint = createElement("p", "hint", item.hint);
  body.append(title, description, hint);
  card.append(imageWrap, body);
  return card;
};

const renderSupport = () => {
  const section = createElement("section", "support-section");
  section.id = "support";
  const grid = createElement("div", "contact-grid");
  contacts.forEach((item) => grid.append(renderContactCard(item)));
  section.append(
    renderSectionHeader("售后入口", "先扫码保存联系入口", "群聊适合接收统一通知，微信适合处理单独问题。"),
    grid
  );
  return section;
};

const renderTutorialStep = (step: TutorialStep, index: number) => {
  const article = createElement("article", "tutorial-card reveal");
  const media = createElement("div", "tutorial-media");
  const image = document.createElement("img");
  image.src = step.image;
  image.alt = `${step.title}示意图`;
  image.loading = "lazy";
  image.width = 640;
  image.height = 400;
  media.append(image);

  const body = createElement("div", "tutorial-body");
  const badge = createElement("span", "step-badge", String(index + 1).padStart(2, "0"));
  const title = createElement("h3", "", step.title);
  const description = createElement("p", "", step.description);
  const notes = createElement("ul", "note-list");
  step.notes.forEach((note) => notes.append(createElement("li", "", note)));
  body.append(badge, title, description, notes);
  article.append(media, body);
  return article;
};

const renderTutorial = () => {
  const section = createElement("section", "tutorial-section");
  section.id = "tutorial";
  const list = createElement("div", "tutorial-list");
  tutorialSteps.forEach((step, index) => list.append(renderTutorialStep(step, index)));
  section.append(
    renderSectionHeader("图文教程", "按步骤操作，不跳步更省时间", "初版使用占位示意图，后续替换成你的真实教程截图即可。"),
    list
  );
  return section;
};

const renderFloatingNav = () => {
  const nav = createElement("nav", "floating-nav");
  nav.setAttribute("aria-label", "快速导航");

  const support = createElement("a", "floating-link", "售后") as HTMLAnchorElement;
  support.href = "#support";
  const tutorial = createElement("a", "floating-link", "教程") as HTMLAnchorElement;
  tutorial.href = "#tutorial";
  const top = createElement("a", "floating-link icon-only") as HTMLAnchorElement;
  top.href = "#top";
  top.setAttribute("aria-label", "返回顶部");
  top.append(createIcon("top"));

  nav.append(support, tutorial, top);
  return nav;
};

const observeReveal = () => {
  const targets = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  // 滚动进入视口后再显示，避免页面一次性动效过多。
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  targets.forEach((target) => observer.observe(target));
};

const renderApp = () => {
  app.replaceChildren(renderHero(), renderSupport(), renderTutorial(), renderFloatingNav());
  observeReveal();
};

renderApp();
