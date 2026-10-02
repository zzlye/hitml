import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 直接验证发布时使用的文档数据，防止页面和导出内容分别维护后发生偏差。
const { pages, mediaModels, API_ORIGIN } = await import("../public/docs/content.js");
const { pageMarkdown, renderPage, resolveRoute } = await import("../public/docs/document.js");

test("图片与视频文档页面完整且编号唯一", () => {
  assert.deepEqual(pages.map((page) => page.id), ["start", "models", "image2", "banana", "seedream", "video", "tasks", "errors"]);
  assert.equal(new Set(pages.map((page) => page.id)).size, pages.length);
  assert.equal(API_ORIGIN, "https://api.zzlye.xyz");
});

test("公开模型包含服务器配置的十四个图片和视频名称", () => {
  assert.equal(mediaModels.length, 14);
  for (const name of ["gpt-image-2.5-flare-满血", "gpt-image-2.5-sunburst-4k", "nano-banana-pro", "sd5p", "seedream-5-pro", "wan-3.0", "wan-3.0-1080p"]) {
    assert.ok(mediaModels.some((model) => model.name === name), name);
  }
  assert.ok(mediaModels.every((model) => ["image2", "banana", "seedream", "video"].includes(model.page)));
});

test("旧链接仍可使用，未知路径回到接入指南", () => {
  assert.equal(resolveRoute("#/banana"), "banana");
  assert.equal(resolveRoute("#/image2"), "image2");
  assert.equal(resolveRoute("#/"), "start");
  assert.equal(resolveRoute("#/missing"), "start");
});

test("网页与Markdown共用正文，所有示例JSON均可解析", () => {
  for (const page of pages) {
    const markdown = pageMarkdown(page);
    const html = renderPage(page);
    assert.ok(markdown.startsWith("# " + page.title));
    assert.ok(html.includes("<h1>" + page.title + "</h1>"));
    assert.ok(!html.includes("undefined"));
    for (const block of page.blocks) {
      if (block.type === "code" && block.lang === "json") assert.doesNotThrow(() => JSON.parse(block.value), page.id);
      if (block.type === "code") assert.ok(markdown.includes(block.value.trim()), page.id);
    }
  }
});

test("香蕉走原生协议，异步状态和任务路径使用本服务器契约", () => {
  const banana = pageMarkdown(pages.find((page) => page.id === "banana"));
  assert.ok(banana.includes("/v1beta/models/nano-banana-2:generateContent"));
  assert.ok(banana.includes("inlineData"));
  const tasks = pageMarkdown(pages.find((page) => page.id === "tasks"));
  for (const state of ["pending", "processing", "waiting", "succeeded", "failed", "cancelled"]) assert.ok(tasks.includes(state));
  assert.ok(tasks.includes("Prefer: respond-async"));
  assert.ok(tasks.includes("result_expired"));
  assert.ok(tasks.includes("/v1/tasks/"));
});

test("视频示例保留真实时长和分辨率字段", () => {
  const video = pageMarkdown(pages.find((page) => page.id === "video"));
  assert.ok(video.includes("/v1/videos"));
  assert.ok(video.includes("duration"));
  assert.ok(video.includes("resolution"));
  assert.ok(video.includes("input_reference"));
});

test("文档不包含旧域名、私有地址或凭据", () => {
  const text = pages.map(pageMarkdown).join("\n");
  assert.ok(!/bafang|zzlye\.xyz:60|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}|ssh|password/i.test(text));
  assert.ok(!text.includes("每90秒"));
  assert.ok(!text.includes("会被忽略，默认按 medium"));
  const html = readFileSync(new URL("../public/docs/index.html", import.meta.url), "utf8");
  assert.ok(html.includes("docs-nav"));
});

test("导出表格正确转义竖线，代码围栏不会被示例截断", () => {
  const page = { title: "导出测试", lead: "", blocks: [
    { type: "table", headers: ["字段"], rows: [["a|b"]] },
    { type: "code", lang: "text", value: "```\n示例" }
  ] };
  const markdown = pageMarkdown(page);
  assert.ok(markdown.includes("a\\|b"));
  assert.ok(markdown.includes("````text"));
});

test("页面转义占位符和HTML，任务对象字段保持真实契约", () => {
  const page = { title: "<script>", lead: "<API_KEY>", blocks: [] };
  const html = renderPage(page);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;API_KEY&gt;"));
  const taskPage = pages.find((entry) => entry.id === "tasks");
  const submitted = taskPage.blocks.find((block) => block.type === "code" && block.lang === "json");
  assert.equal(JSON.parse(submitted.value).object, "image_generation");
});
