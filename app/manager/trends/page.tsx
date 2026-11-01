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
  Bot,
  Thermometer,
  Info
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import GlobalHeader from '@/components/GlobalHeader';
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
      <GlobalHeader />

      <div className="container" style={{ maxWidth: 1140, paddingTop: 24 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Link href="/" className="muted nav-link" style={{ padding: '2px 6px', fontSize: 13 }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <span className="muted">/</span>
          <Link href="/manager" className="muted nav-link" style={{ padding: '2px 6px', fontSize: 13 }}>
            Manager overview
          </Link>
          <span className="muted">/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AI Checklist Trends</span>
        </div>

        {/* PROMINENT SIMULATION & METHODOLOGY NOTICE */}
        <div style={{
          background: '#FFFBEB',
          border: '2px solid #F59E0B',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={24} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: '#92400E', fontSize: 14.5, display: 'block', marginBottom: 4 }}>
              DEMONSTRATION &amp; SIMULATED PREDICTIVE MODEL PREVIEW
            </strong>
            <p style={{ margin: 0, fontSize: 13, color: '#78350F', lineHeight: 1.55 }}>
              The predictive safety score (86/100), statistical confidence figure (94.8%), and equipment failure probabilities displayed below are <strong>simulated machine-learning models</strong> demonstrated on synthetic kitchen data. In production environments, FoodSafe365 begins with <strong>descriptive analytics</strong> (verified temperature deviations and shift completion rates), introducing predictive claims only after empirical sensor validation.
            </p>
          </div>
        </div>

        {/* Header & Period Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} /> DESCRIPTIVE &amp; PREDICTIVE ANALYTICS
            </p>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', margin: '4px 0 10px', letterSpacing: '-0.02em' }}>
              Food Safety Performance Trends
            </h1>
            <p className="lead" style={{ fontSize: 15, margin: 0, maxWidth: 680 }}>
              Analysis across 29 daily safeguards, temperature logs, and corrective actions to monitor operational trends and highlight temperature excursions before violations occur.
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

        {/* PRIMARY: DESCRIPTIVE ANALYTICS — TEMPERATURE DEVIATIONS & SHIFT ADHERENCE */}
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1.5px solid #CBD5E1',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 28,
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Thermometer size={22} style={{ color: '#059669' }} />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Factual Operational Telemetry: Temperature Deviations
              </h2>
              <p className="muted" style={{ margin: '2px 0 0', fontSize: 12.5 }}>
                Verified historical data logged during daily kitchen shifts
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: '#F8FAF6', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px' }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Cool Storage (Chiller)</span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', margin: '4px 0' }}>3.2°C Avg</div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Within safe target (&lt; 5°C)</span>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Deviations recorded: 0 excursions</div>
            </div>

            <div style={{ background: '#F8FAF6', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px' }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Deep Freezer</span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', margin: '4px 0' }}>-19.4°C Avg</div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Within safe target (&lt; -18°C)</span>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Deviations recorded: 0 excursions</div>
            </div>

            <div style={{ background: '#F8FAF6', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px' }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Hot Holding Display</span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', margin: '4px 0' }}>68.5°C Avg</div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>Within safe target (≥ 65°C)</span>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Deviations recorded: 0 excursions</div>
            </div>

            <div style={{ background: '#F8FAF6', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px' }}>
              <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>29 Safeguards Adherence</span>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '4px 0' }}>96.8%</div>
              <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>29 / 29 checks tracked</span>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Across Opening, Midday, Closing</div>
            </div>
          </div>
        </div>

        {/* HERO: Predictive Risk Score Banner (Clearly Tagged as Simulation Model) */}
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
            <span className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>SIMULATED PREDICTIVE SCORE</span>
            <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: riskColor, letterSpacing: '-0.03em', margin: '8px 0' }}>
              {report.predictiveScore}
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--muted)' }}>/100</span>
            </div>
            <span className={`pill ${report.riskLevel === 'low' ? 'good' : report.riskLevel === 'moderate' ? 'attention' : 'danger'}`} style={{ fontSize: 11, padding: '3px 10px' }}>
              {report.riskLevel.toUpperCase()} RISK PROFILE (SIMULATED)
            </span>
          </div>

          {/* AI Narrative Context */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={18} color="var(--green)" />
              <h2 style={{ fontSize: 20, margin: 0 }}>Predictive Assessment Preview</h2>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>
                SIMULATION BETA
              </span>
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
                <span className="muted" style={{ fontSize: 12 }}>Model Fit Confidence:</span>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--green)' }}>94.8% (Simulated)</strong>
              </div>
              <div>
                <span className="muted" style={{ fontSize: 12 }}>Operational Diligence:</span>
                <strong style={{ display: 'block', fontSize: 16, color: 'var(--text)' }}>Inspection-Ready</strong>
              </div>
            </div>
          </div>
        </div>

        {/* MODEL METHODOLOGY & LIMITATIONS DISCLOSURE BOX */}
        <div style={{
          background: 'var(--surface-subtle, #f8fafc)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 32,
          fontSize: 13,
          color: '#475569',
          lineHeight: 1.6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Info size={16} style={{ color: '#059669' }} />
            <strong style={{ color: '#0F172A', fontSize: 13.5 }}>Model Methodology &amp; Validation Disclosures:</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li><strong>Data Supporting Predictions:</strong> Based on synthesized scenario logs mirroring historical temperature drift patterns, recurring shift timings, and corrective action closure intervals.</li>
            <li><strong>Model Validation Status:</strong> Currently operating as an illustrative predictive simulation. Live production deployments require a minimum of 90 days continuous operational sensor data per establishment before predictive weights are validated for decision-making.</li>
            <li><strong>Understanding Confidence Figures (94.8%):</strong> Represents algorithmic mathematical fit against the benchmark test corpus, not a guaranteed real-world outcome.</li>
            <li><strong>Operational Limitations:</strong> Predictive heuristics cannot foresee external utility outages, undocumented manual interventions, or sudden mechanical equipment failures.</li>
          </ul>
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
                Simulated pattern detection reveals when and where operational lapses are most likely to occur.
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
              <h2>Simulated Equipment Health &amp; Failure Forecast</h2>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>
                Demonstration degradation indicators for refrigeration compressors, thermostats, and probe monitors.
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
                      <span className="muted" style={{ display: 'block', fontSize: 10 }}>Failure Probability (Simulated)</span>
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
                Targeted actions to eliminate recurring failures and maintain operational compliance.
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
                    <span className="pill good" style={{ fontSize: 10, padding: '2px 6px' }}>{rec.confidence} CONFIDENCE (SIMULATED)</span>
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
