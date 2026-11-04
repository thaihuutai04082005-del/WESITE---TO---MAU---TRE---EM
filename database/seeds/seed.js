import { asyncForEach } from '../../backend/src/utils/asyncArray.js';
// Nạp dữ liệu mẫu: kho tranh (từ assets-library/catalog.json), nhiệm vụ, vật phẩm, tài khoản admin.
// Chạy lại nhiều lần an toàn (upsert theo slug). Dùng: npm run seed
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { getDb, tx } from '../../backend/src/config/db.js';
import { env, REPO_ROOT } from '../../backend/src/config/env.js';
import { MISSIONS } from './missions.js';
import { ITEMS } from './items.js';
import { createHash } from 'node:crypto';
import { picturePreviewPaths } from '../../shared/picturePreview.mjs';

function libraryCatalog() {
  const catalog = JSON.parse(readFileSync(join(REPO_ROOT, 'assets-library', 'catalog.json'), 'utf8'));
  catalog.themes = catalog.themes.filter((t) => !t.hidden).map((t) => ({ ...t,
    objects: t.objects.map((o) => ({ ...o, pictures: o.pictures.filter((p) => !p.hidden) })).filter((o) => o.pictures.length),
  }));
  return catalog;
}
const assetHash = (svg, manifest) => createHash('sha256').update(svg).update('\0').update(manifest).digest('hex');

/** Delete only retired/hidden library entries, never VIP locks or visible cards. */
async function purgeRetiredPictures(db, catalog) {
  const retired = JSON.parse(readFileSync(join(REPO_ROOT, 'assets-library', 'retired-pictures.json'), 'utf8'));
  const keep = catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures.map((p) => p.slug)));
  const removed = await db.prepare(
    `SELECT p.id FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id
     WHERE p.slug NOT IN (${keep.map(() => '?').join(',')})
       AND (p.hidden = 1 OR t.active = 0 OR p.slug IN (${retired.pictures.map(() => '?').join(',')}))`,
  ).all(...keep, ...retired.pictures);
  await purgePictures(db, removed.map((p) => p.id));
  await db.prepare('DELETE FROM objects WHERE NOT EXISTS (SELECT 1 FROM pictures p WHERE p.object_id = objects.id)').run();
  await db.prepare(`DELETE FROM themes WHERE (active = 0 OR slug IN (${retired.themes.map(() => '?').join(',')}))
    AND NOT EXISTS (SELECT 1 FROM objects o WHERE o.theme_id = themes.id)`).run(...retired.themes);
  return removed.length;
}

