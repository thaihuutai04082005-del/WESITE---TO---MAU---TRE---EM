// Hiệu ứng âm thanh "ting" khi bé chạm tô một vùng màu.
// Dùng Web Audio để phát tức thì và cho phép các tiếng ting chồng lên nhau khi bé tô liên tục;
// nếu trình duyệt không hỗ trợ thì lặng lẽ bỏ qua.
const URL = '/sounds/ting.mp3';
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
  loading ??= fetch(URL)
    .then((r) => r.arrayBuffer())
    .then((data) => c.decodeAudioData(data))
    .then((b) => (buffer = b))
    .catch(() => null);
  return loading;
}

export async function playTing() {
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
