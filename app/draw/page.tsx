// app/draw/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Image from 'next/image';
import Link from 'next/link';



export default function DrawPage() {
  const [winner, setWinner] = useState(null);
  const [winnerName, setWinnerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(6);
  const [showCongrats, setShowCongrats] = useState(false);
  const [started, setStarted] = useState(false);

  // الأصوات
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

  // دالة لسحب رقم عشوائي
  const drawWinner = async () => {
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
      console.error('Error drawing winner:', err);
      alert('حدث خطأ أثناء السحب.');
    }
  };

  // دالة اختيار الفائز
  const chooseWinner = async () => {
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('subscription_number, name');
      if (participantsError) throw participantsError;

      const { data: winners, error: winnersError } = await supabase
        .from('winners')
        .select('subscription_number');
      if (winnersError) throw winnersError;

      const winningNumbers = winners.map((item) => item.subscription_number);
      const availableNumbers = participants
        .filter((item) => !winningNumbers.includes(item.subscription_number));

      if (availableNumbers.length === 0) {
        alert('لا توجد أرقام متاحة.');
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const winningNumber = availableNumbers[randomIndex].subscription_number;
      const winnerName = availableNumbers[randomIndex].name;

      const { error: insertError } = await supabase.from('winners').insert([
        { subscription_number: winningNumber },
      ]);
      if (insertError) {
        console.error('Supabase Insert Error Details:', insertError);
        throw new Error('حدث خطأ أثناء تسجيل الفائز.');
      }

      setWinner(winningNumber);
      setWinnerName(winnerName);
      playCheer();
      setTimeout(() => {
        setShowCongrats(true);
      }, 1000);
    } catch (err) {
      console.error('Error choosing winner:', JSON.stringify(err, null, 2));
      alert('حدث خطأ أثناء اختيار الفائز.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-sm w-full mx-auto p-4 bg-white shadow-xl rounded-lg text-center relative overflow-hidden">
        {/* عنوان المسابقة بخلفية زرقاء */}
        <div className="bg-blue-600 text-white rounded-t-lg py-2 mb-4">
          <h2 className="text-2xl font-bold">مسابقة الماس الرمضانية</h2>
        </div>

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
            {showCongrats
              ? `الف مبروك! ${winnerName}`
              : 'مسابقة الماس'}
          </p>

          <button
            className={`w-full py-2 text-lg font-semibold rounded transition ${
              loading
                ? 'bg-orange-400 cursor-not-allowed animate-pulse'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            onClick={drawWinner}
            disabled={loading}
          >
            {loading ? 'جاري السحب...' : 'ابدأ السحب'}
          </button>
      {/* محتوى الصفحة هنا */}
{/* محتوى المسابقة القديم هنا */}
      
      {/* زر العودة للرئيسية */}
      <Link href="/">
        <button className="mt-4 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          العودة للرئيسية
        </button>
      </Link>
              </div>
      </div>
    </div>
  );
}
