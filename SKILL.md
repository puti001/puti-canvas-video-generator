---
name: puti-canvas-video-generator
description: 全向量 2D/3D Canvas 動態力學與科學教學動畫生成引擎。當提到「製作教學動畫」、「幾何動畫」、「科學動畫」、「物理動畫」、「STEM動畫」、「Canvas影片」、「向量動畫影片」或想要將自然科學、數學幾何、結構力學轉換為 1080p 逐格無損教學影片時載入此技能。
---

# 🌉 Puti-AI Canvas 2D/3D 動態教學動畫生成引擎 (Canvas Video Generator)

本技能專門為**自然科學、結構力學、數學幾何與 STEM 探究教學**設計，具備「原創 2D/3D 向量繪圖 ➔ 物理受力與向量流線 ➔ 台灣腔神經語音 ➔ 毫秒級時間軸 ➔ Playwright 逐影格無損渲染 ➔ 廣播級混音」的完整自動化流水線，一鍵輸出 1920×1080 30fps Full HD 原創教學動畫。

---

## 🛠️ 核心功能與特色

1. **原創 2D/3D Canvas 向量幾何繪圖引擎**：
   - **3D 透視幾何**：書本橋墩、立體摺紙、幾何多面體、硬幣光澤與動態陰影。
   - **動態力學向量（Force Vector Flow）**：重力分解箭頭、三角桁架（Truss）力量流動光波、應力集中警告區。
   - **微觀截面高度 HUD（Cross-Section Analysis）**：動態放大鏡掃描剖面，直觀比較結構高度（$h$）與抗彎剛度關係。
   - **原生物理彩帶系統（Native Physics Confetti）**：全螢幕 90+ 顆具備重力、空氣阻力與三維旋轉的繽紛彩帶。

2. **微軟 Edge-TTS 台灣神經語音與聲軌合成**：
   - 預設採用自然親切的女聲 `zh-TW-HsiaoChenNeural`（曉臻）。
   - NumPy 程式化合成純淨五聲音階原聲 BGM 與場景轉場音效。
   - FFmpeg 廣播級響度正規化（`loudnorm=I=-16:TP=-1.5:LRA=11`）與旁白自動降音（Ducking）。
   - 產出獨立 `.srt` 繁體中文字幕與毫秒級 `timeline.json`。

3. **高精準 1080p 30fps 逐幀無損壓制**：
   - 基於 Playwright Chromium 進行影格級時間軸驅動（`window.drawFilm(t)`）。
   - 透過管道（Pipe）將無損 PNG 串流對接 FFmpeg，杜絕任何黑影、凍結幀與畫面撕裂。

4. **科學探究七步教學法 (Pedagogical Inquiry Arc)**：
   - ① **挑戰破題** ➔ ② **控制變因材料準備** ➔ ③ **3D 結構多維展示** ➔ ④ **互動預測猜想（暫停討論）** ➔ ⑤ **力學幾何原理深入剖析** ➔ ⑥ **留白實驗數據表** ➔ ⑦ **進階挑戰與彩帶歡呼**。

---

## 📂 專案結構標準

每個生成的動畫專案包含以下標準檔案：
- `index.html`：Composition 舞台入口。
- `preview.html`：本地端帶進度條與播放控制的預覽測試頁。
- `animation.js`：核心 Canvas 2D/3D 渲染與動態繪圖腳本。
- `make_audio.py`：語音生成、BGM 混音與時間軸建構腳本。
- `render_fast.py`：Playwright 逐格無損捕捉與 FFmpeg 壓制腳本。
- `timeline.json` / `timeline.js`：逐句台詞與場景起訖時間。
- `output.srt`：獨立繁體中文字幕檔。

---

## 🚀 執行工作流

當使用者提出科學/幾何/物理動畫製作需求時：

### 步驟 1：建立專案工作區
在工作目錄中建立專屬資料夾，並載入標準模板。

### 步驟 2：生成語音與時間軸
編寫 `make_audio.py` 定義各場景口白，執行：
```powershell
python make_audio.py
```

### 步驟 3：編寫 Canvas 繪圖動畫 (`animation.js`)
根據主題繪製 3D 幾何、動態受力流線、微觀剖面與探究表格。

### 步驟 4：執行無損 1080p 渲染
執行：
```powershell
python render_fast.py
```
輸出 1080p 30fps 成品 MP4 與獨立 SRT 字幕。

---

屏東縣後庄國小黃朝榮老師作品，免費分享，歡迎擴散推廣，嚴禁商用與任何侵權、不尊重著作權的行為

[更多 Puti-AI 教學工具](https://padlet.com/clongwh/puti_ai_tools)
