'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Home,
  Wrench,
  Clock,
  Calendar,
  Activity,
  ChevronRight,
  Bot
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import {
  TrendPeriod,
  generateAiTrendReport,
  RiskLevel
} from '@/lib/ai-trends-engine';

export default function TrendsPage() {
  const [period, setPeriod] = useState<TrendPeriod>('30d');
  const report = useMemo(() => generateAiTrendReport(period), [period]);

  const riskColor = report.riskLevel === 'low' ? '#059669' : report.riskLevel === 'moderate' ? '#f59e0b' : '#ef4444';

  return (
    <main style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Topbar */}
      <div className="topbar">
        <Link href="/home" className="brand">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14
          }}>
            FS
          </div>
          <span>FoodSafe365</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="pill good" style={{ fontSize: 11, padding: '3px 8px' }}>
            <Sparkles size={11} style={{ marginRight: 4, display: 'inline' }} />
            AI TREND ENGINE ACTIVE
          </span>
          <ThemeToggle />
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}
          >
            <Home size={15} /> Home
          </Link>
          <div className="muted" style={{ fontSize: 13 }}>ABC Restaurant · Manager</div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1140, paddingTop: 24 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Link href="/home" className="muted nav-link" style={{ padding: '2px 6px', fontSize: 13 }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <span className="muted">/</span>
          <Link href="/manager" className="muted nav-link" style={{ padding: '2px 6px', fontSize: 13 }}>
            Manager overview
          </Link>
          <span className="muted">/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AI Checklist Trends</span>
        </div>

        {/* Header & Period Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} /> AI CHECKLIST INTELLIGENCE &amp; PREDICTIVE ANALYTICS
            </p>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>
              Food Safety Performance Trends
            </h1>
            <p className="lead" style={{ fontSize: 15, margin: 0, maxWidth: 680 }}>
              Continuous machine-learning analysis across 29 daily safeguards, temperature logs, and corrective actions to predict vulnerabilities before regulatory violations or foodborne illnesses occur.
            </p>
          </div>

          {/* Time Period Filter Pills */}
          <div className="tabs" style={{ background: 'var(--surface-subtle)', padding: 4, borderRadius: 999, border: '1px solid var(--border)' }}>
            {(['7d', '30d', '90d'] as TrendPeriod[]).map(p => (
              <button
                key={p}
                className={period === p ? 'tab active' : 'tab'}
                onClick={() => setPeriod(p)}
                style={{ borderRadius: 999, fontSize: 13, padding: '7px 18px' }}
              >
                {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* HERO: Predictive Risk Score Banner */}
        <div className="card" style={{
          padding: '28px 32px',
          borderRadius: 20,
          marginBottom: 28,
          background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--surface-subtle) 100%)',
          border: '1.5px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 260px) 1fr',
          gap: 32,
          alignItems: 'center'
        }}>
          {/* Radial Metric Dial */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            borderRadius: 18,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xs)',
            textAlign: 'center'
          }}>
            <span className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>PREDICTIVE SAFETY SCORE</span>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: riskColor, letterSpacing: '-0.03em', margin: '8px 0' }}>
              {report.predictiveScore}
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--muted)' }}>/100</span>
            </div>
            <span className={`pill ${report.riskLevel === 'low' ? 'good' : report.riskLevel === 'moderate' ? 'attention' : 'danger'}`} style={{ fontSize: 11, padding: '3px 10px' }}>
              {report.riskLevel.toUpperCase()} RISK PROFILE
            </span>
          </div>

          {/* AI Narrative Context */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={18} color="var(--green)" />
              <h2 style={{ fontSize: 20, margin: 0 }}>Executive AI Assessment</h2>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-body)', margin: '0 0 16px' }}>
              {report.summaryExplanation}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Evaluated Safeguards:</span>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--text)' }}>29 Controls</strong>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Predictive Confidence:</span>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--green)' }}>94.8% High</strong>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Regulatory Status:</span>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--text)' }}>Inspection-Ready</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Category Compliance Velocities */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-title">
            <div>
              <h2>Control Category Compliance Velocities</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                Comparing current checklist adherence against the previous {period === '7d' ? '7-day' : period === '30d' ? '30-day' : 'quarterly'} baseline.
              </p>
            </div>
          </div>

          <div className="grid grid2">
            {report.categories.map(cat => {
              const isUp = cat.delta > 0;
              const isZero = cat.delta === 0;
              return (
                <div className="card" key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="eyebrow" style={{ fontSize: 11 }}>CONTROL DOMAIN</span>
                      <h3 style={{ fontSize: 16, margin: '2px 0 4px' }}>{cat.category}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isUp ? 'var(--green-surface)' : isZero ? 'var(--surface-subtle)' : 'var(--red-surface)',
                        color: isUp ? 'var(--green)' : isZero ? 'var(--muted)' : 'var(--red)'
                      }}>
                        {isUp ? <ArrowUp size={14} /> : isZero ? <Minus size={14} /> : <ArrowDown size={14} />}
                        {isUp ? `+${cat.delta}%` : isZero ? '0%' : `${cat.delta}%`}
                      </span>
                    </div>
                  </div>

                  {/* Big Percentage & Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)' }}>{cat.currentRate}%</span>
                      <span className="muted" style={{ fontSize: 13 }}>Baseline: {cat.baselineRate}%</span>
                    </div>
                    <div className="progress" style={{ margin: 0, height: 8 }}>
                      <span style={{
                        width: `${cat.currentRate}%`,
                        background: cat.currentRate >= 90
                          ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          : cat.currentRate >= 80
                          ? 'linear-gradient(90deg, #fbbf24 0%, #d97706 100%)'
                          : 'linear-gradient(90deg, #f87171 0%, #dc2626 100%)'
                      }} />
                    </div>
                  </div>

                  <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                    {cat.highlight}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Temporal Anomaly & Day-of-Week Hotspots */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-title">
            <div>
              <h2>Day-of-Week &amp; Shift Anomaly Hotspots</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                Predictive pattern detection reveals when and where operational lapses are most likely to occur.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.hotspots.map((hs, i) => (
              <div
                key={i}
                className="card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(140px, 180px) 1fr auto',
                  gap: 20,
                  alignItems: 'center'
                }}
              >
                <div>
                  <span className="pill neutral" style={{ fontSize: 11, padding: '2px 8px', marginBottom: 4 }}>
                    <Calendar size={11} style={{ marginRight: 4, display: 'inline' }} />
                    {hs.day}
                  </span>
                  <strong style={{ display: 'block', fontSize: 13, color: 'var(--text)' }}>{hs.shift}</strong>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <AlertTriangle size={15} color={hs.severity === 'critical' ? '#ef4444' : '#f59e0b'} />
                    <strong style={{ fontSize: 14.5, color: 'var(--text)' }}>{hs.riskFactor}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>({hs.frequency})</span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>AI Recommended Action: </span>
                    {hs.mitigation}
                  </p>
                </div>

                <span className={`pill ${hs.severity === 'critical' ? 'danger' : 'attention'}`} style={{ fontSize: 11 }}>
                  {hs.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Predictive Equipment Diagnostics */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-title">
            <div>
              <h2>Predictive Equipment Health &amp; Failure Forecast</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                Early-warning degradation indicators for refrigeration compressors, thermostats, and probe monitors.
              </p>
            </div>
          </div>

          <div className="grid grid2">
            {report.equipmentInsights.map(eq => (
              <div className="card" key={eq.equipment} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <span className="eyebrow" style={{ fontSize: 11 }}>EQUIPMENT MONITOR</span>
                      <h3 style={{ fontSize: 16, margin: '2px 0' }}>{eq.equipment}</h3>
                      <span className="muted" style={{ fontSize: 12 }}>Location: {eq.location}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 20, fontWeight: 900, color: eq.riskProbability > 60 ? '#ef4444' : '#f59e0b' }}>
                        {eq.riskProbability}%
                      </span>
                      <span className="muted" style={{ display: 'block', fontSize: 10 }}>Failure Probability</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13.5, color: 'var(--text-body)', margin: '0 0 10px', lineHeight: 1.5 }}>
                    <strong>Observation:</strong> {eq.issue}
                  </p>

                  <div style={{ background: 'var(--surface-subtle)', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {eq.leadTime}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{eq.suggestedAction}</span>
                  {eq.providerCategory && (
                    <Link
                      href={`/providers?category=${eq.providerCategory}`}
                      className="btn primary"
                      style={{ fontSize: 12, padding: '7px 14px', whiteSpace: 'nowrap' }}
                    >
                      Book Tech <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: AI Recommended Strategic Interventions */}
        <div style={{ marginBottom: 36 }}>
          <div className="section-title">
            <div>
              <h2>AI Recommended Corrective Interventions</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                Targeted actions to eliminate recurring failures and safeguard your clean FSSAI compliance record.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.aiRecommendations.map(rec => (
              <div
                key={rec.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 20,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="pill good" style={{ fontSize: 10, padding: '2px 6px' }}>{rec.confidence} CONFIDENCE</span>
                    <strong style={{ fontSize: 16, color: 'var(--text)' }}>{rec.title}</strong>
                  </div>
                  <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
                    {rec.reason}
                  </p>
                </div>
                <Link
                  href={rec.actionHref}
                  className="btn primary"
                  style={{ fontSize: 13, padding: '9px 18px', whiteSpace: 'nowrap' }}
                >
                  {rec.actionLabel} <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <Link href="/manager" className="btn secondary">
            ← Manager Overview
          </Link>
          <Link href="/ai-copilot" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Bot size={15} /> Open FoodSafe AI Copilot
          </Link>
          <Link href="/records" className="btn secondary">
            Compliance Records &amp; History
          </Link>
        </div>
      </div>
    </main>
  );
}
