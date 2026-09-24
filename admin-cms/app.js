// Công cụ quản trị nội bộ (Mục 12): thêm chủ đề/đối tượng, tải tranh SVG mới, đánh số vùng — không cần sửa code.
// Manifest vùng tô (đa giác, diện tích hiển thị, vị trí số) được tính ngay trong trình duyệt bằng cùng
// thuật toán với bộ sinh tranh (assets-library/generator/build.mjs).

const API = '/api';
const $ = (s) => document.querySelector(s);
let token = localStorage.getItem('btm.admin.token');

async function api(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.code || `HTTP ${res.status}`);
  return data;
}

// ---------------- Đăng nhập ----------------
async function boot() {
  if (!token) return showLogin();
  try {
    const me = await api('GET', '/auth/me');
    if (me.user.role !== 'admin') throw new Error('admin_only');
    $('#who').textContent = me.user.nickname || me.user.username;
    $('#logout').hidden = false;
    $('#login-view').hidden = true;
    $('#app-view').hidden = false;
    await refresh();
  } catch (e) {
    token = null;
    localStorage.removeItem('btm.admin.token');
    showLogin(e.message === 'admin_only' ? 'Tài khoản này không có quyền quản trị.' : '');
  }
}

function showLogin(msg = '') {
  $('#login-view').hidden = false;
  $('#app-view').hidden = true;
  $('#login-error').textContent = msg;
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const s = await api('POST', '/auth/login', { username: f.get('username'), password: f.get('password') });
    token = s.token;
    localStorage.setItem('btm.admin.token', token);
    boot();
  } catch (err) {
    $('#login-error').textContent = err.message === 'invalid_credentials' ? 'Sai tên đăng nhập hoặc mật khẩu.' : err.message;
  }
});

$('#logout').addEventListener('click', () => {
  localStorage.removeItem('btm.admin.token');
  location.reload();
});

// ---------------- Cây nội dung ----------------
async function refresh() {
  const [{ themes }, stats] = await Promise.all([api('GET', '/admin/tree'), api('GET', '/admin/stats')]);
  $('#stats').innerHTML = [
    ['Người dùng', stats.users],
    ['Tranh trong kho', stats.pictures],
    ['Tranh đã tô', stats.artworks],
    ['Giao dịch đã thanh toán', stats.paidPayments],
    ['Trận Đấu trường', stats.arenaRooms],
  ]
    .map(([k, v]) => `<div><span>${k}</span>${v}</div>`)
    .join('');

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  $('#tree').innerHTML =
    '<ul>' +
    themes
      .map(
        (t) =>
          `<li><b>${esc(t.name.vi)}</b> <small>(${esc(t.slug)})</small><ul>` +
          t.objects
            .map(
              (o) =>
                `<li><details><summary>${esc(o.name.vi)} <small>(${o.pictures.length})</small></summary><ul>` +
                o.pictures
                  .map(
                    (p) =>
                      `<li class="pic"><span>${esc(p.name_vi)} ${p.is_card ? `<span class="badge">${p.rarity}</span>` : ''}</span><button class="danger" data-del="${p.id}" title="Xoá">✕</button></li>`,
                  )
                  .join('') +
                '</ul></details></li>',
            )
            .join('') +
          '</ul></li>',
      )
      .join('') +
    '</ul>';

  $('#theme-select').innerHTML = themes.map((t) => `<option value="${t.id}">${esc(t.name.vi)}</option>`).join('');
  $('#object-select').innerHTML = themes
    .map((t) => `<optgroup label="${esc(t.name.vi)}">${t.objects.map((o) => `<option value="${o.id}">${esc(o.name.vi)}</option>`).join('')}</optgroup>`)
    .join('');
}

$('#tree').addEventListener('click', async (e) => {
  const id = e.target.dataset?.del;
  if (!id || !confirm('Xoá tranh này khỏi kho?')) return;
  try {
    await api('DELETE', `/admin/pictures/${id}`);
    refresh();
  } catch (err) {
    alert(err.message === 'picture_in_use' ? 'Tranh đã có người tô hoặc sở hữu thẻ — không xoá được.' : err.message);
  }
});

