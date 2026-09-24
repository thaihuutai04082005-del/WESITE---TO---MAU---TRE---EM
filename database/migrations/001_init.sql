-- Lược đồ khởi tạo. SQLite (node:sqlite). Thời gian lưu dạng ISO-8601 UTC.

CREATE TABLE users (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  username         TEXT UNIQUE COLLATE NOCASE,
  password_hash    TEXT,
  google_sub       TEXT UNIQUE,
  google_email     TEXT,
  guardian_contact TEXT,               -- SĐT hoặc email phụ huynh đã xác minh OTP
  guardian_type    TEXT CHECK (guardian_type IN ('phone', 'email')),
  nickname         TEXT,
  avatar           TEXT NOT NULL DEFAULT 'meo',
  avatar_frame     TEXT,               -- slug khung avatar đang dùng
  brush_skin       TEXT,               -- slug skin cọ đang dùng
  language         TEXT NOT NULL DEFAULT 'vi',
  role             TEXT NOT NULL DEFAULT 'user',
  friend_code      TEXT NOT NULL UNIQUE,
  rank_points      INTEGER NOT NULL DEFAULT 0,
  gacha_points     INTEGER NOT NULL DEFAULT 0,
  ruby             INTEGER NOT NULL DEFAULT 0,
  level            INTEGER NOT NULL DEFAULT 1,
  level_baseline   TEXT NOT NULL DEFAULT '{}',
  login_streak     INTEGER NOT NULL DEFAULT 0,
  last_login_date  TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_users_guardian ON users (guardian_contact);

CREATE TABLE otp_codes (
  id          TEXT PRIMARY KEY,
  purpose     TEXT NOT NULL,           -- register | reset
  target      TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  payload     TEXT NOT NULL DEFAULT '{}',
  attempts    INTEGER NOT NULL DEFAULT 0,
  used        INTEGER NOT NULL DEFAULT 0,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE user_stats (
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  key     TEXT NOT NULL,
  value   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, key)
);

-- ---------- Nội dung tranh (3 tầng) ----------
CREATE TABLE themes (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT NOT NULL UNIQUE,
  name_vi  TEXT NOT NULL,
  name_en  TEXT NOT NULL,
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE objects (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER NOT NULL REFERENCES themes (id) ON DELETE CASCADE,
  slug     TEXT NOT NULL,
  name_vi  TEXT NOT NULL,
  name_en  TEXT NOT NULL,
  sort     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (theme_id, slug)
);

CREATE TABLE pictures (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  object_id        INTEGER NOT NULL REFERENCES objects (id) ON DELETE CASCADE,
  slug             TEXT NOT NULL UNIQUE,
  variant_slug     TEXT NOT NULL,
  name_vi          TEXT NOT NULL,
  name_en          TEXT NOT NULL,
  variant_name_vi  TEXT NOT NULL,
  variant_name_en  TEXT NOT NULL,
  svg              TEXT NOT NULL,
  manifest         TEXT NOT NULL,      -- JSON: { palette, regions[] }
  animation        TEXT NOT NULL DEFAULT 'bounce',
  is_card          INTEGER NOT NULL DEFAULT 0,
  rarity           TEXT CHECK (rarity IN ('S', 'A', 'B', 'C')),
  sort             INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_pictures_object ON pictures (object_id, is_card);

-- ---------- Tranh của bé ----------
CREATE TABLE artworks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  picture_id    INTEGER NOT NULL REFERENCES pictures (id),
  mode          TEXT NOT NULL CHECK (mode IN ('template', 'free', 'arena', 'collab')),
  data          TEXT NOT NULL DEFAULT '{"fills":{},"strokes":[],"stickers":[]}',
  thumbnail     TEXT,
  status        TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  counted       INTEGER NOT NULL DEFAULT 0,  -- đã tính 1 lượt tô hay chưa
  artwork_frame TEXT,
  warned_at     TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at  TEXT
);
CREATE INDEX idx_artworks_user ON artworks (user_id, status, updated_at);

CREATE TABLE usage_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  artwork_id INTEGER,
  used_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_usage_user ON usage_log (user_id, used_at);

-- ---------- Gói dịch vụ & thanh toán ----------
CREATE TABLE payments (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan         TEXT NOT NULL CHECK (plan IN ('month', 'year')),
  provider     TEXT NOT NULL CHECK (provider IN ('paypal', 'momo')),
  amount       REAL NOT NULL,
  currency     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  provider_ref TEXT,
  mock         INTEGER NOT NULL DEFAULT 0,
  raw          TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  paid_at      TEXT
);

CREATE TABLE subscriptions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan       TEXT NOT NULL CHECK (plan IN ('month', 'year')),
  starts_at  TEXT NOT NULL,
  ends_at    TEXT NOT NULL,
  payment_id TEXT REFERENCES payments (id)
);
CREATE INDEX idx_subs_user ON subscriptions (user_id, ends_at);

-- ---------- Level & nhiệm vụ ----------
CREATE TABLE missions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  level       INTEGER NOT NULL,
  idx         INTEGER NOT NULL,
  type        TEXT NOT NULL,
  target      INTEGER NOT NULL DEFAULT 1,
  param       TEXT,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ruby        INTEGER NOT NULL,
  title_vi    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  UNIQUE (level, idx)
);

