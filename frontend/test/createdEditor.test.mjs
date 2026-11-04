import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { rememberCreatedEditor, takeCreatedEditor, clearCreatedEditor } from '../src/lib/createdEditor.js';

const response = () => ({ accessError:null, artwork:{id:7,pictureId:3,data:{fills:{}}}, picture:{id:3,svg:'<svg/>',regions:[]} });
const clock = Date.now;
afterEach(() => { clearCreatedEditor(); Date.now = clock; });

test('A newly created editor is handed to its immediate route only once; revisiting requires the API', () => {
  const created = response();
  rememberCreatedEditor(created, 'owner-token');
  assert.equal(takeCreatedEditor('7', 'owner-token'), created);
  assert.equal(takeCreatedEditor(7, 'owner-token'), null);
});

test('An account or destination change cannot read the previous creation response', () => {
  rememberCreatedEditor(response(), 'account-one');
  assert.equal(takeCreatedEditor(7, 'account-two'), null);
  assert.equal(takeCreatedEditor(7, 'account-one'), null);
  rememberCreatedEditor(response(), 'account-one');
  assert.equal(takeCreatedEditor(8, 'account-one'), null);
  assert.equal(takeCreatedEditor(7, 'account-one'), null);
});

test('Late navigation and logout discard the initial response', () => {
  let now = 1000; Date.now = () => now;
  rememberCreatedEditor(response(), 'owner-token');
  now += 15000;
  assert.equal(takeCreatedEditor(7, 'owner-token'), null);
  rememberCreatedEditor({...response(),plan:{vip:true,endsAt:new Date(now+100).toISOString()}}, 'owner-token');
  now += 101;
  assert.equal(takeCreatedEditor(7, 'owner-token'), null, 'A VIP boundary during navigation needs a fresh server read');
  rememberCreatedEditor(response(), 'owner-token');
  clearCreatedEditor();
  assert.equal(takeCreatedEditor(7, 'owner-token'), null);
});

test('Old API responses and mismatched, denied or incomplete editor data use the normal API path', () => {
  const created = response();
  for (const invalid of [{artwork:created.artwork}, {...created,accessError:'theme_vip_required'},
    {...created,picture:{...created.picture,id:4}}, {...created,picture:{id:3,regions:[]}}]) {
    rememberCreatedEditor(invalid, 'owner-token');
    assert.equal(takeCreatedEditor(7, 'owner-token'), null);
  }
});