export async function seedPictures(db = getDb()) {
  const lib = join(REPO_ROOT, 'assets-library');
  const catalogFile = join(lib, 'catalog.json');
  if (!existsSync(catalogFile)) throw new Error('Chưa có catalog.json — chạy "npm run gen:pictures" trước');
  const catalog = libraryCatalog();
  const upTheme = db.prepare(
    'INSERT INTO themes (slug, name_vi, name_en, sort, age_group, active) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET name_vi = excluded.name_vi, name_en = excluded.name_en, sort = excluded.sort, age_group = excluded.age_group, active = excluded.active RETURNING id',
  );
  const upObject = db.prepare(
    'INSERT INTO objects (theme_id, slug, name_vi, name_en, sort) VALUES (?, ?, ?, ?, ?) ON CONFLICT (theme_id, slug) DO UPDATE SET name_vi = excluded.name_vi, name_en = excluded.name_en, sort = excluded.sort RETURNING id',
  );
  const upPicture = db.prepare(
    `INSERT INTO pictures (object_id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, svg, manifest, animation, is_card, rarity, sort, theme_sort, hidden, preview, asset_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (slug) DO UPDATE SET object_id = excluded.object_id, variant_slug = excluded.variant_slug, name_vi = excluded.name_vi,
       name_en = excluded.name_en, variant_name_vi = excluded.variant_name_vi, variant_name_en = excluded.variant_name_en,
       svg = excluded.svg, manifest = excluded.manifest, animation = excluded.animation, is_card = excluded.is_card,
       rarity = excluded.rarity, sort = excluded.sort, theme_sort = excluded.theme_sort, hidden = excluded.hidden,
       preview = excluded.preview, asset_hash = excluded.asset_hash RETURNING id`,
  );
  let count = 0;
  const keep = new Set(catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures.map((p) => p.slug))));
  await tx(async () => {
    await purgeRetiredPictures(db, catalog);
    await asyncForEach(catalog.themes, async (t, ti) => {
      const themeId = (await upTheme.get(t.slug, t.name.vi, t.name.en, ti, t.age || '6-8', t.hidden ? 0 : 1)).id;
      await asyncForEach(t.objects, async (o, oi) => {
        const objectId = (await upObject.get(themeId, o.slug, o.name.vi, o.name.en, oi)).id;
        await asyncForEach(o.pictures, async (p, pi) => {
          const svg = readFileSync(join(lib, p.file), 'utf8');
          const manifest = JSON.stringify({ palette: p.palette, regions: p.regions });
          await upPicture.run(
            objectId,
            p.slug,
            p.variant,
            p.name.vi,
            p.name.en,
            p.variantName.vi,
            p.variantName.en,
            svg,
            manifest,
            p.animation,
            p.isCard ? 1 : 0,
            p.rarity,
            p.cardOrder ?? pi,
            p.themeSort ?? 1000,
            p.hidden ? 1 : 0,
            JSON.stringify(picturePreviewPaths({ slug: p.slug, svg }, p.regions)),
            assetHash(svg, manifest),
          );
          count++;
        });
      });
    });
    // Tranh / đối tượng của các chủ đề trong catalog nhưng không còn trong catalog (VD đổi biến thể) → xoá hẳn.
    const themeSlugs = catalog.themes.map((t) => t.slug);
    const stale = (
      await db
        .prepare(
          `SELECT p.id, p.slug FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN (${themeSlugs.map(() => '?').join(',')})`,
        )
        .all(...themeSlugs)
    )
      .filter((r) => !keep.has(r.slug))
      .map((r) => r.id);
    await purgePictures(db, stale);
    await db
      .prepare(
        `DELETE FROM objects WHERE theme_id IN (SELECT id FROM themes WHERE slug IN (${themeSlugs.map(() => '?').join(',')})) AND id NOT IN (SELECT object_id FROM pictures)`,
      )
      .run(...themeSlugs);
  });
  return count;
}

/** Xoá hẳn các tranh cùng dữ liệu gắn với chúng (tranh bé đã tô, thẻ, giao dịch, lịch sử bóc thẻ, phòng Đấu trường). */
export async function purgePictures(db, ids) {
  if (!ids.length) return;
  const q = ids.map(() => '?').join(',');
  await db
    .prepare(
      `DELETE FROM trades WHERE offer_card_id IN (SELECT id FROM user_cards WHERE picture_id IN (${q})) OR request_card_id IN (SELECT id FROM user_cards WHERE picture_id IN (${q}))`,
    )
    .run(...ids, ...ids);
  for (const table of ['user_cards', 'gacha_pulls', 'arena_rooms', 'artworks'])
    await db.prepare(`DELETE FROM ${table} WHERE picture_id IN (${q})`).run(...ids);
  await db.prepare(`DELETE FROM pictures WHERE id IN (${q})`).run(...ids);
}

/** Bộ tranh trong catalog khác dữ liệu đang có (thêm chủ đề / đổi biến thể) → nạp lại kho tranh cho khớp. */
export async function seedPicturesIfNeeded(db = getDb()) {
  const catalogFile = join(REPO_ROOT, 'assets-library', 'catalog.json');
  if (!existsSync(catalogFile)) return 0;
  const catalog = libraryCatalog();
  await tx(() => purgeRetiredPictures(db, catalog));
  const want = new Set(catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures.map((p) => p.slug))));
  const themeSlugs = catalog.themes.map((t) => t.slug);
  const rows = await db
    .prepare(
      `SELECT p.slug, p.asset_hash, p.preview, p.name_vi, p.name_en, o.sort AS osort, p.theme_sort, p.hidden FROM pictures p JOIN objects o ON o.id = p.object_id JOIN themes t ON t.id = o.theme_id WHERE t.slug IN (${themeSlugs.map(() => '?').join(',')})`,
    )
    .all(...themeSlugs);
  const sameSet = rows.length === want.size && rows.every((r) => want.has(r.slug));
  const lib = join(REPO_ROOT, 'assets-library');
  const pics = new Map(catalog.themes.flatMap((t) => t.objects.flatMap((o) => o.pictures.map((p) => [p.slug, p]))));
  const objectSort = new Map(catalog.themes.flatMap((t) => t.objects.flatMap((o, oi) => o.pictures.map((p) => [p.slug, oi]))));
  // Tranh vẽ lại hoặc đổi tên (cùng slug) cũng phải nạp lại.
  const same =
    sameSet &&
    rows.every((r) => {
      const p = pics.get(r.slug);
      // Đổi riêng màu vùng thì svg không đổi (vùng luôn trắng) → phải so cả manifest.
      // Đổi thứ tự các đối tượng trong chủ đề cũng phải nạp lại.
      return (
        r.osort === objectSort.get(r.slug) &&
        r.theme_sort === (p.themeSort ?? 1000) &&
        r.hidden === (p.hidden ? 1 : 0) &&
        r.name_vi === p.name.vi &&
        r.name_en === p.name.en &&
        r.preview &&
        r.asset_hash === assetHash(readFileSync(join(lib, p.file), 'utf8'), JSON.stringify({ palette: p.palette, regions: p.regions }))
      );
    });
  const n = same ? 0 : await seedPictures(db);
  await syncThemeVisibility(catalog, db);
  return n;
}

