import { MINIMAX_H3_EXAMPLE } from './minimax-h3-example.js?v=20261110-minimax-h3';

const heading = value => ({ type: 'heading', value });
const paragraph = value => ({ type: 'paragraph', value });
const note = value => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const code = (lang, value) => ({ type: 'code', lang, value });
const json = value => code('json', JSON.stringify(value, null, 2));
const request = body => code('bash', `curl --fail-with-body --max-time 120 'https://api.zzlye.xyz/v1/videos' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  --data '${JSON.stringify(body, null, 2)}'`);

// 使用本站Videos协议；素材数量按这款768p型号的实际渠道限制整理。
export const MINIMAX_H3_PAGE = {
  id: 'minimax-h3',
  label: 'MiniMax H3',
  title: 'MiniMax H3 视频',
  lead: 'minimax-h3-768p的文生视频、首尾帧、图片与音频参考、素材规格、异步任务及结果下载。',
  blocks: [
    heading('1. 型号与接口'),
    table(['模型名称', '输出档位', '时长', '参考图片', '参考视频', '参考音频'], [
      ['`minimax-h3-768p`', '768p', '4–15秒，整数', '最多9张', '不支持', '最多3段']
    ]),
    note('当前型号不支持视频参考。图片与音频混合参考最多12个文件；首尾帧模式与普通参考模式分开使用。'),
    table(['项目', '取值'], [
      ['API Base URL', '`https://api.zzlye.xyz/v1`'],
      ['创建视频', '`POST /v1/videos`，JSON请求'],
      ['查询视频', '`GET /v1/videos/{id}`'],
      ['内容下载', '`GET /v1/videos/{id}/content`'],
      ['鉴权', '`Authorization: Bearer <API_KEY>`，创建与查询均需要'],
      ['接入流程', '创建一次 → 保存id → 查询至completed → 下载并保存'],
      ['模型权限', 'Key需要有视频分组权限']
    ]),
    heading('2. 请求字段'),
    table(['字段', '类型', '必填', '规则'], [
      ['`model`', 'string', '是', '固定填写`minimax-h3-768p`'],
      ['`prompt`', 'string', '是', '非空，最多7000字符；描述主体、动作、镜头以及参考素材各自的用途'],
      ['`duration`', 'integer', '建议填写', '4–15秒，示例使用5秒；填写duration，不混传seconds'],
      ['`resolution`', 'string', '否', '型号限定768p档位，建议省略，由型号决定；不通过此字段切换2K'],
      ['`aspect_ratio`', 'string', '文生视频建议填写', '`21:9`、`16:9`、`4:3`、`1:1`、`3:4`、`9:16`；参考模式可用`adaptive`'],
      ['`images`', 'string[]', '否', '最多9张普通参考图片，数组顺序保留；推荐公网HTTPS图片URL'],
      ['`audios`', 'string[]', '否', '最多3段参考音频，仅使用公网HTTP(S)媒体URL'],
      ['`first_frame_url`', 'string', '否', '首帧图片URL，最多1张；指定开始画面'],
      ['`last_frame_url`', 'string', '否', '尾帧图片URL，最多1张；指定结束画面'],
      ['`image` / `audio`', 'string', '否', '单项兼容字段；存在images或audios时以对应数组为准，同类素材只选一种写法']
    ]),
    paragraph('使用JSON提交媒体URL，不上传multipart文件。URL应直接返回媒体文件，不能是分享页、本机路径或需要登录的页面。参考音频不接受Base64或Data URL；图片推荐使用URL，减少请求体积。'),
    heading('3. 比例与生成模式'),
    table(['模式', '素材字段', '比例与组合规则'], [
      ['文生视频', '仅prompt', '显式填写具体aspect_ratio，如16:9；不使用adaptive'],
      ['首帧 / 尾帧 / 首尾帧', 'first_frame_url和/或last_frame_url', '跟随输入画面，使用adaptive或省略比例；每个位置最多1张图片'],
      ['图片与音频参考', 'images、audios', '可指定具体比例或adaptive；图片最多9张、音频最多3段，总计不超过12个文件']
    ]),
    note('首尾帧字段用于约束起止画面，images用于普通参考。两种模式互斥，不在同一请求中混传first_frame_url / last_frame_url与images / audios。'),
    heading('4. 参考素材规格'),
    table(['素材', '格式与大小', '尺寸或时长', '数量'], [
      ['图片', 'JPG、JPEG、PNG、WebP、HEIC、HEIF；单张≤30MB', '宽、高分别为256–5760像素，宽高比0.4–2.5（2:5–5:2）', '普通参考≤9张；首帧≤1张、尾帧≤1张'],
      ['音频', 'WAV、MP3；单段≤15MB', '每段2–15秒；所有参考音频时长合计≤15秒', '≤3段'],
      ['视频', '当前型号不支持', '不传video、videos或video_urls', '0段'],
      ['完整请求', '请求体≤64MB，推荐用URL传素材', '媒体URL在排队和生成期间都需要有效', '混合参考≤12个文件']
    ]),
    paragraph('参考素材的作用写进prompt，例如“人物外观参考第一张图，服装参考第二张图，声音参考第一段音频”。音频是生成参考，不是将音频文件简单拼接到视频；是否保持音色和节奏由提示词及实际生成效果共同决定。'),
    heading('5. 文生视频'),
    code('bash', 'export WENYUN_API_KEY="<API_KEY>"'),
    code('powershell', '$env:WENYUN_API_KEY = "<API_KEY>"'),
    request({ model: 'minimax-h3-768p', prompt: '一只柴犬在樱花树下奔跑，电影质感，镜头平稳跟随', duration: 5, aspect_ratio: '16:9' }),
    paragraph('cURL示例使用Bash换行语法；PowerShell使用curl.exe并相应调整换行和环境变量。不要同时执行多个创建示例来完成同一次生成。'),
    heading('6. 图片与音频参考'),
    request({ model: 'minimax-h3-768p', prompt: '保持第一张图人物的外观和服装，让人物在海边回头微笑，镜头自然推进', duration: 5, aspect_ratio: '9:16', images: ['https://cdn.example.com/person.jpg'] }),
    request({ model: 'minimax-h3-768p', prompt: '人物外观参考第一张图，场景参考第二张图，人物说“欢迎来到海边”，音色参考第一段音频', duration: 8, aspect_ratio: '16:9', images: ['https://cdn.example.com/person.jpg', 'https://cdn.example.com/beach.jpg'], audios: ['https://cdn.example.com/voice.mp3'] }),
    heading('7. 首尾帧生成'),
    request({ model: 'minimax-h3-768p', prompt: '从开始画面自然过渡到结束画面，人物缓慢转身，保持镜头连续', duration: 5, aspect_ratio: 'adaptive', first_frame_url: 'https://cdn.example.com/start.jpg', last_frame_url: 'https://cdn.example.com/end.jpg' }),
    paragraph('只指定开始画面时仅传first_frame_url；只指定结束画面时仅传last_frame_url。首尾帧模式不同时传images或audios。'),
    heading('8. 异步任务与结果下载'),
    paragraph('创建成功返回任务对象，先保存id。以下JSON为响应结构示意，任务编号和时间以实际响应为准。HTTP 200或202只代表请求已受理，不能据此判断视频已经完成。'),
    json({ id: 'task_example', object: 'video', model: 'minimax-h3-768p', status: 'queued', progress: 0 }),
    code('bash', `curl --fail-with-body --max-time 30 'https://api.zzlye.xyz/v1/videos/<TASK_ID>' \\
  -H "Authorization: Bearer $WENYUN_API_KEY"`),
    table(['status', '含义', '后续处理'], [
      ['`queued`', '排队中', '保留同一个id继续查询'],
      ['`in_progress`', '生成中', '遵循Retry-After查询'],
      ['`completed`', '生成完成', '下载并保存视频'],
      ['`failed`', '生成失败', '停止查询，读取error.code和error.message']
    ]),
    json({ id: 'task_example', object: 'video', model: 'minimax-h3-768p', status: 'completed', progress: 100, metadata: { url: 'https://cdn.example.com/result.mp4' } }),
    paragraph('成功响应若包含metadata.url，原样请求此结果URL下载，不附加API Key。结果URL可能带有有效期，应及时保存。也可使用本站内容下载入口，此入口需要Bearer鉴权。'),
    code('bash', `curl --fail-with-body --max-time 300 'https://api.zzlye.xyz/v1/videos/<TASK_ID>/content' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" --output result.mp4`),
    note('任务协议使用本站/v1/videos和completed，不使用MiniMax原生/v2接口及task.content.url结构。若主动添加Prefer: respond-async，改用返回的poll_url查询网关任务，直到succeeded；不要混用两套编号和状态。'),
    heading('9. Node.js完整示例'),
    paragraph('Node.js 22或更新版本。保存为minimax-h3.mjs，设置WENYUN_API_KEY后在新目录运行。示例仅提交一次，立即保存video-task.json；查询与下载失败可用原任务文件恢复，不重复生成。'),
    code('bash', 'node minimax-h3.mjs\n# 恢复同一任务\nnode minimax-h3.mjs video-task.json'),
    // 完整示例由独立文件同步，测试会执行页面中的代码以验证任务恢复。
    code('javascript', MINIMAX_H3_EXAMPLE),
    heading('10. 错误处理与计费'),
    table(['情况', '检查方式', '处理方式'], [
      ['400 / 422', '参数或素材格式、数量、时长、比例不符合要求', '核对本页限制，读取error.message；当前型号不传视频参考'],
      ['401', 'Key缺失、无效或失效', '核对Authorization请求头'],
      ['402 / 403', '额度、余额或视频分组权限', '检查账户及Key设置'],
      ['404', '任务编号、路径或任务所属账号错误', '使用创建时返回的完整id和相同账号的有效Key'],
      ['429 / 临时5xx', '限流或临时查询异常', '遵循Retry-After并退避，只重试查询'],
      ['创建连接中断或超时', '请求可能已受理', '先到任务日志核对，避免重新创建造成重复扣费'],
      ['completed但下载失败', '结果链接失效或网络异常', '重查同一任务，或使用内容下载入口；保留任务编号']
    ]),
    paragraph('费用以账户实时价格、分组和使用日志为准。当前型号不支持视频参考，不套用其他视频型号的参考视频免费规则。客户端等待超时不会自动取消服务端任务，下载结果后自行保存备份。')
  ]
};

