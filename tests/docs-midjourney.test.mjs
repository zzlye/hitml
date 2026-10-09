import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { pages, mediaModels } from '../public/docs/content.js';
import { pageMarkdown, renderPage, resolveRoute } from '../public/docs/document.js';
import { MJ_SIZES, MJ_ACTIONS } from '../public/docs/midjourney-details.js';

// 模拟附件中的专用任务契约，不访问真实生成服务或产生费用。
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
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  calls.push({ url: url.href, method: options.method || 'GET', headers: options.headers, body: options.body, redirect: options.redirect });
  if (url.origin === 'https://api.zzlye.xyz') {
    if (options.headers?.Authorization !== 'Bearer test-key') throw new Error('缺少鉴权');
    if (options.method === 'POST') {
      if (url.pathname !== '/v1/midjourney/generations') throw new Error('创建端点错误');
      if (scenario === 'create-error') return json({error:{message:'提交失败'}},503);
      if (scenario === 'submit-timeout') throw new Error('提交连接中断');
      if (scenario === 'no-id') return json({data:{status:'submitted'}});
      if (scenario === 'header-id') return json({data:{status:'submitted'}},200,{'X-NewAPI-Task-Id':'task_test'});
      return json({data:{task_id:'task_test',status:'submitted',progress:'0%'}},200,{'Retry-After':'5'});
    }
    if (url.pathname !== '/v1/tasks/task_test') throw new Error('查询端点错误');
    polls++;
    if (scenario === 'retry') {
      if (polls === 1) return json({},429,{'Retry-After':'8'});
      if (polls === 2) return json({},503);
      if (polls === 3) throw new Error('模拟查询网络中断');
      if (polls === 4) return json({data:{status:'submitted',progress:'50%'}});
    }
    if (scenario === 'failed') return json({data:{status:'failed',error_code:'GENERATION_FAILED',error_message:'生成失败'}});
    if (scenario === 'failed-top') return json({error_code:'GENERATION_FAILED',error_message:'生成失败'});
    if (scenario === 'unauthorized') return json({error:{message:'鉴权失败'}},401);
    if (scenario === 'gateway-envelope') return json({status:'succeeded',media:[]});
    if (scenario === 'timeout') return json({data:{status:'submitted'}});
    const result = scenario === 'describe' ? {text:'参考图的提示词'} : {data:{image_urls:Array.from({length:scenario==='upscale'?1:4},(_,i)=>'https://cdn.example/image-'+(i+1)+'.png')}};
    if (scenario === 'grid') result.data.grid_image_url = 'https://cdn.example/grid.png';
    if (scenario === 'empty') result.data.image_urls = [];
    if (scenario === 'http-image') result.data.image_urls[0] = 'http://cdn.example/image-1.png';
    return json({data:{task_id:'task_test',status:'completed',progress:'100%',result}});
  }
  if (url.origin !== 'https://cdn.example') throw new Error('未预期的外部地址');
  if (options.headers?.Authorization) throw new Error('外部图片下载泄露了Key');
  if (scenario === 'download-error') return new Response('error',{status:503});
  return new Response('mock-image:'+url.pathname,{headers:{'Content-Type':scenario==='html-image'?'text/html':'image/png'}});
};
`;

function execute(model, scenario, { resume = false, request } = {}) {
  const base = process.platform === 'win32' ? 'D:/tmp' : tmpdir();
  mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(join(base, 'hitml-mj-example-'));
  try {
    const source = pages.find(page => page.id === model).blocks.find(block => block.lang === 'javascript').value;
    writeFileSync(join(dir, 'generate.mjs'), source);
    writeFileSync(join(dir, 'mock.mjs'), bootstrap);
    if (resume) writeFileSync(join(dir, 'saved.json'), JSON.stringify({ task_id: 'task_test', action: scenario === 'describe' ? 'describe' : 'generate' }));
    if (request) writeFileSync(join(dir, 'request.json'), JSON.stringify(request));
    const child = spawnSync(process.execPath, ['--import', pathToFileURL(join(dir, 'mock.mjs')).href, join(dir, 'generate.mjs'), ...(resume ? ['saved.json'] : [])], {
      cwd: dir, encoding: 'utf8', timeout: 8000,
      env: { ...process.env, WENYUN_API_KEY: 'test-key', WENYUN_MJ_MODEL: model, WENYUN_MJ_REQUEST: request ? 'request.json' : '', MJ_SCENARIO: scenario }
    });
    assert.ok(!child.error, child.error?.message);
    const calls = JSON.parse(readFileSync(join(dir, 'calls.json'), 'utf8'));
    const files = readdirSync(dir).filter(file => /^(?:image-\d+|grid-cover)\.png$/.test(file));
    const bytes = files.map(file => readFileSync(join(dir, file), 'utf8'));
    return { ...calls, files, bytes, status: child.status, output: child.stdout + child.stderr,
      saved: existsSync(join(dir, 'task.json')) ? JSON.parse(readFileSync(join(dir, 'task.json'), 'utf8')) : null,
      result: existsSync(join(dir, 'result.json')) ? JSON.parse(readFileSync(join(dir, 'result.json'), 'utf8')) : null };
  } finally {
    // 示例验证结束后移除独立副本，不向仓库保存测试生成物。
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const model of ['mj-niji7', 'mj-v8.2']) {
  test(model + '的独立示例拒绝其他型号，不提交生成请求', () => {
    const otherModel = model === 'mj-niji7' ? 'mj-v8.2' : 'mj-niji7';
    const result = execute(model, 'success', { request: { model: otherModel, prompt: '橘子', n: 1 } });
    assert.notEqual(result.status, 0);
    assert.ok(result.output.includes('请求文件中的模型名称必须为' + model), result.output);
    assert.equal(result.calls.length, 0);
  });
  test(model + '仅提交一次，保存四张单图并隔离外部下载鉴权', () => {
    const result = execute(model, 'success');
    assert.equal(result.status, 0, result.output);
    assert.equal(result.files.length, 4);
    assert.equal(result.saved.task_id, 'task_test');
    assert.equal(result.delays[0], 5000);
    const submissions = result.calls.filter(call => call.method === 'POST');
    assert.equal(submissions.length, 1);
    const body = JSON.parse(submissions[0].body);
    assert.equal(body.model, model);
    assert.equal(body.n, 1);
    assert.equal(body.raw, false);
    assert.ok(!submissions[0].headers.Prefer);
    for (const call of result.calls.filter(call => call.url.startsWith('https://cdn.example/'))) assert.equal(call.headers, undefined);
    assert.ok(result.bytes.every(bytes => bytes.startsWith('mock-image:')));
  });
  test(model + '恢复查询不重复生成', () => {
    const result = execute(model, 'success', { resume: true });
    assert.equal(result.status, 0, result.output);
    assert.equal(result.calls.filter(call => call.method === 'POST').length, 0);
    assert.equal(result.files.length, 4);
  });
  test(model + '查询限流与网络重试保留同一个任务', () => {
    const result = execute(model, 'retry');
    assert.equal(result.status, 0, result.output);
    assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
    assert.equal(result.calls.filter(call => call.url.endsWith('/v1/tasks/task_test')).length, 5);
    assert.ok(result.delays[1] >= 8000);
  });
}

test('可选四宫格封面单独保存，不减少四张单图', () => {
  const result = execute('mj-niji7', 'grid');
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(result.files.sort(), ['grid-cover.png', 'image-1.png', 'image-2.png', 'image-3.png', 'image-4.png']);
});

test('首响应只提供X-NewAPI-Task-Id时仍能恢复查询', () => {
  const result = execute('mj-v8.2', 'header-id');
  assert.equal(result.status, 0, result.output);
  assert.equal(result.saved.task_id, 'task_test');
});

test('Niji放大使用父任务与1起始index，并保存一张单图', () => {
  const request = { model: 'mj-niji7', prompt: '放大第二张图片', action: 'upscale', task_id: 'task_parent', index: 2, n: 1 };
  const result = execute('mj-niji7', 'upscale', { request });
  assert.equal(result.status, 0, result.output);
  assert.deepEqual(JSON.parse(result.calls[0].body), request);
  assert.equal(result.files.length, 1);
  assert.equal(result.saved.task_id, 'task_test');
});

test('Niji反推提示词保存文本结果，不要求图片或下载文件', () => {
  const result = execute('mj-niji7', 'describe', { request: { model: 'mj-niji7', prompt: '描述参考图', action: 'describe', image: 'https://example.com/ref.jpg', n: 1 } });
  assert.equal(result.status, 0, result.output);
  assert.equal(result.result.result.text, '参考图的提示词');
  assert.equal(result.files.length, 0);
});

for (const [scenario, message] of [
  ['create-error', '提交失败'], ['submit-timeout', '提交连接中断'], ['no-id', '未返回task_id'],
  ['failed', '生成失败'], ['failed-top', '生成失败'], ['unauthorized', '鉴权失败'],
  ['gateway-envelope', '缺少data.status'], ['timeout', 'task.json恢复查询'],
  ['empty', '任务没有图片'], ['http-image', 'HTTPS'], ['html-image', '非图片内容'], ['download-error', '下载失败']
]) {
  test('MJ示例处理' + scenario + '并且不重复提交', () => {
    const result = execute('mj-niji7', scenario);
    assert.notEqual(result.status, 0);
    assert.ok(result.output.includes(message), result.output);
    assert.equal(result.calls.filter(call => call.method === 'POST').length, 1);
    assert.equal(result.files.length, 0);
  });
}

test('MJ的n=4在本地拒绝，不误提交四次', () => {
  const result = execute('mj-v8.2', 'success', { request: { model: 'mj-v8.2', prompt: '橘子', n: 4 } });
  assert.notEqual(result.status, 0);
  assert.equal(result.calls.length, 0);
});

test('两款MJ文档分别包含28项与7项参数，比例、动作和导出保持一致', () => {
  assert.equal(MJ_SIZES.length, 12);
  assert.equal(MJ_ACTIONS.length, 10);
  for (const model of ['mj-niji7', 'mj-v8.2']) {
    const page = pages.find(page => page.id === model);
    // 页面、目录与导出标题统一使用用户提供的完整模型名称。
    assert.equal(page.title, model);
    assert.equal(page.label, model);
    const rows = page.blocks.filter(block => block.type === 'table' && block.headers[0] === '参数').flatMap(block => block.rows);
    assert.equal(rows.length, model === 'mj-niji7' ? 28 : 7);
    assert.equal(new Set(rows.map(row => row[0])).size, rows.length);
    assert.ok(mediaModels.some(item => item.name === model && item.page === model));
    assert.equal(resolveRoute('#/' + model), model);
    const markdown = pageMarkdown(page);
    // 每个页面及其导出正文只说明当前型号，防止混入另一个模型的参数或示例。
    const otherModel = model === 'mj-niji7' ? 'mj-v8.2' : 'mj-niji7';
    assert.ok(!markdown.includes(otherModel), model + '的导出正文混入其他型号');
    assert.ok(!renderPage(page).includes(otherModel), model + '的页面正文混入其他型号');
    assert.ok(markdown.startsWith('# ' + model + '\n'));
    assert.ok(renderPage(page).includes(page.title));
    for (const ratio of MJ_SIZES) assert.ok(markdown.includes(ratio), ratio);
    for (const field of ['task_id', 'X-NewAPI-Task-Id', 'image_urls', 'grid_image_url', 'Retry-After', 'submitted', 'completed']) assert.ok(markdown.includes(field));
    assert.ok(!markdown.includes('newapi.prompt-hubs.com'));
    const source = page.blocks.find(block => block.lang === 'javascript').value;
    if (model === 'mj-v8.2') assert.ok(!/describe|saved\.action|request\.action/.test(source));
    assert.equal(source.replaceAll('\r\n', '\n'), readFileSync(new URL('../public/docs/examples/' + model + '.mjs', import.meta.url), 'utf8').replaceAll('\r\n', '\n'));
    for (const block of page.blocks.filter(block => block.lang === 'bash')) for (const [, body] of block.value.matchAll(/--data\s+'([\s\S]*?)'/g)) {
      const request = JSON.parse(body);
      assert.equal(request.model, model);
      assert.equal(request.n, 1);
      if (request.size) assert.ok(MJ_SIZES.includes(request.size));
      if (request.action) assert.ok(model === 'mj-niji7' && MJ_ACTIONS.includes(request.action));
      if (request.images) assert.ok(request.images.length <= (request.action === 'blend' ? 4 : 5));
    }
  }
});
