'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Building2, Smartphone, Mail, UserCheck, Star, Sparkles } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

interface RestaurantInfo {
  id: string;
  name: string;
  businessType?: string;
  city: string;
  location: string;
  status: string;
}

export default function ClaimRestaurantPage({ params }: { params: { restaurant_id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [managerName, setManagerName] = useState('');
  const [managerMobile, setManagerMobile] = useState('');
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
          setError('Unable to load food business profile.');
        }
      } catch (err: any) {
        setError('Unable to load business details.');
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [params.restaurant_id]);

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!managerName.trim()) {
      setError('Please enter your full name or designation.');
      return;
    }
    if (!managerMobile.trim()) {
      setError('Please enter your mobile or WhatsApp contact number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/v1/restaurants/${encodeURIComponent(params.restaurant_id)}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenFromUrl.trim() || 'DIRECT',
          managerName: managerName.trim(),
          managerMobile: managerMobile.trim(),
          managerEmail: managerEmail.trim() || undefined
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to claim business profile.');
      }

      setSuccess(true);

      // Save tenant identity locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_outlet_id', params.restaurant_id);
        localStorage.setItem('foodsafe365_setup', JSON.stringify({
          name: restaurant?.name || params.restaurant_id,
          city: restaurant?.city || 'Mumbai',
          managerName: managerName || 'Business Manager',
          managerMobile: managerMobile,
          claimedAt: new Date().toISOString()
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayName = restaurant?.name || params.restaurant_id.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const displayLocation = restaurant?.location || 'FoodSafe365 Directory';

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 64 }}>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 640, paddingTop: 36, margin: '0 auto', paddingLeft: 16, paddingRight: 16 }}>
        <div className="card" style={{ padding: '32px 32px', borderRadius: 20, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="pill good" style={{ fontSize: 11, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
              RESTAURANT OWNER &amp; MANAGER PORTAL
            </span>
            {restaurant && (
              <span className="pill neutral" style={{ fontSize: 11, padding: '4px 10px', background: '#f1f5f9', color: '#475569' }}>
                STATUS: {restaurant.status}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '4px 0 8px' }}>
            Claim {displayName}
          </h1>

          <p className="muted" style={{ margin: '0 0 22px', fontSize: 14, color: '#64748b' }}>
            {displayLocation}
          </p>

          {success ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 16, padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle2 size={26} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#065f46', margin: '0 0 8px' }}>
                Profile Successfully Claimed!
              </h3>
              <p style={{ fontSize: 14, color: '#047857', maxWidth: 460, margin: '0 auto 22px', lineHeight: 1.55 }}>
                Welcome aboard! You now have active managerial control of <strong>{displayName}</strong>. Your daily kitchen safety checklist, cold storage logs, and customer ratings are unlocked.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href={restaurant?.businessType === 'GROCERY' || restaurant?.businessType === 'SUPERMARKET' ? '/grocery' : '/manager'}
                  className="btn primary"
                  style={{
                    background: '#059669',
                    borderColor: '#059669',
                    color: '#ffffff',
                    padding: '11px 22px',
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 10,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>Open Kitchen Manager Dashboard</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href={`/qr/${encodeURIComponent(params.restaurant_id)}`}
                  className="btn secondary"
                  style={{
                    padding: '11px 18px',
                    fontSize: 14,
                    borderRadius: 10,
                    textDecoration: 'none',
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  View Public Diner Page
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Enticing Owner Benefits Box */}
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0', borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#065f46', fontSize: 13.5, marginBottom: 8 }}>
                  <Sparkles size={16} color="#059669" />
                  <span>Why Claim Your Restaurant Profile on FoodSafe365?</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#047857', lineHeight: 1.45 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                    <span><strong>Inspect Diner Ratings:</strong> See what customers observe regarding cleanliness, staff hygiene &amp; food freshness.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                    <span><strong>Earn &apos;Verified Safe Kitchen&apos; Seal:</strong> Public verification badge shown to diners across India.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} />
                    <span><strong>Free FSSAI Digital Logs:</strong> Replace paper registers with 1-click &lt;5°C temperature &amp; hygiene checks.</span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px', marginBottom: 18, color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleClaim} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Your Name / Manager Designation <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    placeholder="e.g. Farhan Farokh (Owner / GM)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Mobile / WhatsApp Contact Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={managerMobile}
                    onChange={e => setManagerMobile(e.target.value)}
                    placeholder="e.g. +91 98200 12345"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <small style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, display: 'block' }}>
                    Used for urgent diner resolution alerts and management verification.
                  </small>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Official Business Email <span style={{ color: '#64748b', fontWeight: 500 }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={e => setManagerEmail(e.target.value)}
                    placeholder="e.g. management@coffeeisland.in"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #cbd5e1',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
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
                      padding: '13px 20px',
                      fontSize: 14.5,
                      fontWeight: 800,
                      borderRadius: 12,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <ShieldCheck size={19} />
                    <span>{isSubmitting ? 'Activating Profile…' : 'CLAIM PROFILE & OPEN DASHBOARD →'}</span>
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', margin: '10px 0 0' }}>
                    Free for food businesses · Instant activation · No credit card required
                  </p>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
