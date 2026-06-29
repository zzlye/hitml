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
  notes: TutorialNote[];
  image?: string;
};

export type TutorialNote = string | {
  text: string;
  href: string;
  label: string;
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
  actionLabel: "在线使用：https://zzlye.xyz:90",
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
      title: "售后交流群",
      image: "/images/contact-group.webp",
      alt: "售后交流群二维码",
      actionLabel: "点击链接加入群聊【文运工坊】",
      actionUrl: "https://qm.qq.com/q/ugpXlSuJXO"
    }
  ] satisfies ContactItem[]
};

export const tutorialModules: TutorialModule[] = [
  {
    id: "tutorial-visual",
    title: "在线使用",
    description: "按照步骤即可使用",
    tone: "visual",
    cards: [
      {
        tag: "步骤 01",
        title: "打开在线使用页面",
        description: "复制 key 后打开在线使用地址，点击右上角的设置。",
        image: "/images/online-use/step-1.webp",
        notes: [
          {
            text: "地址：",
            href: "https://zzlye.xyz:90",
            label: "https://zzlye.xyz:90"
          }
        ]
      },
      {
        tag: "步骤 02",
        title: "填写 API key",
        description: "将得到的 key 填写在文运站的API key内，填写完成后即可使用",
        image: "/images/online-use/step-2.webp",
        notes: ["填写完成后关闭设置窗口", "关闭后即可开始在线使用"]
      },
      {
        tag: "步骤 03",
        title: "切换画布工坊",
        description: "如需使用画布，点击左上角画布工坊切换即可。",
        image: "/images/online-use/step-3.webp",
        notes: ["需要画布时再切换", "不使用画布可保持当前页面"]
      }
    ]
  },
  {
    id: "tutorial-notes",
    title: "外部接入",
    description: "填写url 和 key调用模型",
    tone: "visual",
    cards: [
      {
        tag: "步骤 01",
        title: "打开 Cherry Studio 设置",
        description: "以 Cherry Studio 为例，先进入设置页面。",
        image: "/images/external-access/step-1.webp",
        notes: ["准备好购买的 API key", "后面会把 url 和 key 填到对应位置"]
      },
      {
        tag: "步骤 02",
        title: "添加供应商",
        description: "在设置中点击添加供应商，名称可以随意填写。",
        image: "/images/external-access/step-2.webp",
        notes: ["供应商名称方便自己识别即可", "名称不影响实际使用"]
      },
      {
        tag: "步骤 03",
        title: "确认供应商信息",
        description: "添加后进入供应商配置页面，继续填写接入信息。",
        image: "/images/external-access/step-3.webp",
        notes: ["确认进入的是刚添加的供应商", "下一步填写接口地址和 key"]
      },
      {
        tag: "步骤 04",
        title: "填写 url 和 API key",
        description: "将设置里的 url 和购买的 API key 填入对应位置。",
        image: "/images/external-access/step-4.webp",
        notes: ["重点：url 和 key 需要分别填到对应输入框", "不要把 url 和 key 粘贴反了"]
      },
      {
        tag: "步骤 05",
        title: "获取模型列表",
        description: "填写完成后点击获取模型列表，等待模型刷新出来。",
        image: "/images/external-access/step-5.webp",
        notes: ["如果没有刷新出来，先检查 url 和 key 是否填写正确"]
      },
      {
        tag: "步骤 06",
        title: "选择模型",
        description: "在模型列表中选择需要使用的模型。",
        image: "/images/external-access/step-6.webp",
        notes: ["按需求选择图片模型或 nano-banana 模型"]
      },
      {
        tag: "步骤 07",
        title: "回到对话页面",
        description: "配置完成后回到对话页面，确认当前供应商和模型可用。",
        image: "/images/external-access/step-7.webp",
        notes: ["上方显示对应模型后即可开始使用"]
      },
      {
        tag: "步骤 08",
        title: "切换可用模型",
        description: "需要切换时，在模型列表里选择其他已添加模型。",
        image: "/images/external-access/step-8.webp",
        notes: ["模型列表显示正常就说明接入成功"]
      },
      {
        tag: "步骤 09",
        title: "开始使用",
        description: "在上方选择模型后即可正常使用。",
        image: "/images/external-access/step-9.webp",
        notes: ["如果生成失败，优先检查 key、余额和当前模型选择"]
      },
      {
        tag: "步骤 10",
        title: "确认效果",
        description: "确认模型可以正常调用后即可继续使用。",
        image: "/images/external-access/step-10.webp",
        notes: ["能正常返回内容就说明外部接入完成"]
      }
    ]
  }
];
