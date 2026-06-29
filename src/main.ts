import "./styles.css";

import { introModule, supportModule, tutorialModules, type ContactItem, type TutorialCard, type TutorialModule } from "./content";

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
  const copy = createElement("div", "intro-copy");
  copy.append(createElement("h1", "intro-title", introModule.title));

  const visual = createElement("div", "intro-visual");
  visual.setAttribute("aria-hidden", "true");
  visual.innerHTML = `
    <span class="intro-layer intro-layer-back"></span>
    <span class="intro-layer intro-layer-front"></span>
    <div class="intro-art">
      <img src="/images/mascot.webp" alt="" width="720" height="405" />
    </div>
  `;

  card.append(copy, visual);
  section.append(card);
  return section;
};

const renderContactCard = (item: ContactItem) => {
  const card = createElement("article", "support-card reveal");
  const media = createElement("div", "support-media");
  const image = document.createElement("img");
  image.src = item.image;
  image.alt = `${item.title}二维码`;
  image.loading = "lazy";
  image.width = 360;
  image.height = 480;
  media.append(image);

  const body = createElement("div", "support-body");
  const title = createElement("h3", "support-card-title", item.title);
  const description = createElement("p", "support-card-description", item.description);
  const hint = createElement("p", "support-hint", item.hint);
  body.append(title, description, hint);
  card.append(media, body);
  return card;
};

const renderSupportModule = () => {
  const section = createElement("section", "module reveal");
  section.id = supportModule.id;

  const card = createElement("article", "module-card module-card--support");
  const grid = createElement("div", "support-grid");
  supportModule.contacts.forEach((item) => grid.append(renderContactCard(item)));

  card.append(
    renderModuleHeader(supportModule.title, supportModule.description),
    grid
  );
  section.append(card);
  return section;
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
  app.replaceChildren(renderDirectory(), shell, renderTopButton());
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
