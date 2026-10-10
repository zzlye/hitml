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
  // 关键账号说明单独强调，避免与普通操作提示混在一起。
  notice?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
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
      name: "gpt-image-2.5-4k",
      pricingName: "gpt-image-2.5-4k",
      pricingNames: ["gpt-image-2.5-flare-4k", "gpt-image-2.5-sunburst-4k"],
      resolutions: ["1K", "2K", "4K"],
      fallbackPrice: 0.1
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
        title: "打开生图工坊",
        description: "进入文运工坊主页，点击左侧“生图工坊”，打开在线生图页面。",
        image: "/images/online-use/open-studio.webp",
        imageWidth: 1912,
        imageHeight: 948,
        notes: [
          {
            text: "主页地址：",
            href: "https://zzlye.xyz/",
            label: "https://zzlye.xyz/"
          }
        ]
      },
      {
        tag: "步骤 02",
        title: "打开注册窗口",
        description: "在生图工坊页面点击右上角“登录”，再切换到“注册”。",
        image: "/images/online-use/home-register.webp",
        imageWidth: 1912,
        imageHeight: 948,
        notes: [
          {
            text: "地址：",
            href: "https://zzlye.xyz/",
            label: "https://zzlye.xyz/"
          }
        ]
      },
      {
        tag: "步骤 03",
        title: "填写邀请码注册",
        description: "填写账号、密码和收到的邀请码，点击“注册”完成账号创建。",
        image: "/images/online-use/register.webp",
        imageWidth: 450,
        imageHeight: 342,
        notes: ["注册成功后，切换到“登录”，使用刚注册的账号和密码登录。"]
      },
      {
        tag: "步骤 04",
        title: "登录并填写兑换码",
        description: "登录后，点击右上角的账号打开账号窗口，在底部填写拿到的兑换码，再点击“兑换”。",
        image: "/images/online-use/redeem.webp",
        imageWidth: 448,
        imageHeight: 607,
        notes: ["邀请码用于注册，兑换码用于充值，请分别填写。", "兑换成功后即可正常使用。"]
      },
      {
        tag: "步骤 05",
        title: "开始生成图片",
        description: "关闭账号窗口，输入提示词，选择模型、尺寸、品质和数量，再点击右侧箭头开始生成。",
        image: "/images/online-use/generate.webp",
        imageWidth: 1912,
        imageHeight: 948,
        notes: ["需要参考图时，点击回形针图标上传图片。"]
      },
      {
        tag: "步骤 06",
        title: "切换画布工坊",
        description: "如需使用画布，点击左上角画布工坊切换即可。",
        image: "/images/online-use/step-3.webp",
        imageWidth: 126,
        imageHeight: 55,
        notes: ["需要画布时再切换", "不使用画布可保持当前页面"]
      },
      {
        tag: "步骤 07",
        title: "如何调用API",
        description: "需要在其他工具或代码中调用模型时，访问API平台并登录，创建API Key，再按照接口文档填写模型和请求参数。",
        notice: "账号通用：API平台与在线生图使用同一账号，使用已注册的账号和密码登录即可，无需重复注册。",
        notes: [
          {
            text: "API平台：",
            href: "https://api.zzlye.xyz/",
            label: "https://api.zzlye.xyz/"
          },
          "API地址：https://api.zzlye.xyz/v1",
          {
            text: "调用方法：",
            href: "/docs/index.html#/",
            label: "查看接口文档"
          }
        ]
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
