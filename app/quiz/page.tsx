// app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';
import { FaSnapchat, FaShareAlt } from 'react-icons/fa';
import PrizesModal from '.././components/PrizesModal';
import Link from 'next/link';






export default function QuizPage() {
    interface Question {
    id: number; // إضافة حقل id لتحديد رقم السؤال
    question: string;
    option1: string;
    option2: string;
    correct_option: string;
  }
  const [showPrizes, setShowPrizes] = useState(false);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [subscriptionNumber, setSubscriptionNumber] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

 
  
  // جلب السؤال عند تحميل الصفحة
 // جلب السؤال عند تحميل الصفحة
 useEffect(() => {
  const fetchQuestion = async () => {
    try {
      setLoading(true);

      // ✅ الحصول على الوقت الحالي بدون إضافة 3 ساعات
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
      console.log('⏳ التوقيت الحالي:', formattedDate);

      // ✅ جلب جميع الأسئلة
      const { data: questions, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .order('start_date', { ascending: true }); // ترتيب حسب وقت النشر

      if (fetchError) {
        console.error('❌ Supabase Error:', JSON.stringify(fetchError, null, 2));
        throw fetchError;
      }

      console.log('📌 الأسئلة المتاحة:', questions);

      if (!questions || questions.length === 0) {
        setError('⚠️ لا يوجد أسئلة متاحة حالياً.');
        return;
      }

      // ✅ البحث عن السؤال الذي يوافق الوقت الحالي
      const currentQuestion = questions.find((q) => {
        const startDate = new Date(q.start_date);
        const closeDate = new Date(q.close_date);
        return currentDate >= startDate && currentDate <= closeDate; // الوقت الحالي بين start_date و close_date
      });

      if (currentQuestion) {
        setQuestion(currentQuestion); // ✅ تحديد السؤال الحالي
      } else {
        // ✅ التحقق من السؤال التالي
        const nextQuestion = questions.find((q) => {
          const startDate = new Date(q.start_date);
          return currentDate < startDate; // السؤال الذي لم يبدأ بعد
        });

        if (nextQuestion) {
          const startDate = new Date(nextQuestion.start_date);
          setError(`⚠️ السؤال التالي سيتم نشره في ${startDate.toLocaleString('ar-SA')}.`);
        } else {
          setError('⚠️ لا يوجد أسئلة جديدة متاحة حالياً.');
        }
      }
    } catch (err) {
      console.error('❌ خطأ أثناء جلب السؤال:', JSON.stringify(err, null, 2));
      setError('❌ حدث خطأ أثناء جلب السؤال.');
    } finally {
      setLoading(false);
    }
  };

  fetchQuestion();
}, []);


// اختيار الإجابة
const handleAnswer = (answer: string) => {
  setSelectedAnswer(answer);
  setErrorMessage('');
};

// إرسال البيانات إلى Supabase
// إرسال البيانات إلى Supabase مع التأكد من عدم تكرار الرقم
const handleSubmit = async () => {
if (!name || !city || !selectedAnswer) {
  setErrorMessage('يرجى ملء جميع الحقول واختيار إجابة.');
  return;
}

try {
  // 🔹 جلب رقم السؤال الحالي
  if (!question) {
    setErrorMessage('❌ لا يوجد سؤال متاح حالياً.');
    return;
  }

  const questionId = question.id; // 🔹 رقم السؤال الحالي

  let number;
  let isUnique = false;

  // توليد رقم اشتراك فريد والتحقق من عدم تكراره
  do {
    number = Math.floor(1000 + Math.random() * 9000);
    const { data, error } = await supabase
      .from('participants')
      .select('subscription_number')
      .eq('subscription_number', number);

    if (error) {
      console.error('❌ خطأ أثناء التحقق من الرقم:', error);
      throw new Error('❌ حدث خطأ أثناء التحقق من الرقم.');
    }

    isUnique = data.length === 0;
  } while (!isUnique);

  // 🔹 إدراج بيانات المتسابق مع `question_id`
  const { error: insertError } = await supabase.from('participants').insert([
    {
      name,
      city,
      answer: selectedAnswer,
      subscription_number: number,
      question_id: questionId, // ✅ ربط المتسابق بالسؤال الصحيح
    },
  ]);

  if (insertError) {
    console.error('❌ خطأ أثناء تسجيل المشاركة:', insertError);
    throw new Error('❌ حدث خطأ أثناء تسجيل المشاركة.');
  }

  setSubscriptionNumber(number);
  setIsSubmitted(true);
} catch (err) {
  console.error('❌ خطأ أثناء إرسال البيانات:', JSON.stringify(err, null, 2));
  setErrorMessage('❌ حدث خطأ أثناء إرسال البيانات.');
}
};

// الحصول على التاريخ الميلادي واسم اليوم
const getFormattedDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  };
  const formattedDate = today.toLocaleDateString('ar-SA', options);
  return formattedDate.replace(/،/g, ''); // إزالة الفاصلة العربية إذا كانت موجودة
};

