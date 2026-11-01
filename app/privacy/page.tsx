'use client';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react';
import GlobalHeader from '@/components/GlobalHeader';

export default function PrivacyPolicy() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)' }}>
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 840, paddingTop: 36, paddingBottom: 64 }}>
        <div className="card" style={{ padding: '36px 32px', background: 'var(--card-bg, #ffffff)', borderRadius: 20, border: '1px solid var(--border, #e2e8f0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={28} style={{ color: '#059669' }} />
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#059669' }}>
              Privacy &amp; Data Governance
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text, #0f172a)', margin: '0 0 10px' }}>
            Privacy Policy &amp; Data Governance
          </h1>
          <p className="muted" style={{ fontSize: 14, margin: '0 0 24px' }}>
            Last updated: November 2026 · Official policy for FoodSafe365 web and digital applications.
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e2e8f0)', margin: '0 0 24px' }} />

          <section style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 14.5, lineHeight: 1.7, color: 'var(--text-body, #334155)' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                1. Overview &amp; Data Minimization Commitment
              </h2>
              <p style={{ margin: 0 }}>
                FoodSafe365 (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an independent digital food-safety management platform designed to help commercial kitchens, restaurants, and grocery retailers track daily operational hygiene and temperature controls. We practice strict data minimization: we only collect the minimum operational data necessary to deliver digital checklist tools and diner feedback.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                2. Information We Do NOT Collect
              </h2>
              <p style={{ margin: '0 0 8px' }}>
                To safeguard personal privacy and prevent unnecessary data exposure:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>No Personal Health Records:</strong> We <strong>do not</strong> collect, upload, or store individual employee medical fitness documents, laboratory stool test files, or private diagnostic health reports. Kitchen managers verify statutory fitness certificates internally on premises.</li>
                <li><strong>No Financial or Payment Card Data:</strong> We do not process or store credit/debit card numbers or banking credentials.</li>
                <li><strong>No Biometric Information:</strong> No biometric identifiers of kitchen personnel or visitors are recorded.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                3. Information We Collect &amp; Store
              </h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Operational Kitchen Logs:</strong> Numerical temperature measurements (e.g. refrigerator probe logs in °C), qualitative rating selections (1–5 scale), corrective action notes, and supervisor check timestamps.</li>
                <li><strong>Business Establishment Details:</strong> Restaurant or store trade name, location address, FSSAI registration/license number entered by the business owner, and business contact phone/email for service coordination.</li>
                <li><strong>Diner Feedback (Voluntary):</strong> Star ratings across food safety categories and optional comments submitted by diners via tabletop QR codes. Diner mobile numbers are stored for verification and are <strong>strictly masked</strong> (e.g., +91*****6) in public-facing interfaces.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                4. Data Protection &amp; Security Controls
              </h2>
              <p style={{ margin: '0 0 8px' }}>
                We do not sell, rent, or trade your operational or business data to third-party advertisers or data brokers. Implemented technical security controls include:
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Encryption in Transit:</strong> All HTTP communications are enforced over HTTPS using TLS encryption provided by our hosting infrastructure.</li>
                <li><strong>Database Security:</strong> Data is stored in secure cloud PostgreSQL databases with SSL connection enforcement and parameterized database queries to protect against injection attacks.</li>
                <li><strong>Privacy Masking:</strong> Sensitive attributes (such as customer mobile numbers) are automatically redacted in all public application endpoints.</li>
              </ul>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                5. Device Permissions
              </h2>
              <p style={{ margin: 0 }}>
                When accessed via mobile web browsers or wrapper applications, camera access is requested strictly when the user chooses to scan a tabletop QR code or chiller unit QR sticker. No images from the camera feed are recorded or uploaded to our servers.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '0 0 8px' }}>
                6. Contact &amp; Inquiries
              </h2>
              <p style={{ margin: 0 }}>
                For any inquiries regarding this policy, data deletion, or operational records, please contact us directly:
                <br />
                <strong>Email:</strong> <a href="mailto:foodsafe365@gmail.com" style={{ color: '#059669', fontWeight: 600 }}>foodsafe365@gmail.com</a>
                <br />
                <strong>Website:</strong> <a href="https://www.foodsafe365.in" style={{ color: '#059669', fontWeight: 600 }}>https://www.foodsafe365.in</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
