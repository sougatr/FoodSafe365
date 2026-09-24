'use client';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)' }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/home" className="brand">
            <span style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              display: 'inline-grid',
              placeItems: 'center',
              fontSize: 16,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
            }}>🛡️</span>
            FoodSafe365
          </Link>
          <span className="pill good" style={{ fontSize: 10.5, padding: '3px 9px' }}>
            Privacy &amp; Security
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle />
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 840, paddingTop: 36, paddingBottom: 64 }}>
        <div className="card" style={{ padding: '36px 32px', background: 'var(--card-bg, #ffffff)', borderRadius: 20, border: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={28} style={{ color: '#059669' }} />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669' }}>
              Official Policy · FSSAI &amp; Google Play Compliant
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text, #0f172a)', margin: '0 0 10px' }}>
            Privacy Policy &amp; Data Security
          </h1>
          <p className="muted" style={{ fontSize: 14, margin: '0 0 24px' }}>
            Last updated: September 2026 · Effective for FoodSafe365 Web, Android App, and iOS Applications.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e2e8f0)', margin: '0 0 24px' }} />

          <section style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-body, #334155)' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                1. Overview
              </h2>
              <p style={{ margin: 0 }}>
                FoodSafe365 (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides kitchen compliance, temperature monitoring, and food safety audit tools for restaurants, hotels, cloud kitchens, and catering establishments. We are committed to protecting the privacy of food operators, supervisors, staff, and diners who use our applications.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                2. Information We Collect
              </h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Operational Food Safety Records:</strong> Daily check results, refrigerator and cooking temperatures, corrective action records, and supervisor sign-offs.</li>
                <li><strong>Establishment Identity:</strong> Restaurant trade name, branch location, and statutory FSSAI license numbers.</li>
                <li><strong>Staff Compliance Certifications:</strong> Form 1A medical fitness records, stool test validity, and FoSTaC supervisor accreditation.</li>
                <li><strong>Diner Feedback (Optional):</strong> Table cleanliness ratings and private dining room grievance reports submitted via tabletop QR codes.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                3. How We Use Information
              </h2>
              <p style={{ margin: 0 }}>
                We use collected operational data strictly to:
              </p>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Maintain verifiable, tamper-evident statutory audit trails for FSSAI and local health inspectors.</li>
                <li>Generate daily FoodSafetyGreen™ verified digital badges and printable table standees.</li>
                <li>Deliver proactive AI alerts when refrigeration temperatures drift or statutory certifications approach renewal.</li>
                <li>Facilitate instant on-demand bookings with accredited third-party service providers (NABL labs, pest control, HVAC engineers).</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                4. Data Protection &amp; Zero Selling Policy
              </h2>
              <p style={{ margin: 0 }}>
                <strong>We do not sell, rent, or trade your personal or operational data to advertisers or data brokers under any circumstances.</strong> All data transmission between mobile devices, servers, and audit portals is secured using industry-standard TLS 1.3 cryptographic encryption.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                5. Device Permissions (Android &amp; iOS)
              </h2>
              <p style={{ margin: 0 }}>
                The FoodSafe365 mobile application may request the following permissions solely for operational functions:
              </p>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Camera:</strong> Used exclusively to scan unit QR stickers on cold chillers and tabletop hygiene badges. No images are stored without explicit action.</li>
                <li><strong>Internet &amp; Network:</strong> Used to synchronize temperature logs and inspection dossiers in real time with your cloud account.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                6. Contact &amp; Data Officer
              </h2>
              <p style={{ margin: 0 }}>
                For questions regarding this privacy policy or to request data export or deletion, contact our compliance desk:
                <br />
                <strong>Email:</strong> compliance@foodsafe365.com | support@foodsafe365.com
                <br />
                <strong>Website:</strong> https://food-safe365.vercel.app
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
