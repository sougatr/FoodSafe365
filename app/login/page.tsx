'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, Utensils, Building2, User, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export type UserRole = 'restaurant' | 'client' | 'provider';

export default function Login() {
  const [role, setRole] = useState<UserRole>('restaurant');
  const [email, setEmail] = useState('demo@foodsafe365.com');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search);
      const requestedRole = q.get('role') as UserRole;
      if (requestedRole && ['restaurant', 'client', 'provider'].includes(requestedRole)) {
        handleRoleChange(requestedRole);
      }
    }
  }, []);

  function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    setError('');
    if (newRole === 'restaurant') {
      setEmail('demo@foodsafe365.com');
      setPassword('demo');
    } else if (newRole === 'client') {
      setEmail('diner@foodsafe365.com');
      setPassword('diner123');
    } else if (newRole === 'provider') {
      setEmail('partner@labcare.com');
      setPassword('partner123');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      // For restaurant role, verify with backend or simulate demo
      if (role === 'restaurant') {
        try {
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const body = await res.json();
          if (!res.ok) throw new Error(body?.error?.message || 'Login failed');
        } catch {
          // Allow demo login
        }
        router.push('/home');
      } else if (role === 'client') {
        // Diner login directs to diner portal
        if (typeof window !== 'undefined') {
          localStorage.setItem('foodsafe365_diner_user', JSON.stringify({ email, name: 'Verified Diner' }));
        }
        router.push('/diner');
      } else if (role === 'provider') {
        // Service provider directs to marketplace
        if (typeof window !== 'undefined') {
          localStorage.setItem('foodsafe365_provider_user', JSON.stringify({ email, org: 'Certified Compliance Partner' }));
        }
        router.push('/providers');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="topbar">
        <Link href="/home" className="brand">
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
            fontSize: 14
          }}>
            FS
          </div>
          <span>FoodSafe365</span>
        </Link>
        <Link
          href="/home"
          className="btn secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}
        >
          <Home size={15} /> Home
        </Link>
      </div>

      <div className="container" style={{ maxWidth: 540, paddingTop: 40, paddingBottom: 60 }}>
        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          background: '#e2e8f0',
          padding: 6,
          borderRadius: 14,
          marginBottom: 24
        }}>
          <button
            type="button"
            onClick={() => handleRoleChange('restaurant')}
            style={{
              padding: '10px 8px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: role === 'restaurant' ? '#ffffff' : 'transparent',
              color: role === 'restaurant' ? '#0f172a' : '#64748b',
              boxShadow: role === 'restaurant' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Utensils size={15} /> Restaurant
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('client')}
            style={{
              padding: '10px 8px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: role === 'client' ? '#ffffff' : 'transparent',
              color: role === 'client' ? '#059669' : '#64748b',
              boxShadow: role === 'client' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <User size={15} /> Diner / Client
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('provider')}
            style={{
              padding: '10px 8px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: role === 'provider' ? '#ffffff' : 'transparent',
              color: role === 'provider' ? '#2563eb' : '#64748b',
              boxShadow: role === 'provider' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <Building2 size={15} /> Provider
          </button>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: 32, boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
          {/* Header Banner */}
          <div style={{ marginBottom: 24 }}>
            {role === 'restaurant' && (
              <>
                <span className="pill good" style={{ fontSize: 11, padding: '3px 8px' }}>
                  KITCHEN &amp; MANAGEMENT PORTAL
                </span>
                <h1 style={{ fontSize: 24, marginTop: 10, marginBottom: 6 }}>Restaurant Sign In</h1>
                <p className="muted" style={{ fontSize: 14 }}>
                  Access daily 28 kitchen safeguards, refrigerator logs, corrective actions, and manager review.
                </p>
              </>
            )}

            {role === 'client' && (
              <>
                <span className="pill good" style={{ fontSize: 11, padding: '3px 8px', background: '#ecfdf5', color: '#047857' }}>
                  DINER &amp; CONSUMER TRUST PORTAL
                </span>
                <h1 style={{ fontSize: 24, marginTop: 10, marginBottom: 6 }}>Diner / Client Sign In</h1>
                <p className="muted" style={{ fontSize: 14 }}>
                  Scan tabletop QR codes, check verified kitchen hygiene badges, rate food freshness, and report safety issues.
                </p>
              </>
            )}

            {role === 'provider' && (
              <>
                <span className="pill" style={{ fontSize: 11, padding: '3px 8px', background: '#eff6ff', color: '#1d4ed8' }}>
                  SERVICE PROVIDER &amp; VENDOR PORTAL
                </span>
                <h1 style={{ fontSize: 24, marginTop: 10, marginBottom: 6 }}>Service Partner Sign In</h1>
                <p className="muted" style={{ fontSize: 14 }}>
                  For diagnostic labs, FoSTaC trainers, pest control operators, and HVAC maintenance engineers.
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleLogin} className="grid" style={{ gap: 16 }}>
            <label className="field">
              <span>{role === 'client' ? 'Mobile Number or Email' : 'Work Email Address'}</span>
              <input
                className="input"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'client' ? '9876543210 or you@gmail.com' : 'you@restaurant.com'}
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <div className="notice error" style={{ margin: '4px 0', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn primary"
              disabled={busy}
              style={{
                marginTop: 6,
                padding: '12px 20px',
                fontSize: 15,
                background: role === 'client' ? '#059669' : role === 'provider' ? '#2563eb' : '#0f172a'
              }}
            >
              {busy ? 'Signing in…' : role === 'client' ? 'Sign In as Diner' : role === 'provider' ? 'Sign In to Provider Portal' : 'Sign In to Kitchen Dashboard'}
            </button>
          </form>

          {/* Persona-specific Onboarding / Sign-up links */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            {role === 'restaurant' && (
              <p style={{ fontSize: 13, color: '#64748b' }}>
                New restaurant?{' '}
                <Link href="/onboarding" style={{ fontWeight: 600, color: '#0f172a' }}>
                  Register your restaurant outlet →
                </Link>
              </p>
            )}

            {role === 'client' && (
              <p style={{ fontSize: 13, color: '#64748b' }}>
                New guest / diner?{' '}
                <Link href="/onboarding/client" style={{ fontWeight: 600, color: '#059669' }}>
                  Create a free Diner Health profile →
                </Link>
              </p>
            )}

            {role === 'provider' && (
              <p style={{ fontSize: 13, color: '#64748b' }}>
                Are you a certified service provider?{' '}
                <Link href="/providers" style={{ fontWeight: 600, color: '#2563eb' }}>
                  Apply to become a partner →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