/** Cờ ẩn/hiện chủ đề trong catalog (hidden) phải khớp cột themes.active, kể cả khi tranh không đổi. */
export async function syncThemeVisibility(catalog, db = getDb()) {
  let changed = 0;
  for (const want of [0, 1]) {
    const slugs = catalog.themes.filter(t => (t.hidden ? 0 : 1) === want).map(t => t.slug);
    if (!slugs.length) continue;
    changed += Number((await db.prepare(`UPDATE themes SET active=?
      WHERE slug IN (${slugs.map(() => '?').join(',')}) AND active!=? RETURNING id`).run(want, ...slugs, want)).changes);
  }
  return changed;
}

export async function seedMissions(db = getDb()) {
  const up = db.prepare(
    `INSERT INTO missions (level, idx, type, target, param, difficulty, ruby, title_vi, title_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (level, idx) DO UPDATE SET type = excluded.type, target = excluded.target, param = excluded.param,
       difficulty = excluded.difficulty, ruby = excluded.ruby, title_vi = excluded.title_vi, title_en = excluded.title_en`,
  );
  await tx(
    async () =>
      await asyncForEach(
        MISSIONS,
        async (m) => await up.run(m.level, m.idx, m.type, m.target, m.param, m.difficulty, m.ruby, m.title_vi, m.title_en),
      ),
  );
  return MISSIONS.length;
}

export async function seedItems(db = getDb()) {
  const up = db.prepare(
    `INSERT INTO items (type, slug, name_vi, name_en, price, limited, rank, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (slug) DO UPDATE SET type = excluded.type, name_vi = excluded.name_vi, name_en = excluded.name_en,
       price = excluded.price, limited = excluded.limited, rank = excluded.rank, sort = excluded.sort`,
  );
  await tx(
    async () =>
      await asyncForEach(
        ITEMS,
        async (it, i) => await up.run(it.type, it.slug, it.name_vi, it.name_en, it.price ?? null, it.limited || 0, it.rank || null, i),
      ),
  );
  return ITEMS.length;
}

export async function seedAdmin(db = getDb()) {
  if (!env.admin.password) return false;
  const hash = await bcrypt.hash(env.admin.password, 10);
  const existing = await db.prepare('SELECT id FROM users WHERE username = ?').get(env.admin.username);
  if (existing) {
    await db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(hash, existing.id);
  } else {
    await db
      .prepare(
        "INSERT INTO users (username, password_hash, nickname, role, friend_code, avatar_frame) VALUES (?, ?, 'Quản trị viên', 'admin', ?, 'avatar-dong')",
      )
      .run(env.admin.username, hash, `ADM${Date.now().toString(36).toUpperCase().slice(-5)}`);
  }
  return true;
}

export async function seedAll() {
  const pictures = await seedPictures();
  const missions = await seedMissions();
  const items = await seedItems();
  const admin = await seedAdmin();
  return { pictures, missions, items, admin };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await seedAll();
  console.log(
    `Seed xong: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm${r.admin ? ', đã tạo/cập nhật admin' : ' (bỏ qua admin — chưa đặt ADMIN_PASSWORD)'}.`,
  );
}
