'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  Layers,
  Thermometer,
  RotateCw,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Home,
  Store
} from 'lucide-react';

interface GroceryHeaderProps {
  outletName?: string;
  branchName?: string;
}

export default function GroceryHeader({ outletName = 'Nature Fresh Market', branchName = 'Bandra West' }: GroceryHeaderProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/grocery', label: 'Overview', icon: Store },
    { href: '/grocery/receiving', label: 'Receiving', icon: Truck },
    { href: '/grocery/storage', label: 'Storage & Zones', icon: Layers },
    { href: '/grocery/temperature', label: 'Temperature', icon: Thermometer },
    { href: '/grocery/stock', label: 'FIFO / FEFO Stock', icon: RotateCw },
    { href: '/grocery/daily-check', label: 'Daily Checks (22)', icon: ClipboardCheck }
  ];

  return (
    <div style={{ background: '#0F172A', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
      {/* Sub-bar with Store identity & Quick Actions */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, color: '#ffffff' }}>{outletName}</strong>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '2px 8px',
                borderRadius: 999
              }}>
                GROCERY STORE
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              Branch: {branchName} · FSSAI Retail Operational Module
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/actions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              textDecoration: 'none'
            }}
          >
            <AlertTriangle size={14} /> Corrective Actions
          </Link>
          <Link
            href="/actions?status=awaiting_verification"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textDecoration: 'none'
            }}
          >
            <CheckCircle2 size={14} /> Verifications
          </Link>
          <Link
            href="/home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              textDecoration: 'none'
            }}
          >
            <Home size={14} /> Home
          </Link>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: isActive ? 800 : 500,
                color: isActive ? '#34d399' : '#94A3B8',
                borderBottom: isActive ? '3px solid #10b981' : '3px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