CREATE TABLE user_missions (
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  mission_id   INTEGER NOT NULL REFERENCES missions (id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, mission_id)
);

-- ---------- Shop & vật phẩm ----------
CREATE TABLE items (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  type     TEXT NOT NULL CHECK (type IN ('brush_skin', 'artwork_frame', 'avatar_frame')),
  slug     TEXT NOT NULL UNIQUE,
  name_vi  TEXT NOT NULL,
  name_en  TEXT NOT NULL,
  price    INTEGER,            -- NULL = không bán (khung avatar theo Rank)
  limited  INTEGER NOT NULL DEFAULT 0,
  rank     TEXT,               -- khung avatar gắn với bậc Rank
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_items (
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  item_id     INTEGER NOT NULL REFERENCES items (id) ON DELETE CASCADE,
  source      TEXT NOT NULL,   -- shop | rank
  acquired_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, item_id)
);

-- ---------- Gacha & thẻ ----------
CREATE TABLE user_cards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  picture_id  INTEGER NOT NULL REFERENCES pictures (id),
  source      TEXT NOT NULL,   -- gacha | trade | gift
  obtained_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_user_cards_user ON user_cards (user_id);

CREATE TABLE gacha_pulls (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  picture_id INTEGER NOT NULL REFERENCES pictures (id),
  rarity     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ---------- Xã hội ----------
CREATE TABLE friendships (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (requester_id, addressee_id)
);

CREATE TABLE trades (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user       INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  to_user         INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  offer_card_id   INTEGER NOT NULL REFERENCES user_cards (id),
  request_card_id INTEGER REFERENCES user_cards (id),  -- NULL = tặng
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'failed')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resolved_at     TEXT
);
CREATE INDEX idx_trades_users ON trades (from_user, to_user, status);

-- ---------- Đấu trường ----------
CREATE TABLE arena_rooms (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  code         TEXT NOT NULL UNIQUE,
  type         TEXT NOT NULL CHECK (type IN ('random', 'private')),
  tier         TEXT,
  host_id      INTEGER REFERENCES users (id),
  picture_id   INTEGER REFERENCES pictures (id),
  status       TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  duration_sec INTEGER NOT NULL,
  week         TEXT,
  started_at   TEXT,
  ends_at      TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE arena_entries (
  room_id      INTEGER NOT NULL REFERENCES arena_rooms (id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  data         TEXT,
  thumbnail    TEXT,
  submitted_at TEXT,
  elapsed_ms   INTEGER,
  scores       TEXT,
  total        REAL,
  place        INTEGER,
  flagged      INTEGER NOT NULL DEFAULT 0,
  flag_reason  TEXT,
  reward       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (room_id, user_id)
);

-- ---------- Flipbook ----------
CREATE TABLE storybooks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  share_token TEXT UNIQUE,
  completed   INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE storybook_pages (
  storybook_id INTEGER NOT NULL REFERENCES storybooks (id) ON DELETE CASCADE,
  artwork_id   INTEGER NOT NULL REFERENCES artworks (id) ON DELETE CASCADE,
  position     INTEGER NOT NULL,
  caption      TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (storybook_id, position)
);

-- ---------- Thông báo ----------
CREATE TABLE notifications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  data       TEXT NOT NULL DEFAULT '{}',
  read       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_notifications_user ON notifications (user_id, read);
