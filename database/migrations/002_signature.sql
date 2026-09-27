-- Chữ ký mặc định của bé (JSON: { name, style, hand? }). Chữ ký đã đặt lên tranh lưu trong artworks.data.signature.
ALTER TABLE users ADD COLUMN signature TEXT;
