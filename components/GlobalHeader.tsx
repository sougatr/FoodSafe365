'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, HelpCircle, Mail, Info, FileText, Bot } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function GlobalHeader() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/food-safety-why', label: 'Food Safety — Why?', icon: HelpCircle },
    { href: '/haccp', label: 'HACCP Principles', icon: FileText },
    { href: '/contact', label: 'Contact Us', icon: Mail }
  ];

  return (
    <header className="topbar" style={{
      borderBottom: '1px solid var(--border, #e2e8f0)',
      background: 'var(--surface, #ffffff)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, margin: '0 auto', gap: 12, flexWrap: 'wrap' }}>
        {/* Brand */}
        <Link href="/" className="brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 2px 4px rgba(5,150,105,0.2)'
          }}>
            FS
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)' }}>FoodSafe365</span>
        </Link>

        {/* Global Persistent Navigation (Required across all pages) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--green, #059669)' : 'var(--muted, #64748b)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: isActive ? 'rgba(5,150,105,0.08)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Language, Theme, Ask Me Bot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const trigger = document.getElementById('foodsafe-chatbot-trigger');
                if (trigger) trigger.click();
              }
            }}
            className="btn secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #a7f3d0',
              background: '#ecfdf5',
              color: '#065f46',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Ask food safety & compliance AI questions"
          >
            <Bot size={15} style={{ color: '#059669' }} />
            <span>Ask Me</span>
          </button>
        </div>
      </div>
    </header>
  );
}
