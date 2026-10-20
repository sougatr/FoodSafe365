'use client';

import React from 'react';
import { getWhatsAppChatUrl } from '@/lib/whatsapp-config';

export default function WhatsAppFloatingButton() {
  const whatsappUrl = getWhatsAppChatUrl(
    undefined,
    'Hello FoodSafe365 Team! I would like to inquire about food safety ratings, restaurant checklists, or service provider partnerships.'
  );

  return (
    <aside aria-label="WhatsApp Support">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat with FoodSafe365 on WhatsApp"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          left: 'max(env(safe-area-inset-left, 0px), 18px)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#25D366',
          color: '#ffffff',
          borderRadius: 999,
          padding: '12px 18px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4), 0 2px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 14,
          textDecoration: 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.0)')}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>💬</span>
        <span>WhatsApp</span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ffffff',
            display: 'inline-block'
          }}
        />
      </a>
    </aside>
  );
}
