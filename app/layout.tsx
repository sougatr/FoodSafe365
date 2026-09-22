import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FoodSafe365 — Safer food. Every day.',
  description: 'Digital food-safety management for restaurants.'
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
