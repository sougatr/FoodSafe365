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
  UtensilsCrossed,
  ShoppingBag,
  Wrench,
  Smartphone,
  X,
  User,
  AlertCircle,
  Check,
  ChevronDown,
  Building2,
  ExternalLink
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { POPULAR_RESTAURANTS, RestaurantItem } from '@/lib/restaurantsData';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  DinerSafetyRating,
  AuditTrailEvent
} from '@/lib/foodsafety28';
import { useLanguage } from '@/lib/vernacular';

export default function Landing() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  // Mode: "I'm eating out" (default) or "I run a food business"
  const [activeMode, setActiveMode] = useState<'eating_out' | 'food_business'>('eating_out');

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Mumbai Pilot Area Filter
  const [selectedArea, setSelectedArea] = useState<'all' | 'colaba' | 'bandra' | 'lower_parel' | 'other'>('all');

  // Show top 6 cards by default
  const [showAllCards, setShowAllCards] = useState(false);

  // Universal Sign-in State
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

  // Real Stored Ratings for displaying authentic scores
  const [storedRatings, setStoredRatings] = useState<DinerSafetyRating[]>([]);

  // Custom User-Added Restaurants State
  const [customRestaurants, setCustomRestaurants] = useState<RestaurantItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRestName, setNewRestName] = useState('');
  const [newRestCity, setNewRestCity] = useState('mumbai');
  const [newRestLocation, setNewRestLocation] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('');
  const [newRestTable, setNewRestTable] = useState('Table QR #01');
  const [addError, setAddError] = useState('');

  // Chain Outlet Selection Modal State
  const [chainModalRestaurant, setChainModalRestaurant] = useState<RestaurantItem | null>(null);
  const [customBranchInput, setCustomBranchInput] = useState('');

  // Rating Modal State
  const [ratingModalRestaurant, setRatingModalRestaurant] = useState<RestaurantItem | null>(null);
  const [rateTableNum, setRateTableNum] = useState('Table 4');
  const [rateScores, setRateScores] = useState({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
  const [rateRemarks, setRateRemarks] = useState('');
  const [wantsFeedback, setWantsFeedback] = useState(false);
  const [dinerEmail, setDinerEmail] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingConfirmation, setRatingConfirmation] = useState<{
    restaurantId: string;
    restaurantName: string;
    score: string;
    table: string;
    wantsFeedback: boolean;
    email?: string;
    isUnclaimed?: boolean;
  } | null>(null);

  // QR Code Scanner / Manual Lookup Modal State
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [inputQrCode, setInputQrCode] = useState('');
  const [qrSearchError, setQrSearchError] = useState('');

  // Passport / Kitchen Record Quick-Peek Modal State
  const [passportModalRestaurant, setPassportModalRestaurant] = useState<RestaurantItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
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

      try {
        const custom = localStorage.getItem('foodsafe365_custom_restaurants');
        if (custom) setCustomRestaurants(JSON.parse(custom));
      } catch {}

      try {
        const stored = localStorage.getItem('foodsafe365_diner_ratings');
        if (stored) setStoredRatings(JSON.parse(stored));
      } catch {}

      const handleRatingUpdate = () => {
        try {
          const stored = localStorage.getItem('foodsafe365_diner_ratings');
          if (stored) setStoredRatings(JSON.parse(stored));
        } catch {}
      };

      const handleAuthUpdate = () => {
        const updatedPhone = localStorage.getItem('foodsafe365_customer_phone');
        setCustomerPhone(updatedPhone);
        const updatedEmail = localStorage.getItem('foodsafe365_customer_email');
        setCustomerEmail(updatedEmail);
      };

      window.addEventListener('customer-auth-changed', handleAuthUpdate);
      window.addEventListener('foodsafe-rating-submitted', handleRatingUpdate);
      return () => {
        window.removeEventListener('customer-auth-changed', handleAuthUpdate);
        window.removeEventListener('foodsafe-rating-submitted', handleRatingUpdate);
      };
    }
  }, []);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }

  // Mask phone number for public display: +91 ••••• •1234
  const maskedPhone = customerPhone
    ? `+91 ••••• •${customerPhone.replace(/\D/g, '').slice(-4) || '••••'}`
    : null;

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

    const clean = inputPhone.replace(/\D/g, '');
    const identifier = loginMethod === 'mobile' ? `+91 ${clean}` : inputEmail.trim();

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
          localStorage.setItem('foodsafe365_customer_phone', clean);
          setCustomerPhone(clean);
        } else {
          const em = inputEmail.trim();
          localStorage.setItem('foodsafe365_customer_email', em);
          setCustomerEmail(em);
        }
        localStorage.setItem('foodsafe365_diner_user', JSON.stringify({
          identifier: maskedPhone || identifier,
          name: 'Verified Customer',
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
        showToast('🎉 Welcome Restaurant Manager! Opening operations...');
        router.push('/home');
      } else if (loginRole === 'provider') {
        showToast('🎉 Welcome Service Provider! Opening operations...');
        router.push('/providers');
      } else {
        showToast('🎉 Welcome! You can now rate restaurants and share food-safety feedback.');
      }
    }, 1000);
  }

  // Check if a restaurant is a multi-outlet chain
  function isChainBrand(restaurant: RestaurantItem): boolean {
    const nameLower = restaurant.name.toLowerCase();
    const locLower = restaurant.location.toLowerCase();
    return (
      restaurant.city === 'pan-india' ||
      locLower.includes('multiple') ||
      locLower.includes('pan-india') ||
      ['mcdonald', 'subway', "domino's", 'burger king', 'faasos', 'biryani by kilo', 'starbucks', 'kfc', 'chaayos'].some(b => nameLower.includes(b))
    );
  }

  // Initiate rating flow: prompts branch if it's a chain, or opens rating directly
  function handleInitiateRating(restaurant: RestaurantItem) {
    if (isChainBrand(restaurant)) {
      setChainModalRestaurant(restaurant);
      setCustomBranchInput('');
    } else {
      handleOpenRating(restaurant);
    }
  }

  function handleSelectChainBranch(branchName: string) {
    if (!chainModalRestaurant) return;
    const customized: RestaurantItem = {
      ...chainModalRestaurant,
      location: `${branchName}, Mumbai`,
      tableCode: `Branch: ${branchName}`
    };
    setChainModalRestaurant(null);
    handleOpenRating(customized);
  }

  function handleOpenRating(restaurant: RestaurantItem) {
    setRatingModalRestaurant(restaurant);
    setRateScores({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    setRateRemarks('');
    setRateTableNum(restaurant.tableCode || 'Table 4');
    setWantsFeedback(false);
    setDinerEmail(customerEmail || '');
    setRatingConfirmation(null);
  }

  async function handleSubmitRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingModalRestaurant) return;

    const allScoresRated = rateScores.q1 > 0 && rateScores.q2 > 0 && rateScores.q3 > 0 && rateScores.q4 > 0 && rateScores.q5 > 0;
    if (!allScoresRated) {
      showToast('Please select a star rating for all 5 food safety categories.');
      return;
    }

    setIsSubmittingRating(true);

    const avgScore = (
      (rateScores.q1 + rateScores.q2 + rateScores.q3 + rateScores.q4 + rateScores.q5) / 5
    ).toFixed(1);

    const newRating: DinerSafetyRating = {
      id: 'cfr_' + Date.now(),
      outletId: ratingModalRestaurant.id,
      outletName: ratingModalRestaurant.name,
      createdAt: new Date().toISOString(),
      dinerName: 'Verified Diner',
      dinerMobile: customerPhone ? `+91 ••••• •${customerPhone.replace(/\D/g, '').slice(-4)}` : undefined,
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
      verifiedDineIn: true,
      responseRequested: wantsFeedback,
      customerEmail: wantsFeedback && dinerEmail.trim() ? dinerEmail.trim() : (customerEmail || undefined),
      customerPhone: customerPhone ? `+91 ••••• •${customerPhone.replace(/\D/g, '').slice(-4)}` : undefined
    };

    const isUnclaimed = ratingModalRestaurant.status === 'UNCLAIMED' || !ratingModalRestaurant.status;

    try {
      await fetch('/api/v1/customer-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: ratingModalRestaurant.id,
          restaurantName: ratingModalRestaurant.name,
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
          customerName: 'Verified Diner',
          customerEmail: wantsFeedback && dinerEmail.trim() ? dinerEmail.trim() : (customerEmail || undefined),
          customerPhone: customerPhone ? `+91 ••••• •${customerPhone.replace(/\D/g, '').slice(-4)}` : undefined,
          responseRequested: wantsFeedback,
          isUnclaimed,
          claimUrl: isUnclaimed ? `https://foodsafe365.in/claim/${ratingModalRestaurant.id}` : undefined
        })
      });
    } catch (apiErr) {
      console.warn('[Landing] Non-fatal rating API post:', apiErr);
    }

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
      const updated = [newRating, ...existing];
      localStorage.setItem('foodsafe365_diner_ratings', JSON.stringify(updated));
      setStoredRatings(updated);
      localStorage.setItem('foodsafe365_outlet_id', ratingModalRestaurant.id);
      window.dispatchEvent(new CustomEvent('foodsafe-rating-submitted'));
    }

    setIsSubmittingRating(false);
    setRatingConfirmation({
      restaurantId: ratingModalRestaurant.id,
      restaurantName: ratingModalRestaurant.name,
      score: avgScore,
      table: rateTableNum,
      wantsFeedback,
      email: wantsFeedback && dinerEmail.trim() ? dinerEmail.trim() : (customerEmail || undefined),
      isUnclaimed
    });

    showToast(`⭐ Thank you! Your food-safety rating for ${ratingModalRestaurant.name} has been shared.`);
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
      category: 'fine_dine',
      badge: 'FOODSAFE DIRECTORY LISTING',
      score: '5.0',
      reviews: 0,
      lastCheck: 'Just Now',
      signals: {
        cold: { title: 'Cold < 5°C', subtitle: 'Storage Verified' },
        medical: { title: '100% Medical', subtitle: 'Staff Certified' },
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
    showToast(`🎉 "${newRest.name}" added to FoodSafe365!`);
  }

  const allRestaurants = useMemo(() => {
    return [...customRestaurants, ...POPULAR_RESTAURANTS];
  }, [customRestaurants]);

  // Compute real ratings with ≥10 rating threshold
  function getRestaurantRealRating(restaurantId: string) {
    const matching = storedRatings.filter(r => r.outletId === restaurantId);
    if (matching.length >= 10) {
      const sum = matching.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
      const avg = (sum / matching.length).toFixed(1);
      return {
        hasSufficientRatings: true,
        score: avg,
        reviewCount: matching.length
      };
    }
    return {
      hasSufficientRatings: false,
      score: null,
      reviewCount: matching.length
    };
  }

  // Check if restaurant has verified daily kitchen records
  function hasVerifiedKitchenRecords(restaurant: RestaurantItem): boolean {
    return Boolean(
      restaurant.lastCheck &&
      restaurant.lastCheck.toLowerCase().includes('today') &&
      restaurant.signals?.cold?.title
    );
  }

  // Filter restaurants based on Mumbai Pilot Areas & Search
  const filteredRestaurants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allRestaurants.filter(r => {
      const loc = r.location.toLowerCase();
      const city = r.city.toLowerCase();

      // Area filter: default to Mumbai pilot
      if (selectedArea === 'colaba') {
        if (!loc.includes('colaba') && !loc.includes('fort') && !loc.includes('marine lines')) return false;
      } else if (selectedArea === 'bandra') {
        if (!loc.includes('bandra') && !loc.includes('khar') && !loc.includes('santacruz')) return false;
      } else if (selectedArea === 'lower_parel') {
        if (!loc.includes('lower parel') && !loc.includes('worli') && !loc.includes('prabhadevi')) return false;
      } else if (selectedArea === 'other') {
        if (city === 'mumbai') return false;
      } else {
        // 'all' Mumbai pilot: prioritize Mumbai and Pan-India
        if (city !== 'mumbai' && city !== 'pan-india') return false;
      }

      // Search Query
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedArea, allRestaurants]);

  // Top 6 vs All Cards
  const displayedRestaurants = showAllCards ? filteredRestaurants : filteredRestaurants.slice(0, 6);

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
      handleInitiateRating(matched);
      showToast(`🎯 Found ${matched.name}. Opening rating...`);
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
      handleInitiateRating(matched);
      showToast(`🎯 QR Verified: ${matched.name}`);
    } else {
      setQrSearchError(`No restaurant matches QR "${qrCodeString}". Search by restaurant name below.`);
    }
  }

  // Dynamic Headline and Subline based on active mode
  const heroHeadline = activeMode === 'eating_out'
    ? t('landing.heroDiner.headline')
    : t('landing.heroBiz.headline');

  const heroSubline = activeMode === 'eating_out'
    ? t('landing.heroDiner.subline')
    : t('landing.heroBiz.subline');

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAF6', width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Clean Global Header */}
      <GlobalHeader />

      {/* HERO SECTION: Understandable in 5 seconds */}
      <section style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F0 100%)',
        borderBottom: '1px solid #E2E8F0',
        paddingTop: 'clamp(28px, 4vw, 42px)',
        paddingBottom: 'clamp(28px, 4vw, 36px)',
        paddingLeft: 16,
        paddingRight: 16
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          {/* Dynamic Main Headline */}
          <h1 style={{
            fontSize: 'clamp(26px, 5.2vw, 40px)',
            lineHeight: 1.18,
            fontWeight: 900,
            color: '#0F2922',
            margin: '0 0 10px',
            letterSpacing: '-0.025em'
          }}>
            {heroHeadline}
          </h1>

          {/* Dynamic Subline */}
          <p style={{
            fontSize: 'clamp(14.5px, 2.6vw, 17.5px)',
            color: '#475569',
            margin: '0 auto 24px',
            maxWidth: 620,
            lineHeight: 1.45,
            fontWeight: 500
          }}>
            {heroSubline}
          </p>

          {/* TWO LARGE PRIMARY ACTION BUTTONS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            maxWidth: 540,
            margin: '0 auto 24px'
          }}>
            {/* Action 1: Diner */}
            <button
              type="button"
              onClick={() => {
                setActiveMode('eating_out');
                const el = document.getElementById('search-strip');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 52,
                padding: '14px 20px',
                borderRadius: 14,
                fontSize: 15.5,
                fontWeight: 800,
                cursor: 'pointer',
                border: activeMode === 'eating_out' ? '2.5px solid #059669' : '1.5px solid #CBD5E1',
                background: activeMode === 'eating_out' ? '#059669' : '#FFFFFF',
                color: activeMode === 'eating_out' ? '#FFFFFF' : '#0F2922',
                boxShadow: activeMode === 'eating_out' ? '0 6px 20px rgba(5, 150, 105, 0.28)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 19 }}>🍽️</span>
              <span>{t('landing.eatingOut')}</span>
            </button>

            {/* Action 2: Food Business */}
            <button
              type="button"
              onClick={() => {
                setActiveMode('food_business');
                const el = document.getElementById('business-picker');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                minHeight: 52,
                padding: '14px 20px',
                borderRadius: 14,
                fontSize: 15.5,
                fontWeight: 800,
                cursor: 'pointer',
                border: activeMode === 'food_business' ? '2.5px solid #0F2922' : '1.5px solid #CBD5E1',
                background: activeMode === 'food_business' ? '#0F2922' : '#FFFFFF',
                color: activeMode === 'food_business' ? '#FFFFFF' : '#0F2922',
                boxShadow: activeMode === 'food_business' ? '0 6px 20px rgba(15, 41, 34, 0.28)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: 19 }}>🏪</span>
              <span>{t('landing.foodBusiness')}</span>
            </button>
          </div>

          {/* INTERACTIVE 3-STEP STRIP: Each step is a direct clickable shortcut */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '14px 18px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            maxWidth: 720,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            textAlign: 'left'
          }}>
            {/* Step 1: Click to Scan */}
            <div
              onClick={() => {
                setShowQrScanModal(true);
                setInputQrCode('');
                setQrSearchError('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 10,
                transition: 'background 0.15s ease'
              }}
              title="Click to scan table QR code"
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <QrCode size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#0F2922' }}>
                  {t('landing.step1.title')}
                </strong>
                <span style={{ fontSize: 11.5, color: '#059669', fontWeight: 600 }}>
                  Tap to scan table QR →
                </span>
              </div>
            </div>

            {/* Step 2: Click to Focus Search & Rate */}
            <div
              onClick={() => {
                setActiveMode('eating_out');
                const input = document.getElementById('search-input');
                if (input) input.focus();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 10,
                transition: 'background 0.15s ease'
              }}
              title="Click to search and rate a restaurant"
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Star size={20} fill="#d97706" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#0F2922' }}>
                  {t('landing.step2.title')}
                </strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>
                  5 quick safety questions
                </span>
              </div>
            </div>

            {/* Step 3: Click to View Kitchen Records */}
            <div
              onClick={() => {
                setActiveMode('eating_out');
                const grid = document.getElementById('restaurants-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 10,
                transition: 'background 0.15s ease'
              }}
              title="Click to view daily kitchen records"
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 14, color: '#0F2922' }}>
                  {t('landing.step3.title')}
                </strong>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>
                  Daily cold &amp; hygiene logs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRANCH A: EATING OUT (Search, Pilot Filters, 3-State Cards) */}
      {activeMode === 'eating_out' && (
        <section id="search-strip" style={{
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
          padding: '24px 16px 48px'
        }}>
          {/* Search Bar & Scan Button */}
          <form onSubmit={handleSearchSubmit} style={{
            background: '#FFFFFF',
            border: '2px solid #CBD5E1',
            borderRadius: 16,
            padding: '8px 12px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16
          }}>
            <Search size={22} color="#059669" style={{ flexShrink: 0 }} />
            <input
              id="search-input"
              type="text"
              placeholder={t('landing.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 15.5,
                width: '100%',
                color: '#0F172A',
                background: 'transparent',
                fontWeight: 500
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 16,
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowQrScanModal(true);
                setInputQrCode('');
                setQrSearchError('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                padding: '9px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <QrCode size={16} />
              <span>{t('landing.scanQr')}</span>
            </button>
          </form>

          {/* MUMBAI PILOT AREA FILTER BAR + ONE ADD RESTAURANT ACTION */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 20,
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: 14
          }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: t('landing.filter.mumbaiAll') },
                { id: 'colaba', label: t('landing.filter.colaba') },
                { id: 'bandra', label: t('landing.filter.bandra') },
                { id: 'lower_parel', label: t('landing.filter.lowerParel') },
                { id: 'other', label: t('landing.filter.otherCities') }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setSelectedArea(f.id as any);
                    setShowAllCards(false);
                  }}
                  style={{
                    minHeight: 36,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    fontSize: 12.5,
                    fontWeight: selectedArea === f.id ? 800 : 600,
                    border: selectedArea === f.id ? '2px solid #059669' : '1.5px solid #CBD5E1',
                    background: selectedArea === f.id ? '#059669' : '#FFFFFF',
                    color: selectedArea === f.id ? '#FFFFFF' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* ONE Add Restaurant Action */}
            <button
              type="button"
              onClick={() => {
                setNewRestName(searchQuery.trim());
                setShowAddModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                minHeight: 36,
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 12.5,
                fontWeight: 700,
                border: '1.5px dashed #059669',
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#059669',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>➕</span>
              <span>{t('landing.addRestaurant')}</span>
            </button>
          </div>

          {/* RESTAURANTS GRID: Tappable cards with 3 clean states and single button */}
          <div
            id="restaurants-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {displayedRestaurants.map(r => {
              const realRating = getRestaurantRealRating(r.id);
              const hasRecords = hasVerifiedKitchenRecords(r);
              const isChain = isChainBrand(r);
              const isUnclaimed = r.status === 'UNCLAIMED' || (!hasRecords && !realRating.hasSufficientRatings);

              return (
                <div
                  key={r.id}
                  onClick={() => handleInitiateRating(r)}
                  style={{
                    background: '#FFFFFF',
                    border: hasRecords ? '1.5px solid #A7F3D0' : '1px solid #E2E8F0',
                    borderRadius: 16,
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Header info & Status Pill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ maxWidth: '75%' }}>
                        <h3 style={{ margin: '0 0 3px', fontSize: 17, fontWeight: 800, color: '#0F2922' }}>
                          {r.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#059669" />
                          <span>{r.location}</span>
                        </p>
                      </div>

                      {/* State Badge */}
                      {hasRecords ? (
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#047857',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          padding: '3px 7px',
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          🛡️ VERIFIED
                        </span>
                      ) : realRating.hasSufficientRatings ? (
                        <div style={{
                          background: '#059669',
                          color: '#FFFFFF',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          flexShrink: 0
                        }}>
                          <Star size={11} fill="#FFFFFF" />
                          <span>{realRating.score}★</span>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: '#64748B',
                          background: '#F1F5F9',
                          padding: '3px 7px',
                          borderRadius: 6,
                          flexShrink: 0
                        }}>
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Cuisine tag */}
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 11.5, color: '#64748B', background: '#F8FAF6', padding: '2px 8px', borderRadius: 4, border: '1px solid #E2E8F0' }}>
                        {r.cuisine}
                      </span>
                    </div>

                    {/* 3 VISIBLE STATES BODY */}
                    {hasRecords ? (
                      /* STATE 1: VERIFIED KITCHEN */
                      <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 10,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        marginBottom: 16,
                        fontSize: 12,
                        color: '#166534'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                          <Check size={14} color="#059669" />
                          <span>Cold Storage: Inspected (≤4°C)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                          <Check size={14} color="#059669" />
                          <span>Staff Health: Form 1A Cleared</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                          <Check size={14} color="#059669" />
                          <span>Pest Defense: Inspected</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: '#15803D', marginTop: 2 }}>
                          Checked: {r.lastCheck}
                        </div>
                      </div>
                    ) : realRating.hasSufficientRatings ? (
                      /* STATE 2: RATED BY DINERS (≥10 verified submissions) */
                      <div style={{
                        background: '#F8FAF6',
                        border: '1px solid #E2E8F0',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 16,
                        fontSize: 12,
                        color: '#475569'
                      }}>
                        <div style={{ fontWeight: 700, color: '#0F2922', marginBottom: 2 }}>
                          ⭐ {realRating.score} / 5.0 Food Safety Score
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          Verified across {realRating.reviewCount} customer dining observations.
                        </div>
                      </div>
                    ) : (
                      /* STATE 3: NOT YET VERIFIED ON FOODSAFE365 */
                      <div style={{
                        background: '#F8FAFC',
                        border: '1px dashed #CBD5E1',
                        borderRadius: 10,
                        padding: '10px 12px',
                        marginBottom: 16,
                        fontSize: 11.5,
                        color: '#64748B'
                      }}>
                        <span>No verified kitchen logs uploaded yet. Share your dining observation to verify this kitchen.</span>
                      </div>
                    )}
                  </div>

                  {/* SINGLE PRIMARY ACTION BUTTON + CONDITIONAL RECORD LINK */}
                  <div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleInitiateRating(r);
                      }}
                      style={{
                        width: '100%',
                        minHeight: 44,
                        background: '#059669',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.22)'
                      }}
                    >
                      <Star size={14} fill="#FFFFFF" />
                      <span>{hasRecords ? 'Rate Safety' : 'Be First to Rate Safety'}</span>
                    </button>

                    {/* Show "See Daily Record" ONLY if record actually exists! */}
                    {hasRecords && (
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setPassportModalRestaurant(r);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#047857',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            textDecoration: 'underline'
                          }}
                        >
                          <ShieldCheck size={13} />
                          <span>See Verified Daily Record →</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION / SEE MORE BUTTON (Shows 6 initially) */}
          {filteredRestaurants.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setShowAllCards(!showAllCards)}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F2922',
                  padding: '10px 24px',
                  borderRadius: 9999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <span>
                  {showAllCards
                    ? t('landing.seeLess')
                    : `${t('landing.seeMore')} (${filteredRestaurants.length - 6} more) ↓`}
                </span>
              </button>
            </div>
          )}

          {filteredRestaurants.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px dashed #CBD5E1',
              marginTop: 16
            }}>
              <p style={{ fontSize: 16, color: '#475569', margin: '0 0 16px' }}>
                No restaurants found matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewRestName(searchQuery.trim());
                  setShowAddModal(true);
                }}
                style={{
                  background: '#059669',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ➕ Add &ldquo;{searchQuery}&rdquo; to FoodSafe365
              </button>
            </div>
          )}
        </section>
      )}

      {/* BRANCH B: FOOD BUSINESS (3-Card Role Picker, Ops behind login) */}
      {activeMode === 'food_business' && (
        <section id="business-picker" style={{
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
          padding: '24px 16px 48px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              FOOD BUSINESS OPERATIONAL SYSTEM
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F2922', margin: '6px 0 8px' }}>
              Select your business type
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Join FoodSafe365 to verify hygiene, complete daily opening checks, and reassure your customers.
            </p>
          </div>

          {/* 3-CARD ROLE PICKER: Restaurant, Grocery, Service Provider */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 20,
            marginBottom: 32
          }}>
            {/* Card 1: Restaurant */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 20,
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <UtensilsCrossed size={24} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800, color: '#0F2922' }}>
                  {t('landing.role.restaurant')}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                  {t('landing.role.restaurant.desc')}
                </p>
              </div>

              {/* Single "Get started" button */}
              <Link
                href="/onboarding"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  minHeight: 48,
                  background: '#059669',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                }}
              >
                <span>{t('landing.getStarted')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2: Grocery Store */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 20,
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(2, 132, 199, 0.12)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <ShoppingBag size={24} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800, color: '#0F2922' }}>
                  {t('landing.role.grocery')}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                  {t('landing.role.grocery.desc')}
                </p>
              </div>

              {/* Single "Get started" button */}
              <Link
                href="/onboarding/grocery"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  minHeight: 48,
                  background: '#0284c7',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
                }}
              >
                <span>{t('landing.getStarted')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 3: Service Provider */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: 20,
              padding: '24px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
            }}>
              <div>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(124, 58, 237, 0.12)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <Wrench size={24} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800, color: '#0F2922' }}>
                  {t('landing.role.provider')}
                </h3>
                <p style={{ margin: '0 0 20px', fontSize: 13.5, color: '#475569', lineHeight: 1.5 }}>
                  {t('landing.role.provider.desc')}
                </p>
              </div>

              {/* Single "Get started" button */}
              <Link
                href="/onboarding/provider"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  minHeight: 48,
                  background: '#7c3aed',
                  color: '#FFFFFF',
                  borderRadius: 12,
                  fontSize: 14.5,
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                }}
              >
                <span>{t('landing.getStarted')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* All ops and dashboard links kept securely behind login */}
          <div style={{
            background: '#F1F5F0',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '16px 20px',
            textAlign: 'center',
            fontSize: 13.5,
            color: '#475569'
          }}>
            Already registered?{' '}
            <Link href="/login" style={{ color: '#059669', fontWeight: 800, textDecoration: 'underline' }}>
              Log in to your Kitchen Operations Dashboard
            </Link>
          </div>
        </section>
      )}

      {/* Global Clean Footer */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        background: '#FFFFFF',
        padding: '24px 16px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
            <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>About</Link>
            <Link href="/food-safety-why" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Learning Hub</Link>
            <Link href="/haccp" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>HACCP</Link>
            <Link href="/contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Contact</Link>
            <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600 }}>Privacy</Link>
          </div>
          <div style={{ fontSize: 12.5, color: '#64748B' }}>
            © {new Date().getFullYear()} FoodSafe365
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* CHAIN OUTLET SELECTION MODAL: Multi-outlet chains ask which branch */}
      {/* ========================================================================= */}
      {chainModalRestaurant && (
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
            maxWidth: 440,
            width: '100%',
            padding: 24,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setChainModalRestaurant(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <Building2 size={24} />
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: 19, fontWeight: 900, color: '#0F2922' }}>
                Which outlet are you rating?
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                Select your branch of <strong>{chainModalRestaurant.name}</strong> for accurate kitchen records:
              </p>
            </div>

            {/* Quick Branch Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                'Colaba Causeway',
                'Bandra West (Linking Road)',
                'Lower Parel (High Street Phoenix)',
                'Andheri West (Lokhandwala)',
                'Dadar West'
              ].map(branch => (
                <button
                  key={branch}
                  type="button"
                  onClick={() => handleSelectChainBranch(branch)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #E2E8F0',
                    background: '#F8FAF6',
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: '#0F2922',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>📍 {branch}</span>
                  <span style={{ color: '#059669' }}>Select →</span>
                </button>
              ))}
            </div>

            {/* Custom Branch input */}
            <form onSubmit={e => {
              e.preventDefault();
              if (customBranchInput.trim()) {
                handleSelectChainBranch(customBranchInput.trim());
              }
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Or enter other branch..."
                  value={customBranchInput}
                  onChange={e => setCustomBranchInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13
                  }}
                />
                <button
                  type="submit"
                  disabled={!customBranchInput.trim()}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: customBranchInput.trim() ? 'pointer' : 'default',
                    opacity: customBranchInput.trim() ? 1 : 0.6
                  }}
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE 5-STAR RATING MODAL (Working Resend Alerts Pipeline) */}
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
            maxWidth: 540,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              padding: '18px 22px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                type="button"
                onClick={() => {
                  setRatingModalRestaurant(null);
                  setRatingConfirmation(null);
                }}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
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
              <span style={{
                background: 'rgba(255,255,255,0.25)',
                padding: '2px 8px',
                borderRadius: 9999,
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: 4
              }}>
                FOOD-SAFETY RATING
              </span>
              <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900 }}>
                {ratingModalRestaurant.name}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, opacity: 0.9 }}>
                {ratingModalRestaurant.location} · {ratingModalRestaurant.tableCode}
              </p>
            </div>

            {/* Modal Body: Either Confirmation or Rating Form */}
            {ratingConfirmation ? (
              <div style={{ padding: 24, textAlign: 'center', overflowY: 'auto' }}>
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: 21, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                  Thank You for Your Rating!
                </h3>
                <p style={{ fontSize: 13.5, color: '#cbd5e1', maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Your rating for <strong>{ratingConfirmation.restaurantName}</strong> has been shared directly with restaurant management.
                </p>
                <div style={{
                  background: '#131b26',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  textAlign: 'left',
                  maxWidth: 380,
                  margin: '0 auto 20px',
                  fontSize: 13,
                  color: '#cbd5e1'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: '#94A3B8' }}>Overall Score:</span>
                    <strong style={{ color: '#10b981' }}>{ratingConfirmation.score} / 5★</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>Table / Seat:</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{ratingConfirmation.table}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRatingModalRestaurant(null);
                    setRatingConfirmation(null);
                  }}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} style={{ padding: 20, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: '#131b26', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Table Number / Seat:</span>
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

                {/* The 5 Food Safety Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                  {[
                    { key: 'q1', label: '1. Table & Cutlery Hygiene', desc: 'Are tables, glasses, and utensils clean?' },
                    { key: 'q2', label: '2. Staff Grooming & Uniform', desc: 'Are staff wearing clean uniforms and aprons?' },
                    { key: 'q3', label: '3. Food Freshness & Handling', desc: 'Was hot food served steaming and cold food fresh?' },
                    { key: 'q4', label: '4. Safe Drinking Water & Washrooms', desc: 'Is safe water and clean handwash available?' },
                    { key: 'q5', label: '5. Overall Food Safety Confidence', desc: 'Would you recommend this kitchen to family?' }
                  ].map(item => {
                    const val = (rateScores as any)[item.key];
                    return (
                      <div key={item.key} style={{ background: '#131b26', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '10px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ fontSize: 13, color: '#ffffff' }}>{item.label}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRateScores(prev => ({ ...prev, [item.key]: star }))}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '3px 2px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Star
                                    size={18}
                                    fill={star <= val ? '#10b981' : 'transparent'}
                                    color={star <= val ? '#10b981' : '#64748b'}
                                  />
                                </button>
                              ))}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 800, color: val > 0 ? '#10b981' : '#64748b', minWidth: 20 }}>
                              {val > 0 ? `${val}★` : '—'}
                            </span>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 11.5, color: '#94A3B8' }}>{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Written Observation */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    Observations or Comments (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={rateRemarks}
                    onChange={e => setRateRemarks(e.target.value)}
                    placeholder="E.g., spotless washbasin, hot soup, clean uniforms..."
                    style={{
                      width: '100%',
                      background: '#131b26',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: 13,
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* GM Response Request */}
                <div style={{
                  background: '#131b26',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 18
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={wantsFeedback}
                      onChange={e => setWantsFeedback(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#10b981' }}
                    />
                    <span>Request direct response from kitchen manager</span>
                  </label>
                  {wantsFeedback && (
                    <div style={{ marginTop: 10 }}>
                      <input
                        type="email"
                        placeholder="Your email address for reply"
                        value={dinerEmail}
                        onChange={e => setDinerEmail(e.target.value)}
                        style={{
                          width: '100%',
                          background: '#0F172A',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: 13,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Submit Rating Button */}
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  style={{
                    width: '100%',
                    minHeight: 48,
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: isSubmittingRating ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  {isSubmittingRating ? 'Sending Alert...' : 'Submit Food-Safety Rating →'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QR SCAN / LOOKUP MODAL */}
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
            maxWidth: 440,
            width: '100%',
            padding: 24,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowQrScanModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <QrCode size={28} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#0F2922' }}>
                Scan Table QR
              </h3>
              <p style={{ margin: 0, fontSize: 13.5, color: '#64748B' }}>
                Enter the QR code number or table code on your dining standee:
              </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleQrLookup(inputQrCode); }}>
              <input
                type="text"
                autoFocus
                placeholder="E.g. Table QR #02 or the-table"
                value={inputQrCode}
                onChange={e => setInputQrCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 15,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
              />
              {qrSearchError && (
                <div style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} />
                  <span>{qrSearchError}</span>
                </div>
              )}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Find &amp; Rate Restaurant →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD RESTAURANT MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
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
            maxWidth: 460,
            width: '100%',
            padding: 24,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 900, color: '#0F2922' }}>
              Add a Restaurant
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748B' }}>
              Can&apos;t find your dining spot? Add it to FoodSafe365 to start sharing safety feedback.
            </p>
            <form onSubmit={handleAddRestaurant}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Mocambo or Biryani Blues"
                  value={newRestName}
                  onChange={e => setNewRestName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    City
                  </label>
                  <select
                    value={newRestCity}
                    onChange={e => setNewRestCity(e.target.value)}
                    style={{ width: '100%', padding: '10px 8px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 13.5 }}
                  >
                    <option value="mumbai">Mumbai (Pilot)</option>
                    <option value="kolkata">Kolkata</option>
                    <option value="delhi">New Delhi</option>
                    <option value="hyderabad">Hyderabad</option>
                    <option value="bengaluru">Bengaluru</option>
                    <option value="pune">Pune</option>
                    <option value="jaipur">Jaipur</option>
                    <option value="other">Other City</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Colaba, Bandra"
                    value={newRestLocation}
                    onChange={e => setNewRestLocation(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              {addError && (
                <div style={{ color: '#dc2626', fontSize: 12.5, marginBottom: 10 }}>{addError}</div>
              )}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 10,
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Add Restaurant &amp; Show Profile →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: KITCHEN RECORD PEEK MODAL */}
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
            background: '#ffffff',
            borderRadius: 20,
            maxWidth: 480,
            width: '100%',
            padding: 24,
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setPassportModalRestaurant(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0F2922' }}>
                  {passportModalRestaurant.name}
                </h3>
                <span style={{ fontSize: 12.5, color: '#64748B' }}>
                  Daily Food-Safety Record
                </span>
              </div>
            </div>

            <div style={{
              background: '#F8FAF6',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 18,
              fontSize: 13
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Cold Storage &amp; Prep:</span>
                <strong style={{ color: '#059669' }}>Inspected (≤4°C)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Staff Hygiene &amp; Health:</span>
                <strong style={{ color: '#059669' }}>Certified (Form 1A)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Pest Exclusion &amp; Cleanliness:</span>
                <strong style={{ color: '#059669' }}>Inspected &amp; Clean</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Last Inspection Log:</span>
                <span style={{ color: '#334155', fontWeight: 600 }}>{passportModalRestaurant.lastCheck}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  const r = passportModalRestaurant;
                  setPassportModalRestaurant(null);
                  handleInitiateRating(r);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 10,
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Rate This Kitchen →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F2922',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 9999,
          fontSize: 13.5,
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
