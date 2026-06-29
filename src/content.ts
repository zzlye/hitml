export type ContactItem = {
  title: string;
  description: string;
  image: string;
  hint: string;
};

export type TutorialStep = {
  title: string;
  description: string;
  image: string;
  notes: string[];
};

export const siteIntro = {
  eyebrow: "售后服务与使用教程",
  title: "这里放好售后入口，也把操作步骤讲清楚",
  subtitle: "先添加售后或加入群聊，遇到问题可以直接反馈；继续向下查看图文教程，按步骤完成操作。",
  primaryAction: "查看售后",
  secondaryAction: "查看教程"
};

export const contacts: ContactItem[] = [
  {
    title: "售后群聊",
    description: "扫码加入群聊，获取公告、答疑和后续通知。",
    image: "/images/contact-group.jpg",
    hint: "推荐先加入群聊，方便查看统一说明"
  },
  {
    title: "微信联系",
    description: "扫码添加微信，适合处理单独问题和订单沟通。",
    image: "/images/contact-wechat.jpg",
    hint: "添加时可备注来源，方便快速确认"
  }
];

export const tutorialSteps: TutorialStep[] = [
  {
    title: "第一步：确认售后入口",
    description: "先保存或扫描上方二维码，确保后续遇到问题时可以快速联系。",
    image: "/images/tutorial-step-1.svg",
    notes: ["建议优先加入群聊", "单独问题再添加微信沟通"]
  },
  {
    title: "第二步：准备需要的信息",
    description: "开始操作前，把账号、订单或截图等信息准备好，后续排查会更快。",
    image: "/images/tutorial-step-2.svg",
    notes: ["不要发送无关隐私信息", "截图尽量包含完整提示"]
  },
  {
    title: "第三步：按教程逐项操作",
    description: "按照页面中的步骤从上到下完成，每一步完成后再进入下一步。",
    image: "/images/tutorial-step-3.svg",
    notes: ["遇到异常先记录提示", "无法继续时联系售后处理"]
  }
];
