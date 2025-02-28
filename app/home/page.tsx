export default function HomePage() {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-8">مسابقة الماس الرمضانية</h1>
        
        <div className="space-y-4">
          <a href="/draw" className="block bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 transition">
            صفحة السحب
          </a>
          <a href="/add-question" className="block bg-green-500 text-white py-3 px-6 rounded hover:bg-green-600 transition">
            إضافة الأسئلة
          </a>
          <a href="/" className="block bg-gray-500 text-white py-3 px-6 rounded hover:bg-gray-600 transition">
            العودة للصفحة الرئيسية
          </a>
        </div>
      </main>
    );
  }
  