import { asyncMap } from '../src/utils/asyncArray.js';
// Test tích hợp: chạy server thật (DB trong bộ nhớ) và đi qua các luồng chính.
process.env.DB_FILE = ':memory:';
process.env.ARENA_DURATION_SEC = '60';
process.env.ARENA_LOBBY_WAIT_SEC = '1';
process.env.ARENA_MIN_PLAYERS = '2';
process.env.ARENA_SLOTS = '';

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createServer, get as httpGet } from 'node:http';
import { gunzipSync, brotliDecompressSync } from 'node:zlib';
import { io as ioc } from 'socket.io-client';

const { env: testEnv } = await import('../src/config/env.js');
// Test runs must never send real SMS or email, even when credentials are present.
Object.assign(testEnv, {
  phoneOtpEnabled: true, // Exercise optional/legacy phone flows; production defaults to email-only.
  brevo: {},
  twilio: {},
  smtp: {},
  sms: {},
  paypal: { base: 'https://api-m.sandbox.paypal.com' },
  momo: {},
  sepay: {},
  bank: { code: 'ACB', accountNo: '35391537', accountName: 'TEST ACCOUNT' },
});
const { createApp } = await import('../src/app.js');
const { seedAll, seedPicturesIfNeeded } = await import('../../database/seeds/seed.js');
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
async function register(username, password = 'abc12345', nickname = username, language) {
  const { body: cap } = await api('GET', '/auth/captcha');
  // Dùng SĐT khác nhau để không bị chặn chống spam OTP.
  const phone = `09${String(10000000 + ++otpSeq).padStart(8, '0')}`;
  const start = await api('POST', '/auth/register/start', {
    username,
    password,
    captchaId: cap.captchaId,
    captchaText: _peekCaptcha(cap.captchaId),
    contactType: 'phone',
    contact: phone,
    ...(language ? { language } : {}),
  });
  assert.equal(start.status, 200, JSON.stringify(start.body));
  const verify = await api('POST', '/auth/register/verify', { registrationId: start.body.registrationId, code: start.body.devCode });
  assert.equal(verify.status, 201);
  const login = await api('POST', '/auth/login', { username, password });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.needsNickname, true);
  assert.equal(login.body.user.language, language || 'en', 'tài khoản mới mặc định tiếng Anh (hoặc đúng ngôn ngữ đang xem khi đăng ký)');
  await api('PUT', '/users/me', { nickname }, login.body.token);
  return { token: login.body.token, id: login.body.user.id, phone };
}

const FULL_FILLS = (picture, color = null) =>
  Object.fromEntries(picture.regions.map((r, i) => [r.id, color || ['#FF5F7E', '#2B9BF4', '#4CD787', '#FFC94D', '#7D5FFF'][i % 5]]));

test('Đăng ký: sai CAPTCHA bị từ chối, mật khẩu yếu bị từ chối', async () => {
  const { body: cap } = await api('GET', '/auth/captcha');
  assert.match(cap.svg, /^<svg/);
  const bad = await api('POST', '/auth/register/start', {
    username: 'beso1',
    password: 'abc12345',
    captchaId: cap.captchaId,
    captchaText: 'XXXX',
    contactType: 'phone',
    contact: '0912345678',
  });
  assert.equal(bad.body.error.code, 'captcha_wrong');
  const { body: cap2 } = await api('GET', '/auth/captcha');
  const weak = await api('POST', '/auth/register/start', {
    username: 'beso1',
    password: '123',
    captchaId: cap2.captchaId,
    captchaText: _peekCaptcha(cap2.captchaId),
    contactType: 'phone',
    contact: '0912345678',
  });
  assert.equal(weak.body.error.code, 'invalid_input');
});

test('Luồng tô màu + giới hạn gói Free + nâng cấp + nhiệm vụ', async () => {
  const { token } = await register('bena01');
  const themes = await api('GET', '/themes');
  assert.equal(themes.body.themes.length, 25);
  assert.ok(themes.body.themes[0].cover.svg.startsWith('<svg'));
  // Chủ đề theo nhóm tuổi: tranh vẽ tay cho bé 3–5 tuổi đứng đầu, 12 chủ đề kết hợp dành cho bé 6–8 tuổi, nhóm 9+ có 5 chủ đề (Chiến Binh Biến Hình, Công Chúa Phép Thuật, Kiếm Khách Huyền Thoại, Tiên Cá Phép Thuật, Hiệp Sĩ Thẻ Bài).
  assert.deepEqual(
    themes.body.themes.map((t) => t.age).filter((a) => a !== '6-8'),
    ['3-5', '3-5', '3-5', '3-5', '3-5', '3-5', '3-5', '3-5', '3-5', '3-5', '9+', '9+', '9+', '9+', '9+'],
  );
  assert.equal(themes.body.themes.filter((t) => t.age === '6-8').length, 10);
  // Động Vật (3–5 tuổi): 15 tranh cũ đã ẩn, chỉ hiện tranh mới của Chó Con, Thỏ Con, Gà Con, Vịt Con, Heo Con, Bò Sữa, Cá Vàng, Chim Non, Mèo Con và Bướm Xinh.
  const puppy = await api('GET', '/themes/dong-vat-3-4/objects/cho-con/pictures');
  assert.deepEqual(
    puppy.body.pictures.map((p) => p.name.vi),
    ['Chó Con'],
  );
  const flat = await api('GET', '/themes/dong-vat-3-4/pictures');
  assert.deepEqual(
    flat.body.pictures.map((p) => p.name.vi),
    ['Chó Con', 'Mèo Con', 'Thỏ Con', 'Gà Con', 'Vịt Con', 'Heo Con', 'Bò Sữa', 'Cá Vàng', 'Chim Non', 'Bướm Xinh'],
  );
  assert.equal(themes.body.themes.find((t) => t.slug === 'dong-vat-3-4').pictureCount, 10);
  // Hàng 1 của Anh Hùng Siêu Thú: 5 tranh vẽ tay sư tử, hổ, chó, mèo, thỏ; hàng 2: gấu, đại bàng, heo, khỉ, chim cánh cụt.
  const hero = await api('GET', '/themes/anh-hung-sieu-thu/pictures');
  assert.deepEqual(
    hero.body.pictures.slice(0, 5).map((p) => p.slug),
    ['su-tu--ruc-lua', 'ho--tia-chop', 'cho-sieu-thu--sieu-thong-minh', 'meo-sieu-thu--nhay-sieu-cao', 'tho-sieu-thu--sieu-toc'],
  );
  assert.deepEqual(
    hero.body.pictures.slice(5, 10).map((p) => p.slug),
    ['gau-sieu-thu--dai-luc', 'dai-bang--xe-gio', 'heo-sieu-thu--sieu-pham-an', 'khi-sieu-thu--day-leo-than-toc', 'canh-cut-sieu-thu--bang-gia'],
  );
  // Vương Quốc Bánh Kẹo: chỉ hiện 10 tranh vẽ tay, tên theo công thức "bánh/kẹo + chức vụ".
  const sweets = await api('GET', '/themes/vuong-quoc-keo-ngot/pictures');
  assert.equal(sweets.body.pictures.length, 10);
  assert.equal(sweets.body.pictures[0].slug, 'banh-kem--hoang-hau');
  assert.equal(sweets.body.pictures[5].slug, 'banh-quy--linh-gac'); // đầu hàng 2
  assert.deepEqual(
    sweets.body.pictures.slice(6).map((p) => p.name.vi),
    ['Kẹo Dẻo Hiệp Sĩ', 'Macaron Cung Nữ', 'Bánh Gừng Đầu Bếp', 'Socola Tể Tướng'],
  );
  const objects = await api('GET', '/themes/anh-hung-sieu-thu/objects');
  assert.equal(objects.body.objects.length, 10);
  // Chủ đề này chỉ hiện đúng 10 tranh vẽ tay; các tranh tạo tự động bị ẩn.
  assert.equal(hero.body.pictures.length, 10);
  assert.equal(themes.body.themes.find((t) => t.slug === 'anh-hung-sieu-thu').pictureCount, 10);
  const pics = await api('GET', `/themes/anh-hung-sieu-thu/objects/su-tu/pictures`);
  assert.equal(pics.body.pictures.length, 1);
  const pic = pics.body.pictures[0];

  // Mở tranh chưa tô → chưa tính lượt.
  const a1 = await api('POST', '/artworks', { pictureId: pic.id, mode: 'free' }, token);
  assert.equal(a1.body.plan.used, 0);
  const s1 = await api('POST', `/artworks/${a1.body.artwork.id}/start`, null, token);
  assert.equal(s1.body.plan.remaining, 1, 'gói thường: 2 tranh mỗi ngày');
  // Gọi lại start cho cùng tranh không tính thêm.
  assert.equal((await api('POST', `/artworks/${a1.body.artwork.id}/start`, null, token)).status, 200);

  const save = await api(
    'PUT',
    `/artworks/${a1.body.artwork.id}`,
    {
      data: {
        fills: FULL_FILLS(pic),
        strokes: [
          {
            tool: 'brush',
            color: '#000000',
            size: 6,
            points: [
              [300, 250],
              [305, 255],
            ],
          },
        ],
        stickers: [{ type: 'star', x: 100, y: 100 }],
        glitter: [pic.regions[0].id],
      },
      thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      completed: true,
    },
    token,
  );
  assert.equal(save.status, 200, JSON.stringify(save.body));
  assert.ok(
    save.body.events.some((e) => e.type === 'mission_complete'),
    'hoàn thành nhiệm vụ "Tô xong 1 tranh"',
  );
  // Tranh hoàn thành tự dùng khung gỗ mặc định (miễn phí); chọn khung khác phải sở hữu; bỏ khung = null.
  const aid = a1.body.artwork.id;
  assert.equal(save.body.artwork.frame, 'khung-go');
  assert.equal((await api('PUT', `/artworks/${aid}/frame`, { frame: 'khung-sao' }, token)).status, 403);
  assert.equal((await api('PUT', `/artworks/${aid}/frame`, { frame: null }, token)).status, 200);
  assert.equal((await api('GET', `/artworks/${aid}`, null, token)).body.artwork.frame, null);
  assert.equal((await api('PUT', `/artworks/${aid}/frame`, { frame: 'khung-go' }, token)).status, 200);
  assert.equal((await api('GET', `/artworks/${aid}`, null, token)).body.artwork.frame, 'khung-go');

  // Tranh thứ 2 trong ngày vẫn được; tranh thứ 3 → hết lượt (402).
  const a2 = await api('POST', '/artworks', { pictureId: hero.body.pictures[1].id, mode: 'template' }, token);
  assert.equal((await api('POST', `/artworks/${a2.body.artwork.id}/start`, null, token)).status, 200);
  const a3 = await api('POST', '/artworks', { pictureId: hero.body.pictures[2].id, mode: 'template' }, token);
  const s3 = await api('POST', `/artworks/${a3.body.artwork.id}/start`, null, token);
  assert.equal(s3.status, 402);
  assert.equal(s3.body.error.code, 'quota_exceeded');

  // Thanh toán gói Tháng (chế độ giả lập vì chưa cấu hình cổng).
  const pay = await api('POST', '/payments', { plan: 'month', provider: 'bank' }, token);
  assert.equal(pay.body.mock, true);
  assert.equal(pay.body.amount, 19000);
  const done = await api('POST', `/payments/${pay.body.paymentId}/mock-complete`, null, token);
  assert.equal(done.body.plan.plan, 'month');
  assert.equal((await api('POST', `/artworks/${a3.body.artwork.id}/start`, null, token)).status, 200);
  const sub = await api('GET', '/subscription', null, token);
  assert.equal(sub.body.plan.limit, null, 'VIP tô không giới hạn');
  assert.equal(sub.body.plan.vip, true);

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
  await getDb().prepare('UPDATE artworks SET updated_at = ? WHERE id = ?').run(old, a.body.artwork.id);
  assert.equal((await runCleanup()).warned, 1);
  const n = await api('GET', '/users/me/notifications', null, token);
  assert.ok(n.body.notifications.some((x) => x.type === 'draft_expiring'));
  await getDb()
    .prepare('UPDATE artworks SET updated_at = ? WHERE id = ?')
    .run(new Date(Date.now() - 31 * 86400000).toISOString(), a.body.artwork.id);
  await runCleanup();
  assert.equal((await getDb().prepare('SELECT COUNT(*) AS c FROM artworks WHERE user_id = ?').get(id)).c, 0);
});

test('Quên mật khẩu qua SĐT phụ huynh', async () => {
  const { phone } = await register('bena03', 'abc12345');
  const start = await api('POST', '/auth/forgot/start', { contactType: 'phone', contact: phone });
  const v = await api('POST', '/auth/forgot/verify', { resetId: start.body.resetId, code: start.body.devCode });
  assert.deepEqual(
    v.body.accounts.map((a) => a.username),
    ['bena03'],
  );
  const r = await api('POST', '/auth/forgot/reset', { resetToken: v.body.resetToken, username: 'bena03', newPassword: 'moi12345' });
  assert.equal(r.status, 200);
  assert.equal((await api('POST', '/auth/login', { username: 'bena03', password: 'moi12345' })).status, 200);
});

