'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { routing } from '@/i18n/routing';

// fi-xx class codes from flag-icons library (ISO 3166-1 alpha-2 lowercase)
const LANGUAGES = [
  { code: 'en', label: 'English',          fi: 'gb' },
  { code: 'tr', label: 'Türkçe',           fi: 'tr' },
  { code: 'ru', label: 'Русский',          fi: 'ru' },
  { code: 'pt', label: 'Português',        fi: 'br' },
  { code: 'es', label: 'Español',          fi: 'es' },
  { code: 'fr', label: 'Français',         fi: 'fr' },
  { code: 'id', label: 'Bahasa Indonesia', fi: 'id' },
  { code: 'ar', label: 'العربية',          fi: 'sa' },
  { code: 'de', label: 'Deutsch',          fi: 'de' },
];

export default function LanguageSwitcher({ dark = false }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  const getLocalizedPath = (newLocale) => {
    const segments = pathname.split('/').filter(Boolean);
    if (routing.locales.includes(segments[0])) segments.shift();
    return `/${newLocale}${segments.length ? '/' + segments.join('/') : ''}`;
  };

  const handleSwitch = (code) => {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000`;
    router.push(getLocalizedPath(code));
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Styles ── */
  const triggerCls = dark
    ? 'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer select-none'
    : 'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-black/5 transition-all cursor-pointer select-none';

  const dropdownCls = dark
    ? 'absolute right-0 top-full mt-2 w-52 bg-[#111118] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden py-1.5'
    : 'absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden py-1.5';

  const itemBase = 'flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors';
  const itemCls = (isActive) => dark
    ? `${itemBase} ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
    : `${itemBase} ${isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className={triggerCls}
        aria-label="Change language"
        aria-expanded={open}
      >
        {/* Flag icon */}
        <span
          className={`fi fi-${current.fi}`}
          style={{ width: '1.25em', height: '1em', display: 'inline-block', borderRadius: '2px', flexShrink: 0 }}
        />
        {/* Lang code */}
        <span className="uppercase text-xs font-bold tracking-wide">
          {current.code}
        </span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className={dropdownCls}>
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSwitch(lang.code)}
              className={itemCls(lang.code === locale)}
            >
              {/* Flag */}
              <span
                className={`fi fi-${lang.fi}`}
                style={{ width: '1.35em', height: '1.05em', display: 'inline-block', borderRadius: '2px', flexShrink: 0 }}
              />
              {/* Label */}
              <span className="flex-1">{lang.label}</span>
              {/* Active checkmark */}
              {lang.code === locale && (
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
