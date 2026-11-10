import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pages, mediaModels, navigation} from '../public/docs/content.js';
import {pageMarkdown, resolveRoute} from '../public/docs/document.js';

const page=pages.find(page=>page.id==='minimax-h3');

test('MiniMax在视频分组，型号和素材上限采用当前渠道规格',()=>{
  assert.equal(resolveRoute('#/minimax-h3'),'minimax-h3');
  assert.ok(navigation.find(item=>item.label==='视频').pages.includes(page.id));
  assert.ok(mediaModels.some(item=>item.name==='minimax-h3-768p'&&item.page===page.id));
  const models=page.blocks.find(block=>block.type==='table'&&block.headers[0]==='模型名称');
  assert.deepEqual(models.rows,[['`minimax-h3-768p`','768p','4–15秒，整数','最多9张','不支持','最多3段']]);
  const text=pageMarkdown(page);
  for(const value of ['7000','12个文件','256–5760','0.4–2.5','30MB','15MB','64MB','合计≤15秒','首尾帧','completed','metadata.url'])assert.ok(text.includes(value),value);
  assert.ok(!/ai666|api\.minimax|platform\.minimaxi|\/v2\/video_generation/.test(text));
});

test('MiniMax文生、参考、首尾帧示例不混合模式或复制其他模型字段',()=>{
  const requests=page.blocks.filter(block=>block.lang==='bash'&&block.value.includes('--data')).map(block=>{
    assert.ok(block.value.includes('https://api.zzlye.xyz/v1/videos'));
    return JSON.parse(block.value.match(/--data\s+'([\s\S]*?)'/)[1]);
  });
  assert.equal(requests.length,4);
  for(const body of requests){
    assert.equal(body.model,'minimax-h3-768p');
    assert.ok(Number.isInteger(body.duration)&&body.duration>=4&&body.duration<=15);
    assert.ok(body.prompt.length<=7000);
    assert.ok(!body.resolution);
    assert.ok((body.images||[]).length<=9&&(body.audios||[]).length<=3);
    for(const key of ['videos','video','video_urls','image_urls','audio_urls','seconds','content','ratio'])assert.ok(!(key in body));
    if(body.first_frame_url||body.last_frame_url){
      assert.ok(!body.images&&!body.audios);
      assert.equal(body.aspect_ratio,'adaptive');
    }
  }
  assert.ok(requests.some(body=>body.images?.length===2&&body.audios?.length===1));
});

test('MiniMax完整示例与下载文件一致，保留本站鉴权和任务恢复',()=>{
  const code=page.blocks.find(block=>block.lang==='javascript').value.replaceAll('\r\n','\n');
  assert.equal(code,readFileSync(new URL('../public/docs/examples/minimax-h3.mjs',import.meta.url),'utf8').replaceAll('\r\n','\n'));
  assert.ok(code.includes("const ORIGIN = 'https://api.zzlye.xyz'"));
  assert.ok(code.includes('task.metadata?.url'));
  assert.ok(code.includes('downloadHeaders = {}'));
  assert.ok(code.includes('process.argv[2]'));
});
