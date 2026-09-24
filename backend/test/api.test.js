// Test tích hợp: chạy server thật (DB trong bộ nhớ) và đi qua các luồng chính.
process.env.DB_FILE = ':memory:';
process.env.ARENA_DURATION_SEC = '60';
process.env.ARENA_LOBBY_WAIT_SEC = '1';
process.env.ARENA_MIN_PLAYERS = '2';
process.env.ARENA_SLOTS = '';

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { io as ioc } from 'socket.io-client';

const { createApp } = await import('../src/app.js');
const { seedAll } = await import('../../database/seeds/seed.js');
const { initRealtime } = await import('../src/services/realtime.js');
const { registerArena } = await import('../src/services/arena.js');
const { registerCollab } = await import('../src/services/collab.js');
const { _peekCaptcha } = await import('../src/services/captcha.js');
const { getDb } = await import('../src/config/db.js');
const { runCleanup } = await import('../src/services/lifecycle.js');

let server;
let base;

before(async () => {
  await seedAll();
  server = createServer(createApp());
  initRealtime(server, { registerHandlers: [registerArena, registerCollab] });
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

const openSockets = [];

after(async () => {
  openSockets.forEach((s) => s.close());
  (await import('../src/services/realtime.js')).getIo()?.close();
  server.closeAllConnections();
  server.close();
});

async function api(method, path, body, token) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json, headers: res.headers };
}

let otpSeq = 0;
async function register(username, password = 'abc12345', nickname = username) {
  const { body: cap } = await api('GET', '/auth/captcha');
  // Dùng SĐT khác nhau để không bị chặn chống spam OTP.
  const phone = `09${String(10000000 + ++otpSeq).padStart(8, '0')}`;
  const start = await api('POST', '/auth/register/start', {
    username, password, captchaId: cap.captchaId, captchaText: _peekCaptcha(cap.captchaId), contactType: 'phone', contact: phone,
  });
  assert.equal(start.status, 200, JSON.stringify(start.body));
  const verify = await api('POST', '/auth/register/verify', { registrationId: start.body.registrationId, code: start.body.devCode });
  assert.equal(verify.status, 201);
  const login = await api('POST', '/auth/login', { username, password });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.needsNickname, true);
  await api('PUT', '/users/me', { nickname }, login.body.token);
  return { token: login.body.token, id: login.body.user.id, phone };
}

const FULL_FILLS = (picture, color = null) => Object.fromEntries(picture.regions.map((r, i) => [r.id, color || ['#FF5F7E', '#2B9BF4', '#4CD787', '#FFC94D', '#7D5FFF'][i % 5]]));

test('Đăng ký: sai CAPTCHA bị từ chối, mật khẩu yếu bị từ chối', async () => {
  const { body: cap } = await api('GET', '/auth/captcha');
  assert.match(cap.svg, /^<svg/);
  const bad = await api('POST', '/auth/register/start', { username: 'beso1', password: 'abc12345', captchaId: cap.captchaId, captchaText: 'XXXX', contactType: 'phone', contact: '0912345678' });
  assert.equal(bad.body.error.code, 'captcha_wrong');
  const { body: cap2 } = await api('GET', '/auth/captcha');
  const weak = await api('POST', '/auth/register/start', { username: 'beso1', password: '123', captchaId: cap2.captchaId, captchaText: _peekCaptcha(cap2.captchaId), contactType: 'phone', contact: '0912345678' });
  assert.equal(weak.body.error.code, 'invalid_input');
});

