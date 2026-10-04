// Tạo nội dung mã VietQR (chuẩn EMVCo / NAPAS 247) — app ngân hàng & MoMo quét được, tự điền số tiền + nội dung.
// Không phụ thuộc dịch vụ ngoài. Tham khảo: "Đặc tả kỹ thuật mã QR chuyển tiền nhanh NAPAS 247".

/** Mã BIN ngân hàng (NAPAS) theo mã viết tắt. */
export const BANK_BIN = {
  ACB: '970416', VCB: '970436', VIETCOMBANK: '970436', TCB: '970407', TECHCOMBANK: '970407', MB: '970422', MBBANK: '970422',
  BIDV: '970418', VTB: '970415', VIETINBANK: '970415', AGRIBANK: '970405', VPB: '970432', VPBANK: '970432', TPB: '970423',
  TPBANK: '970423', SACOMBANK: '970403', STB: '970403', VIB: '970441', SHB: '970443', HDB: '970437', HDBANK: '970437', OCB: '970448',
};

const tlv = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;

/** CRC-16/CCITT-FALSE (đa thức 0x1021, khởi tạo 0xFFFF). */
function crc16(str) {
  let crc = 0xffff;
  for (const ch of Buffer.from(str, 'utf8')) {
    crc ^= ch << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function vietQrPayload({ bin, accountNo, amount, content }) {
  const merchant = tlv('00', 'A000000727') + tlv('01', tlv('00', bin) + tlv('01', accountNo)) + tlv('02', 'QRIBFTTA');
  const body =
    tlv('00', '01') +
    tlv('01', '12') + // QR động (có số tiền)
    tlv('38', merchant) +
    tlv('53', '704') + // VND
    tlv('54', String(Math.round(amount))) +
    tlv('58', 'VN') +
    tlv('62', tlv('08', content)) +
    '6304';
  return body + crc16(body);
}
