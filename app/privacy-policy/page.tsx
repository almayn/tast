// app/privacy-policy.tsx
export default function PrivacyPolicy() {
    return (
      <div dir="rtl" className="container mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-3xl font-bold mb-6">سياسة الخصوصية</h1>
        <p className="mb-4">مرحبًا بك في مسابقة الماس الرمضانية! نحن نقدر خصوصيتك وأمان بياناتك. هذه السياسة توضح كيفية جمعنا واستخدامنا وحماية بياناتك الشخصية.</p>
  
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. المعلومات التي نجمعها</h2>
        <ul className="list-disc list-inside mb-4">
          <li><strong>الاسم الكامل:</strong> لتحديد هويتك كمشارك في المسابقة.</li>
          <li><strong>المدينة:</strong> لمعرفة موقعك الجغرافي.</li>
          <li><strong>إجابات الأسئلة:</strong> لتسجيل إجاباتك على أسئلة المسابقة.</li>
          <li><strong>بيانات تسجيل الدخول عبر Snapchat:</strong> إذا قمت بتسجيل الدخول باستخدام حساب Snapchat الخاص بك.</li>
        </ul>
  
        {/* أضف باقي الأقسام هنا... */}
  
        <p className="mt-6">إذا كانت لديك أي استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:</p>
        <ul className="list-disc list-inside">
          <li>البريد الإلكتروني: <a href="mailto:snabalmas@gmail.com" className="text-blue-500">snabalmas@gmail.com</a></li>
          <li>الموقع الإلكتروني: <a href="https://almayn.netlify.app/" className="text-blue-500">www.almayn.netlify.app</a></li>
        </ul>
      </div>
    );
  }