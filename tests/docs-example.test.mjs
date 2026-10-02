import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { pages } from '../public/docs/content.js';

// 执行页面里的原始示例，只替换请求和计时器，不访问任何真实生成接口。
const bootstrap = String.raw`import { createRequire, syncBuiltinESMExports } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const calls = [];
const delays = [];
require('node:timers/promises').setTimeout = async (ms) => { delays.push(ms); };
syncBuiltinESMExports();
const scenario = process.env.DOCS_SCENARIO;
let polls = 0;
process.on('exit', () => writeFileSync('calls.json', JSON.stringify({ calls, delays })));
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers });
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  calls.push({ url: url.href, method: options.method || 'GET', headers: options.headers, body: options.body });
  if (url.origin !== 'https://api.zzlye.xyz') throw new Error('测试禁止访问外部地址');
  if (options.headers?.Authorization !== 'Bearer test-key') throw new Error('缺少鉴权');
  if (options.method === 'POST') {
    if (scenario === 'create-error') return json({error:{message:'提交失败'}},503);
    return json({ task_id:'async_test', poll_url:'/v1/tasks/async_test' }, 202, {'Retry-After':'7'});
  }
  if (url.pathname === '/v1/tasks/async_test') {
    polls++;
    if (scenario === 'retry') {
      if (polls === 1) return json({},429,{'Retry-After':'8'});
      if (polls === 2) return json({},503);
      if (polls === 3) throw new Error('模拟查询网络错误');
      if (polls === 4) return json({status:'waiting'});
    }
    if (scenario === 'failed' || scenario === 'cancelled') return json({status:scenario,error:{message:'任务停止'}});
    if (scenario === 'unknown') return json({status:'unrecognized'});
    if (scenario === 'unauthorized') return json({error:{message:'鉴权失败'}},401);
    return json({status:'succeeded',result_expired:scenario==='expired',result:{data:[]},media:[{url:scenario==='foreign'? 'https://other.example/result.png':'/v1/tasks/async_test/media/0',content_type:'image/png'}]});
  }
  if (url.pathname === '/v1/tasks/async_test/media/0') return new Response('mock-media', {headers:{'Content-Type':'image/png'}});
  throw new Error('测试遇到未预期的地址');
};
`;

function execute(pageId, scenario, resume = false) {
  const base = process.platform === 'win32' ? 'D:/tmp' : tmpdir();
  mkdirSync(base, {recursive:true});
  const dir = mkdtempSync(join(base, 'hitml-doc-example-'));
  try {
    const source = pages.find((p) => p.id === pageId).blocks.find((b) => b.type === 'code' && b.lang === 'javascript').value;
    writeFileSync(join(dir, 'generate.mjs'), source);
    writeFileSync(join(dir, 'mock.mjs'), bootstrap);
    writeFileSync(join(dir, 'reference.png'), 'reference-bytes');
    if (resume) writeFileSync(join(dir, 'saved.json'), JSON.stringify({task_id:'async_test',poll_url:'/v1/tasks/async_test'}));
    const child = spawnSync(process.execPath, ['--import', pathToFileURL(join(dir,'mock.mjs')).href, join(dir,'generate.mjs'), ...(resume ? ['saved.json'] : [])], {
      cwd: dir, encoding: 'utf8', timeout: 8000,
      env: { ...process.env, WENYUN_API_KEY: 'test-key', DOCS_SCENARIO: scenario }
    });
    assert.ok(!child.error, child.error?.message);
    assert.ok(existsSync(join(dir,'calls.json')), child.stderr);
    const report = JSON.parse(readFileSync(join(dir,'calls.json'),'utf8'));
    const file = existsSync(join(dir,'result-0.png')) ? readFileSync(join(dir,'result-0.png'),'utf8') : null;
    return { ...report, status: child.status, output: child.stdout + child.stderr, file };
  } finally {
    // 临时示例运行结束后清理，不把示例结果加入仓库。
    rmSync(dir, {recursive:true,force:true});
  }
}

test('异步示例只提交一次并流式保存结果文件', () => {
  const result = execute('tasks','success');
  assert.equal(result.status,0,result.output);
  assert.equal(result.file,'mock-media');
  assert.equal(result.calls.filter(c=>c.method==='POST').length,1);
  assert.equal(result.delays[0],7000);
});

test('查询限流和网络故障不会造成重复生成', () => {
  const result = execute('tasks','retry');
  assert.equal(result.status,0,result.output);
  assert.equal(result.calls.filter(c=>c.method==='POST').length,1);
  assert.equal(result.calls.filter(c=>c.url.endsWith('/async_test')).length,5);
  assert.ok(result.delays[1] >= 8000);
});

test('恢复任务只查询下载，不发送新的创建请求', () => {
  const result = execute('tasks','success',true);
  assert.equal(result.status,0,result.output);
  assert.equal(result.calls.filter(c=>c.method==='POST').length,0);
  assert.equal(result.file,'mock-media');
});

for (const scenario of ['failed','cancelled','expired','unknown','unauthorized','create-error','foreign']) {
  test('示例正确停止并保留错误：'+scenario, () => {
    const result=execute('tasks',scenario);
    assert.equal(result.status,1,result.output);
    assert.equal(result.file,null);
    assert.equal(result.calls.filter(c=>c.method==='POST').length,1);
    assert.ok(result.calls.every(c=>new URL(c.url).origin==='https://api.zzlye.xyz'));
  });
}

test('香蕉示例使用原生端点和正确的参考图编码', () => {
  const result=execute('banana','success');
  assert.equal(result.status,0,result.output);
  assert.equal(result.calls.filter(call => call.method === 'POST').length,1);
  assert.equal(result.file,'mock-media');
  const request=result.calls[0];
  assert.ok(request.url.endsWith('/v1beta/models/nano-banana-2:generateContent'));
  const body=JSON.parse(request.body);
  const data=body.contents[0].parts[1].inlineData;
  assert.equal(data.mimeType,'image/png');
  assert.equal(Buffer.from(data.data,'base64').toString(),'reference-bytes');
});

for (const [pageId, model] of [['image2','gpt-image-2.5-flare'],['seedream','seedream-5-pro']]) {
  test(pageId + '示例按页面模型完成生成与保存', () => {
    const result=execute(pageId,'success');
    assert.equal(result.status,0,result.output);
    assert.equal(result.file,'mock-media');
    const posts=result.calls.filter(call=>call.method==='POST');
    assert.equal(posts.length,1);
    assert.equal(JSON.parse(posts[0].body).model,model);
  });
}
