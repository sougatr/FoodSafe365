'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  ShieldCheck,
  AlertTriangle,
  X,
  RefreshCw,
  ExternalLink,
  Download
} from 'lucide-react';
import { sprint19 as d } from '@/lib/sprint19-demo';

interface DocumentRecord {
  id: string;
  title: string;
  status: 'valid' | 'expiring';
  due: string;
  evidenceId: string;
  category: string;
  lastVerified: string;
}

const DOCUMENTS_LIST: DocumentRecord[] = [
  {
    id: 'doc-pest-001',
    title: 'Pest-control certificate',
    status: 'expiring',
    due: '12 days',
    evidenceId: 'doc-pest-001',
    category: 'Premises & Sanitation',
    lastVerified: '2026-09-15'
  },
  {
    id: 'doc-water-002',
    title: 'Water test report',
    status: 'expiring',
    due: '21 days',
    evidenceId: 'doc-water-002',
    category: 'Potable Water & Ice',
    lastVerified: '2026-08-20'
  },
  {
    id: 'doc-lic-003',
    title: 'Food licence',
    status: 'valid',
    due: 'Current',
    evidenceId: 'doc-lic-003',
    category: 'Regulatory Registration',
    lastVerified: '2026-01-10'
  },
  {
    id: 'doc-clean-004',
    title: 'Cleaning records',
    status: 'valid',
    due: 'Current',
    evidenceId: 'doc-clean-004',
    category: 'Kitchen Maintenance',
    lastVerified: '2026-10-01'
  }
];

export default function Documents() {
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocumentRecord | null>(null);
  const [docError, setDocError] = useState<{ code: string; message: string } | null>(null);
  const [previewData, setPreviewData] = useState<{ url: string; simulated?: boolean } | null>(null);

  async function handleOpenDocument(doc: DocumentRecord) {
    setActiveDoc(doc);
    setOpeningId(doc.id);
    setDocError(null);
    setPreviewData(null);

    try {
      const res = await fetch(`/api/v1/evidence/${encodeURIComponent(doc.evidenceId)}/download`, {
        cache: 'no-store'
      });

      if (res.status === 401) {
        setDocError({
          code: '401',
          message: 'Authentication required. Your session may have expired. Please sign in to view or download compliance documents.'
        });
        return;
      }

      if (res.status === 403) {
        setDocError({
          code: '403',
          message: 'Access denied: Your account role does not have permission to view or download compliance documents for this outlet.'
        });
        return;
      }

      if (res.status === 404) {
        const body = await res.json().catch(() => null);
        setDocError({
          code: '404',
          message: body?.error?.message || 'Document is unavailable, pending malware scan clearance, or has been removed.'
        });
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setDocError({
          code: 'ERROR',
          message: body?.error?.message || `Failed to retrieve document (HTTP ${res.status}).`
        });
        return;
      }

      // Check if the response was a redirect or contains download target
      const targetUrl = res.url;
      if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Local demonstration / memory mode fallback
        setPreviewData({
          url: `/api/v1/evidence/${encodeURIComponent(doc.evidenceId)}/download`,
          simulated: true
        });
      }
    } catch (err: any) {
      setDocError({
        code: 'ERROR',
        message: err?.message || 'Network error attempting to open document.'
      });
    } finally {
      setOpeningId(null);
    }
  }

  function closeModal() {
    setActiveDoc(null);
    setDocError(null);
    setPreviewData(null);
  }

  return (
    <main>
      <div className="topbar">
        <Link href="/home" className="brand">FoodSafe365</Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}
          >
            <Home size={14} /> Home
          </Link>
          <div className="muted">{d.outlet.name} · Manager</div>
        </div>
      </div>

      <div className="container">
        <div className="breadcrumb">
          <Link href="/home">Home</Link> › <Link href="/manager"><ArrowLeft size={16} /> Manager overview</Link> › Documents
        </div>

        <p className="eyebrow">DOCUMENTS &amp; COMPLIANCE</p>
        <h1>Keep important records current</h1>
        <p className="lead">
          Track expiry and verification without mixing documents into daily operational checks.
        </p>

        <div className="document-list">
          {DOCUMENTS_LIST.map(x => (
            <div className="card document-row" key={x.id}>
              <div className={`document-icon ${x.status}`}>
                {x.status === 'valid' ? <CheckCircle2 /> : <Clock3 />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0' }}>{x.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  {x.status === 'valid' ? 'Current record' : 'Expires in ' + x.due} · {x.category}
                </p>
              </div>
              <span className={`pill ${x.status === 'valid' ? 'good' : 'attention'}`}>
                {x.status === 'valid' ? 'Current' : 'Expiring soon'}
              </span>
              <button
                type="button"
                onClick={() => handleOpenDocument(x)}
                disabled={openingId === x.id}
                className="btn secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                aria-label={`Open document ${x.title}`}
              >
                {openingId === x.id ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Opening…</span>
                  </>
                ) : (
                  <>
                    <span>Open</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="notice info" style={{ marginTop: 24 }}>
          <FileText size={18} />
          <span>
            <strong>Document expiry is a management signal.</strong> FoodSafe365 verifies electronic document storage security and quarantine clearance.
          </span>
        </div>
      </div>

      {/* Accessible Document Interaction Modal */}
      {(docError || previewData) && activeDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="document-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              borderRadius: 12,
              maxWidth: 540,
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className="eyebrow" style={{ margin: 0 }}>COMPLIANCE DOCUMENT</span>
                <h2 id="document-modal-title" style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
                  {activeDoc.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 4
                }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {docError ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    background: docError.code === '401' ? '#fffbeb' : docError.code === '403' ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${docError.code === '401' ? '#fed7aa' : docError.code === '403' ? '#fecaca' : '#e2e8f0'}`,
                    padding: '14px 16px',
                    borderRadius: 8,
                    marginBottom: 20
                  }}
                >
                  <AlertTriangle
                    size={20}
                    style={{
                      color: docError.code === '401' ? '#ea580c' : docError.code === '403' ? '#dc2626' : '#64748b',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
                      {docError.code === '401'
                        ? 'Authentication Required'
                        : docError.code === '403'
                        ? 'Access Denied'
                        : docError.code === '404'
                        ? 'Evidence Unavailable'
                        : 'Document Access Error'}
                    </strong>
                    <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                      {docError.message}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {docError.code === '401' ? (
                    <Link
                      href="/login?redirect=/manager/documents"
                      className="btn primary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>Sign In to FoodSafe365</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button type="button" onClick={closeModal} className="btn secondary">
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#047857', marginBottom: 8 }}>
                    <ShieldCheck size={18} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>VERIFIED DIGITAL EVIDENCE RECORD</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                    This compliance certificate is registered in the FoodSafe365 storage system under evidence ID <code>{activeDoc.evidenceId}</code>.
                  </p>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6 }}>
                    <span>Category:</span>
                    <strong style={{ color: '#0f172a' }}>{activeDoc.category}</strong>
                    <span>Last Verified:</span>
                    <strong style={{ color: '#0f172a' }}>{activeDoc.lastVerified}</strong>
                    <span>Lifecycle Status:</span>
                    <strong style={{ color: '#059669' }}>Quarantine Cleared (Clean)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Presigned URL securely issued inline
                  </span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={closeModal} className="btn secondary">
                      Close
                    </button>
                    <a
                      href={previewData?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                    >
                      <Download size={14} />
                      <span>Download File</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
