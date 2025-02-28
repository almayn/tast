// app/layout.tsx
import './globals.css'; // استيراد ملف الأنماط العام

export const metadata = {
  title: 'مسابقة الماس الرمضانية',
  description: 'شارك في مسابقة رمضان اليومية واربح جوائز قيمة!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
