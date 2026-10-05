'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Drumstick,
  Fish,
  Milk,
  Snowflake,
  Apple,
  Cake,
  Package,
  Boxes,
  User,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

interface CategoryCardItem {
  id: string;
  code: string;
  name: string;
  accentColor: string;
  selectedBg: string;
  icon: any;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: 'cat-meat',
    code: 'meat_fresh',
    name: 'Meat & Chicken',
    accentColor: '#DC2626', // FoodSafe365 visual category colour
    selectedBg: '#FEF2F2',
    icon: Drumstick
  },
  {
    id: 'cat-fish',
    code: 'seafood_fresh',
    name: 'Fish & Seafood',
    accentColor: '#0891B2', // FoodSafe365 visual category colour
    selectedBg: '#ECFEFF',
    icon: Fish
  },
  {
    id: 'cat-milk',
    code: 'dairy_milk',
    name: 'Milk & Dairy',
    accentColor: '#2563EB', // FoodSafe365 visual category colour
    selectedBg: '#EFF6FF',
    icon: Milk
  },
  {
    id: 'cat-frozen',
    code: 'frozen_foods',
    name: 'Frozen Foods',
    accentColor: '#4F46E5', // FoodSafe365 visual category colour
    selectedBg: '#EEF2FF',
    icon: Snowflake
  },
  {
    id: 'cat-produce',
    code: 'fresh_produce',
    name: 'Fresh Fruits & Vegetables',
    accentColor: '#16A34A', // FoodSafe365 visual category colour
    selectedBg: '#F0FDF4',
    icon: Apple
  },
  {
    id: 'cat-bakery',
    code: 'bakery_packaged',
    name: 'Bakery',
    accentColor: '#D97706', // FoodSafe365 visual category colour
    selectedBg: '#FFFBEB',
    icon: Cake
  },
  {
    id: 'cat-packaged',
    code: 'other_packaged',
    name: 'Packaged Foods',
    accentColor: '#7C3AED', // FoodSafe365 visual category colour
    selectedBg: '#F5F3FF',
    icon: Package
  },
  {
    id: 'cat-staples',
    code: 'dry_groceries',
    name: 'Dry Groceries & Staples',
    accentColor: '#78716C', // FoodSafe365 visual category colour
    selectedBg: '#F5F5F4',
    icon: Boxes
  }
];

