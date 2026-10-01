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
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'delivery' | 'fine_dine' | 'cafe'>('all');

  // Customer Authentication (Mobile OTP) State
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [inputPhone, setInputPhone] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');

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
    const matched = allRestaurants.find(r => 
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );

    if (matched) {
      handleOpenRating(matched);
    } else {
      setNewRestName(searchQuery.trim());
      setShowAddModal(true);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#2b0e04' }}>
      <GlobalHeader />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #240b03 0%, #3e1507 50%, #2b0e04 100%)',
        borderBottom: '1px solid rgba(251, 146, 60, 0.22)',
        paddingTop: 36,
        paddingBottom: 40
      }}>
        <div className="container" style={{ maxWidth: 1180, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(52, 211, 153, 0.4)',
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
            color: '#ffffff',
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
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1.5px solid rgba(52, 211, 153, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                borderRadius: 9999,
                padding: '6px 18px',
                fontSize: 13,
                color: '#34d399'
              }}>
                <span>👤 Logged in as <strong style={{ color: '#ffffff' }}>+91 {customerPhone}</strong> (Verified Food-Safety Auditor)</span>
                <span style={{ background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 800 }}>⭐ 50 Karma</span>
                <button
                  type="button"
                  onClick={handleLogoutCustomer}
                  style={{ border: 'none', background: 'none', color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(251, 146, 60, 0.15)',
                border: '1.5px solid rgba(251, 146, 60, 0.35)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                borderRadius: 9999,
                padding: '6px 18px',
                fontSize: 13,
                color: '#fed7aa',
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
                    boxShadow: '0 2px 6px rgba(255, 82, 0, 0.35)',
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
            color: '#fed7aa',
            margin: '0 auto 32px',
            maxWidth: 720,
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            The unified food hygiene platform for <strong style={{ color: '#ffffff' }}>Restaurants</strong>, <strong style={{ color: '#ffffff' }}>Customers</strong>, and <strong style={{ color: '#ffffff' }}>Service Providers</strong>. Choose your onboarding to get started:
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
              background: '#3a1306',
              border: '2px solid #059669',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    textTransform: 'uppercase'
                  }}>
                    RESTAURANT ONBOARDING
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UtensilsCrossed size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                  For Restaurants &amp; Kitchens
                </h3>
                <p style={{ fontSize: 13.5, color: '#fed7aa', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Set up your outlet in 30 seconds. Run 2–3 min daily shift checks, avoid FDA/FSSAI closures, analyze AI trends, and generate your verified FoodSafe365 Passport.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#ffedd5', lineHeight: 1.6 }}>
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
                  <Link href="/home" style={{ fontSize: 12, color: '#34d399', fontWeight: 600, textDecoration: 'none' }}>
                    Already onboarded? Open Kitchen Operations →
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. CUSTOMER & DINER ONBOARDING */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: 'rgba(251, 146, 60, 0.2)',
                    color: '#fed7aa',
                    border: '1px solid rgba(251, 146, 60, 0.35)',
                    textTransform: 'uppercase'
                  }}>
                    GENERAL PUBLIC / DINER
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251, 146, 60, 0.2)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                  For Customers &amp; Diners
                </h3>
                <p style={{ fontSize: 13.5, color: '#fed7aa', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Rate any restaurant on food safety in 60 seconds (5 pure hygiene questions + 100-word feedback), scan table QR codes, or discover verified clean kitchens near you.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#ffedd5', lineHeight: 1.6 }}>
                  <li>5 pure food safety rating questions + 100-word feedback</li>
                  <li>Scan tabletop QR codes to verify today&apos;s kitchen audit</li>
                  <li>Feedback delivered straight to the General Manager</li>
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
                      boxShadow: '0 4px 14px rgba(255, 82, 0, 0.35)',
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
                    color: '#ffedd5',
                    background: '#4a1908',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
                  }}
                >
                  Rate a Restaurant / Find Safe Kitchens ↓
                </a>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/qr/the-table" style={{ fontSize: 12, color: '#fb923c', fontWeight: 600, textDecoration: 'none' }}>
                    Scan Tabletop QR Code Directly →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. SERVICE PROVIDER ONBOARDING */}
            <div className="card" style={{
              background: '#3a1306',
              border: '1.5px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 18,
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fde68a',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    textTransform: 'uppercase'
                  }}>
                    ACCREDITED PARTNERS
                  </span>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={22} />
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                  For Service Providers
                </h3>
                <p style={{ fontSize: 13.5, color: '#fed7aa', lineHeight: 1.5, margin: '0 0 16px' }}>
                  List your specialized compliance agency and connect directly with restaurants needing Pest Control, Food/Water Testing Labs, HVAC repair, and Staff Medical Tests.
                </p>

                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 12.5, color: '#ffedd5', lineHeight: 1.6 }}>
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
                    color: '#fde68a',
                    background: '#4a1908',
                    border: '1px solid rgba(245, 158, 11, 0.4)'
                  }}
                >
                  Join as Service Provider →
                </Link>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Link href="/providers" style={{ fontSize: 12, color: '#fed7aa', fontWeight: 600, textDecoration: 'none' }}>
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
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
            Rate Any Restaurant on Hygiene &amp; Food Safety
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.5, color: '#fed7aa' }}>
            Search a restaurant or scan its table QR code to submit a 60-second verified food safety audit:
          </p>

          {/* Quick Search & Rating Gateway Form */}
          <form onSubmit={handleSearchSubmit} style={{
            maxWidth: 640,
            margin: '0 auto',
            background: '#361205',
            borderRadius: 16,
            padding: 8,
            border: '2px solid #ea580c',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: 10 }}>
              <Search size={20} style={{ color: '#fb923c', flexShrink: 0 }} />
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
                  color: '#ffffff',
                  background: 'transparent'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#fed7aa', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: 8,
              borderTop: '1px solid rgba(251, 146, 60, 0.2)',
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
                  background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                  borderColor: '#ea580c',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(255, 82, 0, 0.35)'
                }}
              >
                <Star size={16} fill="#ffffff" /> Rate This Restaurant
              </button>
              <Link
                href="/qr/abc-restaurant"
                className="btn secondary"
                style={{
                  flex: '1 1 200px',
                  justifyContent: 'center',
                  fontSize: 13.5,
                  padding: '10px 16px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderColor: 'rgba(52, 211, 153, 0.4)',
                  color: '#34d399'
                }}
              >
                <QrCode size={16} style={{ color: '#34d399' }} /> Scan Table QR Code
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
            color: '#ffedd5'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34d399' }} /> 5 Pure Food Safety Questions
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34d399' }} /> 100-Word Additional Remarks
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} style={{ color: '#34d399' }} /> Direct to General Manager
            </span>
          </div>
        </div>

        {/* Discovery Filter Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Find FoodSafe365 Restaurants Near Me
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#fed7aa' }}>
              Discovered by diners. Verified daily through digital kitchen checklists and transparent hygiene audits.
            </p>
          </div>

          {/* Filter Pills: City & Format Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
            {/* City Tabs (Kolkata, Hyderabad, Mumbai, Delhi, Jaipur, Chandigarh, Agra, Bengaluru) */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Cities' },
                { id: 'kolkata', label: 'Kolkata' },
                { id: 'hyderabad', label: 'Hyderabad' },
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
                    border: selectedCity === tab.id ? '2px solid #fb923c' : '1.5px solid rgba(251, 146, 60, 0.25)',
                    background: selectedCity === tab.id ? '#ea580c' : '#361205',
                    color: selectedCity === tab.id ? '#ffffff' : '#fed7aa',
                    fontWeight: selectedCity === tab.id ? 700 : 600,
                    fontSize: 12.5,
                    borderRadius: 9999,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedCity === tab.id ? '0 2px 10px rgba(234, 88, 12, 0.4)' : 'none',
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
                { id: 'delivery', label: '🔥 Swiggy Popular & Delivery' },
                { id: 'fine_dine', label: '🍷 Fine Dining & Heritage' },
                { id: 'cafe', label: '☕ Cafés & Bakeries' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  style={{
                    border: selectedCategory === cat.id ? '2px solid #34d399' : '1.5px solid rgba(251, 146, 60, 0.25)',
                    background: selectedCategory === cat.id ? '#059669' : '#361205',
                    color: selectedCategory === cat.id ? '#ffffff' : '#fed7aa',
                    fontWeight: selectedCategory === cat.id ? 700 : 600,
                    fontSize: 12,
                    borderRadius: 9999,
                    padding: '4px 11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedCategory === cat.id ? '0 2px 10px rgba(5, 150, 105, 0.35)' : 'none',
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
                  border: '1.5px dashed #34d399',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13, color: '#fed7aa', flexWrap: 'wrap', gap: 8 }}>
          {isSearchActive ? (
            <span>
              Showing <strong style={{ color: '#ffffff' }}>{filteredRestaurants.length}</strong> matching verified restaurant{filteredRestaurants.length === 1 ? '' : 's'}
              {searchQuery && <> for &ldquo;<strong style={{ color: '#ffffff' }}>{searchQuery}</strong>&rdquo;</>}
              {selectedCity !== 'all' && <> in <strong style={{ color: '#ffffff' }}>{selectedCity.toUpperCase()}</strong></>}
            </span>
          ) : (
            <span style={{ color: '#fed7aa', fontSize: 13.5 }}>
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
                color: '#fb923c',
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
                  color: '#fed7aa',
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
            background: '#381306',
            border: '1.5px dashed rgba(251, 146, 60, 0.35)',
            borderRadius: 20,
            padding: '36px 24px',
            textAlign: 'center',
            maxWidth: 780,
            margin: '0 auto',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <h3 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
              Search Any Restaurant to Reveal Its Food-Safety Badge
            </h3>
            <p style={{ fontSize: 14, color: '#fed7aa', maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Type any dining brand or delivery kitchen name above. Verified cold-storage logs, medical clearances, and live table QR ratings will appear instantly.
            </p>

            {/* Quick Trending Dining & Swiggy Search Chips */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fed7aa', alignSelf: 'center' }}>Try searching:</span>
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
                    background: '#4a1908',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
                    color: '#ffedd5',
                    borderRadius: 9999,
                    padding: '5px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>🔥</span> {pill.name} <span style={{ opacity: 0.7, fontSize: 11, color: '#fb923c' }}>({pill.city})</span>
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
                borderColor: 'rgba(52, 211, 153, 0.4)',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.2)',
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
                  background: '#381306',
                  border: '1.5px solid rgba(251, 146, 60, 0.25)',
                  borderTop: '4px solid #ea580c',
                  borderRadius: 18,
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="pill good" style={{ fontSize: 10.5, padding: '2px 8px', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                        <QrCode size={11} /> TABLETOP AUDIT VERIFIED
                      </span>
                      <h4 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#ffffff' }}>
                        {r.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#fed7aa' }}>
                        {r.location} · {r.tableCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPassportModalRestaurant(r)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(52, 211, 153, 0.4)',
                        borderRadius: 10,
                        padding: '6px 10px',
                        textAlign: 'center',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      title="Click to view full verified kitchen passport"
                    >
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#34d399', display: 'block', lineHeight: 1.1 }}>FOODSAFE</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase' }}>TODAY VERIFIED 🛡️</span>
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
                    background: '#2b0e04',
                    border: '1px solid rgba(251, 146, 60, 0.15)',
                    borderRadius: 10
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <Thermometer size={16} color="#34d399" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>{r.signals.cold.title}</div>
                      <div style={{ fontSize: 9.5, color: '#fed7aa' }}>{r.signals.cold.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <UserCheck size={16} color="#60a5fa" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>{r.signals.medical.title}</div>
                      <div style={{ fontSize: 9.5, color: '#fed7aa' }}>{r.signals.medical.subtitle}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <ShieldCheck size={16} color="#c084fc" style={{ margin: '0 auto 3px' }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff' }}>{r.signals.pest.title}</div>
                      <div style={{ fontSize: 9.5, color: '#fed7aa' }}>{r.signals.pest.subtitle}</div>
                    </div>
                  </div>

                  {/* Swiggy/Zomato style Rating Badge Chip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 16,
                    fontSize: 12.5,
                    color: '#fed7aa'
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

                {/* Dual Action Buttons */}
                <div style={{
                  paddingTop: 14,
                  borderTop: '1px solid rgba(251, 146, 60, 0.15)',
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
                      boxShadow: '0 3px 10px rgba(255, 82, 0, 0.35)',
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
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderColor: 'rgba(52, 211, 153, 0.4)',
                      color: '#34d399',
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
                background: '#381306',
                border: '2px dashed #ea580c',
                borderRadius: 18,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                  {searchQuery ? `Can't find "${searchQuery}" in our verified list?` : 'No restaurants found in this category'}
                </h4>
                <p style={{ fontSize: 14, color: '#fed7aa', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
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
                      background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                      borderColor: '#ea580c',
                      padding: '12px 24px',
                      fontSize: 14.5,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 82, 0, 0.35)'
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
                background: '#361205',
                border: '1.5px dashed rgba(251, 146, 60, 0.3)',
                borderRadius: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <strong style={{ color: '#fb923c', fontSize: 14 }}>Looking for a different branch of &ldquo;{searchQuery}&rdquo;?</strong>
                  <p style={{ margin: 0, fontSize: 13, color: '#fed7aa' }}>
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
                  style={{ fontSize: 13, padding: '8px 16px', fontWeight: 700, borderColor: '#ea580c', color: '#fed7aa', background: '#4a1908', cursor: 'pointer' }}
                >
                  ➕ Add Custom &ldquo;{searchQuery}&rdquo; Branch →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Persistent Global Footer */}
      <footer style={{
        borderTop: '1px solid rgba(251, 146, 60, 0.2)',
        background: '#1d0903',
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
            <Link href="/about" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>About Us</Link>
            <Link href="/food-safety-why" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Food Safety — Why?</Link>
            <Link href="/haccp" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>HACCP Principles</Link>
            <Link href="/contact" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Contact Us</Link>
            <Link href="/privacy" style={{ color: '#fed7aa', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#fb923c' }}>
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
          background: 'rgba(15, 6, 2, 0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#331105',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            borderRadius: 22,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                    Enter 10-Digit Mobile Number
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid rgba(251, 146, 60, 0.3)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    gap: 10,
                    marginBottom: 12,
                    background: '#220b03'
                  }}>
                    <span style={{ fontWeight: 800, color: '#fed7aa', fontSize: 15 }}>🇮🇳 +91</span>
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
                      background: 'linear-gradient(135deg, #ff5200 0%, #ea580c 100%)',
                      borderColor: '#ea580c',
                      fontSize: 15,
                      fontWeight: 800,
                      padding: '12px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(255, 82, 0, 0.35)'
                    }}
                  >
                    Send OTP (Instant SMS) →
                  </button>

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11.5, color: '#fed7aa' }}>
                    By proceeding, you agree to FoodSafe365 terms &amp; community hygiene guidelines.
                  </div>
                </form>
              )}

              {otpStep === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 13.5, color: '#fed7aa' }}>
                      We sent a 4-digit code to <strong style={{ color: '#ffffff' }}>+91 {inputPhone}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      style={{ background: 'none', border: 'none', color: '#fb923c', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Change number
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
                      border: '2px solid #ea580c',
                      background: '#220b03',
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
                      ⚡ One-Click Test: Fill Demo OTP (3650)
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

                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#fed7aa' }}>
                    {otpTimer > 0 ? (
                      <span>Resend code in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOtpTimer(30)}
                        style={{ background: 'none', border: 'none', color: '#fb923c', fontWeight: 700, cursor: 'pointer' }}
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
                  <p style={{ margin: 0, fontSize: 13.5, color: '#fed7aa' }}>
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
          background: 'rgba(15, 6, 2, 0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#331105',
            border: '1px solid rgba(251, 146, 60, 0.3)',
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
              background: '#240b03',
              borderBottom: '1px solid rgba(251, 146, 60, 0.2)',
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
                <p style={{ margin: 0, fontSize: 12.5, color: '#fed7aa' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#260c03', padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(251, 146, 60, 0.2)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fed7aa' }}>Table Number / Seat Code:</span>
                <input
                  type="text"
                  value={rateTableNum}
                  onChange={e => setRateTableNum(e.target.value)}
                  style={{
                    background: '#1d0902',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
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
                  { key: 'q3', label: '3. Food Freshness & Temp', desc: 'Was hot food served steaming (≥75°C) & cold food fresh?' },
                  { key: 'q4', label: '4. Washroom & Hand-Wash Sink', desc: 'Is hand soap and clean water available at wash stations?' },
                  { key: 'q5', label: '5. Overall Food Safety Confidence', desc: 'Would you comfortably recommend this kitchen to family?' },
                ].map(item => {
                  const val = (rateScores as any)[item.key];
                  return (
                    <div key={item.key} style={{ background: '#2b0e04', border: '1px solid rgba(251, 146, 60, 0.15)', borderRadius: 12, padding: '12px 14px' }}>
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
                                color: star <= val ? '#ff5200' : '#4a1908',
                                fontSize: 18
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#fed7aa' }}>{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* 100-Word Feedback Remark */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                    100-Word Additional Feedback for General Manager:
                  </label>
                  <span style={{ fontSize: 11.5, color: '#fed7aa' }}>
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
                    background: '#220b03',
                    border: '1.5px solid rgba(251, 146, 60, 0.3)',
                    color: '#ffffff',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: 13,
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Verified Attribution Note */}
              <div style={{
                background: customerPhone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 146, 60, 0.15)',
                border: customerPhone ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(251, 146, 60, 0.3)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                color: customerPhone ? '#34d399' : '#fed7aa',
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ShieldCheck size={16} />
                <span>
                  {customerPhone ? (
                    <>Submitting as <strong style={{ color: '#ffffff' }}>+91 {customerPhone}</strong> (Verified Food-Safety Auditor)</>
                  ) : (
                    <>Submitting as Guest. <button type="button" onClick={() => setShowOtpModal(true)} style={{ background: 'none', border: 'none', color: '#fb923c', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Sign in with OTP</button> to earn Karma.</>
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
                    boxShadow: '0 4px 14px rgba(255, 82, 0, 0.35)'
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
                    color: '#fed7aa',
                    background: '#4a1908',
                    border: '1px solid rgba(251, 146, 60, 0.3)'
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
          background: 'rgba(15, 6, 2, 0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            background: '#331105',
            border: '1px solid rgba(251, 146, 60, 0.3)',
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
                <div style={{ background: '#260c03', border: '1px solid rgba(251, 146, 60, 0.15)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>Chiller Temp</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#34d399', marginTop: 2 }}>{passportModalRestaurant.signals.cold.title}</div>
                  <div style={{ fontSize: 11, color: '#fed7aa' }}>{passportModalRestaurant.signals.cold.subtitle}</div>
                </div>

                <div style={{ background: '#260c03', border: '1px solid rgba(251, 146, 60, 0.15)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>Staff Health</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa', marginTop: 2 }}>{passportModalRestaurant.signals.medical.title}</div>
                  <div style={{ fontSize: 11, color: '#fed7aa' }}>{passportModalRestaurant.signals.medical.subtitle}</div>
                </div>

                <div style={{ background: '#260c03', border: '1px solid rgba(251, 146, 60, 0.15)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>Pest Audit</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#c084fc', marginTop: 2 }}>{passportModalRestaurant.signals.pest.title}</div>
                  <div style={{ fontSize: 11, color: '#fed7aa' }}>{passportModalRestaurant.signals.pest.subtitle}</div>
                </div>

                <div style={{ background: '#260c03', border: '1px solid rgba(251, 146, 60, 0.15)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase' }}>Diner Score</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fb923c', marginTop: 2 }}>★ {passportModalRestaurant.score} / 5.0</div>
                  <div style={{ fontSize: 11, color: '#fed7aa' }}>{passportModalRestaurant.reviews} verified audits</div>
                </div>
              </div>

              {/* Table QR Instructions */}
              <div style={{
                background: '#260c03',
                border: '1px solid rgba(251, 146, 60, 0.15)',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: '#381306', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251, 146, 60, 0.25)' }}>
                  <QrCode size={26} color="#34d399" />
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#ffffff' }}>Tabletop QR Passport Displayed in Dining Room</strong>
                  <p style={{ margin: 0, fontSize: 12, color: '#fed7aa' }}>
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
                  style={{ padding: '11px 18px', fontSize: 13, fontWeight: 700, background: '#4a1908', color: '#fed7aa', border: '1px solid rgba(251, 146, 60, 0.3)' }}
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
          background: 'rgba(15, 6, 2, 0.8)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div style={{
            background: '#331105',
            borderRadius: 20,
            maxWidth: 520,
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(251, 146, 60, 0.3)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
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
                    Diner Discovery • Add & rate any food business in seconds
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
              <p style={{ fontSize: 13, color: '#fed7aa', marginTop: 0, marginBottom: 16 }}>
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
                    border: '1.5px solid rgba(251, 146, 60, 0.3)',
                    fontSize: 14,
                    outline: 'none',
                    background: '#220b03',
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
                      border: '1.5px solid rgba(251, 146, 60, 0.3)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#220b03',
                      color: '#ffffff'
                    }}
                  >
                    <option value="kolkata" style={{ background: '#220b03', color: '#ffffff' }}>Kolkata</option>
                    <option value="hyderabad" style={{ background: '#220b03', color: '#ffffff' }}>Hyderabad</option>
                    <option value="mumbai" style={{ background: '#220b03', color: '#ffffff' }}>Mumbai</option>
                    <option value="delhi" style={{ background: '#220b03', color: '#ffffff' }}>New Delhi</option>
                    <option value="jaipur" style={{ background: '#220b03', color: '#ffffff' }}>Jaipur</option>
                    <option value="chandigarh" style={{ background: '#220b03', color: '#ffffff' }}>Chandigarh</option>
                    <option value="agra" style={{ background: '#220b03', color: '#ffffff' }}>Agra</option>
                    <option value="bengaluru" style={{ background: '#220b03', color: '#ffffff' }}>Bengaluru</option>
                    <option value="other" style={{ background: '#220b03', color: '#ffffff' }}>Other City</option>
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
                      border: '1.5px solid rgba(251, 146, 60, 0.3)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#220b03',
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
                      border: '1.5px solid rgba(251, 146, 60, 0.3)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#220b03',
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
                      border: '1.5px solid rgba(251, 146, 60, 0.3)',
                      fontSize: 14,
                      outline: 'none',
                      background: '#220b03',
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
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
                  ➕ Add & View Safety Badge
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: '#4a1908',
                    color: '#fed7aa',
                    border: '1px solid rgba(251, 146, 60, 0.3)',
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