test('Luồng tô màu + giới hạn gói Free + nâng cấp + nhiệm vụ', async () => {
  const { token } = await register('bena01');
  const themes = await api('GET', '/themes');
  assert.equal(themes.body.themes.length, 5);
  assert.ok(themes.body.themes[0].cover.svg.startsWith('<svg'));
  const objects = await api('GET', `/themes/${themes.body.themes[0].slug}/objects`);
  assert.equal(objects.body.objects.length, 5);
  const pics = await api('GET', `/themes/dong-vat/objects/meo/pictures`);
  assert.equal(pics.body.pictures.length, 5);
  const pic = pics.body.pictures[0];

  // Mở tranh chưa tô → chưa tính lượt.
  const a1 = await api('POST', '/artworks', { pictureId: pic.id, mode: 'free' }, token);
  assert.equal(a1.body.plan.used, 0);
  const s1 = await api('POST', `/artworks/${a1.body.artwork.id}/start`, null, token);
  assert.equal(s1.body.plan.remaining, 0);
  // Gọi lại start cho cùng tranh không tính thêm.
  assert.equal((await api('POST', `/artworks/${a1.body.artwork.id}/start`, null, token)).status, 200);

  const save = await api('PUT', `/artworks/${a1.body.artwork.id}`, {
    data: { fills: FULL_FILLS(pic), strokes: [{ tool: 'brush', color: '#000000', size: 6, points: [[300, 250], [305, 255]] }], stickers: [{ type: 'star', x: 100, y: 100 }], glitter: [pic.regions[0].id] },
    thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    completed: true,
  }, token);
  assert.equal(save.status, 200, JSON.stringify(save.body));
  assert.ok(save.body.events.some((e) => e.type === 'mission_complete'), 'hoàn thành nhiệm vụ "Tô xong 1 tranh"');

  // Tranh thứ 2 trong ngày → hết lượt (402).
  const a2 = await api('POST', '/artworks', { pictureId: pics.body.pictures[1].id, mode: 'template' }, token);
  const s2 = await api('POST', `/artworks/${a2.body.artwork.id}/start`, null, token);
  assert.equal(s2.status, 402);
  assert.equal(s2.body.error.code, 'quota_exceeded');

  // Thanh toán gói Tháng (chế độ giả lập vì chưa cấu hình cổng).
  const pay = await api('POST', '/payments', { plan: 'month', provider: 'momo' }, token);
  assert.equal(pay.body.mock, true);
  assert.equal(pay.body.amount, 49000);
  const done = await api('POST', `/payments/${pay.body.paymentId}/mock-complete`, null, token);
  assert.equal(done.body.plan.plan, 'month');
  assert.equal((await api('POST', `/artworks/${a2.body.artwork.id}/start`, null, token)).status, 200);
  const sub = await api('GET', '/subscription', null, token);
  assert.equal(sub.body.plan.limit, 100);

  const hist = await api('GET', '/artworks?status=completed', null, token);
  assert.equal(hist.body.artworks.length, 1);
  const prog = await api('GET', '/progression', null, token);
  assert.equal(prog.body.level, 1);
  assert.ok(prog.body.ruby >= 20, `ruby=${prog.body.ruby}`);
});

test('Tranh dở quá hạn được cảnh báo rồi tự xoá; tranh hoàn thành giữ lại', async () => {
  const { token, id } = await register('bena02');
  const a = await api('POST', '/artworks', { pictureId: 1, mode: 'free' }, token);
  const old = new Date(Date.now() - 26 * 86400000).toISOString();
  getDb().prepare('UPDATE artworks SET updated_at = ? WHERE id = ?').run(old, a.body.artwork.id);
  assert.equal(runCleanup().warned, 1);
  const n = await api('GET', '/users/me/notifications', null, token);
  assert.ok(n.body.notifications.some((x) => x.type === 'draft_expiring'));
  getDb().prepare('UPDATE artworks SET updated_at = ? WHERE id = ?').run(new Date(Date.now() - 31 * 86400000).toISOString(), a.body.artwork.id);
  runCleanup();
  assert.equal(getDb().prepare('SELECT COUNT(*) AS c FROM artworks WHERE user_id = ?').get(id).c, 0);
});

test('Quên mật khẩu qua SĐT phụ huynh', async () => {
  const { phone } = await register('bena03', 'abc12345');
  const start = await api('POST', '/auth/forgot/start', { contactType: 'phone', contact: phone });
  const v = await api('POST', '/auth/forgot/verify', { resetId: start.body.resetId, code: start.body.devCode });
  assert.deepEqual(v.body.accounts.map((a) => a.username), ['bena03']);
  const r = await api('POST', '/auth/forgot/reset', { resetToken: v.body.resetToken, username: 'bena03', newPassword: 'moi12345' });
  assert.equal(r.status, 200);
  assert.equal((await api('POST', '/auth/login', { username: 'bena03', password: 'moi12345' })).status, 200);
});

