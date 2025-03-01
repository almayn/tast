// app/add-question/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function AddQuestion() {
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // دالة لإضافة السؤال
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      if (!question || !option1 || !option2 || !correctOption || !closeDate) {
        setErrorMessage('يرجى ملء جميع الحقول.');
        return;
      }
      
      if (correctOption !== option1 && correctOption !== option2) {
        setErrorMessage('الإجابة الصحيحة يجب أن تكون واحدة من الخيارين.');
        return;
      }
      if (new Date(closeDate) <= new Date()) {
        setErrorMessage('تاريخ الإغلاق يجب أن يكون بعد الوقت الحالي.');
        return;
      }

      const { error } = await supabase.from('questions').insert([
        {
          question,
          option1,
          option2,
          correct_option: correctOption,
          close_date: closeDate,
        },
      ]);

      if (error) {
        throw new Error(`حدث خطأ أثناء إضافة السؤال. التفاصيل: ${error.message}`);
      }

      setSuccessMessage('تمت إضافة السؤال بنجاح!');
      setQuestion('');
      setOption1('');
      setOption2('');
      setCorrectOption('');
      setCloseDate('');
    } catch (err) {
      console.error('Error adding question:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-6 text-center w-full max-w-md border-4 border-blue-200">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-4">إضافة سؤال جديد</h1>
        
        {/* استمارة إضافة السؤال */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">السؤال:</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="اكتب السؤال هنا"
              className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">الخيار الأول:</label>
            <input
              type="text"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              placeholder="اكتب الخيار الأول"
              className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="button"
              className="mt-1 py-1 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition w-full"
              onClick={() => setCorrectOption(option1)}
            >
              اختر كإجابة صحيحة
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">الخيار الثاني:</label>
            <input
              type="text"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              placeholder="اكتب الخيار الثاني"
              className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
            <button
              type="button"
              className="mt-1 py-1 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition w-full"
              onClick={() => setCorrectOption(option2)}
            >
              اختر كإجابة صحيحة
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">الإجابة الصحيحة:</label>
            <input
              type="text"
              value={correctOption}
              readOnly
              className="w-full py-2 px-4 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">تاريخ ووقت انتهاء العرض:</label>
            <input
              type="datetime-local"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
              className="w-full py-2 px-4 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2 px-4 font-semibold rounded-full shadow-lg transition ${
              loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={loading}
          >
            {loading ? 'جارٍ الإضافة...' : 'إضافة السؤال'}
          </button>
    
          {/* رسائل النجاح أو الخطأ */}
          {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </form>

        
       {/* زر العودة للرئيسية */}
       <div className="mt-8 flex justify-center">
  <Link href="/">
    <button className="py-2 px-6 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300">
      الرئيسية
    </button>
  </Link>
      </div>
  
</div>

    </div>
  );
}
