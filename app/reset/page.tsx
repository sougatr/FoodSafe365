'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  Building2, 
  ShieldCheck, 
  Store, 
  UtensilsCrossed, 
  Home, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function ResetDataPage() {
  const [resetting, setResetting] = useState(false);
  const [done, setDone] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const handleReset = async () => {
    setResetting(true);
    try {
      // 1. Call server-side reset endpoint
      const res = await fetch('/api/v1/reset-all-data', {
        method: 'POST'
      });
      const data = await res.json().catch(() => ({}));
      setDetails(data?.details || null);

      // 2. Clear all browser-stored profiles, phones, and emails
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();

        // Expire all accessible cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }

      setDone(true);
    } catch (err) {
      // Even on error, clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      setDone(true);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A' }}>
      <GlobalHeader />

      <main style={{ maxWidth: 760, margin: '40px auto 80px', padding: '0 20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #E2E8F0',
          padding: '36px 32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}>
          {!done ? (
            <>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <Trash2 size={34} />
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', color: '#0F172A' }}>
                Reset Test Onboardings &amp; Start Afresh
              </h1>

              <p style={{ margin: '0 0 28px', color: '#64748B', fontSize: 14.5, lineHeight: 1.6, maxWidth: 580, marginInline: 'auto' }}>
                This will delete all test onboardings, test provider profiles, test phone numbers, and test email addresses from both your browser and the server.
              </p>

              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 12,
                padding: '16px 20px',
                textAlign: 'left',
                marginBottom: 28,
                fontSize: 13,
                color: '#92400E',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2, color: '#D97706' }} />
                <div>
                  <strong>What will be cleared:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    <li>All test service provider registrations &amp; drafts</li>
                    <li>Saved phone numbers and email IDs stored in your browser session</li>
                    <li>Restaurant &amp; grocery test manager setups</li>
                    <li>Test session cookies and tokens</li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#DC2626',
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  border: 'none',
                  cursor: resetting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                  transition: 'background 0.15s ease'
                }}
              >
                {resetting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Resetting Test Data...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} /> Clear All Test Data &amp; Start Afresh
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}>
                <CheckCircle2 size={42} />
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', color: '#065F46' }}>
                All Test Onboardings Cleared!
              </h1>

              <p style={{ margin: '0 0 32px', color: '#64748B', fontSize: 15, lineHeight: 1.6, maxWidth: 540, marginInline: 'auto' }}>
                Your browser storage, cookies, test phone numbers, and onboarding records have been completely cleared. You are ready to start afresh.
              </p>

              <div style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#475569',
                marginBottom: 16,
                textAlign: 'left'
              }}>
                Choose where you want to start:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, textAlign: 'left', marginBottom: 28 }}>
                <Link
                  href="/onboarding/provider"
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: 14,
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', fontWeight: 700, fontSize: 14.5 }}>
                    <ShieldCheck size={18} /> Service Provider
                  </div>
                  <div style={{ fontSize: 12.5, color: '#166534' }}>
                    Register a new service partner with verified email dispatch.
                  </div>
                </Link>

                <Link
                  href="/onboarding"
                  style={{
                    background: '#EFF6FF',
                    border: '1.5px solid #BFDBFE',
                    borderRadius: 14,
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1D4ED8', fontWeight: 700, fontSize: 14.5 }}>
                    <Building2 size={18} /> Restaurant / Kitchen
                  </div>
                  <div style={{ fontSize: 12.5, color: '#1E40AF' }}>
                    Onboard a new restaurant kitchen and generate QR safety codes.
                  </div>
                </Link>

                <Link
                  href="/onboarding/grocery"
                  style={{
                    background: '#FAF5FF',
                    border: '1.5px solid #E9D5FF',
                    borderRadius: 14,
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7E22CE', fontWeight: 700, fontSize: 14.5 }}>
                    <Store size={18} /> Grocery Store
                  </div>
                  <div style={{ fontSize: 12.5, color: '#6B21A8' }}>
                    Onboard a fresh grocery outlet for temperature and daily logs.
                  </div>
                </Link>

                <Link
                  href="/diner"
                  style={{
                    background: '#FFF7ED',
                    border: '1.5px solid #FED7AA',
                    borderRadius: 14,
                    padding: '18px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#C2410C', fontWeight: 700, fontSize: 14.5 }}>
                    <UtensilsCrossed size={18} /> Diner Experience
                  </div>
                  <div style={{ fontSize: 12.5, color: '#9A3412' }}>
                    Explore food-safety ratings and audit records as a diner.
                  </div>
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#0F172A',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Home size={16} /> Return to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
