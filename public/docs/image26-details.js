// 仅AZ和官key使用官方2.6扩展，Adobe、1K与默认分组的兼容型号不复用此处参数。
// 来源：https://developers.openai.com/api/docs/guides/image-generation
// 字段校验：https://developers.openai.com/api/reference/resources/images/methods/generate
// 编辑结构：https://developers.openai.com/api/reference/resources/images/methods/edit
const heading = value => ({ type: 'heading', value });
const paragraph = value => ({ type: 'paragraph', value });
const note = value => ({ type: 'note', value });
const table = (headers, rows) => ({ type: 'table', headers, rows });
const code = (lang, value) => ({ type: 'code', lang, value });

// 扩展格式用原协议响应演示Base64保存，避免把SVG、GIF交给只处理常规图片的下载器。
const request = (path, body, output = 'image-result.json') => code('bash', `curl --fail-with-body --max-time 300 'https://api.zzlye.xyz/v1/images/${path}' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -H 'Content-Type: application/json' \\
  --data '${JSON.stringify(body, null, 2)}' \\
  --output ${output}`);

export function officialImage26Blocks(model) {
  return [
    heading('GPT Image 2.6：官方扩展参数'),
    paragraph('本节用于本分组的2.6 Flare和Sunburst。Flare侧重快速迭代，Sunburst侧重复杂构图和精细编辑。常规PNG、JPEG、WebP继续使用前文的尺寸、画质、参考图和遮罩流程；SVG与GIF是额外输出能力，需要渠道具备对应权限。'),
    table(['参数', '类型 / 取值', '作用与约束'], [
      ['complexity', 'low / medium / high', '控制绘制前的规划计算，2.6省略时为high；与渲染画质quality独立，可用于文生图和编辑'],
      ['markup', '编辑专用，文件或对象', '在独立透明PNG上圈选或标注修改位置，配合prompt描述修改；不能与mask或prompt_rewriter一起提交'],
      ['output_format', 'png / jpeg / webp / svg / gif', 'svg与gif只用于POST /v1/images/generations，编辑接口仅使用常规图片格式'],
      ['svg', 'object，可选', 'SVG作者模型与推理设置，需要对应模型选择权限；未启用模型选择时省略，不自行填写未知模型名'],
      ['frame_count', 'integer，仅GIF', '默认9；按API字段参考使用2–16帧，仍需满足所选模型的帧尺寸及总像素预算'],
      ['frame_duration_ms', 'integer，仅GIF', '默认200毫秒；使用20–2000毫秒，编码按10毫秒取整'],
      ['stream', 'boolean，默认false', '原协议SSE流式返回；与网关202任务查询是不同响应方式，不和Prefer: respond-async混用'],
      ['partial_images', 'integer，0–3', '仅常规图片流式输出，默认0；SVG、GIF省略'],
      ['safety_identifier', 'string，最多128字符', '稳定的终端用户匿名标识；可对内部用户编号哈希，不填邮箱、姓名等个人信息'],
      ['input_fidelity', '省略', '不将旧模型的输入保真参数套用到本页型号']
    ]),
    table(['组合', '允许与限制'], [
      ['常规图片', 'PNG、JPEG、WebP；JPEG/WebP可用output_compression:0–100；透明背景使用PNG/WebP'],
      ['标注编辑', 'POST /v1/images/edits；markup只对应第一张图片，其他图片作为参考；markup和mask二选一'],
      ['SVG文生图', 'n固定1；不支持编辑、stream、partial_images、output_compression、prompt_rewriter；SVG也不能作为编辑输入的栅格图片'],
      ['GIF文生图', '不支持编辑、stream、partial_images、mask、output_compression、prompt_rewriter；frame_count与frame_duration_ms仅在GIF中使用'],
      ['持久任务', '普通图片完整示例使用Prefer: respond-async；本节SVG/GIF示例不加该请求头，直接保存原协议JSON中的b64_json']
    ]),
    heading('2.6复杂度与画质分开设置'),
    paragraph('局部改色、替换标牌等明确任务可从low或medium复杂度开始；密集文字、复杂布局或多个物体的关系可使用high。更高复杂度可能延长生成时间，也可能带来额外改动，不能用它代替quality。'),
    request('generations', {
      model, prompt: '一张咖啡店菜单海报，清晰排版，保留标题“今日特调”，蓝白配色',
      size: '1536x1024', quality: 'high', complexity: 'medium', output_format: 'png', n: 1
    }),
    heading('2.6标注编辑：markup'),
    paragraph('第一张图保留原始图片，另做一张只含圈线、箭头或草图的透明PNG。按图片方向校正后，标注图与第一张源图宽高必须一致，标注图必须包含透明像素，不能预先合成到原图。第一张图片及标注图各不超过16777216像素，标注文件不超过50MB。'),
    table(['提交方式', '字段'], [
      ['JSON源图', 'images:[{"image_url":"https://..."}]；最多16张，标注作用于第一张'],
      ['JSON标注图', 'markup:{"image_url":"https://..."}；也接受Base64 data URL；每个引用对象恰好一个image_url或file_id'],
      ['本地文件', 'multipart中分别上传image与markup；不要手动填写带boundary的Content-Type'],
      ['mask与markup', 'mask的透明区域描述修改范围；markup描述圈线、草图等标注意图。二者不同时发送']
    ]),
    request('edits', {
      model, images: [{ image_url: 'https://example.com/kitchen.webp' }],
      markup: { image_url: 'https://example.com/vase-overlay.png' },
      prompt: '将红圈标记的花瓶改成钴蓝色陶瓷，保持外形、花枝及其余画面不变，最终图片移除红圈',
      size: '1536x1024', quality: 'medium', complexity: 'low', n: 1
    }),
    code('bash', `curl --fail-with-body --max-time 300 'https://api.zzlye.xyz/v1/images/edits' \\
  -H "Authorization: Bearer $WENYUN_API_KEY" \\
  -F 'model=${model}' \\
  -F 'image=@kitchen.webp' \\
  -F 'markup=@vase-overlay.png' \\
  -F 'prompt=将标注的花瓶改成钴蓝色，其余画面不变，移除标记' \\
  -F 'quality=medium' \\
  -F 'complexity=low' \\
  -F 'n=1' \\
  --output image-result.json`),
    heading('2.6 SVG矢量图'),
    paragraph('output_format设为svg，n必须为1。quality与complexity控制用于生成SVG的参考画面；不要发送流式或压缩参数。原协议返回的data[].b64_json解码后是UTF-8 XML字节，保存为.svg，而不是.png。'),
    request('generations', {
      model, prompt: '一个简洁的橘子品牌矢量标志，平面形状，清晰轮廓，便于编辑颜色和路径',
      size: '1024x1024', quality: 'medium', complexity: 'medium', output_format: 'svg', n: 1
    }, 'svg-result.json'),
    heading('2.6 GIF动画'),
    paragraph('output_format设为gif，在prompt中说明主体、动作和循环方式。size描述每一帧的宽高，可用auto让模型选择；不能直接把常规4K静态图尺寸套到多帧动画。帧数、单帧尺寸及n共同受像素预算限制，超限时减少帧数、尺寸或输出数量。'),
    request('generations', {
      model, prompt: '一只可爱的橘子轻轻跳起，再回到原位，无缝循环，纯色背景',
      size: 'auto', quality: 'medium', output_format: 'gif', frame_count: 9, frame_duration_ms: 200, n: 1
    }, 'gif-result.json'),
    note('SVG和GIF需要对应渠道权限。返回不支持或无权限时，先核对该能力是否开放；不要在失败或超时后自动改参数重新生成。已受理任务先从任务日志核对结果，避免重复创建。'),
    heading('保存SVG、GIF或常规图片'),
    paragraph('下面程序读取前文保存的原协议JSON，逐项解码b64_json。文件后缀必须与请求的output_format一致；网关202响应需先按poll_url查询完成，不能把task_id当图片内容解码。'),
    code('python', `import base64
import json
import sys
from pathlib import Path

# 例如：python save-image.py svg-result.json svg
source = Path(sys.argv[1])
extension = sys.argv[2]
if extension not in ('png', 'jpeg', 'webp', 'svg', 'gif'):
    raise SystemExit('不支持的输出格式')
response = json.loads(source.read_text(encoding='utf-8'))
if response.get('error'):
    raise SystemExit(str(response['error']))
images = response.get('data') or []
if not images:
    raise SystemExit('响应尚无图片结果，请检查任务状态或错误信息')
for index, image in enumerate(images):
    encoded = image.get('b64_json')
    if not encoded:
        raise SystemExit('结果缺少b64_json')
    content = base64.b64decode(encoded, validate=True)
    if not content:
        raise SystemExit('结果内容为空')
    name = Path('image-' + str(index) + '.' + extension)
    # 排他创建，不覆盖已有文件。
    with name.open('xb') as file:
        file.write(content)
    print(name)
`)
  ];
}
