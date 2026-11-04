-- Indexes only; ownership, RLS and existing data are unchanged.
CREATE INDEX IF NOT EXISTS idx_usage_artwork_time ON usage_log (artwork_id, used_at);
CREATE INDEX IF NOT EXISTS idx_trades_pending_offer ON trades (status, offer_card_id);
CREATE INDEX IF NOT EXISTS idx_trades_pending_request ON trades (status, request_card_id);
CREATE INDEX IF NOT EXISTS idx_trades_recipient ON trades (to_user, id);
CREATE INDEX IF NOT EXISTS idx_friendships_recipient ON friendships (addressee_id, created_at);
