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
  AlertCircle,
  Clock,
  Layers,
  Droplets,
  HeartPulse,
  Mail,
  KeyRound
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { POPULAR_RESTAURANTS, RestaurantItem } from '@/lib/restaurantsData';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  DinerSafetyRating,
  AuditTrailEvent
} from '@/lib/foodsafety28';

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'delivery' | 'fine_dine' | 'cafe'>('all');

  // Universal Sign-in State (Mobile or Email for Diner, Restaurant Owner, Service Provider)
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loginRole, setLoginRole] = useState<'diner' | 'restaurant' | 'provider'>('diner');
  const [loginMethod, setLoginMethod] = useState<'mobile' | 'email'>('mobile');
  const [inputPhone, setInputPhone] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'success'>('phone');

  // Custom Diner-Added Restaurants State
  const [customRestaurants, setCustomRestaurants] = useState<RestaurantItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestCity, setNewRestCity] = useState('kolkata');
  const [newRestLocation, setNewRestLocation] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('');
  const [newRestTable, setNewRestTable] = useState('Table QR #01');
  const [addError, setAddError] = useState('');

  // Rating Modal State
  const [ratingModalRestaurant, setRatingModalRestaurant] = useState<RestaurantItem | null>(null);
  const [rateTableNum, setRateTableNum] = useState('Table 4');
  const [rateScores, setRateScores] = useState({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 });
  const [rateRemarks, setRateRemarks] = useState('');
  const [wantsFeedback, setWantsFeedback] = useState(false);
  const [dinerEmail, setDinerEmail] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingConfirmation, setRatingConfirmation] = useState<{
    restaurantName: string;
    score: string;
    table: string;
    wantsFeedback: boolean;
    email?: string;
  } | null>(null);

  // QR Code Scanner / Manual Lookup Modal State
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [inputQrCode, setInputQrCode] = useState('');
  const [qrSearchError, setQrSearchError] = useState('');

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
      const em = localStorage.getItem('foodsafe365_customer_email');
      if (em) setCustomerEmail(em);

      const savedCustom = localStorage.getItem('foodsafe365_custom_restaurants');
      if (savedCustom) {
        try {
          setCustomRestaurants(JSON.parse(savedCustom));
        } catch {}
      }

      const handleOpenOtp = () => {
        setShowOtpModal(true);
        setOtpStep('phone');
        setOtpError('');
      };
      const handleAuthUpdate = () => {
        const updatedPhone = localStorage.getItem('foodsafe365_customer_phone');
        setCustomerPhone(updatedPhone);
        const updatedEmail = localStorage.getItem('foodsafe365_customer_email');
        setCustomerEmail(updatedEmail);
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
    if (loginMethod === 'mobile') {
      const clean = inputPhone.replace(/\D/g, '');
      if (clean.length < 10) {
        setOtpError('Please enter a valid 10-digit mobile number');
        return;
      }
    } else {
      const em = inputEmail.trim();
      if (!em || !em.includes('@') || !em.includes('.')) {
        setOtpError('Please enter a valid email address');
        return;
      }
    }
    setOtpError('');
    setOtpStep('otp');
    setOtpTimer(30);
  }

  function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!inputOtp.trim()) {
      setOtpError('Please enter the 4-digit verification code');
      return;
    }
    setOtpError('');
    setOtpStep('success');

    const identifier = loginMethod === 'mobile' ? `+91 ${inputPhone.replace(/\D/g, '')}` : inputEmail.trim();

    if (typeof window !== 'undefined') {
      if (loginRole === 'restaurant') {
        localStorage.setItem('foodsafe365_restaurant_user', JSON.stringify({
          identifier,
          method: loginMethod,
          role: 'Restaurant Owner / Manager',
          timestamp: new Date().toISOString()
        }));
      } else if (loginRole === 'provider') {
        localStorage.setItem('foodsafe365_provider_user', JSON.stringify({
          identifier,
          method: loginMethod,
          role: 'Service Provider Partner',
          timestamp: new Date().toISOString()
        }));
      } else {
        if (loginMethod === 'mobile') {
          const clean = inputPhone.replace(/\D/g, '');
          localStorage.setItem('foodsafe365_customer_phone', clean);
          setCustomerPhone(clean);
        } else {
          const em = inputEmail.trim();
          localStorage.setItem('foodsafe365_customer_email', em);
          setCustomerEmail(em);
        }
        localStorage.setItem('foodsafe365_diner_user', JSON.stringify({
          identifier,
          name: `Diner (${identifier})`,
          verifiedAt: new Date().toISOString()
        }));
        window.dispatchEvent(new CustomEvent('customer-auth-changed'));
      }
    }

    setTimeout(() => {
      setShowOtpModal(false);
      setOtpStep('phone');
      setInputOtp('');

      if (loginRole === 'restaurant') {
        showToast(`🎉 Welcome Restaurant Owner (${identifier})! Opening Kitchen Operations...`);
        router.push('/home');
      } else if (loginRole === 'provider') {
        showToast(`🎉 Welcome Service Partner (${identifier})! Opening Marketplace...`);
        router.push('/providers');
      } else {
        showToast(`🎉 Welcome Diner (${identifier})! Your ratings are now verified with +50 Karma.`);
      }
    }, 1100);
  }

  function handleLogoutCustomer() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('foodsafe365_customer_phone');
      localStorage.removeItem('foodsafe365_customer_email');
      localStorage.removeItem('foodsafe365_diner_user');
      window.dispatchEvent(new CustomEvent('customer-auth-changed'));
    }
    setCustomerPhone(null);
    setCustomerEmail(null);
    showToast('Logged out of diner profile');
  }

  function handleOpenRating(restaurant: RestaurantItem) {
    setRatingModalRestaurant(restaurant);
    setRateScores({ q1: 5, q2: 5, q3: 5, q4: 5, q5: 5 });
    setRateRemarks('');
    setRateTableNum(restaurant.tableCode || 'Table 4');
    setWantsFeedback(false);
    setDinerEmail(customerEmail || '');
    setRatingConfirmation(null);
  }

  async function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingModalRestaurant) return;
    setIsSubmittingRating(true);

    const avgScore = (
      (rateScores.q1 + rateScores.q2 + rateScores.q3 + rateScores.q4 + rateScores.q5) / 5
    ).toFixed(1);

    const newRating: DinerSafetyRating = {
      id: 'cfr_' + Date.now(),
      outletId: ratingModalRestaurant.id,
      outletName: ratingModalRestaurant.name,
      createdAt: new Date().toISOString(),
      dinerName: customerPhone ? `Verified Diner (+91 ${customerPhone.slice(0, 5)}...)` : 'Verified Diner',
      dinerMobile: customerPhone ? `+91 ${customerPhone}` : undefined,
      tableNumber: rateTableNum,
      scores: {
        cleanliness: rateScores.q1,
        staffHygiene: rateScores.q2,
        foodFreshness: rateScores.q3,
        safeWater: rateScores.q4,
        washroom: rateScores.q5
      },
      overallScore: parseFloat(avgScore),
      feedback: rateRemarks.trim() || undefined,
      verifiedDineIn: true
    };

    // 1. Persist to server / database API so it is retrievable across devices
    try {
      const res = await fetch('/api/v1/customer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRating)
      });
      if (!res.ok) {
        console.warn('[handleSubmitRating] Server API returned status:', res.status);
      }
    } catch (apiErr) {
      console.warn('[handleSubmitRating] Server API fetch failed, proceeding with local backup:', apiErr);
    }

    // 2. Also update local storage for immediate responsiveness
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
        const state: AppPhase1State = raw ? JSON.parse(raw) : {};
        state.dinerRatings = [newRating, ...(state.dinerRatings || [])];

        const newEvent: AuditTrailEvent = {
          id: `event-${Date.now()}`,
          at: new Date().toISOString(),
          type: 'Customer Food-Safety Feedback Received',
          detail: `Customer at ${rateTableNum} submitted feedback (${avgScore}/5★) for ${ratingModalRestaurant.name}.`,
          status: 'customer_feedback'
        };
        state.timeline = [newEvent, ...(state.timeline || [])];

        localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new Event('foodsaf365:update'));
      } catch {}

      const existing = JSON.parse(localStorage.getItem('foodsafe365_diner_ratings') || '[]');
      localStorage.setItem('foodsafe365_diner_ratings', JSON.stringify([newRating, ...existing]));
      window.dispatchEvent(new CustomEvent('foodsafe-rating-submitted'));
    }

    setIsSubmittingRating(false);
    setRatingConfirmation({
      restaurantName: ratingModalRestaurant.name,
      score: avgScore,
      table: rateTableNum,
      wantsFeedback,
      email: wantsFeedback && dinerEmail.trim() ? dinerEmail.trim() : (customerEmail || undefined)
    });
    const feedbackMsg = wantsFeedback && dinerEmail.trim() ? ` Direct resolution will be sent to ${dinerEmail.trim()}.` : '';
    showToast(`⭐ Thank you! Your ${avgScore}★ Customer Feedback for ${ratingModalRestaurant.name} was saved and delivered to restaurant management.${feedbackMsg}`);
  }

  function handleAddRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (!newRestName.trim()) {
      setAddError('Please enter the restaurant name');
      return;
    }
    setAddError('');

    const slug = newRestName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cityName = newRestCity.charAt(0).toUpperCase() + newRestCity.slice(1);
    const newRest: RestaurantItem = {
      id: slug,
      name: newRestName.trim(),
      city: newRestCity,
      location: newRestLocation.trim() ? `${newRestLocation.trim()}, ${cityName}` : cityName,
      tableCode: newRestTable.trim() || 'Table QR #01',
      cuisine: newRestCuisine.trim() || 'Dine-In & Delivery',
      category: 'swiggy_popular',
      badge: 'FOODSAFE TODAY VERIFIED',
      score: '5.0',
      reviews: 1,
      lastCheck: 'Just Now',
      signals: {
        cold: { title: 'Cold < 5°C', subtitle: 'Storage Verified' },
        medical: { title: '100% Medical', subtitle: 'Form 1A Cleared' },
        pest: { title: 'Pest Safe', subtitle: 'Inspected' }
      }
    };

    const updated = [newRest, ...customRestaurants];
    setCustomRestaurants(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('foodsafe365_custom_restaurants', JSON.stringify(updated));
    }

    setSearchQuery(newRest.name);
    setShowAddModal(false);
    showToast(`🎉 "${newRest.name}" added to FoodSafe365! Its verified badge is now displayed.`);
  }

  const allRestaurants = useMemo(() => {
    return [...customRestaurants, ...POPULAR_RESTAURANTS];
  }, [customRestaurants]);

  // Declutter Moat: Only show badges when the user has typed or chosen a city
  const isSearchActive = Boolean(searchQuery.trim() || selectedCity !== 'all' || selectedCategory !== 'all');

  const filteredRestaurants = useMemo(() => {
    if (!isSearchActive) {
      return [];
    }

    const q = searchQuery.toLowerCase().trim();
    return allRestaurants.filter(r => {
      const matchCity = selectedCity === 'all' || r.city.toLowerCase() === selectedCity.toLowerCase() || r.city === 'pan-india';
      const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
      const matchQuery = !q || 
        r.name.toLowerCase().includes(q) || 
        r.location.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q);
      return matchCity && matchCategory && matchQuery;
    });
  }, [searchQuery, selectedCity, selectedCategory, allRestaurants, isSearchActive]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const cleanQr = q.replace(/^https?:\/\/[^\/]+\/qr\//, '').replace(/^table\s*qr\s*#?/i, '').trim();

    const matched = allRestaurants.find(r => 
      r.name.toLowerCase() === q ||
      r.id.toLowerCase() === q ||
      r.id.toLowerCase() === cleanQr ||
      r.tableCode.toLowerCase() === q ||
      r.tableCode.toLowerCase().includes(cleanQr) ||
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );

    if (matched) {
      handleOpenRating(matched);
      showToast(`🎯 Found ${matched.name} (${matched.tableCode}). Opening Customer Feedback...`);
    } else {
      setNewRestName(searchQuery.trim());
      setShowAddModal(true);
    }
  }

  function handleQrLookup(qrCodeString: string) {
    const q = qrCodeString.trim().toLowerCase();
    const cleanQr = q.replace(/^https?:\/\/[^\/]+\/qr\//, '').replace(/^table\s*qr\s*#?/i, '').trim();

    const matched = allRestaurants.find(r => 
      r.id.toLowerCase() === q ||
      r.id.toLowerCase() === cleanQr ||
      r.tableCode.toLowerCase() === q ||
      r.tableCode.toLowerCase().includes(cleanQr) ||
      r.name.toLowerCase() === q ||
      r.name.toLowerCase().includes(q)
    );

    if (matched) {
      setShowQrScanModal(false);
      setInputQrCode('');
      setQrSearchError('');
      handleOpenRating(matched);
      showToast(`🎯 QR Code Verified: ${matched.name} (${matched.tableCode})`);
    } else {
      setQrSearchError(`No restaurant matches QR code "${qrCodeString}". Please check the code or search by restaurant name.`);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F7F8F5' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #F9FAF7 0%, #F4F6F0 100%)',
        borderBottom: '1px solid #E2E8F0',
        paddingTop: 48,
        paddingBottom: 52
      }}>
        <div className="container" style={{ maxWidth: 1180, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#047857',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: 11,
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 9999,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              DIGITAL FOOD-SAFETY SYSTEM
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 4.8vw, 50px)',
            lineHeight: 1.15,
            fontWeight: 900,
            color: '#0F2922',
            margin: '0 0 12px',
            letterSpacing: '-0.025em'
          }}>
            Welcome to FoodSafe365
          </h1>

          {/* Customer Logged-in / Login Banner */}
          <div style={{ marginBottom: 22 }}>
            {customerPhone ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                borderRadius: 9999,
                padding: '7px 20px',
                fontSize: 13,
                color: '#047857'
              }}>
                <span>👤 Logged in as <strong style={{ color: '#064e3b' }}>+91 {customerPhone}</strong> (Verified Food-Safety Auditor)</span>
                <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>⭐ 50 Karma</span>
                <button
                  type="button"
                  onClick={handleLogoutCustomer}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: '#ffffff',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                borderRadius: 9999,
                padding: '7px 20px',
                fontSize: 13,
                color: '#334155',
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
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '6px 16px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Smartphone size={13} /> Customer Login with OTP →
                </button>
              </div>
            )}
          </div>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 18.5px)',
            color: '#475569',
            margin: '0 auto 36px',
            maxWidth: 760,
            lineHeight: 1.55,
            fontWeight: 500
          }}>
            The unified food hygiene platform for <strong style={{ color: '#0F2922', fontWeight: 700 }}>Restaurants</strong>, <strong style={{ color: '#0F2922', fontWeight: 700 }}>Customers</strong>, and <strong style={{ color: '#0F2922', fontWeight: 700 }}>Service Providers</strong>. Choose your onboarding to get started:
          </p>

          {/* 3 ONBOARDINGS GRID (DARK SOPHISTICATED CARDS ON LIGHT CANVAS) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 22,
            textAlign: 'left'
          }}>
            {/* 1. RESTAURANT ONBOARDING (FEATURED / PRIMARY) */}
            <div className="card onboarding-card-dark" style={{
              background: '#17231F',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 20,
              padding: '26px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px -8px rgba(15, 35, 28, 0.35)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    RESTAURANT ONBOARDING
                  </span>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
                  For Restaurants &amp; Kitchens
                </h3>
                <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 18px' }}>
                  Set up your outlet in 30 seconds. Run 2–3 min daily shift checks, avoid FDA/FSSAI closures, analyze AI trends, and generate your verified FoodSafe365 Passport.
                </p>

                <ul style={{ margin: '0 0 22px', paddingLeft: 18, fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>
                  <li>2–3 min time-phased daily kitchen checklists</li>
                  <li>Real-time cold-chain &amp; danger zone temperature tracking</li>
                  <li>Print tabletop &amp; menu QR FoodSafe365 Passport</li>
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
                    padding: '12px 16px',
                    background: '#059669',
                    borderColor: '#059669',
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  Onboard Your Restaurant (Start Free) <ArrowRight size={16} />
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'center', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('restaurant');
                      setShowOtpModal(true);
                      setOtpStep('phone');
                      setOtpError('');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f1f5f9',
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <KeyRound size={13} /> Restaurant Sign In (Mobile or Email) →
                  </button>
                  <Link href="/home" style={{ fontSize: 12, color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
                    Already onboarded? Open Kitchen Operations →
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DINER ONBOARDING (POLISHED STRATEGIC HUB) */}
            <div className="card onboarding-card-dark diner-card" style={{
              background: '#182822',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 20,
              padding: '26px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px -8px rgba(18, 40, 34, 0.4)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    FOR CUSTOMERS &amp; DINERS
                  </span>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
                  For Customers &amp; Diners
                </h3>
                <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 18px' }}>
                  Scan restaurant or table QR codes, view verified food-safety status, rate kitchens in 60 seconds, and share direct feedback with management.
                </p>

                <ul style={{ margin: '0 0 22px', paddingLeft: 18, fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>
                  <li>Scan tabletop QR codes &amp; view Food Safety Passport</li>
                  <li>5 pure food-safety check indicators + 100-word feedback</li>
                  <li>Latest checks completed &amp; verified kitchen audit logs</li>
                </ul>
              </div>

              <div>
                {customerPhone ? (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid rgba(52, 211, 153, 0.4)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    marginBottom: 10,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <CheckCircle2 size={16} color="#34d399" /> Verified Diner: +91 {customerPhone}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#a7f3d0', marginTop: 2 }}>
                      ⭐ 50 FoodSafe Karma Active · Ratings Stamped as Verified
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('diner');
                      setShowOtpModal(true);
                      setOtpStep('phone');
                      setOtpError('');
                    }}
                    className="btn primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: 14,
                      padding: '12px 16px',
                      fontWeight: 700,
                      background: '#059669',
                      border: 'none',
                      color: '#ffffff',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                      cursor: 'pointer',
                      marginBottom: 10,
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Smartphone size={16} /> Customer Sign In (Mobile or Email) →
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
                    color: '#f1f5f9',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: 12
                  }}
                >
                  Rate a Restaurant / Find Safe Kitchens ↓
                </a>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/qr/the-table" style={{ fontSize: 12, color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
                    Scan Tabletop QR Code Directly →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. SERVICE PROVIDER ONBOARDING (B2B MARKETPLACE) */}
            <div className="card onboarding-card-dark" style={{
              background: '#17231F',
              border: '1.5px solid rgba(52, 211, 153, 0.3)',
              borderRadius: 20,
              padding: '26px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px -8px rgba(15, 35, 28, 0.35)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: 'rgba(52, 211, 153, 0.16)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    ACCREDITED B2B PARTNERS
                  </span>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
                  For Service Providers
                </h3>
                <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.55, margin: '0 0 18px' }}>
                  Connect with commercial restaurants needing Pest Control, Food/Water Testing Labs, HVAC refrigeration, Staff Medical Examinations, and Sanitation.
                </p>

                <ul style={{ margin: '0 0 22px', paddingLeft: 18, fontSize: 13, color: '#e2e8f0', lineHeight: 1.65 }}>
                  <li>Direct B2B marketplace connecting with verified kitchens</li>
                  <li>14 compliance &amp; NABL testing lab categories</li>
                  <li>Receive real-time service quotation requests</li>
                </ul>
              </div>

              <div>
                <Link
                  href="/providers"
                  className="btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: 14,
                    padding: '12px 16px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: '#ffffff',
                    background: '#059669',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                    marginBottom: 8
                  }}
                >
                  Join as Service Provider →
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'center', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRole('provider');
                      setShowOtpModal(true);
                      setOtpStep('phone');
                      setOtpError('');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f1f5f9',
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <KeyRound size={13} /> Provider Sign In (Mobile or Email) →
                  </button>
                  <Link href="/providers" style={{ fontSize: 12, color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
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
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F2922', margin: '0 0 8px' }}>
            Rate Any Restaurant on Hygiene &amp; Food Safety
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5, color: '#475569' }}>
            Search a restaurant or scan its table QR code to submit a 60-second verified food safety audit:
          </p>

          {/* Quick Search & Rating Gateway Form */}
          <form onSubmit={handleSearchSubmit} style={{
            maxWidth: 640,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 16,
            padding: 8,
            border: '1.5px solid #CBD5E1',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 10 }}>
              <Search size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search restaurant (e.g. Peter Cat, Paradise, The Table)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  width: '100%',
                  color: '#0F172A',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#94A3B8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              borderTop: '1px solid #E2E8F0',
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
                  borderColor: '#059669',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                <Star size={16} fill="#ffffff" /> Rate This Restaurant
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQrScanModal(true);
                  setQrSearchError('');
                  setInputQrCode('');
                }}
                className="btn secondary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#059669',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={16} style={{ color: '#059669' }} /> Scan / Enter Table QR
              </button>
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
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F2922', margin: 0 }}>
                Find FoodSafe365 Restaurants Near Me
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#64748B' }}>
              Discovered by diners. Verified daily through digital kitchen checklists and transparent hygiene audits.
            </p>
          </div>

          {/* Filter Pills: City & Format Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            {/* City Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Cities' },
                { id: 'kolkata', label: 'Kolkata' },
                { id: 'hyderabad', label: 'Hyderabad' },
                { id: 'pune', label: 'Pune' },
                { id: 'leh', label: 'Leh (Ladakh)' },
                { id: 'mumbai', label: 'Mumbai' },
                { id: 'delhi', label: 'New Delhi' },
                { id: 'jaipur', label: 'Jaipur' },
                { id: 'chandigarh', label: 'Chandigarh' },
                { id: 'agra', label: 'Agra' },
                { id: 'bengaluru', label: 'Bengaluru' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCity(tab.id)}
                  style={{
                    border: selectedCity === tab.id ? '1.5px solid #059669' : '1.5px solid #E2E8F0',
                    background: selectedCity === tab.id ? '#059669' : '#ffffff',
                    color: selectedCity === tab.id ? '#ffffff' : '#475569',
                    fontWeight: selectedCity === tab.id ? 700 : 600,
                    fontSize: 12.5,
                    borderRadius: 9999,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedCity === tab.id ? '0 2px 8px rgba(5, 150, 105, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category / Format Tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'all', label: '🍽️ All Formats' },
                { id: 'delivery', label: '🔥 Popular & Delivery' },
                { id: 'fine_dine', label: '🍷 Fine Dining & Heritage' },
                { id: 'cafe', label: '☕ Cafés & Bakeries' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  style={{
                    border: selectedCategory === cat.id ? '1.5px solid #047857' : '1.5px solid #E2E8F0',
                    background: selectedCategory === cat.id ? '#047857' : '#ffffff',
                    color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                    fontWeight: selectedCategory === cat.id ? 700 : 600,
                    fontSize: 12,
                    borderRadius: 9999,
                    padding: '4px 11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedCategory === cat.id ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              ))}

              {/* Add Restaurant button in filter bar */}
              <button
                type="button"
                onClick={() => {
                  setNewRestName(searchQuery.trim());
                  setShowAddModal(true);
                }}
                style={{
                  border: '1.5px dashed #059669',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: 12,
                  borderRadius: 9999,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>➕</span> Add Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter / Filter status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13, color: '#475569', flexWrap: 'wrap', gap: 8 }}>
          {isSearchActive ? (
            <span>
              Showing <strong style={{ color: '#0F2922' }}>{filteredRestaurants.length}</strong> matching verified restaurant{filteredRestaurants.length === 1 ? '' : 's'}
              {searchQuery && <> for &ldquo;<strong style={{ color: '#0F2922' }}>{searchQuery}</strong>&rdquo;</>}
              {selectedCity !== 'all' && <> in <strong style={{ color: '#0F2922' }}>{selectedCity.toUpperCase()}</strong></>}
            </span>
          ) : (
            <span style={{ color: '#475569', fontSize: 13.5 }}>
              💡 Type a restaurant name or choose a city above to inspect its verified FoodSafe365 badge:
            </span>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setNewRestName(searchQuery.trim());
                setShowAddModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>➕</span> Add New Restaurant
            </button>

            {isSearchActive && (
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
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNCLUTTERED STATE: When not searching, show clean guide & popular icons */}
        {/* ========================================================================= */}
        {!isSearchActive && (
          <div style={{
            background: '#ffffff',
            border: '1.5px dashed #CBD5E1',
            borderRadius: 20,
            padding: '36px 24px',
            textAlign: 'center',
            maxWidth: 780,
            margin: '0 auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <h3 style={{ fontSize: 21, fontWeight: 900, color: '#0F2922', margin: '0 0 6px' }}>
              Search Any Restaurant to Reveal Its Food-Safety Badge
            </h3>
            <p style={{ fontSize: 14, color: '#475569', maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Type any dining brand or delivery kitchen name above. Verified cold-storage logs, medical clearances, and live table QR ratings will appear instantly.
            </p>

            {/* Quick Trending Dining & Search Chips */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', alignSelf: 'center' }}>Try searching:</span>
              {[
                { name: 'Peter Cat', city: 'Kolkata' },
                { name: 'Paradise Biryani', city: 'Hyderabad' },
                { name: 'The Table', city: 'Mumbai' },
                { name: 'Rawat Mishtan', city: 'Jaipur' },
                { name: 'Pal Dhaba', city: 'Chandigarh' },
                { name: 'Peshawri', city: 'Agra' },
                { name: 'Bawarchi', city: 'Hyderabad' },
                { name: 'Mocambo', city: 'Kolkata' },
                { name: 'Flurys', city: 'Kolkata' },
                { name: 'Bastian', city: 'Mumbai' },
                { name: 'LMB', city: 'Jaipur' },
              ].map(pill => (
                <button
                  key={pill.name}
                  type="button"
                  onClick={() => setSearchQuery(pill.name)}
                  style={{
                    background: '#F8FAF6',
                    border: '1px solid #E2E8F0',
                    color: '#1E293B',
                    borderRadius: 9999,
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>🔥</span> {pill.name} <span style={{ fontSize: 11, color: '#059669' }}>({pill.city})</span>
                </button>
              ))}
            </div>

            {/* Client Add Restaurant Action */}
            <button
              type="button"
              onClick={() => {
                setNewRestName('');
                setShowAddModal(true);
              }}
              className="btn secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#059669',
                background: 'rgba(16, 185, 129, 0.1)',
                cursor: 'pointer'
              }}
            >
              <span>➕</span> Restaurant not listed? Add it to FoodSafe365
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DYNAMIC BADGE REVEAL: Cards appear dynamically when user searches */}
        {/* ========================================================================= */}
        {isSearchActive && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
            {filteredRestaurants.map(r => (
              <div
                key={r.id}
                className="card"
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderTop: '4px solid #059669',
                  borderRadius: 18,
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="pill good" style={{ fontSize: 10.5, padding: '2px 8px', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        <QrCode size={11} /> TABLETOP AUDIT VERIFIED
                      </span>
                      <h4 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#0F172A' }}>
                        {r.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                        {r.location} · {r.tableCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassportModalRestaurant(r)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: 10,
                        padding: '6px 10px',
                        textAlign: 'center',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      title="Click to view full verified kitchen passport"
                    >
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#059669', display: 'block', lineHeight: 1.1 }}>FOODSAFE</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>TODAY VERIFIED 🛡️</span>
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
                    background: '#F8FAF6',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Thermometer size={16} color="#059669" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{r.signals.cold.title}</div>
                      <div style={{ fontSize: 9.5, color: '#64748B' }}>{r.signals.cold.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <UserCheck size={16} color="#2563eb" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{r.signals.medical.title}</div>
                      <div style={{ fontSize: 9.5, color: '#64748B' }}>{r.signals.medical.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <ShieldCheck size={16} color="#7c3aed" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{r.signals.pest.title}</div>
                      <div style={{ fontSize: 9.5, color: '#64748B' }}>{r.signals.pest.subtitle}</div>
                    </div>
                  </div>

                  {/* Rating Badge Chip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                    fontSize: 12.5,
                    color: '#64748B'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#059669',
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

                {/* Dual Action Buttons */}
                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid #E2E8F0',
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
                      background: '#059669',
                      borderColor: '#059669',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
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
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderColor: 'rgba(16, 185, 129, 0.3)',
                      color: '#059669',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <ShieldCheck size={14} /> View Passport
                  </button>
                </div>
              </div>
            ))}

            {/* Fallback card if no matches found: Directly prompt to Add */}
            {filteredRestaurants.length === 0 && (
              <div className="card" style={{
                gridColumn: '1 / -1',
                padding: '36px 24px',
                textAlign: 'center',
                background: '#ffffff',
                border: '2px dashed #CBD5E1',
                borderRadius: 18,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: '#0F2922', margin: '0 0 8px' }}>
                  {searchQuery ? `Can't find "${searchQuery}" in our verified list?` : 'No restaurants found in this category'}
                </h4>
                <p style={{ fontSize: 14, color: '#475569', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  {searchQuery
                    ? `Add "${searchQuery}" to FoodSafe365 right now. Its verified badge will be created immediately and you can submit a 60-second food safety audit!`
                    : 'Try selecting "All Cities" or "All Formats" above, or search for any restaurant by name.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewRestName(searchQuery.trim());
                      setShowAddModal(true);
                    }}
                    className="btn primary"
                    style={{
                      background: '#059669',
                      borderColor: '#059669',
                      padding: '12px 24px',
                      fontSize: 14.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)'
                    }}
                  >
                    <Star size={16} fill="#ffffff" /> ➕ Add &ldquo;{searchQuery}&rdquo; &amp; Submit Audit Now →
                  </button>
                )}
              </div>
            )}

            {/* Dynamic "Don't see your specific outlet branch?" card when searching */}
            {filteredRestaurants.length > 0 && searchQuery && (
              <div className="card" style={{
                gridColumn: '1 / -1',
                padding: '18px 24px',
                background: '#F8FAF6',
                border: '1.5px dashed #CBD5E1',
                borderRadius: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <strong style={{ color: '#0F2922', fontSize: 14 }}>Looking for a different branch of &ldquo;{searchQuery}&rdquo;?</strong>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    Add any branch or outlet in 30 seconds and submit its food safety audit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewRestName(searchQuery.trim());
                    setShowAddModal(true);
                  }}
                  className="btn secondary"
                  style={{ fontSize: 13, padding: '8px 16px', fontWeight: 700, borderColor: '#CBD5E1', color: '#059669', background: '#ffffff', cursor: 'pointer' }}
                >
                  ➕ Add Custom &ldquo;{searchQuery}&rdquo; Branch →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* LUXURY HOSPITALITY BENCHMARKS (3rd Image: 5-Star Kitchen Best Practices with reduced text) */}
      <section className="container" style={{ maxWidth: 1180, paddingTop: 10, paddingBottom: 54 }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            LUXURY HOSPITALITY BENCHMARKS
          </span>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F2922', margin: '4px 0 6px' }}>
            Best Practices Followed in 5-Star Kitchens
          </h2>
          <p style={{ color: '#475569', fontSize: 14, margin: 0, maxWidth: 840, lineHeight: 1.5 }}>
            How luxury properties like Taj, Oberoi, Marriott, and Michelin-rated restaurants ensure that hundreds of meals are prepared daily with zero risk of foodborne contamination:
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {/* 1. Blast Chilling */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                1. Blast Chilling (&lt;90 Min Rule)
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Crashes hot core temperature from 70°C to &lt;3°C within 90 minutes, completely bypassing the bacterial danger zone.
            </p>
          </div>

          {/* 2. 6-Color Chopping Matrix */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                2. 6-Color Chopping Matrix
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Strict color segregation: Red (Meat), Yellow (Poultry), Blue (Fish), Green (Produce), White (Dairy), Brown (Cooked).
            </p>
          </div>

          {/* 3. FIFO & Day-Dot System */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                3. FIFO &amp; Day-Dot System
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Color-coded weekday dot stickers stamped with prep time, chef initials, and strict 48-hour discard deadlines.
            </p>
          </div>

          {/* 4. Core Temperature Probing */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                4. Core Temperature Probing
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Calibrated needle probes log internal cooking core (≥75°C), hot holding (≥63°C), and cold storage (&lt;4°C).
            </p>
          </div>

          {/* 5. Digital Oil TPC Meters */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249, 115, 22, 0.1)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                5. Digital Oil TPC Meters
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Twice-daily digital testing (Testo 270); discarded for biodiesel recycling the moment Total Polar Compounds hit 24%.
            </p>
          </div>

          {/* 6. Medical Clearance (Form 1A) */}
          <div className="card" style={{
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168, 85, 247, 0.1)', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A' }}>
                6. Medical Clearance (Form 1A)
              </h4>
            </div>
            <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.45, margin: 0 }}>
              Mandatory 6-monthly stool cultures &amp; typhoid vaccines, plus chlorine test strips (100–200 PPM) for salad sinks.
            </p>
          </div>
        </div>
      </section>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        background: '#F1F5F0',
        padding: '28px 0',
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
          <div style={{ fontSize: 12.5, color: '#64748B' }}>
            © {new Date().getFullYear()} FoodSafe365 · Digital Food-Safety Operating System
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* POP-UP 1: CUSTOMER MOBILE OTP LOGIN MODAL */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#17231F',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 22,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top Bar with Close */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              padding: '22px 24px 18px',
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
                {loginRole === 'restaurant' && <><UtensilsCrossed size={12} /> RESTAURANT OWNER PORTAL</>}
                {loginRole === 'provider' && <><Wrench size={12} /> ACCREDITED PROVIDER PORTAL</>}
                {loginRole === 'diner' && <><Smartphone size={12} /> DINER / PUBLIC ACCESS</>}
              </div>
              <h3 style={{ margin: 0, fontSize: 21, fontWeight: 900 }}>
                {loginRole === 'restaurant' ? 'Restaurant Sign In' : loginRole === 'provider' ? 'Service Provider Sign In' : 'Customer & Diner Sign In'}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.9 }}>
                {loginRole === 'restaurant'
                  ? 'Access kitchen checklist operations, staff logs, and food safety passport.'
                  : loginRole === 'provider'
                  ? 'Manage incoming service quotation requests and lab diagnostic dispatches.'
                  : 'Submit verified restaurant hygiene ratings and earn FoodSafe Karma.'}
              </p>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 22 }}>
              {/* Role Switcher Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
                marginBottom: 16,
                background: '#0F172A',
                padding: 4,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {[
                  { key: 'diner', label: '🍽️ Diner' },
                  { key: 'restaurant', label: '🍴 Restaurant' },
                  { key: 'provider', label: '🛠️ Provider' },
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      setLoginRole(r.key as any);
                      setOtpError('');
                    }}
                    style={{
                      padding: '7px 4px',
                      borderRadius: 8,
                      border: 'none',
                      background: loginRole === r.key ? '#059669' : 'transparent',
                      color: loginRole === r.key ? '#ffffff' : '#94A3B8',
                      fontWeight: loginRole === r.key ? 800 : 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Method Switcher Tabs (Mobile vs Email) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('mobile'); setOtpError(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: loginMethod === 'mobile' ? '1.5px solid #059669' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: loginMethod === 'mobile' ? 'rgba(16, 185, 129, 0.18)' : '#0F172A',
                    color: loginMethod === 'mobile' ? '#ffffff' : '#94A3B8'
                  }}
                >
                  <Smartphone size={14} /> Mobile (SMS OTP)
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setOtpError(''); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: loginMethod === 'email' ? '1.5px solid #059669' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: loginMethod === 'email' ? 'rgba(16, 185, 129, 0.18)' : '#0F172A',
                    color: loginMethod === 'email' ? '#ffffff' : '#94A3B8'
                  }}
                >
                  <Mail size={14} /> Email Address
                </button>
              </div>

              {otpStep === 'phone' && (
                <form onSubmit={handleSendOtp}>
                  {loginMethod === 'mobile' ? (
                    <>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                        Enter 10-Digit Mobile Number
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        gap: 10,
                        marginBottom: 12,
                        background: '#0F172A'
                      }}>
                        <span style={{ fontWeight: 800, color: '#34D399', fontSize: 15 }}>🇮🇳 +91</span>
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
                            color: '#ffffff',
                            background: 'transparent'
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                        Enter Registered Email Address
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: 12,
                        padding: '10px 14px',
                        gap: 10,
                        marginBottom: 12,
                        background: '#0F172A'
                      }}>
                        <Mail size={16} color="#34D399" />
                        <input
                          type="email"
                          autoFocus
                          placeholder={loginRole === 'restaurant' ? 'manager@restaurant.com' : loginRole === 'provider' ? 'contact@labservice.com' : 'diner@example.com'}
                          value={inputEmail}
                          onChange={e => setInputEmail(e.target.value)}
                          style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: 15,
                            width: '100%',
                            fontWeight: 600,
                            color: '#ffffff',
                            background: 'transparent'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {otpError && (
                    <div style={{ color: '#f87171', fontSize: 12.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <AlertCircle size={14} /> {otpError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: '#059669',
                      borderColor: '#059669',
                      fontSize: 15,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    {loginMethod === 'mobile' ? 'Send OTP (Instant SMS) →' : 'Send Verification Code (Email) →'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: '#94A3B8' }}>
                    By proceeding, you agree to FoodSafe365 terms &amp; community hygiene guidelines.
                  </div>
                </form>
              )}

              {otpStep === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13.5, color: '#cbd5e1' }}>
                      We sent a 4-digit code to{' '}
                      <strong style={{ color: '#ffffff' }}>
                        {loginMethod === 'mobile' ? `+91 ${inputPhone}` : inputEmail}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      style={{ background: 'none', border: 'none', color: '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change {loginMethod === 'mobile' ? 'number' : 'email'}
                    </button>
                  </div>

                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8, textAlign: 'center' }}>
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
                      border: '2px solid #059669',
                      background: '#0F172A',
                      color: '#ffffff',
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
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        color: '#34d399',
                        borderRadius: 9999,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ⚡ One-Click Test: Fill Demo Code (3650)
                    </button>
                  </div>

                  {otpError && (
                    <div style={{ color: '#f87171', fontSize: 12.5, marginBottom: 12, textAlign: 'center' }}>
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

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#94A3B8' }}>
                    {otpTimer > 0 ? (
                      <span>Resend code in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOtpTimer(30)}
                        style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Resend Code Now
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
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Check size={32} />
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#ffffff' }}>
                    Verified Successfully!
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1' }}>
                    {loginRole === 'restaurant'
                      ? 'Opening Restaurant Kitchen Operations...'
                      : loginRole === 'provider'
                      ? 'Opening Service Provider Network...'
                      : 'Welcome to FoodSafe365! Your diner ratings will be stamped with the Verified Diner Audit seal.'}
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
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#17231F',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 22,
            maxWidth: 580,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#131b26',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <span style={{
                  background: '#059669',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  textTransform: 'uppercase'
                }}>
                  CUSTOMER FOOD-SAFETY RATING
                </span>
                <h3 style={{ margin: '6px 0 2px', fontSize: 21, fontWeight: 900, color: '#ffffff' }}>
                  {ratingModalRestaurant.name}
                </h3>
                <p style={{ margin: 0, fontSize: 12.5, color: '#94A3B8' }}>
                  {ratingModalRestaurant.location} · {ratingModalRestaurant.cuisine}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRatingModalRestaurant(null);
                  setRatingConfirmation(null);
                }}
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

            {/* Modal Body: Either Confirmation State or Rating Form */}
            {ratingConfirmation ? (
              <div style={{ padding: '36px 28px', textAlign: 'center', overflowY: 'auto' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)'
                }}>
                  <Check size={36} />
                </div>

                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#34d399',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '4px 12px',
                  borderRadius: 999
                }}>
                  Feedback Delivered to Management
                </span>

                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '14px 0 6px' }}>
                  Thank You for Your Feedback!
                </h3>

                <p style={{ fontSize: 14, color: '#cbd5e1', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Your Customer Food-Safety Rating for <strong>{ratingConfirmation.restaurantName}</strong> has been saved and shared with the restaurant&apos;s kitchen management.
                </p>

                <div style={{
                  background: '#131b26',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  textAlign: 'left',
                  maxWidth: 420,
                  margin: '0 auto 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>Customer Rating:</span>
                    <strong style={{ fontSize: 16, color: '#34d399' }}>{ratingConfirmation.score} / 5★</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>Table / Seat:</span>
                    <strong style={{ fontSize: 13, color: '#ffffff' }}>{ratingConfirmation.table}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#94A3B8' }}>Signal Type:</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Customer Voice</span>
                  </div>
                  {ratingConfirmation.email && (
                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 8, fontSize: 12, color: '#94A3B8' }}>
                      ✉️ GM response requested for: <strong style={{ color: '#ffffff' }}>{ratingConfirmation.email}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingModalRestaurant(null);
                      setRatingConfirmation(null);
                    }}
                    className="btn primary"
                    style={{
                      background: '#059669',
                      borderColor: '#059669',
                      color: '#ffffff',
                      padding: '10px 24px',
                      fontSize: 14,
                      fontWeight: 800,
                      borderRadius: 10,
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                  <Link
                    href={`/qr/${ratingModalRestaurant.id}`}
                    className="btn secondary"
                    style={{
                      color: '#ffffff',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '10px 20px',
                      fontSize: 13,
                      borderRadius: 10,
                      textDecoration: 'none'
                    }}
                  >
                    View Restaurant Page →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} style={{ padding: 24, overflowY: 'auto' }}>
                {/* Table code input */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#131b26', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Table Number / Seat Code:</span>
                  <input
                    type="text"
                    value={rateTableNum}
                    onChange={e => setRateTableNum(e.target.value)}
                    style={{
                      background: '#0F172A',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#ffffff',
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
                    { key: 'q3', label: '3. Food Freshness & Temp (Food Handling)', desc: 'Was hot food served steaming (≥75°C) & cold food fresh?' },
                    { key: 'q4', label: '4. Safe Drinking Water & Washrooms', desc: 'Is safe drinking water and clean hand-wash soap available?' },
                    { key: 'q5', label: '5. Overall Food Safety Confidence', desc: 'Would you comfortably recommend this kitchen to family?' },
                  ].map(item => {
                    const val = (rateScores as any)[item.key];
                    return (
                      <div key={item.key} style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ fontSize: 13.5, color: '#ffffff' }}>{item.label}</strong>
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
                                  color: star <= val ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                                  fontSize: 18
                                }}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Feedback Remark */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      Observations / Comments for Management (Optional):
                    </label>
                    <span style={{ fontSize: 11.5, color: '#94A3B8' }}>
                      {rateRemarks.split(/\s+/).filter(Boolean).length} / 100 words
                    </span>
                  </div>
                  <textarea
                    value={rateRemarks}
                    onChange={e => setRateRemarks(e.target.value)}
                    placeholder="e.g. Counters were spotless, soup was served hot. Service staff followed good hand hygiene."
                    rows={3}
                    style={{
                      width: '100%',
                      background: '#0F172A',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Request Direct Restaurant Feedback */}
                <div style={{
                  background: '#131b26',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 16
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={wantsFeedback}
                      onChange={e => setWantsFeedback(e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: '#059669', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      Would you like direct response / resolution from the restaurant?
                    </span>
                  </label>
                  {wantsFeedback && (
                    <div style={{ marginTop: 10 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                        Your Email Address for Restaurant response *:
                      </label>
                      <input
                        type="email"
                        value={dinerEmail}
                        onChange={e => setDinerEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        required={wantsFeedback}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          background: '#0F172A',
                          color: '#ffffff',
                          fontSize: 13,
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                        🔒 We share your email exclusively with this restaurant&apos;s management for feedback follow-up.
                      </div>
                    </div>
                  )}
                </div>

                {/* Attribution Note */}
                <div style={{
                  background: customerPhone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                  border: customerPhone ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: customerPhone ? '#34d399' : '#cbd5e1',
                  marginBottom: 18,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <ShieldCheck size={16} />
                  <span>
                    {customerPhone ? (
                      <>Submitting as <strong style={{ color: '#ffffff' }}>+91 {customerPhone}</strong> (Verified Diner)</>
                    ) : (
                      <>Submitting as Diner. <button type="button" onClick={() => setShowOtpModal(true)} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign in with OTP</button> to link your feedback.</>
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
                      background: '#059669',
                      borderColor: '#059669',
                      fontSize: 14,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    {isSubmittingRating ? 'Submitting Feedback...' : 'Submit Customer Feedback →'}
                  </button>
                  <Link
                    href={`/qr/${ratingModalRestaurant.id}`}
                    className="btn secondary"
                    style={{
                      padding: '12px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: '#f1f5f9',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 12
                    }}
                  >
                    Open Full Page →
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP: SCAN / ENTER RESTAURANT TABLE QR CODE MODAL */}
      {/* ========================================================================= */}
      {showQrScanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 480,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Scan or Enter Table QR</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.85 }}>Identify restaurant and rate food safety</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowQrScanModal(false);
                  setQrSearchError('');
                  setInputQrCode('');
                }}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <form onSubmit={e => { e.preventDefault(); if (inputQrCode.trim()) handleQrLookup(inputQrCode); }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                  Enter Table QR Code or Restaurant ID:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={inputQrCode}
                    onChange={e => { setInputQrCode(e.target.value); setQrSearchError(''); }}
                    placeholder="e.g. Table QR #02, the-table, or bastian..."
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 14,
                      outline: 'none',
                      color: '#0F172A'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn primary"
                    style={{
                      background: '#059669',
                      borderColor: '#059669',
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 10,
                      cursor: 'pointer'
                    }}
                  >
                    Verify QR →
                  </button>
                </div>

                {qrSearchError && (
                  <p style={{ color: '#DC2626', fontSize: 12.5, margin: '8px 0 0', fontWeight: 600 }}>
                    {qrSearchError}
                  </p>
                )}
              </form>

              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Sample QR Codes:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {[
                    { label: 'The Table (Table QR #02)', code: 'the-table' },
                    { label: 'Bastian (Table QR #08)', code: 'bastian-mumbai' },
                    { label: 'Peter Cat (Table QR #03)', code: 'peter-cat' },
                    { label: 'ABC Restaurant (Table QR #04)', code: 'abc-restaurant' }
                  ].map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleQrLookup(item.code)}
                      style={{
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '6px 10px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      🏷️ {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 1.4 }}>
                ℹ️ Scanning the tabletop QR code directly on your mobile device immediately opens the restaurant&apos;s feedback page.
              </div>
            </div>
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
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#17231F',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 22,
            maxWidth: 520,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
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
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)',
                  padding: '8px 18px',
                  borderRadius: 9999,
                  color: '#34d399',
                  fontWeight: 800,
                  fontSize: 14
                }}>
                  <ShieldCheck size={20} /> PASSPORT STATUS: ACTIVE &amp; VERIFIED TODAY
                </div>
              </div>

              {/* 4 Core Pillars Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Chiller Temp</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#34d399', marginTop: 2 }}>{passportModalRestaurant.signals.cold.title}</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>{passportModalRestaurant.signals.cold.subtitle}</div>
                </div>

                <div style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Staff Health</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa', marginTop: 2 }}>{passportModalRestaurant.signals.medical.title}</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>{passportModalRestaurant.signals.medical.subtitle}</div>
                </div>

                <div style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Pest Audit</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#c084fc', marginTop: 2 }}>{passportModalRestaurant.signals.pest.title}</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>{passportModalRestaurant.signals.pest.subtitle}</div>
                </div>

                <div style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Diner Score</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#10b981', marginTop: 2 }}>★ {passportModalRestaurant.score} / 5.0</div>
                  <div style={{ fontSize: 11, color: '#cbd5e1' }}>{passportModalRestaurant.reviews} verified audits</div>
                </div>
              </div>

              {/* Table QR Instructions */}
              <div style={{
                background: '#131b26',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <QrCode size={26} color="#34d399" />
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#ffffff' }}>Tabletop QR Passport Displayed in Dining Room</strong>
                  <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>
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
                    background: '#059669',
                    borderColor: '#059669',
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '11px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  ⭐ Rate This Restaurant (60s)
                </button>
                <button
                  type="button"
                  onClick={() => setPassportModalRestaurant(null)}
                  className="btn secondary"
                  style={{ padding: '11px 18px', fontSize: 13, fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', color: '#f1f5f9', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 12 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POP-UP MODAL: ADD RESTAURANT BY DINER/CLIENT */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#17231F',
            borderRadius: 20,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              padding: '20px 24px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 20
                }}>
                  🍽️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Add Any Restaurant</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#a7f3d0' }}>
                    Diner Discovery • Add &amp; rate any food business in seconds
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddRestaurant} style={{ padding: '24px' }}>
              <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 0, marginBottom: 16 }}>
                Can&apos;t find your dining spot or cloud kitchen? Register it right now on FoodSafe365 to instantly inspect or submit a verified audit.
              </p>

              {addError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <AlertCircle size={16} />
                  <span>{addError}</span>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Restaurant / Brand Name *
                </label>
                <input
                  type="text"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  placeholder="e.g. Oh! Calcutta / Bismillah Biryani / Cafe de Paris"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: 14,
                    outline: 'none',
                    background: '#0F172A',
                    color: '#ffffff'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    City
                  </label>
                  <select
                    value={newRestCity}
                    onChange={(e) => setNewRestCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#0F172A',
                      color: '#ffffff'
                    }}
                  >
                    <option value="kolkata" style={{ background: '#0F172A', color: '#ffffff' }}>Kolkata</option>
                    <option value="hyderabad" style={{ background: '#0F172A', color: '#ffffff' }}>Hyderabad</option>
                    <option value="pune" style={{ background: '#0F172A', color: '#ffffff' }}>Pune</option>
                    <option value="leh" style={{ background: '#0F172A', color: '#ffffff' }}>Leh (Ladakh)</option>
                    <option value="mumbai" style={{ background: '#0F172A', color: '#ffffff' }}>Mumbai</option>
                    <option value="delhi" style={{ background: '#0F172A', color: '#ffffff' }}>New Delhi</option>
                    <option value="jaipur" style={{ background: '#0F172A', color: '#ffffff' }}>Jaipur</option>
                    <option value="chandigarh" style={{ background: '#0F172A', color: '#ffffff' }}>Chandigarh</option>
                    <option value="agra" style={{ background: '#0F172A', color: '#ffffff' }}>Agra</option>
                    <option value="bengaluru" style={{ background: '#0F172A', color: '#ffffff' }}>Bengaluru</option>
                    <option value="other" style={{ background: '#0F172A', color: '#ffffff' }}>Other City</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={newRestLocation}
                    onChange={(e) => setNewRestLocation(e.target.value)}
                    placeholder="e.g. Park Street / Gachibowli"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#0F172A',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    Cuisine / Type
                  </label>
                  <input
                    type="text"
                    value={newRestCuisine}
                    onChange={(e) => setNewRestCuisine(e.target.value)}
                    placeholder="e.g. Bengali / Mughlai / Cafe"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#0F172A',
                      color: '#ffffff'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    Table / Counter Code
                  </label>
                  <input
                    type="text"
                    value={newRestTable}
                    onChange={(e) => setNewRestTable(e.target.value)}
                    placeholder="e.g. Table QR #05"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#0F172A',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 18px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  ➕ Add &amp; View Safety Badge
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f1f5f9',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 12,
                    padding: '12px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
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
