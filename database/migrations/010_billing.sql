-- Thanh toán thật: PayPal tự gia hạn (thuê bao) + chuyển khoản VietQR (ACB, xác nhận qua SePay).
-- Dựng lại bảng payments để thêm provider 'bank' và các cột tham chiếu.
-- @foreign_keys off

CREATE TABLE payments_new (
  id           TEXT PRIMARY KEY,
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan         TEXT NOT NULL CHECK (plan IN ('month', 'year')),
  provider     TEXT NOT NULL CHECK (provider IN ('paypal', 'momo', 'bank')),
  amount       REAL NOT NULL,
  currency     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  provider_ref TEXT,
  mock         INTEGER NOT NULL DEFAULT 0,
  raw          TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  paid_at      TEXT,
  -- Mã nội dung chuyển khoản (BTMxxxxxx) cho thanh toán QR.
  code         TEXT UNIQUE,
  -- Mã giao dịch phía cổng (SePay id, hoặc "<PayPal subscription>#<kỳ>") — chống ghi nhận trùng.
  txn_ref      TEXT UNIQUE
);
INSERT INTO payments_new (id, user_id, plan, provider, amount, currency, status, provider_ref, mock, raw, created_at, paid_at)
  SELECT id, user_id, plan, provider, amount, currency, status, provider_ref, mock, raw, created_at, paid_at FROM payments;
DROP TABLE payments;
ALTER TABLE payments_new RENAME TO payments;
CREATE INDEX idx_payments_user ON payments (user_id, created_at);

-- Thuê bao PayPal tự gia hạn (mỗi dòng = 1 subscription bên PayPal).
CREATE TABLE recurring (
  id           TEXT PRIMARY KEY,               -- PayPal subscription id (I-XXXX)
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  plan         TEXT NOT NULL CHECK (plan IN ('month', 'year')),
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | active | cancelled | suspended | expired
  payment_id   TEXT,                           -- giao dịch tạo ra thuê bao
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  cancelled_at TEXT
);
CREATE INDEX idx_recurring_user ON recurring (user_id, status);

-- Đã nhắc gia hạn cho kỳ này chưa.
ALTER TABLE subscriptions ADD COLUMN reminded_at TEXT;

-- Khoá/giá trị dùng chung (vd. id gói PayPal tự tạo).
CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