test('Shop, Gacha, kết bạn qua mã mời, tặng/đổi thẻ 2 chiều', async () => {
  const a = await register('bena04');
  const b = await register('bena05');
  // Không đủ Ruby / Điểm Gacha.
  assert.equal((await api('POST', '/shop/khung-go/buy', null, a.token)).body.error.code, 'not_enough_ruby');
  assert.equal((await api('POST', '/gacha/pull', { count: 1 }, a.token)).body.error.code, 'not_enough_gacha_points');
  assert.equal((await api('POST', '/shop/avatar-vang/buy', null, a.token)).body.error.code, 'item_not_for_sale');

  getDb().prepare('UPDATE users SET gacha_points = 130, ruby = 150 WHERE id = ?').run(a.id);
  const pull = await api('POST', '/gacha/pull', { count: 2 }, a.token);
  assert.equal(pull.body.results.length, 2);
  assert.equal(pull.body.gachaPoints, 30, 'dư 30 điểm giữ lại');
  assert.equal((await api('POST', '/shop/khung-go/buy', null, a.token)).body.ruby, 50);

  // Kết bạn
  const me = await api('GET', '/social/friends', null, b.token);
  const add = await api('POST', '/social/friends', { code: me.body.myCode }, a.token);
  assert.equal(add.body.status, 'pending');
  const inc = await api('GET', '/social/friends', null, b.token);
  await api('POST', `/social/friends/${inc.body.incoming[0].friendshipId}/accept`, null, b.token);

  const cards = await api('GET', '/gacha/cards', null, a.token);
  const cardId = cards.body.cards[0].id;
  const pictureId = cards.body.cards[0].pictureId;
  // Thẻ = tranh hiếm mở khoá để tô: A tô được, B chưa có thẻ thì không.
  assert.equal((await api('GET', `/pictures/${pictureId}`, null, a.token)).status, 200);
  assert.equal((await api('GET', `/pictures/${pictureId}`, null, b.token)).status, 403);

  const trade = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: cardId }, a.token);
  assert.equal(trade.status, 201);
  // Thẻ đang trong giao dịch chờ thì không đem đi giao dịch khác.
  assert.equal((await api('POST', '/social/trades', { toUserId: b.id, offerCardId: cardId }, a.token)).body.error.code, 'card_in_trade');
  const acc = await api('POST', `/social/trades/${trade.body.trade.id}/accept`, null, b.token);
  assert.equal(acc.body.trade.status, 'accepted');
  assert.equal((await api('GET', `/pictures/${pictureId}`, null, b.token)).status, 200);

  // Giới hạn 3 lượt/ngày
  const other = cards.body.cards[1].id;
  for (let i = 0; i < 2; i++) {
    const t = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: other }, a.token);
    assert.equal(t.status, 201);
    await api('POST', `/social/trades/${t.body.trade.id}/decline`, null, b.token);
  }
  // 1 accepted + 2 declined (declined không tính) → vẫn tạo được
  const t3 = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: other }, a.token);
  assert.equal(t3.status, 201);
});

