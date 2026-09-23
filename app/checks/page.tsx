'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Home, Info, Star, Thermometer } from 'lucide-react';
import {
  FOODSAFE28,
  FoodSafeCheck,
  CheckRecord,
  Issue,
  AuditTrailEvent,
  AppPhase1State,
  PHASE1_STORAGE_KEY,
  isScheduledCheck,
  calculateDailyBadge,
  Rating1To5,
  Rating1To5OrNA,
  NA_DEFINITION,
  RATING_DEFINITIONS,
  evaluateTemperature
} from '@/lib/foodsafety28';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/lib/vernacular';
import { Award } from 'lucide-react';

function loadState(): AppPhase1State {
  try {
    return JSON.parse(localStorage.getItem(PHASE1_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(v: AppPhase1State) {
  localStorage.setItem(PHASE1_STORAGE_KEY, JSON.stringify(v));
  window.dispatchEvent(new Event('foodsaf365:update'));
}

export default function Checks() {
  const { lang, t, getCheckText } = useLanguage();
  const [data, setData] = useState<AppPhase1State>({});
  const [selected, setSelected] = useState<FoodSafeCheck | null>(null);
  const [value, setValue] = useState('');
  const [rating, setRating] = useState<Rating1To5OrNA | null>(null);
  const [obsNote, setObsNote] = useState('');
  const [result, setResult] = useState<'good' | 'attention' | null>(null);
  const [storageType, setStorageType] = useState<'cool' | 'cold' | 'chilled' | 'frozen' | ''>('');
  const [processMode, setProcessMode] = useState<'cooking' | 'reheating' | ''>('');
  const [foodType, setFoodType] = useState<'veg' | 'nonveg' | ''>('');
  const [cookMethod, setCookMethod] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [coolFirstTemp, setCoolFirstTemp] = useState('');
  const [coolFirstTime, setCoolFirstTime] = useState('');
  const [coolFinalTemp, setCoolFinalTemp] = useState('');
  const [coolFinalTime, setCoolFinalTime] = useState('');
  const [holdingType, setHoldingType] = useState<'hot' | 'cold' | ''>('');
  const [reheatMethodOK, setReheatMethodOK] = useState<'yes' | 'no' | ''>('');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'kitchen' | 'bar_brewery' | 'cloud_kitchen' | 'catering'>('all');

  useEffect(() => {
    const refresh = () => setData(loadState());
    refresh();

    const q = new URLSearchParams(window.location.search);
    const id = Number(q.get('check'));
    const code = q.get('code');
    const focus = q.get('focus');
    const fmt = q.get('format');

    if (fmt === 'bar_brewery' || fmt === 'cloud_kitchen' || fmt === 'catering' || fmt === 'kitchen') {
      setSelectedFormat(fmt);
    }

    if (id) {
      const match = FOODSAFE28.find(x => x.id === id);
      if (match) openCheck(match);
    } else if (code) {
      const match = FOODSAFE28.find(x => x.code === code);
      if (match) openCheck(match);
    } else if (focus) {
      if (focus === 'storage') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-19');
        if (match) openCheck(match);
      } else if (focus === 'cooking') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-21');
        if (match) {
          openCheck(match);
          setProcessMode('cooking');
        }
      } else if (focus === 'reheating') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-21');
        if (match) {
          openCheck(match);
          setProcessMode('reheating');
        }
      } else if (focus === 'cooling') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-22');
        if (match) openCheck(match);
      } else if (focus === 'holding') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-18' || x.code === 'FS28-19');
        if (match) openCheck(match);
      } else if (focus === 'thawing') {
        const match = FOODSAFE28.find(x => x.code === 'FS28-10');
        if (match) openCheck(match);
      }
    }

    window.addEventListener('foodsaf365:update', refresh);
    return () => window.removeEventListener('foodsaf365:update', refresh);
  }, []);

  const today = useMemo(() => FOODSAFE28.filter(isScheduledCheck), []);
  const filteredChecks = useMemo(() => {
    if (selectedFormat === 'all') return today;
    if (selectedFormat === 'kitchen') return today.filter(x => !x.outletType || x.outletType === 'all');
    return today.filter(x => x.outletType === selectedFormat);
  }, [today, selectedFormat]);
  const saved: Record<string, CheckRecord> = data.checks || {};
  const issues: Issue[] = data.issues || [];
  const remaining = today.filter(x => !saved[x.code]).length;
  const pending = today.filter(x => saved[x.code]?.reviewStatus === 'pending_manager').length;
  const badge = useMemo(() => calculateDailyBadge(saved, issues, today), [saved, issues, today]);

  function openCheck(c: FoodSafeCheck) {
    setSelected(c);
    setValue('');
    setRating(null);
    setObsNote('');
    setStorageType('');
    setProcessMode('');
    setFoodType('');
    setCookMethod('');
    setCookTime('');
    setCoolFirstTemp('');
    setCoolFirstTime('');
    setCoolFinalTemp('');
    setCoolFinalTime('');
    setHoldingType('');
    setReheatMethodOK('');
    setResult(null);
    history.replaceState(null, '', `/checks?check=${c.id}`);
  }

  // Real-time evaluation of the current inputs
  const currentEvaluation = useMemo<{ hasInput: boolean; isAcceptable: boolean; message: string; severity?: 'critical' | 'attention' }>(() => {
    if (!selected) return { hasInput: false, isAcceptable: false, message: '' };

    // Marked as Not Applicable
    if (rating === 'na') {
      return {
        hasInput: true,
        isAcceptable: true,
        message: 'N/A — Control is marked as Not Applicable for this facility, shift, or operational setup.'
      };
    }

    // 1 to 5 scale check
    if (selected.input === 'scale_1_5' || selected.input === 'yes_no') {
      if (rating === null) return { hasInput: false, isAcceptable: false, message: 'Select an evaluation score (1 to 5) or Not Applicable (N/A).' };
      const def = RATING_DEFINITIONS[rating as Rating1To5];
      return {
        hasInput: true,
        isAcceptable: def.acceptable,
        message: `${def.badge}: ${def.description}`,
        severity: def.severity
      };
    }

    // Temperature check
    if (selected.code === 'FS28-19') {
      const n = Number(value);
      if (!value.trim() || !Number.isFinite(n)) return { hasInput: false, isAcceptable: false, message: 'Enter cool-storage temperature (< 5°C) or mark as Not Applicable.' };
      const evalRes = evaluateTemperature(selected.code, n);
      return {
        hasInput: true,
        isAcceptable: evalRes.acceptable,
        message: evalRes.message,
        severity: 'critical'
      };
    }

    if (selected.code === 'FS28-20') {
      const n = Number(value);
      if (!value.trim() || !Number.isFinite(n)) return { hasInput: false, isAcceptable: false, message: 'Enter cold-storage temperature (< −18°C) or mark as Not Applicable.' };
      const evalRes = evaluateTemperature(selected.code, n);
      return {
        hasInput: true,
        isAcceptable: evalRes.acceptable,
        message: evalRes.message,
        severity: 'critical'
      };
    }

    if (selected.code === 'FS28-21') {
      if (!processMode) return { hasInput: false, isAcceptable: false, message: 'Select Cooking or Reheating, or mark as Not Applicable.' };
      if (processMode === 'cooking') {
        if (!foodType || !cookMethod) return { hasInput: false, isAcceptable: false, message: 'Select food category and validated target.' };
        const n = Number(value);
        const mins = Number(cookTime);
        if (!value.trim() || !cookTime.trim() || !Number.isFinite(n) || !Number.isFinite(mins)) {
          return { hasInput: false, isAcceptable: false, message: 'Enter core temperature and time at target.' };
        }
        let ok = false;
        if (foodType === 'veg' && cookMethod === 'veg-60-10') ok = n >= 60 && mins >= 10;
        else if (foodType === 'veg' && cookMethod === 'veg-65-2') ok = n >= 65 && mins >= 2;
        else if (foodType === 'nonveg' && cookMethod === 'nonveg-65-10') ok = n >= 65 && mins >= 10;
        else if (foodType === 'nonveg' && cookMethod === 'nonveg-70-2') ok = n >= 70 && mins >= 2;
        else if (foodType === 'nonveg' && cookMethod === 'nonveg-75-15') ok = n >= 75 && mins >= 0.25;

        return {
          hasInput: true,
          isAcceptable: ok,
          message: ok ? 'Acceptable — core temperature and time satisfy FSSAI cooking criteria.' : 'Attention — cooking temperature or time is below the validated limit.',
          severity: 'critical'
        };
      } else {
        const n = Number(value);
        const mins = Number(cookTime);
        if (!value.trim() || !cookTime.trim() || !reheatMethodOK || !Number.isFinite(n) || !Number.isFinite(mins)) {
          return { hasInput: false, isAcceptable: false, message: 'Enter reheated temperature, time and reheating method.' };
        }
        const ok = n >= 75 && mins >= 2 && reheatMethodOK === 'yes';
        return {
          hasInput: true,
          isAcceptable: ok,
          message: ok ? 'Acceptable — reheat reached ≥ 75°C for ≥ 2 min with direct heating.' : 'Attention — reheating criteria (≥ 75°C for 2 min direct) not met.',
          severity: 'critical'
        };
      }
    }

    if (selected.code === 'FS28-22') {
      const t1 = Number(coolFirstTemp);
      const m1 = Number(coolFirstTime);
      const t2 = Number(coolFinalTemp);
      const m2 = Number(coolFinalTime);
      if (!coolFirstTemp || !coolFirstTime || !coolFinalTemp || !coolFinalTime || !Number.isFinite(t1) || !Number.isFinite(m1) || !Number.isFinite(t2) || !Number.isFinite(m2)) {
        return { hasInput: false, isAcceptable: false, message: 'Enter both cooling checkpoints (temp and minutes) or mark as Not Applicable.' };
      }
      const ok = t1 <= 21 && m1 <= 120 && t2 <= 5 && m2 <= 120;
      return {
        hasInput: true,
        isAcceptable: ok,
        message: ok ? 'Acceptable — cooling achieved ≤ 21°C within 2h and ≤ 5°C within next 2h.' : 'Attention — cooling exceeded the permitted time or temperature limits.',
        severity: 'critical'
      };
    }

    const n = Number(value);
    const has = Boolean(value.trim());
    return { hasInput: has, isAcceptable: has && Number.isFinite(n), message: has ? 'Reading recorded.' : 'Enter measurement or mark as Not Applicable.' };
  }, [selected, value, rating, obsNote, storageType, processMode, foodType, cookMethod, cookTime, coolFirstTemp, coolFirstTime, coolFinalTemp, coolFinalTime, holdingType, reheatMethodOK]);

  function submit() {
    if (!selected || !currentEvaluation.hasInput) return;

    let good = currentEvaluation.isAcceptable;
    let recordedValue = '';

    if (rating === 'na') {
      recordedValue = `N/A — Not Applicable${obsNote.trim() ? ` · Reason: "${obsNote.trim()}"` : ''}`;
      good = true;
    } else if (selected.input === 'temperature') {
      if (selected.code === 'FS28-19') {
        recordedValue = `Cool storage: ${value}°C`;
      } else if (selected.code === 'FS28-20') {
        recordedValue = `Cold storage: ${value}°C`;
      } else if (selected.code === 'FS28-21' && processMode === 'cooking') {
        recordedValue = `Cooking · ${foodType === 'veg' ? 'Vegetarian' : 'Non-vegetarian'} · ${value}°C for ${cookTime} min`;
      } else if (selected.code === 'FS28-21' && processMode === 'reheating') {
        recordedValue = `Reheating · ${value}°C for ${cookTime} min · Direct method: ${reheatMethodOK === 'yes' ? 'Yes' : 'No'}`;
      } else if (selected.code === 'FS28-22') {
        recordedValue = `Cooling · Checkpoint 1: ${coolFirstTemp}°C in ${coolFirstTime} min · Checkpoint 2: ${coolFinalTemp}°C in ${coolFinalTime} min`;
      } else {
        recordedValue = `${value}°C`;
      }
    } else {
      if (rating !== null) {
        const def = RATING_DEFINITIONS[rating as Rating1To5];
        recordedValue = `${rating}/5 — ${def.label}${obsNote.trim() ? ` · Note: "${obsNote.trim()}"` : ''}`;
      } else {
        recordedValue = value;
      }
    }

    const now = new Date().toISOString();
    const event: AuditTrailEvent = {
      id: `evt-check-${selected.id}-${Date.now()}`,
      at: now,
      type: 'Supervisor check submitted',
      detail: `${selected.code} (${selected.title}): ${recordedValue} → ${rating === 'na' ? 'Not Applicable' : good ? 'Acceptable' : 'Needs attention'} (Awaiting manager review)`,
      status: 'pending_manager'
    };

    const nextState: AppPhase1State = {
      ...data,
      checks: {
        ...saved,
        [selected.code]: {
          status: rating === 'na' ? 'na' : good ? 'good' : 'attention',
          value: recordedValue,
          time: now,
          reviewStatus: 'pending_manager',
          processMode: selected.code === 'FS28-21' ? processMode : undefined
        }
      },
      timeline: [event, ...(data.timeline || [])]
    };

    saveState(nextState);
    setData(nextState);
    setResult(good ? 'good' : 'attention');
  }

  const pendingAttentionCount = today.filter(x => saved[x.code]?.reviewStatus === 'pending_manager' && saved[x.code]?.status === 'attention').length;

  if (selected) {
    const isQualitative = selected.input === 'scale_1_5' || selected.input === 'yes_no';

    return (
      <main>
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
            <LanguageSelector />
            <ThemeToggle />
            <Link href="/showcase" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
              <Award size={14} /> {t('nav.showcase')}
            </Link>
            <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
              <Home size={14} /> {t('nav.home')}
            </Link>
            <div className="muted">Supervisor · Guided check</div>
          </div>
        </div>
        <div className="container detail-shell">
          <button
            className="plain-link muted nav-link back-row"
            onClick={() => {
              setSelected(null);
              history.replaceState(null, '', '/checks');
            }}
          >
            <ChevronLeft size={17} /> {t('nav.backChecks')}
          </button>

          <div className="checks-header">
            <div>
              <p className="eyebrow">CHECK {selected.id} OF {FOODSAFE28.length} · DAILY FOOD SAFETY CHECK</p>
              <h1>{getCheckText(selected.code)?.title || selected.title}</h1>
              {lang !== 'en' && getCheckText(selected.code)?.title && (
                <p style={{ fontSize: 14, color: 'var(--muted, #64748b)', margin: '4px 0 0', fontStyle: 'italic' }}>
                  {selected.title}
                </p>
              )}
              <p className="muted" style={{ marginTop: 6 }}>
                {lang === 'hi'
                  ? 'वास्तविक स्थिति दर्ज करें और प्रबंधक समीक्षा के लिए परिणाम जमा करें।'
                  : lang === 'mr'
                  ? 'प्रत्यक्ष स्थिती नोंदवा आणि व्यवस्थापक पुनरावलोकनासाठी सादर करा.'
                  : 'Record the actual condition and submit the result for manager review.'}
              </p>
            </div>
          </div>

          <div className="check-context-bar">
            <div>
              <p className="eyebrow">1. WHAT TO CHECK</p>
              <ul className="check-what-list">
                {selected.what.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <Link href={`/food-safety-why?check=${selected.code}`} className="btn secondary">
              Why does this matter? <ArrowRight size={16} />
            </Link>
          </div>

          <section className="standard-card">
            <div className="eyebrow">2. WHAT STANDARD TO MEET</div>
            <h3>What is acceptable?</h3>
            {selected.code === 'FS28-19' ? (
              <>
                <p><strong>Standard:</strong> Operational reference for cool storage and refrigerators is <strong>&lt; 5°C</strong> (0°C to &lt; 5°C).</p>
                <p className="muted" style={{ margin: 0 }}>Perishable foods must be kept cool (&lt; 5°C) to prevent microbial proliferation.</p>
              </>
            ) : selected.code === 'FS28-20' ? (
              <>
                <p><strong>Standard:</strong> Operational reference for cold storage is <strong>&lt; −18°C</strong>.</p>
                <p className="muted" style={{ margin: 0 }}>Cold storage units must remain strictly below −18°C to protect food quality and safety.</p>
              </>
            ) : selected.code === 'FS28-21' ? (
              <>
                <p>Choose the thermal process being performed:</p>
                <div className="storage-choice-grid">
                  <button
                    type="button"
                    className={`option ${processMode === 'cooking' ? 'selected' : ''}`}
                    onClick={() => {
                      setProcessMode('cooking');
                      setValue('');
                      setFoodType('');
                      setCookMethod('');
                      setCookTime('');
                      setReheatMethodOK('');
                    }}
                  >
                    <strong>Cooking</strong>
                    <span>Measure the core temperature of cooked food.</span>
                    <b>Use the food-specific FSSAI criteria below.</b>
                  </button>
                  <button
                    type="button"
                    className={`option ${processMode === 'reheating' ? 'selected' : ''}`}
                    onClick={() => {
                      setProcessMode('reheating');
                      setValue('');
                      setFoodType('');
                      setCookMethod('');
                      setCookTime('');
                      setReheatMethodOK('');
                    }}
                  >
                    <strong>Reheating</strong>
                    <span>Measure core temperature of reheated food.</span>
                    <b>Target: ≥ 75°C for at least 2 min (direct heat)</b>
                  </button>
                </div>
              </>
            ) : selected.code === 'FS28-22' ? (
              <>
                <p>For cooked food being cooled before refrigeration:</p>
                <ul className="compact-list">
                  <li><strong>Checkpoint 1:</strong> ≤ 21°C within 120 minutes of cooling start</li>
                  <li><strong>Checkpoint 2:</strong> ≤ 5°C within the subsequent 120 minutes</li>
                </ul>
              </>
            ) : (
              <div>
                <p style={{ margin: '0 0 8px' }}>{selected.standard}</p>
                <div className="notice info" style={{ padding: '8px 12px', fontSize: 13 }}>
                  <span><strong>Evaluation standard:</strong> Scores <strong>4 and 5</strong> are acceptable. Scores <strong>1 to 3</strong> require attention / corrective action.</span>
                </div>
              </div>
            )}
          </section>

          {!result ? (
            <section className="card question-card">
              <div className="question-number">3. WHAT TO ENTER</div>
              {selected.input === 'temperature' ? (
                <div>
                  {/* Option for Not Applicable on temperature checks */}
                  <div style={{
                    marginBottom: 16,
                    padding: '12px 16px',
                    borderRadius: 14,
                    background: rating === 'na' ? '#f1f5f9' : '#f8fafc',
                    border: rating === 'na' ? '2px solid #64748b' : '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    boxShadow: rating === 'na' ? '0 0 0 3px rgba(100, 116, 139, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: rating === 'na' ? '#475569' : '#e2e8f0',
                        color: rating === 'na' ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 12
                      }}>
                        N/A
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
                          Equipment or thermal process not applicable this shift?
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          Mark N/A if equipment is not installed, bar is closed, or thermal step is not performed.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => {
                        if (rating === 'na') {
                          setRating(null);
                        } else {
                          setRating('na');
                          setValue('');
                        }
                      }}
                      style={{
                        fontSize: 12.5,
                        padding: '6px 14px',
                        background: rating === 'na' ? '#334155' : '#ffffff',
                        color: rating === 'na' ? '#ffffff' : '#334155',
                        border: rating === 'na' ? '1px solid #334155' : '1.5px solid #cbd5e1',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        borderRadius: 8
                      }}
                    >
                      {rating === 'na' ? '✓ Marked Not Applicable' : 'Mark as Not Applicable (N/A)'}
                    </button>
                  </div>

                  {rating === 'na' ? (
                    <div className="card" style={{ padding: '16px', background: '#f8fafc', border: '1.5px dashed #94a3b8', borderRadius: 12 }}>
                      <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#334155', fontWeight: 600 }}>
                        This temperature check is marked as <strong>Not Applicable (N/A)</strong>.
                      </p>
                      <label className="field">
                        <span>Operational reason for Not Applicable (optional note for manager)</span>
                        <textarea
                          className="input textarea"
                          value={obsNote}
                          onChange={e => setObsNote(e.target.value)}
                          placeholder="e.g. Walk-in chiller unit under planned maintenance / No reheating conducted on this shift / Facility does not handle frozen meat."
                          rows={2}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="measurement-box process-measurement">
                      <Thermometer size={26} />
                      {selected.code === 'FS28-19' ? (
                        <label className="field">
                          <span>Enter cool-storage / refrigerator temperature (°C) — Target: &lt; 5°C</span>
                          <input
                            autoFocus
                            className="input"
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder="e.g. 3.5"
                          />
                        </label>
                      ) : selected.code === 'FS28-20' ? (
                        <label className="field">
                          <span>Enter cold-storage temperature (°C) — Target: &lt; −18°C</span>
                          <input
                            autoFocus
                            className="input"
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder="e.g. -19.0"
                          />
                        </label>
                      ) : selected.code === 'FS28-21' && processMode === 'cooking' ? (
                        <div className="process-fields">
                          <div className="storage-choice-grid">
                            <button
                              type="button"
                              className={`option ${foodType === 'veg' ? 'selected' : ''}`}
                              onClick={() => {
                                setFoodType('veg');
                                setCookMethod('');
                              }}
                            >
                              <strong>Vegetarian</strong>
                              <b>Select validated option</b>
                            </button>
                            <button
                              type="button"
                              className={`option ${foodType === 'nonveg' ? 'selected' : ''}`}
                              onClick={() => {
                                setFoodType('nonveg');
                                setCookMethod('');
                              }}
                            >
                              <strong>Non-vegetarian</strong>
                              <b>Select validated option</b>
                            </button>
                          </div>
                          {foodType && (
                            <>
                              <label className="field">
                                <span>Cooking target standard</span>
                                <select className="input" value={cookMethod} onChange={e => setCookMethod(e.target.value)}>
                                  <option value="">Select target</option>
                                  {foodType === 'veg' ? (
                                    <>
                                      <option value="veg-60-10">≥ 60°C core for ≥ 10 minutes</option>
                                      <option value="veg-65-2">≥ 65°C core for ≥ 2 minutes</option>
                                    </>
                                  ) : (
                                    <>
                                      <option value="nonveg-65-10">≥ 65°C core for ≥ 10 minutes</option>
                                      <option value="nonveg-70-2">≥ 70°C core for ≥ 2 minutes</option>
                                      <option value="nonveg-75-15">≥ 75°C core for ≥ 15 seconds</option>
                                    </>
                                  )}
                                </select>
                              </label>
                              <label className="field">
                                <span>Enter observed core temperature (°C)</span>
                                <input
                                  className="input"
                                  type="number"
                                  step="0.1"
                                  value={value}
                                  onChange={e => setValue(e.target.value)}
                                  placeholder="e.g. 74.5"
                                />
                              </label>
                              <label className="field">
                                <span>Observed duration at target (minutes)</span>
                                <input
                                  className="input"
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={cookTime}
                                  onChange={e => setCookTime(e.target.value)}
                                  placeholder={cookMethod === 'nonveg-75-15' ? 'e.g. 0.25 (15 sec)' : 'e.g. 2'}
                                />
                              </label>
                            </>
                          )}
                        </div>
                      ) : selected.code === 'FS28-21' && processMode === 'reheating' ? (
                        <div className="process-fields">
                          <label className="field">
                            <span>Enter reheated food core temperature (°C)</span>
                            <input
                              autoFocus
                              className="input"
                              type="number"
                              step="0.1"
                              value={value}
                              onChange={e => setValue(e.target.value)}
                              placeholder="e.g. 76.0"
                            />
                          </label>
                          <label className="field">
                            <span>Time maintained at ≥ 75°C (minutes)</span>
                            <input
                              className="input"
                              type="number"
                              step="0.1"
                              min="0"
                              value={cookTime}
                              onChange={e => setCookTime(e.target.value)}
                              placeholder="e.g. 2"
                            />
                          </label>
                          <div className="method-check">
                            <strong>Direct reheating method used? (not bain-marie/holding unit)</strong>
                            <div className="storage-choice-grid">
                              <button
                                type="button"
                                className={`option ${reheatMethodOK === 'yes' ? 'selected' : ''}`}
                                onClick={() => setReheatMethodOK('yes')}
                              >
                                Yes — direct cooking equipment
                              </button>
                              <button
                                type="button"
                                className={`option ${reheatMethodOK === 'no' ? 'selected' : ''}`}
                                onClick={() => setReheatMethodOK('no')}
                              >
                                No — indirect holding equipment
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : selected.code === 'FS28-22' ? (
                        <div className="process-fields">
                          <div className="field-row">
                            <label className="field">
                              <span>Checkpoint 1 temperature (°C)</span>
                              <input
                                className="input"
                                type="number"
                                step="0.1"
                                value={coolFirstTemp}
                                onChange={e => setCoolFirstTemp(e.target.value)}
                                placeholder="Must be ≤ 21°C"
                              />
                            </label>
                            <label className="field">
                              <span>Time taken to Checkpoint 1 (minutes)</span>
                              <input
                                className="input"
                                type="number"
                                step="1"
                                min="0"
                                value={coolFirstTime}
                                onChange={e => setCoolFirstTime(e.target.value)}
                                placeholder="Must be ≤ 120 min"
                              />
                            </label>
                          </div>
                          <div className="field-row">
                            <label className="field">
                              <span>Checkpoint 2 temperature (°C)</span>
                              <input
                                className="input"
                                type="number"
                                step="0.1"
                                value={coolFinalTemp}
                                onChange={e => setCoolFinalTemp(e.target.value)}
                                placeholder="Must be ≤ 5°C"
                              />
                            </label>
                            <label className="field">
                              <span>Time from Chk 1 to Chk 2 (minutes)</span>
                              <input
                                className="input"
                                type="number"
                                step="1"
                                min="0"
                                value={coolFinalTime}
                                onChange={e => setCoolFinalTime(e.target.value)}
                                placeholder="Must be ≤ 120 min"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="field">
                          <span>Enter temperature (°C)</span>
                          <input
                            autoFocus
                            className="input"
                            type="number"
                            step="0.1"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder="e.g. 4.0"
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* QUALITATIVE 1 TO 5 RATING SCALE + NOT APPLICABLE */
                <div>
                  <p className="muted" style={{ marginBottom: 12 }}>
                    {lang === 'hi'
                      ? 'देखी गई परिचालन स्थिति को 1 से 5 के पैमाने पर रेट करें (5 सर्वश्रेष्ठ है), या लागू नहीं चुनें:'
                      : lang === 'mr'
                      ? 'प्रत्यक्ष कामाची स्थिती १ ते ५ च्या स्केलवर रेट करा (५ सर्वोत्तम), किंवा लागू नाही निवडा:'
                      : 'Rate the observed operational condition on a 1 to 5 scale (5 being best), or select Not Applicable:'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    {([5, 4, 3, 2, 1] as Rating1To5[]).map(r => {
                      const def = RATING_DEFINITIONS[r];
                      const isSelected = rating === r;
                      const activeBg = r >= 4 ? '#ecfdf5' : r === 3 ? '#fffbeb' : '#fef2f2';
                      const activeBorder = r >= 4 ? '#059669' : r === 3 ? '#f59e0b' : '#ef4444';
                      const starColor = r >= 4 ? '#059669' : r === 3 ? '#d97706' : '#dc2626';
                      const badgeLabel = r >= 4
                        ? (lang === 'hi' ? 'स्वीकार्य' : lang === 'mr' ? 'स्वीकार्य' : 'Acceptable')
                        : r === 3
                        ? (lang === 'hi' ? 'ध्यान दें' : lang === 'mr' ? 'लक्ष द्या' : 'Needs attention')
                        : (lang === 'hi' ? 'अलर्ट आवश्यक' : lang === 'mr' ? 'धोका अलर्ट' : 'Alert required');
                      const ratingLabel = lang === 'hi'
                        ? (r === 5 ? 'उत्कृष्ट' : r === 4 ? 'अच्छा' : r === 3 ? 'ध्यान दें' : r === 2 ? 'असंतोषजनक' : 'गंभीर जोखिम')
                        : lang === 'mr'
                        ? (r === 5 ? 'उत्कृष्ट' : r === 4 ? 'समाधानकारक' : r === 3 ? 'लक्ष द्या' : r === 2 ? 'असमाधानकारक' : 'गंभीर धोका')
                        : def.label;
                      return (
                        <button
                          key={r}
                          type="button"
                          className="card"
                          style={{
                            padding: '16px 12px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: 14,
                            border: isSelected ? `2px solid ${activeBorder}` : '1.5px solid #e2e8f0',
                            background: isSelected ? activeBg : '#ffffff',
                            boxShadow: isSelected ? `0 0 0 3px ${activeBorder}26, 0 4px 12px rgba(0,0,0,0.06)` : 'var(--shadow-xs)',
                            transform: isSelected ? 'scale(1.02)' : 'none',
                            transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                          onClick={() => setRating(r)}
                        >
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 18,
                            fontWeight: 900,
                            marginBottom: 6,
                            color: starColor
                          }}>
                            {r}★
                          </div>
                          <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>{ratingLabel}</strong>
                          <span style={{
                            display: 'inline-block',
                            marginTop: 5,
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: isSelected ? '#ffffff' : '#f1f5f9',
                            color: starColor
                          }}>
                            {badgeLabel}
                          </span>
                        </button>
                      );
                    })}

                    {/* 6th Option: Not Applicable (N/A) */}
                    <button
                      type="button"
                      className="card"
                      style={{
                        padding: '16px 12px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: 14,
                        border: rating === 'na' ? '2px solid #64748b' : '1.5px solid #e2e8f0',
                        background: rating === 'na' ? '#f1f5f9' : '#ffffff',
                        boxShadow: rating === 'na' ? '0 0 0 3px rgba(100, 116, 139, 0.2), 0 4px 12px rgba(0,0,0,0.06)' : 'var(--shadow-xs)',
                        transform: rating === 'na' ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onClick={() => setRating('na')}
                    >
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 17,
                        fontWeight: 900,
                        marginBottom: 6,
                        color: '#64748b'
                      }}>
                        ⊘ N/A
                      </div>
                      <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>
                        {lang === 'hi' ? 'लागू नहीं' : lang === 'mr' ? 'लागू नाही' : 'Not Applicable'}
                      </strong>
                      <span style={{
                        display: 'inline-block',
                        marginTop: 5,
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: rating === 'na' ? '#ffffff' : '#f1f5f9',
                        color: '#475569'
                      }}>
                        {lang === 'hi' ? 'छूट / N/A' : lang === 'mr' ? 'सूट / N/A' : 'Exempt / N/A'}
                      </span>
                    </button>
                  </div>

                  {rating !== null && rating !== 'na' && rating <= 3 && (
                    <div style={{ marginTop: 16 }}>
                      <label className="field">
                        <span>Supervisor observation note (reason for rating {rating}/5)</span>
                        <textarea
                          className="input textarea"
                          value={obsNote}
                          onChange={e => setObsNote(e.target.value)}
                          placeholder="Describe the condition observed (e.g. minor dust on corner floor, missing hand-soap bottle, drain slow)."
                        />
                      </label>
                    </div>
                  )}

                  {rating === 'na' && (
                    <div style={{ marginTop: 16 }}>
                      <label className="field">
                        <span>Operational reason for Not Applicable (optional note for manager)</span>
                        <textarea
                          className="input textarea"
                          value={obsNote}
                          onChange={e => setObsNote(e.target.value)}
                          placeholder="e.g. Equipment not present at this location, or bar area closed during morning prep."
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* 4. WHETHER IT IS ACCEPTABLE */}
              {currentEvaluation.hasInput && (
                <div
                  className={`notice ${currentEvaluation.isAcceptable ? 'good-notice' : 'attention-notice'}`}
                  style={{ marginTop: 18 }}
                >
                  {currentEvaluation.isAcceptable ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <div>
                    <strong>4. ACCEPTABILITY: {currentEvaluation.isAcceptable ? 'ACCEPTABLE (MEETS STANDARD)' : 'ATTENTION REQUIRED (BELOW STANDARD)'}</strong>
                    <p style={{ margin: '4px 0 0' }}>{currentEvaluation.message}</p>
                  </div>
                </div>
              )}

              {/* Service Partner Marketplace Link */}
              {(['FS28-08', 'FS28-09', 'FS28-26', 'FS28-27', 'FS28-19', 'FS28-20', 'FS28-01'].includes(selected.code) || (currentEvaluation.hasInput && !currentEvaluation.isAcceptable)) && (
                <div style={{
                  marginTop: 16,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      flexShrink: 0
                    }}>
                      {selected.code === 'FS28-08' ? '🎓' : selected.code === 'FS28-09' ? '🩺' : ['FS28-26', 'FS28-27'].includes(selected.code) ? '🪲' : ['FS28-19', 'FS28-20'].includes(selected.code) ? '❄️' : '✨'}
                    </div>
                    <div>
                      <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>
                        {selected.code === 'FS28-08'
                          ? 'Need FoSTaC Food Safety Supervisor & Staff Training?'
                          : selected.code === 'FS28-09'
                          ? 'Need 6-Monthly Staff Medical Checkups, Form 1A Certificates & Stool Tests?'
                          : ['FS28-26', 'FS28-27'].includes(selected.code)
                          ? 'Need Professional Pest Control Eradication or Trap Servicing?'
                          : ['FS28-19', 'FS28-20'].includes(selected.code)
                          ? 'Need Commercial Refrigerator / Chiller Breakdown Repair?'
                          : 'Need verified service provider support for this control?'}
                      </strong>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {selected.code === 'FS28-08'
                          ? 'Book accredited training partners for certified on-site or online FoSTaC courses.'
                          : selected.code === 'FS28-09'
                          ? 'Organize NABL-accredited diagnostic camp for food handler fitness, vaccinations, and stool pathogen testing.'
                          : 'Book FoodSafe verified partners for on-site calibration, pest treatments, or equipment repair.'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/providers?check=${selected.code}`}
                    target="_blank"
                    className="btn secondary"
                    style={{ fontSize: 12, padding: '7px 14px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Book Pro <ArrowRight size={13} />
                  </Link>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <button
                  className="btn primary full-choice"
                  disabled={!currentEvaluation.hasInput}
                  onClick={submit}
                >
                  {lang === 'hi'
                    ? 'प्रबंधक समीक्षा के लिए जमा करें'
                    : lang === 'mr'
                    ? 'व्यवस्थापक पुनरावलोकनासाठी सादर करा'
                    : 'Submit to manager for review'} <ArrowRight size={17} />
                </button>
              </div>
            </section>
          ) : (
            <section className={`result-banner ${rating === 'na' ? 'result-good' : result === 'good' ? 'result-good' : 'result-action'}`}>
              <div className="result-icon">{result === 'good' ? <CheckCircle2 /> : <AlertTriangle />}</div>
              <div>
                <p className="eyebrow">SUPERVISOR SUBMISSION</p>
                <h2>
                  {rating === 'na'
                    ? 'Marked as Not Applicable — awaiting manager review'
                    : result === 'good'
                    ? 'Observation recorded — awaiting manager review'
                    : 'Attention observation recorded — sent for manager review'}
                </h2>
                <p>
                  {rating === 'na'
                    ? 'The control is recorded as Not Applicable (N/A) for this shift/setup. Once approved by the manager, it satisfies today’s badge without penalty.'
                    : result === 'good'
                    ? 'The supervisor result is saved as "Pending Manager Review". Once approved by the manager, it satisfies today’s badge criteria.'
                    : 'The finding has been sent to the manager. The manager will review the record and confirm whether an alert and restaurant corrective action are required.'}
                </p>
              </div>
            </section>
          )}

          {result && (
            <div className="action-bar">
              <button
                className="btn secondary"
                onClick={() => {
                  setSelected(null);
                  history.replaceState(null, '', '/checks');
                }}
              >
                Back to today’s checks
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setSelected(null);
                  setResult(null);
                  setValue('');
                  setRating(null);
                  setObsNote('');
                  history.replaceState(null, '', '/checks');
                }}
              >
                Continue next check <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main>
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
          <LanguageSelector />
          <ThemeToggle />
          <Link href="/showcase" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Award size={14} /> {t('nav.showcase')}
          </Link>
          <Link href="/home" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 12px' }}>
            <Home size={14} /> {t('nav.home')}
          </Link>
          <div className="muted">Supervisor · Checks</div>
        </div>
      </div>
      <div className="container checks-shell">
        <Link href="/home" className="nav-link muted back-row">
          <ChevronLeft size={17} /> {t('nav.home')}
        </Link>

        <div className="manager-header">
          <div>
            <p className="eyebrow">{lang === 'hi' ? 'आज के नियंत्रण' : lang === 'mr' ? 'आजची नियंत्रणे' : 'TODAY’S CONTROLS'}</p>
            <h1>{lang === 'hi' ? 'दैनिक खाद्य सुरक्षा जांच' : lang === 'mr' ? 'दैनिक अन्न सुरक्षा तपासणी' : 'Food safety checks'}</h1>
            <p className="lead">
              {lang === 'hi'
                ? 'आज लागू होने वाले नियंत्रण पूरे करें। प्रत्येक परिणाम प्रबंधक समीक्षा के लिए जाता है।'
                : lang === 'mr'
                ? 'आज लागू असलेली नियंत्रणे पूर्ण करा. प्रत्येक निकाल व्यवस्थापक पुनरावलोकनासाठी जातो.'
                : 'Complete the controls that apply today. Every result goes to the manager for review.'}
            </p>
          </div>
          <div className="check-progress-box">
            <strong>{today.length - remaining}/{today.length}</strong>
            <span className="muted">{lang === 'hi' ? 'जमा' : lang === 'mr' ? 'सादर' : 'submitted'}</span>
          </div>
        </div>

        <div className="notice info">
          <Info size={18} />
          <span>
            <strong>{lang === 'hi' ? 'सुपरवाइजर भूमिका:' : lang === 'mr' ? 'सुपरवायझर भूमिका:' : 'Supervisor role:'}</strong> {lang === 'hi'
              ? 'निरीक्षण करें, रिकॉर्ड करें और रिपोर्ट करें। गुणात्मक जांच 1 से 5 के पैमाने (5 सर्वोत्तम) पर आंकी जाती हैं; तापमान जांच वास्तविक माप दर्ज करती हैं।'
              : lang === 'mr'
              ? 'निरीक्षण करा, नोंदवा आणि अहवाल द्या. गुणात्मक तपासण्या १ ते ५ च्या स्केलवर (५ सर्वोत्तम) रेट केल्या जातात; तापमान तपासण्या प्रत्यक्ष मोजमाप नोंदवतात.'
              : 'observe, record and report. Qualitative checks are rated on a 1 to 5 scale (5 being best); temperature checks record actual measurements against verified limits.'}
          </span>
        </div>

        <div className={`card daily-badge ${badge.tone === 'good' ? 'badge-good' : badge.tone === 'danger' ? 'badge-action' : 'badge-attention'}`}>
          <div className="badge-icon">
            {badge.tone === 'good' ? <CheckCircle2 /> : <ClipboardCheck />}
          </div>
          <div>
            <p className="eyebrow">{lang === 'hi' ? 'आज के बैज का पूर्वावलोकन' : lang === 'mr' ? 'आजच्या बॅजचे पूर्वावलोकन' : 'TODAY’S BADGE PREVIEW'}</p>
            <h2>{badge.status}</h2>
            <p className="muted">{badge.explanation}</p>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: 24, marginBottom: 12 }}>
          <div>
            <p className="eyebrow">{lang === 'hi' ? 'दैनिक परिचालन जांच' : lang === 'mr' ? 'दैनिक कार्य तपासण्या' : 'DAILY OPERATIONAL CHECKS'}</p>
            <h2 style={{ fontSize: 20 }}>{lang === 'hi' ? 'आज के लिए निर्धारित जांच' : lang === 'mr' ? 'आजसाठी नियोजित तपासण्या' : 'Scheduled checks for today'}</h2>
          </div>
        </div>

        {/* Format Selection Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4
        }}>
          {[
            { id: 'all', label: t('action.filterAll'), count: today.length },
            { id: 'kitchen', label: t('action.filterKitchen'), count: today.filter(x => !x.outletType || x.outletType === 'all').length },
            { id: 'bar_brewery', label: t('action.filterBar'), count: today.filter(x => x.outletType === 'bar_brewery').length },
            { id: 'cloud_kitchen', label: t('action.filterCloud'), count: today.filter(x => x.outletType === 'cloud_kitchen').length },
            { id: 'catering', label: t('action.filterCatering'), count: today.filter(x => x.outletType === 'catering').length },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFormat(f.id as any)}
              style={{
                border: selectedFormat === f.id ? '2px solid #059669' : '1px solid #cbd5e1',
                background: selectedFormat === f.id ? '#ecfdf5' : '#ffffff',
                color: selectedFormat === f.id ? '#065f46' : '#475569',
                fontWeight: selectedFormat === f.id ? 600 : 500,
                fontSize: 13,
                borderRadius: 20,
                padding: '6px 14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{f.label}</span>
              <span style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 10,
                background: selectedFormat === f.id ? '#059669' : '#e2e8f0',
                color: selectedFormat === f.id ? '#ffffff' : '#475569'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className="checklist-library" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredChecks.map(x => {
            const s = saved[x.code];
            const isApproved = s?.reviewStatus === 'approved';
            const isAlert = s?.reviewStatus === 'alerted';
            const isPending = s?.reviewStatus === 'pending_manager';
            const itemTr = getCheckText(x.code);
            const itemTitle = itemTr?.title || x.title;
            return (
              <button
                key={x.id}
                className="card daily-check-row interactive"
                onClick={() => openCheck(x)}
                style={{
                  border: isApproved
                    ? '1.5px solid #a7f3d0'
                    : isAlert
                    ? '1.5px solid #fecaca'
                    : isPending
                    ? (s?.status === 'na' ? '1.5px solid #cbd5e1' : '1.5px solid #fde68a')
                    : '1px solid #e2e8f0',
                  background: isApproved ? '#fbfdfc' : isAlert ? '#fffafa' : s?.status === 'na' ? '#f8fafc' : '#ffffff',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  className="library-number"
                  style={{
                    background: isApproved ? '#ecfdf5' : isAlert ? '#fef2f2' : s?.status === 'na' ? '#f1f5f9' : '#f1f5f9',
                    color: isApproved ? '#059669' : isAlert ? '#dc2626' : s?.status === 'na' ? '#64748b' : '#334155',
                    borderColor: isApproved ? '#a7f3d0' : isAlert ? '#fecaca' : s?.status === 'na' ? '#cbd5e1' : '#e2e8f0'
                  }}
                >
                  {x.id}
                </div>
                <div className="daily-check-main">
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 2 }}>
                    <span className="eyebrow" style={{ margin: 0, fontSize: 10.5 }}>{x.category}</span>
                    {x.outletType === 'bar_brewery' && (
                      <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '1px 7px', borderRadius: 6, fontWeight: 700 }}>
                        🍻 BAR / BREWERY
                      </span>
                    )}
                    {x.outletType === 'cloud_kitchen' && (
                      <span style={{ fontSize: 10, background: '#ede9fe', color: '#5b21b6', padding: '1px 7px', borderRadius: 6, fontWeight: 700 }}>
                        🛵 CLOUD KITCHEN
                      </span>
                    )}
                    {x.outletType === 'catering' && (
                      <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0369a1', padding: '1px 7px', borderRadius: 6, fontWeight: 700 }}>
                        🍱 CATERING &amp; EVENTS
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text, #0f172a)', margin: '2px 0 4px' }}>{itemTitle}</h3>
                  {lang !== 'en' && itemTitle !== x.title && (
                    <p style={{ fontSize: 12, color: 'var(--muted, #64748b)', margin: '0 0 4px', fontStyle: 'italic' }}>
                      {x.title}
                    </p>
                  )}
                  <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
                    Daily · {x.input === 'temperature' ? (lang === 'hi' ? 'तापमान माप' : lang === 'mr' ? 'तापमान मोजमाप' : 'Temperature measurement') : (lang === 'hi' ? '1–5 गुणात्मक रेटिंग' : lang === 'mr' ? '१–५ गुणात्मक रेटिंग' : '1–5 Qualitative Rating')}
                    {s?.value && <> · <strong style={{ color: '#0f172a' }}>{s.value}</strong></>}
                  </p>
                </div>
                <div className="daily-status" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {!s ? (
                    <span className="pill neutral" style={{ fontSize: 10.5 }}>TO DO</span>
                  ) : isPending ? (
                    <span className={`pill ${s.status === 'na' ? 'neutral' : 'attention'}`} style={{ fontSize: 10.5 }}>
                      {s.status === 'na' ? 'N/A · PENDING' : 'PENDING REVIEW'}
                    </span>
                  ) : isApproved ? (
                    <span className="pill good" style={{ fontSize: 10.5 }}>
                      {s.status === 'na' ? 'N/A · APPROVED' : 'APPROVED'}
                    </span>
                  ) : (
                    <span className="pill danger" style={{ fontSize: 10.5 }}>ALERT CONFIRMED</span>
                  )}
                  <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                </div>
              </button>
            );
          })}
        </div>

        <section className="section-block">
          <div className="section-title">
            <div>
              <h2>Supervisor alerts & findings</h2>
              <p className="muted">Failed controls become restaurant alerts once confirmed by the manager.</p>
            </div>
            <Link href="/manager" className="nav-link">
              Manager review ({pending} pending) <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid2">
            <div className="card">
              <p className="eyebrow">MANAGER-CONFIRMED ALERTS</p>
              <h3>{issues.filter(i => i.status !== 'closed').length} active alerts</h3>
              <p className="muted">Alerts confirmed by the manager requiring corrective action.</p>
              {issues.filter(i => i.status !== 'closed').length > 0 && (
                <Link href="/actions" className="btn secondary" style={{ marginTop: 12 }}>
                  View Action Centre <ArrowRight size={15} />
                </Link>
              )}
            </div>
            <div className="card">
              <p className="eyebrow">ATTENTION FINDINGS AWAITING REVIEW</p>
              <h3>{pendingAttentionCount} pending review</h3>
              <p className="muted">Observations flagged with attention awaiting manager decision.</p>
              <Link href="/manager" className="btn secondary" style={{ marginTop: 12 }}>
                Open Manager Review <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <Link href="/checklist" className="btn secondary">
            View all {FOODSAFE28.length} controls <ArrowRight size={17} />
          </Link>
          <Link href="/records" className="btn secondary">
            View check records & history <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}
