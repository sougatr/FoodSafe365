'use client';
import { useLanguage, LANGUAGE_OPTIONS, Language } from '@/lib/vernacular';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="language-selector-group"
      role="group"
      aria-label="Language Selector"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--card-bg, #ffffff)',
        border: '1.5px solid var(--border, #e2e8f0)',
        borderRadius: 12,
        padding: '3px 4px',
        gap: 3,
        boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(0,0,0,0.05))',
        userSelect: 'none'
      }}
    >
      {!compact && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 6px',
            color: 'var(--muted, #64748b)',
            fontSize: 12
          }}
          title="Select Language / भाषा चुनें"
        >
          <Globe size={13} style={{ marginRight: 2 }} />
        </span>
      )}

      {LANGUAGE_OPTIONS.map(opt => {
        const isActive = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            aria-pressed={isActive}
            title={opt.label}
            style={{
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text, #334155)',
              fontWeight: isActive ? 800 : 600,
              fontSize: 12,
              padding: compact ? '4px 8px' : '4px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isActive ? '0 1px 4px rgba(5, 150, 105, 0.3)' : 'none',
              lineHeight: 1.2
            }}
          >
            {opt.nativeName}
          </button>
        );
      })}
    </div>
  );
}
