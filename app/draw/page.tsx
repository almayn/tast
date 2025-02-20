'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Draw() {
  const [winner, setWinner] = useState(null);
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
    setShowCongrats(false);

    playTimerWarning(); // صوت بدء العد التنازلي

    try {
      // بدء المؤقت
      let timer = 6;
      const interval = setInterval(() => {
        setProgress((prev) => prev + (1 / (6 * 100)));
        setCountdown((prev) => prev - 0.01);

        if (timer <= 0) {
          clearInterval(interval);
          setProgress(100);
          setCountdown(0);

          // استدعاء دالة اختيار الفائز بعد انتهاء المؤقت
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
        .select('subscription_number');
      if (participantsError) throw participantsError;

      const { data: winners, error: winnersError } = await supabase
        .from('winners')
        .select('subscription_number');
      if (winnersError) throw winnersError;

      const winningNumbers = winners.map((item) => item.subscription_number);
      const availableNumbers = participants
        .map((item) => item.subscription_number)
        .filter((num) => !winningNumbers.includes(num));

      if (availableNumbers.length === 0) {
        alert('تم سحب كل الأرقام! لا يوجد أرقام متبقية.');
        setLoading(false);
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const winningNumber = availableNumbers[randomIndex];

      const { error: insertError } = await supabase.from('winners').insert([
        { subscription_number: winningNumber },
      ]);

      if (insertError) {
        console.error('Supabase Insert Error Details:', insertError);
        throw new Error(`حدث خطأ أثناء تسجيل الفائز.`);
      }

      setWinner(winningNumber);

      // تشغيل صوت الفوز
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg text-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">سحب الفائز</h1>
      <div className="mb-6 w-48 h-48 mx-auto">
        <CircularProgressbar
          value={progress * 100}
          text={
            winner
              ? `${winner}`
              : !started
              ? '⏳'
              : `${Math.ceil(countdown)}`
          }
          styles={buildStyles({
            textColor: winner ? '#15803d' : '#3b82f6',
            pathColor: '#3b82f6',
            trailColor: '#e2e8f0',
            textSize: '30px',
            fontWeight: 'bold',
          })}
        />
      </div>

      {showCongrats && (
        <div className="animate-bounce">
          <h2 className="text-4xl text-green-600 mb-4">الف مبروك!</h2>
        </div>
      )}
      <button
        className="w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
        onClick={drawWinner}
        disabled={loading}
      >
        ابدأ السحب
      </button>
    </div>
  );
}