for (const [form, path] of [
  ['#theme-form', '/admin/themes'],
  ['#object-form', '/admin/objects'],
]) {
  $(form).addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    try {
      await api('POST', path, body);
      e.target.reset();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  });
}

// ---------------- Tải tranh SVG ----------------
const NS = 'http://www.w3.org/2000/svg';
const DEFAULT_COLORS = ['#FF7AA2', '#FFD54F', '#4CAF50', '#FF9F43', '#4FA3E0', '#7D5FFF', '#C68B59', '#FF5F5F', '#8BD17C', '#F3D9B1'];
let current = null; // { svg: SVGElement, regions: [{ id, el, color }] }
let selected = null;

$('#is-card').addEventListener('change', (e) => ($('#rarity').disabled = !e.target.checked));

function sanitize(doc) {
  doc.querySelectorAll('script, foreignObject').forEach((n) => n.remove());
  doc.querySelectorAll('*').forEach((el) => {
    for (const a of [...el.attributes]) {
      if (/^on/i.test(a.name)) el.removeAttribute(a.name);
      if (/href$/i.test(a.name) && !a.value.startsWith('#')) el.removeAttribute(a.name);
    }
  });
}

function slugId(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

$('#svg-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const src = doc.documentElement;
  if (src.nodeName !== 'svg') return alert('File không phải SVG hợp lệ.');
  sanitize(doc);

  // Đưa về khung 600×600: giữ tỉ lệ, căn giữa.
  const vb = (src.getAttribute('viewBox') || `0 0 ${parseFloat(src.getAttribute('width')) || 600} ${parseFloat(src.getAttribute('height')) || 600}`).split(/[\s,]+/).map(Number);
  const s = 600 / Math.max(vb[2], vb[3]);
  const ox = (600 - vb[2] * s) / 2 - vb[0] * s;
  const oy = (600 - vb[3] * s) / 2 - vb[1] * s;
  const anim = $('#picture-form').animation.value;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('xmlns', NS);
  svg.setAttribute('viewBox', '0 0 600 600');
  const back = document.createElementNS(NS, 'g');
  back.setAttribute('class', 'scene-back');
  const subject = document.createElementNS(NS, 'g');
  subject.setAttribute('id', 'subject');
  subject.setAttribute('class', `subject anim-${anim}`);
  subject.setAttribute('transform', `translate(${ox} ${oy}) scale(${s})`);
  for (const child of [...src.childNodes]) subject.appendChild(document.importNode(child, true));
  svg.append(back, subject);

  const regions = [];
  const used = new Set();
  let n = 0;
  subject.querySelectorAll('path, rect, circle, ellipse, polygon').forEach((el) => {
    const fill = (el.getAttribute('fill') || el.style.fill || '').toLowerCase();
    if (fill === 'none' || el.closest('defs, clipPath, mask, pattern')) return;
    let id = slugId(el.getAttribute('data-region') || el.getAttribute('id')) || `vung-${++n}`;
    while (used.has(id)) id = `${id}-${++n}`;
    used.add(id);
    el.removeAttribute('style');
    el.setAttribute('id', `r-${id}`);
    el.setAttribute('data-region', id);
    el.setAttribute('class', 'region');
    el.setAttribute('fill', '#FFFFFF');
    if (!el.getAttribute('stroke')) el.setAttribute('stroke', '#1B2A38');
    if (!el.getAttribute('stroke-width')) el.setAttribute('stroke-width', String(3 / s));
    el.setAttribute('stroke-linejoin', 'round');
    regions.push({ id, el, color: DEFAULT_COLORS[regions.length % DEFAULT_COLORS.length] });
  });
  // Mọi tranh đều phải có vùng nền (Mục 3.1).
  if (!used.has('nen') && !used.has('nen-troi')) {
    const bg = document.createElementNS(NS, 'rect');
    Object.entries({ x: 0, y: 0, width: 600, height: 600, id: 'r-nen', 'data-region': 'nen', class: 'region', fill: '#FFFFFF', stroke: '#1B2A38', 'stroke-width': 3 }).forEach(([k, v]) => bg.setAttribute(k, v));
    back.appendChild(bg);
    regions.unshift({ id: 'nen', el: bg, color: '#BDE6FF' });
  }
  if (!regions.length) return alert('Không tìm thấy vùng tô nào trong SVG.');

  const host = $('#svg-preview');
  host.innerHTML = '';
  host.appendChild(svg);
  current = { svg, regions };
  selected = null;
  $('#sel-id').textContent = '—';
  $('#sel-color').disabled = true;
  recompute();
  $('#upload-btn').disabled = false;
});

