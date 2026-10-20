'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Maximize2,
  ExternalLink,
  RotateCcw
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
  const [hasAgreed, setHasAgreed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('foodsafe_chat_agreed') === 'true') {
        setHasAgreed(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    function handleOpenEvent() {
      setIsOpen(true);
    }
    window.addEventListener('open-foodsafe-chatbot', handleOpenEvent);
    return () => window.removeEventListener('open-foodsafe-chatbot', handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, hasAgreed]);

  const welcomeGreeting1 = lang === 'hi'
    ? '👋 नमस्ते! FoodSafe365 में आपका स्वागत है।'
    : lang === 'mr'
    ? '👋 नमस्कार! FoodSafe365 मध्ये आपले स्वागत आहे.'
    : '👋 Hi there! Welcome to FoodSafe365.';

  const welcomeGreeting2 = lang === 'hi'
    ? 'आज आप क्या जानना चाहते हैं?'
    : lang === 'mr'
    ? 'आज आपल्याला काय जाणून घ्यायचे आहे?'
    : 'What brings you here today?';

  const QUICK_OPTIONS = [
    {
      id: 'rules',
      label: lang === 'hi' ? 'खाद्य सुरक्षा नियम देखें' : lang === 'mr' ? 'अन्न सुरक्षा नियम पहा' : 'Explore safety rules',
      prompt: 'What are the core FSSAI food safety rules, cold-chain temperature limits, and cooking standards?'
    },
    {
      id: 'demo',
      label: lang === 'hi' ? 'रेस्तरां ऑनबोर्डिंग / डेमो' : lang === 'mr' ? 'रेस्टॉरंट ऑनबोर्डिंग / डेमो' : 'Book a demo / Restaurant',
      prompt: 'I operate a food business. How does FoodSafe365 help with daily kitchen checks, FSSAI compliance, and digital logs?'
    },
    {
      id: 'whatsapp',
      label: lang === 'hi' ? 'व्हाट्सएप पर बात करें' : lang === 'mr' ? 'व्हॉट्सॲपवर बोला' : 'Talk on WhatsApp',
      prompt: 'How do I connect with FoodSafe365 on WhatsApp for instant support?'
    },
    {
      id: 'support',
      label: lang === 'hi' ? 'डाइनर / स्वच्छता जांच' : lang === 'mr' ? 'ग्राहक / स्वच्छता तपासणी' : 'Support / Diner checks',
      prompt: 'How can diners verify restaurant hygiene logs, rate food safety, and protect their gut health?'
    }
  ];

  function handleSend(textToSend?: string) {
    const q = (textToSend || input).trim();
    if (!q) return;

    if (!hasAgreed) {
      setHasAgreed(true);
      try { localStorage.setItem('foodsafe_chat_agreed', 'true'); } catch {}
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiMsg = queryFoodSafetyAI(q, 'supervisor');

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  }

  function handleAgree() {
    setHasAgreed(true);
    try { localStorage.setItem('foodsafe_chat_agreed', 'true'); } catch {}
  }

  function handleReset() {
    setMessages([]);
    setInput('');
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        id="foodsafe-chatbot-trigger"
        onClick={() => setIsOpen(true)}
        className="foodsafe-chatbot-btn"
        aria-label="Ask Me (FoodSafe AI Assistant)"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: 'max(env(safe-area-inset-right, 0px), 16px)',
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
          <Bot size={17} />
        </div>
        <span className="chatbot-floating-text">FoodSafe Help</span>
        <span
          className="chatbot-floating-dot"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#6ee7b7',
            display: 'inline-block'
          }}
        />
      </button>

      {/* Chat Window Drawer / Modal styled like Clinevo Help */}
      {isOpen && (
        <div
          className="foodsafe-chatbot-window card"
          style={{
            position: 'fixed',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
            right: 'max(env(safe-area-inset-right, 0px), 16px)',
            width: 'min(410px, calc(100vw - 32px))',
            height: 'min(640px, calc(100vh - 72px))',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            borderRadius: 18,
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--border)',
            background: 'var(--card-bg)'
          }}
        >
          {/* Header matching Clinevo Help: Gradient + Circular Avatar + Green Online Dot */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 40, height: 40 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#047857',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
                }}>
                  <Bot size={22} />
                </div>
                {/* Active Green Online Dot */}
                <span style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 4px rgba(34, 197, 94, 0.6)'
                }} />
              </div>
              <div>
                <strong style={{ fontSize: 17, display: 'block', letterSpacing: '-0.01em', fontWeight: 800 }}>
                  FoodSafe Help
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  title="Reset Conversation"
                  aria-label="Reset Conversation"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: 6,
                    borderRadius: 6,
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    opacity: 0.85
                  }}
                >
                  <RotateCcw size={16} />
                </button>
              )}
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
                <Maximize2 size={17} />
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
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages & Options Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg)'
          }}>
            {/* Initial Welcome Section (Clinevo Style) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--green-surface)',
                color: 'var(--green)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: 2
              }}>
                <Bot size={18} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '88%' }}>
                {/* Bubble 1 */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                  background: 'var(--surface-subtle)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  {welcomeGreeting1}
                </div>

                {/* Bubble 2 */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                  background: 'var(--surface-subtle)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-xs)',
                  width: 'fit-content'
                }}>
                  {welcomeGreeting2}
                </div>

                {/* Quick Options Pills (Clinevo Style) */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 4
                }}>
                  {QUICK_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => handleSend(opt.prompt)}
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '9px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-xs)',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--green)';
                        e.currentTarget.style.color = 'var(--green)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text)';
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Messages */}
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
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  maxWidth: '92%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  {msg.sender === 'ai' && (
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'var(--green-surface)',
                      color: 'var(--green)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}>
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    style={{
                      padding: '13px 16px',
                      borderRadius: 14,
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'var(--surface-subtle)',
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
                </div>

                <span style={{ fontSize: 10, color: 'var(--muted)', padding: '0 8px' }}>
                  {msg.sender === 'user' ? 'You' : 'FoodSafe AI'} · {msg.timestamp}
                </span>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Area: Consent Banner (Clinevo style) OR Input Form */}
          {!hasAgreed ? (
            <div style={{
              padding: '18px 20px',
              background: 'var(--surface-subtle)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 12,
                lineHeight: 1.55,
                color: 'var(--text-body)',
                margin: 0
              }}>
                {lang === 'hi' ? (
                  <>
                    यह चैट सेवा आपसे बातचीत करने और चैट इतिहास बनाए रखने के लिए कुकीज़ का उपयोग करती है। हमारी सेवा खाद्य सुरक्षा नियमों और FSSAI मानकों के अनुपालन में सहायता करती है (देखें <Link href="/privacy" style={{ color: 'var(--green)', textDecoration: 'underline' }}>गोपनीयता नीति</Link>).
                  </>
                ) : lang === 'mr' ? (
                  <>
                    ही चॅट सेवा आपल्याशी संवाद साधण्यासाठी आणि इतिहास राखण्यासाठी कुकीज वापरते. आमची सेवा अन्न सुरक्षा आणि FSSAI मानकांनुसार मार्गदर्शन करते (पहा <Link href="/privacy" style={{ color: 'var(--green)', textDecoration: 'underline' }}>गोपनीयता धोरण</Link>).
                  </>
                ) : (
                  <>
                    This chat service uses a cookie to interact with you and maintain your chat history. Our service provider will monitor and record this chat for quality assurance (see their <Link href="/privacy" style={{ color: 'var(--green)', textDecoration: 'underline' }}>Privacy Policy</Link>).
                  </>
                )}
              </p>
              <button
                onClick={handleAgree}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 36px',
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {lang === 'hi' ? 'सहमति दें' : lang === 'mr' ? 'सहमत आहे' : 'I agree'}
              </button>
            </div>
          ) : (
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
                placeholder={lang === 'hi' ? 'AI खाद्य सुरक्षा सहायक से कुछ भी पूछें...' : lang === 'mr' ? 'AI अन्न सुरक्षा सहाय्यकाला काहीही विचारा...' : 'Ask FoodSafe AI Assistant anything about food safety...'}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: 13.5,
                  borderRadius: 10
                }}
                autoFocus
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
          )}
        </div>
      )}
    </>
  );
}
