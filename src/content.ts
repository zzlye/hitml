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

export type ModelListItem = {
  name: string;
  pricingName: string;
  pricingNames?: string[];
  resolutions: string[];
  fallbackPrice: number;
};

export type ModelListModule = {
  id: string;
  title: string;
  pricingBaseUrl: string;
  pricingPath: string;
  pricingProxyPath: string;
  items: ModelListItem[];
};

export const introModule = {
  id: "intro",
  title: "gpt-image-2+nano-banana-2+nano-banana-pro",
  actionLabel: "在线使用：https://zzlye.xyz/",
  actionUrl: "https://zzlye.xyz/"
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

export const modelListModule = {
  id: "model-list",
  title: "模型列表",
  pricingBaseUrl: "https://api.zzlye.xyz/v1",
  pricingPath: "/api/pricing",
  pricingProxyPath: "/newapi/pricing",
  items: [
    {
      name: "gpt-image-2",
      pricingName: "gpt-image-2",
      resolutions: ["1K"],
      fallbackPrice: 0.04
    },
    {
      name: "gpt-image-2-4k",
      pricingName: "gpt-image-2-4k",
      resolutions: ["1K", "2K", "4K"],
      fallbackPrice: 0.09
    },
    {
      name: "gpt-image-2.5",
      pricingName: "gpt-image-2.5",
      pricingNames: ["gpt-image-2.5-flare", "gpt-image-2.5-sunburst"],
      resolutions: ["1K"],
      fallbackPrice: 0.03
    },
    {
      name: "Nano-Banana-2",
      pricingName: "nano-banana-2",
      resolutions: ["1K", "2K", "4K"],
      fallbackPrice: 0.06
    },
    {
      name: "Nano-Banana-2.1",
      pricingName: "nano-banana-2.1",
      resolutions: ["1K", "2K", "4K"],
      fallbackPrice: 0.07
    },
    {
      name: "Nano-Banana-Pro",
      pricingName: "nano-banana-pro",
      resolutions: ["1K", "2K", "4K"],
      fallbackPrice: 0.09
    }
  ]
} satisfies ModelListModule;

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
            href: "https://zzlye.xyz/",
            label: "https://zzlye.xyz/"
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
    id: "api-docs",
    title: "接口文档",
    description: "点击链接查看接口文档",
    tone: "notes",
    cards: [
      {
        tag: "统一文档",
        title: "文运工坊接口文档",
        description: "图片与视频模型的接口说明、调用示例与结果下载。",
        notes: [
          {
            text: "打开文档：",
            href: "/docs/index.html#/",
            label: "查看接口文档"
          }
        ]
      }
    ]
  }
];
