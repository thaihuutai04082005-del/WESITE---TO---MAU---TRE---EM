// Vẽ nét Brush tự do lên <canvas> (lớp riêng đè trên lớp vùng SVG — Mục 4.2).
// Toạ độ nét lưu theo hệ 600×600 của tranh; `scale` = số pixel canvas trên 1 đơn vị tranh.

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

export function drawStroke(ctx, stroke, s) {
  const pts = stroke.points;
  if (!pts?.length) return;
  const width = stroke.size * s;
  ctx.save();
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
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      path(ctx, pts, s);
      ctx.stroke();
  }
  ctx.restore();
}

export function drawStrokes(ctx, strokes, s) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const st of strokes) drawStroke(ctx, st, s);
}