$('#svg-preview').addEventListener('click', (e) => {
  const el = e.target.closest?.('[data-region]');
  if (!el || !current) return;
  current.svg.querySelectorAll('.selected').forEach((x) => x.classList.remove('selected'));
  el.classList.add('selected');
  selected = current.regions.find((r) => r.el === el);
  $('#sel-id').textContent = selected.id;
  $('#sel-color').disabled = false;
  $('#sel-color').value = selected.color.toLowerCase();
});

$('#sel-color').addEventListener('input', (e) => {
  if (!selected) return;
  selected.color = e.target.value.toUpperCase();
  paintPreview();
});
$('#show-labels').addEventListener('change', paintPreview);

// ---------------- Hình học (giống bộ sinh tranh) ----------------
function regionPoly(svg, el) {
  const m = svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
  const len = el.getTotalLength();
  const count = Math.max(24, Math.min(400, Math.round(len / 4)));
  const pts = [];
  for (let i = 0; i < count; i++) {
    const p = el.getPointAtLength((len * i) / count);
    pts.push([m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f]);
  }
  return pts;
}

function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function bboxOf(pts) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

const r1 = (v) => Math.round(v * 10) / 10;

function computeManifest(regions) {
  const STEP = 5;
  const N = 600 / STEP;
  const boxes = regions.map((r) => bboxOf(r.poly));
  const owner = new Int16Array(N * N).fill(-1);
  const counts = new Array(regions.length).fill(0);
  for (let gy = 0; gy < N; gy++) {
    for (let gx = 0; gx < N; gx++) {
      const x = gx * STEP + STEP / 2;
      const y = gy * STEP + STEP / 2;
      for (let k = regions.length - 1; k >= 0; k--) {
        const b = boxes[k];
        if (x < b[0] || x > b[2] || y < b[1] || y > b[3] || !pointInPoly(x, y, regions[k].poly)) continue;
        owner[gy * N + gx] = k;
        counts[k]++;
        break;
      }
    }
  }
  const dist = new Float32Array(N * N).fill(Infinity);
  const queue = [];
  for (let i = 0; i < N * N; i++) {
    const gx = i % N;
    const gy = (i - gx) / N;
    const o = owner[i];
    if (gx === 0 || gy === 0 || gx === N - 1 || gy === N - 1 || owner[i - 1] !== o || owner[i + 1] !== o || owner[i - N] !== o || owner[i + N] !== o) {
      dist[i] = 1;
      queue.push(i);
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const gx = i % N;
    const gy = (i - gx) / N;
    for (const [dx, dy, w] of [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]]) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N) continue;
      const j = ny * N + nx;
      if (owner[j] === owner[i] && dist[i] + w < dist[j]) {
        dist[j] = dist[i] + w;
        queue.push(j);
      }
    }
  }
  const best = regions.map(() => ({ d: -1, x: 0, y: 0 }));
  for (let i = 0; i < N * N; i++) {
    const k = owner[i];
    if (k < 0 || dist[i] <= best[k].d) continue;
    const gx = i % N;
    best[k] = { d: dist[i], x: gx * STEP + STEP / 2, y: ((i - gx) / N) * STEP + STEP / 2 };
  }
  return regions.map((r, k) => {
    const b = boxes[k];
    const clearance = best[k].d > 0 ? best[k].d * STEP : 6;
    const simple = [];
    for (const p of r.poly) {
      const last = simple[simple.length - 1];
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) >= 4) simple.push(p);
    }
    return {
      id: r.id,
      color: r.color,
      area: counts[k] * STEP * STEP,
      bbox: b.map(r1),
      label: best[k].d >= 0 ? [best[k].x, best[k].y] : [r1((b[0] + b[2]) / 2), r1((b[1] + b[3]) / 2)],
      labelSize: Math.max(9, Math.min(26, Math.round(clearance * 1.2))),
      poly: (simple.length >= 3 ? simple : r.poly).map(([x, y]) => [r1(x), r1(y)]),
    };
  });
}

