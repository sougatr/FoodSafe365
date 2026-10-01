'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, HelpCircle, Mail, Info, FileText, Bot, User } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('foodsafe365_customer_phone');
      if (p) setCustomerPhone(p);

      const handleAuthUpdate = () => {
        const updated = localStorage.getItem('foodsafe365_customer_phone');
        setCustomerPhone(updated);
      };
      window.addEventListener('customer-auth-changed', handleAuthUpdate);
      return () => window.removeEventListener('customer-auth-changed', handleAuthUpdate);
    }
  }, []);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodsafe365_customer_phone');
      localStorage.removeItem('foodsafe365_diner_user');
      setCustomerPhone(null);
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
  }

  const NAV_ITEMS = [
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/food-safety-why', label: 'Food Safety — Why?', icon: HelpCircle },
    { href: '/haccp', label: 'HACCP Principles', icon: FileText },
    { href: '/contact', label: 'Contact Us', icon: Mail }
  ];

  return (
    <header className="topbar" style={{
      borderBottom: '1px solid var(--border, rgba(251, 146, 60, 0.22))',
      background: 'var(--surface, #341105)',
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
            boxShadow: '0 2px 4px rgba(5,150,105,0.4)'
          }}>
            FS
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #ffffff)' }}>FoodSafe365</span>
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
                  color: isActive ? '#34d399' : 'var(--muted, #fed7aa)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: isActive ? 'rgba(16,185,129,0.18)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Customer Login, Language, Theme, Ask Me Bot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {customerPhone ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              padding: '4px 10px',
              borderRadius: 9999,
              fontSize: 12
            }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                📱 +91 {customerPhone.length > 5 ? customerPhone.slice(0, 5) + '...' : customerPhone}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f87171',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: '0 2px'
                }}
                title="Log out"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-customer-otp-modal'));
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(255, 82, 0, 0.35)'
              }}
              title="Customer Login with Mobile OTP"
            >
              <span>📱 Customer Login</span>
            </button>
          )}

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
              border: '1px solid rgba(52, 211, 153, 0.4)',
              background: 'rgba(16, 185, 129, 0.18)',
              color: '#34d399',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Ask food safety & compliance AI questions"
          >
            <Bot size={15} style={{ color: '#34d399' }} />
            <span>Ask Me</span>
          </button>
        </div>
      </div>
    </header>
  );
}
