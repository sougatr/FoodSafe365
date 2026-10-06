'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Info,
  HelpCircle,
  FileText,
  Mail,
  Bot
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function GlobalHeader() {
  const pathname = usePathname();
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Account popover menu toggle
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen]);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodsafe365_customer_phone');
      localStorage.removeItem('foodsafe365_diner_user');
      setCustomerPhone(null);
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
  }

  function handleOpenLogin() {
    if (typeof window !== 'undefined') {
      setMobileMenuOpen(false);
      window.dispatchEvent(new CustomEvent('open-customer-otp-modal'));
    }
  }

  function handleTriggerChatbot() {
    if (typeof window !== 'undefined') {
      setMobileMenuOpen(false);
      const trigger = document.getElementById('foodsafe-chatbot-trigger');
      if (trigger) trigger.click();
    }
  }

  const NAV_ITEMS = [
    { href: '/about', label: 'About Us', icon: Info },
    { href: '/food-safety-why', label: 'Food Safety — Why?', icon: HelpCircle },
    { href: '/haccp', label: 'HACCP Principles', icon: FileText },
    { href: '/contact', label: 'Contact Us', icon: Mail }
  ];

  return (
    <header
      className="topbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        gap: 12
      }}>
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="brand"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)'
          }}>
            FS
          </div>
          <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text, #0f172a)', letterSpacing: '-0.02em' }}>
            FoodSafe365
          </span>
        </Link>

        {/* Desktop Navigation Links (Hidden on Mobile) */}
        <nav
          className="desktop-nav"
          style={{
            alignItems: 'center',
            gap: 4
          }}
        >
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
                  borderRadius: 8,
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls (Account, Language, Theme, Ask Me) */}
        <div
          className="desktop-controls"
          style={{
            alignItems: 'center',
            gap: 8
          }}
        >
          {/* Account Popover Menu */}
          {customerPhone ? (
            <div ref={accountMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '5px 12px',
                  borderRadius: 9999,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#047857',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                aria-label="Account Menu"
                aria-expanded={accountMenuOpen}
              >
                <User size={14} />
                <span>+91 {customerPhone.length > 5 ? customerPhone.slice(0, 5) + '...' : customerPhone}</span>
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
              </button>

              {accountMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                  padding: '12px 14px',
                  width: 220,
                  zIndex: 200,
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Account
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                    +91 {customerPhone}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#059669', marginBottom: 10 }}>
                    Verified Customer
                  </div>
                  <div style={{ borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: 8 }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 10px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: '#dc2626',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOpenLogin}
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
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                whiteSpace: 'nowrap'
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
            onClick={handleTriggerChatbot}
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
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Ask food safety & compliance AI questions"
          >
            <Bot size={15} style={{ color: '#059669' }} />
            <span>Ask Me</span>
          </button>
        </div>

        {/* Mobile Header Controls (Right side: Account icon + Hamburger) */}
        <div
          className="mobile-controls"
          style={{
            alignItems: 'center',
            gap: 8
          }}
        >
          {customerPhone ? (
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Account Profile"
              title={`Logged in as +91 ${customerPhone}`}
            >
              <User size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenLogin}
              style={{
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              aria-label="Customer Login"
            >
              Login
            </button>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: 'var(--surface-subtle, #f1f5f9)',
              border: '1px solid var(--border, #e2e8f0)',
              color: 'var(--text, #0f172a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Popover */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface, #ffffff)',
            borderBottom: '1.5px solid var(--border, #e2e8f0)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
            padding: '16px 20px 24px',
            zIndex: 99
          }}
        >
          {/* Mobile Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#059669' : 'var(--text, #0f172a)',
                    background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    textDecoration: 'none'
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? '#059669' : '#64748b' }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid var(--border, #e2e8f0)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Quick Tools Row (Language & Theme) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LanguageSelector />
                <ThemeToggle />
              </div>

              <button
                type="button"
                onClick={handleTriggerChatbot}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#059669',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Bot size={15} />
                <span>Ask AI Copilot</span>
              </button>
            </div>

            {/* Account Info in Mobile Drawer */}
            {customerPhone ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8
              }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>LOGGED IN AS</span>
                  <strong style={{ fontSize: 13, color: '#047857' }}>+91 {customerPhone}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <LogOut size={13} /> Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenLogin}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>📱 Customer Login with Mobile OTP</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Visibility Styles */}
      <style jsx>{`
        .desktop-nav,
        .desktop-controls {
          display: flex;
        }
        .mobile-controls {
          display: none;
        }
        @media (max-width: 860px) {
          .desktop-nav,
          .desktop-controls {
            display: none !important;
          }
          .mobile-controls {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
