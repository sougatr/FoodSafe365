'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Store,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';
import { GROCERY_PRODUCT_CATEGORIES } from '@/lib/grocery-types';

export default function GroceryOnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [storeType, setStoreType] = useState('supermarket');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [managerName, setManagerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'dairy_milk',
    'fresh_produce',
    'bakery_packaged',
    'dry_groceries'
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (code: string) => {
    setSelectedCategories(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your grocery store or chain name.');
      return;
    }
    if (!branchName.trim()) {
      setError('Please provide the outlet or branch name.');
      return;
    }
    if (!contactNumber.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/v1/grocery/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          branchName: branchName.trim(),
          storeType,
          city,
          address: address.trim() || `${branchName.trim()}, ${city}`,
          managerName: managerName.trim() || 'Store Manager',
          contactNumber: contactNumber.trim(),
          contactEmail: contactEmail.trim(),
          fssaiNumber: fssaiNumber.trim() || '10000000000000',
          selectedCategories
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', display: 'flex', flexDirection: 'column' }}>
      <GlobalHeader />

      <main style={{ flex: 1, padding: '36px 20px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            href="/home"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', textDecoration: 'none', marginBottom: 12 }}
          >
            <ChevronLeft size={16} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
            }}>
              <Store size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text, #0f172a)', margin: 0 }}>
                Grocery Store &amp; Retail Food Store Onboarding
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>
                Setup food-safety controls for receiving, cold storage, FIFO/FEFO stock rotation, and hygiene.
              </p>
            </div>
          </div>
        </div>

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
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 16,
          padding: '28px 24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
        }}>
          {/* Section 1: Store & Branch Info */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', borderBottom: '1px solid #E2E8F0', paddingBottom: 8, marginBottom: 18 }}>
              1. Store Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Store / Retail Chain Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Nature Fresh Market, SuperMart"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Outlet / Branch Name *
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  placeholder="e.g. Bandra West, Indiranagar Branch"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Store Format / Type
                </label>
                <select
                  value={storeType}
                  onChange={e => setStoreType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box',
                    background: '#fff'
                  }}
                >
                  <option value="supermarket">Supermarket (Multi-category)</option>
                  <option value="hypermarket">Hypermarket / Big Format</option>
                  <option value="convenience">Convenience Store</option>
                  <option value="neighborhood_kirana">Neighborhood Retail / Kirana</option>
                  <option value="standalone_grocery">Standalone Grocery Store</option>
                  <option value="specialty_food">Specialty Gourmet / Organic Store</option>
                  <option value="other">Other Retail Food Store</option>
                </select>
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
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Store Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Plot 42, Hill Road, Bandra West, Mumbai 400050"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Section 2: Management & FSSAI Licensing */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', borderBottom: '1px solid #E2E8F0', paddingBottom: 8, marginBottom: 18 }}>
              2. Management &amp; Statutory Compliance
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Store Manager / Responsible Person
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  placeholder="e.g. Rajesh Nair"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98200 44556"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="e.g. manager@store.example.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  FSSAI License / Registration Number
                </label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={e => setFssaiNumber(e.target.value)}
                  placeholder="14-digit FSSAI number (e.g. 11521012000456)"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Food Products Handled (A through J) */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #E2E8F0', paddingBottom: 8, marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F2922', margin: 0 }}>
                  3. Food Product Categories Handled
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#64748B' }}>
                  Select the categories your store carries. Controls will customize automatically (temperature monitoring, segregation, FEFO).
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                {selectedCategories.length} Selected
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 12
            }}>
              {GROCERY_PRODUCT_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat.code);
                return (
                  <div
                    key={cat.code}
                    onClick={() => toggleCategory(cat.code)}
                    style={{
                      border: isSelected ? '1.5px solid #059669' : '1px solid #E2E8F0',
                      background: isSelected ? 'rgba(16, 185, 129, 0.05)' : '#F8FAFC',
                      borderRadius: 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Controlled by container onClick
                      style={{ marginTop: 3, accentColor: '#059669', width: 17, height: 17 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#059669',
                          background: 'rgba(5, 150, 105, 0.15)',
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          {cat.letter}
                        </span>
                        <strong style={{ fontSize: 13.5, color: '#0F172A' }}>{cat.name}</strong>
                      </div>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748B', lineHeight: 1.35 }}>
                        {cat.description}
                      </p>
                      {cat.requiresTemperatureControl && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', display: 'flex', gap: 8 }}>
                          <span>❄️ Temp: ≤ {cat.defaultMaxTemp}°C</span>
                        </div>
                      )}
                      {cat.subcategories && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {cat.subcategories.map(sub => (
                            <span key={sub} style={{ fontSize: 10.5, color: '#475569', background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 4, padding: '1px 6px' }}>
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <Link
              href="/home"
              className="btn secondary"
              style={{ padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn primary"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                fontSize: 14,
                fontWeight: 800,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {saving ? 'Setting Up...' : 'Complete Onboarding & Enter Store'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
