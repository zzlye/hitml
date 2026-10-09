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

