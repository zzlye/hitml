import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pages, mediaModels } from '../public/docs/content.js';
import { pageMarkdown, renderPage, resolveRoute } from '../public/docs/document.js';
import { MJ_SIZES, createMjClient, mjCommonRows, parseMjTaskResponse } from '../public/docs/midjourney-details.js';

test('目录只保留线上实际提供的mj-v8.2', () => {
  assert.deepEqual(pages.filter(page => page.id.startsWith('mj-')).map(page => page.id), ['mj-v8.2']);
  assert.ok(!mediaModels.some(model => model.name === 'mj-niji7'));
  assert.equal(resolveRoute('#/mj-v8.2'), 'mj-v8.2');
  assert.equal(resolveRoute('#/mj-niji7'), 'image2');
});

test('mj-v8.2页面只包含自己的7项参数和独立示例', () => {
  const page = pages.find(item => item.id === 'mj-v8.2');
  assert.equal(page.title, 'mj-v8.2');
  const rows = page.blocks.filter(block => block.type === 'table' && block.headers[0] === '参数').flatMap(block => block.rows);
  assert.equal(rows.length, 7);
  assert.deepEqual(rows.map(row => row[0]), mjCommonRows.map(row => row[0]));
  assert.ok(!pageMarkdown(page).includes('mj-niji7'));
  assert.ok(!renderPage(page).includes('mj-niji7'));
  const source = page.blocks.find(block => block.lang === 'javascript').value;
  assert.equal(source.replaceAll('\r\n', '\n'), readFileSync(new URL('../public/docs/examples/mj-v8.2.mjs', import.meta.url), 'utf8').replaceAll('\r\n', '\n'));
  for (const ratio of MJ_SIZES) assert.ok(pageMarkdown(page).includes(ratio), ratio);
});

test('任务解析兼容西米露的顶层、data包装和result.data图片结构', () => {
  const imageUrls = ['https://example.com/1.png', 'https://example.com/2.png'];
  const cases = [
    [{ task_id: 'top-task', status: 'COMPLETED', result: { data: { image_urls: imageUrls } } }, '', 'top-task'],
    [{ data: { task_id: 'data-task', status: 'succeeded', result: { data: { image_urls: imageUrls } } } }, '', 'data-task'],
    [{ data: { status: 'success', result: { data: { image_urls: imageUrls } } } }, 'header-task', 'header-task']
  ];
  for (const [value, headerTaskId, taskId] of cases) {
    const parsed = parseMjTaskResponse(value, headerTaskId);
    assert.equal(parsed.taskId, taskId);
    assert.equal(parsed.status, value.status?.toLowerCase() || value.data.status);
    assert.deepEqual(parsed.images, imageUrls);
  }
});

test('任务解析支持失败字段，且示例包含实际状态和字段路径', () => {
  const parsed = parseMjTaskResponse({ data: { task_id: 'failed-task', status: 'failed', error_message: '上游失败' } });
  assert.deepEqual(parsed, {
    taskId: 'failed-task', status: 'failed', images: [], error: '上游失败',
    raw: { data: { task_id: 'failed-task', status: 'failed', error_message: '上游失败' } }
  });
  const page = pages.find(item => item.id === 'mj-v8.2');
  const markdown = pageMarkdown(page);
  for (const word of ['X-NewAPI-Task-Id', 'data.task_id', 'data.status', 'image_urls', 'completed', 'succeeded', 'success']) assert.ok(markdown.includes(word), word);
  assert.ok(createMjClient().includes('const model = \'mj-v8.2\';'));
});
