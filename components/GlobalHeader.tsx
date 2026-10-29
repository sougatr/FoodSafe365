'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Info,
  FileText,
  Mail,
  BookOpen,
  ShieldCheck,
  Home,
  ArrowLeft
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  // Menu toggle (About, Learning Hub, HACCP, Contact, Providers)
  const [menuOpen, setMenuOpen] = useState(false);

  // Account popover menu toggle
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (accountMenuOpen || menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen, menuOpen]);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodsafe365_customer_phone');
      localStorage.removeItem('foodsafe365_diner_user');
      setCustomerPhone(null);
      setAccountMenuOpen(false);
      setMenuOpen(false);
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
  }

  // Mask user phone for public privacy: +91 ••••• •1234
  const maskedPhone = customerPhone
    ? `+91 ••••• •${customerPhone.replace(/\D/g, '').slice(-4) || '••••'}`
    : null;

  // The 5 Core Navigation Pages (Always visible on top of every page)
  const CORE_NAV_PAGES = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/food-safety-why', label: 'FoSTaC Learning Hub', icon: BookOpen },
    { href: '/haccp', label: 'HACCP Principles', icon: FileText },
    { href: '/contact', label: 'Contact Us', icon: Mail }
  ];

  const NAV_ITEMS = [
    ...CORE_NAV_PAGES,
    { href: '/providers', label: 'Service Providers', icon: ShieldCheck },
    { href: '/showcase', label: 'Food Safety Passport', icon: ShieldCheck }
  ];

  // Navigate back by exactly 1 page
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <header
      className="topbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--surface, #ffffff)',
        borderBottom: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '10px 16px',
          gap: 12
        }}
      >
        {/* Left: Brand Logo & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {pathname !== '/' && (
            <button
              type="button"
              onClick={handleGoBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 11px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                color: '#334155',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              title="Go back to previous page"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          <Link
            href="/"
            className="brand"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              textDecoration: 'none'
            }}
            aria-label="FoodSafe365 Home"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: 15,
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.35)'
              }}
            >
              FS
            </div>
            <span
              style={{
                fontSize: 19,
                fontWeight: 900,
                color: 'var(--text, #0f172a)',
                letterSpacing: '-0.02em'
              }}
            >
              FoodSafe365
            </span>
          </Link>
        </div>

        {/* Center: Desktop Visible Core Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap'
          }}
          className="desktop-only-nav"
        >
          {CORE_NAV_PAGES.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 9px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#065F46' : '#334155',
                  background: isActive ? '#D1FAE5' : 'transparent',
                  border: isActive ? '1px solid #10B981' : '1px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={13.5} color={isActive ? '#059669' : '#64748B'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Language Switch, Account/Login & Mobile Menu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0
          }}
        >
          {/* Language Switch */}
          <LanguageSelector compact={true} />

          {/* Login or Account */}
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
                  padding: '6px 12px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#047857',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                aria-label="Account Menu"
                aria-expanded={accountMenuOpen}
              >
                <User size={15} />
                <span>Account</span>
                <ChevronDown size={13} style={{ opacity: 0.7 }} />
              </button>

              {accountMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'var(--surface, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: 14,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                    padding: '12px 14px',
                    width: 220,
                    zIndex: 200,
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 4
                    }}
                  >
                    User Account
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                    {maskedPhone}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#059669', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={13} /> Verified User
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
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                padding: '7px 14px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                whiteSpace: 'nowrap'
              }}
              title="Sign in to FoodSafe365"
            >
              <User size={14} />
              <span>Login</span>
            </Link>
          )}

          {/* Unified Menu Toggle (About, Learning Hub, HACCP, Contact) */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: menuOpen ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-subtle, #f1f5f9)',
                border: '1px solid var(--border, #e2e8f0)',
                color: menuOpen ? '#059669' : 'var(--text, #0f172a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={menuOpen}
              title="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Menu Popover */}
            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--surface, #ffffff)',
                  border: '1.5px solid var(--border, #e2e8f0)',
                  borderRadius: 16,
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.04)',
                  padding: '12px 10px',
                  width: 250,
                  zIndex: 200,
                  textAlign: 'left'
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 10px 8px'
                  }}
                >
                  Explore FoodSafe365
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 12px',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? '#059669' : 'var(--text, #0f172a)',
                          background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                          textDecoration: 'none',
                          transition: 'background 0.12s ease'
                        }}
                      >
                        <Icon size={17} style={{ color: isActive ? '#059669' : '#64748b' }} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div
                  style={{
                    borderTop: '1px solid var(--border, #e2e8f0)',
                    marginTop: 10,
                    paddingTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: 12,
                    paddingRight: 12
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--muted, #64748b)', fontWeight: 600 }}>Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
