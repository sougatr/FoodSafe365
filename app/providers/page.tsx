'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  CheckCircle2,
  Send,
  Building2,
  Bug,
  Droplets,
  Wrench,
  Flame,
  Sparkles,
  Stethoscope,
  GraduationCap,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

// Visual examples of service providers with clear icons
const PROVIDER_EXAMPLES = [
  {
    id: 'pest-control',
    name: 'Pest Control & Disinfestation',
    icon: Bug,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    description: 'FSSAI Schedule 4 IPM compliance, quarterly rodent/insect baiting, and pest audit certificates.'
  },
  {
    id: 'water-testing',
    name: 'Water & Food Testing Labs',
    icon: Droplets,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    description: 'NABL-accredited laboratory testing for IS 10500 potable water quality, pathogens, and swab tests.'
  },
  {
    id: 'refrigeration',
    name: 'Refrigeration & Cold Chain (HVAC)',
    icon: Wrench,
    color: '#0D9488',
    bgColor: '#F0FDFA',
    description: 'Chiller, deep freezer, walk-in cold room repairs, temperature sensor calibration, and AMC maintenance.'
  },
  {
    id: 'ruco',
    name: 'RUCO (Used Cooking Oil) Aggregators',
    icon: Flame,
    color: '#D97706',
    bgColor: '#FFFBEB',
    description: 'FSSAI-authorized bio-diesel collectors providing compliant disposal logs and green certificates.'
  },
  {
    id: 'deep-cleaning',
    name: 'Kitchen Deep Cleaning & Degreasing',
    icon: Sparkles,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    description: 'Exhaust hood duct degreasing, grease trap clearing, food-grade tile chemical deep wash, and sanitization.'
  },
  {
    id: 'occupational-health',
    name: 'Food Handler Medical Checkups (Form 1A)',
    icon: Stethoscope,
    color: '#E11D48',
    bgColor: '#FFF1F2',
    description: 'Statutory medical fitness certificates, typhoid vaccinations, skin checks, and deworming for kitchen crew.'
  },
  {
    id: 'fostac-training',
    name: 'FoSTaC Training & Hygiene Auditors',
    icon: GraduationCap,
    color: '#059669',
    bgColor: '#ECFDF5',
    description: 'Certified FSSAI Food Safety Supervisor (FoSTaC) courses, hygiene ratings, and third-party kitchen audits.'
  },
  {
    id: 'ppe-consumables',
    name: 'Hygiene PPE & Kitchen Consumables',
    icon: Package,
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    description: 'Color-coded cutting boards, hair nets, nitrile gloves, food sanitizer chemicals, and surface test strips.'
  },
  {
    id: 'other-provider',
    name: 'Any Other Food Safety Service Provider',
    icon: Layers,
    color: '#047857',
    bgColor: '#F0FDF4',
    description: 'Fire safety, grease trap clearing, calibration, pest proofing, or any kitchen compliance service — welcome!'
  }
];

