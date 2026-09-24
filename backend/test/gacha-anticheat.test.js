import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weightedPick, pullCard } from '../src/services/gachaWeightedRandom.js';
import { GACHA_RATES } from '../src/config/constants.js';
import { checkEntry } from '../src/services/antiCheat.js';
import { slotStatus, parseSlots } from '../src/services/arena.js';

test('weightedPick bám đúng ranh giới trọng số (S5 A12 B34 C49)', () => {
  const at = (n) => weightedPick(GACHA_RATES, () => n).rarity;
  assert.equal(at(0), 'S');
  assert.equal(at(4), 'S');
  assert.equal(at(5), 'A');
  assert.equal(at(16), 'A');
  assert.equal(at(17), 'B');
  assert.equal(at(50), 'B');
  assert.equal(at(51), 'C');
  assert.equal(at(99), 'C');
});

test('Tỉ lệ thực nghiệm xấp xỉ tỉ lệ công bố', () => {
  const pool = { S: [1], A: [2], B: [3], C: [4] };
  const n = 20000;
  const count = { S: 0, A: 0, B: 0, C: 0 };
  for (let i = 0; i < n; i++) count[pullCard(pool).rarity]++;
  for (const { rarity, weight } of GACHA_RATES) {
    assert.ok(Math.abs(count[rarity] / n - weight / 100) < 0.015, `${rarity}: ${count[rarity] / n}`);
  }
});

test('Cấp hiếm trống thì hạ xuống cấp kế tiếp', () => {
  const r = pullCard({ S: [], A: [], B: [], C: [9] }, () => 0);
  assert.deepEqual(r, { rarity: 'C', pictureId: 9 });
});

test('Chống gian lận: hoàn thành quá nhanh bị gắn cờ', () => {
  assert.equal(checkEntry({ elapsedMs: 5000, filledRegions: 30, coverage: 1 }).reason, 'too_fast');
  assert.equal(checkEntry({ elapsedMs: 90000, filledRegions: 30, coverage: 1 }).flagged, false);
  assert.equal(checkEntry({ elapsedMs: 5000, filledRegions: 3, coverage: 0.2 }).flagged, false);
});

test('Chống gian lận: thao tác dồn dập bất thường bị gắn cờ', () => {
  const burst = Array.from({ length: 30 }, (_, i) => 1000 + i * 10);
  assert.equal(checkEntry({ elapsedMs: 120000, filledRegions: 20, coverage: 0.5, actionTimes: burst }).reason, 'action_rate');
});

test('Khung giờ Đấu trường', () => {
  assert.deepEqual(parseSlots('08:00-11:30'), [{ from: 480, to: 690 }]);
  // 02:00 UTC = 09:00 giờ VN → trong khung 08–11:30
  assert.equal(slotStatus(new Date('2026-01-01T02:00:00Z'), '08:00-11:30').open, true);
  const closed = slotStatus(new Date('2026-01-01T06:00:00Z'), '08:00-11:30');
  assert.equal(closed.open, false);
  assert.equal(closed.nextOpen, '2026-01-02T01:00:00.000Z');
  assert.equal(slotStatus(new Date(), '').open, true);
});
