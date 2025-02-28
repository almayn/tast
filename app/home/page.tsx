// app/home/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
      {/* العنوان الرئيسي */}
      <h1 className="text-4xl font-bold text-blue-800 mb-8">مسابقة الماس الرمضانية</h1>

      {/* الروابط */}
      <div className="space-y-4">
        {/* رابط للصفحة "السحب" */}
        <Link
          href="/draw"
          className="block bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 transition"
        >
          صفحة السحب
        </Link>

        {/* رابط لصفحة "إضافة الأسئلة" */}
        <Link
          href="/add-question"
          className="block bg-green-500 text-white py-3 px-6 rounded hover:bg-green-600 transition"
        >
          إضافة الأسئلة
        </Link>

        {/* رابط للصفحة الرئيسية */}
        <Link
          href="/"
          className="block bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 transition"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}