import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { pages, mediaModels } from '../public/docs/content.js';
import { pageMarkdown, renderPage, resolveRoute } from '../public/docs/document.js';
import { MJ_SIZES, createMjClient, mjCommonRows, parseMjTaskResponse } from '../public/docs/midjourney-details.js';

test('目录删除niji7并保留mj-v8.2独立章节', () => {
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

test('任务解析兼容实际的顶层加data包装、响应头任务号和受控图片地址', () => {
  const imageUrls = ['/task-media/top-task/media/0?expires=1&signature=x', 'data:image/png;base64,YQ=='];
  const value = {
    task_id: 'top-task', status: 'succeeded', result_expired: false,
    data: { task_id: 'top-task', status: 'completed', result: { data: { image_urls: imageUrls } } }
  };
  const parsed = parseMjTaskResponse(value, '', 'https://api.zzlye.xyz/v1');
  assert.equal(parsed.taskId, 'top-task');
  assert.equal(parsed.status, 'completed');
  assert.deepEqual(parsed.images, ['https://api.zzlye.xyz/task-media/top-task/media/0?expires=1&signature=x', 'data:image/png;base64,YQ==']);
  assert.equal(parsed.resultExpired, false);

  const headerParsed = parseMjTaskResponse({ data: { status: 'processing' } }, 'header-task');
  assert.equal(headerParsed.taskId, 'header-task');
  assert.equal(headerParsed.status, 'processing');
});

test('任务解析保留失败和过期状态，文档说明实际字段', () => {
  const failed = parseMjTaskResponse({ data: { task_id: 'failed-task', status: 'failed', error_message: '上游失败' } });
  assert.equal(failed.error, '上游失败');
  assert.equal(failed.status, 'failed');
  const expired = parseMjTaskResponse({ task_id: 'expired-task', status: 'succeeded', result_expired: true });
  assert.equal(expired.resultExpired, true);
  const markdown = pageMarkdown(pages.find(item => item.id === 'mj-v8.2'));
  for (const word of ['X-NewAPI-Task-Id', 'data.task_id', 'data.status', 'image_urls', 'result_expired', 'completed', 'succeeded']) assert.ok(markdown.includes(word), word);
  assert.ok(createMjClient().includes("const model = 'mj-v8.2';"));
});

// 模拟真实任务接口，不访问生成服务，也不产生费用。
const bootstrap = String.raw`import { createRequire, syncBuiltinESMExports } from 'node:module';
import { writeFileSync } from 'node:fs';
const calls = [], delays = [];
const scenario = process.env.MJ_SCENARIO;
let now = Date.now(), polls = 0;
Date.now = () => now;
createRequire(import.meta.url)('node:timers/promises').setTimeout = async ms => { delays.push(ms); now += ms; };
syncBuiltinESMExports();
process.on('exit', () => writeFileSync('calls.json', JSON.stringify({ calls, delays })));
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
const complete = (urls = [0, 1, 2, 3].map(index => '/task-media/task_test/media/' + index + '?expires=999&signature=test')) => ({
  id: 'task_test', task_id: 'task_test', status: 'succeeded', result_expired: false,
  data: { task_id: 'task_test', status: 'completed', progress: '100%', result: { data: { image_urls: urls } } },
  result: { data: { image_urls: urls } }
});
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  calls.push({ url: url.href, method: options.method || 'GET', headers: options.headers, body: options.body, redirect: options.redirect });
  if (url.origin === 'https://api.zzlye.xyz') {
    if (url.pathname.startsWith('/task-media/')) return new Response('mock-image:' + url.pathname, { headers: { 'Content-Type': 'image/png' } });
    if (options.headers?.Authorization !== 'Bearer test-key' && url.pathname.startsWith('/v1/')) throw new Error('缺少鉴权');
    if (url.pathname === '/v1/midjourney/generations') {
      if (options.method !== 'POST') throw new Error('创建端点方法错误');
      if (scenario === 'immediate') return json(complete(['data:image/png;base64,YWJj']));
      if (scenario === 'header-id') return new Response(null, { status: 202, headers: { 'X-NewAPI-Task-Id': 'task_test', 'Retry-After': '1' } });
      return json({ id: 'task_test', task_id: 'task_test', status: 'processing', data: { task_id: 'task_test', status: 'processing', progress: '0%' } }, 202, { 'Retry-After': '1' });
    }
    if (url.pathname !== '/v1/tasks/task_test') throw new Error('查询端点错误');
    polls++;
    if (scenario === 'retry') {
      if (polls === 1) return new Response(null, { status: 408 });
      if (polls === 2) return new Response(null, { status: 429, headers: { 'Retry-After': '2' } });
      if (polls === 3) return new Response(null, { status: 503 });
      if (polls === 4) throw new Error('模拟查询网络中断');
      if (polls === 5) return json({ data: { task_id: 'task_test', status: 'processing', progress: '50%' } });
    }
    if (scenario === 'failed') return json({ data: { task_id: 'task_test', status: 'failed', error_code: 'GENERATION_FAILED', error_message: '生成失败' } });
    if (scenario === 'expired') return json({ task_id: 'task_test', status: 'succeeded', result_expired: true, data: { status: 'completed' } });
    if (scenario === 'empty') return json({ data: { task_id: 'task_test', status: 'completed', result: { data: { image_urls: [] } } } });
    if (scenario === 'no-status') return json({ data: { task_id: 'task_test' } });
    if (scenario === 'data-url') return json(complete(['/task-media/task_test/media/0?expires=999&signature=test', 'data:image/png;base64,YWJj', 'https://cdn.example/image-3.png', 'http://cdn.example/image-4.png']));
    return json(complete());
  }
  if (url.origin !== 'https://cdn.example' && url.origin !== 'http://cdn.example' && url.origin !== 'https://api.zzlye.xyz') throw new Error('未预期的外部地址');
  if (options.headers?.Authorization) throw new Error('外部图片下载泄露了Key');
  return new Response('mock-image:' + url.pathname, { headers: { 'Content-Type': 'image/png' } });
};
`;

function execute(scenario, { resume = false, request } = {}) {
  const dir = mkdtempSync(join('D:/tmp', 'hitml-mj-example-'));
  try {
    const source = pages.find(page => page.id === 'mj-v8.2').blocks.find(block => block.lang === 'javascript').value;
    writeFileSync(join(dir, 'generate.mjs'), source);
    writeFileSync(join(dir, 'mock.mjs'), bootstrap);
    if (resume) writeFileSync(join(dir, 'saved.json'), JSON.stringify({ task_id: 'task_test' }));
    if (request) writeFileSync(join(dir, 'request.json'), JSON.stringify(request));
    const child = spawnSync(process.execPath, ['--import', pathToFileURL(join(dir, 'mock.mjs')).href, join(dir, 'generate.mjs'), ...(resume ? ['saved.json'] : [])], {
      cwd: dir, encoding: 'utf8', timeout: 8000,
      env: { ...process.env, WENYUN_API_KEY: 'test-key', WENYUN_MJ_REQUEST: request ? 'request.json' : '', MJ_SCENARIO: scenario }
    });
    assert.ok(!child.error, child.error?.message);
    const calls = JSON.parse(readFileSync(join(dir, 'calls.json'), 'utf8'));
    const files = readdirSync(dir).filter(file => /^image-\d+\.(?:png|jpg|webp)$/.test(file));
    return { ...calls, files, status: child.status, output: child.stdout + child.stderr,
      saved: existsSync(join(dir, 'task.json')) ? JSON.parse(readFileSync(join(dir, 'task.json'), 'utf8')) : null };
  } finally {
    // 示例验证结束后移除独立副本，不向仓库保存测试生成物。
    rmSync(dir, { recursive: true, force: true });
  }
}

test('示例按提交、轮询、完成顺序运行，只下载四张图片', () => {
  const result = execute('success');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.files.length, 4);
  assert.equal(result.saved.task_id, 'task_test');
  assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
  assert.equal(result.calls.filter(call => call.url.endsWith('/v1/tasks/task_test')).length, 1);
  assert.equal(result.calls.filter(call => call.url.startsWith('https://api.zzlye.xyz/task-media/')).length, 4);
  assert.ok(result.calls.filter(call => call.url.startsWith('https://api.zzlye.xyz/task-media/')).every(call => !call.headers));
});

test('首响应直接完成时使用首响应，不重复查询', () => {
  const result = execute('immediate');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
  assert.equal(result.calls.filter(call => call.url.endsWith('/v1/tasks/task_test')).length, 0);
  assert.deepEqual(result.files, ['image-1.png']);
});

test('首响应空正文时使用响应头任务号，并且恢复查询不重复提交', () => {
  const first = execute('header-id');
  assert.equal(first.status, 0, first.output);
  assert.equal(first.saved.task_id, 'task_test');
  const resumed = execute('success', { resume: true });
  assert.equal(resumed.status, 0, resumed.output);
  assert.equal(resumed.calls.filter(call => call.method === 'POST').length, 0);
});

test('查询408、429、5xx和断流只重试GET，不重发生成请求', () => {
  const result = execute('retry');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
  assert.equal(result.calls.filter(call => call.url.endsWith('/v1/tasks/task_test')).length, 6);
  assert.ok(result.delays.some(value => value >= 2000));
});

for (const [scenario, message] of [['failed', '生成失败'], ['expired', '结果已过期'], ['empty', '没有image_urls'], ['no-status', '缺少status']]) {
  test('示例处理' + scenario + '并停止等待', () => {
    const result = execute(scenario);
    assert.notEqual(result.status, 0);
    assert.ok(result.output.includes(message), result.output);
    assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
    assert.equal(result.files.length, 0);
  });
}

test('结果支持相对签名地址、Data URL和HTTP(S)外部地址', () => {
  const result = execute('data-url');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.files.length, 4);
  assert.ok(result.calls.filter(call => call.url.startsWith('https://cdn.example/')).every(call => !call.headers));
});

test('请求模型不匹配或n不是1时不会提交', () => {
  const modelResult = execute('success', { request: { model: 'mj-niji7', prompt: '橘子', n: 1 } });
  assert.notEqual(modelResult.status, 0);
  assert.ok(modelResult.output.includes('请求文件中的模型名称必须为mj-v8.2'));
  assert.equal(modelResult.calls.length, 0);
  const countResult = execute('success', { request: { model: 'mj-v8.2', prompt: '橘子', n: 4 } });
  assert.notEqual(countResult.status, 0);
  assert.equal(countResult.calls.length, 0);
});
