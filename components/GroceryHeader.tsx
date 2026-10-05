'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Home,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  ChevronDown,
  Truck,
  Thermometer,
  Layers,
  RotateCw,
  CheckCircle2,
  Store
} from 'lucide-react';

interface GroceryHeaderProps {
  outletName?: string;
  branchName?: string;
}

export default function GroceryHeader({
  outletName = 'Nature Fresh Market',
  branchName = 'Bandra West'
}: GroceryHeaderProps) {
  const pathname = usePathname();
  const [showOpsMenu, setShowOpsMenu] = useState(false);

  const PRIMARY_NAV = [
    { href: '/grocery', label: 'HOME', icon: Home, exact: true },
    { href: '/grocery/learn', label: 'LEARN', icon: BookOpen, startsWith: true },
    { href: '/grocery/daily-check', label: 'DAILY CHECK', icon: ClipboardCheck },
    { href: '/grocery/actions', label: 'ACTIONS', icon: AlertTriangle }
  ];

  const SECONDARY_OPS = [
    { href: '/grocery/receiving', label: 'Dockside Receiving', desc: 'Inspect incoming food deliveries', icon: Truck },
    { href: '/grocery/temperature', label: 'Temperature Monitoring', desc: 'Log chiller & freezer probes', icon: Thermometer },
    { href: '/grocery/storage', label: 'Storage & Zones', desc: 'Manage zones & cross-contamination rules', icon: Layers },
    { href: '/grocery/stock', label: 'FIFO / FEFO Stock', desc: 'Batch expiry tracking & safety quarantine', icon: RotateCw },
    { href: '/actions?status=awaiting_verification', label: 'Verification Register', desc: 'Supervisor & manager sign-offs', icon: CheckCircle2 }
  ];

  return (
    <div style={{ background: '#0F172A', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
      {/* Top Banner with Store identity & Frontline Quick Action */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, color: '#ffffff' }}>{outletName}</strong>
              <span style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                padding: '2px 8px',
                borderRadius: 999,
                letterSpacing: '0.04em'
              }}>
                GROCERY STORE
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              Branch: {branchName} · Safer food. Every day.
            </div>
          </div>
        </div>

        {/* Secondary Manager / Operations Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowOpsMenu(!showOpsMenu)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 8,
              background: showOpsMenu ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Manager &amp; Tools</span>
            <ChevronDown size={14} style={{ transform: showOpsMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {showOpsMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 280,
                background: '#1E293B',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.35)',
                zIndex: 100,
                overflow: 'hidden',
                padding: '6px'
              }}
            >
              <div style={{ padding: '8px 12px 4px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Advanced Operations
              </div>
              {SECONDARY_OPS.map(op => {
                const Icon = op.icon;
                return (
                  <Link
                    key={op.href}
                    href={op.href}
                    onClick={() => setShowOpsMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      textDecoration: 'none',
                      color: '#ffffff',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ padding: 4, borderRadius: 6, background: 'rgba(5, 150, 105, 0.2)', color: '#34d399', marginTop: 1 }}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{op.label}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{op.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Simplified Primary Navigation: HOME | LEARN | DAILY CHECK | ACTIONS */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {PRIMARY_NAV.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : item.startsWith
            ? pathname.startsWith(item.href)
            : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 18px',
                fontSize: 13.5,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#34d399' : '#94A3B8',
                borderBottom: isActive ? '3px solid #10b981' : '3px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                letterSpacing: '0.03em',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} color={isActive ? '#34d399' : '#94A3B8'} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
