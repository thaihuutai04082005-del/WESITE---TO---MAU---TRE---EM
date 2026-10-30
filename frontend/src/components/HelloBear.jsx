import { useEffect, useRef, useState } from 'react';
import { BEAR_MOTION } from './helloBearMotion';

/**
 * Gấu họa sĩ ở trang chủ.
 * Gấu là MỘT ảnh liền (không cắt rời thành từng mảnh). Đầu, tay, chân được uốn bằng một trường dịch chuyển
 * mượt trên WebGL (mỗi bộ phận có "bản đồ trọng số" mờ dần ở khớp), nên nét viền luôn nối liền, không hở,
 * không đứt khi chuyển động. Không có WebGL hoặc bật "giảm chuyển động" thì hiện ảnh tĩnh.
 */
const W = 640;
const H = 751;
const D2R = Math.PI / 180;

// Gốc xoay (tỉ lệ trên ảnh) — khớp với chuyển động cũ
const PIVOT = {
  head: [0.5, 0.507],
  armL: [0.252, 0.574],
  armR: [0.672, 0.583],
  legL: [0.304, 0.884],
  legR: [0.603, 0.884],
};
const EYE_Y = 0.303;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFull;
uniform sampler2D uEyes;
uniform sampler2D uW;
uniform vec2 uSize;
uniform float uHead;
uniform float uHeadY;
uniform float uArmL;
uniform float uArmR;
uniform float uLegL;
uniform float uLegR;
uniform float uBlink;
uniform vec2 uPHead;
uniform vec2 uPArmL;
uniform vec2 uPArmR;
uniform vec2 uPLegL;
uniform vec2 uPLegR;

// Điểm nguồn ứng với điểm đích p khi bộ phận quay quanh c một góc a (và tịnh tiến t)
vec2 back(vec2 p, vec2 c, float a, vec2 t) {
  vec2 d = p - c - t;
  float cs = cos(a);
  float sn = sin(a);
  return c + vec2(cs * d.x + sn * d.y, -sn * d.x + cs * d.y);
}

void main() {
  vec2 p = vUv * uSize;
  vec3 w = texture2D(uW, vUv).rgb;
  bool left = p.x < uSize.x * 0.46;
  vec2 head = back(p, uPHead * uSize, uHead, vec2(0.0, uHeadY));
  vec2 arm = left ? back(p, uPArmL * uSize, uArmL, vec2(0.0)) : back(p, uPArmR * uSize, uArmR, vec2(0.0));
  vec2 leg = left ? back(p, uPLegL * uSize, uLegL, vec2(0.0)) : back(p, uPLegR * uSize, uLegR, vec2(0.0));
  // Trường dịch chuyển liên tục (không ghép mảnh): ảnh chỉ bị uốn mượt nên nét luôn nối liền
  vec2 s = p + w.r * (head - p) + w.g * (arm - p) + w.b * (leg - p);
  vec4 col = texture2D(uFull, s / uSize);
  float cy = ${EYE_Y} * uSize.y;
  float ey = cy + (s.y - cy) / max(uBlink, 0.02);
  vec4 eyes = texture2D(uEyes, vec2(s.x, ey) / uSize);
  gl_FragColor = eyes + col * (1.0 - eyes.a);
}`;

// Nội suy tuần hoàn trên mảng mẫu đều (phần tử cuối = phần tử đầu)
function sample(arr, ph) {
  const n = arr.length - 1;
  const x = (ph - Math.floor(ph)) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const f = x - i;
  return arr[i] + (arr[i + 1] - arr[i]) * f;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function startWebGL(canvas, onReady) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const u = {
    head: U('uHead'), headY: U('uHeadY'), armL: U('uArmL'), armR: U('uArmR'),
    legL: U('uLegL'), legR: U('uLegR'), blink: U('uBlink'),
  };
  gl.uniform2f(U('uSize'), W, H);
  gl.uniform2fv(U('uPHead'), PIVOT.head);
  gl.uniform2fv(U('uPArmL'), PIVOT.armL);
  gl.uniform2fv(U('uPArmR'), PIVOT.armR);
  gl.uniform2fv(U('uPLegL'), PIVOT.legL);
  gl.uniform2fv(U('uPLegR'), PIVOT.legR);

  let raf = 0;
  let alive = true;
  let visible = true;
  const t0 = performance.now();
  const draw = () => {
    raf = 0;
    if (!alive) return;
    if (visible && !document.hidden) {
      const t = (performance.now() - t0) / 1000;
      const m = BEAR_MOTION;
      const ph6 = t / 6;
      gl.uniform1f(u.head, sample(m.head, ph6) * D2R);
      gl.uniform1f(u.headY, (sample(m.headY, ph6) / 100) * H);
      gl.uniform1f(u.armL, (sample(m.armL, ph6) + sample(m.raise, t / 14)) * D2R);
      gl.uniform1f(u.armR, sample(m.armR, ph6) * D2R);
      gl.uniform1f(u.legL, sample(m.legL, ph6) * D2R);
      gl.uniform1f(u.legR, sample(m.legR, ph6) * D2R);
      gl.uniform1f(u.blink, sample(m.blink, t / 4.5));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(draw);
  };

  const bind = (unit, img, premultiply) => {
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  const io = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver((es) => { visible = es[0].isIntersecting; })
    : null;
  io?.observe(canvas);
  const onLost = (e) => { e.preventDefault(); alive = false; onReady(false); };
  canvas.addEventListener('webglcontextlost', onLost);

  Promise.all([
    loadImage('/mascots/hello-full.webp'),
    loadImage('/mascots/hello-eyes.webp'),
    loadImage('/mascots/hello-weights.png'),
  ]).then(([full, eyes, weights]) => {
    if (!alive) return;
    bind(0, full, true);
    bind(1, eyes, true);
    bind(2, weights, false);
    gl.uniform1i(U('uFull'), 0);
    gl.uniform1i(U('uEyes'), 1);
    gl.uniform1i(U('uW'), 2);
    gl.viewport(0, 0, W, H);
    draw();
    onReady(true);
  }).catch(() => onReady(false));

  return () => {
    alive = false;
    if (raf) cancelAnimationFrame(raf);
    io?.disconnect();
    canvas.removeEventListener('webglcontextlost', onLost);
  };
}

export default function HelloBear({ className = '' }) {
  const canvasRef = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let stop = null;
    try {
      stop = startWebGL(canvasRef.current, setLive);
    } catch {
      stop = null;
    }
    return () => stop?.();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative mx-auto h-full" style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label="Bear painter">
        <div className="bear-sway absolute inset-0">
          <div className="bear-breathe absolute inset-0">
            {/* Ảnh tĩnh: hiện khi chưa có WebGL / giảm chuyển động */}
            <div className={live ? 'hidden' : ''}>
              <img src="/mascots/hello-full.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
              <img src="/mascots/hello-eyes.webp" alt="" className="absolute inset-0 h-full w-full" draggable={false} />
            </div>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className={`absolute inset-0 h-full w-full ${live ? '' : 'invisible'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
