export type ContactItem = {
  title: string;
  description: string;
  image: string;
  hint: string;
};

export type TutorialCard = {
  tag: string;
  title: string;
  description: string;
  notes: string[];
  image?: string;
};

export type TutorialModule = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  tone: "visual" | "notes";
  cards: TutorialCard[];
  footer: string;
};

export const introModule = {
  id: "intro",
  kicker: "模块 01",
  title: "gpt-image-2+nano-banana-2+nano-banana-pro",
  description: "标题、售后和两类教程拆成四个模块，后续替换图片和文字会更顺手。",
  caption: "首屏标题会比之前更小一点，页面风格保持模块化和轻量叠层感。"
};

export const supportModule = {
  id: "support",
  kicker: "模块 02",
  title: "售后",
  description: "群聊和客服放在同一个模块里，扫码入口和补充说明集中展示。",
  contacts: [
    {
      title: "售后群聊",
      description: "扫码加入群聊，查看公告、统一答疑和后续通知。",
      image: "/images/contact-group.jpg",
      hint: "群聊优先"
    },
    {
      title: "售后客服",
      description: "扫码添加客服微信，适合一对一沟通和补充问题。",
      image: "/images/contact-wechat.jpg",
      hint: "单独联系"
    }
  ] satisfies ContactItem[],
  footer: "后续可以把这里替换成售后规则、答疑提醒或优惠说明。"
};

export const tutorialModules: TutorialModule[] = [
  {
    id: "tutorial-visual",
    kicker: "模块 03",
    title: "教程一 · 图文流程",
    description: "适合写步骤、截图和顺序操作。",
    tone: "visual",
    cards: [
      {
        tag: "步骤 01",
        title: "先确认入口",
        description: "先找到售后入口，再继续往下查看教程。",
        image: "/images/tutorial-step-1.svg",
        notes: ["先保存二维码", "需要时优先联系群聊"]
      },
      {
        tag: "步骤 02",
        title: "准备需要的信息",
        description: "把账号、订单或截图先整理好，排查会更快。",
        image: "/images/tutorial-step-2.svg",
        notes: ["截图尽量完整", "不要漏掉关键提示"]
      }
    ],
    footer: "这一块适合放需要照着点的内容，尽量保持顺序清楚。"
  },
  {
    id: "tutorial-notes",
    kicker: "模块 04",
    title: "教程二 · 补充说明",
    description: "适合写注意事项、FAQ 和纯文字提示。",
    tone: "notes",
    cards: [
      {
        tag: "说明 01",
        title: "注意事项",
        description: "放一些不能忽略的规则和提醒。",
        notes: ["不要跳过关键步骤", "有异常先截图再反馈", "保持信息简洁清楚"]
      },
      {
        tag: "说明 02",
        title: "常见问题",
        description: "把最容易被问到的内容写在这里。",
        notes: ["二维码识别失败", "不知道从哪一步开始", "要联系哪一个入口"]
      }
    ],
    footer: "这一块可以换成 FAQ、补充规则、文字说明或其他类型的内容。"
  }
];