export default function GroceryOnboardingPage() {
  const router = useRouter();

  // Wizard step: 1 = Store Details, 2 = What Do You Sell, 3 = Daily Check Person
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Store details
  const [storeName, setStoreName] = useState('');
  const [city, setCity] = useState('Mumbai');

  // Step 2: What do you sell?
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'dairy_milk',
    'fresh_produce',
    'bakery_packaged',
    'dry_groceries'
  ]);

  // Step 3: Daily check person
  const [dailyCheckPerson, setDailyCheckPerson] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (code: string) => {
    setSelectedCategories(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!storeName.trim()) {
      setError('Please enter your store or outlet name.');
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedCategories.length === 0) {
      setError('Please select at least one category to continue.');
      return;
    }
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const assignedPerson = dailyCheckPerson.trim() || 'Store Manager';

    setSaving(true);
    try {
      const res = await fetch('/api/v1/grocery/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName.trim(),
          city: city.trim() || 'Mumbai',
          selectedCategories,
          dailyCheckPerson: assignedPerson,
          managerName: assignedPerson
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Onboarding failed');
      }

      const savedOutlet = json.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_grocery_outlet_id', savedOutlet.id);
        localStorage.setItem('foodsafe365_grocery_outlet', JSON.stringify(savedOutlet));
        localStorage.setItem('foodsafe365_outlet_id', savedOutlet.id);
      }

      router.push('/grocery');
    } catch (err: any) {
      setError(err.message || 'An error occurred during onboarding.');
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />

      <main style={{
        flex: 1,
        padding: '32px 16px 48px',
        maxWidth: 540,
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* TOP BACK LINK & STEP PROGRESS BAR */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            {step === 1 ? (
              <Link
                href="/home"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: '#64748B',
                  textDecoration: 'none'
                }}
              >
                <ChevronLeft size={16} /> Back to Home
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(s => (s === 3 ? 2 : 1) as 1 | 2);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 8px', borderRadius: 12 }}>
              Step {step} of 3
            </span>
          </div>

          {/* Clean 3-segment progress bar */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#059669', transition: 'background 0.2s' }} />
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? '#059669' : '#CBD5E1', transition: 'background 0.2s' }} />
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 3 ? '#059669' : '#CBD5E1', transition: 'background 0.2s' }} />
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            color: '#b91c1c',
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* CARD CONTAINER */}
        <div style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 20,
          padding: '32px 24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>

          {/* ======================================================== */}
          {/* STEP 1: STORE DETAILS */}
          {/* ======================================================== */}
          {step === 1 && (
            <form onSubmit={handleStep1Continue}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                marginBottom: 16
              }}>
                <Store size={22} />
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 26px)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 6px',
                lineHeight: 1.25
              }}>
                What’s your store called?
              </h1>

              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.45 }}>
                Enter your store name and city to set up your food-safety workflow in seconds.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Store / Outlet Name *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="e.g. Green Harvest Grocery, FreshMart"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      minHeight: 48,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 15,
                      boxSizing: 'border-box',
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#059669')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru, Delhi"
                    style={{
                      width: '100%',
                      minHeight: 48,
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 15,
                      boxSizing: 'border-box',
                      color: '#0F172A',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#059669')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  minHeight: 50,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                <span>CONTINUE</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: WHAT DO YOU SELL? */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleStep2Continue}>
              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 26px)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 6px',
                lineHeight: 1.25
              }}>
                What do you sell?
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block' }}>
                    FoodSafe365 product categories
                  </span>
                  <span style={{ fontSize: 12.5, color: '#64748B' }}>
                    Select all that apply.
                  </span>
                </div>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: selectedCategories.length > 0 ? '#059669' : '#64748B',
                  background: selectedCategories.length > 0 ? 'rgba(5, 150, 105, 0.1)' : '#F1F5F9',
                  padding: '3px 10px',
                  borderRadius: 20
                }}>
                  {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
                </span>
              </div>

              {/* 8 SELECTABLE CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 10,
                marginBottom: 16
              }}>
                {CATEGORY_CARDS.map(cat => {
                  const isSelected = selectedCategories.includes(cat.code);
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.code)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleCategory(cat.code);
                        }
                      }}
                      style={{
                        border: isSelected ? `2px solid ${cat.accentColor}` : '1.5px solid #E2E8F0',
                        background: isSelected ? cat.selectedBg : '#FFFFFF',
                        borderRadius: 12,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        minHeight: 56,
                        boxSizing: 'border-box'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#F8FAFC',
                          border: `1px solid ${isSelected ? cat.accentColor : '#E2E8F0'}`,
                          color: cat.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon size={18} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <span style={{
                            display: 'block',
                            fontSize: 13.5,
                            fontWeight: isSelected ? 800 : 600,
                            color: '#0F172A',
                            lineHeight: 1.3
                          }}>
                            {cat.name}
                          </span>
                        </div>
                      </div>

                      {/* Obvious checkmark indicator */}
                      <div style={{ flexShrink: 0 }}>
                        {isSelected ? (
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: cat.accentColor,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: '1.5px solid #CBD5E1',
                            background: '#FFFFFF'
                          }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FSSAI FSDB BUSINESS TYPE DISTINCTION */}
              <div style={{
                margin: '16px 0 24px',
                padding: '12px 14px',
                borderRadius: 12,
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: '#64748B', // Grey: Official FSSAI FSDB display colour for Retail Store
                      border: '1px solid #475569',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B' }}>
                      FSSAI business-type display colour:
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
                      Retail Store — Grey
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>
                    Food Safety Display Board (FSDB)
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: 11.5, color: '#64748B', lineHeight: 1.45 }}>
                  Colours on the cards above are FoodSafe365 operational cues for easy recognition. Official FSSAI Food Safety Display Board colour coding identifies food business types (e.g. Retail Store — Grey, Restaurant — Purple, Fruit &amp; Veg — Green, Meat — Red, Milk — Blue).
                </p>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  minHeight: 50,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                <span>CONTINUE</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: WHO WILL DO THE DAILY CHECK? */}
          {/* ======================================================== */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                marginBottom: 16
              }}>
                <User size={22} />
              </div>

              <h1 style={{
                fontSize: 'clamp(22px, 5vw, 26px)',
                fontWeight: 900,
                color: '#0F172A',
                margin: '0 0 6px',
                lineHeight: 1.25
              }}>
                Who will do the daily check?
              </h1>

              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px', lineHeight: 1.45 }}>
                Enter the name of the person responsible for store hygiene and daily checks.
              </p>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Name
                </label>
                <input
                  type="text"
                  value={dailyCheckPerson}
                  onChange={e => setDailyCheckPerson(e.target.value)}
                  placeholder="e.g. Rajesh Nair, Priya Sharma"
                  autoFocus
                  style={{
                    width: '100%',
                    minHeight: 48,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 15,
                    boxSizing: 'border-box',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#059669')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                />
                <p style={{ margin: '6px 0 0', fontSize: 12.5, color: '#64748B' }}>
                  This person will complete the daily food safety check.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  minHeight: 50,
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  cursor: saving ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  opacity: saving ? 0.8 : 1
                }}
              >
                <span>{saving ? 'SETTING UP STORE...' : 'START USING FOODSAFE365'}</span>
                {!saving && <ArrowRight size={18} />}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
