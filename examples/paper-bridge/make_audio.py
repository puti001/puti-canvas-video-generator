import asyncio, json, os, subprocess, sys, wave
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, r'C:\codex\影片\paper-bridge\python-deps')
import edge_tts
import numpy as np

FFMPEG = r'C:\Users\clong\.codex\tools\ffmpeg\bin\ffmpeg.exe'
if not os.path.exists(FFMPEG):
    FFMPEG = 'ffmpeg'

SCENES = [
    ('挑戰開始', [
        '一張薄薄的影印紙，能變成一座能承重的橋嗎？',
        '今天，你就是小小紙橋工程師！'
    ]),
    ('準備材料', [
        '準備三張完全相同的紙、兩疊等高的書，以及一些相同的硬幣。',
        '記住：我們只改變紙的形狀，其他條件保持不變。'
    ]),
    ('設計 A｜平紙橋', [
        '第一種：直接讓平平的紙，跨過兩疊書本。',
        '當重量放在中央時，平面的紙很容易直接向下彎曲。'
    ]),
    ('設計 B｜折邊橋', [
        '第二種：把紙的兩側長邊，向上折起一公分。',
        '原本平坦的紙，現在擁有了兩道直立的側壁。'
    ]),
    ('設計 C｜波浪橋', [
        '第三種：沿著長邊交替正折與反折，折出連續的山峰與山谷。',
        '像手風琴一樣，讓立體摺痕穩固連接兩端的橋墩。'
    ]),
    ('先預測，再驗證', [
        '平紙橋、折邊橋、波浪橋，你認為哪一座能撐起最多硬幣？',
        '按暫停，先說出你的理由，再動手驗證！'
    ]),
    ('力學秘密｜結構高度', [
        '為什麼紙沒有變多，抗彎能力卻大幅提升？',
        '關鍵在於「結構的高度」！直立的折痕增加了垂直截面厚度，讓紙張不易產生彎曲。'
    ]),
    ('力學秘密｜力量分散', [
        '更厲害的是，連續波浪形成了三角桁架結構！',
        '它把中央集中的重力，順著斜面均勻分散到兩側的橋墩上。'
    ]),
    ('公平測試的三個約定', [
        '要比較誰更堅固，必須做好公平測試：',
        '相同的紙張、相同的橋墩距離，以及硬幣一枚一枚放在相同的中央位置。'
    ]),
    ('把數據記下來', [
        '記錄橋面明顯彎曲前，總共放了幾枚硬幣。',
        '多做幾次實驗，用真實數據找出最佳設計！'
    ]),
    ('挑戰升級與動手做', [
        '如果把兩座橋墩的距離拉長一倍，你的設計還能撐得住嗎？',
        '拿出一張紙，現在就開始你的紙橋大挑戰吧！'
    ]),
]

async def main():
    assets = ROOT / 'assets'
    assets.mkdir(exist_ok=True)
    raw = []
    k = 0
    print("🎙️ 正在合成高品質微軟台灣神經語音 (曉臻)...")
    for si, (title, lines) in enumerate(SCENES):
        for line in lines:
            path = assets / f'voice_{k:02}.mp3'
            if not path.exists():
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(line, 'zh-TW-HsiaoChenNeural', rate='+6%').save(str(path))
                        break
                    except Exception as e:
                        if attempt == 2: raise e
                        await asyncio.sleep(1)
            pcm = subprocess.check_output([FFMPEG, '-v', 'error', '-i', str(path), '-f', 's16le', '-ac', '1', '-ar', '48000', '-'])
            raw.append((si, line, np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768))
            print(f'  [聲音 {k+1:02d}] {line}')
            k += 1

    sr = 48000
    chunks = []
    cues = []
    scenes = []
    now = 0.0

    def silence(d):
        nonlocal now
        chunks.append(np.zeros(round(d * sr), dtype=np.float32))
        now += d

    for si, (title, lines) in enumerate(SCENES):
        begin = now
        silence(0.45)
        for s, line, data in raw:
            if s != si: continue
            start = now
            chunks.append(data)
            now += len(data) / sr
            cues.append({'start': round(start, 3), 'end': round(now, 3), 'text': line, 'scene': si})
            silence(0.20)
        # Pause after each scene
        silence(3.0 if si == 5 else (2.0 if si in (6, 7, 10) else 0.75))
        scenes.append({'index': si, 'title': title, 'start': round(begin, 3), 'end': round(now, 3)})

    duration = round(now + 0.001, 2)
    narration = np.concatenate(chunks)
    length = round(duration * sr)
    narration = np.pad(narration, (0, max(0, length - len(narration))))[:length]

    print(f"🎵 正在合成五聲音階溫暖原聲 BGM 與力學音效 (總長度: {duration} 秒)...")
    music = np.zeros(length, dtype=np.float32)
    notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66, 349.23, 440.00]
    for beat, t in enumerate(np.arange(0.3, duration, 0.65)):
        f = notes[(beat // 2 + beat % 4) % len(notes)]
        tt = np.arange(min(round(1.5 * sr), length - round(t * sr))) / sr
        sound = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 4.0) * (1 - np.exp(-tt * 50))
        off = round(t * sr)
        music[off:off + len(tt)] += sound * 0.015

    # Fade in & out
    music *= np.minimum(np.arange(length) / sr / 2, 1) * np.minimum((length - np.arange(length)) / sr / 2, 1)

    # Scene transition sound effects
    for scene in scenes[1:]:
        off = round((scene['start'] + 0.05) * sr)
        tt = np.arange(round(0.22 * sr)) / sr
        cue = np.sin(2 * np.pi * (650 * tt + 750 * tt**2)) * np.exp(-tt * 20) * 0.022
        if off + len(cue) < length:
            music[off:off + len(cue)] += cue

    mix = narration * 0.88 + music
    wav_path = assets / 'mix.wav'
    with wave.open(str(wav_path), 'wb') as w:
        w.setparams((1, 2, sr, 0, 'NONE', 'not compressed'))
        w.writeframes((np.clip(mix, -0.98, 0.98) * 32767).astype('<i2').tobytes())

    m4a_path = assets / 'narration.m4a'
    subprocess.run([
        FFMPEG, '-y', '-v', 'error',
        '-i', str(wav_path),
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
        '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
        str(m4a_path)
    ], check=True)

    data = {
        'duration': duration,
        'voice': 'zh-TW-HsiaoChenNeural',
        'scenes': scenes,
        'cues': cues
    }

    (ROOT / 'timeline.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'timeline.js').write_text('window.FILM = ' + json.dumps(data, ensure_ascii=False) + ';', encoding='utf-8')

    def stamp(t):
        ms = round(t * 1000)
        return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

    srt_content = '\n\n'.join(
        f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}'
        for i, c in enumerate(cues)
    )
    (ROOT / '紙橋工程師_極致進化版.srt').write_text(srt_content, encoding='utf-8-sig')

    print(f"✨ 音訊與時間軸生成完畢！總長度: {duration:.2f} 秒，共 {len(cues)} 句字幕。")

if __name__ == '__main__':
    asyncio.run(main())
