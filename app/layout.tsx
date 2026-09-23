import './globals.css';
import type { Metadata, Viewport } from 'next';
import FoodSafetyChatbot from '@/components/FoodSafetyChatbot';

export const metadata: Metadata = {
  title: 'FoodSafe365 — Clean Kitchens Don’t Get Shut Down',
  description: 'Digital food-safety intelligence and operational compliance platform for restaurants, bars, cloud kitchens, and hospitality.',
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FoodSafe365'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var t = localStorage.getItem('foodsafe365_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch(e) {}
            })();`
          }}
        />
      </head>
      <body>
        {children}
        <FoodSafetyChatbot />
      </body>
    </html>
  );
}
