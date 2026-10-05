import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { pages } from '../public/docs/content.js';
// 测试直接执行公开文档里的示例，网络全部替换为模拟响应，避免生成费用。
const nodeMock = String.raw`import { createRequire, syncBuiltinESMExports } from 'node:module';
import { writeFileSync } from 'node:fs';
const calls=[], delays=[];
let clock=Date.now(), polls=0;
Date.now=()=>clock;
createRequire(import.meta.url)('node:timers/promises').setTimeout=async ms=>{delays.push(ms);clock+=ms;};
syncBuiltinESMExports();
const scenario=process.env.DOCS_SCENARIO;
process.on('exit',()=>writeFileSync('calls.json',JSON.stringify({calls,delays})));
const json=(v,s=200,h={})=>new Response(JSON.stringify(v),{status:s,headers:h});
globalThis.fetch=async(input,opt={})=>{
 const u=new URL(input), method=opt.method||'GET';
 calls.push({url:u.href,method,headers:opt.headers,body:opt.body,redirect:opt.redirect});
 if(u.origin!=='https://api.zzlye.xyz')throw new Error('禁止外部网络');
 if(opt.headers?.Authorization!=='Bearer test-key')throw new Error('缺少鉴权');
 if(method==='POST'){
  if(scenario==='create-error')return json({error:{message:'提交失败'}},503);
  if(scenario==='invalid-create')return json({status:'queued'});
  return json({id:'task_test',status:'queued',progress:0},202,{'Retry-After':'7'});
 }
 if(u.pathname==='/v1/videos/task_test'){
  polls++;
  if(scenario==='retry'){
   if(polls===1)return json({},429,{'Retry-After':'8'});
   if(polls===2)return json({},503);
   if(polls===3)throw new Error('查询网络错误');
  }
  if(scenario==='failed')return json({id:'task_test',status:'failed',error:{message:'素材无法读取'}});
  if(scenario==='unknown')return json({status:'unexpected'});
  if(scenario==='unauthorized')return json({error:{message:'鉴权失败'}},401);
  if(scenario==='timeout')return json({status:'queued'});
  return json({id:'task_test',status:polls<3?['queued','in_progress'][polls-1]:'completed',progress:polls<3?45:100});
 }
 if(u.pathname==='/v1/videos/task_test/content'){
  if(scenario==='download-error')return json({error:{message:'文件过期'}},410);
  if(scenario==='wrong-mime')return json({error:'unexpected'});
  if(scenario==='broken-download')return new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('partial'));c.error(new Error('下载中断'));}}),{headers:{'Content-Type':'video/mp4'}});
  return new Response('mock-video',{headers:{'Content-Type':'video/mp4'}});
 }
 throw new Error('未知测试URL');
};
`;
const pythonMock = String.raw`import io,json,os,runpy,sys,time,urllib.error,urllib.request
from pathlib import Path
calls,delays=[],[]
clock=[0]
polls=[0]
scenario=os.environ['DOCS_SCENARIO']
time.monotonic=lambda:clock[0]
def sleep(value):
    delays.append(value)
    clock[0]+=value
time.sleep=sleep
class Response(io.BytesIO):
    def __init__(self,data,headers=None):
        super().__init__(data)
        self.headers=headers or {}
class Opener:
    def open(self,request,timeout=30):
        url=request.full_url
        method=request.get_method()
        calls.append({'url':url,'method':method,'headers':dict(request.header_items()),'body':request.data.decode('utf8') if request.data else None})
        assert url.startswith('https://api.zzlye.xyz/')
        assert request.get_header('Authorization')=='Bearer test-key'
        def respond(data,headers=None):return Response(json.dumps(data).encode(),headers)
        def error(code,headers=None):raise urllib.error.HTTPError(url,code,'模拟错误',headers or {},io.BytesIO(b'error'))
        if method=='POST':
            if scenario=='create-error':error(503)
            if scenario=='invalid-create':return respond({'status':'queued'})
            return respond({'id':'task_test','status':'queued'},{'Retry-After':'7'})
        if url.endswith('/v1/videos/task_test'):
            polls[0]+=1
            n=polls[0]
            if scenario=='retry':
                if n==1:error(429,{'Retry-After':'8'})
                if n==2:error(503)
                if n==3:raise urllib.error.URLError('网络断开')
            if scenario=='failed':return respond({'status':'failed','error':{'message':'素材无法读取'}})
            if scenario=='unknown':return respond({'status':'unexpected'})
            if scenario=='unauthorized':error(401)
            if scenario=='timeout':return respond({'status':'queued'})
            return respond({'id':'task_test','status':['queued','in_progress'][n-1] if n<3 else 'completed','progress':100})
        if url.endswith('/content'):
            if scenario=='download-error':error(410)
            if scenario=='wrong-mime':return Response(b'{}',{'Content-Type':'application/json'})
            return Response(b'mock-video',{'Content-Type':'video/mp4'})
        raise RuntimeError('未知测试URL')
urllib.request.build_opener=lambda *a:Opener()
try:
    sys.argv=['video.py']+sys.argv[1:]
    runpy.run_path('video.py',run_name='__main__')
finally:
    Path('calls.json').write_text(json.dumps({'calls':calls,'delays':delays}),encoding='utf8')
`;
function execute(pageId,lang,scenario,{resume=false,existing=false}={}){
 const base=process.platform==='win32'?'D:/tmp':tmpdir();mkdirSync(base,{recursive:true});
 const dir=mkdtempSync(join(base,'hitml-video-example-'));
 try{
  const source=pages.find(p=>p.id===pageId).blocks.find(b=>b.type==='code'&&b.lang===lang).value;
  const file=lang==='python'?'video.py':'video.mjs';
  writeFileSync(join(dir,file),source);
  writeFileSync(join(dir,lang==='python'?'mock.py':'mock.mjs'),lang==='python'?pythonMock:nodeMock);
  if(resume||existing)writeFileSync(join(dir,'video-task.json'),JSON.stringify({id:'task_test'}));
  const python=process.env.PYTHON||(process.platform==='win32'&&existsSync('D:/tools/python-3.12.10-embed/python.exe')?'D:/tools/python-3.12.10-embed/python.exe':'python3');
  const args=lang==='python'?['mock.py']:['--import',pathToFileURL(join(dir,'mock.mjs')).href,file];
  if(resume)args.push('video-task.json');
  const child=spawnSync(lang==='python'?python:process.execPath,args,{cwd:dir,encoding:'utf8',timeout:10000,env:{...process.env,PYTHONIOENCODING:'utf-8',WENYUN_API_KEY:'test-key',DOCS_SCENARIO:scenario}});
  assert.ok(!child.error,child.error?.message);
  const report=JSON.parse(readFileSync(join(dir,'calls.json'),'utf8'));
  return {...report,status:child.status,output:child.stdout+child.stderr,file:existsSync(join(dir,'result.mp4'))?readFileSync(join(dir,'result.mp4'),'utf8'):null,partial:existsSync(join(dir,'result.mp4.part')),saved:existsSync(join(dir,'video-task.json'))};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
for(const [pageId,model,duration] of [['video','wan-3.0',10],['sd-video','sd-2.0',6]]) for(const lang of ['javascript','python']){
 for(const scenario of ['success','retry'])test(pageId+' '+lang+'视频示例完成创建、轮询及下载：'+scenario,()=>{
  const r=execute(pageId,lang,scenario);assert.equal(r.status,0,r.output);assert.equal(r.file,'mock-video');assert.equal(r.partial,false);assert.ok(r.saved);
  const posts=r.calls.filter(c=>c.method==='POST');assert.equal(posts.length,1);
  const body=JSON.parse(posts[0].body);assert.equal(body.model,model);assert.equal(body.duration,duration);assert.equal(body.resolution,'720p');
  assert.ok(!JSON.stringify(posts[0].headers).includes('respond-async'));
  assert.equal(r.delays[0],lang==='python'?7:7000);
  if(scenario==='retry')assert.ok(r.delays[1]>=(lang==='python'?8:8000));
 });
 test(pageId+' '+lang+'视频示例恢复不重复提交',()=>{const r=execute(pageId,lang,'success',{resume:true});assert.equal(r.status,0,r.output);assert.equal(r.calls.filter(c=>c.method==='POST').length,0);assert.equal(r.file,'mock-video');});
 test(pageId+' '+lang+'视频示例拒绝覆盖已有任务',()=>{const r=execute(pageId,lang,'success',{existing:true});assert.equal(r.status,1);assert.equal(r.calls.length,0);});
 for(const scenario of ['failed','unknown','unauthorized','timeout','download-error','wrong-mime','create-error','invalid-create'])test(pageId+' '+lang+'视频异常终止且不重复生成：'+scenario,()=>{
  const r=execute(pageId,lang,scenario);assert.equal(r.status,1,r.output);assert.equal(r.file,null);assert.equal(r.partial,false);assert.equal(r.calls.filter(c=>c.method==='POST').length,1);
  if(!['create-error','invalid-create'].includes(scenario))assert.ok(r.saved);
 });
}
test('下载中断清理部分文件并保留任务编号',()=>{const r=execute('video','javascript','broken-download');assert.equal(r.status,1);assert.equal(r.file,null);assert.equal(r.partial,false);assert.ok(r.saved);});
