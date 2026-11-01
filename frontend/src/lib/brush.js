// Vẽ nét tô tay lên <canvas> (lớp riêng nằm giữa lớp vùng SVG và lớp nét viền — Mục 4.2).
// Toạ độ nét lưu theo hệ 600×600 của tranh; `scale` = số pixel canvas trên 1 đơn vị tranh.
// Mỗi nét có `region` (vùng bé chạm xuống đầu tiên): nét chỉ ăn màu trong vùng đó (khóa vùng).
// Các kiểu nét: crayon (bút sáp), brush (cọ), glitter (sáp hạt lấp lánh), pattern (họa tiết).

function path(ctx, pts, s) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
  if (pts.length === 1) ctx.lineTo(pts[0][0] * s + 0.01, pts[0][1] * s);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i][0] + pts[i + 1][0]) / 2) * s;
    const my = ((pts[i][1] + pts[i + 1][1]) / 2) * s;
    ctx.quadraticCurveTo(pts[i][0] * s, pts[i][1] * s, mx, my);
  }
  if (pts.length > 1) ctx.lineTo(pts[pts.length - 1][0] * s, pts[pts.length - 1][1] * s);
}

function hexToRgb(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Bộ sinh số giả ngẫu nhiên cố định theo nét → vẽ lại luôn ra cùng một hình.
function rand(seed) {
  let x = seed || 1;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

// ---------------- Họa tiết ----------------

export const PATTERNS = [
  { id: 'rainbow', color: '#FFB454' },
  { id: 'dots', color: '#7FC8FF' },
  { id: 'stars', color: '#4F7BFF' },
  { id: 'hearts', color: '#FF8FB3' },
  { id: 'flowers', color: '#7ED87E' },
  { id: 'bee', color: '#FFD54F' },
];

const TILE = 28; // đơn vị tranh
const tileCache = new Map();

function drawTile(id, g, n) {
  const k = n / TILE;
  g.scale(k, k);
  const star = (cx, cy, r, c) => {
    g.fillStyle = c;
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      g.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
    }
    g.closePath();
    g.fill();
  };
  const heart = (cx, cy, r, c) => {
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(cx, cy + r);
    g.bezierCurveTo(cx - r * 1.5, cy - r * 0.1, cx - r * 0.7, cy - r * 1.1, cx, cy - r * 0.35);
    g.bezierCurveTo(cx + r * 0.7, cy - r * 1.1, cx + r * 1.5, cy - r * 0.1, cx, cy + r);
    g.fill();
  };
  if (id === 'rainbow') {
    const cols = ['#FF5F5F', '#FFA94D', '#FFE14D', '#5FD068', '#4FA3E0', '#9B6BFF'];
    g.rotate(-Math.PI / 4);
    const w = (TILE * Math.SQRT2) / cols.length;
    for (let i = -4; i < 12; i++) {
      g.fillStyle = cols[((i % 6) + 6) % 6];
      g.fillRect(-TILE, i * w - TILE, TILE * 3, w + 0.5);
    }
  } else if (id === 'dots') {
    g.fillStyle = '#A9DBFF';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = '#FFFFFF';
    for (const [x, y] of [[7, 7], [21, 7], [14, 21], [0, 21], [28, 21]]) {
      g.beginPath();
      g.arc(x, y, 4, 0, Math.PI * 2);
      g.fill();
    }
  } else if (id === 'stars') {
    g.fillStyle = '#5B86F0';
    g.fillRect(0, 0, TILE, TILE);
    star(8, 8, 6.5, '#FFE066');
    star(22, 21, 6.5, '#FFFFFF');
  } else if (id === 'hearts') {
    g.fillStyle = '#FFD6E4';
    g.fillRect(0, 0, TILE, TILE);
    heart(8, 9, 5.5, '#FF5F8A');
    heart(22, 22, 5.5, '#FF9EBB');
  } else if (id === 'flowers') {
    g.fillStyle = '#9BE08B';
    g.fillRect(0, 0, TILE, TILE);
    for (const [x, y] of [[8, 8], [21, 21]]) {
      g.fillStyle = '#FFFFFF';
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5;
        g.beginPath();
        g.arc(x + 4 * Math.cos(a), y + 4 * Math.sin(a), 3.2, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#FFC93C';
      g.beginPath();
      g.arc(x, y, 2.6, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    // bee: sọc vàng – nâu
    g.fillStyle = '#FFD54F';
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle = '#4A3320';
    g.fillRect(0, 4, TILE, 6);
    g.fillRect(0, 18, TILE, 6);
  }
}

/** Ảnh nhỏ (data URL) của một họa tiết để làm nút chọn. */
export function patternSwatchUrl(id, size = 56) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  g.save();
  drawTile(id, g, size);
  g.restore();
  return c.toDataURL();
}

function patternFor(ctx, id, s) {
  const n = Math.max(8, Math.round(TILE * s));
  const key = `${id}:${n}`;
  let tile = tileCache.get(key);
  if (!tile) {
    tile = document.createElement('canvas');
    tile.width = n;
    tile.height = n;
    drawTile(id, tile.getContext('2d'), n);
    tileCache.set(key, tile);
  }
  return ctx.createPattern(tile, 'repeat');
}

/** Vector pháp tuyến đơn vị tại mỗi điểm (để dời các sợi lông cọ ra hai bên nét). */
function normals(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 2)];
    const b = pts[Math.min(pts.length - 1, i + 2)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
}

function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function lighten(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const m = (v) => Math.round(v + (255 - v) * amt);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}

/** Nhãn nét theo kiểu bé chọn (không có `kind` = nét cũ: bút thường). */
function paintBody(ctx, stroke, s, pts, width) {
  const color = stroke.color;
  const size = stroke.size;
  const r = rand(pts.length * 7 + Math.round(pts[0][0] * 10) + Math.round(pts[0][1]));
  switch (stroke.kind) {
    case 'brush': {
      // Cọ: nét mềm, nhiều sợi lông mảnh dọc theo nét.
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = width * 0.94;
      path(ctx, pts, s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const nm = normals(pts);
      for (let k = -3; k <= 3; k++) {
        const off = (k / 3) * size * 0.42;
        const line = pts.map(([x, y], i) => [x + nm[i][0] * off, y + nm[i][1] * off]);
        ctx.strokeStyle = k % 2 ? lighten(color, 0.28) : color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = Math.max(1, width * 0.1);
        path(ctx, line, s);
        ctx.stroke();
      }
      break;
    }
    case 'glitter': {
      // Sáp hạt: nét đặc + hạt kim tuyến li ti rải trên nét.
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      path(ctx, pts, s);
      ctx.stroke();
      const grain = ['#FFFFFF', lighten(color, 0.55), '#FFF3B0', lighten(color, 0.25)];
      let acc = 0;
      const gap = Math.max(1.2, size * 0.12);
      for (let i = 0; i < pts.length; i++) {
        if (i > 0) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (i > 0 && acc < gap) continue;
        acc = 0;
        for (let g = 0; g < 4; g++) {
          const ang = r() * Math.PI * 2;
          const rad = Math.sqrt(r()) * (size / 2);
          ctx.fillStyle = grain[Math.floor(r() * grain.length)];
          ctx.globalAlpha = 0.65 + r() * 0.35;
          const x = (pts[i][0] + Math.cos(ang) * rad) * s;
          const y = (pts[i][1] + Math.sin(ang) * rad) * s;
          if (r() < 0.16) sparkle(ctx, x, y, (1.1 + r() * 1.6) * s);
          else {
            ctx.beginPath();
            ctx.arc(x, y, (0.5 + r() * 0.8) * s, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;
    }
    case 'pattern': {
      const pat = patternFor(ctx, stroke.pattern || 'rainbow', s);
      ctx.strokeStyle = pat || color;
      ctx.lineWidth = width;
      path(ctx, pts, s);
      ctx.stroke();
      break;
    }
    default: {
      // Bút sáp: nét đặc, thêm vân sáp nhẹ ở mép.
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      path(ctx, pts, s);
      ctx.stroke();
      if (stroke.kind === 'crayon') {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (let i = 0; i < pts.length; i += 2) {
          if (r() < 0.55) continue;
          const ang = r() * Math.PI * 2;
          const rad = Math.sqrt(r()) * (size / 2);
          ctx.beginPath();
          ctx.arc((pts[i][0] + Math.cos(ang) * rad) * s, (pts[i][1] + Math.sin(ang) * rad) * s, (0.3 + r() * 0.5) * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

let tmpCanvas = null;
function tmpFor(w, h) {
  tmpCanvas ||= document.createElement('canvas');
  if (tmpCanvas.width !== w || tmpCanvas.height !== h) {
    tmpCanvas.width = w;
    tmpCanvas.height = h;
  }
  return tmpCanvas;
}

/**
 * `region`: { path, above } của vùng khóa (toạ độ tranh) — nét chỉ hiện trong vùng này và không đè lên các vùng nằm trên nó.
 * Vùng có vùng khác đè lên thì nét được vẽ ra lớp tạm, trừ các vùng đó đi rồi mới ghép vào.
 */
export function drawStroke(ctx, stroke, s, region = null) {
  const pts = stroke.points;
  if (!pts?.length) return;
  if (!region?.above?.length) return drawStrokeRaw(ctx, stroke, s, region?.path || null);
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const pad = (stroke.size + 6) * s;
  const bx = Math.max(0, Math.floor(x0 * s - pad));
  const by = Math.max(0, Math.floor(y0 * s - pad));
  const bw = Math.min(W, Math.ceil(x1 * s + pad)) - bx;
  const bh = Math.min(H, Math.ceil(y1 * s + pad)) - by;
  if (bw <= 0 || bh <= 0) return;
  const eraser = stroke.tool === 'eraser';
  const tc = tmpFor(W, H);
  const t = tc.getContext('2d');
  t.clearRect(bx, by, bw, bh);
  drawStrokeRaw(t, eraser ? { tool: 'brush', color: '#000000', size: stroke.size, points: pts } : stroke, s, region.path);
  t.save();
  t.setTransform(s, 0, 0, s, 0, 0);
  t.globalCompositeOperation = 'destination-out';
  for (const p of region.above) t.fill(p);
  t.restore();
  ctx.save();
  if (eraser) ctx.globalCompositeOperation = 'destination-out';
  ctx.drawImage(tc, bx, by, bw, bh, bx, by, bw, bh);
  ctx.restore();
}

function drawStrokeRaw(ctx, stroke, s, regionPath = null) {
  const pts = stroke.points;
  const width = stroke.size * s;
  ctx.save();
  if (regionPath) {
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clip(regionPath);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = width;
    path(ctx, pts, s);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const color = stroke.color;
  switch (stroke.skin) {
    case 'but-sap': {
      // Bút sáp: nhiều nét mảnh lệch nhẹ, hơi trong → vân sáp.
      const r = rand(pts.length * 7 + Math.round(pts[0][0]));
      ctx.strokeStyle = color;
      for (let k = 0; k < 4; k++) {
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = width * 0.45;
        const off = pts.map(([x, y]) => [x + (r() - 0.5) * stroke.size * 0.5, y + (r() - 0.5) * stroke.size * 0.5]);
        path(ctx, off, s);
        ctx.stroke();
      }
      break;
    }
    case 'but-cham-bi': {
      ctx.fillStyle = color;
      let acc = 0;
      const gap = stroke.size * 1.4;
      for (let i = 0; i < pts.length; i++) {
        if (i > 0) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (i === 0 || acc >= gap) {
          acc = 0;
          ctx.beginPath();
          ctx.arc(pts[i][0] * s, pts[i][1] * s, width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'but-neon': {
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = width * 1.2;
      ctx.lineWidth = width;
      path(ctx, pts, s);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = width * 0.35;
      path(ctx, pts, s);
      ctx.stroke();
      break;
    }
    case 'but-long-vu': {
      const [r, g, b] = hexToRgb(color);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
      ctx.shadowColor = color;
      ctx.shadowBlur = width;
      ctx.lineWidth = width * 1.3;
      path(ctx, pts, s);
      ctx.stroke();
      break;
    }
    case 'but-cau-vong': {
      ctx.lineWidth = width;
      for (let i = 1; i < pts.length; i++) {
        ctx.strokeStyle = `hsl(${(i * 9) % 360} 90% 60%)`;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1][0] * s, pts[i - 1][1] * s);
        ctx.lineTo(pts[i][0] * s, pts[i][1] * s);
        ctx.stroke();
      }
      if (pts.length === 1) {
        ctx.fillStyle = 'hsl(0 90% 60%)';
        ctx.beginPath();
        ctx.arc(pts[0][0] * s, pts[0][1] * s, width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default:
      paintBody(ctx, stroke, s, pts, width);
  }
  ctx.restore();
}

/** `paths`: Map(id vùng → Path2D) để khóa từng nét vào vùng của nó. */
export function drawStrokes(ctx, strokes, s, paths = null) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const st of strokes) drawStroke(ctx, st, s, st.region && paths ? paths.get(st.region) || null : null);
}
