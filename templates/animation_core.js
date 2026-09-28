/* Puti-AI Paper Bridge Pro - Next-Gen Canvas 2D/3D Rendering Engine */
const cv = document.getElementById('film');
const ctx = cv.getContext('2d');

const C = {
  bg: '#F9F7F1',
  grid: '#EAE6DC',
  ink: '#1E293B',
  inkLight: '#334155',
  muted: '#64748B',
  blue: '#2563EB',
  blueLight: '#DBEAFE',
  blueDark: '#1E40AF',
  orange: '#F97316',
  orangeLight: '#FFEDD5',
  red: '#EF4444',
  green: '#10B981',
  greenLight: '#D1FAE5',
  gold: '#F59E0B',
  goldDark: '#B45309',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  shadow: 'rgba(15, 23, 42, 0.08)'
};

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOutBack = x => {
  x = clamp(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const lerp = (a, b, t) => a + (b - a) * t;

// Basic drawing utilities
function roundRect(x, y, w, h, r = 16, fill = C.white, stroke = null, strokeW = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = strokeW; ctx.stroke(); }
}

function text(s, x, y, size = 32, color = C.ink, weight = 600, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Microsoft JhengHei", "PingFang TC", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function line(points, color = C.ink, width = 3, dash = []) {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.setLineDash(dash);
  ctx.stroke();
  ctx.setLineDash([]);
}

function poly(points, fill, stroke = C.ink, width = 2) {
  ctx.beginPath();
  points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke(); }
}

function circle(x, y, r, fill, stroke = null, w = 2) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}

function arrow(x1, y1, x2, y2, color = C.orange, w = 5, headSize = 18) {
  line([[x1, y1], [x2, y2]], color, w);
  let a = Math.atan2(y2 - y1, x2 - x1);
  poly([
    [x2, y2],
    [x2 - headSize * Math.cos(a - 0.45), y2 - headSize * Math.sin(a - 0.45)],
    [x2 - headSize * Math.cos(a + 0.45), y2 - headSize * Math.sin(a + 0.45)]
  ], color, null);
}

function tag(s, x, y, color = C.blue, textColor = '#fff') {
  ctx.font = '700 24px "Microsoft JhengHei"';
  let w = ctx.measureText(s).width + 36;
  roundRect(x, y - 22, w, 44, 22, color);
  text(s, x + w / 2, y, 24, textColor, 700, 'center');
}

function enter(q, delay, fn) {
  let p = ease((q - delay) / 0.65);
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(0, 30 * (1 - p));
  fn();
  ctx.restore();
}

function heading(k, title, sub) {
  tag(k, 108, 175, C.orangeLight, C.orange);
  text(title, 108, 255, 62, C.ink, 800);
  if (sub) text(sub, 110, 325, 28, C.muted, 500);
}

// Background and HUD
function drawBackground(t, s) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, 1920, 1080);

  // Subtle Blueprint Grid
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  for (let x = 0; x < 1920; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x, 950); ctx.stroke();
  }
  for (let y = 110; y < 950; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke();
  }

  // Top Header Bar
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, 1920, 110);
  ctx.fillRect(0, 950, 1920, 130);

  // Header Title & Badge
  circle(88, 55, 14, C.blue);
  text('Puti-AI', 115, 55, 34, C.ink, 900);
  text('小小工程研究所 🔬', 260, 56, 24, C.muted, 600);

  tag('紙橋大挑戰 🌉', 1620, 55, C.blueLight, C.blueDark);
  line([[75, 110], [1845, 110]], C.border, 2);

  // Scene Step Number
  let curScene = s ? s.index + 1 : 1;
  text(`${String(curScene).padStart(2, '0')} / 11`, 1790, 160, 24, C.muted, 700, 'right');

  // Bottom Timeline Progress Bar
  if (window.FILM && FILM.scenes) {
    let totalScenes = FILM.scenes.length;
    let barW = (1845 - 75 - (totalScenes - 1) * 12) / totalScenes;
    for (let i = 0; i < totalScenes; i++) {
      let sc = FILM.scenes[i];
      let p = clamp((t - sc.start) / (sc.end - sc.start));
      let bx = 75 + i * (barW + 12);
      roundRect(bx, 1035, barW, 8, 4, '#E2E8F0');
      if (p > 0) {
        roundRect(bx, 1035, barW * p, 8, 4, C.blue);
      }
    }
  }
}

