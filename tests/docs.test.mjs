import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// 直接验证发布时使用的文档数据，防止页面和导出内容分别维护后发生偏差。
const { pages, mediaModels, API_ORIGIN } = await import("../public/docs/content.js");
const { pageMarkdown, renderPage, resolveRoute } = await import("../public/docs/document.js");

test("图片与视频文档页面完整且编号唯一", () => {
  assert.deepEqual(pages.map((page) => page.id), ["image2", "banana", "seedream", "mj-niji7", "mj-v8.2", "video", "sd-video"]);
  assert.equal(new Set(pages.map((page) => page.id)).size, pages.length);
  assert.equal(API_ORIGIN, "https://api.zzlye.xyz");
});

test("公开模型包含最新香蕉型号且移除下架名称", () => {
  assert.equal(mediaModels.length, 19);
  for (const name of ["gpt-image-2.5-flare-满血", "gpt-image-2.5-sunburst-4k", "nano-banana-pro", "nano-banana-2.1", "seedream-5-pro", "wan-3.0", "wan-3.0-1080p"]) {
    assert.ok(mediaModels.some((model) => model.name === name), name);
  }
  assert.ok(!mediaModels.some(model => model.name === 'sd5p'));
  assert.ok(mediaModels.every((model) => pages.some(page => page.id === model.page)));
});