test('Shop, Gacha, kết bạn qua mã mời, tặng/đổi thẻ 2 chiều', async () => {
  const a = await register('bena04');
  const b = await register('bena05');
  // Không đủ Ruby / Điểm Gacha.
  assert.equal((await api('POST', '/shop/khung-hoa/buy', null, a.token)).body.error.code, 'not_enough_ruby');
  // Khung gỗ là khung mặc định miễn phí: ai cũng có sẵn, không mua được.
  const shop0 = await api('GET', '/shop', null, a.token);
  assert.equal(shop0.body.items.find((i) => i.slug === 'khung-go').owned, true);
  assert.equal((await api('POST', '/shop/khung-go/buy', null, a.token)).body.error.code, 'item_already_owned');
  assert.equal((await api('POST', '/gacha/pull', { count: 1 }, a.token)).body.error.code, 'not_enough_gacha_points');
  assert.equal((await api('POST', '/shop/avatar-vang/buy', null, a.token)).body.error.code, 'item_not_for_sale');

  await getDb().prepare('UPDATE users SET gacha_points = 130, ruby = 150 WHERE id = ?').run(a.id);
  const pull = await api('POST', '/gacha/pull', { count: 2 }, a.token);
  assert.equal(pull.body.results.length, 2);
  assert.equal(pull.body.gachaPoints, 30, 'dư 30 điểm giữ lại');
  // Lật đúng thẻ đã chọn trên sân khấu (không ngẫu nhiên); thẻ không có trong game thì từ chối.
  const deck0 = await api('GET', '/gacha/catalog', null, a.token);
  await getDb().prepare('UPDATE users SET gacha_points = 130 WHERE id = ?').run(a.id);
  const fixed = await api('POST', '/gacha/pull', { pictureIds: [deck0.body.cards[1].pictureId] }, a.token);
  assert.equal(fixed.body.results[0].picture.id, deck0.body.cards[1].pictureId);
  assert.equal((await api('POST', '/gacha/pull', { pictureIds: [999999] }, a.token)).body.error.code, 'invalid_card');
  await getDb().prepare('UPDATE users SET gacha_points = 30 WHERE id = ?').run(a.id);
  assert.equal((await api('POST', '/shop/khung-hoa/buy', null, a.token)).body.ruby, 30);

  // Màu họa tiết & bìa truyện: bán trong Shop, bìa chưa mua thì không gắn được vào truyện.
  const shop1 = await api('GET', '/shop', null, a.token);
  assert.ok(shop1.body.items.some((i) => i.type === 'pattern' && i.slug === 'caro' && !i.owned));
  assert.ok(!shop1.body.items.some((i) => i.type === 'brush_skin'), 'skin cọ không còn bán');
  assert.equal(
    (await api('POST', '/storybooks', { title: 'T', pages: [], coverStyle: 'bia-hong-phan' }, a.token)).body.error.code,
    'cover_not_owned',
  );
  assert.equal((await api('POST', '/shop/caro/buy', null, a.token)).body.error.code, 'not_enough_ruby');
  assert.equal((await api('POST', '/shop/bia-hong-phan/buy', null, a.token)).body.ruby, 0);
  const sbOk = await api('POST', '/storybooks', { title: 'T', pages: [], coverStyle: 'bia-hong-phan' }, a.token);
  assert.equal(sbOk.body.storybook.coverStyle, 'bia-hong-phan');
  await getDb().prepare('UPDATE users SET ruby = 30 WHERE id = ?').run(a.id);

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
  // Bộ thẻ trên trang Bóc thẻ: thấy đủ mọi thẻ và xem trước được ảnh (chế độ xem trước), nhưng vẫn không tô được.
  const deck = await api('GET', '/gacha/catalog', null, b.token);
  assert.equal(deck.body.total, deck.body.cards.length);
  assert.ok(deck.body.total >= 1);
  assert.equal(deck.body.owned, 0);
  assert.equal((await api('GET', `/gacha/catalog/${pictureId}/picture`, null, b.token)).status, 200);

  const trade = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: cardId }, a.token);
  assert.equal(trade.status, 201);
  // Thẻ đang trong giao dịch chờ thì không đem đi giao dịch khác.
  assert.equal((await api('POST', '/social/trades', { toUserId: b.id, offerCardId: cardId }, a.token)).body.error.code, 'card_in_trade');
  const acc = await api('POST', `/social/trades/${trade.body.trade.id}/accept`, null, b.token);
  assert.equal(acc.body.trade.status, 'accepted');
  assert.equal((await api('GET', `/pictures/${pictureId}`, null, b.token)).status, 200);

  // Gói thường: 1 lượt/ngày → lượt thứ 2 bị chặn; VIP: 5 lượt/ngày
  const other = cards.body.cards[1].id;
  const blocked = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: other }, a.token);
  assert.equal(blocked.body.error.code, 'trade_daily_limit');
  await getDb()
    .prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) VALUES (?, 'month', ?, ?)")
    .run(a.id, new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  for (let i = 0; i < 2; i++) {
    const t = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: other }, a.token);
    assert.equal(t.status, 201);
    await api('POST', `/social/trades/${t.body.trade.id}/decline`, null, b.token);
  }
  // 1 accepted + 2 declined (declined không tính) → VIP vẫn tạo được
  const t3 = await api('POST', '/social/trades', { toUserId: b.id, offerCardId: other }, a.token);
  assert.equal(t3.status, 201);
  assert.equal((await api('GET', '/social/trades', null, a.token)).body.dailyLimit, 5);
});

