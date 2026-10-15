// Âm thanh của web: nhạc nền êm (lặp lại) + tiếng "ting" lúc lấp lánh khi bé bấm vào Tô màu.
// Một công tắc chung bật/tắt cả hai, nhớ lại lựa chọn của bé. Nhạc nền đã được chuẩn hoá nhỏ (~ -26 LUFS)
// như nhạc nền của các web dành cho trẻ em, nên để âm lượng phần tử ở mức tối đa là vừa tai.
const TING_URL = '/sounds/ting.mp3';
const MUSIC_URL = '/sounds/nhac-nen.mp3';
const KEY = 'btm.sound';
const MUSIC_VOLUME = 1;
const FADE_MS = 2500;

let enabled = readEnabled();
const listeners = new Set();

function readEnabled() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export const isSoundOn = () => enabled;
/** Nhạc đang thực sự phát (khác với "đã bật": trình duyệt có thể chặn nhạc tự phát). */
export const isMusicPlaying = () => !!music && !music.paused;
const notify = () => listeners.forEach((fn) => fn());
export const subscribeSound = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setSoundOn(on) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* bỏ qua */
  }
  if (on) playMusic();
  else pauseMusic();
  notify();
}

/** Bấm nút loa: đã bật mà nhạc chưa kêu (bị trình duyệt chặn) thì bấm là cho nhạc kêu; đang kêu thì tắt; đang tắt thì bật. */
export function toggleSound() {
  if (enabled && !isMusicPlaying()) {
    started = true;
    playMusic();
    return;
  }
  setSoundOn(!enabled);
}

/* ---------- Nhạc nền ---------- */
let music = null;
let started = false; // cờ "được phép phát": trình duyệt có thể chặn nhạc tự phát cho tới khi bé chạm vào trang
let fadeTimer = null;

function getMusic() {
  if (!music) {
    music = new Audio(MUSIC_URL);
    music.loop = true;
    music.preload = 'auto';
    music.addEventListener('playing', notify);
    music.addEventListener('pause', notify);
  }
  return music;
}

function fadeTo(target, ms, done) {
  const a = getMusic();
  clearInterval(fadeTimer);
  const from = a.volume;
  const t0 = performance.now();
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    a.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k >= 1) {
      clearInterval(fadeTimer);
      done?.();
    }
  }, 50);
}

function playMusic() {
  if (!started || !enabled || document.hidden) return;
  const a = getMusic();
  if (!a.paused) {
    fadeTo(MUSIC_VOLUME, FADE_MS);
    return;
  }
  a.volume = 0;
  a.play()
    .then(() => fadeTo(MUSIC_VOLUME, FADE_MS))
    .catch(() => {
      started = false; // chưa được phép phát → chờ lần chạm kế tiếp
    });
}

function pauseMusic() {
  if (!music || music.paused) return;
  fadeTo(0, 400, () => music.pause());
}

/** Gọi một lần khi mở web: thử phát nhạc ngay; nếu trình duyệt chưa cho thì phát ở lần chạm đầu tiên. Tạm dừng khi rời tab. */
export function initMusic() {
  started = true; // thử phát ngay khi mở web
  playMusic();
  preloadTing();
  const unlock = () => {
    started = true;
    playMusic();
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  const onVisibility = () => (document.hidden ? music && !music.paused && music.pause() : playMusic());
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    document.removeEventListener('visibilitychange', onVisibility);
    clearInterval(fadeTimer);
    music?.pause();
    started = false;
  };
}

/* ---------- Tiếng ting khi tô màu ---------- */
// Web Audio để phát tức thì và cho phép các tiếng ting chồng lên nhau khi bé bấm liên tục.
let ctx = null;
let buffer = null;
let loading = null;

function getContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

async function load(c) {
  if (buffer) return buffer;
  loading ??= fetch(TING_URL)
    .then((r) => r.arrayBuffer())
    .then((data) => c.decodeAudioData(data))
    .then((b) => (buffer = b))
    .catch(() => null);
  return loading;
}

/** Tải sẵn tiếng ting để lần bấm đầu tiên kêu ngay, không bị trễ. */
export function preloadTing() {
  const c = getContext();
  if (c) load(c);
}

export async function playTing() {
  if (!enabled) return;
  try {
    const c = getContext();
    if (!c) return;
    if (c.state === 'suspended') await c.resume();
    const b = buffer || (await load(c));
    if (!b) return;
    const src = c.createBufferSource();
    const gain = c.createGain();
    gain.gain.value = 0.6;
    src.buffer = b;
    src.connect(gain).connect(c.destination);
    src.start();
  } catch {
    /* không phát được âm thanh thì thôi, không ảnh hưởng việc tô */
  }
}
