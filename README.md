# Puti-AI Canvas 2D/3D 動態教學動畫生成引擎 (Canvas Video Generator)

全向量 2D/3D Canvas 動態力學與科學教學動畫生成引擎。專門為**自然科學、結構力學、數學幾何與 STEM 探究教學**設計，具備「原創 2D/3D 向量繪圖 ➔ 物理受力與向量流線 ➔ 台灣腔神經語音 ➔ 毫秒級時間軸 ➔ Playwright 逐影格無損渲染 ➔ 廣播級混音」的完整自動化流水線，一鍵輸出 1920×1080 30fps Full HD 原創教學動畫。

---

## 🌟 核心特色

1. **原創 2D/3D Canvas 向量繪圖**：
   - 3D 透視幾何（書本、摺紙、多面體、硬幣光澤與動態陰影）。
   - 動態力學向量流線（Truss Force Vector Flow、應力集中警告、重力分解）。
   - 微觀截面高度 HUD（直觀比較結構高度 $h$ 與抗彎剛度）。
   - 原生物理彩帶系統（90+ 顆具備重力與三維旋轉的繽紛彩帶）。
2. **神經語音與聲軌合成**：
   - 微軟 Edge-TTS 台灣語音（曉臻 `zh-TW-HsiaoChenNeural`）。
   - NumPy 純淨五聲音階原聲 BGM ＋ 側鏈自動降音（Ducking）。
   - 獨立 `.srt` 繁體中文字幕與毫秒級 `timeline.json`。
3. **高精準 1080p 逐幀無損壓制**：
   - Playwright Chromium 影格級時間軸驅動 ＋ FFmpeg 管道無損串流，0 黑影、0 掉幀。
4. **科學探究教學架構**：
   - 包含控制變因材料準備、互動預測猜想、力量傳導原理解析、留白實驗數據表與進階工程挑戰。

---

## 📂 專案結構

```
puti-canvas-video-generator/
├── SKILL.md                 # 全域 Agent 技能定義檔
├── README.md                # 專案說明文件
├── scripts/                 # 核心公用腳本
│   ├── make_audio.py        # 語音與混音合成
│   └── render_fast.py       # 1080p 逐格無損渲染
├── templates/               # 標準動畫模板
│   ├── index.html           # Canvas 舞台
│   ├── preview.html         # 本地互動播放器
│   └── animation_core.js    # Canvas 核心繪圖庫
└── examples/                # 範例工程
    └── paper-bridge/        # 紙橋工程師挑戰 (完整範例)
```

---

屏東縣後庄國小黃朝榮老師作品，免費分享，歡迎擴散推廣，嚴禁商用與任何侵權、不尊重著作權的行為

[更多 Puti-AI 教學工具](https://padlet.com/clongwh/puti_ai_tools)
