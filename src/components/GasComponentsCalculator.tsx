import React, { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  FlaskConical,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Percent,
  Layers,
  Sparkles,
  Info,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export interface GasComponent {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  density: number; // الكثافة المرجعية
}

export const GAS_COMPONENTS_REFERENCE: GasComponent[] = [
  { id: 'c2', code: 'C 2', nameAr: 'إيثان', nameEn: 'Ethane', density: 0.356 },
  { id: 'c3', code: 'C 3', nameAr: 'بروبان', nameEn: 'Propane', density: 0.507 },
  { id: 'c4n', code: 'C 4n', nameAr: 'بيوتان اعتيادي (نظامي)', nameEn: 'Normal Butane', density: 0.584 },
  { id: 'c4z', code: 'C 4z', nameAr: 'آيزوبيوتان', nameEn: 'Isobutane', density: 0.563 },
  { id: 'c5n', code: 'C 5n', nameAr: 'بنتان اعتيادي (نظامي)', nameEn: 'Normal Pentane', density: 0.631 },
  { id: 'c5z', code: 'C 5z', nameAr: 'آيزوبنتان', nameEn: 'Isopentane', density: 0.624 },
];

interface GasComponentsCalculatorProps {
  onApplyDensityToHydrometer: (density: number) => void;
}

export const GasComponentsCalculator: React.FC<GasComponentsCalculatorProps> = ({
  onApplyDensityToHydrometer,
}) => {
  const { isDark } = useTheme();

  // نمط الإدخال: إما بالنسبة المئوية (%) أو بالكمية / الحجم (لتر أو م³ أو كغ)
  const [inputMode, setInputMode] = useState<'percentage' | 'quantity'>('percentage');

  // تبدأ القيم من الصفر دائماً كما طلب المستخدم
  const [values, setValues] = useState<Record<string, string>>({
    c2: '0',
    c3: '0',
    c4n: '0',
    c4z: '0',
    c5n: '0',
    c5z: '0',
  });

  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (id: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const handleReset = () => {
    setValues({
      c2: '0',
      c3: '0',
      c4n: '0',
      c4z: '0',
      c5n: '0',
      c5z: '0',
    });
  };

  // الحسابات الرياضية الدقيقة
  const calculation = useMemo(() => {
    let totalInput = 0;
    const parsedValues: Record<string, number> = {};

    GAS_COMPONENTS_REFERENCE.forEach((comp) => {
      const val = parseFloat(values[comp.id]) || 0;
      parsedValues[comp.id] = Math.max(0, val);
      totalInput += parsedValues[comp.id];
    });

    let calculatedDensity = 0;

    if (totalInput > 0) {
      if (inputMode === 'percentage') {
        // إذا كان بالنسبة المئوية: مجموع (النسبة / 100 * الكثافة)
        GAS_COMPONENTS_REFERENCE.forEach((comp) => {
          const pct = parsedValues[comp.id];
          const normalizedFraction = pct / totalInput;
          calculatedDensity += normalizedFraction * comp.density;
        });
      } else {
        // إذا كان بكميات: مجموع (الكمية * الكثافة) / مجموع الكميات
        let weightedSum = 0;
        GAS_COMPONENTS_REFERENCE.forEach((comp) => {
          weightedSum += parsedValues[comp.id] * comp.density;
        });
        calculatedDensity = weightedSum / totalInput;
      }
    }

    return {
      totalInput,
      calculatedDensity: Number(calculatedDensity.toFixed(3)),
      parsedValues,
    };
  }, [values, inputMode]);

  const handleApply = () => {
    if (calculation.calculatedDensity > 0) {
      onApplyDensityToHydrometer(calculation.calculatedDensity);
      setApplied(true);
      setShowModal(false);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(calculation.calculatedDensity.toFixed(3));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* رأس البطاقة */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'border-slate-800 bg-slate-900/90'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isDark
                ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                : 'bg-orange-500/10 border-orange-500/20 text-orange-600'
            }`}
          >
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2
              className={`font-bold text-base flex items-center gap-2 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              الكثافة النظرية (حساب مكونات الغاز)
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                  isDark
                    ? 'bg-slate-800 text-orange-400'
                    : 'bg-orange-50 border border-orange-200 text-orange-700'
                }`}
              >
                قسم المختبرات
              </span>
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              حساب الكثافة النظرية لخليط الغاز (C2, C3, C4n, C4z, C5n, C5z) طبقاً للمراجع المعيارية
            </p>
          </div>
        </div>

        {/* أزرار التبديل وإعادة التعيين */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setInputMode('percentage')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'percentage'
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              نسب مئوية (%)
            </button>
            <button
              onClick={() => setInputMode('quantity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                inputMode === 'quantity'
                  ? 'bg-orange-500 text-slate-950 font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              كميات / حجوم
            </button>
          </div>

          <button
            onClick={handleReset}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-orange-600'
            }`}
            title="تفريغ وتصفير الخانات للبدء من 0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* شبكة مدخلات مكونات الغاز الستة حسب المرجع المرفق */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAS_COMPONENTS_REFERENCE.map((comp) => {
            const rawVal = values[comp.id] || '0';
            const numVal = parseFloat(rawVal) || 0;
            const pctOfTotal =
              calculation.totalInput > 0
                ? (numVal / calculation.totalInput) * 100
                : 0;

            return (
              <div
                key={comp.id}
                className={`border rounded-xl p-4 transition-all focus-within:ring-2 focus-within:ring-orange-500/20 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 focus-within:border-orange-500/80'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 focus-within:bg-white focus-within:border-orange-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-black text-sm px-2 py-0.5 rounded border ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-orange-400'
                          : 'bg-white border-slate-200 text-orange-700'
                      }`}
                    >
                      {comp.code}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-slate-200' : 'text-slate-900'
                      }`}
                    >
                      {comp.nameAr}
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    ≅ <span className={isDark ? 'text-amber-300 font-bold' : 'text-amber-700 font-bold'}>{comp.density.toFixed(3)}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mt-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rawVal}
                    onChange={(e) => handleInputChange(comp.id, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className={`w-full border rounded-lg px-3 py-2 text-xl font-mono font-bold focus:outline-hidden transition-colors ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-100 focus:border-orange-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-orange-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-mono shrink-0 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {inputMode === 'percentage' ? '%' : 'كمية'}
                  </span>
                </div>

                {/* شريط نسبة مساهمة المركب */}
                <div
                  className={`mt-2.5 flex items-center justify-between text-[10px] font-mono ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span>المساهمة في الخليط:</span>
                  <span
                    className={`font-bold ${
                      isDark ? 'text-orange-300' : 'text-orange-700'
                    }`}
                  >
                    {pctOfTotal.toFixed(1)}%
                  </span>
                </div>
                <div
                  className={`w-full h-1.5 rounded-full overflow-hidden mt-1 ${
                    isDark ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, pctOfTotal)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* بطاقة النتيجة الإجمالية للكثافة المحسوبة للغاز */}
        <div
          className={`border-2 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
            isDark
              ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/25 border-orange-500/40'
              : 'bg-gradient-to-r from-orange-50/80 via-white to-amber-50/70 border-orange-200 shadow-sm'
          }`}
        >
          <div className="space-y-1 text-center md:text-right">
            <span
              className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5 ${
                isDark ? 'text-orange-400' : 'text-orange-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              الكثافة النظرية المحسوبة لخليط الغاز
            </span>
            <div
              className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                isDark ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              {calculation.calculatedDensity > 0
                ? calculation.calculatedDensity.toFixed(3)
                : '0.000'}
            </div>
            <div
              className={`text-xs font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              مجموع المدخلات: {calculation.totalInput.toLocaleString()}{' '}
              {inputMode === 'percentage' ? '%' : 'وحدة'}
            </div>
          </div>

          {/* أزرار الإجراءات وزر موافق */}
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>موافق (عرض نافذة النتيجة)</span>
            </button>

            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
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
                  <span>نسخ الكثافة</span>
                </>
              )}
            </button>

            <button
              onClick={handleApply}
              disabled={calculation.calculatedDensity <= 0}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {applied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تم التطبيق في الكثافة العملية!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>تطبيق في الكثافة العملية</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* بطاقة مرجع كثافات الغاز المعتمدة في قسم المختبرات */}
        <div
          className={`border rounded-xl p-4 text-xs space-y-2 ${
            isDark
              ? 'bg-slate-950/70 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div
            className={`font-bold flex items-center gap-2 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            <Info className="w-4 h-4 text-orange-500" />
            مرجع كثافات الغاز المعتمد (قسم المختبرات):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center font-mono pt-1">
            {GAS_COMPONENTS_REFERENCE.map((c) => (
              <div
                key={c.id}
                className={`p-2 rounded-lg border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800/80'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div
                  className={`font-bold ${
                    isDark ? 'text-orange-400' : 'text-orange-700'
                  }`}
                >
                  {c.code}
                </div>
                <div
                  className={`text-[11px] ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {c.nameAr}
                </div>
                <div
                  className={`text-xs font-black mt-1 ${
                    isDark ? 'text-amber-300' : 'text-amber-700'
                  }`}
                >
                  ≅ {c.density.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة لنتيجة كثافة الغاز عند الضغط على موافق */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl border-2 shadow-2xl overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-slate-900 border-orange-500/50 text-slate-100'
                : 'bg-white border-orange-400 text-slate-900'
            }`}
          >
            {/* رأس النافذة */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-orange-500/10 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-orange-500 text-slate-950 shadow-md">
                  <FileCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    نتيجة الكثافة النظرية (مكونات الغاز)
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    شركة تعبئة وخدمات الغاز • قسم المختبرات • مرجع كثافات مركبات الغاز
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 space-y-5">
              {calculation.calculatedDensity <= 0 ? (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isDark
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                      : 'bg-orange-50 border-orange-300 text-orange-900'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-sm">تنبيه: لم يتم إدخال كميات أو نسب</p>
                    <p>
                      يرجى إدخال قيم المركبات (C2, C3, C4n, C4z, C5n, C5z) لحساب كثافة الخليط بدقة.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* المربع الرئيسي للكثافة */}
                  <div
                    className={`p-5 rounded-2xl border-2 text-center shadow-lg ${
                      isDark
                        ? 'bg-slate-950 border-orange-500/40 text-amber-300'
                        : 'bg-orange-50/70 border-orange-400 text-amber-800'
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      الكثافة النظرية المحسوبة للغاز المسال
                    </div>
                    <div className="text-5xl font-mono font-black tracking-tight my-1">
                      {calculation.calculatedDensity.toFixed(3)}
                    </div>
                    <div
                      className={`text-xs font-mono ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      مجموع المدخلات: {calculation.totalInput.toLocaleString()}{' '}
                      {inputMode === 'percentage' ? '%' : 'وحدة'}
                    </div>
                  </div>

                  {/* تفاصيل مساهمة المركبات */}
                  <div
                    className={`rounded-2xl p-4 border text-xs space-y-2 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className={`font-bold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      توزيع المركبات في الخليط:
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono">
                      {GAS_COMPONENTS_REFERENCE.map((c) => {
                        const val = parseFloat(values[c.id]) || 0;
                        if (val <= 0) return null;
                        const pct =
                          calculation.totalInput > 0
                            ? (val / calculation.totalInput) * 100
                            : 0;
                        return (
                          <div
                            key={c.id}
                            className={`p-2 rounded-lg border flex items-center justify-between ${
                              isDark
                                ? 'bg-slate-900 border-slate-800'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <span className="font-bold text-orange-500">{c.code}</span>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                              {pct.toFixed(1)}% (كثافة {c.density})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* أزرار أسفل النافذة */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                {calculation.calculatedDensity > 0 && (
                  <>
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>نسخ الكثافة</span>
                    </button>

                    <button
                      onClick={handleApply}
                      className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>تطبيق في الكثافة العملية</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors shadow-md cursor-pointer"
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