test('Flipbook: chỉ nhận tranh Sáng tạo đã xong, xuất PDF, chia sẻ', async () => {
  const { token } = await register('bena06');
  getDb().prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) SELECT id, 'year', ?, ? FROM users WHERE username = 'bena06'").run(new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  const ids = [];
  for (const pid of [1, 2]) {
    const a = await api('POST', '/artworks', { pictureId: pid, mode: 'free' }, token);
    await api('PUT', `/artworks/${a.body.artwork.id}`, { data: { fills: { 'nen-troi': '#FFC94D' } }, thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', completed: true }, token);
    ids.push(a.body.artwork.id);
  }
  const tpl = await api('POST', '/artworks', { pictureId: 3, mode: 'template' }, token);
  const bad = await api('POST', '/storybooks', { title: 'Truyện', pages: [{ artworkId: tpl.body.artwork.id }] }, token);
  assert.equal(bad.body.error.code, 'invalid_page_artwork');
  const book = await api('POST', '/storybooks', { title: 'Mèo Ú đi chơi', pages: ids.map((artworkId, i) => ({ artworkId, caption: `Trang ${i + 1}` })) }, token);
  assert.equal(book.body.storybook.pages.length, 2);
  const done = await api('POST', `/storybooks/${book.body.storybook.id}/complete`, null, token);
  assert.equal(done.body.storybook.completed, true);
  const share = await api('POST', `/storybooks/${book.body.storybook.id}/share`, {}, token);
  const pub = await api('GET', `/storybooks/shared/${share.body.shareToken}`);
  assert.equal(pub.body.storybook.title, 'Mèo Ú đi chơi');
  const res = await fetch(`${base}/api/storybooks/${book.body.storybook.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(Buffer.from(await res.arrayBuffer()).subarray(0, 4).toString(), '%PDF');
});

function connect(token) {
  return new Promise((resolve, reject) => {
    const s = ioc(base, { auth: { token }, transports: ['websocket'], forceNew: true, reconnection: false });
    openSockets.push(s);
    s.on('connect', () => resolve(s));
    s.on('connect_error', reject);
  });
}
const emit = (s, ev, p) => new Promise((r) => s.emit(ev, p, r));
const once = (s, ev) => new Promise((r) => s.once(ev, r));

test('Đấu trường: phòng riêng chỉ bạn bè vào, chấm điểm, thưởng Top 3', async () => {
  const host = await register('thisinh1');
  const guest = await register('thisinh2');
  const stranger = await register('thisinh3');
  const code = (await api('GET', '/social/friends', null, host.token)).body.myCode;
  await api('POST', '/social/friends', { code }, guest.token);
  const inc = await api('GET', '/social/friends', null, host.token);
  await api('POST', `/social/friends/${inc.body.incoming[0].friendshipId}/accept`, null, host.token);

  const [sh, sg, ss] = await Promise.all([connect(host.token), connect(guest.token), connect(stranger.token)]);
  const created = await emit(sh, 'arena:create');
  assert.equal((await emit(ss, 'arena:join', { code: created.room.code })).error, 'not_friends');
  assert.ok((await emit(sg, 'arena:join', { code: created.room.code })).room);

  const startP = once(sg, 'arena:start');
  await emit(sh, 'arena:start');
  const start = await startP;
  const pic = start.picture;
  await new Promise((r) => setTimeout(r, 3100)); // đếm ngược 3 giây trước khi bắt đầu
  for (let i = 0; i < 8; i++) sg.emit('arena:action');
  const resH = once(sh, 'arena:results');
  // Chỉ tô vài vùng nhỏ (bỏ nền trời/đất) để độ phủ < 90% — tránh bị gắn cờ "hoàn thành quá nhanh".
  const half = Object.fromEntries(pic.regions.filter((r) => r.area > 0 && r.area < 15000).slice(0, 6).map((r, i) => [r.id, ['#FF5F7E', '#2B9BF4', '#4CD787', '#FFC94D', '#7D5FFF', '#FF9F43'][i]]));
  await emit(sg, 'arena:submit', { data: { fills: half } });
  await emit(sh, 'arena:submit', { data: { fills: { [pic.regions[pic.regions.length - 1].id]: '#000000' } } });
  const results = await resH;
  assert.equal(results.board.length, 2);
  assert.equal(results.board[0].user.id, guest.id);
  assert.equal(results.board[0].reward, 10);
  assert.equal(results.board[1].reward, 8);
  const pg = await api('GET', '/progression', null, guest.token);
  assert.equal(pg.body.rank.points, 10);
  assert.equal(pg.body.gachaPoints, 10);
  const info = await api('GET', '/arena', null, guest.token);
  assert.equal(info.body.leaderboard[0].user.id, guest.id);
  [sh, sg, ss].forEach((s) => s.close());
});

test('Tô cùng nhau: đồng bộ thao tác, tối đa 4 bé, lưu vào lịch sử mọi bé', async () => {
  const users = await Promise.all(['cung1', 'cung2', 'cung3', 'cung4', 'cung5'].map((u) => register(u)));
  const socks = await Promise.all(users.map((u) => connect(u.token)));
  const created = await emit(socks[0], 'collab:create', { pictureId: 1 });
  const code = created.room.code;
  for (let i = 1; i < 4; i++) assert.ok((await emit(socks[i], 'collab:join', { code })).room);
  assert.equal((await emit(socks[4], 'collab:join', { code })).error, 'room_full');
  const got = once(socks[1], 'collab:op');
  socks[0].emit('collab:op', { type: 'fill', regionId: created.picture.regions[0].id, color: '#FF5F7E' });
  const op = await got;
  assert.equal(op.color, '#FF5F7E');
  const saved = await emit(socks[2], 'collab:save', {});
  assert.equal(saved.ok, true);
  const h = await api('GET', '/artworks?mode=collab', null, users[3].token);
  assert.equal(h.body.artworks.length, 1);
  socks.forEach((s) => s.close());
});