test("旧链接仍可使用，旧公共章节与未知路径回到默认模型", () => {
  assert.equal(resolveRoute("#/banana"), "banana");
  assert.equal(resolveRoute("#/image2"), "image2");
  assert.equal(resolveRoute("#/"), "image2");
  assert.equal(resolveRoute("#/missing"), "image2");
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
  const tasks = pageMarkdown(pages.find((page) => page.id === "image2"));
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

test("GPT Image文档包含明确的型号参数与完整尺寸表", () => {
  const page = pages.find((entry) => entry.id === "image2");
  const text = pageMarkdown(page);
  for (const value of [
    "gpt-image-2",
    "gpt-image-2.5-flare-4k",
    "POST /v1/images/edits",
    "quality",
    "background",
    "response_format",
    "output_format",
    "1K、2K、4K",
    "1:1",
    "3:2",
    "2:3",
    "16:9",
    "9:16",
    "4:3",
    "3:4",
    "21:9",
    "1024x1024",
    "1280x720",
    "720x1280",
    "宽和高都必须是16的倍数",
    "3840px",
    "655360至8294400",
    "最多16张"
  ]) assert.ok(text.includes(value), value);
  assert.ok(!text.includes("是否生效取决于选中的模型与渠道"));
  const generation = page.blocks.find((block) => block.type === "table" && block.headers.includes("取值与说明"));
  assert.ok(generation);
  assert.ok(generation.rows.some((row) => row[0] === "quality" && row[3].includes("xhigh")));
  const models = page.blocks.find(block => block.type === 'table' && block.headers[0] === '模型名称');
  for (const row of models.rows) {
    if (row[0].endsWith('-4k')) assert.ok(!row[2].includes('xhigh'));
    assert.equal(row[3].includes('transparent'),row[0].endsWith('-满血'));
    assert.equal(row[4]==='支持',row[0].endsWith('-满血'));
  }
});

test('GPT Image的24个预设尺寸同时满足像素与比例限制', async()=>{
  const { IMAGE2_SIZE_ROWS }=await import('../public/docs/image2-details.js');
  assert.equal(IMAGE2_SIZE_ROWS.length,8);
  for(const [ratio,...sizes] of IMAGE2_SIZE_ROWS) {
    assert.equal(sizes.length,3);
    for(const size of sizes){
      const [width,height]=size.split('x').map(Number);
      assert.ok(width%16===0&&height%16===0,ratio+size);
      assert.ok(Math.max(width,height)<=3840);
      assert.ok(Math.max(width/height,height/width)<=3);
      assert.ok(width*height>=655360&&width*height<=8294400);
    }
  }
});

test('香蕉型号、14种比例和512专属档位不套用GPT像素限制',async()=>{
  const { BANANA_MODELS,BANANA_SIZE_ROWS }=await import('../public/docs/image-model-details.js');
  assert.equal(BANANA_SIZE_ROWS.length,14);
  assert.equal(new Set(BANANA_SIZE_ROWS.map(row=>row[0])).size,14);
  const models=new Map(BANANA_MODELS.map(row=>[row[0],row]));
  assert.ok(models.get('nano-banana-2')[1].includes('512'));
  assert.ok(!models.get('nano-banana-2.1')[1].includes('512'));
  assert.equal(models.get('nano-banana-pro')[2],'10种');
  const square=BANANA_SIZE_ROWS.find(row=>row[0]==='1:1');
  assert.deepEqual(square.slice(1),['512x512','1024x1024','2048x2048','4096x4096']);
  assert.equal(BANANA_SIZE_ROWS.find(row=>row[0]==='8:1')[4],'12288x1536');
  const page=pages.find(p=>p.id==='banana');
  assert.ok(pageMarkdown(page).includes('最多14张'));
  // 验证新增型号的实际可复制请求，而不是只检查标题中有没有名称。
  const block=page.blocks.find(b=>b.lang==='bash'&&b.value.includes('/nano-banana-2.1:generateContent'));
  const body=JSON.parse(block.value.match(/--data\s+'([\s\S]*?)'/)[1]);
  assert.deepEqual(body.generationConfig.imageConfig,{aspectRatio:'16:9',imageSize:'2K'});
});

test('Seedream提供具体1K/2K尺寸且未混入4K、背景或遮罩控制',()=>{
  const page=pages.find(p=>p.id==='seedream');
  const table=page.blocks.find(b=>b.type==='table'&&b.headers[0]==='比例');
  assert.equal(table.rows.length,8);
  assert.equal(table.headers.length,3);
  for(const block of page.blocks.filter(b=>b.lang==='bash')){
    for(const [,text] of block.value.matchAll(/--data\s+'([\s\S]*?)'/g)){
      const body=JSON.parse(text);
      assert.equal(body.model,'seedream-5-pro');
      assert.ok(table.rows.some(row=>row.includes(body.size)));
      assert.ok(!('background' in body)&&!('mask' in body));
    }
  }
});

test("文档不包含旧域名、私有地址或凭据", () => {
  const text = pages.map(pageMarkdown).join("\n");
  assert.ok(!/bafang|zzlye\.xyz:60|https?:\/\/(?:\d{1,3}\.){3}\d{1,3}|ssh|password/i.test(text));
  assert.ok(!text.includes("每90秒"));
  assert.ok(!/西米露|sd5p|以.*页面.*为准/.test(text));
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

test("导出文档链接指向实际文档站，不指向在线生成服务", () => {
  const markdown = pageMarkdown(pages.find((page) => page.id === "banana"));
  assert.ok(markdown.includes("https://zzlye.site/docs/index.html#/image2"));
  assert.ok(!markdown.includes("https://zzlye.xyz/docs/"));
});

test("页面转义占位符和HTML，任务对象字段保持真实契约", () => {
  const page = { title: "<script>", lead: "<API_KEY>", blocks: [] };
  const html = renderPage(page);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;API_KEY&gt;"));
  const taskPage = pages.find((entry) => entry.id === "image2");
  const submitted = taskPage.blocks.find((block) => block.type === "code" && block.lang === "json" && JSON.parse(block.value).status === "pending");
  assert.equal(JSON.parse(submitted.value).object, "image_generation");
});
test('五类模型文档各自包含异步闭环与可执行示例', () => {
  for (const id of ['image2','banana','seedream','video','sd-video']) {
    const page=pages.find(p=>p.id===id), text=pageMarkdown(page);
    for(const term of ['Authorization','task_id','poll_url','Retry-After','result_expired','succeeded','failed','下载','完整示例']) assert.ok(text.includes(term),id+':'+term);
    const code=page.blocks.find(b=>b.lang==='javascript').value;
    assert.ok(code.includes('await pipeline'));
    assert.ok(code.includes('process.argv[2]'));
    assert.ok(code.includes('redirect: \'error\''));
    assert.ok(code.includes('.part'));
  }
});

test('Wan参数、整数进度与两种异步状态不能混用', () => {
  const page=pages.find(p=>p.id==='video'),text=pageMarkdown(page);
  for(const value of ['image_urls','video_urls','audio_urls','30秒','720p','wan-3.0-1080p','completed','succeeded','/v1/videos/','/v1/tasks/']) assert.ok(text.includes(value),value);
  for(const b of page.blocks.filter(b=>b.lang==='json')) {
    const obj=JSON.parse(b.value);
    if(obj.progress!==undefined) assert.ok(Number.isInteger(obj.progress)&&obj.progress>=0&&obj.progress<=100);
    if(obj.object==='video') assert.ok(['queued','in_progress','completed','failed'].includes(obj.status));
  }
  const source=page.blocks.find(b=>b.lang==='javascript').value;
  assert.ok(!source.includes('Prefer:'));
  assert.ok(source.includes("id.startsWith('async_')"));
});

test('所有cURL请求体是合法JSON且使用本站端点', () => {
  let count=0;
  for(const page of pages) for(const block of page.blocks.filter(b=>b.type==='code'&&b.lang==='bash')) {
    for(const [,body] of block.value.matchAll(/--data\s+'([\s\S]*?)'/g)) { assert.doesNotThrow(()=>JSON.parse(body),page.id);count++; }
    if(block.value.includes('curl ')) assert.ok(block.value.includes('https://api.zzlye.xyz/'),page.id);
  }
  assert.ok(count>=7);
});

test('所有模型页不显示本页目录，正文仍支持深链接', () => {
  for(const page of pages) {
    const html=renderPage(page);
    assert.ok(!html.includes('page-toc'));
    assert.ok(!html.includes('本页目录'));
    for(const [index,block] of page.blocks.entries()) if(block.type==='heading') {
      assert.ok(html.includes('id="section-'+index+'"'));
      assert.equal(resolveRoute('#/'+page.id+'?section='+index),page.id);
    }
  }
});

test('网页代码和可独立运行的示例文件逐字一致', () => {
  for(const [id,file,lang] of [['image2','image2.mjs','javascript'],['banana','banana.mjs','javascript'],['seedream','seedream.mjs','javascript'],['image2','images.mjs','javascript'],['video','video.mjs','javascript'],['video','video.py','python'],['sd-video','sd-video.mjs','javascript'],['sd-video','sd-video.py','python']]) {
    const block=pages.find(p=>p.id===id).blocks.find(b=>b.lang===lang);
    // 忽略不同系统的换行编码，其余正文必须一致。
    assert.equal(block.value.replaceAll('\r\n','\n'),readFileSync(new URL('../public/docs/examples/'+file,import.meta.url),'utf8').replaceAll('\r\n','\n'));
  }
  const banana=pages.find(p=>p.id==='banana').blocks.filter(b=>b.lang==='json').map(b=>JSON.parse(b.value));
  assert.equal(banana.find(b=>b.status==='pending').object,'gemini_image_generation');
});


test('目录和整份导出只包含模型，不残留公共章节跳转',()=>{
  assert.deepEqual(pages.map(p=>p.label),['GPT Image','Nano Banana','Seedream','mj-niji7','mj-v8.2','Wan 视频','SD 视频']);
  for(const old of ['start','models','tasks','errors']) assert.equal(resolveRoute('#/'+old),'image2');
  const all=pages.map(pageMarkdown).join('\n\n');
  // 代码围栏内的中文注释不是Markdown页面标题。
  let inCode=false;
  const headings=all.split('\n').filter(line=>{
    if(line.startsWith('```')) inCode=!inCode;
    return !inCode&&line.startsWith('# ');
  });
  assert.equal(headings.length,7);
  for(const page of pages)for(const block of page.blocks.filter(b=>b.type==='links')){
    assert.ok(block.items.every(item=>pages.some(p=>p.id===item.id)));
  }
  assert.ok(!/#\/(?:start|models|tasks|errors)(?:\s|\))/u.test(all));
});

test('Wan页同时包含Videos与网关可恢复示例',()=>{
  const page=pages.find(p=>p.id==='video');
  const examples=page.blocks.filter(b=>b.lang==='javascript');
  assert.equal(examples.length,2);
  assert.ok(examples[0].value.includes("'/v1/videos/'"));
  assert.ok(examples[1].value.includes("Prefer: 'respond-async'"));
  assert.ok(examples[1].value.includes("WENYUN_VIDEO_MODEL || 'wan-3.0'"));
  assert.equal(examples[1].value.replaceAll('\r\n','\n'),readFileSync(new URL('../public/docs/examples/video-gateway.mjs',import.meta.url),'utf8').replaceAll('\r\n','\n'));
  assert.ok(!pageMarkdown(page).includes('“任务与下载”章节'));
});

test('Wan两型号共享时长与素材规则，高清分辨率可选择而非固定',()=>{
  const page=pages.find(p=>p.id==='video');
  const table=page.blocks.find(b=>b.type==='table'&&b.headers[0]==='模型名称');
  assert.equal(table.rows.length,2);
  for(const row of table.rows){assert.equal(row[2],'1–30秒（整数）');assert.equal(row[3],'最多2张');}
  assert.ok(table.rows[1][1].includes('720p')&&table.rows[1][1].includes('最高'));
  const requests=[];
  for(const b of page.blocks.filter(b=>b.type==='code')){
    if(b.lang==='json')requests.push(JSON.parse(b.value));
    if(b.lang==='bash')for(const [,body] of b.value.matchAll(/--data\s+'([\s\S]*?)'/g))requests.push(JSON.parse(body));
  }
  const submissions=requests.filter(body=>body.prompt);
  for(const body of submissions){
    assert.ok(['wan-3.0','wan-3.0-1080p'].includes(body.model));
    assert.ok(Number.isInteger(body.duration)&&body.duration>=1&&body.duration<=30);
    assert.ok((body.model==='wan-3.0'?['720p']:['720p','1080p']).includes(body.resolution));
    assert.ok((body.image_urls||[]).length<=2);
    for(const key of ['image_urls','video_urls','audio_urls'])for(const url of body[key]||[])assert.ok(url.startsWith('https://'));
    assert.ok(!('seconds' in body)&&!('input_reference' in body));
  }
  for(const resolution of ['720p','1080p'])assert.ok(submissions.some(b=>b.model==='wan-3.0-1080p'&&b.resolution===resolution));
  assert.ok(submissions.some(b=>b.model==='wan-3.0-1080p'&&b.duration===30&&b.image_urls?.length===2));
  const markdown=pageMarkdown(page);
  assert.ok(!/808relay|SKYLEE|不自动继承720p|30秒示例适用于wan-3.0的720p/.test(markdown));
});

test('SD型号、素材数量、时长与示例契约保持一致',()=>{
  const page=pages.find(p=>p.id==='sd-video'),text=pageMarkdown(page);
  const limits={'sd-2.0':[15,9,3,3],'sd-2.5-30-10-10':[30,30,10,10],'sd-2.5-10-10-10':[30,10,10,10]};
  assert.equal(resolveRoute('#/sd-video'),'sd-video');
  for(const name of Object.keys(limits))assert.ok(mediaModels.some(m=>m.name===name&&m.page==='sd-video'));
  for(const term of ['image_urls','video_urls','audio_urls','first_frame','last_frame','@Image1','@Video1','@Audio1','completed','succeeded','result_expired','15秒','HTTPS'])assert.ok(text.includes(term),term);
  assert.ok(!/rolldek|sd-2\.[05]-ch[12]/.test(text));
  // 检查实际可复制的请求，不只检查文字是否出现关键字。
  const requests=[];
  for(const block of page.blocks.filter(b=>b.type==='code')){
    assert.ok(!/^\+\s+-/m.test(block.value),'示例不能残留补丁标记');
    if(block.lang==='json')requests.push(JSON.parse(block.value));
    if(block.lang==='bash')for(const [,body] of block.value.matchAll(/--data\s+'([\s\S]*?)'/g))requests.push(JSON.parse(body));
  }
  for(const body of requests.filter(b=>b.prompt)){
    const [duration,images,videos,audios]=limits[body.model];
    assert.ok(Number.isInteger(body.duration)&&body.duration>=4&&body.duration<=duration);
    assert.equal(body.resolution,'720p');
    assert.ok(!('image_refs' in body)&&!('input_reference' in body)&&!('seconds' in body));
    for(const [field,max] of [['image_urls',images],['video_urls',videos],['audio_urls',audios]]){
      assert.ok((body[field]||[]).length<=max);
      for(const url of body[field]||[])assert.ok(url.startsWith('https://'));
    }
    if(body.first_frame||body.last_frame){
      assert.ok(body.model.startsWith('sd-2.5-'));
      assert.ok(body.first_frame&&body.last_frame);
      for(const key of ['image_urls','video_urls','audio_urls'])assert.ok(!(key in body));
    }
  }
  assert.ok(requests.filter(b=>b.prompt).length>=6);
  const gateway=page.blocks.filter(b=>b.lang==='javascript')[1];
  assert.equal(gateway.value.replaceAll('\r\n','\n'),readFileSync(new URL('../public/docs/examples/sd-video-gateway.mjs',import.meta.url),'utf8').replaceAll('\r\n','\n'));
});
