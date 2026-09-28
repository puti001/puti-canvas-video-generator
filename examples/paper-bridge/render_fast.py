"""
Puti-AI Next-Gen Video Renderer: High-Precision Frame-by-Frame Pipe to FFmpeg
Renders Canvas frames into 1080p 30fps MP4 without dropping a single frame.
"""

import os
import sys
import json
import base64
import subprocess
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
FFMPEG = r'C:\Users\clong\.codex\tools\ffmpeg\bin\ffmpeg.exe'
if not os.path.exists(FFMPEG):
    FFMPEG = 'ffmpeg'

OUTPUT_MP4 = r'c:\antigravity\影片\紙橋工程師_極致進化版.mp4'
AUDIO_PATH = ROOT / 'assets' / 'narration.m4a'
TIMELINE_PATH = ROOT / 'timeline.json'

def main():
    if not TIMELINE_PATH.exists():
        raise FileNotFoundError("timeline.json 不存在，請先執行 make_audio.py")

    with open(TIMELINE_PATH, 'r', encoding='utf-8') as f:
        timeline = json.load(f)

    duration = timeline['duration']
    fps = 30
    total_frames = int(duration * fps) + 1
    print(f"🎬 開始精準影格渲染 (總時長: {duration}s, 總影格數: {total_frames} 幀, 30fps)...", flush=True)

    ffmpeg_log = open(ROOT / "ffmpeg_render.log", "w", encoding="utf-8")

    ffmpeg_cmd = [
        FFMPEG, '-y',
        '-f', 'image2pipe',
        '-vcodec', 'png',
        '-r', str(fps),
        '-i', '-',
        '-i', str(AUDIO_PATH),
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        OUTPUT_MP4
    ]

    pipe = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stdout=ffmpeg_log, stderr=ffmpeg_log)

    html_path = (ROOT / 'index.html').as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--disable-gpu',
                '--no-sandbox'
            ]
        )
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()
        page.goto(html_path)
        page.wait_for_load_state('domcontentloaded')

        report_step = max(1, total_frames // 10)

        for frame_idx in range(total_frames):
            t = frame_idx / fps
            page.evaluate(f"window.drawFilm({t})")

            png_base64 = page.evaluate("""() => {
                const cv = document.getElementById('film');
                return cv.toDataURL('image/png').slice(22);
            }""")
            png_bytes = base64.b64decode(png_base64)
            pipe.stdin.write(png_bytes)

            if frame_idx % report_step == 0 or frame_idx == total_frames - 1:
                pct = int((frame_idx + 1) / total_frames * 100)
                print(f"  🚀 渲染進度: {pct}% ({frame_idx + 1}/{total_frames} 幀 | {t:.1f}s)", flush=True)

        browser.close()

    pipe.stdin.close()
    pipe.wait()
    ffmpeg_log.close()

    if pipe.returncode != 0:
        raise RuntimeError(f"FFmpeg 渲染失敗，請查看 ffmpeg_render.log")

    print(f"✨ 渲染大功告成！成品影片已輸出至: {OUTPUT_MP4}", flush=True)

if __name__ == '__main__':
    main()
