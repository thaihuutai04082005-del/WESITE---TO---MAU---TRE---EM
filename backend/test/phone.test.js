import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactPhone, detectPhoneCountry, internationalPhone, nationalPhone, normalizePhone } from '../../shared/phone.mjs';
import { normalizeContact } from '../src/services/otp.js';

test('Vietnam numbers keep the legacy account lookup format', () => {
  for (const value of ['0912 345 678', '+84 912-345-678', '84912345678', '0084 912 345 678']) {
    assert.equal(detectPhoneCountry(value), 'VN');
    assert.equal(normalizeContact('phone', value), '0912345678');
  }
  assert.equal(normalizePhone(internationalPhone('912345678', 'VN')), '0912345678');
});

test('US-format numbers normalize to +1 across pasted and national formats', () => {
  for (const value of ['+1 (202) 555-0123', '1-202-555-0123', '(202) 555-0123', '001 202 555 0123']) {
    assert.equal(detectPhoneCountry(value), 'US');
    assert.equal(normalizeContact('phone', value), '+12025550123');
  }
  assert.equal(normalizePhone(internationalPhone('(202) 555-0123', 'US')), '+12025550123');
});

test('Pasted international numbers override the selected country', () => {
  assert.equal(internationalPhone('+1 (202) 555-0123', 'VN'), '+12025550123');
  assert.equal(internationalPhone('+84 912 345 678', 'US'), '+84912345678');
  assert.equal(internationalPhone('0084912345678', 'US'), '+84912345678');
  assert.equal(detectPhoneCountry('+1'), 'US');
  assert.equal(detectPhoneCountry('+84'), 'VN');
  assert.equal(detectPhoneCountry('912'), null);
  assert.equal(nationalPhone('+1 (202) 555-0123'), '2025550123');
  assert.equal(nationalPhone('+84 912 345 678'), '912345678');
  assert.equal(compactPhone(' (202) 555-0123 '), '2025550123');
});

test('Invalid numbers and unsupported international prefixes are rejected', () => {
  for (const value of ['', '+44 20 7946 0123', '+84', '+1', '+12021550123', '+10255550123', '+120255501234', '091234567', '+8491234567', '2025550123ext4', '++12025550123', '+1 202 555 0123<script>']) {
    assert.equal(normalizePhone(value), null, value);
    assert.throws(() => normalizeContact('phone', value), { code: 'invalid_phone' });
  }
  assert.equal(normalizeContact('email', ' Parent@Example.com '), 'parent@example.com');
});

test('SMS gateway receives a full +1 number and an English verification message', async () => {
  const { env } = await import('../src/config/env.js');
  const { sendCode } = await import('../src/services/messaging.js');
  const originalSms = env.sms;
  const originalFetch = globalThis.fetch;
  const requests = [];
  env.sms = { url: 'https://sms.example.test/send', apiKey: 'test', secretKey: 'test', brandname: 'TinyTints' };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://sms.example.test/send');
    requests.push(JSON.parse(options.body));
    return { ok: true };
  };
  try {
    assert.deepEqual(await sendCode({ type: 'phone', target: '+12025550123', code: '123456', purpose: 'register' }), { delivered: true });
    assert.equal(requests[0].Phone, '+12025550123');
    assert.match(requests[0].Content, /TinyTints verification code is 123456/);
    await sendCode({ type: 'phone', target: '+12025550123', code: '654321', purpose: 'reset' });
    assert.match(requests[1].Content, /password reset code is 654321/);
    await sendCode({ type: 'phone', target: '0912345678', code: '123456', purpose: 'register' });
    assert.equal(requests[2].Phone, '0912345678');
    assert.match(requests[2].Content, /Ma xac nhan/);
  } finally {
    env.sms = originalSms;
    globalThis.fetch = originalFetch;
  }
});
