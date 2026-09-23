'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Star,
  AlertTriangle,
  QrCode,
  Droplets,
  Utensils,
  Sparkles,
  Send,
  Check,
  Thermometer,
  Clock,
  Home,
  MessageSquare,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import {
  PHASE1_STORAGE_KEY,
  AppPhase1State,
  DinerSafetyRating,
  DinerIncidentReport,
  CorrectiveAction,
  AuditTrailEvent
} from '@/lib/foodsafety28';

export default function TableQrPage() {
  const params = useParams();
  const outletId = (params.outlet_id as string) || 'abc-restaurant';

  const [activeTab, setActiveTab] = useState<'rate' | 'complain'>('rate');
  const [tableNumber, setTableNumber] = useState('Table 4');
  const [dinerName, setDinerName] = useState('');
  const [dinerPhone, setDinerPhone] = useState('');

  // 5-Point Safety Scores
  const [cleanliness, setCleanliness] = useState(5);
  const [staffHygiene, setStaffHygiene] = useState(5);
  const [foodFreshness, setFoodFreshness] = useState(5);
  const [safeWater, setSafeWater] = useState(5);
  const [washroom, setWashroom] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Complaint / Grievance State
  const [grievanceCategory, setGrievanceCategory] = useState<'undercooked_food' | 'foreign_object' | 'bad_odor_taste' | 'dirty_cutlery' | 'pest_sighting' | 'hygiene_violation'>('undercooked_food');
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [grievanceSuccess, setGrievanceSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Read cached diner user if signed in
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('foodsafe365_diner_user');
      if (cached) {
        try {
          const u = JSON.parse(cached);
          if (u.name) setDinerName(u.name);
          if (u.mobile) setDinerPhone(u.mobile);
        } catch {}
      }
    }
  }, []);

  const overallRating = ((cleanliness + staffHygiene + foodFreshness + safeWater + washroom) / 5).toFixed(1);

  function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newRating: DinerSafetyRating = {
      id: `rating-${Date.now()}`,
      outletId,
      outletName: 'ABC Restaurant — Bandra West',
      createdAt: new Date().toISOString(),
      dinerName: dinerName.trim() || 'Verified Diner',
      dinerMobile: dinerPhone.trim() || undefined,
      tableNumber,
      scores: {
        cleanliness,
        staffHygiene,
        foodFreshness,
        safeWater,
        washroom
      },
      overallScore: parseFloat(overallRating),
      feedback: feedback.trim() || undefined,
      verifiedDineIn: true
    };

    try {
      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      const state: AppPhase1State = raw ? JSON.parse(raw) : {};
      state.dinerRatings = [newRating, ...(state.dinerRatings || [])];

      const newEvent: AuditTrailEvent = {
        id: `event-${Date.now()}`,
        at: new Date().toISOString(),
        type: 'Diner Food-Safety Rating',
        detail: `Diner at ${tableNumber} rated food safety ${overallRating}/5★ (Cleanliness: ${cleanliness}★, Hygiene: ${staffHygiene}★, Freshness: ${foodFreshness}★).`,
        status: 'guest_rated'
      };
      state.timeline = [newEvent, ...(state.timeline || [])];

      localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('foodsaf365:update'));
    } catch {}

    setRatingSubmitted(true);
  }

  function handleGrievanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!grievanceDesc.trim()) return;

    const ticketId = `GRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const actionId = `act-guest-${Date.now()}`;

    const incident: DinerIncidentReport = {
      id: ticketId,
      outletId,
      outletName: 'ABC Restaurant — Bandra West',
      createdAt: new Date().toISOString(),
      dinerName: dinerName.trim() || 'Table Guest',
      dinerPhone: dinerPhone.trim() || 'Not Provided',
      tableNumber,
      category: grievanceCategory,
      severity: 'critical',
      description: grievanceDesc.trim(),
      status: 'received',
      actionId
    };

    // Auto-create a high-priority action for the restaurant manager
    const newAction: CorrectiveAction = {
      id: actionId,
      issueId: `issue-${ticketId}`,
      checkCode: 'GUEST-GRIEVANCE',
      title: `[Guest Alert - ${tableNumber}] ${grievanceCategory.replace('_', ' ').toUpperCase()}`,
      description: `Reported by ${dinerName || 'Guest'} (${dinerPhone || 'No phone'}): ${grievanceDesc.trim()}`,
      severity: 'critical',
      status: 'open',
      createdAt: new Date().toISOString(),
      immediateAction: 'Manager on duty to visit table immediately, inspect item, and issue replacement/remedy.',
      correctiveAction: 'Audit kitchen prep station, verify CCP limits, and brief duty cooks on standard.',
      rootCause: 'Immediate diner grievance requiring resolution before leaving premises.'
    };

    try {
      const raw = localStorage.getItem(PHASE1_STORAGE_KEY);
      const state: AppPhase1State = raw ? JSON.parse(raw) : {};
      state.dinerIncidents = [incident, ...(state.dinerIncidents || [])];
      state.actions = [newAction, ...(state.actions || [])];

      const newEvent: AuditTrailEvent = {
        id: `event-${Date.now()}`,
        at: new Date().toISOString(),
        type: 'Urgent Guest Grievance Logged',
        detail: `[Ticket ${ticketId}] Diner at ${tableNumber} reported ${grievanceCategory}: "${grievanceDesc.trim().slice(0, 60)}...". Action created.`,
        status: 'guest_alert'
      };
      state.timeline = [newEvent, ...(state.timeline || [])];

      localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('foodsaf365:update'));
    } catch {}

    setGrievanceSuccess(ticketId);
    setGrievanceDesc('');
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <div className="topbar" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Link href="/home" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}
          >
            <Home size={14} /> Home
          </Link>
          <Link href="/diner" className="btn secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
            Diner Portal
          </Link>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, paddingTop: 20 }}>
        {/* Tabletop Context Card */}
        <div className="card" style={{ padding: 20, marginBottom: 18, borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="pill good" style={{ fontSize: 11, padding: '2px 8px' }}>
                <QrCode size={11} style={{ display: 'inline', marginRight: 4 }} />
                TABLETOP VERIFIED AUDIT
              </span>
              <h1 style={{ fontSize: 22, margin: '8px 0 2px', color: '#0f172a' }}>ABC Restaurant</h1>
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>Bandra West, Mumbai · Table QR #04</p>
            </div>
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 12,
              padding: '8px 12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#047857', display: 'block' }}>FOODSAFE</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>TODAY VERIFIED</span>
            </div>
          </div>

          {/* Quick Public Hygiene Signals */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid #f1f5f9'
          }}>
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px 4px', borderRadius: 8 }}>
              <Thermometer size={16} color="#059669" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Cold &lt; 5°C</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Refrigeration OK</div>
            </div>
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px 4px', borderRadius: 8 }}>
              <UserCheck size={16} color="#2563eb" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>100% Medical</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Stool Test Cleared</div>
            </div>
            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '8px 4px', borderRadius: 8 }}>
              <ShieldCheck size={16} color="#7c3aed" style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>Pest Safe</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Inspected Weekly</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Rate Safety vs Lodge Complaint */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          background: '#e2e8f0',
          padding: 4,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('rate')}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'rate' ? '#ffffff' : 'transparent',
              color: activeTab === 'rate' ? '#059669' : '#64748b',
              boxShadow: activeTab === 'rate' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <Star size={15} /> Rate Food Safety (5-Point)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complain')}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: activeTab === 'complain' ? '#ffffff' : 'transparent',
              color: activeTab === 'complain' ? '#dc2626' : '#64748b',
              boxShadow: activeTab === 'complain' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <AlertTriangle size={15} /> Report a Safety Issue
          </button>
        </div>

        {/* TAB 1: RATE FOOD SAFETY */}
        {activeTab === 'rate' && (
          <div className="card" style={{ padding: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
            {ratingSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <Check size={28} />
                </div>
                <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>Thank You for Verifying Food Safety!</h2>
                <p className="muted" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
                  Your {overallRating}★ audit score has been recorded into the live FoodSafe365 transparency index for ABC Restaurant.
                </p>
                <button
                  type="button"
                  onClick={() => setRatingSubmitted(false)}
                  className="btn secondary"
                  style={{ fontSize: 13 }}
                >
                  Submit Another Rating
                </button>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>Diner 5-Touchpoint Safety Audit</h2>
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    Rate what you observe at your table. High diner scores reward clean restaurants.
                  </p>
                </div>

                {/* Score Item 1: Cleanliness */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>1. Dining Area &amp; Table Cleanliness</strong>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Tables sanitized, odorless, clean cutlery &amp; napkins</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>{cleanliness}★</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCleanliness(star)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: cleanliness >= star ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: cleanliness >= star ? '#ecfdf5' : '#ffffff',
                          color: cleanliness >= star ? '#047857' : '#94a3b8',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Item 2: Staff Hygiene */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>2. Server &amp; Staff Hygiene</strong>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Clean uniforms, hair secured, clean fingernails/gloves</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>{staffHygiene}★</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStaffHygiene(star)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: staffHygiene >= star ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: staffHygiene >= star ? '#ecfdf5' : '#ffffff',
                          color: staffHygiene >= star ? '#047857' : '#94a3b8',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Item 3: Food Freshness & Temp */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>3. Food Freshness &amp; Proper Temperature</strong>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Hot dishes served hot, salads cold, fresh taste &amp; aroma</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>{foodFreshness}★</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFoodFreshness(star)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: foodFreshness >= star ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: foodFreshness >= star ? '#ecfdf5' : '#ffffff',
                          color: foodFreshness >= star ? '#047857' : '#94a3b8',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Item 4: Safe Drinking Water */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>4. Safe Drinking Water &amp; Clean Glasses</strong>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Clear odorless water, spotless glasses, sealed ice hygiene</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>{safeWater}★</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSafeWater(star)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: safeWater >= star ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: safeWater >= star ? '#ecfdf5' : '#ffffff',
                          color: safeWater >= star ? '#047857' : '#94a3b8',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score Item 5: Washroom Sanitation */}
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>5. Washroom &amp; Handwash Cleanliness</strong>
                      <p className="muted" style={{ margin: 0, fontSize: 12 }}>Hand soap available, clean basin, dry paper/hand-dryer</p>
                    </div>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: 15 }}>{washroom}★</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setWashroom(star)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          border: washroom >= star ? '1px solid #059669' : '1px solid #cbd5e1',
                          background: washroom >= star ? '#ecfdf5' : '#ffffff',
                          color: washroom >= star ? '#047857' : '#94a3b8',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Feedback */}
                <label className="field">
                  <span>Comments or Observations (Optional)</span>
                  <textarea
                    className="input textarea"
                    style={{ minHeight: 70 }}
                    placeholder="e.g. Prompt service, glasses were sparkling clean, food was piping hot..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  className="btn primary"
                  style={{
                    padding: '12px 20px',
                    fontSize: 15,
                    background: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <Send size={15} /> Submit Diner Food-Safety Rating ({overallRating}★)
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: LODGE A SAFETY GRIEVANCE */}
        {activeTab === 'complain' && (
          <div className="card" style={{ padding: 24, boxShadow: '0 4px 14px rgba(0,0,0,0.05)', borderTop: '4px solid #dc2626' }}>
            {grievanceSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertTriangle size={28} />
                </div>
                <span className="pill action" style={{ fontSize: 12, padding: '3px 10px', marginBottom: 8 }}>
                  TICKET #{grievanceSuccess} DISPATCHED
                </span>
                <h2 style={{ fontSize: 20, margin: '8px 0 6px' }}>Manager on Duty Notified</h2>
                <p className="muted" style={{ fontSize: 14, maxWidth: 440, margin: '0 auto 16px' }}>
                  Your food safety report has been logged directly into the restaurant’s <strong>Actions Centre</strong>. The General Manager has been requested to visit <strong>{tableNumber}</strong> immediately.
                </p>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, maxWidth: 360, margin: '0 auto 20px', textAlign: 'left', fontSize: 13 }}>
                  <div><strong>Outlet:</strong> ABC Restaurant</div>
                  <div><strong>Table:</strong> {tableNumber}</div>
                  <div><strong>Category:</strong> {grievanceCategory.replace('_', ' ')}</div>
                  <div><strong>Status:</strong> Immediate Resolution In Progress</div>
                </div>
                <button
                  type="button"
                  onClick={() => setGrievanceSuccess(null)}
                  className="btn secondary"
                  style={{ fontSize: 13 }}
                >
                  Report Another Concern
                </button>
              </div>
            ) : (
              <form onSubmit={handleGrievanceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, margin: '0 0 4px', color: '#991b1b' }}>Report Food Safety Grievance</h2>
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    Notice something unsafe? Alert the restaurant GM directly through FoodSafe365 for immediate resolution on-site.
                  </p>
                </div>

                <div className="grid grid2" style={{ gap: 12 }}>
                  <label className="field">
                    <span>Your Table / Seat</span>
                    <input
                      className="input"
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 4"
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Your Name (for manager to greet)</span>
                    <input
                      className="input"
                      value={dinerName}
                      onChange={e => setDinerName(e.target.value)}
                      placeholder="e.g. Priya"
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Nature of Food-Safety Concern</span>
                  <select
                    className="input"
                    value={grievanceCategory}
                    onChange={e => setGrievanceCategory(e.target.value as any)}
                  >
                    <option value="undercooked_food">🥩 Undercooked / Raw Meat or Poultry</option>
                    <option value="foreign_object">🔍 Foreign Object in Food (Hair, Insect, Plastic, Stone)</option>
                    <option value="bad_odor_taste">👃 Bad Odor / Sour / Stale Food</option>
                    <option value="dirty_cutlery">🍽️ Dirty Cutlery / Stained Glasses / Sticky Table</option>
                    <option value="pest_sighting">🪳 Pest Sighting in Dining Area (Flies, Cockroach)</option>
                    <option value="hygiene_violation">🧼 Server Hygiene Violation (Coughing, No handwashing)</option>
                  </select>
                </label>

                <label className="field">
                  <span>Describe what happened</span>
                  <textarea
                    className="input textarea"
                    style={{ minHeight: 90 }}
                    placeholder="Provide details (e.g. Chicken tikka served raw inside, foul sour smell from raita, fly on dining table...)"
                    value={grievanceDesc}
                    onChange={e => setGrievanceDesc(e.target.value)}
                    required
                  />
                </label>

                <div className="notice warning" style={{ fontSize: 13 }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>
                    Submitting this creates an emergency ticket in the manager’s FoodSafe365 control dashboard.
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn primary"
                  style={{
                    padding: '12px 20px',
                    fontSize: 15,
                    background: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <AlertTriangle size={16} /> Alert Restaurant General Manager
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

