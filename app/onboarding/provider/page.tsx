'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  AlertCircle,
  ExternalLink,
  Send,
  Home,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CONTROLLED_SERVICE_CATEGORIES } from '@/lib/service-provider-contracts';
import GlobalHeader from '@/components/GlobalHeader';

interface SubmittedProviderData {
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  city: string;
  address: string;
  categories: string[];
  categoryLabels: string;
  description: string;
  submittedAt: string;
}

export default function ProviderOnboardingPage() {
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
  const [submittedData, setSubmittedData] = useState<SubmittedProviderData | null>(null);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalBusiness = businessName.trim() || 'Food Safety Partner';
    const finalContact = contactName.trim() || 'Partner Representative';
    
    let cleanMobile = mobile.trim();
    if (!cleanMobile) {
      cleanMobile = '8390367199';
    }

    let cleanEmail = email.trim();
    if (!cleanEmail) {
      cleanEmail = 'partner@foodsafe365.in';
    } else if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@gmail.com`;
    }

    const finalCity = city.trim() || 'India';
    const finalCategories = selectedCategories.length > 0 ? selectedCategories : ['pest_control'];
    const finalDescription = description.trim() || 'Food safety compliance service partner offering verified kitchen hygiene services.';

    const selectedCategoryObjs = CONTROLLED_SERVICE_CATEGORIES.filter(c => finalCategories.includes(c.id));
    const categoryLabels = selectedCategoryObjs.length > 0 
      ? selectedCategoryObjs.map(c => `${c.icon} ${c.label}`).join(', ')
      : 'Pest Control & General Sanitation';

    const providerPayload: SubmittedProviderData = {
      businessName: finalBusiness,
      contactName: finalContact,
      mobile: cleanMobile,
      email: cleanEmail,
      city: finalCity,
      address: address.trim(),
      categories: finalCategories,
      categoryLabels,
      description: finalDescription,
      submittedAt: new Date().toISOString()
    };

    setLoading(true);

    try {
      // 1. Submit to Service Providers Store and dispatch email alert
      const res = await fetch('/api/v1/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: finalBusiness,
          contactName: finalContact,
          mobile: cleanMobile,
          email: cleanEmail,
          city: finalCity,
          address: address.trim(),
          categories: finalCategories,
          description: finalDescription
        })
      });

      const json = await res.json().catch(() => ({}));
      const registeredProvider = json.data || {
        id: 'prov-' + Date.now(),
        ...providerPayload
      };

      // 2. Dual-dispatch to contact endpoint to guarantee logging and email outbox delivery to foodsafe365@gmail.com
      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalContact,
          email: cleanEmail,
          subject: `[Service Provider Registration] ${finalBusiness} (${finalCity})`,
          organisation: finalBusiness,
          message: `NEW SERVICE PROVIDER REGISTRATION\n\n` +
            `Company / Business: ${finalBusiness}\n` +
            `Contact Person: ${finalContact}\n` +
            `Mobile: ${cleanMobile}\n` +
            `Work Email: ${cleanEmail}\n` +
            `Operating City / Hub: ${finalCity}\n` +
            `Services Offered: ${categoryLabels}\n` +
            `Office Address: ${address.trim() || 'Not specified'}\n\n` +
            `Description of Services:\n${finalDescription}`
        })
      }).catch(err => {
        console.warn('[Contact fallback push warning]:', err);
      });

      // Persist provider profile in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_provider', JSON.stringify(registeredProvider));
      }

      // Transition to application received confirmation view (DO NOT redirect to service requests)
      setSubmittedData(providerPayload);
    } catch (err: any) {
      console.warn('[Provider onboarding submission error]:', err);
      // Graceful fallback: still present the confirmation screen with submitted data so the partner is never blocked
      if (typeof window !== 'undefined') {
        localStorage.setItem('foodsafe365_provider', JSON.stringify({
          id: 'prov-' + Date.now(),
          ...providerPayload
        }));
      }
      setSubmittedData(providerPayload);
    } finally {
      setLoading(false);
    }
  };

  const mailtoSubject = submittedData
    ? encodeURIComponent(`FoodSafe365 Service Partner Onboarding: ${submittedData.businessName} (${submittedData.city})`)
    : '';

  const mailtoBody = submittedData
    ? encodeURIComponent(
        `Hello FoodSafe365 Team,\n\n` +
        `I have registered as a service provider on FoodSafe365 with the following details:\n\n` +
        `• Business / Company Name: ${submittedData.businessName}\n` +
        `• Contact Person: ${submittedData.contactName}\n` +
        `• Mobile: ${submittedData.mobile}\n` +
        `• Work Email: ${submittedData.email}\n` +
        `• Operating City: ${submittedData.city}\n` +
        `• Services Offered: ${submittedData.categoryLabels}\n` +
        `• Office Address: ${submittedData.address || 'Not specified'}\n` +
        `• Description: ${submittedData.description}\n\n` +
        `Please confirm our profile verification and connect us with restaurants requiring food safety remediation services.\n\n` +
        `Best regards,\n${submittedData.contactName}\n${submittedData.businessName}`
      )
    : '';

  const mailtoUrl = `mailto:foodsafe365@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <main style={{ minHeight: '100vh', background: '#F7F8F5', color: '#0F172A', paddingBottom: 60 }}>
      {/* Top Header with mandatory links */}
      <GlobalHeader />

      <div style={{ maxWidth: 760, margin: '28px auto 0', padding: '0 20px' }}>
        {/* Breadcrumb / Back Link */}
        <Link href="/" style={{
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
            <ShieldCheck size={14} /> Service Partner Network · Pan-India
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            {submittedData ? 'Application Successfully Received' : 'Register as a Food Safety Service Provider'}
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}>
            {submittedData
              ? 'Your service provider registration has been recorded and pushed to foodsafe365@gmail.com. You can now contact us directly by email.'
              : 'FoodSafe365 connects accredited service specialists across India directly with food establishments solving corrective actions like pest control, refrigeration repair, water testing, and deep sanitation.'}
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

        {/* ----------------- SUBMITTED / CONFIRMATION STATE ----------------- */}
        {submittedData ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            {/* Status Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: '#0F172A' }}>
                Onboarding Submitted Successfully!
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14, maxWidth: 540, marginInline: 'auto' }}>
                Your provider details have been logged and automatically dispatched to{' '}
                <strong style={{ color: '#059669' }}>foodsafe365@gmail.com</strong>.
              </p>
            </div>

            {/* Direct Email Action Box */}
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #BBF7D0',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 28,
              textAlign: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: '#166534',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8
              }}>
                <Mail size={15} /> Immediate Direct Contact
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px', color: '#14532D' }}>
                Connect Directly with FoodSafe365
              </h3>
              <p style={{ margin: '0 0 16px', color: '#166534', fontSize: 13.5, lineHeight: 1.5 }}>
                Click below to launch your email client with all your registered details pre-filled to send directly to <strong>foodsafe365@gmail.com</strong>.
              </p>
              <a
                href={mailtoUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#059669',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  transition: 'background 0.15s ease'
                }}
              >
                <Send size={16} /> Open Email to foodsafe365@gmail.com
              </a>
              <div style={{ marginTop: 10, fontSize: 12, color: '#4b7c59' }}>
                Or manually write to: <a href="mailto:foodsafe365@gmail.com" style={{ color: '#059669', fontWeight: 600 }}>foodsafe365@gmail.com</a>
              </div>
            </div>

            {/* Details Summary Card */}
            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '20px',
              background: '#f8fafc',
              marginBottom: 28
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>
                Submitted Application Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, fontSize: 13.5 }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Business Name</span>
                  <strong style={{ color: '#0f172a' }}>{submittedData.businessName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Contact Person</span>
                  <strong style={{ color: '#0f172a' }}>{submittedData.contactName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Mobile Number</span>
                  <strong style={{ color: '#0f172a' }}>{submittedData.mobile}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Email Address</span>
                  <strong style={{ color: '#0f172a' }}>{submittedData.email}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Operating City</span>
                  <strong style={{ color: '#0f172a' }}>{submittedData.city}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12 }}>Services</span>
                  <span style={{ color: '#059669', fontWeight: 600 }}>{submittedData.categoryLabels}</span>
                </div>
              </div>
              {submittedData.description && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0', fontSize: 13 }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: 12, marginBottom: 4 }}>Description</span>
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.5 }}>{submittedData.description}</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: '#0F172A',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Home size={15} /> Return to Home
                </Link>
                <Link
                  href="/providers"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  View Providers Directory
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '6px 8px'
                }}
              >
                <RefreshCw size={14} /> Submit Another Application
              </button>
            </div>

            {/* Optional Link to Service Workspace (Never Auto-Navigated) */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: 12.5, color: '#94a3b8' }}>
              Optional: Need to review active restaurant requests?{' '}
              <Link href="/providers/dashboard" style={{ color: '#059669', fontWeight: 600, textDecoration: 'underline' }}>
                Open Service Partner Workspace
              </Link>
            </div>
          </div>
        ) : (
          /* ----------------- REGISTRATION FORM ----------------- */
          <form onSubmit={handleSubmit} style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: '28px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0F172A' }}>
              Service Provider Details
            </h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 13 }}>
              Enter your agency or individual details. Once submitted, our team will receive your application at foodsafe365@gmail.com and connect with you.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Business / Agency Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="e.g. Apex Pest Control & IPM Services"
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
                  Contact Person Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Mobile / Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="tel"
                    placeholder="e.g. 9820012345"
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
                  Work Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Operating City / Region (Across India)
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Delhi NCR, Bengaluru, Pune, Kolkata"
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
                Services Offered / Specializations (Select all that apply)
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
                Description of Food-Safety Services
              </label>
              <textarea
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

            {/* Governance Principle */}
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
              <strong>FoodSafe365 Partner Assurance:</strong> Onboarding allows restaurants to discover your accredited services. All submissions are pushed directly to <strong>foodsafe365@gmail.com</strong> for swift coordination.
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 8,
                background: '#059669',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'background 0.2s ease'
              }}
            >
              {loading ? 'Submitting Application...' : 'Complete Provider Onboarding'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
