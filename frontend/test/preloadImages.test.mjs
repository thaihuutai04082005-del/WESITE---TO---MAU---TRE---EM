import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('Transition warmup shares an idle queue, limits parallel work, deduplicates and retries failures', async () => {
  const source = (await readFile(new URL('../src/lib/preloadImages.js', import.meta.url), 'utf8')).replace(/export function/g, 'function');
  const callbacks = [];
  const images = [];
  class Image {
    constructor() { images.push(this); }
    decode() { return Promise.resolve(); }
  }
  const context = vm.createContext({ Image, window: { requestIdleCallback: cb => callbacks.push(cb) }, setTimeout: cb => callbacks.push(cb) });
  vm.runInContext(source, context);
  const flush = async () => { for(let i=0;i<8;i++) await Promise.resolve(); };
  context.preloadImages(['a', 'b', 'c']);
  context.preloadImages(['b', 'd']);
  assert.equal(images.length, 0, 'Warmup waits for idle time');
  assert.equal(callbacks.length, 1, 'Effects share one scheduled batch');
  callbacks.shift()();
  assert.deepEqual(images.map(i => i.src), ['a','b']);
  assert.ok(images.every(i => i.fetchPriority === 'low' && i.decoding === 'async'));
  images[0].onload(); await flush();
  callbacks.shift()();
  assert.deepEqual(images.map(i => i.src), ['a','b','c']);
  images[1].onerror(); await flush();
  callbacks.shift()();
  assert.deepEqual(images.map(i => i.src), ['a','b','c','d']);
  images[2].onload(); images[3].onload(); await flush();
  context.preloadImages(['a','b','c','d']);
  callbacks.shift()();
  assert.deepEqual(images.map(i => i.src), ['a','b','c','d','b'], 'Only the failed image is retried');
  images[4].onload(); await flush();
});

test('Interactive data loading pauses background warmup, then every queued image still loads and decodes', async () => {
  const source = (await readFile(new URL('../src/lib/preloadImages.js', import.meta.url), 'utf8')).replace(/export function/g, 'function');
  const idle = [], timers = [], images = [];
  let now = 0, decoded = 0;
  class Image {
    constructor() { images.push(this); }
    decode() { decoded++; return Promise.resolve(); }
  }
  const context = vm.createContext({ Image, Date:{now:()=>now},
    window:{requestIdleCallback:fn=>idle.push(fn)}, setTimeout:(fn,ms)=>timers.push({fn,ms}) });
  vm.runInContext(source, context);
  const flush = async () => { for (let i=0;i<8;i++) await Promise.resolve(); };
  context.preloadImages(['rainbow','together','arena']);
  const first = context.pauseImagePreloads(), second = context.pauseImagePreloads();
  idle.shift()();
  assert.equal(images.length,0,'A previously queued idle callback must yield to an active request');
  first(); first();
  assert.equal(timers.length,0,'One completed request cannot resume warmup while another is pending');
  second();
  assert.equal(images.length,0,'Visible images get a quiet period after data arrives');
  assert.equal(timers[0].ms,500);
  now += timers[0].ms; timers.shift().fn(); idle.shift()();
  assert.deepEqual(images.map(i=>i.src),['rainbow','together']);
  images[0].onload(); await flush(); idle.shift()();
  images[1].onload(); images[2].onload(); await flush();
  assert.deepEqual(images.map(i=>i.src),['rainbow','together','arena']);
  assert.equal(decoded,3,'Pausing changes scheduling, not effect resources or their decoding');
});
