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

const createIcon = (name: "spark" | "chat" | "book" | "note") => {
  const icons = {
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/><path d="M19 15l.8 2.7L22 18.5l-2.2.8L19 22l-.8-2.7-2.2-.8 2.2-.8L19 15z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.8A4.8 4.8 0 0 1 9.8 2h4.4A4.8 4.8 0 0 1 19 6.8v2.4a4.8 4.8 0 0 1-4.8 4.8H12l-4.4 3.3A1 1 0 0 1 6 16.5V14h-.2A4.8 4.8 0 0 1 1 9.2V6.8z"/><path d="M18 8.5A4 4 0 0 1 22 12.5v1.7a4 4 0 0 1-4 4h-.1v1.5a.9.9 0 0 1-1.4.7l-3-2.2h-1.7a4 4 0 0 1-3.9-3.2"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H21v16H7.5A2.5 2.5 0 0 0 5 20.5v-16z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H21v-5H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M9 6h8M9 10h6"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M15 3.5V8h4"/><path d="M8.5 11.5h7M8.5 15h5"/></svg>'
  };
  const span = createElement("span", "icon");
  span.innerHTML = icons[name];
  return span;
};

const renderChip = (icon: "spark" | "chat" | "book" | "note", text: string) => {
  const chip = createElement("span", "chip");
  chip.append(createIcon(icon), document.createTextNode(text));
  return chip;
};

const renderModuleHeader = (kicker: string, title: string, description: string) => {
  const header = createElement("div", "module-header reveal");
  const kickerNode = createElement("p", "module-kicker");
  kickerNode.append(createIcon("spark"), document.createTextNode(kicker));
  header.append(kickerNode, createElement("h2", "module-title", title), createElement("p", "module-description", description));
  return header;
};

const renderIntroModule = () => {
  const section = createElement("section", "module module-intro reveal is-visible");
  section.id = introModule.id;

  const card = createElement("article", "module-card module-card--intro");
  const copy = createElement("div", "intro-copy");
  const kicker = createElement("p", "module-kicker");
  kicker.append(createIcon("spark"), document.createTextNode(introModule.kicker));
  copy.append(
    kicker,
    createElement("h1", "intro-title", introModule.title),
    createElement("p", "intro-description", introModule.description),
    createElement("p", "intro-caption", introModule.caption),
    (() => {
      const chips = createElement("div", "intro-chips");
      chips.append(renderChip("chat", "售后"), renderChip("book", "教程"), renderChip("note", "模块化"));
      return chips;
    })()
  );

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

  const footer = createElement("div", "module-footer module-footer--green");
  footer.textContent = supportModule.footer;

  card.append(
    renderModuleHeader(supportModule.kicker, supportModule.title, supportModule.description),
    grid,
    footer
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

  const footer = createElement("div", "module-footer");
  footer.textContent = moduleData.footer;

  card.append(renderModuleHeader(moduleData.kicker, moduleData.title, moduleData.description), grid, footer);
  section.append(card);
  return section;
};

const renderApp = () => {
  const shell = createElement("main", "page-shell");
  shell.append(renderIntroModule(), renderSupportModule(), ...tutorialModules.map(renderTutorialModule));
  app.replaceChildren(shell);
};

renderApp();
