import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const content = readFileSync(new URL("../src/content.ts", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");

// 在线入口、教程和Doro同步迁移，API仍使用独立域名。
test("所有在线使用入口共用新域名且不影响API地址", () => {
  assert.match(content, /export const ONLINE_USE_URL = "https:\/\/xn--v5z30ywuk\.com"/);
  assert.match(content, /actionLabel: `在线使用：\$\{ONLINE_USE_URL\}`/);
  assert.match(content, /actionUrl: ONLINE_USE_URL/);
  assert.equal([...content.matchAll(/href: ONLINE_USE_URL/g)].length, 2);
  assert.equal([...content.matchAll(/label: ONLINE_USE_URL/g)].length, 2);
  assert.match(main, /const DORO_TARGET_URL = introModule\.actionUrl/);
  assert.doesNotMatch(content + main, /https:\/\/zzlye\.xyz(?:\/|["\s]|$)/);
  assert.match(content, /pricingBaseUrl: "https:\/\/api\.zzlye\.xyz\/v1"/);
  assert.match(content, /href: "https:\/\/api\.zzlye\.xyz\/"/);
});

// 主页模块、目录和图片资源必须同步移除已下线的接入教程。
test("首页不再包含外部接入模块", () => {
  assert.doesNotMatch(content, /tutorial-notes|外部接入|external-access|Cherry Studio/);
  assert.doesNotMatch(main, /tutorial-notes|外部接入/);
  assert.match(content, /id: "api-docs"/);
  assert.match(main, /createNavLink\("#api-docs", "跳转到接口文档区域", "5\. 接口文档"\)/);
  assert.equal(existsSync(new URL("../public/images/external-access/", import.meta.url)), false);
});

// 模型列表需要展示服务器新增的两个公开型号，并保留价格同步用的后端名称。
test("模型列表包含香蕉2.1、基础GPT Image 2.5与两款官渠型号", () => {
  assert.match(content, /name: "gpt-image-2\.5"/);
  assert.match(content, /pricingNames: \["gpt-image-2\.5-flare", "gpt-image-2\.5-sunburst"\]/);
  assert.doesNotMatch(content, /gpt-image-2\.5(?:-(?:flare|sunburst))?-4k/);
  for (const family of ['flare', 'sunburst']) {
    assert.ok(content.includes('name: "gpt-image-2.5-' + family + '-官渠"'));
    assert.ok(content.includes('pricingName: "gpt-image-2.5-' + family + '-官渠"'));
  }
  assert.match(content, /name: "Nano-Banana-2\.1"/);
  assert.match(content, /pricingName: "nano-banana-2\.1"/);
  assert.match(main, /modelPriceNames/);
});

