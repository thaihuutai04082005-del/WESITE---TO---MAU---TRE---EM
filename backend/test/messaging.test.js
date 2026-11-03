process.env.DB_FILE = ':memory:';
process.env.NODE_ENV = 'test';

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { env } from '../src/config/env.js';
import { getDb } from '../src/config/db.js';
import { sendCode } from '../src/services/messaging.js';
import { issueOtp, consumeOtp } from '../src/services/otp.js';

const originalFetch = globalThis.fetch;
let original;
beforeEach(() => {
  original = { brevo: env.brevo, twilio: env.twilio, smtp: env.smtp, sms: env.sms, isProd: env.isProd, exposeDevOtp: env.exposeDevOtp };
  env.brevo = {};
  env.twilio = {};
  env.smtp = {};
  env.sms = {};
  env.isProd = true;
  env.exposeDevOtp = false;
  getDb().exec('DELETE FROM otp_codes');
});
afterEach(() => {
  Object.assign(env, original);
  globalThis.fetch = originalFetch;
});

function useEmail() {
  env.brevo = { apiKey: 'test-api-key', senderEmail: 'sender@example.com', senderName: 'TinyTints' };
}

test('Brevo HTTPS email sends the actual OTP, which can be verified once without exposing it in the response', async () => {
  useEmail();
  let sent;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(options.headers['api-key'], 'test-api-key');
    assert.ok(options.signal instanceof AbortSignal);
    sent = JSON.parse(options.body);
    return Response.json({ messageId: '<test-message@example.com>' }, { status: 201 });
  };
  const otp = await issueOtp({ type: 'email', target: 'parent@example.com', purpose: 'register', payload: { language: 'en' } });
  assert.equal(otp.devCode, undefined);
  assert.equal(sent.sender.email, 'sender@example.com');
  assert.deepEqual(sent.to, [{ email: 'parent@example.com' }]);
  assert.match(sent.subject, /verification code/);
  const code = sent.textContent.match(/\b\d{6}\b/)[0];
  assert.equal((await consumeOtp(otp.otpId, code, 'register')).target, 'parent@example.com');
  await assert.rejects(async () => await consumeOtp(otp.otpId, code, 'register'), { code: 'otp_invalid' });
});

test('Vietnamese password reset email and provider rejection/malformed responses', async () => {
  useEmail();
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.match(body.subject, /Đặt lại mật khẩu/);
    assert.match(body.textContent, /123456/);
    return Response.json({ messageId: '<test-message@example.com>' });
  };
  assert.deepEqual(await sendCode({ type: 'email', target: 'parent@example.com', purpose: 'reset', code: '123456', language: 'vi' }), {
    delivered: true,
  });
  for (const response of [
    Response.json({ message: 'rejected' }, { status: 401 }),
    Response.json({}),
    new Response('{bad', { headers: { 'Content-Type': 'application/json' } }),
  ]) {
    globalThis.fetch = async () => response;
    await assert.rejects(issueOtp({ type: 'email', target: 'parent@example.com', purpose: 'reset' }), {
      status: 503,
      code: 'otp_delivery_unavailable',
    });
    assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM otp_codes').get()).n, 0);
  }
});

test('Twilio uses the international recipient number and Messaging Service for Vietnam and US', async () => {
  const accountSid = 'AC' + 'a'.repeat(32);
  env.twilio = { accountSid, authToken: 'test-token', messagingServiceSid: 'MG' + 'b'.repeat(32), from: '+12025550100' };
  const sent = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`);
    assert.equal(options.headers.Authorization, `Basic ${Buffer.from(accountSid + ':test-token').toString('base64')}`);
    const form = new URLSearchParams(options.body);
    assert.equal(form.get('MessagingServiceSid'), env.twilio.messagingServiceSid);
    assert.equal(form.get('From'), null);
    sent.push(form);
    return Response.json({ sid: 'SM' + 'c'.repeat(32), status: 'queued', error_code: null }, { status: 201 });
  };
  await sendCode({ type: 'phone', target: '0912345678', purpose: 'register', code: '123456' });
  await sendCode({ type: 'phone', target: '+12025550123', purpose: 'reset', code: '654321' });
  assert.equal(sent[0].get('To'), '+84912345678');
  assert.equal(sent[1].get('To'), '+12025550123');
  assert.match(sent[1].get('Body'), /password reset code is 654321/);
});

test('Twilio sender-number option and API-level failures never produce fake success', async () => {
  env.twilio = { accountSid: 'AC' + 'a'.repeat(32), authToken: 'test-token', from: '+12025550100' };
  globalThis.fetch = async (_url, options) => {
    assert.equal(new URLSearchParams(options.body).get('From'), '+12025550100');
    return Response.json({ sid: 'SM' + 'd'.repeat(32), status: 'queued' }, { status: 201 });
  };
  assert.deepEqual(await sendCode({ type: 'phone', target: '+12025550123', purpose: 'register', code: '123456' }), { delivered: true });
  for (const response of [
    Response.json({ code: 21608 }, { status: 400 }),
    Response.json({ sid: 'SM' + 'd'.repeat(32), status: 'failed', error_code: 30007 }),
  ]) {
    globalThis.fetch = async () => response;
    await assert.rejects(issueOtp({ type: 'phone', target: '+12025550123', purpose: 'register' }), { code: 'otp_delivery_unavailable' });
    assert.equal((await getDb().prepare('SELECT COUNT(*) AS n FROM otp_codes').get()).n, 0);
  }
});

test('Partial credentials fail before making a request; no fallback to simulation', async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error('Unexpected network request');
  };
  env.brevo = { apiKey: 'test-key' };
  await assert.rejects(issueOtp({ type: 'email', target: 'parent@example.com', purpose: 'register' }), { code: 'otp_delivery_unavailable' });
  env.twilio = { accountSid: 'AC' + 'a'.repeat(32) };
  await assert.rejects(issueOtp({ type: 'phone', target: '+12025550123', purpose: 'register' }), { code: 'otp_delivery_unavailable' });
  assert.equal(called, false);
});

test('eSMS HTTP 200 with provider error code is not a successful SMS', async () => {
  env.sms = { url: 'https://sms.example.test' };
  globalThis.fetch = async () => Response.json({ CodeResult: '104', ErrorMessage: 'test rejection' });
  await assert.rejects(issueOtp({ type: 'phone', target: '0912345678', purpose: 'register' }), { code: 'otp_delivery_unavailable' });
});
