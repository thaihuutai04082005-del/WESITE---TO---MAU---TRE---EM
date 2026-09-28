// Nạp dữ liệu mẫu: kho tranh (từ assets-library/catalog.json), nhiệm vụ, vật phẩm, tài khoản admin.
// Chạy lại nhiều lần an toàn (upsert theo slug). Dùng: npm run seed
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { getDb, tx } from '../../backend/src/config/db.js';
import { env, REPO_ROOT } from '../../backend/src/config/env.js';
import { MISSIONS } from './missions.js';
import { ITEMS } from './items.js';

export function seedPictures(db = getDb()) {
  const lib = join(REPO_ROOT, 'assets-library');
  const catalogFile = join(lib, 'catalog.json');
  if (!existsSync(catalogFile)) throw new Error('Chưa có catalog.json — chạy "npm run gen:pictures" trước');
  const catalog = JSON.parse(readFileSync(catalogFile, 'utf8'));
  const upTheme = db.prepare(
    'INSERT INTO themes (slug, name_vi, name_en, sort) VALUES (?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET name_vi = excluded.name_vi, name_en = excluded.name_en, sort = excluded.sort RETURNING id',
  );
  const upObject = db.prepare(
    'INSERT INTO objects (theme_id, slug, name_vi, name_en, sort) VALUES (?, ?, ?, ?, ?) ON CONFLICT (theme_id, slug) DO UPDATE SET name_vi = excluded.name_vi, name_en = excluded.name_en, sort = excluded.sort RETURNING id',
  );
  const upPicture = db.prepare(
    `INSERT INTO pictures (object_id, slug, variant_slug, name_vi, name_en, variant_name_vi, variant_name_en, svg, manifest, animation, is_card, rarity, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (slug) DO UPDATE SET object_id = excluded.object_id, variant_slug = excluded.variant_slug, name_vi = excluded.name_vi,
       name_en = excluded.name_en, variant_name_vi = excluded.variant_name_vi, variant_name_en = excluded.variant_name_en,
       svg = excluded.svg, manifest = excluded.manifest, animation = excluded.animation, is_card = excluded.is_card,
       rarity = excluded.rarity, sort = excluded.sort`,
  );
  let count = 0;
  tx(() => {
    catalog.themes.forEach((t, ti) => {
      const themeId = upTheme.get(t.slug, t.name.vi, t.name.en, ti).id;
      t.objects.forEach((o, oi) => {
        const objectId = upObject.get(themeId, o.slug, o.name.vi, o.name.en, oi).id;
        o.pictures.forEach((p, pi) => {
          const svg = readFileSync(join(lib, p.file), 'utf8');
          const manifest = JSON.stringify({ palette: p.palette, regions: p.regions });
          upPicture.run(objectId, p.slug, p.variant, p.name.vi, p.name.en, p.variantName.vi, p.variantName.en, svg, manifest, p.animation, p.isCard ? 1 : 0, p.rarity, pi);
          count++;
        });
      });
    });
  });
  return count;
}

export function seedMissions(db = getDb()) {
  const up = db.prepare(
    `INSERT INTO missions (level, idx, type, target, param, difficulty, ruby, title_vi, title_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (level, idx) DO UPDATE SET type = excluded.type, target = excluded.target, param = excluded.param,
       difficulty = excluded.difficulty, ruby = excluded.ruby, title_vi = excluded.title_vi, title_en = excluded.title_en`,
  );
  tx(() => MISSIONS.forEach((m) => up.run(m.level, m.idx, m.type, m.target, m.param, m.difficulty, m.ruby, m.title_vi, m.title_en)));
  return MISSIONS.length;
}

export function seedItems(db = getDb()) {
  const up = db.prepare(
    `INSERT INTO items (type, slug, name_vi, name_en, price, limited, rank, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (slug) DO UPDATE SET type = excluded.type, name_vi = excluded.name_vi, name_en = excluded.name_en,
       price = excluded.price, limited = excluded.limited, rank = excluded.rank, sort = excluded.sort`,
  );
  tx(() => ITEMS.forEach((it, i) => up.run(it.type, it.slug, it.name_vi, it.name_en, it.price ?? null, it.limited || 0, it.rank || null, i)));
  return ITEMS.length;
}

export async function seedAdmin(db = getDb()) {
  if (!env.admin.password) return false;
  const hash = await bcrypt.hash(env.admin.password, 10);
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(env.admin.username);
  if (existing) {
    db.prepare("UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?").run(hash, existing.id);
  } else {
    db.prepare(
      "INSERT INTO users (username, password_hash, nickname, role, friend_code, avatar_frame) VALUES (?, ?, 'Quản trị viên', 'admin', ?, 'avatar-dong')",
    ).run(env.admin.username, hash, `ADM${Date.now().toString(36).toUpperCase().slice(-5)}`);
  }
  return true;
}

export async function seedAll() {
  const pictures = seedPictures();
  const missions = seedMissions();
  const items = seedItems();
  const admin = await seedAdmin();
  return { pictures, missions, items, admin };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await seedAll();
  console.log(`Seed xong: ${r.pictures} tranh, ${r.missions} nhiệm vụ, ${r.items} vật phẩm${r.admin ? ', đã tạo/cập nhật admin' : ' (bỏ qua admin — chưa đặt ADMIN_PASSWORD)'}.`);
}