// Subtitle Pill
function drawSubtitle(t) {
  if (!window.FILM || !FILM.cues) return;
  let cue = FILM.cues.find(c => t >= c.start && t < c.end);
  if (!cue) return;
  let s = cue.text;

  ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Microsoft JhengHei", sans-serif';
  let textWidth = ctx.measureText(s).width;
  let pillW = Math.min(1760, textWidth + 80);
  let pillH = 74;
  let pillX = 960 - pillW / 2;
  let pillY = 935;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundRect(pillX, pillY, pillW, pillH, 20, 'rgba(30, 41, 59, 0.95)');
  ctx.restore();

  // Subtle top highlight border
  roundRect(pillX, pillY, pillW, pillH, 20, null, 'rgba(255,255,255,0.15)', 1.5);

  text(s, 960, pillY + pillH / 2, 34, '#FFFFFF', 600, 'center');
}

// 3D Coin
function drawCoin(x, y, r = 28, alpha = 1, glow = false) {
  ctx.save();
  ctx.globalAlpha *= alpha;

  if (glow) {
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 20;
  }

  // Rim bottom
  ctx.fillStyle = C.goldDark;
  ctx.beginPath();
  ctx.ellipse(x, y + 6, r, r * 0.40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face top
  let grad = ctx.createLinearGradient(x - r, y - r * 0.4, x + r, y + r * 0.4);
  grad.addColorStop(0, '#FDE68A');
  grad.addColorStop(0.5, '#F59E0B');
  grad.addColorStop(1, '#D97706');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.40, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#92400E';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner ring
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.75, r * 0.30, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();

  text('$', x, y, r * 0.45, '#78350F', 900, 'center');
  ctx.restore();
}

// 3D Pier Books
function draw3DBooks(cx, P, span) {
  const a = cx - 50, b = cx + 50, v = -110, w = 110;
  const bookColors = [
    { cover: '#2563EB', spine: '#1D4ED8', page: '#F8FAFC' },
    { cover: '#059669', spine: '#047857', page: '#F8FAFC' },
    { cover: '#D97706', spine: '#B45309', page: '#F8FAFC' }
  ];

  for (let bIdx = 0; bIdx < 3; bIdx++) {
    let bottom = -105 + bIdx * 35;
    let top = bottom + 35;
    let col = bookColors[bIdx];

    // Left Spine face
    poly([P(a, v, top), P(a, w, top), P(a, w, bottom), P(a, v, bottom)], col.spine, C.ink, 1.2);
    // Front long face (paper edges)
    poly([P(a, w, top), P(b, w, top), P(b, w, bottom), P(a, w, bottom)], col.cover, C.ink, 1.2);
    // Inner pages highlight
    poly([P(a + 6, w, top - 4), P(b - 4, w, top - 4), P(b - 4, w, bottom + 4), P(a + 6, w, bottom + 4)], col.page, null);
    // Book pages lines
    for (let p = 1; p <= 3; p++) {
      let z = bottom + 6 + p * 6;
      line([P(a + 8, w, z), P(b - 6, w, z)], '#CBD5E1', 0.8);
    }
    // Top cover face
    poly([P(a, v, top), P(b, v, top), P(b, w, top), P(a, w, top)], col.cover, C.ink, 1.2);

    // Spine Gold Ribbon Accent
    line([P(a, v + 20, top - 8), P(a, v + 20, bottom + 8)], 'rgba(255,255,255,0.7)', 1.5);
    line([P(a, w - 20, top - 8), P(a, w - 20, bottom + 8)], 'rgba(255,255,255,0.7)', 1.5);
  }
}

// 3D Bridge Master Engine
function drawBridge({
  x = 1000, y = 630, scale = 2.0, kind = 'flat', fold = 0, sag = 0,
  coins = 0, coinDrop = 0, span = 320, rot = 0, showForces = false, forcePulse = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const project = (a, b, z) => [a + b * 0.48, b * 0.32 - z];
  const P = (a, b, z) => project(
    a * Math.cos(rot) - b * Math.sin(rot),
    a * Math.sin(rot) + b * Math.cos(rot),
    z
  );

  // Ground Shadow
  ctx.save();
  ctx.scale(1, 0.28);
  let gr = ctx.createRadialGradient(0, 160, 40, 0, 160, 300);
  gr.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
  gr.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
  ctx.fillStyle = gr;
  ctx.fillRect(-380, -140, 760, 620);
  ctx.restore();

  // Draw Two Pier Books
  draw3DBooks(-span / 2 - 50, P, span);
  draw3DBooks(span / 2 + 50, P, span);

  // Generate Bridge Geometry
  let ys = [], zs = [];
  if (kind === 'accordion') {
    let a = fold * 1.15;
    for (let j = 0; j <= 8; j++) {
      ys.push(-95 * Math.cos(a) + j * 23.75 * Math.cos(a));
      zs.push(j % 2 ? 24 * Math.sin(a) : 0);
    }
  } else if (kind === 'edge') {
    let h = fold * 42;
    ys = [-95 + fold * 25, -65, 65, 95 - fold * 25];
    zs = [h, 0, 0, h];
  } else {
    // Flat
    ys = [-95, 95];
    zs = [0, 0];
  }

  const xx = i => -span / 2 - 40 + i * (span + 80) / 24;
  const zz = (a, j) => {
    let sagFactor = Math.pow(Math.max(0, 1 - Math.pow(a / (span / 2), 2)), 1.3);
    return zs[j] - sag * sagFactor;
  };

  // Render Paper Facets
  for (let j = 0; j < ys.length - 1; j++) {
    let pts = [];
    for (let i = 0; i <= 24; i++) pts.push(P(xx(i), ys[j], zz(xx(i), j)));
    for (let i = 24; i >= 0; i--) pts.push(P(xx(i), ys[j + 1], zz(xx(i), j + 1)));

    let fillColor = C.white;
    if (kind === 'accordion') {
      fillColor = j % 2 ? '#BFDBFE' : '#FFFFFF';
    } else if (kind === 'edge') {
      fillColor = (j === 0 || j === 2) ? '#DBEAFE' : '#FFFFFF';
    }

    poly(pts, fillColor, C.ink, 1.5);
  }

  // Dynamic Force Vector Waves (Truss Flow)
  if (showForces) {
    let waveT = (forcePulse * 4) % 1;
    let centerPt = P(0, 0, -sag);
    // Draw central gravity downward force
    arrow(centerPt[0], centerPt[1] - 80, centerPt[0], centerPt[1] - 5, C.red, 6, 20);

    // Lateral distributed arrows to piers
    let leftPierPt = P(-span / 2, 0, 0);
    let rightPierPt = P(span / 2, 0, 0);

    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -forcePulse * 24;
    line([centerPt, leftPierPt], C.blue, 4);
    line([centerPt, rightPierPt], C.blue, 4);
    ctx.restore();

    arrow(centerPt[0], centerPt[1], lerp(centerPt[0], leftPierPt[0], 0.75), lerp(centerPt[1], leftPierPt[1], 0.75), C.blue, 4);
    arrow(centerPt[0], centerPt[1], lerp(centerPt[0], rightPierPt[0], 0.75), lerp(centerPt[1], rightPierPt[1], 0.75), C.blue, 4);
  }

  // Coins On Top
  if (coins > 0) {
    let topZ = Math.max(...zs) - sag;
    let coinBase = P(0, 0, topZ);
    for (let c = 0; c < coins; c++) {
      let isLast = (c === coins - 1);
      let dropOffset = isLast ? coinDrop : 0;
      let cx = coinBase[0];
      let cy = coinBase[1] - c * 9 - 6 - dropOffset;
      drawCoin(cx, cy, 24, 1, isLast && coinDrop === 0);
    }
  }

  ctx.restore();
}

// Cross Section HUD
function drawCrossSection(x, y, kind, fold = 1, size = 1, label = '', heightVal = '') {
  ctx.save();
  ctx.translate(x, y);

  // Background Card
  roundRect(-160, -110, 320, 220, 18, '#FFFFFF', C.border, 2);
  text(label, 0, -75, 24, C.muted, 700, 'center');

  ctx.scale(size, size);
  let pts = [];
  if (kind === 'flat') {
    pts = [[-100, 0], [100, 0]];
  } else if (kind === 'edge') {
    pts = [[-100, -50 * fold], [-100, 0], [100, 0], [100, -50 * fold]];
  } else if (kind === 'accordion') {
    for (let i = 0; i <= 8; i++) {
      pts.push([-100 + i * 25, i % 2 ? -45 * fold : 0]);
    }
  }

  line(pts, C.blue, 7);

  // Height Indicator Dimension
  if (heightVal && fold > 0.5) {
    let dimX = 118;
    line([[dimX, 0], [dimX, -45 * fold]], C.orange, 2.5);
    line([[dimX - 6, 0], [dimX + 6, 0]], C.orange, 2);
    line([[dimX - 6, -45 * fold], [dimX + 6, -45 * fold]], C.orange, 2);
    text(heightVal, dimX + 16, -22 * fold, 20, C.orange, 800, 'left');
  }

  ctx.restore();
}

// Confetti Particles
let confettiParticles = [];
function initConfetti() {
  confettiParticles = [];
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  for (let i = 0; i < 90; i++) {
    confettiParticles.push({
      x: Math.random() * 1920,
      y: Math.random() * -600,
      size: 8 + Math.random() * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vRot: -0.1 + Math.random() * 0.2
    });
  }
}
initConfetti();

function drawConfettiAnim(q) {
  confettiParticles.forEach(p => {
    let cy = p.y + q * p.vy * 80;
    let cx = p.x + Math.sin(q * 2 + p.size) * 40;
    let rot = p.rot + q * p.vRot * 10;
    if (cy > 0 && cy < 1000) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
  });
}

// Main Frame Dispatcher
window.drawFilm = function (t) {
  if (!window.FILM) return;
  t = clamp(t, 0, FILM.duration - 0.001);

  let s = FILM.scenes.find(sc => t >= sc.start && t < sc.end) || FILM.scenes[FILM.scenes.length - 1];
  let q = t - s.start;
  let p = q / (s.end - s.start);

  drawBackground(t, s);
  renderScene(s.index, q, p, t);
  drawSubtitle(t);

  // Smooth paper wipe transition between scenes
  if (q < 0.25) {
    let alpha = 1 - q / 0.25;
    ctx.fillStyle = `rgba(249, 247, 241, ${alpha})`;
    ctx.fillRect(0, 110, 1920, 840);
  }
};

function renderScene(idx, q, p, t) {
  // 0: 挑戰開始
  if (idx === 0) {
    text('一張薄薄的影印紙', 120, 240, 48, C.muted, 600);
    text('紙橋造橋任務', 115, 345, 100, C.ink, 900);
    text('不能換紙！只能改形狀，能撐起多少重量？', 120, 450, 32, C.inkLight, 600);

    tag('預測 ➜ 測試 ➜ 結構力學改良', 120, 540, C.blue);

    // Right Side 3D Hero Bridge
    let bridgeFold = 0.85 + 0.10 * Math.sin(q * 1.5);
    drawBridge({
      x: 1330, y: 580, scale: 1.85,
      kind: 'accordion', fold: bridgeFold,
      rot: 0.05 * Math.sin(q * 0.8)
    });

    // Floating Coins with gold glow
    for (let c = 0; c < 4; c++) {
      let floatY = 320 + Math.sin(q * 2.0 + c * 1.2) * 16;
      drawCoin(1380 + c * 85, floatY, 34, 1, true);
    }

    roundRect(120, 680, 520, 140, 20, C.white, C.border, 2);
    text('PAPER BRIDGE CHALLENGE', 150, 725, 22, C.blue, 800);
    text('國小自然與結構力學啟蒙', 150, 775, 30, C.ink, 700);
  }

  // 1: 準備材料
  if (idx === 1) {
    heading('01 / 實驗準備', '桌上就能開始的科學探究', '只改變紙的形狀，其他條件完全保持相同。');

    const items = [
      { title: '三張相同的紙', sub: 'A4 影印紙 3 張', icon: '📄' },
      { title: '兩疊等高的書', sub: '高度相同作為橋墩', icon: '📚' },
      { title: '相同的硬幣', sub: '一元或五元硬幣數十枚', icon: '🪙' }
    ];

    for (let k = 0; k < 3; k++) {
      enter(q, k * 0.25, () => {
        let x = 110 + k * 575;
        let cardW = 545;
        let cardH = 460;
        roundRect(x, 380, cardW, cardH, 24, C.white, C.border, 2);
        tag(`STEP 0${k + 1}`, x + 32, 425, C.blueLight, C.blueDark);

        text(items[k].title, x + cardW / 2, 720, 36, C.ink, 800, 'center');
        text(items[k].sub, x + cardW / 2, 775, 24, C.muted, 600, 'center');

        // Card Visuals
        if (k === 0) {
          // 3 Stacked A4 sheets
          for (let s = 2; s >= 0; s--) {
            poly([
              [x + 150 + s * 16, 520 - s * 14],
              [x + 380 + s * 16, 490 - s * 14],
              [x + 430 + s * 16, 640 - s * 14],
              [x + 200 + s * 16, 670 - s * 14]
            ], s === 0 ? '#FFFFFF' : '#DBEAFE', C.ink, 1.5);
          }
        } else if (k === 1) {
          // 2 Stacks of books
          for (let b = 0; b < 2; b++) {
            let bx = x + 90 + b * 200;
            roundRect(bx, 530, 160, 38, 8, C.blue);
            roundRect(bx, 575, 160, 38, 8, C.green);
            roundRect(bx, 620, 160, 38, 8, C.orange);
          }
        } else if (k === 2) {
          // Grid of 6 Coins
          for (let c = 0; c < 6; c++) {
            let cx = x + 160 + (c % 3) * 110;
            let cy = 540 + Math.floor(c / 3) * 80;
            drawCoin(cx, cy, 40, 1, true);
          }
        }
      });
    }
  }

  // 2: 設計 A｜平紙橋
  if (idx === 2) {
    heading('02 / 設計 A', '第一種：平紙橋', '先觀察：重量放上去時，平坦的紙會發生什麼變化？');

    let sagT = ease((q - 1.8) / 1.5);
    let coinDropY = Math.max(0, 1 - ease((q - 1.2) / 0.8)) * 180;

    drawBridge({
      x: 1040, y: 580, scale: 2.3,
      kind: 'flat', sag: 48 * sagT,
      coins: q > 1.2 ? 1 : 0, coinDrop: coinDropY
    });

    enter(q, 3.2, () => {
      arrow(1040, 360, 1040, 470, C.red, 7, 24);
      roundRect(1320, 640, 360, 100, 20, '#FEE2E2', C.red, 2);
      text('⚠️ 平面結構無法抵抗彎曲', 1500, 690, 24, C.red, 800, 'center');
    });

    text('實測示意：未折疊的紙張垂直厚度極小，放上一枚硬幣就迅速下凹垮塌。', 110, 870, 26, C.muted, 600);
  }

  // 3: 設計 B｜折邊橋
  if (idx === 3) {
    heading('03 / 設計 B', '第二種：把兩側長邊折起', '沿著長邊向上折出一公分的直立側壁。');

    let foldT = ease((q - 1.0) / 3.0);
    drawBridge({
      x: 980, y: 600, scale: 2.1,
      kind: 'edge', fold: foldT,
      rot: 0.04 * Math.sin(p * Math.PI)
    });

    enter(q, 1.5, () => {
      drawCrossSection(1580, 480, 'edge', foldT, 0.9, '從橋的一端看 (剖面)', 'h = 15mm');
      tag('💡 平面 ➜ 產生直立側樑', 120, 850, C.blue);
    });
  }

  // 4: 設計 C｜波浪橋
  if (idx === 4) {
    heading('04 / 設計 C', '第三種：折出連續山谷與波浪', '沿著長邊交替正折與反折，打造手風琴結構。');

    let foldT = ease((q - 1.0) / 3.0);
    drawBridge({
      x: 980, y: 590, scale: 2.1,
      kind: 'accordion', fold: foldT,
      rot: -0.04 * Math.sin(p * Math.PI)
    });

    enter(q, 1.5, () => {
      drawCrossSection(1580, 480, 'accordion', foldT, 0.95, '從橋的一端看 (波浪截面)', 'h = 25mm');
      tag('💡 連續立體三角結構', 120, 850, C.orange);
    });
  }

  // 5: 先預測，再驗證
  if (idx === 5) {
    heading('05 / 換你預測', '哪一座紙橋，能撐起最多硬幣？', '請先說出你的推論理由，再開始動手測試！');

    const bridges = [
      { name: 'A. 平紙橋', kind: 'flat', fold: 0, tagCol: C.ink },
      { name: 'B. 兩側折邊橋', kind: 'edge', fold: 1, tagCol: C.blue },
      { name: 'C. 波浪手風琴橋', kind: 'accordion', fold: 1, tagCol: C.orange }
    ];

    for (let k = 0; k < 3; k++) {
      let x = 110 + k * 575;
      let cardW = 545;
      roundRect(x, 390, cardW, 380, 24, C.white, C.border, 2);
      tag(bridges[k].name, x + 30, 435, bridges[k].tagCol);

      drawBridge({
        x: x + cardW / 2, y: 580,
        scale: 0.90, kind: bridges[k].kind, fold: bridges[k].fold,
        rot: Math.sin(q * 0.8 + k) * 0.04
      });
    }

    if (p > 0.45) {
      let pulse = 1 + 0.08 * Math.sin(q * 6);
      ctx.save();
      ctx.translate(960, 850);
      ctx.scale(pulse, pulse);
      roundRect(-280, -35, 560, 70, 35, C.gold, null);
      circle(-220, 0, 26, '#92400E');
      text('?', -220, 0, 34, '#FFFFFF', 900, 'center');
      text('按暫停 ⏸ 和同學聊聊你的預測', 0, 0, 28, '#78350F', 800, 'center');
      ctx.restore();
    }
  }

  // 6: 力學秘密｜結構高度
  if (idx === 6) {
    heading('06 / 力學秘密 1', '結構的高度：為什麼形狀能改變抗彎能力？', '同一張紙，材質沒變，但「垂直截面高度」徹底改變了！');

    // Left Card: Flat
    roundRect(110, 380, 780, 420, 24, C.white, C.border, 2);
    tag('平紙截面', 145, 425, C.muted);
    drawCrossSection(500, 560, 'flat', 1, 1.4, '', 'h ≈ 0.1mm');
    text('極薄，垂直方向無支撐力 ➜ 容易彎曲', 500, 740, 26, C.red, 700, 'center');

    // Right Card: Folded & Wave
    roundRect(930, 380, 880, 420, 24, C.white, C.border, 2);
    tag('立體折痕截面', 965, 425, C.blue);
    drawCrossSection(1160, 560, 'edge', 1, 0.85, '', 'h = 15mm');
    drawCrossSection(1580, 560, 'accordion', 1, 0.85, '', 'h = 25mm');
    text('折痕產生了立體高度 ➜ 抗彎能力暴增！', 1370, 740, 28, C.blueDark, 800, 'center');

    text('💡 物理小知識：物體的抗彎剛度與高度的三次方成正比（高度增加，強度大幅提升）', 960, 875, 26, C.ink, 700, 'center');
  }

  // 7: 力學秘密｜力量分散
  if (idx === 7) {
    heading('07 / 力學秘密 2', '三角桁架：把力量分散到兩端橋墩', '波浪折紙就像建築裡的三角桁架（Truss），能有效分擔載重。');

    drawBridge({
      x: 960, y: 580, scale: 2.1,
      kind: 'accordion', fold: 1,
      coins: 3, showForces: true, forcePulse: q
    });

    roundRect(110, 830, 1700, 90, 20, '#EFF6FF', C.blue, 2);
    text('向下重力 ⬇️ 藉由斜向山峰與山谷，轉化為向兩側傳遞的支撐力 ⬅️ ➡️', 960, 875, 28, C.blueDark, 700, 'center');
  }

  // 8: 公平測試的三個約定
  if (idx === 8) {
    heading('08 / 公平測試', '科學探究的三個公平約定', '要比較「紙的形狀」，其他所有變因都必須保持一致！');

    const rules = [
      { title: '1. 相同的紙張', desc: '材質、厚度、尺寸必須完全一致', icon: '📄' },
      { title: '2. 相同的橋墩間距', desc: '兩疊書本的跨距必須固定不變', icon: '📏' },
      { title: '3. 相同硬幣與位置', desc: '枚枚輕放於中央，同一標準停測', icon: '🎯' }
    ];

    for (let k = 0; k < 3; k++) {
      enter(q, k * 0.3, () => {
        let x = 110 + k * 575;
        let cardW = 545;
        roundRect(x, 390, cardW, 400, 24, C.white, C.border, 2);

        circle(x + 70, 450, 32, C.greenLight);
        text('✔', x + 70, 450, 32, C.green, 900, 'center');

        text(rules[k].title, x + cardW / 2, 570, 34, C.ink, 800, 'center');
        text(rules[k].desc, x + cardW / 2, 640, 24, C.muted, 600, 'center');

        roundRect(x + 50, 710, cardW - 100, 44, 22, '#F1F5F9');
        text('控制變因・嚴謹測試', x + cardW / 2, 732, 20, C.inkLight, 700, 'center');
      });
    }
  }

  // 9: 把數據記下來
  if (idx === 9) {
    heading('09 / 實驗紀錄表', '測到什麼，就誠實記錄什麼', '記下橋面明顯下塌前所能承受的硬幣數量。');

    roundRect(110, 380, 1700, 440, 24, C.white, C.border, 2);

    // Table Header
    roundRect(140, 410, 1640, 70, 12, '#F1F5F9');
    text('紙橋設計類型', 300, 445, 26, C.ink, 800, 'center');
    text('第一次測試', 720, 445, 26, C.ink, 800, 'center');
    text('第二次測試', 1140, 445, 26, C.ink, 800, 'center');
    text('第三次測試 (平均)', 1560, 445, 26, C.ink, 800, 'center');

    const rows = [
      { name: 'A. 平紙橋', col: C.ink },
      { name: 'B. 折邊橋', col: C.blue },
      { name: 'C. 波浪手風琴橋', col: C.orange }
    ];

    for (let r = 0; r < 3; r++) {
      let ry = 510 + r * 95;
      line([[140, ry - 15], [1780, ry - 15]], C.border, 1.5);

      tag(rows[r].name, 160, ry + 20, rows[r].col);

      // Blank test slots
      for (let c = 0; c < 3; c++) {
        let slotX = 720 + c * 420;
        roundRect(slotX - 110, ry - 10, 220, 60, 10, '#FAFAFA', C.border, 1.5);
        text('____ 枚', slotX, ry + 20, 24, C.muted, 600, 'center');
      }
    }

    text('🔬 多試幾次取平均，看看你的實驗結果是否接近！', 960, 875, 28, C.blue, 700, 'center');
  }

  // 10: 挑戰升級與動手做
  if (idx === 10) {
    heading('10 / 進階工程挑戰', '橋墩距離加倍，你的設計還有效嗎？', '工程師不只會猜測，更會用數據與實驗持續改良設計！');

    let expandSpan = 300 + ease(q / 3) * 160;
    drawBridge({
      x: 960, y: 560, scale: 1.8,
      kind: 'accordion', fold: 1,
      span: expandSpan,
      coins: 4
    });

    drawConfettiAnim(q);

    // Call to Action Card
    roundRect(460, 770, 1000, 100, 50, C.blue, null);
    text('🎉 拿出一張紙與硬幣，開始你的紙橋大挑戰吧！', 960, 820, 34, '#FFFFFF', 800, 'center');
  }
}
