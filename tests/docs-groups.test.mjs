import test from 'node:test';
import assert from 'node:assert/strict';
import { pages } from '../public/docs/content.js';
import { pageMarkdown } from '../public/docs/document.js';

// 检查客户实际复制的请求，防止能力写在说明里但示例仍传错误字段。
const jsonRequests = page => page.blocks.filter(block => block.lang === 'bash' && block.value.includes('--data')).map(block => JSON.parse(block.value.match(/--data\s+'([\s\S]*?)'/)[1]));

test('Adobe的Image 2与Image 2.5分开声明透明能力和画质', () => {
  const page = pages.find(page => page.id === 'image-adobe');
  const rows = page.blocks.find(block => block.type === 'table' && block.headers[0] === '模型名称').rows;
  assert.deepEqual(rows.map(row => row[0]), ['gpt-image-2', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst']);
  assert.equal(rows[0][3], '不提供，省略');
  for (const row of rows.slice(1)) assert.ok(row[3].includes('transparent'));
  for (const row of rows) {
    assert.equal(row[1], '1K、2K、4K');
    assert.equal(row[4], '支持');
    assert.equal(row[5], 'Adobe');
  }
  const requests = jsonRequests(page);
  assert.ok(requests.some(body => body.images?.length === 2 && body.images.every(image => typeof image.image_url === 'string')));
  assert.ok(requests.some(body => body.image?.startsWith('https://')));
  assert.ok(requests.some(body => body.background === 'transparent' && body.model.includes('2.5')));
  assert.ok(requests.every(body => !('moderation' in body) && !('output_compression' in body)));
  for (const word of ['64MiB', '32768字节', 'max/xhigh→7', 'mask', '透明区域']) assert.ok(pageMarkdown(page).includes(word), word);
});

test('1K分组保持原限制，不继承Adobe的高分、遮罩和透明参数', () => {
  const page = pages.find(page => page.id === 'image-1k');
  const rows = page.blocks.find(block => block.type === 'table' && block.headers[0] === '模型名称').rows;
  assert.equal(rows.length, 3);
  for (const row of rows) {
    assert.equal(row[1], '仅1K');
    assert.equal(row[3], '不提供，省略');
    assert.equal(row[4], '不开放');
  }
  for (const body of jsonRequests(page)) {
    assert.ok(!('background' in body) && !('mask' in body));
    const [w, h] = body.size.split('x').map(Number);
    assert.ok(w * h <= 1536 * 1024);
  }
  const sizes = page.blocks.find(block => block.type === 'table' && block.headers[0] === '比例');
  assert.equal(sizes.headers.length, 2);
});

for (const [id, prefix] of [['image-az', 'AZ-'], ['image-official', '官-']]) {
  test(id + '保留真实前缀并省略response_format', () => {
    const page = pages.find(page => page.id === id);
    const requests = jsonRequests(page);
    assert.ok(requests.length >= 4);
    for (const body of requests) {
      assert.ok(body.model.startsWith(prefix));
      assert.ok(!('response_format' in body));
      if (body.images) assert.ok(body.images.every(image => typeof image === 'string'));
    }
    const source = page.blocks.find(block => block.lang === 'javascript').value;
    assert.ok(source.includes("model: '" + prefix + "gpt-image-2.5-flare'"));
    assert.ok(!source.includes('response_format'));
    const submitted = page.blocks.filter(block => block.lang === 'json').map(block => JSON.parse(block.value)).find(response => response.model);
    assert.equal(submitted.model, prefix + 'gpt-image-2.5-flare');
    assert.ok(pageMarkdown(page).includes('data[].b64_json'));
  });
}

test('全部文档区分内部异步、网关任务与原协议返回', () => {
  for (const page of pages) {
    const text = pageMarkdown(page);
    for (const word of ['服务器内部异步', '原协议方式', 'HTTP 202', 'X-New-Api-Task-Id', '任务日志', 'succeeded', 'completed', 'Retry-After']) assert.ok(text.includes(word), page.id + ':' + word);
    assert.ok(text.includes('普通Key使用自身分组') || !page.id.startsWith('image'));
  }
});