return (
  <div dir="rtl" className="max-w-md mx-auto mt-2 p-6 bg-white shadow-lg rounded-lg text-center">
    {/* رأس النموذج مع الشعار */}
    <div className="flex items-center justify-between bg-blue-600 text-white py-3 px-4 rounded-t-lg">
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
        مسابقة الماس الرمضانية
      </h1>
      <Image
        src="/images/logoo2.png"
        alt="شعار المسابقة"
        width={80}
        height={40}
        className="rounded-md w-auto h-auto" // الحفاظ على نسبة العرض إلى الارتفاع
      />
    </div>

    {/* حالة التحميل والخطأ */}
    {loading && <p className="text-lg font-semibold text-gray-700 mt-4">جارٍ تحميل السؤال...</p>}
    {error && <p className="text-lg font-semibold text-red-500 mt-4">{error}</p>}

    {/* حالة بعد الإرسال */}
    {isSubmitted ? (
      <>
        <div className="mt-4">
          <Image
            src="/images/talal.jpg"
            alt="الشيخ طلال عواده الحبيشي"
            width={128}
            height={128}
            className="w-32 h-32 mx-auto rounded-full border-4 border-blue-600"
          />
        </div>
        <p className="text-lg text-gray-800 mt-2 mb-4">
          الداعم الرئيسي: <br />
          <span className="text-xl font-bold text-gray-900 relative inline-block">
            الشيخ طلال عواده الحبيشي
            <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 rounded-md"></span>
          </span>
        </p>
        <h2 className="text-2xl text-green-600 mt-4 mb-2">رقم المشاركة هو</h2>
        <p className="text-3xl text-gray-800 mb-4 font-bold">{subscriptionNumber}</p>
        {!showThankYouMessage ? (
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={async () => {
              if (subscriptionNumber !== null) {
                try {
                  await navigator.clipboard.writeText(subscriptionNumber.toString());
                  setShowThankYouMessage(true);
                } catch (err) {
                  if (err instanceof Error) {
                    console.error('خطأ في النسخ:', err.message);
                  } else {
                    console.error('خطأ في النسخ:', JSON.stringify(err));
                  }
                }
              }
            }}
          >
            نسخ الرقم
          </button>
          
        ) : (
          <p className="text-green-600 font-bold text-lg">
            شكراً لمشاركتك.. تابع الماس لمعرفة النتيجة
          </p>
          
        )}
      </>
    ) : (
      question && (
        <>
          {/* معلومات السؤال */}
          <div
className="mb-4 text-center p-3 bg-gray-100 rounded-lg flex items-center justify-center"
style={{ fontSize: '1.1rem' }}
>
{/* إحاطة رقم السؤال بدائرة أصغر */}
<span
  className="inline-flex items-center justify-center w-8 h-8 bg-white border border-blue-500 rounded-full text-blue-500 font-bold"
  style={{ fontSize: '1rem', marginLeft: '10px' }} // مسافة يدوية بين الدائرة والتاريخ
>
  {question.id}
</span>
{/* التاريخ مع مسافة فاصلة أكبر */}
<span className="text-gray-600">{getFormattedDate()}</span>
</div>





          {/* السؤال */}
          <h2 className="text-2xl text-blue-800 my-6 font-bold">{question.question}</h2>

          {/* الخيارات */}
          <div className="space-y-4">
            {[question.option1, question.option2].map((option, index) => (
              <button
                key={index}
                className={`w-full py-3 px-6 font-semibold rounded transition ${
                  selectedAnswer === option
                    ? question.correct_option === option
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
                onClick={() => handleAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>

{/* حقول الإدخال بتصميم جانبي مع إحاطة العنوان */}
<div className="mt-6 space-y-4 text-right">
{/* حقل الاسم */}
<div className="flex items-center gap-2">
  <label
    htmlFor="name"
    className="text-md font-semibold text-gray-700 bg-gray-200 border border-gray-300 rounded px-2 py-1"
  >
    اسمك:
  </label>
  <input
    id="name"
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="flex-1 py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

{/* حقل المدينة */}
<div className="flex items-center gap-2">
  <label
    htmlFor="city"
    className="text-md font-semibold text-gray-700 bg-gray-200 border border-gray-300 rounded px-2 py-1"
  >
    المدينة:
  </label>
  <input
    id="city"
    type="text"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    className="flex-1 py-2 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
</div>



          {/* رسالة الخطأ */}
          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

          {/* زر المشاركة */}
          <button
            className="w-full py-3 px-6 bg-blue-500 text-white rounded mt-6 hover:bg-blue-600 transition"
            onClick={handleSubmit}
          >
            ارسل
          </button>
        </>
      )
    )}
{/* أزرار المشاركة */}
<div className="flex justify-center gap-4 mt-6">
{/* زر متابعة سناب شات */}
<button
  onClick={() => {
    window.open('https://www.snapchat.com/add/almayn', '_blank');
  }}
  className="bg-yellow-400 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition flex items-center gap-2 shadow-md w-32 justify-center"
>
  <FaSnapchat size={24} />
  <span>تابعنا</span>
</button>

{/* زر المشاركة العامة */}
<button
  onClick={() => {
    const urlToShare = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: 'شارك هذه الصفحة', url: urlToShare })
        .catch((err) => console.error('خطأ في المشاركة:', err));
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح.');
    }
  }}
  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center gap-2 shadow-md w-32 justify-center"
>
  <FaShareAlt size={24} />
  <span>شارك</span>
</button>

{/* زر الجوائز */}
<button
  onClick={() => setShowPrizes(true)}
  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center gap-2 shadow-md w-32 justify-center"
>
  🎁 الجوائز
</button>

{/* عرض النافذة فقط عند الحاجة */}
{showPrizes && (
  <PrizesModal show={showPrizes} onClose={() => setShowPrizes(false)} />
)}
</div>

       {/* زر العودة للرئيسية */}
       <Link href="/">
        <button className="mt-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          العودة للرئيسية
        </button>
      </Link>

    {/* Footer - رابط صفحة سياسة الخصوصية */}
    <footer className="mt-8 text-sm text-gray-500">
      <p>
        باستخدامك هذا التطبيق، فإنك توافق على{' '}
        <a
          href="https://almayn.netlify.app/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          سياسة الخصوصية
          </a>

        </p>
      </footer>
    </div>
  );
}