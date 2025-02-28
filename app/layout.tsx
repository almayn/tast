// app/layout.tsx
import './globals.css'; // استيراد ملف الأنماط العام

export const metadata = {
  title: 'مسابقة الماس الرمضانية', // الاسم الذي سيظهر في المتصفح
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
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body>{children}</body>
    </html>
  );
}
