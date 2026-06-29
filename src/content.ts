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
  actionLabel: "在线使用：点击跳转",
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
    title: "在线使用",
    description: "按下面步骤完成在线使用配置。",
    tone: "visual",
    cards: [
      {
        tag: "步骤 01",
        title: "打开在线使用页面",
        description: "复制 key 后打开在线使用地址，点击右上角的设置。",
        image: "/images/online-use/step-1.png",
        notes: ["地址：https://zzlye.xyz:90", "先复制好 key 再进入设置"]
      },
      {
        tag: "步骤 02",
        title: "填写 API key",
        description: "将得到的 key 填写在文运站的 API key 内，填写完成后关闭即可使用。",
        image: "/images/online-use/step-2.png",
        notes: ["填写完成后关闭设置窗口", "关闭后即可开始在线使用"]
      },
      {
        tag: "步骤 03",
        title: "切换画布工坊",
        description: "如需使用画布，点击左上角画布工坊切换即可。",
        image: "/images/online-use/step-3.png",
        notes: ["需要画布时再切换", "不使用画布可保持当前页面"]
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
