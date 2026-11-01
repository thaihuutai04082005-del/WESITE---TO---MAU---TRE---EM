import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreEntry, scoreRoom, coverageScore, harmonyScore, diversityScore, sanitizeArtworkData, regionAt,
} from '../src/services/scoringEngine.js';

// Tranh giả lập: nền 100×100, một hình vuông 40×40 ở giữa (vẽ sau → nằm trên).
const sq = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const manifest = {
  regions: [
    { id: 'nen', color: '#BDE6FF', area: 8400, bbox: [0, 0, 100, 100], poly: sq(0, 0, 100, 100) },
    { id: 'hop', color: '#E74C3C', area: 1600, bbox: [30, 30, 70, 70], poly: sq(30, 30, 70, 70) },
  ],
};

test('regionAt chọn vùng trên cùng', () => {
  assert.equal(regionAt(manifest.regions, 50, 50), 1);
  assert.equal(regionAt(manifest.regions, 10, 10), 0);
  assert.equal(regionAt(manifest.regions, 150, 150), -1);
});

test('Không còn tiêu chí lem: tô tay khóa vùng, bảng điểm chỉ có 5 tiêu chí và tổng trọng số = 1', async () => {
  const { RUBRIC } = await import('../src/config/constants.js');
  assert.deepEqual(Object.keys(RUBRIC).sort(), ['coverage', 'creativity', 'diversity', 'harmony', 'time']);
  assert.ok(Math.abs(Object.values(RUBRIC).reduce((a, b) => a + b, 0) - 1) < 1e-9);
  const r = scoreEntry(manifest, { fills: { nen: '#00FF00', hop: '#FF0000' }, strokes: [] });
  assert.equal(r.scores.accuracy, undefined);
});

test('sanitizeArtworkData giữ kiểu nét, họa tiết và vùng khóa hợp lệ; bỏ vùng lạ', () => {
  const clean = sanitizeArtworkData(manifest, {
    strokes: [
      { tool: 'brush', kind: 'pattern', pattern: 'hearts', region: 'hop', color: '#FF8FB3', size: 10, points: [[40, 50], [60, 50]] },
      { tool: 'brush', kind: 'glitter', region: 'khong-co', color: '#FFD700', size: 10, points: [[40, 50]] },
      { tool: 'brush', kind: 'laghe', pattern: 'x', color: '#000000', size: 10, points: [[1, 1]] },
    ],
  }).strokes;
  assert.equal(clean[0].kind, 'pattern');
  assert.equal(clean[0].pattern, 'hearts');
  assert.equal(clean[0].region, 'hop');
  assert.equal(clean[1].kind, 'glitter');
  assert.equal(clean[1].region, undefined);
  assert.equal(clean[2].kind, undefined);
  assert.equal(clean[2].pattern, undefined);
});

test('Độ phủ theo diện tích', () => {
  assert.equal(coverageScore(manifest, { hop: '#FF0000' }), 0.16);
  assert.equal(coverageScore(manifest, { hop: '#FF0000', nen: '#00FF00' }), 1);
});

test('Phối màu: bổ túc hài hoà hơn cặp màu chỏi', () => {
  const good = harmonyScore(manifest, { nen: '#2B9BF4', hop: '#FF8A65' }); // xanh – cam
  const bad = harmonyScore(manifest, { nen: '#FF0000', hop: '#00FF00' }); // đỏ – xanh lá chói ~120°? vẫn là bộ ba
  const clash = harmonyScore(manifest, { nen: '#FF0000', hop: '#FFFF00' }); // đỏ – vàng chói cách 60°
  assert.ok(good > clash, `${good} > ${clash}`);
  assert.ok(bad >= 0 && bad <= 1);
});

test('Đa dạng sắc độ tăng theo số nhóm màu', () => {
  assert.equal(diversityScore({ a: '#FF0000' }), 0);
  assert.equal(diversityScore({ a: '#FF0000', b: '#00AA00', c: '#0000FF', d: '#FFFF00', e: '#FF00FF', f: '#00FFFF' }), 1);
});

test('Sáng tạo: màu khác biệt so với cả phòng được điểm cao hơn', () => {
  const entries = [
    { userId: 1, data: { fills: { nen: '#BDE6FF', hop: '#E74C3C' }, strokes: [] }, elapsedMs: 60000 },
    { userId: 2, data: { fills: { nen: '#BDE6FF', hop: '#E74C3C' }, strokes: [] }, elapsedMs: 60000 },
    { userId: 3, data: { fills: { nen: '#2E1A47', hop: '#4CD787' }, strokes: [] }, elapsedMs: 60000 },
  ];
  const res = scoreRoom(manifest, entries, 600000);
  const c = Object.fromEntries(res.map((r) => [r.userId, r.scores.creativity]));
  assert.ok(c[3] > c[1], JSON.stringify(c));
});

test('Xếp hạng: bài bị gắn cờ gian lận không được xếp hạng', () => {
  const entries = [
    { userId: 1, data: { fills: { nen: '#2E1A47', hop: '#4CD787' }, strokes: [] }, elapsedMs: 10, flagged: true },
    { userId: 2, data: { fills: { nen: '#BDE6FF' }, strokes: [] }, elapsedMs: 60000 },
  ];
  const res = scoreRoom(manifest, entries, 600000);
  assert.equal(res.find((r) => r.userId === 1).place, undefined);
  assert.equal(res.find((r) => r.userId === 2).place, 1);
});

test('Tổng điểm trong thang 0–100', () => {
  const r = scoreEntry(manifest, { fills: { nen: '#2B9BF4', hop: '#FF8A65' }, strokes: [] }, { elapsedMs: 120000, durationMs: 600000 });
  assert.ok(r.total > 0 && r.total <= 100, String(r.total));
});

test('sanitizeArtworkData loại vùng lạ và màu sai định dạng', () => {
  const d = sanitizeArtworkData(manifest, { fills: { nen: '#abcdef', hack: '#000000', hop: 'red' }, strokes: [{ points: [[1, 2], ['x', 3]] }] });
  assert.deepEqual(d.fills, { nen: '#ABCDEF' });
  assert.deepEqual(d.strokes[0].points, [[1, 2]]);
});
