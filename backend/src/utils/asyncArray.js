// Sequential collection helpers for callbacks that query the database.
export async function asyncMap(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i++) out.push(await fn(items[i], i, items));
  return out;
}
export async function asyncForEach(items, fn) {
  await asyncMap(items, fn);
}
export async function asyncFilter(items, fn) {
  const out = [];
  for (let i = 0; i < items.length; i++) if (await fn(items[i], i, items)) out.push(items[i]);
  return out;
}
export async function asyncFind(items, fn) {
  for (let i = 0; i < items.length; i++) if (await fn(items[i], i, items)) return items[i];
}
export async function asyncSome(items, fn) {
  for (let i = 0; i < items.length; i++) if (await fn(items[i], i, items)) return true;
  return false;
}
export async function asyncEvery(items, fn) {
  for (let i = 0; i < items.length; i++) if (!(await fn(items[i], i, items))) return false;
  return true;
}
