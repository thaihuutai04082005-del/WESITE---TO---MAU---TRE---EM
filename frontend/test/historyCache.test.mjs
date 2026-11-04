import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { configureApi } from '../src/services/api.js';
import { historyPath, historySnapshot, loadHistoryItems, invalidateHistory, acquireHistoryThumbnail, clearHistoryCache } from '../src/lib/historyCache.js';
const originalFetch=globalThis.fetch, clock=Date.now;
afterEach(() => { clearHistoryCache(); globalThis.fetch=originalFetch; Date.now=clock; configureApi({getToken:()=>null,unauthorized(){}}); });

test('History display snapshots retain images during refresh but never cross accounts, filters, logout or expiry', async () => {
  let token='one',calls=0,now=1000;
  Date.now=()=>now;
  configureApi({getToken:()=>token,unauthorized(){}});
  globalThis.fetch=async()=>{calls++;return Response.json({artworks:[{id:calls,hasThumbnail:true}]});};
  assert.equal(historyPath('completed',true),'/artworks?progress=1&thumbnails=0&initialThumbnails=4&status=completed');
  assert.equal(historySnapshot(token,'all',true),null);
  assert.deepEqual(await loadHistoryItems(token,'all',true),[{id:1,hasThumbnail:true}]);
  assert.deepEqual(historySnapshot(token,'all',true),[{id:1,hasThumbnail:true}]);
  assert.equal(historySnapshot(token,'completed',true),null);
  await loadHistoryItems(token,'all',true);
  assert.equal(calls,2,'A new visit always reads fresh metadata');
  now+=30001;assert.equal(historySnapshot(token,'all',true),null);
  await loadHistoryItems(token,'all',true);invalidateHistory();
  assert.equal(historySnapshot(token,'all',true),null);
  await loadHistoryItems(token,'all',true);token='two';
  assert.equal(historySnapshot(token,'all',true),null);
  clearHistoryCache();assert.equal(historySnapshot('one','all',true),null);
});

test('Visible thumbnails share one request, limit concurrency, and refresh for a changed artwork version', async () => {
  configureApi({getToken:()=>'one',unauthorized(){}});
  const pending=[];
  globalThis.fetch=(url,options)=>new Promise(resolve=>pending.push({url,options,resolve}));
  const leases=Array.from({length:6},(_,i)=>acquireHistoryThumbnail('one',i+1,'v1'));
  const duplicate=acquireHistoryThumbnail('one',1,'v1');
  assert.equal(duplicate.promise,leases[0].promise);
  assert.equal(pending.length,4);
  for (let i=0;i<6;i++) {
    while(!pending[i]) await new Promise(resolve=>setImmediate(resolve));
    assert.equal(pending[i].options.headers.Authorization,'Bearer one');
    pending[i].resolve(new Response(new Blob(['png'],{type:'image/png'})));
  }
  const urls=await Promise.all(leases.map(lease=>lease.promise));
  assert.equal(await duplicate.promise,urls[0]);
  const cached=acquireHistoryThumbnail('one',1,'v1');assert.equal(await cached.promise,urls[0]);
  assert.equal(pending.length,6);
  const changed=acquireHistoryThumbnail('one',1,'v2');
  assert.equal(pending.length,7);pending[6].resolve(new Response(new Blob(['png2'],{type:'image/png'})));
  assert.notEqual(await changed.promise,urls[0]);
  for(const lease of [...leases,duplicate,cached,changed]){lease.release();lease.release();}
});

test('Logout discards delayed thumbnails instead of assigning old-account images to a new account', async () => {
  let token='one',finish;
  configureApi({getToken:()=>token,unauthorized(){}});
  globalThis.fetch=()=>new Promise(resolve=>{finish=resolve;});
  const old=acquireHistoryThumbnail(token,1,'v1');
  clearHistoryCache();token='two';
  finish(new Response(new Blob(['private png'],{type:'image/png'})));
  await assert.rejects(old.promise,/account_changed/);
  old.release();
});
