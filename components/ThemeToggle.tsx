'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('foodsafe365_theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('foodsafe365_theme', next);
  }

  if (!mounted) {
    return (
      <button
        className="btn secondary"
        style={{
          width: 38,
          height: 38,
          padding: 0,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          opacity: 0.7
        }}
        aria-label="Toggle theme"
      >
        <Sun size={17} />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn secondary"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label="Toggle Theme"
      style={{
        width: 38,
        height: 38,
        padding: 0,
        borderRadius: 10,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {theme === 'dark' ? (
        <Sun size={17} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.5))' }} />
      ) : (
        <Moon size={17} color="#475569" />
      )}
    </button>
  );
}

