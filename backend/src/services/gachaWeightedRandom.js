// Random có trọng số cho Gacha theo tỉ lệ S 5% / A 12% / B 34% / C 49% (Mục 9.4).
import { randomInt } from 'node:crypto';
import { GACHA_RATES } from '../config/constants.js';

/** rng() trả về số nguyên ngẫu nhiên trong [0, max). Mặc định dùng crypto để không đoán được. */
export function weightedPick(items, rng = (max) => randomInt(max)) {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let roll = rng(total);
  for (const it of items) {
    if (roll < it.weight) return it;
    roll -= it.weight;
  }
  return items[items.length - 1];
}

/**
 * Bóc 1 thẻ: chọn cấp độ hiếm theo tỉ lệ rồi chọn đều 1 tranh trong cấp đó.
 * poolByRarity: { S: [pictureId...], A: [...], ... }. Nếu cấp đó trống thì hạ dần cấp.
 */
export function pullCard(poolByRarity, rng = (max) => randomInt(max)) {
  const order = GACHA_RATES.map((r) => r.rarity);
  const picked = weightedPick(GACHA_RATES, rng).rarity;
  let idx = order.indexOf(picked);
  while (idx < order.length && !(poolByRarity[order[idx]]?.length > 0)) idx++;
  if (idx >= order.length) {
    idx = order.findIndex((r) => poolByRarity[r]?.length > 0);
    if (idx < 0) throw new Error('Kho thẻ đang trống');
  }
  const rarity = order[idx];
  const pool = poolByRarity[rarity];
  return { rarity, pictureId: pool[rng(pool.length)] };
}
