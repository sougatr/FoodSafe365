'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  Home,
  ShieldCheck,
  User,
  ChevronLeft,
  ExternalLink,
  BookOpen,
  Thermometer,
  Stethoscope,
  Bug,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import {
  PersonaRole,
  ChatMessage,
  queryFoodSafetyAI,
  KNOWLEDGE_TOPICS
} from '@/lib/ai-food-safety-knowledge';

export default function AiCopilotPage() {
  const [persona, setPersona] = useState<PersonaRole>('manager');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'init-copilot',
        sender: 'ai',
        text: `### 🛡️ Welcome to the FoodSafe365 AI Regulatory & Operations Copilot\n\n` +
          `I am tuned with the latest **FSSAI Schedule 4 regulations**, **HACCP protocols**, **cold-chain standards**, and **audit checklists**.\n\n` +
          `You are currently interacting in **${persona === 'manager' ? 'Restaurant Manager Mode (Compliance, Audit & Vendor Governance)' : 'Kitchen Supervisor Mode (Line Execution & Immediate Floor Containment)'}**.\n\n` +
          `Select a topic from the left or ask any question below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleContext: persona
      }
    ]);
  }, [persona]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(queryText?: string) {
    const q = (queryText || input).trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleContext: persona
    };

    const aiMsg = queryFoodSafetyAI(q, persona);
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          <span>FoodSafe AI Copilot</span>
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ThemeToggle />
          <Link
            href="/home"
            className="btn secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '7px 14px' }}
          >
            <Home size={15} /> Home
          </Link>
          <Link href="/manager" className="btn secondary" style={{ fontSize: 13, padding: '7px 14px' }}>
            Manager Review
          </Link>
        </div>
      </div>

      <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 16px', maxWidth: 1180 }}>
        {/* Breadcrumb & Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Link href="/home" className="muted nav-link" style={{ padding: '2px 6px', fontSize: 13 }}>
                <ChevronLeft size={16} /> Home
              </Link>
              <span className="muted">/</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>AI Food Safety Advisory</span>
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: 0, letterSpacing: '-0.02em' }}>
              Interactive Food Safety Intelligence
            </h1>
          </div>

          {/* Persona Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-subtle)',
            padding: 4,
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setPersona('supervisor')}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                background: persona === 'supervisor' ? 'var(--card-bg)' : 'transparent',
                color: persona === 'supervisor' ? 'var(--green)' : 'var(--muted)',
                boxShadow: persona === 'supervisor' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              👨‍🍳 Supervisor (Kitchen Floor)
            </button>
            <button
              onClick={() => setPersona('manager')}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                background: persona === 'manager' ? 'var(--card-bg)' : 'transparent',
                color: persona === 'manager' ? 'var(--green)' : 'var(--muted)',
                boxShadow: persona === 'manager' ? 'var(--shadow-xs)' : 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              👔 Manager (Audit &amp; Oversight)
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: 20, flex: 1, alignItems: 'stretch' }}>
          {/* Left Column: Quick Regulatory Topics */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 'fit-content' }}>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} /> KNOWLEDGE PLAYBOOKS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {KNOWLEDGE_TOPICS.map(topic => (
                <button
                  key={topic.title}
                  onClick={() => handleSend(topic.keywords[0])}
                  className="interactive"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    textAlign: 'left',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <strong style={{ fontSize: 13, color: 'var(--text)' }}>{topic.title}</strong>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{topic.fssaiRef}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <span className="eyebrow" style={{ fontSize: 10 }}>QUICK SHORTCUTS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <Link href="/checks" className="nav-link" style={{ fontSize: 12.5, padding: '4px 8px' }}>
                  → Daily 29 Safeguards Checklist
                </Link>
                <Link href="/manager/trends" className="nav-link" style={{ fontSize: 12.5, padding: '4px 8px' }}>
                  → AI Trend Analysis &amp; Predictions
                </Link>
                <Link href="/providers" className="nav-link" style={{ fontSize: 12.5, padding: '4px 8px' }}>
                  → Book Verified Service Providers
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Chat Interface */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', minHeight: 560 }}>
            {/* Thread Scroll */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              background: 'var(--bg)'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: 6
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '16px 20px',
                      borderRadius: 16,
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'var(--card-bg)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                      boxShadow: 'var(--shadow-xs)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.text}

                    {msg.actionLinks && msg.actionLinks.length > 0 && (
                      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {msg.actionLinks.map(link => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="btn primary"
                            style={{
                              fontSize: 13,
                              padding: '8px 16px',
                              minHeight: 36,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            {link.label} <ExternalLink size={14} />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 6px' }}>
                    {msg.sender === 'user' ? 'You' : 'FoodSafe AI'} · {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                background: 'var(--card-bg)',
                display: 'flex',
                gap: 12,
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                className="input"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={`Ask any food safety question in ${persona === 'supervisor' ? 'Supervisor' : 'Manager'} mode...`}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  fontSize: 14.5,
                  borderRadius: 12
                }}
              />
              <button
                type="submit"
                className="btn primary"
                style={{
                  padding: '12px 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0
                }}
              >
                <span>Ask AI</span> <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

