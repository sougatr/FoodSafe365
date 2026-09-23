'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  ArrowRight,
  Minimize2,
  Maximize2,
  ExternalLink,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import {
  PersonaRole,
  ChatMessage,
  queryFoodSafetyAI
} from '@/lib/ai-food-safety-knowledge';
import { useLanguage } from '@/lib/vernacular';

export default function FoodSafetyChatbot() {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<PersonaRole>('supervisor');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting based on role and language
    let greetingText = '';
    if (lang === 'hi') {
      greetingText = `### 👋 नमस्ते! मैं आपका FoodSafe365 AI खाद्य सुरक्षा सहायक हूँ।\n\n` +
        `मुझसे **FSSAI नियमों**, **तापमान सीमा (<5°C / ≥75°C)**, **पेस्ट नियंत्रण**, **स्टाफ मेडिकल/फॉर्म 1A**, या **दैनिक जांच** के बारे में कुछ भी पूछें।\n\n` +
        `वर्तमान भूमिका: **${persona === 'supervisor' ? 'किचन सुपरवाइजर (तत्काल एक्शन)' : 'रेस्तरां प्रबंधक (ऑडिट एवं अनुपालन)'}**।`;
    } else if (lang === 'mr') {
      greetingText = `### 👋 नमस्कार! मी आपला FoodSafe365 AI अन्न सुरक्षा सहाय्यक आहे.\n\n` +
        `मला **FSSAI नियम**, **तापमान मर्यादा (<५°C / ≥७५°C)**, **कीटक नियंत्रण**, **कर्मचारी वैद्यकीय/फॉर्म 1A**, किंवा **दैनिक तपासणी** बद्दल काहीही विचारा.\n\n` +
        `सध्याची भूमिका: **${persona === 'supervisor' ? 'किचन सुपरवायझर (त्वरित कृती)' : 'रेस्टॉरंट व्यवस्थापक (ऑडिट व अनुपालन)'}**।`;
    } else {
      greetingText = `### 👋 Hello! I am your FoodSafe365 AI Assistant.\n\n` +
        `Ask me anything about **FSSAI regulations**, **temperature limits**, **pest emergencies**, **staff medicals**, or **HACCP critical limits**.\n\n` +
        `Currently answering as: **${persona === 'supervisor' ? 'Kitchen Supervisor (Immediate Floor Action)' : 'Restaurant Manager (Audit & Compliance)'}**.`;
    }

    setMessages([
      {
        id: 'initial-1',
        sender: 'ai',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleContext: persona
      }
    ]);
  }, [persona, lang]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  function handleSend(textToSend?: string) {
    const q = (textToSend || input).trim();
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

  const QUICK_PROMPTS = lang === 'hi'
    ? [
        '🌡️ फ्रिज 8°C पर है — क्या करें?',
        '🍗 कुकिंग और रीहीटिंग सुरक्षित तापमान',
        '🩺 अनिवार्य फॉर्म 1A और स्टूल टेस्ट नियम',
        '🪲 किचन में जिंदा कीट/तिलचट्टा दिखा',
        '🚨 टेबल डाइनर शिकायत प्रोटोकॉल',
        '🧪 कुकिंग ऑयल TPC लिमिट'
      ]
    : lang === 'mr'
    ? [
        '🌡️ फ्रीज ८°C वर आहे — काय करावे?',
        '🍗 स्वयंपाक आणि गरम करण्याचे सुरक्षित तापमान',
        '🩺 फॉर्म 1A आणि स्टूल टेस्टचे नियम',
        '🪲 स्वयंपाकघरात झुरळ किंवा कीटक दिसले',
        '🚨 टेबल ग्राहक तक्रार प्रोटोकॉल',
        '🧪 खाद्यतेल TPC मर्यादा'
      ]
    : [
        '🌡️ Refrigerator at 8°C — What to do?',
        '🍗 Core cooking & reheating temps',
        '🩺 Mandatory Form 1A & stool test rules',
        '🪲 Live pest spotted in kitchen',
        '🚨 Table diner grievance protocol',
        '🧪 Cooking oil TPC limits'
      ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="foodsafe-chatbot-btn"
          aria-label="Open FoodSafe AI Assistant"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 999,
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: 14,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center'
          }}>
            <Sparkles size={16} />
          </div>
          <span>FoodSafe AI</span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#6ee7b7',
            display: 'inline-block'
          }} />
        </button>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div
          className="foodsafe-chatbot-window card"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 'min(440px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 48px))',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border)'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.18)',
                display: 'grid',
                placeItems: 'center'
              }}>
                <Bot size={20} />
              </div>
              <div>
                <strong style={{ fontSize: 15, display: 'block' }}>FoodSafe AI Copilot</strong>
                <span style={{ fontSize: 11, opacity: 0.85 }}>FSSAI Regulatory &amp; Kitchen Guard</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link
                href="/ai-copilot"
                title="Open Fullscreen Copilot"
                style={{
                  color: '#fff',
                  padding: 6,
                  borderRadius: 6,
                  display: 'grid',
                  placeItems: 'center',
                  textDecoration: 'none',
                  opacity: 0.85
                }}
              >
                <Maximize2 size={16} />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chatbot"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: 6,
                  display: 'grid',
                  placeItems: 'center',
                  opacity: 0.85
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Persona Switcher Banner */}
          <div style={{
            background: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>Persona Mode:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPersona('supervisor')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  border: persona === 'supervisor' ? '1px solid var(--green)' : '1px solid var(--border)',
                  background: persona === 'supervisor' ? 'var(--green-surface)' : 'var(--card-bg)',
                  color: persona === 'supervisor' ? 'var(--green)' : 'var(--muted)',
                  cursor: 'pointer'
                }}
              >
                👨‍🍳 Supervisor
              </button>
              <button
                onClick={() => setPersona('manager')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  border: persona === 'manager' ? '1px solid var(--green)' : '1px solid var(--border)',
                  background: persona === 'manager' ? 'var(--green-surface)' : 'var(--card-bg)',
                  color: persona === 'manager' ? 'var(--green)' : 'var(--muted)',
                  cursor: 'pointer'
                }}
              >
                👔 Manager
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            padding: '10px 14px',
            background: 'var(--card-bg)',
            borderBottom: '1px solid var(--border)',
            scrollbarWidth: 'none'
          }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 11.5,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'var(--bg)'
          }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: 4
                }}
              >
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '12px 16px',
                    borderRadius: 14,
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'var(--card-bg)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-xs)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.text}

                  {msg.actionLinks && msg.actionLinks.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.actionLinks.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="btn primary"
                          style={{
                            fontSize: 12,
                            padding: '6px 12px',
                            minHeight: 32,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          {link.label} <ExternalLink size={12} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--muted)', padding: '0 4px' }}>
                  {msg.sender === 'user' ? 'You' : 'FoodSafe AI'} · {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border)',
              background: 'var(--card-bg)',
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask as ${persona === 'supervisor' ? 'Supervisor' : 'Manager'}...`}
              style={{
                flex: 1,
                padding: '10px 14px',
                fontSize: 13.5,
                borderRadius: 10
              }}
            />
            <button
              type="submit"
              className="btn primary"
              style={{
                width: 40,
                height: 40,
                padding: 0,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

