'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Search,
  Star,
  MapPin,
  Thermometer,
  UserCheck,
  UtensilsCrossed,
  Users,
  Wrench,
  Sparkles,
  Smartphone,
  Phone,
  X,
  Flame,
  Award,
  Check,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { POPULAR_RESTAURANTS, RestaurantItem } from '@/lib/restaurantsData';

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<'all' | 'mumbai' | 'delhi' | 'bengaluru'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'delivery' | 'fine_dine' | 'cafe'>('all');

  // Customer Authentication (Mobile OTP) State
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [inputPhone, setInputPhone] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');

  // Rating Modal State
  const [ratingModalRestaurant, setRatingModalRestaurant] = useState<RestaurantItem | null>(null);
  const [rateTableNum, setRateTableNum] = useState('Table 4');
  const [rateScores, setRateScores] = useState({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 });
  const [rateRemarks, setRateRemarks] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Passport Quick-Peek Modal State
  const [passportModalRestaurant, setPassportModalRestaurant] = useState<RestaurantItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (showOtpModal && otpStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpStep, otpTimer]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('foodsafe365_customer_phone');
      if (p) setCustomerPhone(p);

      const handleOpenOtp = () => {
        setShowOtpModal(true);
        setOtpStep('phone');
        setOtpError('');
      };
      const handleAuthUpdate = () => {
        const updated = localStorage.getItem('foodsafe365_customer_phone');
        setCustomerPhone(updated);
      };

      window.addEventListener('open-customer-otp-modal', handleOpenOtp);
      window.addEventListener('customer-auth-changed', handleAuthUpdate);
      return () => {
        window.removeEventListener('open-customer-otp-modal', handleOpenOtp);
        window.removeEventListener('customer-auth-changed', handleAuthUpdate);
      };
    }
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }

  function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpError('');
    setOtpStep('otp');
    setOtpTimer(30);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!inputOtp.trim()) {
      setOtpError('Please enter the 4-digit OTP');
      return;
    }
    setOtpError('');
    setOtpStep('success');
    const clean = inputPhone.replace(/\D/g, '');
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodsafe365_customer_phone', clean);
      localStorage.setItem('foodsafe365_diner_user', JSON.stringify({
        phone: clean,
        name: `Diner (+91 ${clean.slice(0, 5)}...)`,
        verifiedAt: new Date().toISOString()
      }));
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
    setCustomerPhone(clean);

    setTimeout(() => {
      setShowOtpModal(false);
      setOtpStep('phone');
      setInputOtp('');
      showToast(`🎉 Welcome +91 ${clean}! You can now submit verified food-safety ratings.`);
    }, 1100);
  }

  function handleLogoutCustomer() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodsafe365_customer_phone');
      localStorage.removeItem('foodsafe365_diner_user');
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
    setCustomerPhone(null);
    showToast('Logged out of diner profile');
  }

  function handleOpenRating(restaurant: RestaurantItem) {
    setRatingModalRestaurant(restaurant);
    setRateScores({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 });
    setRateRemarks('');
    setRateTableNum(restaurant.tableCode || 'Table 4');
  }

  function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingModalRestaurant) return;
    setIsSubmittingRating(true);

    const avgScore = (
      (rateScores.q1 + rateScores.q2 + rateScores.q3 + rateScores.q4 + rateScores.q5) / 5
    ).toFixed(1);

    const newRating = {
      id: 'diner_' + Date.now(),
      outletId: ratingModalRestaurant.id,
      restaurantName: ratingModalRestaurant.name,
      location: ratingModalRestaurant.location,
      tableNumber: rateTableNum,
      timestamp: new Date().toISOString(),
      verifiedDiner: Boolean(customerPhone),
      dinerPhone: customerPhone ? `+91 ${customerPhone.slice(0, 5)}...` : 'Guest Diner',
      scores: rateScores,
      averageScore: avgScore,
      remarks: rateRemarks.trim() || 'Food was served hot and tables were spotlessly clean.'
    };

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('foodsafe365_diner_ratings') || '[]');
      localStorage.setItem('foodsafe365_diner_ratings', JSON.stringify([newRating, ...existing]));
      window.dispatchEvent(new CustomEvent('foodsafe-rating-submitted'));
    }

    setTimeout(() => {
      setIsSubmittingRating(false);
      setRatingModalRestaurant(null);
      showToast(`⭐ Thank you! Your ${avgScore}★ audit for ${ratingModalRestaurant.name} was delivered to the General Manager. +50 Karma earned!`);
    }, 600);
  }

  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return POPULAR_RESTAURANTS.filter(r => {
      const matchCity = selectedCity === 'all' || r.city === selectedCity || r.city === 'pan-india';
      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchQuery = !q || 
        r.name.toLowerCase().includes(q) || 
        r.location.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q);
      return matchCity && matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCity, selectedCategory]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const matched = POPULAR_RESTAURANTS.find(r => 
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );

    if (matched) {
      handleOpenRating(matched);
    } else {
      const customRestaurant: RestaurantItem = {
        id: searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: searchQuery.trim(),
        city: 'mumbai',
        location: 'Custom Dine-In Outlet',
        tableCode: 'Table QR #01',
        cuisine: 'Multi-Cuisine',
        category: 'delivery',
        badge: 'COMMUNITY FOODSAFE AUDIT',
        score: '5.0',
        reviews: 1,
        lastCheck: 'Today',
        signals: {
          cold: { title: 'Cold < 5°C', subtitle: 'Storage Verified' },
          medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
          pest: { title: 'Pest Safe', subtitle: 'Routine Inspected' }
        }
      };
      handleOpenRating(customRestaurant);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fff7ed 50%, #f0fdf4 100%)',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: 36,
        paddingBottom: 40
      }}>
        <div className="container" style={{ maxWidth: 1180, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontSize: 11,
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 9999,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              DIGITAL FOOD-SAFETY SYSTEM
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 4.5vw, 48px)',
            lineHeight: 1.15,
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 10px',
            letterSpacing: '-0.02em'
          }}>
            Welcome to FoodSafe365
          </h1>

          {/* Customer Logged-in / Login Banner (Swiggy / Zomato style) */}
          <div style={{ marginBottom: 20 }}>
            {customerPhone ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: '#ffffff',
                border: '1.5px solid #86efac',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)',
                borderRadius: 9999,
                padding: '6px 18px',
                fontSize: 13,
                color: '#166534'
              }}>
                <span>👤 Logged in as <strong>+91 {customerPhone}</strong> (Verified Food-Safety Auditor)</span>
                <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>⭐ 50 Karma</span>
                <button
                  type="button"
                  onClick={handleLogoutCustomer}
                  style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(90deg, #fff7ed 0%, #fef3c7 100%)',
                border: '1.5px solid #fed7aa',
                boxShadow: '0 4px 12px rgba(255, 82, 0, 0.08)',
                borderRadius: 9999,
                padding: '6px 18px',
                fontSize: 13,
                color: '#9a3412',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                <span>👋 Eating out or ordering online? Rate food safety &amp; verify clean kitchens:</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpModal(true);
                    setOtpStep('phone');
                    setOtpError('');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '5px 14px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(255, 82, 0, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <Smartphone size={13} /> Customer Login with OTP →
                </button>
              </div>
            )}
          </div>

          <p style={{
            fontSize: 'clamp(15.5px, 2vw, 18px)',
            color: '#334155',
            margin: '0 auto 32px',
            maxWidth: 720,
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            The unified food hygiene platform for <strong>Restaurants</strong>, <strong>Customers</strong>, and <strong>Service Providers</strong>. Choose your onboarding to get started:
          </p>

          {/* 3 ONBOARDINGS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            textAlign: 'left'
          }}>
            {/* 1. RESTAURANT ONBOARDING (FEATURED / PRIMARY) */}
            <div className="card" style={{
              background: '#ffffff',
              border: '2px solid #059669',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.12)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    textTransform: 'uppercase'
                  }}>
                    RESTAURANT ONBOARDING
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Restaurants &amp; Kitchens
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Set up your outlet in 30 seconds. Run 2–3 min daily shift checks, avoid FDA/FSSAI closures, analyze AI trends, and generate your verified FoodSafe365 Passport.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>2–3 min time-phased daily kitchen checklists</li>
                  <li>Real-time cold-chain &amp; danger zone temperature tracking</li>
                  <li>Printable tabletop &amp; menu QR FoodSafe365 Passport</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/onboarding"
                  className="btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '11px 16px',
                    background: '#059669',
                    borderColor: '#059669',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Onboard Your Restaurant (Start Free) <ArrowRight size={16} />
                </Link>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/home" style={{ fontSize: 12, color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                    Already onboarded? Open Kitchen Operations →
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DINER ONBOARDING */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    textTransform: 'uppercase'
                  }}>
                    GENERAL PUBLIC / DINER
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Customers &amp; Diners
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Rate any restaurant on food safety in 60 seconds (5 pure hygiene questions + 100-word feedback), scan table QR codes, or discover verified clean kitchens near you.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>5 pure food safety rating questions + 100-word feedback</li>
                  <li>Scan tabletop QR codes to verify today&apos;s kitchen audit</li>
                  <li>Feedback delivered straight to the General Manager</li>
                </ul>
              </div>

              <div>
                {customerPhone ? (
                  <div style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: 12,
                    padding: '10px 14px',
                    marginBottom: 10,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} color="#16a34a" /> Verified Diner: +91 {customerPhone}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#15803d', marginTop: 2 }}>
                      ⭐ 50 FoodSafe Karma Active · Ratings Stamped as Verified
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpModal(true);
                      setOtpStep('phone');
                      setOtpError('');
                    }}
                    className="btn primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: 14,
                      padding: '11px 16px',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                      border: 'none',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(255, 82, 0, 0.25)',
                      cursor: 'pointer',
                      marginBottom: 10,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Smartphone size={16} /> Customer Sign In (Mobile OTP) →
                  </button>
                )}

                <a
                  href="#diner-section"
                  className="btn secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 13.5,
                    padding: '10px 16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#0f172a'
                  }}
                >
                  Rate a Restaurant / Find Safe Kitchens ↓
                </a>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/qr/the-table" style={{ fontSize: 12, color: '#ea580c', fontWeight: 600, textDecoration: 'none' }}>
                    Scan Tabletop QR Code Directly →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. SERVICE PROVIDER ONBOARDING */}
            <div className="card" style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    textTransform: 'uppercase'
                  }}>
                    ACCREDITED PARTNERS
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
                  For Service Providers
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
                  List your specialized compliance agency and connect directly with restaurants needing Pest Control, Food/Water Testing Labs, HVAC repair, and Staff Medical Tests.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
                  <li>Direct marketplace access to food service businesses</li>
                  <li>14 specialized compliance categories</li>
                  <li>Receive instant service quotation requests</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/providers"
                  className="btn secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '11px 16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#b45309'
                  }}
                >
                  Join as Service Provider →
                </Link>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/providers" style={{ fontSize: 12, color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                    Browse All 14 Provider Categories →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DINER RATING & DISCOVERY LAYER (For Customers & General Public) */}
      <section id="diner-section" className="container" style={{ maxWidth: 1180, paddingTop: 40, paddingBottom: 48 }}>
        <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 28px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>
            Rate Any Restaurant on Hygiene &amp; Food Safety
          </h2>
          <p className="muted" style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5 }}>
            Search a restaurant or scan its table QR code to submit a 60-second verified food safety audit:
          </p>

          {/* Quick Search & Rating Gateway Form */}
          <form onSubmit={handleSearchSubmit} style={{
            maxWidth: 640,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 16,
            padding: 8,
            border: '2px solid #059669',
            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 10 }}>
              <Search size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search restaurant (e.g. ABC Restaurant, Spice Pavilion)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  width: '100%',
                  color: '#0f172a',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              borderTop: '1px solid #f1f5f9',
              paddingTop: 8,
              flexWrap: 'wrap'
            }}>
              <button
                type="submit"
                className="btn primary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  background: '#059669',
                  borderColor: '#059669'
                }}
              >
                <Star size={16} /> Rate This Restaurant
              </button>
              <Link
                href="/qr/abc-restaurant"
                className="btn secondary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  color: '#0f172a'
                }}
              >
                <QrCode size={16} style={{ color: '#059669' }} /> Scan Table QR Code
              </Link>
            </div>
          </form>

          {/* 3 Quick Benefit Metrics */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 22,
            marginTop: 18,
            flexWrap: 'wrap',
            fontSize: 13,
            color: '#475569'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 5 Pure Food Safety Questions
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> 100-Word Additional Remarks
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#059669' }} /> Direct to General Manager
            </span>
          </div>
        </div>

        {/* Discovery Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Find FoodSafe365 Restaurants Near Me
              </h3>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13.5 }}>
              Discovered by diners. Verified daily through digital kitchen checklists and transparent hygiene audits.
            </p>
          </div>

          {/* Filter Pills: City & Format Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            {/* City Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Cities' },
                { id: 'mumbai', label: 'Mumbai' },
                { id: 'delhi', label: 'New Delhi' },
                { id: 'bengaluru', label: 'Bengaluru' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCity(tab.id as any)}
                  style={{
                    border: selectedCity === tab.id ? '2px solid #059669' : '1.5px solid #e2e8f0',
                    background: selectedCity === tab.id ? '#059669' : '#ffffff',
                    color: selectedCity === tab.id ? '#ffffff' : '#0f172a',
                    fontWeight: selectedCity === tab.id ? 700 : 600,
                    fontSize: 12.5,
                    borderRadius: 9999,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category / Format Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: '🍽️ All Formats' },
                { id: 'delivery', label: '🔥 Swiggy Popular & Delivery' },
                { id: 'fine_dine', label: '🍷 Fine Dining & Heritage' },
                { id: 'cafe', label: '☕ Cafés & Bakeries' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  style={{
                    border: selectedCategory === cat.id ? '2px solid #047857' : '1.5px solid #e2e8f0',
                    background: selectedCategory === cat.id ? '#ecfdf5' : '#ffffff',
                    color: selectedCategory === cat.id ? '#047857' : '#475569',
                    fontWeight: selectedCategory === cat.id ? 700 : 600,
                    fontSize: 12,
                    borderRadius: 9999,
                    padding: '4px 11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter / Filter status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 13, color: '#64748b' }}>
          <span>
            Showing <strong>{filteredRestaurants.length}</strong> verified restaurant{filteredRestaurants.length === 1 ? '' : 's'}
            {searchQuery && <> matching &ldquo;<strong>{searchQuery}</strong>&rdquo;</>}
          </span>
          {(searchQuery || selectedCity !== 'all' || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('all');
                setSelectedCategory('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: 600,
                fontSize: 12.5,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Restaurant Cards Grid (Swiggy / Zomato Styled Verified Tabletop Audit Cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {filteredRestaurants.map(r => (
            <div
              key={r.id}
              className="card"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderTop: '4px solid #ff5200',
                borderRadius: 18,
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 20px -4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span className="pill good" style={{ fontSize: 10.5, padding: '2px 8px', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <QrCode size={11} /> TABLETOP AUDIT VERIFIED
                    </span>
                    <h4 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#0f172a' }}>
                      {r.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                      {r.location} · {r.tableCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPassportModalRestaurant(r)}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 10,
                      padding: '6px 10px',
                      textAlign: 'center',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                    title="Click to view full verified kitchen passport"
                  >
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#047857', display: 'block', lineHeight: 1.1 }}>FOODSAFE</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>TODAY VERIFIED 🛡️</span>
                  </button>
                </div>

                {/* 3 Physical Signals Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginTop: 14,
                  marginBottom: 14,
                  padding: '10px 8px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: 10
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Thermometer size={16} color="#059669" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.cold.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.cold.subtitle}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <UserCheck size={16} color="#2563eb" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.medical.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.medical.subtitle}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <ShieldCheck size={16} color="#7c3aed" style={{ margin: '0 auto 3px' }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>{r.signals.pest.title}</div>
                    <div style={{ fontSize: 9.5, color: '#64748b' }}>{r.signals.pest.subtitle}</div>
                  </div>
                </div>

                {/* Swiggy/Zomato style Rating Badge Chip */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: '#64748b'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#047857',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 13,
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    <span>★</span>
                    <span>{r.score}</span>
                  </div>
                  <span>({r.reviews} verified diner audits)</span>
                </div>
              </div>

              {/* Dual Action Buttons (Swiggy / Zomato Inspired: Rate in 60s & View Passport) */}
              <div style={{
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => handleOpenRating(r)}
                  className="btn primary"
                  style={{
                    flex: '1 1 150px',
                    justifyContent: 'center',
                    fontSize: 13,
                    padding: '10px 12px',
                    background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                    borderColor: '#ea580c',
                    color: '#ffffff',
                    fontWeight: 700,
                    boxShadow: '0 3px 10px rgba(255, 82, 0, 0.25)',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={14} fill="#ffffff" /> Rate Safety (60s)
                </button>
                <button
                  type="button"
                  onClick={() => setPassportModalRestaurant(r)}
                  className="btn secondary"
                  style={{
                    flex: '1 1 130px',
                    justifyContent: 'center',
                    fontSize: 13,
                    padding: '10px 12px',
                    background: '#ecfdf5',
                    borderColor: '#a7f3d0',
                    color: '#047857',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={14} /> View Passport
                </button>
              </div>
            </div>
          ))}

          {/* Fallback card if no matches or to rate custom outlet */}
          {filteredRestaurants.length === 0 && (
            <div className="card" style={{
              gridColumn: '1 / -1',
              padding: '36px 24px',
              textAlign: 'center',
              background: '#ffffff',
              border: '2px dashed #ff5200',
              borderRadius: 18,
              boxShadow: '0 4px 12px rgba(255, 82, 0, 0.08)'
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
              <h4 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                {searchQuery ? `Can't find "${searchQuery}" in our directory?` : 'No restaurants found in this category'}
              </h4>
              <p style={{ fontSize: 14, color: '#475569', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
                {searchQuery
                  ? `No problem! FoodSafe365 lets you submit a direct 60-second verified Food Safety Audit & 100-word review for "${searchQuery}" right now.`
                  : 'Try selecting "All Cities" or "All Formats" above, or search for any restaurant by name.'}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    const customRestaurant: RestaurantItem = {
                      id: searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      name: searchQuery.trim(),
                      city: 'mumbai',
                      location: 'Custom Dine-In Outlet',
                      tableCode: 'Table QR #01',
                      cuisine: 'Multi-Cuisine',
                      category: 'delivery',
                      badge: 'COMMUNITY FOODSAFE AUDIT',
                      score: '5.0',
                      reviews: 1,
                      lastCheck: 'Today',
                      signals: {
                        cold: { title: 'Cold < 5°C', subtitle: 'Storage Verified' },
                        medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
                        pest: { title: 'Pest Safe', subtitle: 'Routine Inspected' }
                      }
                    };
                    handleOpenRating(customRestaurant);
                  }}
                  className="btn primary"
                  style={{
                    background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                    borderColor: '#ea580c',
                    padding: '12px 24px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 82, 0, 0.3)'
                  }}
                >
                  <Star size={16} fill="#ffffff" /> Rate &ldquo;{searchQuery}&rdquo; on Food Safety (5 Questions) →
                </button>
              )}
            </div>
          )}

          {/* Dynamic "Don't see your specific outlet branch?" card when searching */}
          {filteredRestaurants.length > 0 && searchQuery && (
            <div className="card" style={{
              gridColumn: '1 / -1',
              padding: '18px 24px',
              background: '#fff7ed',
              border: '1.5px dashed #fed7aa',
              borderRadius: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div>
                <strong style={{ color: '#9a3412', fontSize: 14 }}>Looking for a different branch of &ldquo;{searchQuery}&rdquo;?</strong>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Submit a custom audit for any outlet location in 60 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const customRestaurant: RestaurantItem = {
                    id: searchQuery.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    name: searchQuery.trim(),
                    city: 'mumbai',
                    location: 'Custom Branch',
                    tableCode: 'Table QR #01',
                    cuisine: 'Dine-In & Delivery',
                    category: 'delivery',
                    badge: 'COMMUNITY FOODSAFE AUDIT',
                    score: '5.0',
                    reviews: 1,
                    lastCheck: 'Today',
                    signals: {
                      cold: { title: 'Cold < 5°C', subtitle: 'Storage Verified' },
                      medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
                      pest: { title: 'Pest Safe', subtitle: 'Inspected' }
                    }
                  };
                  handleOpenRating(customRestaurant);
                }}
                className="btn secondary"
                style={{ fontSize: 13, padding: '8px 16px', fontWeight: 700, borderColor: '#ea580c', color: '#c2410c', background: '#ffffff', cursor: 'pointer' }}
              >
                Rate Custom &ldquo;{searchQuery}&rdquo; Outlet Now →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: '24px 0',
        marginTop: 'auto'
      }}>
        <div className="container" style={{
          maxWidth: 1180,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* POP-UP 1: CUSTOMER MOBILE OTP LOGIN MODAL (Swiggy / Zomato Style) */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 22,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top Bar with Close */}
            <div style={{
              background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
              padding: '24px 24px 20px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                <Smartphone size={12} /> CUSTOMER VERIFICATION
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Customer Mobile Sign In</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
                Submit verified restaurant food-safety ratings and earn Karma points.
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24 }}>
              {otpStep === 'phone' && (
                <form onSubmit={handleSendOtp}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    Enter 10-Digit Mobile Number
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 14px',
                    gap: 10,
                    marginBottom: 12,
                    background: '#f8fafc'
                  }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>🇮🇳 +91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      autoFocus
                      placeholder="9876543210"
                      value={inputPhone}
                      onChange={e => setInputPhone(e.target.value.replace(/\D/g, ''))}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: 16,
                        width: '100%',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: 'transparent'
                      }}
                    />
                  </div>

                  {otpError && (
                    <div style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertCircle size={14} /> {otpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                      borderColor: '#ea580c',
                      fontSize: 15,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 82, 0, 0.3)'
                    }}
                  >
                    Send OTP (Instant SMS) →
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: '#64748b' }}>
                    By proceeding, you agree to FoodSafe365 terms &amp; community hygiene guidelines.
                  </div>
                </form>
              )}

              {otpStep === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13.5, color: '#475569' }}>
                      We sent a 4-digit code to <strong>+91 {inputPhone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      style={{ background: 'none', border: 'none', color: '#ff5200', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change number
                    </button>
                  </div>

                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>
                    Enter 4-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    autoFocus
                    placeholder="3650"
                    value={inputOtp}
                    onChange={e => setInputOtp(e.target.value)}
                    style={{
                      border: '2px solid #ff5200',
                      borderRadius: 12,
                      padding: '12px',
                      fontSize: 24,
                      fontWeight: 900,
                      textAlign: 'center',
                      letterSpacing: '0.4em',
                      width: '100%',
                      boxSizing: 'border-box',
                      marginBottom: 12
                    }}
                  />

                  {/* 1-Click Demo Auto-fill Helper */}
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <button
                      type="button"
                      onClick={() => setInputOtp('3650')}
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#047857',
                        borderRadius: 9999,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ One-Click Test: Fill Demo OTP (3650)
                    </button>
                  </div>

                  {otpError && (
                    <div style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 12, textAlign: 'center' }}>
                      {otpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      borderColor: '#047857',
                      fontSize: 15,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Verify &amp; Continue →
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#64748b' }}>
                    {otpTimer > 0 ? (
                      <span>Resend code in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOtpTimer(30)}
                        style={{ background: 'none', border: 'none', color: '#ff5200', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Resend OTP Now
                      </button>
                    )}
                  </div>
                </form>
              )}

              {otpStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={32} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#0f172a' }}>
                    Verified Successfully!
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#475569' }}>
                    Welcome to FoodSafe365! Your diner ratings will be stamped with the <strong>Verified Diner Audit</strong> seal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP 2: 60-SECOND INTERACTIVE FOOD SAFETY RATING MODAL */}
      {/* ========================================================================= */}
      {ratingModalRestaurant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 22,
            maxWidth: 580,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <span style={{
                  background: '#ff5200',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  textTransform: 'uppercase'
                }}>
                  60-SECOND DINER AUDIT
                </span>
                <h3 style={{ margin: '6px 0 2px', fontSize: 21, fontWeight: 900, color: '#ffffff' }}>
                  {ratingModalRestaurant.name}
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8' }}>
                  {ratingModalRestaurant.location} · {ratingModalRestaurant.cuisine}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingModalRestaurant(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmitRating} style={{ padding: 24, overflowY: 'auto' }}>
              {/* Table code input */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#f8fafc', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Table Number / Seat Code:</span>
                <input
                  type="text"
                  value={rateTableNum}
                  onChange={e => setRateTableNum(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 13,
                    fontWeight: 700,
                    width: 100,
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* 5 Food Safety Questions with clickable stars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {[
                  { key: 'q1', label: '1. Table & Cutlery Hygiene', desc: 'Are tables, glasses, and utensils clean & sanitized?' },
                  { key: 'q2', label: '2. Staff Grooming & Uniform', desc: 'Are chefs & service staff wearing clean uniforms and aprons?' },
                  { key: 'q3', label: '3. Food Freshness & Temp', desc: 'Was hot food served steaming (≥75°C) & cold food fresh?' },
                  { key: 'q4', label: '4. Washroom & Hand-Wash Sink', desc: 'Is hand soap and clean water available at wash stations?' },
                  { key: 'q5', label: '5. Overall Food Safety Confidence', desc: 'Would you comfortably recommend this kitchen to family?' },
                ].map(item => {
                  const val = (rateScores as any)[item.key];
                  return (
                    <div key={item.key} style={{ background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 13.5, color: '#0f172a' }}>{item.label}</strong>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRateScores(prev => ({ ...prev, [item.key]: star }))}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                color: star <= val ? '#ff5200' : '#cbd5e1',
                                fontSize: 18
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* 100-Word Feedback Remark */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    100-Word Additional Feedback for General Manager:
                  </label>
                  <span style={{ fontSize: 11.5, color: '#64748b' }}>
                    {rateRemarks.split(/\s+/).filter(Boolean).length} / 100 words
                  </span>
                </div>
                <textarea
                  value={rateRemarks}
                  onChange={e => setRateRemarks(e.target.value)}
                  placeholder="e.g. Counters were spotless, hot soup was delivered at perfect temperature. Staff washed hands regularly."
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    color: '#0f172a'
                  }}
                />
              </div>

              {/* Verified Attribution Note */}
              <div style={{
                background: customerPhone ? '#ecfdf5' : '#fff7ed',
                border: customerPhone ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                color: customerPhone ? '#047857' : '#9a3412',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ShieldCheck size={16} />
                <span>
                  {customerPhone ? (
                    <>Submitting as <strong>+91 {customerPhone}</strong> (Verified Food-Safety Auditor)</>
                  ) : (
                    <>Submitting as Guest. <button type="button" onClick={() => setShowOtpModal(true)} style={{ background: 'none', border: 'none', color: '#ff5200', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign in with OTP</button> to earn Karma.</>
                  )}
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="btn primary"
                  style={{
                    flex: '1 1 200px',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                    borderColor: '#ea580c',
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 82, 0, 0.3)'
                  }}
                >
                  {isSubmittingRating ? 'Delivering to GM...' : '🚀 Submit Verified Audit to GM'}
                </button>
                <Link
                  href={`/qr/${ratingModalRestaurant.id}`}
                  className="btn secondary"
                  style={{
                    padding: '12px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: '#0f172a'
                  }}
                >
                  Open Full Page →
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP 3: FOODSAFE SAFETY PASSPORT QUICK-PEEK MODAL */}
      {/* ========================================================================= */}
      {passportModalRestaurant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 22,
            maxWidth: 520,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              padding: '22px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <span style={{
                  background: 'rgba(255,255,255,0.25)',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  textTransform: 'uppercase'
                }}>
                  VERIFIED FOOD-SAFETY PASSPORT
                </span>
                <h3 style={{ margin: '6px 0 2px', fontSize: 22, fontWeight: 900, color: '#ffffff' }}>
                  {passportModalRestaurant.name}
                </h3>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
                  {passportModalRestaurant.location}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPassportModalRestaurant(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  padding: '8px 18px',
                  borderRadius: 9999,
                  color: '#047857',
                  fontWeight: 800,
                  fontSize: 14
                }}>
                  <ShieldCheck size={20} /> PASSPORT STATUS: ACTIVE &amp; VERIFIED TODAY
                </div>
              </div>

              {/* 4 Core Pillars Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chiller Temp</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#059669', marginTop: 2 }}>{passportModalRestaurant.signals.cold.title}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{passportModalRestaurant.signals.cold.subtitle}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Staff Health</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#2563eb', marginTop: 2 }}>{passportModalRestaurant.signals.medical.title}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{passportModalRestaurant.signals.medical.subtitle}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pest Audit</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#7c3aed', marginTop: 2 }}>{passportModalRestaurant.signals.pest.title}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{passportModalRestaurant.signals.pest.subtitle}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Diner Score</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#ea580c', marginTop: 2 }}>★ {passportModalRestaurant.score} / 5.0</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{passportModalRestaurant.reviews} verified audits</div>
                </div>
              </div>

              {/* Table QR Instructions */}
              <div style={{
                background: '#f1f5f9',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1' }}>
                  <QrCode size={26} color="#059669" />
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>Tabletop QR Passport Displayed in Dining Room</strong>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    Guests can scan the acrylic stand on {passportModalRestaurant.tableCode} to verify today&apos;s inspection live.
                  </p>
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    const target = passportModalRestaurant;
                    setPassportModalRestaurant(null);
                    handleOpenRating(target);
                  }}
                  className="btn primary"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                    borderColor: '#ea580c',
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '11px',
                    borderRadius: 12,
                    cursor: 'pointer'
                  }}
                >
                  ⭐ Rate This Restaurant (60s)
                </button>
                <button
                  type="button"
                  onClick={() => setPassportModalRestaurant(null)}
                  className="btn secondary"
                  style={{ padding: '11px 18px', fontSize: 13, fontWeight: 700 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING CELEBRATION TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: 14,
          padding: '14px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 380,
          border: '1px solid #334155',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Sparkles size={20} color="#ff5200" />
          <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, marginLeft: 'auto' }}
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