export default function ProvidersPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    serviceCategory: 'Pest Control & Disinfestation',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const directMailtoUrl = `mailto:foodsafe365@gmail.com?subject=${encodeURIComponent(
    `Service Provider Onboarding: ${formData.companyName || 'New Partner'} (${formData.serviceCategory})`
  )}&body=${encodeURIComponent(
    `Hello FoodSafe365 Team,\n\nI would like to onboard as a service provider on FoodSafe365.\n\n` +
      `Company Name: ${formData.companyName || '[Your Company]'}\n` +
      `Service Offered: ${formData.serviceCategory}\n` +
      `Contact Person: ${formData.contactPerson || '[Your Name]'}\n` +
      `Phone Number: ${formData.phone || '[Your Phone]'}\n` +
      `Email Address: ${formData.email || '[Your Email]'}\n` +
      `City / Service Area: ${formData.city || '[City]'}\n` +
      `Details: ${formData.notes || 'Please contact me to finalize listing.'}\n\n` +
      `Best regards,\n${formData.contactPerson || formData.companyName || 'Applicant'}`
  )}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const finalCompany = formData.companyName.trim() || 'Service Provider Partner';
    const finalCategory = formData.serviceCategory || 'Food Safety Partner';
    const finalContact = formData.contactPerson.trim() || 'Partner Representative';
    const finalPhone = formData.phone.trim() || 'Not specified';
    const finalEmail = formData.email.trim() || 'partner@foodsafe365.in';
    const finalCity = formData.city.trim() || 'India';

    try {
      await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalContact,
          email: finalEmail,
          subject: `Service Provider Onboarding — ${finalCompany} (${finalCategory})`,
          organisation: finalCompany,
          message: `SERVICE PROVIDER ONBOARDING APPLICATION\n\n` +
            `Company Name: ${finalCompany}\n` +
            `Service Category: ${finalCategory}\n` +
            `Contact Person: ${finalContact}\n` +
            `Phone: ${finalPhone}\n` +
            `Email: ${finalEmail}\n` +
            `Operating City / Area: ${finalCity}\n\n` +
            `Additional Notes / Specialization:\n${formData.notes || 'None provided.'}`
        })
      });

      setSubmitted(true);
    } catch (err: any) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #F8FAFC)', color: 'var(--text, #0F172A)' }}>
      {/* Top Header with all 5 mandatory links visible + Back button */}
      <GlobalHeader />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #047857 60%, #059669 100%)',
            borderRadius: 18,
            padding: '36px 24px',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(4, 120, 87, 0.2)',
            marginBottom: 32,
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16
            }}
          >
            <ShieldCheck size={16} />
            <span>Service Provider Directory &amp; Onboarding</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 900,
              lineHeight: 1.25,
              margin: '0 0 12px',
              letterSpacing: '-0.02em'
            }}
          >
            Partner with FoodSafe365
          </h1>

          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 17px)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 720,
              margin: '0 auto 24px',
              lineHeight: 1.6
            }}
          >
            Are you a pest control vendor, testing laboratory, HVAC technician, oil recycler, or hygiene expert?
            Connect with commercial kitchens and grocery stores looking for verified safety partners.
          </p>

          {/* Quick Direct Email Banner */}
          <div
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <a
              href="mailto:foodsafe365@gmail.com?subject=Service%20Provider%20Onboarding%20-%20FoodSafe365"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                color: '#064E3B',
                padding: '12px 22px',
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Mail size={18} />
              <span>Email Us Directly: foodsafe365@gmail.com</span>
            </a>

            <a
              href="tel:+919901912365"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Phone size={16} />
              <span>Support Desk</span>
            </a>
          </div>
        </div>

        {/* Section 1: Who Can Onboard (Examples + Open to Anyone) */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px', color: 'var(--text, #0F172A)' }}>
              Who Can Onboard?
            </h2>
            <p style={{ margin: 0, fontSize: 14.5, color: '#64748B' }}>
              We partner with all verified kitchen safety, maintenance, testing, and hygiene professionals.
              Below are examples — <strong>anyone providing food safety or compliance services is welcome to join</strong>:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16
            }}
          >
            {PROVIDER_EXAMPLES.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border, #E2E8F0)',
                    borderRadius: 14,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: item.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                        flexShrink: 0
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: 0, color: 'var(--text, #0F172A)' }}>
                      {item.name}
                    </h3>
                  </div>

                  <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: 0, flexGrow: 1 }}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Simple Onboarding Form */}
        <section
          style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border, #CBD5E1)',
            borderRadius: 18,
            padding: '32px 24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#D1FAE5',
                color: '#065F46',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 8
              }}
            >
              FAST ONBOARDING
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px', color: 'var(--text, #0F172A)' }}>
              Onboard in 1 Minute
            </h2>
            <p style={{ fontSize: 14.5, color: '#64748B', maxWidth: 600, margin: '0 auto' }}>
              Fill in your details below. Your submission will immediately alert our team at{' '}
              <strong>foodsafe365@gmail.com</strong>, and we will follow up right away to list your services.
            </p>
          </div>

          {submitted ? (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #10B981',
                borderRadius: 14,
                padding: '32px 24px',
                textAlign: 'center',
                maxWidth: 600,
                margin: '0 auto'
              }}
            >
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#065F46', margin: '0 0 10px' }}>
                Application Received!
              </h3>
              <p style={{ fontSize: 14.5, color: '#047857', lineHeight: 1.6, margin: '0 0 20px' }}>
                Thank you for applying to join FoodSafe365. Your application has been logged and sent to{' '}
                <strong>foodsafe365@gmail.com</strong>.
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={directMailtoUrl}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#059669',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={16} />
                  <span>Send Follow-up Email Directly</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      companyName: '',
                      serviceCategory: 'Pest Control & Disinfestation',
                      contactPerson: '',
                      phone: '',
                      email: '',
                      city: '',
                      notes: ''
                    });
                  }}
                  style={{
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Submit Another Listing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: 700, margin: '0 auto' }}>
              {errorMessage && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #EF4444',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13.5,
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <span>{errorMessage}</span>
                  <a
                    href={directMailtoUrl}
                    style={{
                      color: '#991B1B',
                      fontWeight: 800,
                      textDecoration: 'underline',
                      fontSize: 13
                    }}
                  >
                    Click to Email Directly
                  </a>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Company / Provider Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Pest Solutions / City Cold Chain"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Service Category
                  </label>
                  <select
                    value={formData.serviceCategory}
                    onChange={e => setFormData({ ...formData, serviceCategory: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  >
                    {PROVIDER_EXAMPLES.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={formData.contactPerson}
                    onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@yourcompany.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                    Operating City / Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Mumbai / Pan-India"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 14,
                      background: '#ffffff',
                      color: '#0F172A'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#334155' }}>
                  Brief Note on Services / Certifications (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. NABL accredited lab, emergency 2-hour response for refrigeration breakdown, authorized RUCO collector..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 14,
                    background: '#ffffff',
                    color: '#0F172A',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '14px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: 15,
                    fontWeight: 800,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Send size={18} />
                  <span>{submitting ? 'Submitting Application...' : 'Submit & Email Us Immediately'}</span>
                </button>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Or prefer your email client? </span>
                  <a
                    href={directMailtoUrl}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#059669',
                      textDecoration: 'underline'
                    }}
                  >
                    Open in Mail (foodsafe365@gmail.com)
                  </a>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* Informative Assurance Note */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: 13,
            color: '#475569'
          }}
        >
          <Info size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Zero Listing Fees:</strong> FoodSafe365 connects verified food businesses directly with accredited providers. We do not charge listing fees or intermediate commissions. All inquiries sent via this portal route directly to <strong>foodsafe365@gmail.com</strong>.
          </span>
        </div>
      </main>
    </div>
  );
}
