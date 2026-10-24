import React, { useState } from 'react';
import {
  calculateCorrectedGravity,
  CorrectionResult,
} from '../data/densityTable';
import { HydrometerGraphic } from './HydrometerGraphic';
import { useTheme } from '../context/ThemeContext';
import {
  Thermometer,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  TableProperties,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface HydrometerCalculatorProps {
  temperatureF: number;
  observedGravity: number;
  onTempChange: (temp: number) => void;
  onGravityChange: (gravity: number) => void;
  onViewInTable: () => void;
  tempUnit?: 'F' | 'C';
  onTempUnitChange?: (unit: 'F' | 'C') => void;
}

export const HydrometerCalculator: React.FC<HydrometerCalculatorProps> = ({
  temperatureF,
  observedGravity,
  onTempChange,
  onGravityChange,
  onViewInTable,
  tempUnit: propTempUnit,
  onTempUnitChange,
}) => {
  const { isDark } = useTheme();
  const [internalUnit, setInternalUnit] = useState<'F' | 'C'>('F');
  const tempUnit = propTempUnit ?? internalUnit;
  const setTempUnit = onTempUnitChange ?? setInternalUnit;

  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // حساب الدرجة المئوية المقابلة
  const tempCelsius = ((temperatureF - 32) * 5) / 9;

  // إدارة نصوص الإدخال لمنع مشكلة الصفر الملتصق عند الكتابة والمسح
  const [tempStr, setTempStr] = useState<string>(
    tempUnit === 'C'
      ? temperatureF === 0
        ? '0'
        : (tempCelsius % 1 === 0 ? tempCelsius.toString() : tempCelsius.toFixed(1))
      : temperatureF.toString()
  );
  const [gravityStr, setGravityStr] = useState<string>(
    observedGravity > 0 ? observedGravity.toString() : '0'
  );

  // مزامنة النص الداخلي عند تغير القيمة من شريط التمرير أو الأزرار الخارجية
  React.useEffect(() => {
    if (tempUnit === 'C') {
      const c = ((temperatureF - 32) * 5) / 9;
      const parsed = parseFloat(tempStr);
      if (isNaN(parsed) || Math.abs(parsed - c) > 0.05) {
        setTempStr(c % 1 === 0 ? c.toString() : c.toFixed(1));
      }
    } else {
      const parsed = parseFloat(tempStr);
      if (isNaN(parsed) || Math.abs(parsed - temperatureF) > 0.05) {
        setTempStr(temperatureF.toString());
      }
    }
  }, [temperatureF, tempUnit]);

  React.useEffect(() => {
    setGravityStr(observedGravity > 0 ? observedGravity.toString() : '0');
  }, [observedGravity]);

  const handleToggleUnit = (unit: 'F' | 'C') => {
    if (unit === tempUnit) return;
    setTempUnit(unit);
    if (unit === 'C') {
      // التحويل إلى مئوية
      if (temperatureF === 0) {
        setTempStr('0');
        onTempChange(32); // 0°C تقابل 32°F
      } else {
        const c = ((temperatureF - 32) * 5) / 9;
        setTempStr(c % 1 === 0 ? c.toString() : c.toFixed(1));
      }
    } else {
      // التحويل إلى فهرنهايت
      if (tempStr === '0' && temperatureF === 32) {
        setTempStr('32');
      } else {
        setTempStr(temperatureF % 1 === 0 ? temperatureF.toString() : temperatureF.toFixed(1));
      }
    }
  };

  const handleTempInputChange = (val: string) => {
    setTempStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      if (tempUnit === 'C') {
        const f = (parsed * 9) / 5 + 32;
        onTempChange(Number(f.toFixed(2)));
      } else {
        onTempChange(parsed);
      }
    }
  };

  const handleTempBlur = () => {
    if (tempStr.trim() === '' || isNaN(parseFloat(tempStr))) {
      if (tempUnit === 'C') {
        const c = ((temperatureF - 32) * 5) / 9;
        setTempStr(c % 1 === 0 ? c.toString() : c.toFixed(1));
      } else {
        setTempStr(temperatureF.toString());
      }
    } else {
      setTempStr(parseFloat(tempStr).toString());
    }
  };

  const handleGravityInputChange = (val: string) => {
    setGravityStr(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      onGravityChange(parsed);
    }
  };

  const handleGravityBlur = () => {
    if (gravityStr.trim() === '' || isNaN(parseFloat(gravityStr))) {
      setGravityStr(observedGravity.toString());
    } else {
      setGravityStr(parseFloat(gravityStr).toString());
    }
  };

  const result: CorrectionResult = calculateCorrectedGravity(
    temperatureF,
    observedGravity
  );

  const handleCopy = () => {
    const tempText =
      tempUnit === 'C'
        ? `${tempCelsius.toFixed(1)}°C (${temperatureF.toFixed(1)}°F)`
        : `${temperatureF}°F`;
    const text = `الكثافة المصححة عند 60°F: ${result.correctedGravity.toFixed(
      3
    )} (الحرارة: ${tempText}, الكثافة المقروءة: ${observedGravity.toFixed(3)})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // إعادة التعيين تبدأ من الصفر دائماً كما طلب المستخدم
  const handleReset = () => {
    if (tempUnit === 'C') {
      onTempChange(32); // 0°C is 32°F
      setTempStr('0');
    } else {
      onTempChange(0);
      setTempStr('0');
    }
    onGravityChange(0);
    setGravityStr('0');
  };

  // عند الضغط على موافق إغلاق يستقر البرنامج على البداية تماماً كما في الصورة
  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (document.documentElement) {
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (document.body) {
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* القسم الرئيسي: مدخلات الحساب والنتائج (8 أعمدة) */}
      <div className="lg:col-span-8 space-y-6">
        {/* بطاقة المدخلات */}
        <div
          className={`border rounded-2xl shadow-xl p-5 space-y-6 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2
                className={`font-bold text-lg ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                الكثافة العملية (مدخلات قياس الهايدروميتر)
              </h2>
            </div>
            <button
              onClick={handleReset}
              className={`text-xs transition-colors flex items-center gap-1 font-medium cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-amber-400'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
              title="تصفير الخانات والبدء من الصفر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تصفير (بدء من 0)
            </button>
          </div>

          {/* 1. درجة حرارة السائل مع زر التبديل بين الفهرنهايت والمئوية */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Thermometer className="w-4 h-4 text-red-500" />
                درجة حرارة السائل في الهايدروميتر
              </label>

              {/* أزرار التبديل بين الفهرنهايت والمئوية */}
              <div
                className={`flex items-center p-0.5 rounded-xl border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleUnit('F')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tempUnit === 'F'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  °F فهرنهايت
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleUnit('C')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tempUnit === 'C'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  °C مئوية
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {tempUnit === 'F'
                  ? 'الوحدة القياسية في جداول ASTM D1250'
                  : 'محولة لحظياً إلى جداول ASTM D1250'}
              </span>
              <span
                className={`text-xs font-mono px-2.5 py-1 rounded-md border font-bold ${
                  isDark
                    ? 'text-slate-300 bg-slate-950 border-slate-800'
                    : 'text-slate-700 bg-slate-100 border-slate-200'
                }`}
              >
                {tempUnit === 'F'
                  ? `تعادل: ${tempCelsius.toFixed(1)}° مئوية (°C)`
                  : `تعادل: ${temperatureF.toFixed(1)}° فهرنهايت (°F)`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={tempStr}
                  onChange={(e) => handleTempInputChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={handleTempBlur}
                  placeholder="0"
                  className={`w-full border rounded-xl px-4 py-3 text-2xl font-mono font-bold focus:outline-hidden transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-amber-400 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-300 text-amber-700 focus:border-amber-500 focus:bg-white'
                  }`}
                />
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold font-mono text-lg">
                  {tempUnit === 'F' ? '°F' : '°C'}
                </span>
              </div>
            </div>

            {/* شريط انزلاق سريع متكيف مع الوحدة المحددة */}
            {tempUnit === 'F' ? (
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.max(0, Math.min(100, isNaN(parseFloat(tempStr)) ? 0 : parseFloat(tempStr)))}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onTempChange(val);
                  setTempStr(val.toString());
                }}
                className={`w-full accent-amber-500 cursor-pointer h-2 rounded-lg ${
                  isDark ? 'bg-slate-950' : 'bg-slate-200'
                }`}
              />
            ) : (
              <input
                type="range"
                min="-18"
                max="40"
                step="0.5"
                value={Math.max(-18, Math.min(40, isNaN(parseFloat(tempStr)) ? 0 : parseFloat(tempStr)))}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const f = (val * 9) / 5 + 32;
                  onTempChange(Number(f.toFixed(2)));
                  setTempStr(val.toString());
                }}
                className={`w-full accent-amber-500 cursor-pointer h-2 rounded-lg ${
                  isDark ? 'bg-slate-950' : 'bg-slate-200'
                }`}
              />
            )}
          </div>

          {/* 2. كثافة السائل في الهايدروميتر */}
          <div
            className={`space-y-3 pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-sm font-bold flex items-center gap-2 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Compass className="w-4 h-4 text-cyan-500" />
                كثافة السائل المقروءة بالهايدروميتر (Observed Specific Gravity)
              </label>
              <span
                className={`text-xs font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                النطاق القياسي: 0.505 - 0.600
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={gravityStr}
                  onChange={(e) => handleGravityInputChange(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={handleGravityBlur}
                  placeholder="0"
                  className={`w-full border rounded-xl px-4 py-3 text-2xl font-mono font-bold focus:outline-hidden transition-colors ${
                    isDark
                      ? 'bg-slate-950 border-slate-700/80 text-cyan-400 focus:border-cyan-500'
                      : 'bg-slate-50 border-slate-300 text-cyan-700 focus:border-cyan-500 focus:bg-white'
                  }`}
                />
                <span className="absolute left-4 top-4 text-xs text-slate-400 font-mono">
                  Sp.Gr
                </span>
              </div>
            </div>

            {/* شريط انزلاق الكثافة (0.505 إلى 0.600) */}
            <input
              type="range"
              min="0.505"
              max="0.600"
              step="0.001"
              value={Math.max(0.505, Math.min(0.600, isNaN(parseFloat(gravityStr)) || parseFloat(gravityStr) === 0 ? 0.505 : parseFloat(gravityStr)))}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onGravityChange(val);
                setGravityStr(val.toFixed(3));
              }}
              className={`w-full accent-cyan-500 cursor-pointer h-2 rounded-lg ${
                isDark ? 'bg-slate-950' : 'bg-slate-200'
              }`}
            />
          </div>

          {/* زر موافق لعرض نتيجة القراءة في نافذة منبثقة */}
          <div
            className={`pt-4 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3.5 px-6 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 cursor-pointer active:scale-[0.99]"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>موافق (عرض نتيجة القراءة)</span>
            </button>
          </div>
        </div>

        {/* بطاقة النتيجة المعروضة في الصفحة */}
        <div
          className={`border-2 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors ${
            isDark
              ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/40 text-slate-100'
              : 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/60 border-amber-300/80 text-slate-900'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
                <Sparkles className="w-4 h-4 font-bold" />
              </span>
              <div>
                <span
                  className={`text-xs uppercase tracking-wider font-bold font-mono ${
                    isDark ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  ASTM D1250 / IP Table 23
                </span>
                <h3 className="text-xl font-black">
                  الكثافة المصححة عند 60/60°F
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>نسخ النتيجة</span>
                  </>
                )}
              </button>

              <button
                onClick={onViewInTable}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>عرض في الجدول</span>
              </button>
            </div>
          </div>

          {/* الرقم الأكبر للكثافة المصححة */}
          <div
            className={`rounded-2xl p-6 text-center my-3 relative shadow-inner border ${
              isDark
                ? 'bg-slate-950/90 border-amber-500/30'
                : 'bg-white border-2 border-amber-200'
            }`}
          >
            <div
              className={`text-xs mb-1 font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Corresponding Specific Gravity 60/60 °F
            </div>
            <div
              className={`text-5xl sm:text-6xl font-mono font-black tracking-tight ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}
            >
              {observedGravity > 0 ? result.correctedGravity.toFixed(3) : '0.000'}
            </div>
            <div
              className={`text-xs mt-2 flex items-center justify-center gap-2 font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>
                (أو كغم/لتر: {observedGravity > 0 ? result.correctedGravity.toFixed(3) : '0.000'})
              </span>
            </div>
          </div>

          {/* شريط الإحصائيات والتفاصيل التفصيلية */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              className={`rounded-xl p-3 border ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800/80'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div
                className={`text-[11px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                فرق التصحيح (Δ Delta)
              </div>
              <div className="font-mono font-bold text-base mt-1 flex items-center gap-1">
                {observedGravity > 0 ? (
                  <>
                    <span
                      className={
                        result.delta >= 0 ? 'text-emerald-500' : 'text-red-500'
                      }
                    >
                      {result.delta >= 0 ? `+${result.delta.toFixed(3)}` : result.delta.toFixed(3)}
                    </span>
                    <span
                      className={`text-[10px] font-sans ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {result.delta >= 0 ? '(زيادة)' : '(نقصان)'}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 text-sm">0.000</span>
                )}
              </div>
            </div>

            <div
              className={`rounded-xl p-3 border ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800/80'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div
                className={`text-[11px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                إحداثيات الجدول المرجعي
              </div>
              <div
                className={`font-mono font-bold text-sm mt-1 ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {observedGravity > 0
                  ? `الصف: ${result.closestTemp}°F × العمود: ${result.closestGravity.toFixed(3)}`
                  : 'بانتظار إدخال الكثافة'}
              </div>
            </div>

            <div
              className={`rounded-xl p-3 border ${
                isDark
                  ? 'bg-slate-950/70 border-slate-800/80'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div
                className={`text-[11px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                حالة المطابقة
              </div>
              <div className="text-xs font-semibold mt-1 flex items-center gap-1.5">
                {observedGravity === 0 ? (
                  <span className="text-slate-500">ادخل الكثافة واضغط موافق</span>
                ) : result.isExactMatch ? (
                  <span className="text-emerald-500 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تطابق تام لخلية الجدول
                  </span>
                ) : (
                  <span className="text-cyan-500 flex items-center gap-1 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    استيفاء دقيق (Interpolation)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* القسم الجانبي: مجسم الهايدروميتر وملخص سريع (4 أعمدة) */}
      <div className="lg:col-span-4 space-y-4">
        <HydrometerGraphic
          temperatureF={temperatureF}
          observedGravity={observedGravity}
          correctedGravity={result.correctedGravity}
        />

        {/* بطاقة إرشادية وتفسير مختصر ومباشر */}
        <div
          className={`border rounded-2xl p-4 text-xs space-y-2 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <div
            className={`font-bold flex items-center gap-1.5 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            كيف يتم تصحيح الكثافة؟
          </div>
          <p
            className={`leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            الغاز المسال (LPG) يتمدد بالحرارة وينكمش بالبرودة، لذلك فإن قراءة الهايدروميتر عند أي حرارة غير 60°F تكون متغيرة. يقوم هذا التطبيق بإرجاع الكثافة إلى درجة الحرارة القياسية 60°F المعتمدة تجارياً وصناعياً بدقة متناهية.
          </p>
          <div
            className={`pt-2 border-t text-[11px] font-medium ${
              isDark
                ? 'border-slate-800 text-amber-400'
                : 'border-slate-200 text-amber-700'
            }`}
          >
            * درجة الحرارة المرجعية القياسية الدولية للغاز: 60°F (15.56°C).
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة لنتيجة القراءة عند الضغط على زر موافق */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-slate-900 border-amber-500/50 text-slate-100'
                : 'bg-white border-amber-400 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة المنبثقة */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-amber-500/10 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-md">
                  <FileCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    نتيجة الكثافة العملية (تصحيح الهايدروميتر)
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    شركة تعبئة وخدمات الغاز • قسم المختبرات • جدول ASTM D1250 المعتمد
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى النافذة المنبثقة */}
            <div className="p-6 space-y-5">
              {observedGravity === 0 ? (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isDark
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-sm">تنبيه: الكثافة المقروءة صفر (0)</p>
                    <p>
                      يرجى إدخال قراءة كثافة السائل في الهايدروميتر (مثال: 0.520) لإظهار نتيجة الكثافة العملية وفق جداول قسم المختبرات.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* ملخص المدخلات في النافذة */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div
                      className={`p-3 rounded-2xl border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`text-[11px] mb-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        حرارة السائل المقروءة
                      </div>
                      <div className="font-mono font-black text-lg text-amber-500">
                        {tempUnit === 'C' ? `${tempCelsius.toFixed(1)}°C` : `${temperatureF}°F`}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {tempUnit === 'C'
                          ? `(${temperatureF.toFixed(1)}°F)`
                          : `(${tempCelsius.toFixed(1)}°C)`}
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-2xl border ${
                        isDark
                          ? 'bg-slate-950 border-slate-800'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`text-[11px] mb-1 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        كثافة السائل المقروءة
                      </div>
                      <div className="font-mono font-black text-lg text-cyan-500">
                        {observedGravity.toFixed(3)}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        Specific Gravity
                      </div>
                    </div>
                  </div>

                  {/* المربع الرئيسي للنتيجة المصححة */}
                  <div
                    className={`p-5 rounded-2xl border-2 text-center shadow-lg relative overflow-hidden ${
                      isDark
                        ? 'bg-slate-950 border-amber-500/40 text-amber-400'
                        : 'bg-amber-50/70 border-amber-400 text-amber-800'
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      الكثافة المصححة عند 60/60°F (المعتمدة)
                    </div>
                    <div className="text-5xl font-mono font-black tracking-tight my-1">
                      {result.correctedGravity.toFixed(3)}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      كغم/لتر: {result.correctedGravity.toFixed(3)}
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs px-2">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        فرق التصحيح:
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          result.delta >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {result.delta >= 0
                          ? `+${result.delta.toFixed(3)}`
                          : result.delta.toFixed(3)}{' '}
                        {result.delta >= 0 ? '(زيادة)' : '(نقصان)'}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs px-2">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                        إحداثيات الجدول:
                      </span>
                      <span className="font-mono font-bold">
                        {result.closestTemp}°F × {result.closestGravity.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* أزرار أسفل النافذة */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {observedGravity > 0 && (
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>نسخ النتيجة</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  موافق (إغلاق)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