test('Flipbook: nhận mọi tranh đã hoàn thành của bé (tô mẫu, sáng tạo), xuất PDF, chia sẻ', async () => {
  const { token } = await register('bena06');
  await getDb()
    .prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) SELECT id, 'year', ?, ? FROM users WHERE username = 'bena06'")
    .run(new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  const ids = [];
  for (const pid of [1, 2]) {
    const a = await api('POST', '/artworks', { pictureId: pid, mode: 'free' }, token);
    await api(
      'PUT',
      `/artworks/${a.body.artwork.id}`,
      {
        data: { fills: { 'nen-troi': '#FFC94D' } },
        thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        completed: true,
      },
      token,
    );
    ids.push(a.body.artwork.id);
  }
  const tpl = await api('POST', '/artworks', { pictureId: 3, mode: 'template' }, token);
  const bad = await api('POST', '/storybooks', { title: 'Truyện', pages: [{ artworkId: tpl.body.artwork.id }] }, token);
  assert.equal(bad.body.error.code, 'invalid_page_artwork', 'tranh chưa hoàn thành thì không đóng được');
  // Tranh tô mẫu đã hoàn thành cũng đóng được.
  await api(
    'PUT',
    `/artworks/${tpl.body.artwork.id}`,
    {
      data: { fills: { 'nen-troi': '#FFC94D' } },
      thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      completed: true,
    },
    token,
  );
  const withTpl = await api('POST', '/storybooks', { title: 'Truyện mẫu', pages: [{ artworkId: tpl.body.artwork.id }] }, token);
  assert.equal(withTpl.status, 201);
  const book = await api(
    'POST',
    '/storybooks',
    { title: 'Mèo Ú đi chơi', pages: ids.map((artworkId, i) => ({ artworkId, caption: `Trang ${i + 1}` })) },
    token,
  );
  assert.equal(book.body.storybook.pages.length, 2);
  const done = await api('POST', `/storybooks/${book.body.storybook.id}/complete`, null, token);
  assert.equal(done.body.storybook.completed, true);
  const share = await api('POST', `/storybooks/${book.body.storybook.id}/share`, {}, token);
  const pub = await api('GET', `/storybooks/shared/${share.body.shareToken}`);
  assert.equal(pub.body.storybook.title, 'Mèo Ú đi chơi');
  const res = await fetch(`${base}/api/storybooks/${book.body.storybook.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(res.headers.get('content-type'), 'application/pdf');
  assert.equal(
    Buffer.from(await res.arrayBuffer())
      .subarray(0, 4)
      .toString(),
    '%PDF',
  );
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
  const half = Object.fromEntries(
    pic.regions
      .filter((r) => r.area > 0 && r.area < 15000)
      .slice(0, 6)
      .map((r, i) => [r.id, ['#FF5F7E', '#2B9BF4', '#4CD787', '#FFC94D', '#7D5FFF', '#FF9F43'][i]]),
  );
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
  const users = await Promise.all(await asyncMap(['cung1', 'cung2', 'cung3', 'cung4', 'cung5'], async (u) => await register(u)));
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

test('Tô cùng nhau: tạo phòng xong rời rồi vào lại ngay vẫn còn phòng (không báo "không tìm thấy phòng")', async () => {
  const { token } = await register('cungleave');
  const s = await connect(token);
  const created = await emit(s, 'collab:create', { pictureId: 1 });
  const code = created.room.code;
  assert.equal((await emit(s, 'collab:join', { code })).room.code, code);
  await emit(s, 'collab:leave', {}); // chuyển trang: rời phòng…
  const again = await emit(s, 'collab:join', { code }); // …rồi vào lại ngay
  assert.equal(again.room?.code, code);
  assert.equal(again.error, undefined);
  s.close();
});

test('Tô cùng nhau: mời bạn bè vào phòng (chỉ bạn đã kết bạn), từ chối + chặn 5 phút', async () => {
  const [a, b, c] = await Promise.all(await asyncMap(['moia', 'moib', 'moic'], async (u) => await register(u)));
  const code = (await api('GET', '/social/friends', null, b.token)).body.myCode;
  await api('POST', '/social/friends', { code }, a.token);
  const inc = await api('GET', '/social/friends', null, b.token);
  await api('POST', `/social/friends/${inc.body.incoming[0].friendshipId}/accept`, null, b.token);
  const [sa, sb, sc] = await Promise.all([a, b, c].map((u) => connect(u.token)));
  assert.equal((await emit(sa, 'collab:invite', { toUserId: b.id })).error, 'room_not_found', 'chưa có phòng thì chưa mời được');
  const room = (await emit(sa, 'collab:create', { pictureId: 1 })).room;
  assert.equal((await emit(sa, 'collab:invite', { toUserId: c.id })).error, 'not_friends', 'chỉ mời được bạn đã kết bạn');
  assert.ok((await emit(sc, 'collab:join', { code: room.code })).room, 'chưa kết bạn vẫn vào được bằng mã nếu phòng chưa đầy');
  const got = once(sb, 'collab:invite');
  assert.equal((await emit(sa, 'collab:invite', { toUserId: b.id })).ok, true);
  const inv = await got;
  assert.equal(inv.code, room.code);
  assert.equal(inv.from.id, a.id);
  assert.equal((await emit(sa, 'collab:invite', { toUserId: b.id })).error, 'invite_too_fast', 'mời dồn dập bị chặn');
  const declined = once(sa, 'collab:invite-declined');
  await emit(sb, 'collab:invite-decline', { fromUserId: a.id, block: true });
  assert.equal((await declined).blocked, true);
  await new Promise((r) => setTimeout(r, 3100));
  assert.equal((await emit(sa, 'collab:invite', { toUserId: b.id })).error, 'invite_blocked', 'bị chặn 5 phút');
  [sa, sb, sc].forEach((s) => s.close());
});

test('Chữ ký: mẫu Free/wow theo gói, lọc chữ xấu, ký lên tranh, hết gói vẫn giữ chữ ký cũ', async () => {
  const { token } = await register('bena09');
  const s0 = await api('GET', '/users/me/signature', null, token);
  assert.equal(s0.body.signature, null);
  assert.equal(s0.body.premium, false);
  assert.equal(s0.body.styles.free.length, 5);
  assert.equal(s0.body.styles.premium.length, 5);

  // Tên thật hay biệt danh đều được; chữ xấu / số điện thoại / mẫu wow khi chưa có gói bị chặn.
  assert.equal((await api('PUT', '/users/me/signature', { name: 'Nguyễn Bé Na', style: 'classic' }, token)).status, 200);
  assert.equal((await api('PUT', '/users/me/signature', { name: 'đ.ị.t', style: 'classic' }, token)).body.error.code, 'signature_bad_word');
  assert.equal(
    (await api('PUT', '/users/me/signature', { name: 'Na 0912345678', style: 'classic' }, token)).body.error.code,
    'signature_private_info',
  );
  assert.equal((await api('PUT', '/users/me/signature', { name: 'Na', style: 'gold' }, token)).body.error.code, 'signature_premium_required');
  // Tự ký bằng tay: chỉ VIP.
  const hand = [
    [
      [10, 10],
      [40, 30],
      [80, 12],
    ],
    [
      [90, 40],
      [140, 20],
    ],
  ];
  assert.equal((await api('PUT', '/users/me/signature', { style: 'hand', hand }, token)).body.error.code, 'signature_premium_required');

  const a = await api('POST', '/artworks', { pictureId: 1, mode: 'free' }, token);
  const id = a.body.artwork.id;
  await api('POST', `/artworks/${id}/start`, null, token);
  // Ký lên tranh: vị trí bị kẹp trong tranh, cỡ tối đa 1/4 bề ngang.
  const put = async (signature) => await api('PUT', `/artworks/${id}`, { data: { fills: {}, strokes: [], stickers: [], signature } }, token);
  assert.equal((await put({ style: 'classic', name: 'Nguyễn Bé Na', x: 9999, y: -50, scale: 3, rot: 90, color: '#ff5f7e' })).status, 200);
  let sig = (await api('GET', `/artworks/${id}`, null, token)).body.artwork.data.signature;
  assert.deepEqual([sig.scale, sig.rot, sig.color], [1, 20, '#FF5F7E']);
  assert.ok(sig.x <= 600 - 70 && sig.y >= 25);
  // Không ký được bằng chữ ký không phải của mình.
  assert.equal((await put({ style: 'classic', name: 'Bạn khác', x: 300, y: 300 })).body.error.code, 'signature_not_default');

  // Có gói → dùng mẫu wow → ký lên tranh; hết gói → chữ ký mặc định về mẫu Free, tranh đã ký giữ nguyên.
  const uid = (await getDb().prepare("SELECT id FROM users WHERE username = 'bena09'").get()).id;
  await getDb()
    .prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) VALUES (?, 'month', ?, ?)")
    .run(uid, new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  assert.equal((await api('PUT', '/users/me/signature', { style: 'hand', hand }, token)).body.signature.style, 'hand', 'VIP được tự ký bằng tay');
  assert.equal((await api('PUT', '/users/me/signature', { name: 'Bé Na', style: 'gold' }, token)).body.signature.style, 'gold');
  assert.equal((await put({ style: 'gold', name: 'Bé Na', x: 480, y: 560, scale: 0.8, rot: -5, color: '#1B2A38' })).status, 200);
  await getDb()
    .prepare('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?')
    .run(new Date(Date.now() - 500).toISOString(), uid);
  const after = await api('GET', '/users/me/signature', null, token);
  assert.deepEqual([after.body.premium, after.body.signature.style, after.body.signature.name], [false, 'classic', 'Bé Na']);
  assert.equal((await put({ style: 'gold', name: 'Bé Na', x: 100, y: 560, scale: 0.8, rot: 0 })).status, 200);
  sig = (await api('GET', `/artworks/${id}`, null, token)).body.artwork.data.signature;
  assert.deepEqual([sig.style, sig.x], ['gold', 100]);
  // Gỡ chữ ký.
  await put(null);
  assert.equal((await api('GET', `/artworks/${id}`, null, token)).body.artwork.data.signature, undefined);
});

test('Triển lãm: lịch vòng, gửi tranh, tự duyệt/duyệt tay, cảm xúc, khoá lúc 20:00 CN, danh hiệu, chuyển vòng', async () => {
  const Ex = await import('../src/services/exhibition.js');
  const at = (iso) => Ex.setClockForTest(iso);
  const db = getDb();
  const vn = (s) => new Date(Date.parse(s) - 7 * 3600e3).toISOString(); // giờ VN → UTC

  const mk = async (username) => {
    const u = await register(username);
    await api('PUT', '/users/me/signature', { name: username, style: 'classic' }, u.token);
    return u;
  };
  const A = await mk('trienlam1');
  const B = await mk('trienlam2');
  const pic = (await api('GET', '/pictures/1', null, A.token)).body.picture;
  const sig = { style: 'classic', x: 500, y: 560, scale: 0.8, rot: 0 };
  // Vẽ 1 tranh đã hoàn thành; lùi giờ bắt đầu để không bị coi là "tô vội" (điều 8).
  async function artwork(u, { signed = true, brush = 0 } = {}) {
    const a = (await api('POST', '/artworks', { pictureId: 1, mode: 'free' }, u.token)).body.artwork;
    await api('POST', `/artworks/${a.id}/start`, null, u.token);
    const r = pic.regions.find((x) => x.area > 2000);
    const strokes = Array.from({ length: brush }, () => ({
      tool: 'brush',
      color: '#FF0000',
      size: 4,
      points: [
        [r.label[0], r.label[1]],
        [r.label[0] + 1, r.label[1]],
      ],
    }));
    const data = {
      fills: FULL_FILLS(pic),
      strokes,
      stickers: [],
      ...(signed ? { signature: { ...sig, name: u === A ? 'trienlam1' : 'trienlam2' } } : {}),
    };
    const s = await api('PUT', `/artworks/${a.id}`, { data, completed: true }, u.token);
    assert.equal(s.status, 200, JSON.stringify(s.body));
    // Lùi mốc bắt đầu tô 2 ngày: vừa không bị "tô vội", vừa trả lại lượt tô Free hôm nay cho bài test.
    await db.prepare('UPDATE usage_log SET used_at = ? WHERE artwork_id = ?').run(new Date(Date.now() - 2 * 86400000).toISOString(), a.id);
    return a.id;
  }

  // Thứ 6: cổng gửi tranh chưa mở.
  at(vn('2026-10-02T10:00:00Z'));
  const a1 = await artwork(A);
  assert.equal((await api('POST', '/exhibition/entries', { artworkId: a1 }, A.token)).body.error.code, 'exhibit_closed');

  // Thứ 7: mở cổng cho vòng 2026-10-05.
  at(vn('2026-10-03T10:00:00Z'));
  const st = await api('GET', '/exhibition/mine', null, A.token);
  assert.deepEqual([st.body.schedule.submitOpen, st.body.schedule.nextRound, st.body.limit], [true, '2026-10-05', 1]);
  // VIP (Tháng hoặc Năm) gửi 5 tranh/vòng.
  const uidB = (await db.prepare('SELECT id FROM users WHERE username = ?').get('trienlam2')).id;
  for (const [plan, n] of [
    ['month', 5],
    ['year', 5],
  ]) {
    await db
      .prepare('INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) VALUES (?, ?, ?, ?)')
      .run(uidB, plan, '2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z');
    assert.equal((await api('GET', '/exhibition/mine', null, B.token)).body.limit, n);
    await db.prepare('DELETE FROM subscriptions WHERE user_id = ?').run(uidB);
  }
  const noSig = await artwork(A, { signed: false });
  const bad = await api('POST', '/exhibition/entries', { artworkId: noSig }, A.token);
  assert.equal(bad.body.error.code, 'exhibit_rules');
  assert.ok(bad.body.error.failures.includes(1));
  // Chú thích "đủ điều kiện triển lãm": tranh đã ký + tô đủ + chế độ Sáng tạo thì true; thiếu chữ ký thì false.
  const eligList = (await api('GET', '/artworks?status=completed&eligibility=1', null, A.token)).body.artworks;
  assert.equal(eligList.find((x) => x.id === a1).exhibitEligible, true);
  assert.equal(eligList.find((x) => x.id === noSig).exhibitEligible, false);
  // Tranh không có nét cọ → tự duyệt; Free chỉ gửi 1 tranh/vòng.
  const e1 = await api('POST', '/exhibition/entries', { artworkId: a1 }, A.token);
  assert.equal(e1.status, 201, JSON.stringify(e1.body));
  assert.deepEqual([e1.body.entry.status, e1.body.entry.board], ['approved', 'free']);
  const a1b = await artwork(A);
  assert.equal((await api('POST', '/exhibition/entries', { artworkId: a1b }, A.token)).body.error.code, 'exhibit_limit');
  // Mỗi tranh chỉ 1 lần; tranh đã gửi không sửa được.
  assert.ok((await api('POST', '/exhibition/entries', { artworkId: a1 }, A.token)).body.error.failures.includes(4));
  assert.equal((await api('PUT', `/artworks/${a1}`, { data: { fills: {} } }, A.token)).body.error.code, 'artwork_exhibited');

  // Tranh nhiều nét cọ → chờ admin; admin loại theo điều 6 → bé nhận thông báo, lượt được trả lại.
  const b1 = await artwork(B, { brush: 6 });
  const e2 = await api('POST', '/exhibition/entries', { artworkId: b1 }, B.token);
  assert.equal(e2.body.entry.status, 'pending');
  await db.prepare("UPDATE users SET role = 'admin' WHERE username = 'trienlam1'").run();
  const q = await api('GET', '/exhibition/review', null, A.token);
  assert.ok(q.body.entries.some((x) => x.id === e2.body.entry.id && x.data.fills));
  assert.equal((await api('GET', '/exhibition/review', null, B.token)).status, 403);
  assert.equal((await api('POST', `/exhibition/review/${e2.body.entry.id}/reject`, { rule: 6 }, A.token)).body.status, 'rejected');
  const notes = (await api('GET', '/users/me/notifications', null, B.token)).body.notifications;
  assert.ok(notes.some((n) => n.type === 'exhibit_rejected' && n.data.rule === 6));
  // Đã vi phạm điều 6 → không được tự duyệt; tranh chưa duyệt kịp sẽ chuyển vòng.
  const b2 = await artwork(B, { brush: 6 });
  const e3 = await api('POST', '/exhibition/entries', { artworkId: b2 }, B.token);
  assert.equal(e3.body.entry.status, 'pending');

  // Thứ 2: vòng 2026-10-05 mở. B thả cảm xúc cho A; A không tự thả; không rút được nữa.
  at(vn('2026-10-05T09:00:00Z'));
  const room = await api('GET', '/exhibition/wall?offset=0&limit=10', null, B.token);
  const entry = room.body.entries.find((x) => x.id === e1.body.entry.id);
  assert.ok(entry && room.body.pictures[entry.pictureId].svg);
  assert.equal((await api('GET', '/exhibition/rooms/free', null, B.token)).status, 404, 'không còn route phòng riêng');
  assert.equal((await api('PUT', `/exhibition/entries/${entry.id}/reaction`, { emoji: 'love' }, B.token)).body.counts.love, 1);
  const r2 = await api('PUT', `/exhibition/entries/${entry.id}/reaction`, { emoji: 'star' }, B.token);
  assert.deepEqual([r2.body.counts.love, r2.body.counts.star, r2.body.mine], [0, 1, 'star']);
  // Tường tranh ở sảnh: tranh vòng hiện tại có mặt, kèm cảm xúc của chính người xem; phân trang theo offset.
  const wallRes = await api('GET', '/exhibition/wall?offset=0&limit=5', null, B.token);
  const onWall = wallRes.body.entries.find((x) => x.id === entry.id);
  assert.ok(onWall && onWall.mine === 'star' && onWall.final === false && wallRes.body.total >= 1);
  assert.deepEqual((await api('GET', `/exhibition/wall?offset=${wallRes.body.total}&limit=5`, null, B.token)).body.entries, []);
  assert.equal((await api('PUT', `/exhibition/entries/${entry.id}/reaction`, { emoji: 'heart' }, A.token)).body.error.code, 'exhibit_own');
  assert.equal((await api('DELETE', `/exhibition/entries/${entry.id}`, null, A.token)).body.error.code, 'exhibit_cannot_withdraw');
  assert.equal((await db.prepare('SELECT round_key FROM exhibition_entries WHERE id = ?').get(e3.body.entry.id)).round_key, '2026-10-12');
  assert.equal((await api('POST', `/exhibition/entries/${entry.id}/report`, null, B.token)).body.ok, true);

  // Chủ nhật 20:30: khoá cảm xúc, xét danh hiệu (đồng hạng thì cùng nhận).
  at(vn('2026-10-11T20:30:00Z'));
  assert.equal((await api('PUT', `/exhibition/entries/${entry.id}/reaction`, { emoji: 'clap' }, B.token)).body.error.code, 'exhibit_locked');
  const hall = await api('GET', '/exhibition', null, A.token);
  assert.equal(hall.body.lastRound, '2026-10-05');
  assert.ok(hall.body.winners.some((w) => w.id === entry.id && w.award && w.total === 1));
  const notesA = (await api('GET', '/users/me/notifications', null, A.token)).body.notifications;
  assert.ok(notesA.some((n) => n.type === 'exhibit_award' && n.data.board === 'free'));
  const mine = (await api('GET', '/exhibition/mine', null, A.token)).body.entries;
  assert.deepEqual(mine[a1].reactions.star, 1);

  // Đợt 3: tủ kính thành tích (chính chủ + bạn bè) và giấy khen PDF cho tranh đạt danh hiệu.
  const sc = await api('GET', `/exhibition/showcase/${A.id}`, null, A.token);
  assert.ok(sc.body.entries.some((x) => x.id === entry.id && x.award));
  assert.equal((await api('GET', `/exhibition/showcase/${A.id}`, null, B.token)).body.error.code, 'not_friends');
  const cert = await api('POST', `/exhibition/entries/${entry.id}/certificate`, { lang: 'vi' }, A.token);
  assert.equal(cert.status, 200);
  assert.match(cert.headers.get('content-type'), /application\/pdf/);
  assert.equal((await api('POST', `/exhibition/entries/${entry.id}/certificate`, {}, B.token)).status, 404);
  at(null);
});

test('Triển lãm: lịch cổng gửi tranh theo giờ VN', async () => {
  const { schedule } = await import('../src/services/exhibition.js');
  const s1 = schedule(new Date('2026-10-02T16:59:00Z')); // Thứ 6 23:59 VN
  assert.deepEqual([s1.current, s1.submitOpen, s1.submitOpensAt], ['2026-09-28', false, '2026-10-02T17:00:00.000Z']);
  const s2 = schedule(new Date('2026-10-04T12:59:00Z')); // CN 19:59 VN
  assert.deepEqual([s2.submitOpen, s2.reactionsOpen, s2.nextRound], [true, true, '2026-10-05']);
  const s3 = schedule(new Date('2026-10-04T13:00:00Z')); // CN 20:00 VN
  assert.deepEqual([s3.submitOpen, s3.reactionsOpen, s3.submitOpensAt], [false, false, '2026-10-09T17:00:00.000Z']);
});

test('Rank Cao Thủ: đủ 800 điểm thì thăng bậc, nhận khung Cao Thủ + 300 Ruby', async () => {
  const { awardArena } = await import('../src/services/progression.js');
  const { token, id } = await register('caothu1');
  await getDb().prepare('UPDATE users SET rank_points = 790 WHERE id = ?').run(id);
  const events = await awardArena(id, 10);
  const up = events.find((e) => e.type === 'rank_up');
  assert.deepEqual([up?.rank, up?.frame, up?.ruby], ['master', 'avatar-cao-thu', 300]);
  const p = await api('GET', '/progression', null, token);
  assert.equal(p.body.rank.key, 'master');
  assert.equal(p.body.rank.next, null);
  assert.ok(
    await getDb().prepare("SELECT 1 FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ? AND i.slug = 'avatar-cao-thu'").get(id),
  );
});

test('Chủ đề đã ẩn: không hiện ở danh sách, không vào Bóc thẻ, tranh cũ vẫn mở được', async () => {
  const Picture = await import('../src/models/picture.js');
  const t = await getDb().prepare("SELECT id FROM themes WHERE slug = 'anh-hung-sieu-thu'").get();
  const card = await getDb()
    .prepare('SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id WHERE o.theme_id = ? AND p.is_card = 1 LIMIT 1')
    .get(t.id);
  await getDb().prepare('UPDATE themes SET active = 0 WHERE id = ?').run(t.id);
  try {
    const list = await api('GET', '/themes');
    assert.ok(!list.body.themes.some((x) => x.slug === 'anh-hung-sieu-thu'));
    assert.equal((await api('GET', '/themes/anh-hung-sieu-thu/objects')).status, 404);
    const pool = await Picture.cardPool();
    assert.ok(!Object.values(pool).flat().includes(card.id));
    assert.ok(await Picture.findPicture(card.id));
  } finally {
    await getDb().prepare('UPDATE themes SET active = 1 WHERE id = ?').run(t.id);
  }
});

test('Thanh toán chuyển khoản QR: tạo mã, SePay báo tiền về thì mở gói (chống trùng, sai khoá, thiếu tiền)', async () => {
  const { env } = await import('../src/config/env.js');
  const u = await register('chuyenkhoan1');
  env.sepay.apiKey = 'test-sepay-key';
  const p = await api('POST', '/payments', { plan: 'month', provider: 'bank' }, u.token);
  assert.equal(p.status, 201, JSON.stringify(p.body));
  assert.equal(p.body.currency, 'VND');
  assert.equal(p.body.bankTransfer.accountNo, '35391537');
  assert.equal(p.body.bankTransfer.bank, 'ACB');
  assert.match(p.body.bankTransfer.content, /^BTM[A-Z2-9]{6}$/);
  // Mã VietQR chuẩn NAPAS: ACB (970416), số TK, 19.000đ, nội dung = mã BTM…; CRC hợp lệ.
  const qr = p.body.bankTransfer.qrData;
  assert.ok(qr.startsWith('000201010212'));
  assert.ok(qr.includes('0006970416010835391537'));
  assert.ok(qr.includes('540519000') && qr.includes(p.body.bankTransfer.content));

  const hook = (body, key) =>
    fetch(`${base}/api/payments/sepay/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Apikey ${key}` } : {}) },
      body: JSON.stringify({ accountNumber: env.bank.accountNo, ...body }),
    });
  env.sepay.apiKey = 'test-sepay-key';
  try {
    const content = `MBVCB.123 ${p.body.bankTransfer.content.toLowerCase()} chuyen tien`;
    assert.equal((await hook({ id: 1, transferType: 'in', transferAmount: 19000, content }, 'sai-khoa')).status, 401);
    // Chuyển thiếu tiền → chưa mở gói.
    await hook({ id: 2, transferType: 'in', transferAmount: 10000, content }, 'test-sepay-key');
    assert.equal((await api('GET', `/payments/${p.body.paymentId}`, null, u.token)).body.payment.status, 'pending');
    await hook({ id: 2, transferType: 'in', transferAmount: 'invalid', content }, 'test-sepay-key');
    await hook({ id: 2, transferType: 'in', transferAmount: 19000, content, accountNumber: 'wrong' }, 'test-sepay-key');
    await hook({ transferType: 'in', transferAmount: 19000, content }, 'test-sepay-key');
    assert.equal((await api('GET', `/payments/${p.body.paymentId}`, null, u.token)).body.payment.status, 'pending');
    // Đủ tiền → mở gói; gửi lại cùng giao dịch không gia hạn thêm.
    assert.equal((await hook({ id: 3, transferType: 'in', transferAmount: 19000, content }, 'test-sepay-key')).status, 200);
    const st = await api('GET', `/payments/${p.body.paymentId}`, null, u.token);
    assert.equal(st.body.payment.status, 'paid');
    assert.equal(st.body.plan.plan, 'month');
    const ends = st.body.plan.endsAt;
    await hook({ id: 3, transferType: 'in', transferAmount: 19000, content }, 'test-sepay-key');
    assert.equal((await api('GET', '/subscription', null, u.token)).body.plan.endsAt, ends);
  } finally {
    env.sepay.apiKey = '';
  }
});

test('PayPal tự gia hạn: đồng ý → kích hoạt, mỗi kỳ trừ tiền → gia hạn, huỷ tự gia hạn', async () => {
  const { env } = await import('../src/config/env.js');
  const pay = await import('../src/services/payments/index.js');
  const u = await register('paypalauto1');
  const realFetch = globalThis.fetch;
  const fake = { status: 'APPROVAL_PENDING', cycles: 0, cancelled: false, created: null };
  env.paypal.clientId = 'cid';
  env.paypal.secret = 'sec';
  env.paypal.webhookId = 'WH-TEST';
  globalThis.fetch = async (url, init = {}) => {
    const u2 = String(url);
    if (!u2.startsWith(env.paypal.base)) return realFetch(url, init);
    const path = u2.slice(env.paypal.base.length);
    const ok = (body, status = 200) => new Response(body === null ? null : JSON.stringify(body), { status });
    if (path === '/v1/oauth2/token') return ok({ access_token: 't' });
    if (path === '/v1/catalogs/products') return ok({ id: 'PROD-1' }, 201);
    if (path === '/v1/billing/plans') return ok({ id: `P-${JSON.parse(init.body).billing_cycles[0].frequency.interval_unit}` }, 201);
    if (path === '/v1/billing/subscriptions' && init.method === 'POST') {
      fake.created = JSON.parse(init.body);
      return ok({ id: 'I-TEST1', links: [{ rel: 'approve', href: 'https://paypal.test/approve' }] }, 201);
    }
    if (path === '/v1/billing/subscriptions/I-TEST1') {
      return ok({
        id: 'I-TEST1',
        status: fake.status,
        custom_id: fake.customId || fake.created.custom_id,
        plan_id: fake.created.plan_id,
        billing_info: { cycle_executions: [{ tenure_type: 'REGULAR', cycles_completed: fake.cycles }] },
      });
    }
    if (path.startsWith('/v1/billing/subscriptions/I-TEST1/transactions?')) {
      return ok({
        transactions: Array.from({ length: fake.cycles }, (_, k) => ({
          id: `SALE-${k + 1}`,
          status: 'COMPLETED',
          time: new Date(Date.now() + k).toISOString(),
          amount_with_breakdown: { gross_amount: { currency_code: fake.currency || 'USD', value: '0.79' } },
        })),
      });
    }
    if (path === '/v1/notifications/verify-webhook-signature') {
      assert.equal(JSON.parse(init.body).webhook_id, 'WH-TEST');
      if (fake.verifyDown) return ok({ message: 'temporary provider outage' }, 503);
      return ok({ verification_status: fake.badSignature ? 'FAILURE' : 'SUCCESS' });
    }
    if (path === '/v1/billing/subscriptions/I-TEST1/cancel') {
      fake.cancelled = true;
      return ok(null, 204);
    }
    return ok({ message: 'not found' }, 404);
  };
  try {
    const p = await api('POST', '/payments', { plan: 'month', provider: 'paypal' }, u.token);
    assert.equal(p.status, 201, JSON.stringify(p.body));
    assert.equal(p.body.payUrl, 'https://paypal.test/approve');
    assert.equal([p.body.amount, p.body.currency].join(' '), '0.79 USD');
    assert.equal(fake.created.plan_id, 'P-MONTH');
    // Chưa đồng ý → vẫn chờ.
    assert.equal((await api('POST', `/payments/${p.body.paymentId}/paypal/confirm`, null, u.token)).body.payment.status, 'pending');
    // ACTIVE without a completed charge must not grant VIP.
    fake.status = 'ACTIVE';
    assert.equal((await api('POST', `/payments/${p.body.paymentId}/paypal/confirm`, null, u.token)).body.payment.status, 'pending');
    assert.equal((await api('GET', '/subscription', null, u.token)).body.plan.plan, 'free');
    fake.cycles = 1;
    fake.customId = 'another-checkout';
    assert.equal((await api('POST', `/payments/${p.body.paymentId}/paypal/confirm`, null, u.token)).status, 400);
    fake.customId = null;
    fake.currency = 'EUR';
    assert.equal((await api('POST', `/payments/${p.body.paymentId}/paypal/confirm`, null, u.token)).status, 400);
    fake.currency = null;
    // Đồng ý xong (kỳ 1 đã trừ tiền) → kích hoạt Gói Tháng, tự gia hạn.
    Object.assign(fake, { status: 'ACTIVE', cycles: 1 });
    const c = await api('POST', `/payments/${p.body.paymentId}/paypal/confirm`, null, u.token);
    assert.equal(c.body.payment.status, 'paid');
    assert.equal(c.body.plan.plan, 'month');
    const sub = await api('GET', '/subscription', null, u.token);
    assert.deepEqual(sub.body.billing, { provider: 'paypal', plan: 'month', autoRenew: true });
    const ends1 = Date.parse(sub.body.plan.endsAt);
    // Đang có thuê bao tự gia hạn → không tạo thuê bao thứ 2.
    assert.equal((await api('POST', '/payments', { plan: 'year', provider: 'paypal' }, u.token)).body.error.code, 'already_subscribed');
    // Webhook báo trừ tiền kỳ 2 (gửi 2 lần) → gia hạn đúng 1 lần.
    fake.cycles = 2;
    const wh = { id: 'WH-EVENT-2', event_type: 'PAYMENT.SALE.COMPLETED', resource: { id: 'SALE-2', billing_agreement_id: 'I-TEST1' } };
    const headers = {
      'Content-Type': 'application/json',
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-cert-url': 'https://api.paypal.com/cert',
      'paypal-transmission-id': 'T-1',
      'paypal-transmission-sig': 'test-signature',
      'paypal-transmission-time': new Date().toISOString(),
    };
    const webhook = (h = headers) => realFetch(`${base}/api/payments/paypal/webhook`, { method: 'POST', headers: h, body: JSON.stringify(wh) });
    assert.equal((await webhook({ 'Content-Type': 'application/json' })).status, 403);
    fake.badSignature = true;
    assert.equal((await webhook()).status, 403);
    fake.badSignature = false;
    fake.verifyDown = true;
    assert.equal((await webhook()).status, 500, 'temporary failures must allow webhook retries');
    fake.verifyDown = false;
    assert.equal((await getDb().prepare('SELECT count(*) AS n FROM subscriptions WHERE user_id = ?').get(u.id)).n, 1);
    for (let i = 0; i < 2; i++) {
      const r = await webhook();
      assert.equal(r.status, 200);
    }
    const periods = await getDb().prepare('SELECT ends_at FROM subscriptions WHERE user_id = ? ORDER BY ends_at').all(u.id);
    assert.equal(periods.length, 2, 'kỳ 2 nối tiếp kỳ 1');
    assert.equal(Date.parse(periods[0].ends_at), ends1);
    const ends2 = Date.parse(periods[1].ends_at);
    assert.equal(Math.round((ends2 - ends1) / 86400000), 30);
    // Huỷ tự gia hạn: gọi PayPal huỷ, gói vẫn còn hạn.
    const cancel = await api('POST', '/payments/recurring/cancel', null, u.token);
    assert.equal(cancel.status, 200, JSON.stringify(cancel.body));
    assert.equal(fake.cancelled, true);
    assert.equal(cancel.body.billing, null);
    assert.equal(cancel.body.plan.plan, 'month');
    // Gần hết hạn và không còn tự gia hạn → được nhắc 1 lần.
    const near = new Date(ends2 - 2 * 86400000);
    assert.ok((await pay.runBillingJobs(near)).reminded >= 1);
    assert.equal((await pay.runBillingJobs(near)).reminded, 0);
    const notes = await api('GET', '/users/me/notifications', null, u.token);
    assert.ok(notes.body.notifications.some((n) => n.type === 'plan_expiring'));
  } finally {
    globalThis.fetch = realFetch;
    env.paypal.clientId = '';
    env.paypal.secret = '';
    env.paypal.webhookId = '';
  }
});

test('Startup removes retired normal pictures and hidden cards without changing visible IDs, cards or saved art', async () => {
  const db = getDb();
  const { readFileSync } = await import('node:fs');
  const retired = JSON.parse(readFileSync(new URL('../../assets-library/retired-pictures.json', import.meta.url), 'utf8'));
  const before = (await db.prepare('SELECT id,slug FROM pictures ORDER BY id').all()).map((p) => [p.id,p.slug]);
  const user = await register('cleanupcheck1');
  const saved = await api('POST','/artworks',{pictureId:1,mode:'free'},user.token);
  const insertOldPicture = async (objectId, slug, hidden, card = false) => {
    await db.prepare(`INSERT INTO pictures (object_id,slug,variant_slug,name_vi,name_en,variant_name_vi,variant_name_en,svg,manifest,animation,is_card,rarity,hidden)
      SELECT ?,?,variant_slug,name_vi,name_en,variant_name_vi,variant_name_en,svg,manifest,animation,?,?,? FROM pictures WHERE id = 1`)
      .run(objectId,slug,card ? 1 : 0,card ? 'S' : null,hidden);
    return (await db.prepare('SELECT id FROM pictures WHERE slug = ?').get(slug)).id;
  };
  let removedArt;
  for (const [index, slug] of retired.themes.entries()) {
    // Old installations may even have re-enabled a theme since it was retired.
    const theme = await db.prepare('INSERT INTO themes (slug,name_vi,name_en,active) VALUES (?,?,?,1) RETURNING id').get(slug,slug,slug);
    const object = await db.prepare('INSERT INTO objects (theme_id,slug,name_vi,name_en) VALUES (?,?,?,?) RETURNING id').get(theme.id,'old','old','old');
    const picture = await insertOldPicture(object.id,retired.pictures[index],0);
    removedArt = await db.prepare("INSERT INTO artworks (user_id,picture_id,mode) VALUES (?,?,'free') RETURNING id").get(user.id,picture);
  }
  const object = await db.prepare('SELECT object_id FROM pictures WHERE id = 1').get();
  const hiddenCard = await insertOldPicture(object.object_id,'old-hidden-card-for-cleanup',1,true);
  const ownedHidden = await db.prepare("INSERT INTO user_cards (user_id,picture_id,source) VALUES (?,?,'gacha') RETURNING id").get(user.id,hiddenCard);
  const liveCard = await db.prepare('SELECT id FROM pictures WHERE is_card = 1 AND hidden = 0 LIMIT 1').get();
  const ownedLive = await db.prepare("INSERT INTO user_cards (user_id,picture_id,source) VALUES (?,?,'gacha') RETURNING id").get(user.id,liveCard.id);
  await db.prepare('INSERT INTO trades (from_user,to_user,offer_card_id,request_card_id) VALUES (?,?,?,?)').run(user.id,user.id,ownedHidden.id,ownedLive.id);
  const book = await db.prepare("INSERT INTO storybooks (user_id,title) VALUES (?,'Preserved book') RETURNING id").get(user.id);
  await db.prepare('INSERT INTO storybook_pages (storybook_id,artwork_id,position) VALUES (?,?,?)').run(book.id,removedArt.id,0);
  await db.prepare('INSERT INTO storybook_pages (storybook_id,artwork_id,position) VALUES (?,?,?)').run(book.id,saved.body.artwork.id,1);
  assert.ok(!(await api('GET','/gacha/catalog',null,user.token)).body.cards.some((p) => p.pictureId === hiddenCard));
  const Picture = await import('../src/models/picture.js');
  assert.ok(!(await Picture.cardPool()).S.includes(hiddenCard));
  await seedPicturesIfNeeded(db);
  assert.deepEqual((await db.prepare('SELECT id,slug FROM pictures ORDER BY id').all()).map((p) => [p.id,p.slug]),before);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM themes WHERE slug IN (?,?,?)').get(...retired.themes)).n,0);
  assert.equal(await db.prepare('SELECT id FROM artworks WHERE id = ?').get(removedArt.id),undefined);
  assert.equal(await db.prepare('SELECT id FROM user_cards WHERE id = ?').get(ownedHidden.id),undefined);
  assert.ok(await db.prepare('SELECT id FROM user_cards WHERE id = ?').get(ownedLive.id));
  assert.equal((await api('GET',`/artworks/${saved.body.artwork.id}`,null,user.token)).status,200);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM storybook_pages WHERE storybook_id = ?').get(book.id)).n,1);
  assert.equal(await seedPicturesIfNeeded(db),0,'Repeating startup must not regenerate retired pictures');
});

test('Cơ sở dữ liệu cũ có thứ tự đối tượng khác catalog được xếp lại theo catalog', async () => {
  const db = getDb();
  const viewer = await register('ordercheck1');
  await db.prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) VALUES (?, 'month', ?, ?)")
    .run(viewer.id, new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  const slugs = (await api('GET', '/themes/cong-chua-ngan-hoa/pictures', null, viewer.token)).body.pictures.map((p) => p.slug);
  assert.equal(slugs[4], 'suon-xam--tu-dang');
  assert.equal(slugs[8], 'vay-yem--hoa-cuc-trang');
  // Mô phỏng máy cũ: Váy Yếm đứng thứ 5, Sườn Xám thứ 6.
  const set = db.prepare("UPDATE objects SET sort = ? WHERE slug = ? AND theme_id = (SELECT id FROM themes WHERE slug = 'cong-chua-ngan-hoa')");
  await set.run(4, 'vay-yem');
  await set.run(5, 'suon-xam');
  await set.run(6, 'vay-ngan');
  const old = (await api('GET', '/themes/cong-chua-ngan-hoa/pictures', null, viewer.token)).body.pictures.map((p) => p.slug);
  assert.equal(old[4], 'vay-yem--hoa-cuc-trang');
  await seedPicturesIfNeeded(db);
  const now = (await api('GET', '/themes/cong-chua-ngan-hoa/pictures', null, viewer.token)).body.pictures.map((p) => p.slug);
  assert.equal(now[4], 'suon-xam--tu-dang');
  assert.equal(now[8], 'vay-yem--hoa-cuc-trang');
});

test('Lịch sử: tranh đang dở trả về % đã tô (?progress=1)', async () => {
  const { token } = await register('lichsu1');
  const pic = (await api('GET', '/themes/anh-hung-sieu-thu/objects/su-tu/pictures')).body.pictures[0];
  const a = await api('POST', '/artworks', { pictureId: pic.id, mode: 'free' }, token);
  const id = a.body.artwork.id;
  const one = { [pic.regions[0].id]: '#FF5F7E' };
  const sv = await api('PUT', `/artworks/${id}`, { data: { fills: one, strokes: [], stickers: [] } }, token);
  assert.equal(sv.status, 200, JSON.stringify(sv.body));
  const got = (await api('GET', '/artworks?progress=1&status=in_progress', null, token)).body.artworks.find((x) => x.id === id);
  assert.ok(got.progress >= 1 && got.progress <= 99, `phần trăm đã tô: ${got.progress}`);
  const empty = await api('POST', '/artworks', { pictureId: pic.id, mode: 'free' }, token);
  const e = (await api('GET', '/artworks?progress=1', null, token)).body.artworks.find((x) => x.id === empty.body.artwork.id);
  assert.equal(e.progress, 0);
});

test('Truyện tranh: gói thường 1 cuốn tối đa 10 trang, VIP không giới hạn', async () => {
  const { token, id } = await register('truyen01');
  const first = await api('POST', '/storybooks', { title: 'Cuốn 1', pages: [] }, token);
  assert.equal(first.status, 201);
  assert.equal((await api('POST', '/storybooks', { title: 'Cuốn 2', pages: [] }, token)).body.error.code, 'storybook_limit');
  const eleven = Array.from({ length: 11 }, (_, i) => ({ artworkId: i + 1 }));
  assert.equal(
    (await api('PUT', `/storybooks/${first.body.storybook.id}`, { title: 'Cuốn 1', pages: eleven }, token)).body.error.code,
    'storybook_pages_limit',
  );
  await getDb()
    .prepare("INSERT INTO subscriptions (user_id, plan, starts_at, ends_at) VALUES (?, 'year', ?, ?)")
    .run(id, new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  assert.equal((await api('POST', '/storybooks', { title: 'Cuốn 2', pages: [] }, token)).status, 201);
});

test('Ngôn ngữ: tài khoản mới mặc định tiếng Anh, đăng ký khi đang xem tiếng Việt thì giữ tiếng Việt', async () => {
  await register('ngonngu1');
  await register('ngonngu2', 'abc12345', 'ngonngu2', 'vi');
});

test('US phone OTP registration and password reset use the same normalized contact', async () => {
  const { body: cap } = await api('GET', '/auth/captcha');
  const start = await api('POST', '/auth/register/start', {
    username: 'usphone01',
    password: 'abc12345',
    language: 'en',
    captchaId: cap.captchaId,
    captchaText: _peekCaptcha(cap.captchaId),
    contactType: 'phone',
    contact: '+1 (202) 555-0123',
  });
  assert.equal(start.status, 200, JSON.stringify(start.body));
  assert.ok(start.body.devCode);
  const verify = await api('POST', '/auth/register/verify', { registrationId: start.body.registrationId, code: start.body.devCode });
  assert.equal(verify.status, 201);
  const user = await getDb().prepare('SELECT guardian_contact FROM users WHERE username = ?').get('usphone01');
  assert.equal(user.guardian_contact, '+12025550123');

  const { body: cap2 } = await api('GET', '/auth/captcha');
  const throttled = await api('POST', '/auth/register/start', {
    username: 'usphone02',
    password: 'abc12345',
    captchaId: cap2.captchaId,
    captchaText: _peekCaptcha(cap2.captchaId),
    contactType: 'phone',
    contact: '12025550123',
  });
  assert.equal(throttled.body.error.code, 'otp_too_frequent', 'Formatting must not bypass OTP throttling');

  const reset = await api('POST', '/auth/forgot/start', { contactType: 'phone', contact: '(202) 555-0123' });
  assert.equal(reset.status, 200);
  assert.ok(reset.body.resetId);
  const accounts = await api('POST', '/auth/forgot/verify', { resetId: reset.body.resetId, code: reset.body.devCode });
  assert.equal(accounts.status, 200);
  assert.deepEqual(
    accounts.body.accounts.map((a) => a.username),
    ['usphone01'],
  );
  const changed = await api('POST', '/auth/forgot/reset', { resetToken: accounts.body.resetToken, username: 'usphone01', newPassword: 'newpass123' });
  assert.equal(changed.status, 200);
  assert.equal((await api('POST', '/auth/login', { username: 'usphone01', password: 'newpass123' })).status, 200);
});

test('Checkout only offers PayPal and bank transfer and rejects new MoMo payments', async () => {
  const user = await register('nomomo1');
  const meta = await api('GET', '/meta');
  assert.deepEqual(Object.keys(meta.body.payments).sort(), ['bank', 'mockAllowed', 'paypal']);
  const result = await api('POST', '/payments', { plan: 'month', provider: 'momo' }, user.token);
  assert.equal(result.status, 400);
  assert.equal(result.body.error.code, 'invalid_provider');
  assert.equal((await getDb().prepare('SELECT count(*) AS n FROM payments WHERE user_id = ?').get(user.id)).n, 0);
});

test('Production checkout refuses incomplete setup and test-provider credentials', async () => {
  const { env } = await import('../src/config/env.js');
  const u = await register('paymentsetup1');
  const saved = { isProd: env.isProd, paymentMock: env.paymentMock, paypal: env.paypal, momo: env.momo, bank: env.bank, sepay: env.sepay };
  try {
    Object.assign(env, {
      isProd: true,
      paymentMock: false,
      paypal: { clientId: 'test', secret: 'test', webhookId: 'WH', base: 'https://api-m.sandbox.paypal.com' },
      momo: { partnerCode: 'test', accessKey: 'test', secretKey: 'test', endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create' },
      bank: { code: 'ACB', accountNo: '', accountName: '' },
      sepay: { apiKey: 'test-key' },
    });
    for (const provider of ['bank', 'paypal']) {
      const result = await api('POST', '/payments', { plan: 'month', provider }, u.token);
      assert.equal(result.status, 503);
      assert.equal(result.body.error.code, 'payment_unavailable');
    }
    const meta = await api('GET', '/meta');
    for (const provider of ['bank', 'paypal']) assert.equal(meta.body.payments[provider].configured, false);
    assert.equal((await getDb().prepare('SELECT count(*) AS n FROM payments WHERE user_id = ?').get(u.id)).n, 0);
  } finally {
    Object.assign(env, saved);
  }
});

test('Concurrent painting starts and duplicate payment callbacks consume or grant only once', async () => {
  const user = await register('concurrent1');
  const art = await api('POST', '/artworks', { pictureId: 1, mode: 'free' }, user.token);
  const starts = await Promise.all([1, 2].map(() => api('POST', `/artworks/${art.body.artwork.id}/start`, null, user.token)));
  assert.ok(starts.every((response) => response.status === 200));
  assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM usage_log WHERE artwork_id = ?').get(art.body.artwork.id)).n, 1);
  const payment = await api('POST', '/payments', { plan: 'month', provider: 'bank' }, user.token);
  const results = await Promise.all([1, 2].map(() => api('POST', `/payments/${payment.body.paymentId}/mock-complete`, null, user.token)));
  assert.ok(results.every((response) => response.status === 200));
  assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM subscriptions WHERE user_id = ?').get(user.id)).n, 1);
});

test('Concurrent OTP requests honor cooldown and each code is consumed only once', async () => {
  const { issueOtp, consumeOtp } = await import('../src/services/otp.js');
  const input = { purpose: 'register', type: 'email', target: 'concurrent@example.invalid' };
  const issued = await Promise.allSettled([issueOtp(input), issueOtp(input)]);
  assert.equal(issued.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(issued.find((result) => result.status === 'rejected').reason.code, 'otp_too_frequent');
  const otp = issued.find((result) => result.status === 'fulfilled').value;
  const consumed = await Promise.allSettled([consumeOtp(otp.otpId, otp.devCode, input.purpose), consumeOtp(otp.otpId, otp.devCode, input.purpose)]);
  assert.equal(consumed.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(consumed.find((result) => result.status === 'rejected').reason.code, 'otp_invalid');
});

test('Free theme limits apply to every API, VIP month/year unlock them and expiry immediately revokes access', async () => {
  const Picture = await import('../src/models/picture.js');
  const { PLANS } = await import('../src/config/constants.js');
  for (const kind of ['month', 'year']) {
    const user = await register(`rights${kind}`);
    const initial = (await api('GET', '/themes', null, user.token)).body.themes;
    for (const age of new Set(initial.map(t => t.age))) {
      const group = initial.filter(t => t.age === age);
      assert.equal(group.filter(t => !t.locked).length, Math.min(PLANS.free.themesPerAge, group.length));
      assert.ok(group.slice(PLANS.free.themesPerAge).every(t => t.locked));
    }
    const theme = initial.find(t => t.locked);
    assert.ok(theme, 'The library must contain themes outside the Free allowance');
    const p = await Picture.findPicture((await Picture.listThemePictures(theme.id))[0].id);
    const paths = [`/themes/${theme.slug}/pictures`, `/themes/${theme.slug}/objects`,
      `/themes/${theme.slug}/objects/${p.object_slug}/pictures`, `/pictures/${p.id}`];
    for (const path of paths) {
      const blocked = await api('GET', path, null, user.token);
      assert.equal(blocked.status, 403, path);
      assert.equal(blocked.body.error.code, 'theme_vip_required');
    }
    assert.equal((await api('GET', paths[0])).status, 403, 'Removing the token cannot bypass Free limits');
    const forged = await api('POST', '/artworks', {pictureId:p.id, mode:'free', vip:true, plan:'year', role:'admin'}, user.token);
    assert.equal(forged.body.error.code, 'theme_vip_required');
    assert.equal((await getDb().prepare('SELECT count(*) AS n FROM artworks WHERE user_id = ?').get(user.id)).n, 0);
    // An unpaid order never grants VIP.
    const order = await api('POST', '/payments', {plan:kind, provider:'bank'}, user.token);
    assert.equal(order.status, 201);
    assert.equal((await api('GET', '/auth/me', null, user.token)).body.plan.vip, false);
    assert.equal((await api('GET', paths[0], null, user.token)).status, 403);
    await api('POST', `/payments/${order.body.paymentId}/mock-complete`, null, user.token);
    const paid = (await api('GET', '/auth/me', null, user.token)).body;
    assert.equal(paid.plan.plan, kind);
    assert.equal(paid.plan.vip, true);
    assert.equal(paid.user.vip, true);
    assert.equal(paid.plan.limit, null);
    assert.ok((await api('GET', '/themes', null, user.token)).body.themes.every(t => !t.locked));
    for (const path of paths) assert.equal((await api('GET', path, null, user.token)).status, 200, path);
    assert.equal((await api('GET', '/users/me/signature', null, user.token)).body.premium, true);
    assert.equal((await api('GET', '/social/trades', null, user.token)).body.dailyLimit, 5);
    const created = await api('POST', '/artworks', {pictureId:p.id, mode:'free'}, user.token);
    assert.equal(created.status, 201);
    const artworkId = created.body.artwork.id;
    assert.equal((await api('POST', `/artworks/${artworkId}/start`, null, user.token)).status, 200);
    // Leave a counted draft open, then expire the subscription on the server.
    await getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?').run(new Date(Date.now()-1000).toISOString(), user.id);
    const expired = (await api('GET', '/auth/me', null, user.token)).body;
    assert.equal(expired.plan.plan, 'free');
    assert.equal(expired.user.vip, false);
    assert.equal(expired.plan.limit, 2);
    for (const path of paths) assert.equal((await api('GET', path, null, user.token)).status, 403, path);
    assert.equal((await api('POST', `/artworks/${artworkId}/start`, null, user.token)).body.error.code, 'theme_vip_required');
    assert.equal((await api('PUT', `/artworks/${artworkId}`, {data:{fills:{}}}, user.token)).body.error.code, 'theme_vip_required');
    const oldArt = await api('GET', `/artworks/${artworkId}`, null, user.token);
    assert.equal(oldArt.status, 200, 'Existing art remains viewable');
    assert.equal(oldArt.body.accessError, 'theme_vip_required');
    assert.equal((await api('GET', `/pictures/${p.id}?access=1`, null, user.token)).status, 403);
    assert.equal((await api('GET', '/users/me/signature', null, user.token)).body.premium, false);
    assert.equal((await api('GET', '/social/trades', null, user.token)).body.dailyLimit, 1);
    assert.equal((await api('PUT', '/users/me/signature', {name:'Tester',style:'gold'}, user.token)).body.error.code, 'signature_premium_required');
    // A future, not-yet-active subscription is still Free today.
    await getDb().prepare('INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,?,?,?)')
      .run(user.id,kind,new Date(Date.now()+86400000).toISOString(),new Date(Date.now()+32*86400000).toISOString());
    assert.equal((await api('GET', paths[0], null, user.token)).status, 403);
    // VIP does not grant rare cards; earned cards remain usable by Free accounts.
    const card = await getDb().prepare('SELECT id FROM pictures WHERE is_card = 1 LIMIT 1').get();
    assert.equal((await api('GET', `/pictures/${card.id}`, null, user.token)).body.error.code, 'card_not_owned');
    await getDb().prepare("INSERT INTO user_cards (user_id,picture_id,source) VALUES (?,?,'gacha')").run(user.id, card.id);
    assert.equal((await api('GET', `/pictures/${card.id}`, null, user.token)).status, 200);
  }
});

test('VIP theme access cannot be bypassed through collaborative room creation, joining or an expired open room', async () => {
  const Picture = await import('../src/models/picture.js');
  const host = await register('rightsroomhost');
  const guest = await register('rightsroomguest');
  const theme = (await api('GET', '/themes', null, host.token)).body.themes.find(t => t.locked);
  const p = await Picture.findPicture((await Picture.listThemePictures(theme.id))[0].id);
  const sh = await connect(host.token), sg = await connect(guest.token);
  try {
    assert.equal((await emit(sh, 'collab:create', {pictureId:p.id})).error, 'theme_vip_required');
    const grant = async (id) => getDb().prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'month',?,?)")
      .run(id,new Date(Date.now()-1000).toISOString(),new Date(Date.now()+86400000).toISOString());
    await grant(host.id);
    const room = await emit(sh, 'collab:create', {pictureId:p.id});
    assert.ok(room.room);
    assert.equal((await emit(sg, 'collab:join', {code:room.room.code})).error, 'theme_vip_required');
    await grant(guest.id);
    assert.ok((await emit(sg, 'collab:join', {code:room.room.code})).room);
    const op = once(sg, 'collab:op');
    sh.emit('collab:op', {type:'fill', regionId:room.picture.regions[0].id, color:'#FF5F7E'});
    await op;
    await getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?').run(new Date(Date.now()-1000).toISOString(),host.id);
    const denied = once(sh, 'collab:access-denied');
    sh.emit('collab:op', {type:'fill', regionId:room.picture.regions[0].id, color:'#000000'});
    assert.equal((await denied).error,'theme_vip_required');
    assert.equal((await emit(sh, 'collab:save', {})).error,'theme_vip_required');
    assert.equal((await emit(sg, 'collab:save', {})).ok,true);
    assert.equal((await api('GET','/artworks?mode=collab',null,host.token)).body.artworks.length,0);
    assert.equal((await api('GET','/artworks?mode=collab',null,guest.token)).body.artworks.length,1);
  } finally {sh.close();sg.close();}
});

test('Free and expired VIP obey storybook, signature and exhibition benefits while owned Ruby items remain available', async () => {
  const Ex = await import('../src/services/exhibition.js');
  const user = await register('benefitaudit1');
  const first = await api('POST','/storybooks',{title:'First book',pages:[]},user.token);
  assert.equal(first.status,201);
  assert.equal((await api('POST','/storybooks',{title:'Extra book',pages:[]},user.token)).body.error.code,'storybook_limit');
  assert.equal((await Ex.status(user.id)).limit,1);
  await getDb().prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'year',?,?)")
    .run(user.id,new Date(Date.now()-1000).toISOString(),new Date(Date.now()+86400000).toISOString());
  assert.equal((await Ex.status(user.id)).limit,5);
  assert.equal((await api('PUT','/users/me/signature',{name:'Tester',style:'gold'},user.token)).status,200);
  const picture = (await api('POST','/artworks',{pictureId:1,mode:'free'},user.token)).body.artwork;
  assert.equal((await api('PUT',`/artworks/${picture.id}`,{data:{fills:{bg:'#FF5F7E'}},completed:true},user.token)).status,200);
  const pages=Array.from({length:11},()=>({artworkId:picture.id}));
  assert.equal((await api('PUT',`/storybooks/${first.body.storybook.id}`,{pages},user.token)).status,200);
  assert.equal((await api('POST','/storybooks',{title:'Extra book',pages:[]},user.token)).status,201);
  await getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?').run(new Date(Date.now()-1000).toISOString(),user.id);
  assert.equal((await Ex.status(user.id)).limit,1);
  assert.equal((await api('POST','/storybooks',{title:'After expiry',pages:[]},user.token)).body.error.code,'storybook_limit');
  assert.equal((await api('PUT',`/storybooks/${first.body.storybook.id}`,{pages},user.token)).body.error.code,'storybook_pages_limit');
  const signature=(await api('GET','/users/me/signature',null,user.token)).body;
  assert.equal(signature.premium,false);
  assert.equal(signature.signature.style,'classic');
  assert.equal((await api('GET',`/storybooks/${first.body.storybook.id}`,null,user.token)).body.storybook.pages.length,11,'Purchased-era books remain readable');
  const item=(await api('GET','/shop',null,user.token)).body.items.find(item=>item.type==='pattern'&&item.price>0);
  await getDb().prepare('UPDATE users SET ruby = ? WHERE id = ?').run(item.price,user.id);
  assert.equal((await api('POST',`/shop/${item.slug}/buy`,null,user.token)).status,200,'Ruby shop purchases are a Free benefit too');
  assert.ok((await api('GET','/shop',null,user.token)).body.items.find(i=>i.slug===item.slug).owned);
});

test('Theme entitlement metadata is never cached and the lightweight access query preserves lock decisions', async () => {
  const full = await api('GET', '/themes');
  const light = await api('GET', '/themes?access=1');
  assert.equal(light.status, 200);
  assert.deepEqual(light.body.themes.map(t=>[t.id,t.locked]), full.body.themes.map(t=>[t.id,t.locked]));
  assert.ok(light.body.themes.every(t=>t.cover === null));
  assert.ok(full.body.themes.some(t=>t.cover));
  for (const response of [full,light]) {
    assert.match(response.headers.get('cache-control'), /private, no-store/);
    assert.match(response.headers.get('vary'), /Authorization/);
  }
});

test('Lightweight picture grids preserve order and permissions without downloading editor data', async () => {
  const full = await api('GET', '/themes');
  const previews = await api('GET', '/themes?preview=1');
  assert.equal(previews.status, 200);
  assert.deepEqual(previews.body.themes.map((t) => [t.id,t.locked,t.pictureCount]), full.body.themes.map((t) => [t.id,t.locked,t.pictureCount]));
  assert.ok(JSON.stringify(previews.body).length < JSON.stringify(full.body).length / 50);
  for (const { cover } of previews.body.themes) {
    if (!cover) continue;
    assert.equal(cover.svg, undefined);
    assert.equal(cover.regions, undefined);
    assert.equal(cover.palette, undefined);
    assert.match(cover.preview.color, /^\/picture-previews\/.+-[a-f0-9]{16}\.webp$/);
    assert.match(cover.preview.outline, /-outline\.webp$/);
  }
  const theme = previews.body.themes.find((t) => !t.locked);
  const fullPictures = await api('GET', `/themes/${theme.slug}/pictures`);
  const lightPictures = await api('GET', `/themes/${theme.slug}/pictures?preview=1`);
  assert.equal(lightPictures.status, 200);
  assert.deepEqual(lightPictures.body.pictures.map((p) => [p.id,p.name,p.theme]), fullPictures.body.pictures.map((p) => [p.id,p.name,p.theme]));
  assert.ok(lightPictures.body.pictures.every((p) => p.preview && !p.svg && !p.regions));
  assert.ok(JSON.stringify(lightPictures.body).length < JSON.stringify(fullPictures.body).length / 50);
  for (const response of [previews,lightPictures]) assert.match(response.headers.get('cache-control'), /private, no-store/);
  const locked = previews.body.themes.find((t) => t.locked);
  assert.equal((await api('GET', `/themes/${locked.slug}/pictures?preview=1`)).body.error.code, 'theme_vip_required');
  const vip = await register('previewvip1');
  await getDb().prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'month',?,?)")
    .run(vip.id,new Date(Date.now()-1000).toISOString(),new Date(Date.now()+86400000).toISOString());
  assert.equal((await api('GET', `/themes/${locked.slug}/pictures?preview=1`, null, vip.token)).status,200);
  await getDb().prepare('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?').run(new Date(Date.now()-1000).toISOString(),vip.id);
  assert.equal((await api('GET', `/themes/${locked.slug}/pictures?preview=1`, null, vip.token)).body.error.code,'theme_vip_required');
});

test('Selection grids use a bounded number of database requests regardless of the number of covers', async () => {
  const db = getDb();
  const prepare = db.prepare;
  let queries = 0;
  db.prepare = function (...args) { queries++; return prepare.apply(this, args); };
  try {
    const themes = await api('GET', '/themes?preview=1');
    assert.equal(themes.status,200);
    assert.ok(queries <= 3, `Theme grid needed ${queries} queries`);
    queries = 0;
    const pictures = await api('GET', `/themes/${themes.body.themes.find((t) => !t.locked).slug}/pictures?preview=1`);
    assert.equal(pictures.status,200);
    assert.ok(queries <= 4, `Picture grid needed ${queries} queries`);
  } finally { db.prepare = prepare; }
});

test('Preview database queries and repeat startup checks never read SVG or region blobs', async () => {
  const db = getDb();
  const Picture = await import('../src/models/picture.js');
  const grid = await Picture.findPictures([1], { preview: true });
  assert.equal(grid.get(1).svg,undefined);
  assert.equal(grid.get(1).manifest,undefined);
  assert.ok(grid.get(1).preview);
  const prepare = db.prepare, queries = [];
  db.prepare = function (sql) { queries.push(sql); return prepare.call(this,sql); };
  try { assert.equal(await seedPicturesIfNeeded(db),0); }
  finally { db.prepare = prepare; }
  assert.ok(!queries.some((sql) => /SELECT[^;]*\bp\.(svg|manifest)\b/i.test(sql)));
});

test('Card preview responses stay small and still require ownership independently of VIP', async () => {
  const Picture = await import('../src/models/picture.js');
  const user = await register('cardpreview2');
  const deck = await api('GET','/gacha/catalog',null,user.token);
  const id = deck.body.cards[0].pictureId;
  assert.equal((await api('GET',`/pictures/${id}?preview=1`,null,user.token)).body.error.code,'card_not_owned');
  await getDb().prepare('UPDATE users SET gacha_points = 50 WHERE id = ?').run(user.id);
  const pull = await api('POST','/gacha/pull',{pictureIds:[id],preview:true},user.token);
  assert.equal(pull.status,200);
  assert.ok(pull.body.results[0].picture.preview);
  assert.equal(pull.body.results[0].picture.svg,undefined);
  const owned = await api('GET',`/pictures/${id}?preview=1`,null,user.token);
  assert.equal(owned.status,200);
  assert.equal(owned.body.picture.preview.color,Picture.toPreview(await Picture.findPicture(id)).preview.color);
  const full = await api('GET',`/pictures/${id}`,null,user.token);
  assert.match(full.body.picture.svg,/^<svg/);
  assert.ok(full.body.picture.regions.length);
});

test('Email-only signup and recovery reject SMS, require the email OTP and preserve legacy phone logins', async () => {
  const legacy = await register('phonelegacy1');
  const before = (await getDb().prepare('SELECT count(*) AS n FROM otp_codes').get()).n;
  const oldEnabled = testEnv.phoneOtpEnabled;
  testEnv.phoneOtpEnabled = false;
  try {
    const meta = await api('GET', '/meta');
    assert.equal(meta.body.auth.phoneOtpEnabled, false);
    const cap = (await api('GET', '/auth/captcha')).body;
    const fields = { username:'emailonly1', password:'email12345', captchaId:cap.captchaId, captchaText:_peekCaptcha(cap.captchaId), language:'vi' };
    const blocked = await api('POST', '/auth/register/start', {...fields, contactType:'phone', contact:legacy.phone});
    assert.equal(blocked.status, 503);
    assert.equal(blocked.body.error.code, 'phone_otp_unavailable');
    for (const contact of [legacy.phone, '0999999999']) {
      const reset = await api('POST', '/auth/forgot/start', {contactType:'phone', contact});
      assert.equal(reset.status, 503);
      assert.equal(reset.body.error.code, 'phone_otp_unavailable');
    }
    assert.equal((await getDb().prepare('SELECT count(*) AS n FROM otp_codes').get()).n, before, 'Disabled SMS must not issue a code or reserve a cooldown');
    assert.equal((await api('POST', '/auth/login', {username:'phonelegacy1',password:'abc12345'})).status, 200);
    const email = 'parent-email-only@example.invalid';
    // SMS rejection leaves this CAPTCHA usable for the permitted email method.
    const sent = await api('POST', '/auth/register/start', {...fields,contactType:'email',contact:email});
    assert.equal(sent.status, 200);
    assert.equal(await getDb().prepare('SELECT id FROM users WHERE username = ?').get(fields.username), undefined);
    const wrong = sent.body.devCode === '000000' ? '111111' : '000000';
    assert.equal((await api('POST','/auth/register/verify',{registrationId:sent.body.registrationId,code:wrong})).body.error.code, 'otp_wrong');
    assert.equal((await api('POST','/auth/register/verify',{registrationId:sent.body.registrationId,code:sent.body.devCode})).status, 201);
    const saved = await getDb().prepare('SELECT guardian_type,guardian_contact FROM users WHERE username = ?').get(fields.username);
    assert.equal(saved.guardian_type, 'email');
    assert.equal(saved.guardian_contact, email);
    assert.equal((await api('POST','/auth/login',{username:fields.username,password:fields.password})).status, 200);
    const reset = await api('POST','/auth/forgot/start',{contactType:'email',contact:email});
    assert.equal(reset.status, 200);
    const verified = await api('POST','/auth/forgot/verify',{resetId:reset.body.resetId,code:reset.body.devCode});
    assert.equal(verified.status, 200);
    assert.equal((await api('POST','/auth/forgot/reset',{resetToken:verified.body.resetToken,username:fields.username,newPassword:'changed12345'})).status, 200);
    assert.equal((await api('POST','/auth/login',{username:fields.username,password:fields.password})).status, 401);
    assert.equal((await api('POST','/auth/login',{username:fields.username,password:'changed12345'})).status, 200);
  } finally {
    testEnv.phoneOtpEnabled = oldEnabled;
  }
});

async function measuredGet(path, token, budget) {
  const db = getDb(), query = db.query;
  let calls = 0;
  const readRows = [];
  db.query = async function (...args) {
    calls++;
    const result = await query.apply(this, args);
    if (Array.isArray(result)) readRows.push(...result);
    return result;
  };
  let response;
  try { response = await api('GET', path, null, token); }
  finally { db.query = query; }
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.ok(calls <= budget, `${path} needed ${calls} database calls (budget ${budget})`);
  return { ...response, readRows };
}

test('History and collection load many saved artworks with bounded reads, unchanged progress, data and exhibition eligibility', async () => {
  const user = await register('loadartworks1');
  const db = getDb();
  const picture = (await api('GET', '/pictures/1', null, user.token)).body.picture;
  const filled = FULL_FILLS(picture);
  const earlier = new Date(Date.now() - 2 * 86400000).toISOString();
  const finished = new Date(Date.now() - 3600000).toISOString();
  const completed = [], drafts = [];
  for (let i = 0; i < 24; i++) {
    const done = i < 12;
    const data = { fills: done ? filled : i === 12 ? {} : { [picture.regions[0].id]: '#FF0000' }, strokes: [], stickers: [] };
    if (done && i !== 1) data.signature = { name: 'Saved signature', style: 'classic', x: 500, y: 560, scale: 0.8, rot: 0 };
    const row = await db.prepare(`INSERT INTO artworks (user_id,picture_id,mode,status,data,thumbnail,created_at,updated_at,completed_at)
      VALUES (?,1,'free',?,?,?,?,?,?) RETURNING id`).get(user.id, done ? 'completed' : 'in_progress', JSON.stringify(data), 'saved-thumbnail', earlier, finished, done ? finished : null);
    (done ? completed : drafts).push(row.id);
  }
  await db.prepare(`INSERT INTO exhibition_entries (artwork_id,user_id,round_key,board,status)
    VALUES (?,?,'2099-01-05','free','pending')`).run(completed[0], user.id);
  const history = await measuredGet('/artworks?progress=1', user.token, 3);
  assert.equal(history.body.artworks.length, 24);
  assert.equal(history.body.artworks.find(a => a.id === drafts[0]).progress, 0);
  assert.ok(history.body.artworks.filter(a => drafts.slice(1).includes(a.id)).every(a => a.progress > 0 && a.progress < 100));
  const collection = await measuredGet('/artworks?status=completed&eligibility=1', user.token, 5);
  assert.equal(collection.body.artworks.length, 12);
  assert.equal(collection.body.artworks.find(a => a.id === completed[0]).exhibitEligible, false, 'Already submitted artwork stays ineligible');
  assert.equal(collection.body.artworks.find(a => a.id === completed[1]).exhibitEligible, false, 'A missing signature stays ineligible');
  assert.ok(collection.body.artworks.filter(a => completed.slice(2).includes(a.id)).every(a => a.exhibitEligible));
  assert.ok(!history.readRows.some(row => row.svg), 'History should not download SVG artwork from the database');
  assert.ok(!collection.readRows.some(row => row.svg), 'Eligibility checks need geometry, not SVG artwork');
  assert.ok(collection.body.artworks.every(a => a.data === undefined && a.svg === undefined && a.manifest === undefined));
  const reopened = await api('GET', `/artworks/${completed[2]}`, null, user.token);
  assert.deepEqual(reopened.body.artwork.data.fills, filled);
  assert.equal(reopened.body.artwork.data.signature.name, 'Saved signature');
  assert.match(reopened.body.picture.svg, /^<svg/);
  assert.equal((await api('POST', '/auth/login', { username: 'loadartworks1', password: 'abc12345' })).status, 200);
  for (let i = 0; i < 12; i++) {
    const book = await db.prepare('INSERT INTO storybooks (user_id,title) VALUES (?,?) RETURNING id').get(user.id, `Saved book ${i}`);
    await db.prepare("INSERT INTO storybook_pages (storybook_id,artwork_id,position,caption) VALUES (?,?,0,'Saved caption')").run(book.id, completed[i]);
  }
  const books = await measuredGet('/storybooks', user.token, 2);
  assert.equal(books.body.storybooks.length, 12);
  assert.ok(books.body.storybooks.every(b => b.pageCount === 1 && b.cover === 'saved-thumbnail' && b.pages === undefined));
  const book = await api('GET', `/storybooks/${books.body.storybooks[0].id}`, null, user.token);
  assert.equal(book.body.storybook.pages[0].caption, 'Saved caption');
});

test('Batched friend and trade lists preserve direction, status, card ownership and fresh public VIP profiles', async () => {
  const user = await register('loadsocial1');
  const db = getDb();
  const Picture = await import('../src/models/picture.js');
  const Card = await import('../src/models/card.js');
  const cardPicture = Object.values(await Picture.cardPool()).flat()[0];
  const ownCard = await Card.add(user.id, cardPicture, 'gacha');
  const people = [], tradeIds = [];
  for (let i = 0; i < 12; i++) {
    const person = await db.prepare('INSERT INTO users (username,nickname,password_hash,guardian_contact,friend_code) VALUES (?,?,?,?,?) RETURNING id')
      .get(`loadfriend${i}`, `Friend ${i}`, 'private-hash', 'private@example.invalid', `LOAD${i}`);
    people.push(person.id);
    const incoming = i % 3 === 0;
    await db.prepare('INSERT INTO friendships (requester_id,addressee_id,status) VALUES (?,?,?)')
      .run(incoming ? person.id : user.id, incoming ? user.id : person.id, i % 3 === 2 ? 'accepted' : 'pending');
    const otherCard = await Card.add(person.id, cardPicture, 'gacha');
    const trade = await db.prepare('INSERT INTO trades (from_user,to_user,offer_card_id,request_card_id,status) VALUES (?,?,?,?,?) RETURNING id')
      .get(i % 2 ? person.id : user.id, i % 2 ? user.id : person.id, i % 2 ? otherCard : ownCard, i % 2 ? ownCard : null, i < 2 ? 'pending' : 'declined');
    tradeIds.push(trade.id);
  }
  await db.prepare("INSERT INTO subscriptions (user_id,plan,starts_at,ends_at) VALUES (?,'month',?,?)")
    .run(people[0], new Date(Date.now() - 1000).toISOString(), new Date(Date.now() + 86400000).toISOString());
  const friends = await measuredGet('/social/friends', user.token, 3);
  assert.deepEqual(['friends','incoming','outgoing'].map(key => friends.body[key].length), [4,4,4]);
  assert.equal(friends.body.incoming.find(f => f.user.id === people[0]).user.vip, true);
  assert.ok([...friends.body.friends,...friends.body.incoming,...friends.body.outgoing].every(f => f.user.password_hash === undefined && f.user.guardian_contact === undefined));
  const trades = await measuredGet('/social/trades', user.token, 6);
  assert.deepEqual(trades.body.trades.map(t => t.id), tradeIds.slice().reverse());
  assert.equal(trades.body.usedToday, 1);
  assert.equal(trades.body.dailyLimit, 1);
  assert.equal(trades.body.trades.at(-1).offer.id, ownCard);
  assert.equal(trades.body.trades.at(-1).kind, 'gift');
  assert.equal(trades.body.trades.at(-2).request.id, ownCard);
  assert.equal(trades.body.trades.at(-2).kind, 'exchange');
  assert.equal(trades.body.trades.at(-1).to.vip, true);
  await db.prepare('UPDATE subscriptions SET ends_at=? WHERE user_id=?').run(new Date(Date.now() - 1).toISOString(), people[0]);
  assert.equal((await api('GET', '/social/trades', null, user.token)).body.trades.at(-1).to.vip, false);
});

test('Multi-card reveals keep every duplicate copy and roll back invalid or overdrawn pulls', async () => {
  const user = await register('loadgacha1');
  const db = getDb();
  const catalog = (await api('GET', '/gacha/catalog', null, user.token)).body.cards;
  const choices = [catalog[1].pictureId, catalog[0].pictureId, catalog[1].pictureId, ...catalog.slice(2,6).map(c => c.pictureId)];
  await db.prepare('UPDATE users SET gacha_points=350 WHERE id=?').run(user.id);
  const before = await db.prepare('SELECT COUNT(*) AS c FROM user_cards WHERE user_id=?').get(user.id);
  const invalid = await api('POST', '/gacha/pull', { pictureIds: [...choices.slice(0,6),999999], preview: true }, user.token);
  assert.equal(invalid.body.error.code, 'invalid_card');
  assert.equal((await db.prepare('SELECT COUNT(*) AS c FROM user_cards WHERE user_id=?').get(user.id)).c, before.c);
  assert.equal((await db.prepare('SELECT gacha_points FROM users WHERE id=?').get(user.id)).gacha_points, 350);
  const result = await api('POST', '/gacha/pull', { pictureIds: choices, preview: true }, user.token);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.results.map(r => r.picture.id), choices);
  assert.equal(new Set(result.body.results.map(r => r.cardId)).size, 7);
  assert.equal(result.body.gachaPoints, 0);
  for (const card of result.body.results) {
    const saved = await db.prepare('SELECT user_id,picture_id FROM user_cards WHERE id=?').get(card.cardId);
    assert.equal(saved.user_id, user.id);
    assert.equal(saved.picture_id, card.picture.id);
    assert.ok(card.picture.preview && !card.picture.svg);
  }
  const cards = await measuredGet('/gacha/cards?preview=1', user.token, 4);
  assert.equal(cards.body.cards.length, 7);
  assert.equal(cards.body.distinct, 6);
  assert.equal(Object.keys(cards.body.pictures).length, 6, 'Duplicate copies share preview metadata without losing a card');
  assert.ok(cards.body.cards.every(c => {
    const picture = cards.body.pictures[c.pictureId];
    return picture.id === c.pictureId && picture.preview && !picture.svg;
  }));
  assert.ok(!cards.readRows.some(row => row.svg || row.manifest), 'Owned-card previews must not read editor blobs');
  assert.ok((await api('GET', '/gacha/cards', null, user.token)).body.cards.every(c => c.picture === undefined), 'Legacy collection responses remain compatible');
  await db.prepare('UPDATE users SET gacha_points=350 WHERE id=?').run(user.id);
  const simultaneous = await Promise.all([0,1].map(() => api('POST', '/gacha/pull', { pictureIds: choices, preview: true }, user.token)));
  assert.deepEqual(simultaneous.map(r => r.status).sort(), [200,400]);
  assert.equal((await db.prepare('SELECT COUNT(*) AS c FROM user_cards WHERE user_id=?').get(user.id)).c, 14);
  assert.equal((await db.prepare('SELECT COUNT(*) AS c FROM gacha_pulls WHERE user_id=?').get(user.id)).c, 14);
  assert.equal((await db.prepare('SELECT gacha_points FROM users WHERE id=?').get(user.id)).gacha_points, 0);
});

test('HTTP compression preserves the complete picture payload and private/no-store headers', async () => {
  const user = await register('loadhttp1');
  const request = encoding => new Promise((resolve, reject) => {
    httpGet(`${base}/api/pictures/1`, { headers: { 'Accept-Encoding': encoding, Authorization: `Bearer ${user.token}` } }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, bytes: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
  const plain = await request('identity');
  assert.equal(plain.status, 200);
  for (const [encoding, decompress] of [['gzip',gunzipSync], ['br',brotliDecompressSync]]) {
    const compressed = await request(encoding);
    assert.equal(compressed.status, 200);
    assert.equal(compressed.headers['content-encoding'], encoding);
    assert.deepEqual(decompress(compressed.bytes), plain.bytes);
    assert.ok(compressed.bytes.length < plain.bytes.length, 'Compression should reduce the transmitted picture bytes');
    assert.match(compressed.headers['cache-control'], /private, no-store/);
    assert.match(compressed.headers.vary, /Authorization/);
    assert.match(compressed.headers.vary, /Accept-Encoding/);
  }
});

test('Exhibition pagination reads only the displayed artworks and preserves winners, live reactions, hidden entries and showcase flags', async () => {
  const Ex = await import('../src/services/exhibition.js');
  const owner = await register('loadexhibit1');
  const viewer = await register('loadexhibit2');
  const db = getDb();
  Ex.setClockForTest('2037-03-04T02:00:00.000Z');
  try {
    await Ex.wall(viewer.id); // Complete any older rounds before preparing this isolated display round.
    const current = Ex.schedule().current, previous = Ex.shiftKey(current, -1);
    await db.prepare('INSERT INTO exhibition_rounds (round_key,judged_at) VALUES (?,?)').run(previous, Ex.now().toISOString());
    const entries = [], artworks = [];
    for (let i = 0; i < 13; i++) {
      const art = await db.prepare("INSERT INTO artworks (user_id,picture_id,mode,status,data) VALUES (?,1,'free','completed',?) RETURNING id")
        .get(owner.id, JSON.stringify({ fills: {}, strokes: [], stickers: [], fixture: `Saved artwork ${i}` }));
      artworks.push(art.id);
      const entry = await db.prepare(`INSERT INTO exhibition_entries (artwork_id,user_id,round_key,board,status,award,hidden,final_reactions)
        VALUES (?,?,?,'free','approved',?,?,?) RETURNING id`)
        .get(art.id, owner.id, i < 2 ? previous : current, i < 2 ? 1 : 0, i === 12 ? 1 : 0, i < 2 ? JSON.stringify({ heart: 7 }) : null);
      entries.push(entry.id);
      await db.prepare("INSERT INTO exhibition_reactions (entry_id,user_id,emoji) VALUES (?,?,'star')").run(entry.id, viewer.id);
    }
    const first = await measuredGet('/exhibition/wall?offset=0&limit=5', viewer.token, 12);
    assert.equal(first.body.total, 12);
    assert.equal(first.body.entries.length, 5);
    assert.equal(first.readRows.filter(row => row.data && row.artwork_id).length, 5, 'The database must not return artwork blobs outside this page');
    assert.deepEqual(new Set(first.body.entries.slice(0,2).map(e => e.id)), new Set(entries.slice(0,2)));
    assert.ok(first.body.entries.slice(0,2).every(e => e.final && e.total === 7 && e.mine === 'star'));
    assert.deepEqual(first.body.entries.slice(2).map(e => e.id), entries.slice(9,12).reverse());
    assert.ok(first.body.entries.slice(2).every(e => !e.final && e.reactions.star === 1 && e.total === 1 && e.mine === 'star'));
    assert.ok(first.body.entries.every(e => e.data.fixture && first.body.pictures[e.pictureId].svg));
    const crossing = await api('GET', '/exhibition/wall?offset=1&limit=5', null, viewer.token);
    assert.deepEqual(crossing.body.entries.slice(0,4).map(e => e.id), first.body.entries.slice(1).map(e => e.id));
    const tail = await api('GET', '/exhibition/wall?offset=10&limit=5', null, viewer.token);
    assert.deepEqual(tail.body.entries.map(e => e.id), entries.slice(2,4).reverse());
    assert.ok(![...first.body.entries,...crossing.body.entries,...tail.body.entries].some(e => e.id === entries[12]));
    assert.deepEqual((await api('GET', '/exhibition/wall?offset=12&limit=5', null, viewer.token)).body.entries, []);
    const mine = await api('GET', '/exhibition/mine', null, owner.token);
    assert.equal(mine.body.entries[artworks[0]].reactions.heart, 7);
    assert.equal(mine.body.entries[artworks[2]].reactions.star, 1);
    assert.equal(mine.body.entries[artworks[2]].data, undefined);
    const showcase = await api('GET', `/exhibition/showcase/${owner.id}`, null, owner.token);
    assert.equal(showcase.body.entries.length, 12);
    assert.ok(showcase.body.entries.filter(e => entries.slice(0,2).includes(e.id)).every(e => !e.onShow));
    assert.ok(showcase.body.entries.filter(e => entries.slice(2,12).includes(e.id)).every(e => e.onShow));
    assert.equal((await api('GET', `/exhibition/showcase/${owner.id}`, null, viewer.token)).status, 403);
  } finally {
    Ex.setClockForTest(null);
  }
});

test('The admin library tree keeps every theme/object/picture and empty groups with bounded reads and unchanged admin access', async () => {
  const user = await register('loadadmin1');
  assert.equal((await api('GET', '/admin/tree', null, user.token)).status, 403);
  const db = getDb();
  await db.prepare("UPDATE users SET role='admin' WHERE id=?").run(user.id);
  const empty = await db.prepare("INSERT INTO themes (slug,name_vi,name_en,sort) VALUES ('load-empty','Trống','Empty',10000) RETURNING id").get();
  const group = await db.prepare("INSERT INTO themes (slug,name_vi,name_en,sort) VALUES ('load-empty-object','Nhóm trống','Empty group',10001) RETURNING id").get();
  await db.prepare("INSERT INTO objects (theme_id,slug,name_vi,name_en) VALUES (?,'empty-object','Trống','Empty')").run(group.id);
  const response = await measuredGet('/admin/tree', user.token, 4);
  assert.deepEqual(response.body.themes.find(t => t.id === empty.id).objects, []);
  assert.deepEqual(response.body.themes.find(t => t.id === group.id).objects[0].pictures, []);
  assert.equal(response.body.themes.flatMap(t => t.objects).length, (await db.prepare('SELECT COUNT(*) AS c FROM objects').get()).c);
  assert.equal(response.body.themes.flatMap(t => t.objects.flatMap(o => o.pictures)).length, (await db.prepare('SELECT COUNT(*) AS c FROM pictures').get()).c);
  assert.ok(!response.readRows.some(row => row.svg || row.manifest));
  const Picture = await import('../src/models/picture.js');
  const { syncThemeVisibility } = await import('../../database/seeds/seed.js');
  const before = await db.prepare('SELECT COUNT(*) AS c FROM artworks').get();
  assert.equal(await syncThemeVisibility({ themes: [{ slug:'load-empty',hidden:true }, { slug:'load-empty-object',hidden:false }] }), 1);
  assert.equal((await Picture.findTheme('load-empty')).active, 0);
  assert.equal((await Picture.findTheme('load-empty-object')).active, 1);
  assert.equal(await syncThemeVisibility({ themes: [{ slug:'load-empty',hidden:false }, { slug:'load-empty-object',hidden:false }] }), 1);
  assert.equal((await db.prepare('SELECT COUNT(*) AS c FROM artworks').get()).c, before.c);
});
