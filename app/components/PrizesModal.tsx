// app/components/PrizesModal.tsx
'use client';
import { FaGift, FaMoneyBillWave, FaTimes } from 'react-icons/fa';

interface PrizesModalProps {
  show: boolean;
  onClose: () => void;
}

export default function PrizesModal({ show, onClose }: PrizesModalProps) {
  if (!show) return null; // عدم إظهار النافذة إذا لم يكن show = true

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white max-w-md mx-auto p-6 rounded-lg shadow-lg relative text-center">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          title="إغلاق"
        >
          <FaTimes size={20} />
        </button>

        {/* عنوان النافذة */}
        <h2 className="text-3xl font-bold text-blue-800 mb-4">
          🎁 جوائز قيمة بانتظارك!
        </h2>

        {/* وصف الجوائز */}
        <p className="text-lg text-gray-700 mb-4">
          أجب على السؤال وشارك بالسحب
          <br />
          لتربح جوائز قيمة
        </p>

        {/* الجوائز */}
        <div className="text-left text-lg mb-4">
          <p className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-500" /> مبالغ مالية يومياً
          </p>
          <p className="flex items-center gap-2">
            <FaGift className="text-yellow-500" /> بطاقات شحن
          </p>
        </div>

        {/* زر المشاركة */}
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          شارك الآن!
        </button>
      </div>
    </div>
  );
}
