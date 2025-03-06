'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Image from 'next/image';

export default function Draw() {
  const [winner, setWinner] = useState(null);
  const [winnerName, setWinnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(6);
  const [showCongrats, setShowCongrats] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionId, setQuestionId] = useState<number | null>(null); // رقم السؤال الحالي

  // ✅ دالة لتحديث حالة الأسئلة
  const updateQuestionsStatus = async () => {
    try {
      const currentTime = new Date().toISOString();
      console.log("⏰ التوقيت الحالي UTC:", currentTime);
  
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, close_date, status')
        .eq('status', 'waiting');
  
      if (error) {
        console.error('❌ خطأ أثناء جلب الأسئلة:', error);
        return;
      }
  
      questions.forEach(q => {
        console.log(`📌 [تحليل قبل التحديث] سؤال ${q.id}: close_date=${q.close_date}, مقارنة بـ currentTime=${currentTime}`);
      });
  
      const questionsToUpdate = questions.filter(q => new Date(q.close_date) <= new Date(currentTime));
  
      if (questionsToUpdate.length === 0) {
        console.log('⚠️ لا توجد أسئلة تحتاج إلى التحديث.');
        return;
      }
  
      console.log('✅ سيتم تحديث الأسئلة التالية:', questionsToUpdate);
  
      const { error: updateError } = await supabase
        .from('questions')
        .update({ status: 'open' })
        .in('id', questionsToUpdate.map(q => q.id));
  
      if (updateError) {
        console.error('❌ خطأ أثناء تحديث حالة الأسئلة:', updateError);
        return;
      }
  
      console.log('✅ تم تحديث الأسئلة بنجاح.');
  
      // ✅ **بعد التحديث، تحقق مما إذا كان التحديث قد حدث فعليًا**
      const { data: updatedQuestions, error: fetchUpdatedError } = await supabase
        .from('questions')
        .select('id, status, close_date')
        .in('id', questionsToUpdate.map(q => q.id));
  
      if (fetchUpdatedError) {
        console.error('❌ خطأ عند التحقق من التحديث:', fetchUpdatedError);
      } else {
        console.log('🔄 تحقق من الأسئلة بعد التحديث:', updatedQuestions);
      }
    } catch (err) {
      console.error('❌ خطأ أثناء تحديث الأسئلة:', err);
    }
  };
  
  
  // ✅ جلب أحدث سؤال عند تحميل الصفحة
  useEffect(() => {
    const fetchLatestQuestion = async () => {
      try {
        // تحديث حالة الأسئلة أولاً
        await updateQuestionsStatus();

        // جلب توقيت الخادم
        const { data: serverTimeData, error: rpcError } = await supabase.rpc('get_current_timestamp');
        if (rpcError) {
          console.error('❌ خطأ أثناء جلب توقيت الخادم:', rpcError.message);
          return;
        }

        const currentTime = serverTimeData || new Date().toISOString();

        // جلب أحدث سؤال بناءً على توقيت الخادم
        const { data: latestQuestion, error: questionError } = await supabase
        .from('questions')
        .select('id, close_date, status')
        .eq('status', 'open') // ✅ البحث فقط عن الأسئلة المفتوحة
        .order('close_date', { ascending: false }) 
        .limit(1)
        .single();
      

        if (questionError || !latestQuestion) {
          alert('❌ لم يتم العثور على سؤال متاح للسحب.');
          return;
        }

        setQuestionId(latestQuestion.id); // حفظ رقم السؤال الحالي
        console.log("📌 رقم السؤال الحالي:", latestQuestion.id);
      } catch (error) {
        console.error('❌ خطأ أثناء جلب السؤال:', error);
      }
    };

    fetchLatestQuestion();
  }, []);

  // ✅ الأصوات
  const playTimerWarning = () => {
    const audio = new Audio('/sounds/timer-warning.mp3');
    audio.volume = 0.5;
    audio.play();
  };

  const playCheer = () => {
    const audio = new Audio('/sounds/cheer.mp3');
    audio.volume = 0.7;
    audio.play();
  };

  // ✅ دالة السحب
  const drawWinner = async () => {
    if (!questionId) {
      alert('❌ لم يتم العثور على السؤال الحالي.');
      return;
    }

    setLoading(true);
    setStarted(true);
    setProgress(0);
    setCountdown(6);
    setWinner(null);
    setWinnerName('');
    setShowCongrats(false);
    playTimerWarning();

    try {
      let timer = 6;
      const interval = setInterval(() => {
        setProgress((prev) => prev + (1 / (6 * 100)));
        setCountdown((prev) => prev - 0.01);

        if (timer <= 0) {
          clearInterval(interval);
          setProgress(100);
          setCountdown(0);
          chooseWinner();
        }
        timer -= 0.01;
      }, 10);
    } catch (err) {
      console.error('❌ خطأ أثناء السحب:', err);
      alert('❌ حدث خطأ أثناء السحب.');
    }
  };

  // ✅ دالة اختيار الفائز
  const chooseWinner = async () => {
    try {
      if (!questionId) {
        alert('❌ لم يتم العثور على السؤال الحالي.');
        return;
      }
  
      // ✅ جلب جميع الفائزين السابقين لهذا السؤال
      const { data: winners, error: winnersError } = await supabase
        .from('winners')
        .select('subscription_number')
        .eq('question_id', questionId);
  
      if (winnersError) throw winnersError;
  
      const winningNumbers = winners.map((item) => item.subscription_number);
  
      // ✅ جلب جميع المشاركين غير الفائزين
      let query = supabase
        .from('participants')
        .select('subscription_number, name, city') // ✅ إضافة `city`
        .eq('question_id', questionId);
  
      if (winningNumbers.length > 0) {
        query = query.not('subscription_number', 'in', `(${winningNumbers.join(',')})`);
      }
  
      const { data: participants, error: participantsError } = await query;
  
      if (participantsError) throw participantsError;
  
      console.log("📌 المشاركون غير الفائزين لهذا السؤال:", participants);
  
      if (!participants || participants.length === 0) {
        alert('⚠️ لا يوجد مشاركون جدد لهذا السؤال.');
        setLoading(false);
        return;
      }
  
      // ✅ اختيار فائز عشوائي
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winningData = participants[randomIndex];
  
      // ✅ تسجيل الفائز في قاعدة البيانات مع الاسم والمدينة
      const { error: insertError } = await supabase.from('winners').insert([
        {
          subscription_number: winningData.subscription_number,
          question_id: questionId,
          name: winningData.name,  // ✅ تخزين الاسم
          city: winningData.city,  // ✅ تخزين المدينة
        },
      ]);
  
      if (insertError) {
        console.error('❌ خطأ أثناء تسجيل الفائز:', JSON.stringify(insertError, null, 2));
        throw new Error(`❌ حدث خطأ أثناء تسجيل الفائز: ${insertError.message || 'خطأ غير معروف'}`);
      }
      
      // ✅ تحديث حالة السؤال إلى "closed" بعد نجاح السحب
      const { error: updateError } = await supabase
        .from('questions')
        .update({ status: 'closed' }) // تحويل الحالة إلى "closed"
        .eq('id', questionId);
  
      if (updateError) {
        console.error('❌ خطأ أثناء تحديث حالة السؤال:', updateError);
        alert('⚠️ حدث خطأ أثناء تحديث حالة السؤال.');
      } else {
        console.log(`✅ تم إغلاق السؤال رقم ${questionId} بنجاح.`);
      }
  
      setWinner(winningData.subscription_number);
      setWinnerName(`${winningData.name} من ${winningData.city}`); // ✅ عرض الاسم والمدينة مع النتيجة
      playCheer();
      setTimeout(() => {
        setShowCongrats(true);
      }, 1000);
    } catch (err) {
      console.error('❌ خطأ أثناء اختيار الفائز:', err);
      alert('❌ حدث خطأ أثناء اختيار الفائز.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-sm w-full mx-auto p-4 bg-white shadow-xl rounded-lg text-center relative overflow-hidden">
        {/* عنوان المسابقة */}
        <div className="bg-blue-600 text-white rounded-t-lg py-2 mb-4">
          <h2 className="text-2xl font-bold">مسابقة الماس الرمضانية</h2>
        </div>

        {/* عرض رقم السؤال */}
        {questionId && (
          <p className="text-lg font-semibold text-gray-800">
            رقم السؤال: <span className="text-blue-600 font-bold">{questionId}</span>
          </p>
        )}

        {/* صورة الراعي */}
        <div className="mb-2">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden mx-auto w-32 h-32 relative">
            <Image
              src="/images/talal.jpg"
              alt="الشيخ طلال عواده الحبيشي"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <p className="text-md text-gray-700 mt-2">الداعم الرئيسي</p>
          <p className="text-lg font-semibold text-[#D4AF37] shadow-sm">
            الشيخ طلال عواده الحبيشي
          </p>
        </div>

        {/* جزء السحب */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
          <div className="mb-4 w-52 h-52 mx-auto relative">
            <CircularProgressbar
              value={progress * 100}
              text={winner ? `${winner}` : started ? `${Math.ceil(countdown)}` : '⏳'}
              styles={buildStyles({
                textColor: '#16a34a',
                pathColor: '#3b82f6',
                trailColor: '#e2e8f0',
                textSize: '30px',
              })}
              className="text-bold"
            />
          </div>

          <p className="text-lg text-gray-800 font-bold mt-2">
            {showCongrats ? `🎉 ألف مبروك! ${winnerName}` : 'مسابقة الماس'}
          </p>

          <button
            className={`w-full py-2 text-lg font-semibold rounded transition ${
              loading ? 'bg-orange-400 cursor-not-allowed animate-pulse' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={drawWinner}
            disabled={loading}
          >
            {loading ? 'جاري السحب...' : 'ابدأ السحب'}
          </button>
        </div>
      </div>
    </div>
  );
}