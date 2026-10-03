'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { CONTROLLED_SERVICE_CATEGORIES } from '@/lib/service-provider-contracts';

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['pest_control']);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError('Please provide your business or agency name.');
      return;
    }
    if (!contactName.trim()) {
      setError('Please provide a contact person name.');
      return;
    }
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your primary operating city.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Please select at least one food-safety service category.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please describe your food-safety services or specializations.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          city: city.trim(),
          address: address.trim(),
          categories: selectedCategories,
          description: description.trim()
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.message || 'Registration failed');
      }

      const provider = json.data;

      // Persist provider session cookies and localStorage
      document.cookie = `fs_user_id=${provider.id}; path=/; max-age=2592000`;
      document.cookie = `fs_role=vendor; path=/; max-age=2592000`;
      document.cookie = `fs_provider_id=${provider.id}; path=/; max-age=2592000`;
      localStorage.setItem('foodsafe365_provider', JSON.stringify(provider));

      router.push('/providers/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F7F8F5', color: '#0F172A', paddingBottom: 60 }}>
      {/* Topbar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15
          }}>
            FS
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>FoodSafe365</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: '#e0f2fe',
            color: '#0284c7',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6
          }}>
            Service Provider Onboarding
          </span>
          <Link href="/onboarding" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>
            Restaurant Onboarding →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '32px auto 0', padding: '0 20px' }}>
        <Link href="/home" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#64748b',
          fontSize: 13,
          textDecoration: 'none',
          marginBottom: 16
        }}>
          <ChevronLeft size={16} /> Back to Home
        </Link>

        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #17231F 0%, #1e332d 100%)',
          color: '#ffffff',
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.12)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: '#34d399',
            marginBottom: 12
          }}>
            <ShieldCheck size={14} /> Service Partner Network
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            Connect with restaurants that need food-safety services
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}>
            FoodSafe365 connects accredited service specialists directly with food establishments solving corrective action requirements. Service requests are tied directly to operational checks like pest control, cold storage maintenance, water potability testing, and deep sanitation.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
            marginBottom: 20
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
            Provider Profile Details
          </h2>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 13 }}>
            Verified profiles receive direct requests from restaurants addressing corrective actions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Business / Agency Name *
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Commercial Pest Eradication"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Contact Person Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Mobile / Phone Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 12345"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Work Email *
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="e.g. service@apex-pest.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Primary City / Hub *
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Pune, Delhi NCR"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Office / Base Address (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Andheri East, Mumbai"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              Service Specialization / Categories (Select all that apply) *
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10
            }}>
              {CONTROLLED_SERVICE_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      color: isSelected ? '#065f46' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>
                    <span style={{ flex: 1 }}>{cat.label}</span>
                    {isSelected && <CheckCircle2 size={16} color="#059669" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Description of Food-Safety Services *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Commercial kitchen rodent & insect control, fogging, electronic insect fly-trap maintenance, and compliance certification."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Privacy & Scope Disclaimer */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.5
          }}>
            <strong>FoodSafe365 Governance Principle:</strong> Completing an external service request provides the restaurant with proof of remediation. It does not replace internal verification; the restaurant manager must independently inspect and close the corrective action.
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 8,
              background: '#059669',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s ease'
            }}
          >
            {loading ? 'Registering Provider...' : 'Complete Provider Onboarding'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </main>
  );
}
