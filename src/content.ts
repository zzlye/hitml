export type ContactItem = {
  title: string;
  image: string;
  alt: string;
  actionLabel?: string;
  actionUrl?: string;
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
  title: string;
  description: string;
  tone: "visual" | "notes";
  cards: TutorialCard[];
};

export const introModule = {
  id: "intro",
  title: "gpt-image-2+nano-banana-2+nano-banana-pro",
  actionLabel: "在线使用",
  actionUrl: "https://zzlye.xyz:90"
};

export const supportModule = {
  id: "support",
  title: "售后 & 进群",
  description: "扫码添加微信或加群",
  services: ["售后咨询", "续费服务", "加入用户群"],
  contacts: [
    {
      title: "微信客服",
      image: "/images/contact-wechat.jpg",
      alt: "微信客服二维码"
    },
    {
      title: "用户群",
      image: "/images/contact-group.jpg",
      alt: "用户群二维码",
      actionLabel: "点击链接加入群聊【文运工坊】",
      actionUrl: "https://qm.qq.com/q/ugpXlSuJXO"
    }
  ] satisfies ContactItem[]
};

export const tutorialModules: TutorialModule[] = [
  {
    id: "tutorial-visual",
    title: "教程一 · 图文流程",
    description: "按下面步骤完成基础操作。",
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
    ]
  },
  {
    id: "tutorial-notes",
    title: "教程二 · 补充说明",
    description: "这里整理常见注意事项和补充说明。",
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
    ]
  }
];
