import React, { useState, useRef } from 'react';
import {
  calculateCorrectedGravity,
} from './data/densityTable';
import { HydrometerCalculator } from './components/HydrometerCalculator';
import { GasComponentsCalculator } from './components/GasComponentsCalculator';
import { TableViewer } from './components/TableViewer';
import { useTheme } from './context/ThemeContext';
import {
  Flame,
  Table as TableIcon,
  Calculator,
  FlaskConical,
  FileCheck,
  Moon,
  Sun,
} from 'lucide-react';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  // تبدأ القيم من الصفر دائماً كما طلب المستخدم
  const [temperatureF, setTemperatureF] = useState<number>(0);
  const [observedGravity, setObservedGravity] = useState<number>(0);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [activeView, setActiveView] = useState<'calculator' | 'components' | 'table'>('calculator');

  const tableRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);

  // حساب الكثافة المصححة الحالية
  const result = calculateCorrectedGravity(temperatureF, observedGravity);

  const handleSelectFromTable = (temp: number, gravity: number) => {
    setTemperatureF(temp);
    setObservedGravity(gravity);
    setActiveView('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewInTable = () => {
    setActiveView('table');
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleApplyCalculatedDensity = (density: number) => {
    setObservedGravity(density);
    setActiveView('calculator');
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      } flex flex-col font-['Cairo',sans-serif] transition-colors duration-200`}
    >
      {/* شريط العنوان العلوي (Header) */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isDark
            ? 'bg-slate-900/95 border-slate-800 shadow-xl'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* اسم التطبيق والمختبر */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-slate-950 shadow-md shadow-orange-500/20">
                <Flame className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1
                  className={`font-black text-base sm:text-xl leading-snug ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  شركة تعبئة وخدمات الغاز
                </h1>
                <div
                  className={`flex items-center gap-2 text-xs font-bold mt-0.5 ${
                    isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}
                >
                  <span>قسم المختبرات</span>
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  ></span>
                  <span
                    className={`text-[11px] font-mono font-medium hidden xs:inline ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    ASTM D1250 • Table 23
                  </span>
                </div>
              </div>
            </div>

            {/* زر تبديل المظهر من الأسود إلى الأبيض + مؤشر النتيجة للموبايل */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
                }`}
                title={isDark ? 'تغيير اللون إلى الأبيض' : 'تغيير اللون إلى الأسود'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              <div
                className={`font-mono text-xs px-2 py-1 rounded-lg border font-bold ${
                  isDark
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {observedGravity > 0 ? result.correctedGravity.toFixed(3) : '0.000'}
              </div>
            </div>
          </div>

          {/* أزرار التبويب السريع كاملة الظهور دون اقتصاص + زر تغيير اللون */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <nav
              className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border w-full sm:w-auto sm:flex sm:items-center ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveView('calculator')}
                className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center leading-tight shrink-0 cursor-pointer ${
                  activeView === 'calculator'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>الكثافة العملية</span>
              </button>

              <button
                onClick={() => setActiveView('components')}
                className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center leading-tight shrink-0 cursor-pointer ${
                  activeView === 'components'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>الكثافة النظرية</span>
              </button>

              <button
                onClick={() => setActiveView('table')}
                className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center leading-tight shrink-0 cursor-pointer ${
                  activeView === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>الجداول المرجعية</span>
              </button>
            </nav>

            {/* زر تغيير اللون للشاشات الكبيرة */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
              }`}
              title={isDark ? 'تغيير اللون إلى الأبيض' : 'تغيير اللون إلى الأسود'}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>المظهر الأبيض</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>المظهر الأسود</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* شريط الكثافة المصححة عند 60°F - مكبّر وواضح حسب طلب المستخدم وإلغاء القراءة المسجلة */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-amber-500/40 shadow-black/40'
              : 'bg-white border-amber-300/80 shadow-slate-200/60'
          }`}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
                <FileCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div
                  className={`text-base sm:text-lg font-black leading-tight ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  الكثافة المصححة عند 60/60°F (المعتمدة)
                </div>
                <div
                  className={`text-xs font-mono mt-0.5 ${
                    isDark ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  ASTM D1250 / IP Table 23
                </div>
              </div>
            </div>

            {/* شارة حالة التصحيح على الموبايل */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold sm:hidden ${
                observedGravity > 0
                  ? isDark
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  observedGravity > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                }`}
              ></span>
              {observedGravity > 0 ? 'قراءة مصححة' : 'في انتظار القراءة'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <div
              className={`font-mono font-black text-3xl sm:text-4xl px-6 py-2.5 rounded-2xl border tracking-tight shadow-md transition-all text-center ${
                observedGravity > 0
                  ? isDark
                    ? 'text-amber-400 bg-slate-950 border-amber-500/60 shadow-amber-500/10'
                    : 'text-amber-800 bg-amber-50/90 border-amber-400 shadow-amber-200/50'
                  : isDark
                  ? 'text-slate-500 bg-slate-950 border-slate-800'
                  : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}
            >
              {observedGravity > 0 ? result.correctedGravity.toFixed(3) : '0.000'}
            </div>
            <div className="flex flex-col text-right">
              <span
                className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border text-center ${
                  isDark
                    ? 'text-slate-300 bg-slate-950 border-slate-800'
                    : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}
              >
                Sp.Gr
              </span>
              <span
                className={`text-[10px] text-center mt-0.5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                كغم/لتر
              </span>
            </div>
          </div>
        </div>

        {/* عرض المشهد حسب الاختيار */}
        {activeView === 'calculator' && (
          <div ref={calcRef} className="space-y-6">
            <HydrometerCalculator
              temperatureF={temperatureF}
              observedGravity={observedGravity}
              onTempChange={setTemperatureF}
              onGravityChange={setObservedGravity}
              onViewInTable={handleViewInTable}
              tempUnit={tempUnit}
              onTempUnitChange={setTempUnit}
            />

            {/* بطاقة مكونات الغاز مدمجة بالأسفل للوصول الفوري */}
            <div className="pt-2">
              <GasComponentsCalculator
                onApplyDensityToHydrometer={handleApplyCalculatedDensity}
              />
            </div>
          </div>
        )}

        {activeView === 'components' && (
          <div className="space-y-6">
            <GasComponentsCalculator
              onApplyDensityToHydrometer={handleApplyCalculatedDensity}
            />
          </div>
        )}

        {activeView === 'table' && (
          <div ref={tableRef} className="space-y-6">
            <TableViewer
              currentTemp={temperatureF}
              currentGravity={observedGravity}
              onSelectCell={handleSelectFromTable}
            />
          </div>
        )}
      </main>

      {/* تذييل الصفحة (Footer) */}
      <footer
        className={`border-t py-4 px-4 text-center text-xs transition-colors ${
          isDark
            ? 'bg-slate-950 border-slate-800/80 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-500" />
            <span className={isDark ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>
              شركة تعبئة وخدمات الغاز • قسم المختبرات • نظام حساب الكثافة العملية والنظرية للغاز المسال (LPG)
            </span>
          </div>
          <div className="font-mono text-slate-500 text-[11px]">
            ASTM D1250 • IP Table 23 (0°F - 100°F / 0.505 - 0.600)
          </div>
        </div>
      </footer>
    </div>
  );
}
