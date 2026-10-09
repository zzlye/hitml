import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const content = readFileSync(new URL("../src/content.ts", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");

// 主页模块、目录和图片资源必须同步移除已下线的接入教程。
test("首页不再包含外部接入模块", () => {
  assert.doesNotMatch(content, /tutorial-notes|外部接入|external-access|Cherry Studio/);
  assert.doesNotMatch(main, /tutorial-notes|外部接入/);
  assert.match(content, /id: "api-docs"/);
  assert.match(main, /createNavLink\("#api-docs", "跳转到接口文档区域", "5\. 接口文档"\)/);
  assert.equal(existsSync(new URL("../public/images/external-access/", import.meta.url)), false);
});

// 模型列表需要展示服务器新增的两个公开型号，并保留价格同步用的后端名称。
test("模型列表包含香蕉2.1和无后缀的GPT Image 2.5", () => {
  assert.match(content, /name: "gpt-image-2\.5"/);
  assert.match(content, /pricingNames: \["gpt-image-2\.5-flare", "gpt-image-2\.5-sunburst"\]/);
  assert.match(content, /name: "gpt-image-2\.5-4k"/);
  assert.match(content, /pricingNames: \["gpt-image-2\.5-flare-4k", "gpt-image-2\.5-sunburst-4k"\]/);
  assert.match(content, /name: "Nano-Banana-2\.1"/);
  assert.match(content, /pricingName: "nano-banana-2\.1"/);
  assert.match(main, /modelPriceNames/);
});

