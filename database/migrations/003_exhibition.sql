-- Hội trường triển lãm (Đợt 2 — docs/ke-hoach-chu-ky-trien-lam.md, Phần 2).
-- Mỗi vòng = 1 tuần, khoá theo ngày thứ Hai (giờ VN) của tuần trưng bày: round_key = 'YYYY-MM-DD'.
CREATE TABLE exhibition_entries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id      INTEGER NOT NULL REFERENCES artworks (id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  round_key       TEXT NOT NULL,
  board           TEXT NOT NULL CHECK (board IN ('S', 'A', 'B', 'free')),
  status          TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn', 'removed')),
  auto_approved   INTEGER NOT NULL DEFAULT 0,
  reject_rule     INTEGER,                 -- số điều nội quy bị vi phạm (1–8)
  hidden          INTEGER NOT NULL DEFAULT 0, -- tạm ẩn vì bị báo nhiều, chờ admin xem
  reports         INTEGER NOT NULL DEFAULT 0,
  award           INTEGER NOT NULL DEFAULT 0, -- 1 = "Tranh được yêu thích nhất bảng … tuần …"
  final_reactions TEXT,                    -- bảng cảm xúc chốt lúc 20:00 Chủ nhật (thành tích)
  notified_count  INTEGER NOT NULL DEFAULT 0,
  notified_date   TEXT,
  submitted_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  reviewed_at     TEXT,
  reviewed_by     INTEGER
);
-- Mỗi tranh chỉ đi triển lãm 1 lần (bị loại / tự rút thì gửi lại được).
CREATE UNIQUE INDEX idx_exhibit_artwork_once ON exhibition_entries (artwork_id) WHERE status IN ('pending', 'approved', 'removed');
CREATE INDEX idx_exhibit_round ON exhibition_entries (round_key, board, status);
CREATE INDEX idx_exhibit_user ON exhibition_entries (user_id, submitted_at);

CREATE TABLE exhibition_reactions (
  entry_id   INTEGER NOT NULL REFERENCES exhibition_entries (id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  emoji      TEXT NOT NULL CHECK (emoji IN ('heart', 'cheer', 'clap', 'love', 'star')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (entry_id, user_id)
);

CREATE TABLE exhibition_reports (
  entry_id   INTEGER NOT NULL REFERENCES exhibition_entries (id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (entry_id, user_id)
);

CREATE TABLE exhibition_rounds (
  round_key  TEXT PRIMARY KEY,
  judged_at  TEXT NOT NULL
);
