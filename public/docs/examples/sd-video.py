import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ORIGIN = 'https://api.zzlye.xyz'
KEY = os.environ.get('WENYUN_API_KEY')
if not KEY:
    raise SystemExit('请设置 WENYUN_API_KEY')
TASK_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else 'video-task.json')
BODY = {
    'model': 'sd-2.0',
    'prompt': '晨光中的海边公路，一辆蓝色轿车平稳行驶，低机位跟拍',
    'duration': 6, 'resolution': '720p', 'aspect_ratio': '16:9',
    # 图生视频时在提示词中引用@Image1，并增加 image_urls: ['https://你的域名/参考图.jpg']。
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    # 不向跳转后的其他地址转发鉴权信息。
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect())


def open_request(path, data=None, timeout=30):
    headers = {'Authorization': 'Bearer ' + KEY}
    if data is not None:
        headers['Content-Type'] = 'application/json'
    request = urllib.request.Request(ORIGIN + path, data=data, headers=headers)
    return OPENER.open(request, timeout=timeout)


def retry_after(headers, fallback=15):
    value = headers.get('Retry-After')
    if not value:
        return fallback
    try:
        return max(float(value), 1)
    except ValueError:
        try:
            return max((parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds(), 1)
        except (TypeError, ValueError, OverflowError):
            return fallback


def main():
    interval = 15
    if len(sys.argv) > 1:
        # 传入保存的任务文件恢复查询，不创建新任务。
        submitted = json.loads(TASK_FILE.read_text(encoding='utf-8'))
    else:
        if TASK_FILE.exists():
            raise RuntimeError('已有video-task.json，请传入此文件恢复，或在新目录创建新任务')
        data = json.dumps(BODY, ensure_ascii=False).encode('utf-8')
        # 创建只尝试一次；超时不等于服务端没有受理。
        with open_request('/v1/videos', data, timeout=120) as response:
            submitted = json.load(response)
            interval = retry_after(response.headers)
        task_id = submitted.get('id') or submitted.get('task_id')
        if not task_id:
            raise RuntimeError('响应缺少视频任务id')
        print('请保留任务编号：', task_id)
        with TASK_FILE.open('x', encoding='utf-8') as file:
            json.dump(submitted, file, ensure_ascii=False, indent=2)
    task_id = submitted.get('id') or submitted.get('task_id')
    if not isinstance(task_id, str) or not task_id or task_id.startswith('async_'):
        raise RuntimeError('需要Videos任务id；async_编号请使用网关任务示例')
    endpoint = '/v1/videos/' + urllib.parse.quote(task_id, safe='')
    deadline = time.monotonic() + 30 * 60
    task = {}
    while time.monotonic() + interval < deadline:
        time.sleep(interval)
        try:
            with open_request(endpoint) as response:
                task = json.load(response)
                interval = retry_after(response.headers)
        except urllib.error.HTTPError as error:
            if error.code == 429 or error.code >= 500:
                interval = max(retry_after(error.headers), min(interval * 2, 30))
                error.close()
                continue
            raise
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            interval = min(interval * 2, 30)
            continue
        print('任务状态：', task.get('status'), '进度：', task.get('progress', '未提供'))
        if task.get('status') == 'completed':
            break
        if task.get('status') == 'failed':
            raise RuntimeError((task.get('error') or {}).get('message') or '视频生成失败：' + task_id)
        if task.get('status') not in ('queued', 'in_progress'):
            raise RuntimeError('未知视频状态：' + str(task.get('status')))
    if task.get('status') != 'completed':
        raise RuntimeError('本地等待结束；传入任务文件继续查询，服务端任务不会因此取消')
    Path('video-result.json').write_text(json.dumps(task, ensure_ascii=False, indent=2), encoding='utf-8')
    partial = Path('result.mp4.part')
    try:
        # 固定大小分块下载，不把整个视频加载到内存。
        with open_request(endpoint + '/content', timeout=300) as response:
            mime = response.headers.get('Content-Type', '').split(';')[0]
            if mime and not mime.startswith('video/') and mime != 'application/octet-stream':
                raise RuntimeError('下载返回的不是视频：' + mime)
            with partial.open('wb') as file:
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk:
                        break
                    file.write(chunk)
        partial.replace('result.mp4')
    finally:
        partial.unlink(missing_ok=True)
    print('已保存 result.mp4')


if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        # 输出有限长度的错误正文，避免把大型非JSON响应写满终端。
        print('HTTP', error.code, error.read(4096).decode('utf-8', errors='replace'), file=sys.stderr)
        error.close()
        sys.exit(1)
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