function recompute() {
  for (const r of current.regions) r.poly = regionPoly(current.svg, r.el);
  current.manifest = computeManifest(current.regions);
  $('#region-count').textContent = `${current.regions.length} vùng tô`;
  paintPreview();
}

function paintPreview() {
  if (!current) return;
  const palette = [];
  for (const r of current.regions) {
    r.el.setAttribute('fill', r.color);
    let p = palette.find((x) => x.color === r.color);
    if (!p) palette.push((p = { number: palette.length + 1, color: r.color }));
    r.number = p.number;
  }
  current.svg.querySelector('#admin-labels')?.remove();
  if ($('#show-labels').checked) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('id', 'admin-labels');
    g.setAttribute('pointer-events', 'none');
    current.manifest.forEach((m, k) => {
      if (m.area < 60) return;
      const t = document.createElementNS(NS, 'text');
      Object.entries({ x: m.label[0], y: m.label[1], 'font-size': Math.min(22, m.labelSize), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-weight': 800, fill: '#1B2A38', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }).forEach(([a, v]) => t.setAttribute(a, v));
      t.textContent = current.regions[k].number;
      g.appendChild(t);
    });
    current.svg.appendChild(g);
  }
  $('#palette').innerHTML = palette.map((p) => `<li><span style="background:${p.color}"></span>${p.color}</li>`).join('');
}

$('#picture-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!current) return;
  $('#upload-error').textContent = '';
  $('#upload-ok').textContent = '';
  const f = new FormData(e.target);
  // SVG lưu vào kho: vùng về màu trắng, bỏ nhãn số và trạng thái chọn.
  const clone = current.svg.cloneNode(true);
  clone.querySelector('#admin-labels')?.remove();
  clone.querySelectorAll('[data-region]').forEach((el) => {
    el.setAttribute('fill', '#FFFFFF');
    el.setAttribute('class', 'region');
  });
  clone.querySelector('#subject').setAttribute('class', `subject anim-${f.get('animation')}`);
  const manifest = { regions: current.manifest.map((m, k) => ({ ...m, color: current.regions[k].color.toUpperCase() })) };
  try {
    const r = await api('POST', '/admin/pictures', {
      objectId: Number(f.get('objectId')),
      variantSlug: f.get('variantSlug'),
      variantNameVi: f.get('variantNameVi'),
      variantNameEn: f.get('variantNameEn'),
      animation: f.get('animation'),
      isCard: f.get('isCard') === 'on',
      rarity: f.get('rarity'),
      svg: new XMLSerializer().serializeToString(clone),
      manifest,
    });
    $('#upload-ok').textContent = `Đã lưu tranh "${r.slug}" vào kho.`;
    refresh();
  } catch (err) {
    $('#upload-error').textContent = { slug_taken: 'Slug biến thể đã tồn tại cho đối tượng này.', unsafe_svg: 'SVG chứa nội dung không an toàn.', invalid_manifest: 'Manifest vùng tô không hợp lệ.' }[err.message] || err.message;
  }
});

boot();
