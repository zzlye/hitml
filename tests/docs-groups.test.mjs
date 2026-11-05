import test from 'node:test';
import assert from 'node:assert/strict';
import { pages } from '../public/docs/content.js';
import { pageMarkdown } from '../public/docs/document.js';
import { IMAGE_GROUPS, imageCapability } from '../public/docs/image-groups.js';

// 检查客户实际复制的请求，防止能力写在说明里但示例仍传错误字段。
const jsonRequests = page => page.blocks.filter(block => block.lang === 'bash' && block.value.includes('--data')).map(block => JSON.parse(block.value.match(/--data\s+'([\s\S]*?)'/)[1]));

test('Adobe的Image 2与Image 2.5、2.6分开声明透明能力和画质', () => {
  const page = pages.find(page => page.id === 'image-adobe');
  const rows = page.blocks.find(block => block.type === 'table' && block.headers[0] === '模型名称').rows;
  assert.deepEqual(rows.map(row => row[0]), ['gpt-image-2', 'gpt-image-2.5-flare', 'gpt-image-2.5-sunburst', 'gpt-image-2.6-flare', 'gpt-image-2.6-sunburst']);
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
  assert.ok(requests.some(body => body.background === 'transparent' && body.model.includes('2.6')));
  assert.ok(requests.every(body => !('moderation' in body) && !('output_compression' in body)));
  for (const word of ['64MiB', '32768字节', 'max/xhigh→7', 'mask', '透明区域']) assert.ok(pageMarkdown(page).includes(word), word);
});

test('1K分组保持原限制，不继承Adobe的高分、遮罩和透明参数', () => {
  const page = pages.find(page => page.id === 'image-1k');
  const rows = page.blocks.find(block => block.type === 'table' && block.headers[0] === '模型名称').rows;
  assert.equal(rows.length, 5);
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
      if (body.images) assert.ok(body.images.every(image => typeof image.image_url === 'string'));
    }
    const source = page.blocks.find(block => block.lang === 'javascript').value;
    assert.ok(source.includes("model: '" + prefix + "gpt-image-2.6-flare'"));
    assert.ok(!source.includes('response_format'));
    const submitted = page.blocks.filter(block => block.lang === 'json').map(block => JSON.parse(block.value)).find(response => response.model);
    assert.equal(submitted.model, prefix + 'gpt-image-2.6-flare');
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

test('2.6完整型号按分组登记，兼容线路继承2.5且不生成满血别名', () => {
  for (const group of IMAGE_GROUPS) {
    const prefix = group.id === 'image-az' ? 'AZ-' : group.id === 'image-official' ? '官-' : '';
    for (const variant of ['flare', 'sunburst']) {
      const model = prefix + 'gpt-image-2.6-' + variant;
      assert.ok(group.models.includes(model), group.id + ':' + model);
      assert.deepEqual(imageCapability(group, model), imageCapability(group, prefix + 'gpt-image-2.5-' + variant));
      assert.ok(!group.models.some(name => name.includes('2.6') && name.endsWith('-满血')));
      if (group.id === 'image2') {
        assert.ok(group.models.includes(model + '-4k'));
        assert.deepEqual(imageCapability(group, model + '-4k'), imageCapability(group, 'gpt-image-2.5-' + variant + '-4k'));
      }
    }
  }
});

test('Adobe、1K和默认分组的2.6示例不发送官方新增参数', () => {
  for (const id of ['image2', 'image-1k', 'image-adobe']) {
    const page = pages.find(page => page.id === id);
    const requests = jsonRequests(page);
    assert.ok(requests.some(body => body.model.includes('2.6')));
    for (const body of requests) {
      for (const field of ['complexity', 'markup', 'svg', 'frame_count', 'frame_duration_ms']) assert.ok(!(field in body), id + ':' + field);
      assert.ok(!['gif', 'svg'].includes(body.output_format));
      if (id === 'image2' && !body.model.endsWith('-4k')) assert.ok(!body.background && !body.mask);
    }
  }
});

for (const id of ['image-az', 'image-official']) test(id + '的2.6官方扩展示例区分标注、SVG、GIF和网关协议', () => {
  const page = pages.find(page => page.id === id);
  const requests = jsonRequests(page);
  const markup = requests.find(body => body.markup);
  assert.ok(markup?.images[0].image_url);
  assert.ok(markup.markup.image_url && !markup.mask);
  assert.equal(markup.complexity, 'low');
  const svg = requests.find(body => body.output_format === 'svg');
  const gif = requests.find(body => body.output_format === 'gif');
  assert.equal(svg.n, 1);
  assert.equal(gif.frame_count, 9);
  assert.equal(gif.frame_duration_ms, 200);
  for (const body of [svg, gif]) {
    for (const field of ['stream', 'partial_images', 'output_compression', 'prompt_rewriter', 'mask', 'images']) assert.ok(!(field in body));
    const block = page.blocks.find(block => block.lang === 'bash' && block.value.includes('--data') && block.value.includes('"output_format": "' + body.output_format + '"'));
    assert.ok(block.value.includes('/v1/images/generations'));
    assert.ok(!block.value.includes('respond-async'));
  }
  for (const body of requests) {
    assert.ok(!('response_format' in body));
    if (body.images) for (const image of body.images) assert.deepEqual(Object.keys(image), ['image_url']);
  }
  const markdown = pageMarkdown(page);
  for (const term of ['16777216', '50MB', '2–16', '20–2000', '32000', 'safety_identifier', '最多128字符']) assert.ok(markdown.includes(term), term);
});
