import { useTranslation } from 'react-i18next';
import { detectPhoneCountry, nationalPhone } from '../../../shared/phone.mjs';

export default function PhoneInput({ value, onChange, country, onCountryChange }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <select
          className="input w-auto max-w-full shrink-0"
          aria-label={t('auth.phoneCountry')}
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
            onChange(nationalPhone(value));
          }}
        >
          <option value="VN">{t('auth.phoneCountries.VN')} (+84)</option>
          <option value="US">{t('auth.phoneCountries.US')} (+1)</option>
        </select>
        <input
          className="input min-w-0 flex-1"
          type="tel"
          autoComplete="tel"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            const detected = detectPhoneCountry(next);
            if (detected) onCountryChange(detected);
            onChange(next);
          }}
          required
          maxLength={40}
          placeholder={country === 'US' ? '(202) 555-0123' : '0912 345 678'}
          aria-label={t('auth.contact.phone')}
          aria-describedby="phone-format-hint"
        />
      </div>
      <p id="phone-format-hint" className="mt-1 text-sm text-muted">{t('auth.phoneHint')}</p>
    </div>
  );
}
