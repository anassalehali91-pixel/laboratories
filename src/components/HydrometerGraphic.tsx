import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface HydrometerGraphicProps {
  temperatureF: number;
  observedGravity: number;
  correctedGravity: number;
}

export const HydrometerGraphic: React.FC<HydrometerGraphicProps> = ({
  temperatureF,
  observedGravity,
  correctedGravity: _correctedGravity,
}) => {
  const { isDark } = useTheme();

  // نطاق الكثافة المعياري 0.500 - 0.560
  // كلما زادت الكثافة، يرتفع الهايدروميتر للأعلى (يطفو أكثر)
  const clampedGrav = observedGravity > 0 ? Math.max(0.500, Math.min(0.560, observedGravity)) : 0.500;
  const floatHeightPercent = observedGravity > 0 ? ((clampedGrav - 0.500) / (0.560 - 0.500)) * 60 : 0;

  return (
    <div
      className={`relative w-full max-w-[280px] mx-auto rounded-2xl p-4 border transition-colors overflow-hidden flex flex-col items-center select-none ${
        isDark
          ? 'bg-slate-900 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div
        className={`flex items-center justify-between w-full pb-2 mb-2 border-b text-xs ${
          isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
        }`}
      >
        <span
          className={`font-semibold flex items-center gap-1.5 ${
            isDark ? 'text-amber-400' : 'text-amber-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          الهايدروميتر ومقياس الحرارة
        </span>
        <span className="font-mono text-[11px] text-slate-400">ASTM D1250</span>
      </div>

      <div className="relative w-full h-56 flex items-center justify-center">
        {/* أسطوانة الهايدروميتر الزجاجية (Hydrometer Jar) */}
        <div
          className={`relative w-28 h-52 rounded-b-2xl rounded-t-lg border-2 shadow-inner flex flex-col items-center justify-end overflow-hidden ${
            isDark
              ? 'bg-gradient-to-b from-sky-500/10 via-cyan-500/5 to-sky-500/20 border-slate-700/80'
              : 'bg-gradient-to-b from-sky-50 via-cyan-50/50 to-sky-100/60 border-slate-300'
          }`}
        >
          {/* تدريجات الأسطوانة الزجاجية */}
          <div
            className={`absolute right-1 inset-y-4 flex flex-col justify-between py-2 text-[9px] font-mono ${
              isDark ? 'text-slate-400 opacity-60' : 'text-slate-500 font-semibold opacity-70'
            }`}
          >
            <span>500</span>
            <span>400</span>
            <span>300</span>
            <span>200</span>
            <span>100</span>
            <span>ml</span>
          </div>

          {/* مستوى السائل المسال (LPG Liquid) */}
          <div
            className={`absolute inset-x-0 bottom-0 h-40 border-t-2 transition-all duration-500 ${
              isDark
                ? 'bg-gradient-to-t from-cyan-600/35 via-sky-500/20 to-teal-400/20 border-cyan-400/50'
                : 'bg-gradient-to-t from-cyan-500/25 via-sky-400/20 to-teal-400/15 border-cyan-500/60'
            }`}
          >
            {/* تموجات سطح السائل المنحني (Meniscus) */}
            <div className="absolute -top-1.5 inset-x-0 h-3 bg-cyan-400/40 rounded-full blur-[1px]"></div>
          </div>

          {/* مجس الهايدروميتر الطافي (Hydrometer Float) */}
          <div
            className="relative z-10 w-10 flex flex-col items-center transition-all duration-700 ease-out"
            style={{
              transform: `translateY(${-10 - floatHeightPercent * 0.4}px)`,
            }}
          >
            {/* الساق المدرجة (Graduated Stem) */}
            <div
              className={`w-3 h-28 border rounded-t-sm shadow-sm flex flex-col justify-between py-1 px-[1px] ${
                isDark
                  ? 'bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border-amber-600/70'
                  : 'bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-600/70'
              }`}
            >
              <div className="w-full h-[1px] bg-red-600"></div>
              <div className="w-full h-[1px] bg-slate-700"></div>
              <div className="w-full h-[1px] bg-slate-700"></div>
              <div className="w-full h-[1px] bg-slate-800"></div>
              <div className="w-full h-[1px] bg-slate-700"></div>
              <div className="w-full h-[1px] bg-slate-800"></div>
              <div className="w-full h-[1px] bg-slate-700"></div>
            </div>

            {/* انتفاخ الهايدروميتر الزجاجي الرئيسي (Bulb) */}
            <div
              className={`w-8 h-14 rounded-2xl border shadow-md flex items-center justify-center -mt-1 ${
                isDark
                  ? 'bg-gradient-to-b from-amber-200/90 via-amber-300/70 to-slate-200/80 border-amber-700/80'
                  : 'bg-gradient-to-b from-amber-100 via-amber-200/90 to-slate-100 border-amber-600/80'
              }`}
            >
              <span className="font-mono text-[9px] font-bold text-slate-800 transform rotate-90">
                {observedGravity > 0 ? observedGravity.toFixed(3) : '0.000'}
              </span>
            </div>

            {/* ثقل الرصاص السفلي (Ballast / Lead Shot) */}
            <div className="w-5 h-4 bg-slate-800 rounded-b-full border border-slate-900 -mt-1 shadow-inner"></div>
          </div>

          {/* ميزان الحرارة الداخلي (Thermometer) */}
          <div
            className={`absolute left-2 bottom-3 w-2.5 h-36 rounded-full border flex flex-col justify-end p-[1px] overflow-hidden ${
              isDark ? 'bg-slate-900/60 border-slate-600/70' : 'bg-slate-200 border-slate-400'
            }`}
          >
            <div
              className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-full transition-all duration-500"
              style={{
                height: `${Math.min(100, Math.max(10, ((temperatureF - 0) / 100) * 100))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* المؤشرات السريعة تحت الهايدروميتر */}
      <div
        className={`grid grid-cols-2 gap-2 w-full mt-3 pt-2 border-t text-center ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div
          className={`rounded-lg p-1.5 border ${
            isDark
              ? 'bg-slate-950/70 border-slate-800 text-amber-400'
              : 'bg-slate-50 border-slate-200 text-amber-700'
          }`}
        >
          <div className="text-[10px] text-slate-400 font-medium">حرارة السائل</div>
          <div className="font-mono font-bold text-sm">
            {temperatureF}°F
          </div>
        </div>
        <div
          className={`rounded-lg p-1.5 border ${
            isDark
              ? 'bg-slate-950/70 border-slate-800 text-cyan-400'
              : 'bg-slate-50 border-slate-200 text-cyan-700'
          }`}
        >
          <div className="text-[10px] text-slate-400 font-medium">الكثافة المقروءة</div>
          <div className="font-mono font-bold text-sm">
            {observedGravity > 0 ? observedGravity.toFixed(3) : '0.000'}
          </div>
        </div>
      </div>
    </div>
  );
};
