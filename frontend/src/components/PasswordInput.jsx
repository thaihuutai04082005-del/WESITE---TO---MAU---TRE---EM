import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Password fields start masked; each eye toggles only its associated input. */
export default function PasswordInput({ id, label, className = '', ...props }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const action = t(visible ? 'auth.hidePassword' : 'auth.showPassword');
  return (
    <div className="relative">
      <input {...props} id={id} type={visible ? 'text' : 'password'} className={`input pr-14 ${className}`} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      <button
        type="button"
        className="absolute inset-y-0 right-1 inline-flex w-11 items-center justify-center rounded-xl text-primary-dark hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setVisible((value) => !value)}
        aria-label={`${action}: ${label}`}
        aria-controls={id}
        aria-pressed={visible}
        disabled={props.disabled}
        data-testid={`${id}-visibility`}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {!visible && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
