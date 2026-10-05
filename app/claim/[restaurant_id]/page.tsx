'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Building2, Lock, Star } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

interface RestaurantInfo {
  id: string;
  name: string;
  city: string;
  location: string;
  status: string;
}

export default function ClaimRestaurantPage({ params }: { params: { restaurant_id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [token, setToken] = useState(tokenFromUrl);
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await fetch(`/api/v1/restaurants/${encodeURIComponent(params.restaurant_id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data?.restaurant) {
            setRestaurant(json.data.restaurant);
            if (json.data.restaurant.status === 'CLAIMED' || json.data.restaurant.status === 'ACTIVE') {
              setSuccess(true);
            }
          }
        } else {
          setError('Restaurant not found in FoodSafe365 directory.');
        }
      } catch (err: any) {
        setError('Unable to load restaurant details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [params.restaurant_id]);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide the secure claim token from your invitation.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/restaurants/${encodeURIComponent(params.restaurant_id)}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          managerName: managerName.trim() || 'Restaurant Manager',
          managerEmail: managerEmail.trim() || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to claim restaurant profile. Token may be invalid or expired.');
      }

      setSuccess(true);

      // Save tenant identity locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_outlet_id', params.restaurant_id);
        localStorage.setItem('foodsafe365_setup', JSON.stringify({
          name: restaurant?.name || params.restaurant_id,
          city: restaurant?.city || 'Mumbai',
          managerName: managerName || 'Restaurant Manager',
          claimedAt: new Date().toISOString()
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 640, paddingTop: 40, margin: '0 auto' }}>
        <div className="card" style={{ padding: '32px 36px', borderRadius: 20, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="pill good" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              RESTAURANT PROFILE CLAIM
            </span>
            {restaurant && (
              <span className="pill neutral" style={{ fontSize: 11, padding: '4px 10px' }}>
                STATUS: {restaurant.status}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
            Claim {restaurant ? restaurant.name : 'Restaurant'} Profile
          </h1>

          <p className="muted" style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.5 }}>
            {restaurant ? `${restaurant.location} · FoodSafe365 Directory` : 'FoodSafe365 Directory'}
          </p>

          {success ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#065f46', margin: '0 0 6px' }}>
                Profile Successfully Claimed!
              </h3>
              <p style={{ fontSize: 13.5, color: '#047857', maxWidth: 440, margin: '0 auto 18px', lineHeight: 1.5 }}>
                You are now recognized as authorized management for <strong>{restaurant?.name}</strong>. Historical customer feedback is now unlocked on your manager dashboard.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Link
                  href="/manager"
                  className="btn primary"
                  style={{
                    background: '#059669',
                    borderColor: '#059669',
                    color: '#ffffff',
                    padding: '10px 20px',
                    fontSize: 13.5,
                    fontWeight: 700,
                    borderRadius: 10,
                    textDecoration: 'none'
                  }}
                >
                  View Manager Review &amp; Customer Voice →
                </Link>
                <Link
                  href="/home"
                  className="btn secondary"
                  style={{
                    padding: '10px 18px',
                    fontSize: 13.5,
                    borderRadius: 10,
                    textDecoration: 'none'
                  }}
                >
                  Kitchen Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: '#f1f5f9', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>
                  <Lock size={15} color="#059669" />
                  Controlled Verification Required
                </div>
                Customer feedback for this restaurant is securely stored. To claim this profile and inspect diner observations, enter your authorized business verification token.
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 18, color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Manager / General Manager Name:
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    placeholder="e.g. Farhan Farokh (GM)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Official Business Email:
                  </label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={e => setManagerEmail(e.target.value)}
                    placeholder="e.g. management@restaurant.example.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13.5,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Verification Claim Token *:
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="Enter 48-char claim token from invitation"
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                  <small style={{ fontSize: 11, color: '#64748b', marginTop: 4, display: 'block' }}>
                    Sent to the restaurant&apos;s official business contact upon receiving customer feedback.
                  </small>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn primary"
                    style={{
                      width: '100%',
                      background: '#059669',
                      borderColor: '#059669',
                      color: '#ffffff',
                      padding: '12px 18px',
                      fontSize: 14,
                      fontWeight: 800,
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                  >
                    <ShieldCheck size={18} />
                    {isSubmitting ? 'Verifying Token…' : 'CLAIM THIS RESTAURANT'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 24, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: 12.5, color: '#64748b', textDecoration: 'none' }}>
              ← FoodSafe365 Directory
            </Link>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              FoodSafe365 · Safer food. Every day.
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}
