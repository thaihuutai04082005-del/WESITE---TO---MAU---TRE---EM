// Shared by the phone input and OTP validation. Keep Vietnam's existing storage
// format so accounts created before international numbers still recover normally.
export const PHONE_COUNTRIES = { VN: '+84', US: '+1' };

export function compactPhone(raw) {
  return String(raw || '').trim().replace(/[\s().-]/g, '');
}

export function detectPhoneCountry(raw) {
  const p = compactPhone(raw);
  if (/^(?:\+84|0084)/.test(p) || /^84\d{9}$/.test(p) || /^0\d{9}$/.test(p)) return 'VN';
  if (/^(?:\+1|001)/.test(p) || /^1\d{10}$/.test(p) || /^[2-9]\d{2}[2-9]\d{6}$/.test(p)) return 'US';
  return null;
}

export function nationalPhone(raw) {
  const p = compactPhone(raw);
  if (/^(?:\+84|0084)/.test(p)) return p.replace(/^(?:\+84|0084)/, '');
  if (/^(?:\+1|001)/.test(p)) return p.replace(/^(?:\+1|001)/, '');
  if (/^84\d{9}$/.test(p)) return p.slice(2);
  if (/^1\d{10}$/.test(p)) return p.slice(1);
  return p;
}

// Explicit international prefixes take precedence over the selected country.
export function internationalPhone(raw, country = 'VN') {
  const p = compactPhone(raw);
  if (!p) return '';
  if (p.startsWith('+')) return p;
  if (p.startsWith('00')) return `+${p.slice(2)}`;
  if (/^84\d{9}$/.test(p) || /^1\d{10}$/.test(p)) return `+${p}`;
  return `${PHONE_COUNTRIES[country] || '+84'}${country === 'VN' ? p.replace(/^0/, '') : p}`;
}

export function normalizePhone(raw) {
  const p = compactPhone(raw);
  const country = detectPhoneCountry(p);
  if (!country) return null;
  const full = internationalPhone(p, country);
  if (/^\+84[1-9]\d{8}$/.test(full)) return `0${full.slice(3)}`;
  if (/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(full)) return full;
  return null;
}
