// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white shadow-2xl rounded-xl p-8 text-center max-w-xs w-full border-4 border-blue-200">
        {/* شعار الماس */}
        <Image
          src="/almas.png"
          alt="شعار الماس"
          width={120}
          height={120}
          className="mx-auto mb-4 drop-shadow-xl"
        />

        {/* عنوان المسابقة */}
        <h1 className="text-4xl font-extrabold text-blue-800 mb-2 drop-shadow-lg">
          مسابقة الماس
        </h1>

        {/* اسم الراعي */}
        <p className="text-md text-gray-700 font-semibold mb-6">
          برعاية الشيخ طلال عواده الحبيشي
        </p>

        {/* الأزرار */}
        <div className="space-y-6">
          <Link href="/quiz">
            <button className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300">
              صفحة المسابقة
            </button>
          </Link>
          <Link href="/draw">
            <button className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300">
              صفحة السحب
            </button>
          </Link>
          <Link href="/add-question">
            <button className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition transform duration-300">
              إدراج سؤال
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
