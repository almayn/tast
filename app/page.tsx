// app/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';

export default function Home() {
  interface Question {
    question: string;
    option1: string;
    option2: string;
    correct_option: string;
  }

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
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const currentDate = new Date().toISOString(); // الحصول على الوقت الحالي بتنسيق ISO
        console.log('Current Date:', currentDate); // تسجيل التاريخ الحالي

        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .lte('publish_date', currentDate) // الأسئلة التي تاريخ نشرها أقل من أو يساوي الوقت الحالي
          .gte('close_date', currentDate); // الأسئلة التي تاريخ إغلاقها أكبر من أو يساوي الوقت الحالي

        if (error) {
          console.error('Supabase Error Details:', JSON.stringify(error, null, 2));
          throw error;
        }

        console.log('Fetched Data:', data); // تسجيل البيانات المسترجعة
        if (data && data.length > 0) {
          setQuestion(data[0]); // تحديد السؤال الأول المطابق للشروط
        } else {
          setError('لا يوجد سؤال متاح حالياً.');
        }
      } catch (err) {
        console.error('Error fetching question:', JSON.stringify(err, null, 2));
        setError('حدث خطأ أثناء جلب السؤال.');
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
  const handleSubmit = async () => {
    if (!name || !city || !selectedAnswer) {
      setErrorMessage('يرجى ملء جميع الحقول واختيار إجابة.');
      return;
    }

    try {
      const number = Math.floor(1000 + Math.random() * 9000);
      const { error } = await supabase.from('participants').insert([
        {
          name,
          city,
          answer: selectedAnswer,
          subscription_number: number,
        },
      ]);

      if (error) {
        console.error('Supabase Insert Error Details:', JSON.stringify(error, null, 2));
        throw error;
      }

      setSubscriptionNumber(number);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting data:', JSON.stringify(err, null, 2));
      setErrorMessage('حدث خطأ أثناء إرسال البيانات.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg text-center">
      <div className="bg-blue-600 text-white py-3 rounded-t-lg">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Arial, sans-serif' }}>
          مسابقة الماس الرمضانية
        </h1>
      </div>

      {loading && <p className="text-lg font-semibold text-gray-700">جارٍ تحميل السؤال...</p>}
      {error && <p className="text-lg font-semibold text-red-500">{error}</p>}

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
            <h2 className="text-2xl text-blue-800 mb-6 font-bold">
              {question.question}
            </h2>
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
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 px-4 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="مدينتك"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2 px-4 border border-gray-300 rounded"
              />
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button
              className="w-full py-3 px-6 bg-blue-500 text-white rounded mt-6 hover:bg-blue-600 transition"
              onClick={handleSubmit}
            >
              شارك
            </button>
          </>
        )
      )}
    </div>
  );
}