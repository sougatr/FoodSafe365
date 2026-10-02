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
            boxShadow: '0 2px 4px rgba(5,150,105,0.3)'
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
                  color: isActive ? '#059669' : 'var(--muted, #475569)',
                  textDecoration: 'none',
                  padding: '6px 11px',
                  borderRadius: 6,
                  background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
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
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 10px',
              borderRadius: 9999,
              fontSize: 12
            }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>
                📱 +91 {customerPhone.length > 5 ? customerPhone.slice(0, 5) + '...' : customerPhone}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
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
                padding: '6px 13px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)'
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
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#059669',
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
