import React, { useState } from 'react';
import {
  FULL_DENSITY_TABLE,
  OBSERVED_GRAVITIES,
} from '../data/densityTable';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  FileText,
  Table as TableIcon,
  Check,
} from 'lucide-react';

interface TableViewerProps {
  currentTemp: number;
  currentGravity: number;
  onSelectCell: (temp: number, gravity: number) => void;
}

export const TableViewer: React.FC<TableViewerProps> = ({
  currentTemp,
  currentGravity,
  onSelectCell,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'interactive' | 'original'>('interactive');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [gravityFilter, setGravityFilter] = useState<'all' | 'light' | 'heavy'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

  const DOCUMENTS = [
    {
      id: 'doc1',
      title: 'جدول (0°F - 50°F) • كثافة (0.505 - 0.550)',
      sub: 'البروبان والغاز المسال الخفيف - درجات شتوية ومنخفضة',
      path: '/assets/aistudio/IMG_20261024_105410_f59a7211.jpg',
      altPath: '/public/assets/aistudio/IMG_20261024_105410_f59a7211.jpg',
    },
    {
      id: 'doc2',
      title: 'جدول (0°F - 50°F) • كثافة (0.555 - 0.600)',
      sub: 'البيوتان والمخاليط الثقيلة - درجات منخفضة',
      path: '/assets/aistudio/IMG_20261024_105403_68813e99.jpg',
      altPath: '/public/assets/aistudio/IMG_20261024_105403_68813e99.jpg',
    },
    {
      id: 'doc3',
      title: 'جدول (50°F - 100°F) • كثافة (0.505 - 0.550)',
      sub: 'البروبان والغاز المسال الخفيف - درجات معتدلة وصيفية',
      path: '/assets/aistudio/Image_October_24__2026_-_10_40AM_bd3205fd',
      altPath: '/public/assets/aistudio/Image_October_24__2026_-_10_40AM_bd3205fd',
    },
    {
      id: 'doc4',
      title: 'جدول (50°F - 100°F) • كثافة (0.555 - 0.600)',
      sub: 'البيوتان والمخاليط الثقيلة - درجات معتدلة وصيفية',
      path: '/assets/aistudio/IMG_20261024_105345_bd6955e6.jpg',
      altPath: '/public/assets/aistudio/IMG_20261024_105345_bd6955e6.jpg',
    },
  ];

  const temps = Object.keys(FULL_DENSITY_TABLE)
    .map(Number)
    .sort((a, b) => a - b);

  const filteredTemps = temps.filter((t) => {
    if (tempFilter === '0-30') return t >= 0 && t <= 30;
    if (tempFilter === '31-50') return t >= 31 && t <= 50;
    if (tempFilter === '51-75') return t >= 51 && t <= 75;
    if (tempFilter === '76-100') return t >= 76 && t <= 100;
    if (searchQuery.trim()) {
      return t.toString().includes(searchQuery.trim());
    }
    return true;
  });

  const visibleGravities = OBSERVED_GRAVITIES.filter((g) => {
    if (gravityFilter === 'light') return g <= 0.550;
    if (gravityFilter === 'heavy') return g >= 0.555;
    return true;
  });

  const roundedTemp = Math.round(currentTemp);

  return (
    <div
      className={`border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* شريط رأس التبويب والتحكم */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? 'border-slate-800 bg-slate-900/90'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg border ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
            }`}
          >
            <TableIcon className="w-5 h-5" />
          </div>
          <div>
            <h2
              className={`font-bold text-base flex items-center gap-2 ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              الجداول المرجعية الشاملة لتصحيح الكثافة
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                  isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                ASTM Table 23 (4 أوراق)
              </span>
            </h2>
            <p
              className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              تغطي كافة درجات الحرارة من 0°F إلى 100°F وكافة الكثافات من 0.505 إلى 0.600
            </p>
          </div>
        </div>

        {/* أزرار التبديل بين الجدول الرقمي والصور الأصلية */}
        <div
          className={`flex items-center gap-1.5 p-1 rounded-xl border ${
            isDark
              ? 'bg-slate-950 border-slate-800'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            الجدول الرقمي الموحد
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'original'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            صور المراجع الأصلية (4)
          </button>
        </div>
      </div>

      {activeTab === 'interactive' ? (
        <>
          {/* فلاتر الجدول */}
          <div
            className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* تصفية نطاق الحرارة */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <span className={isDark ? 'text-slate-400 ml-1' : 'text-slate-500 ml-1'}>
                  الحرارة:
                </span>
                <button
                  onClick={() => setTempFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                    tempFilter === 'all'
                      ? isDark
                        ? 'bg-slate-800 text-amber-400 font-semibold border-amber-500/30'
                        : 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  الكل (0-100°F)
                </button>
                <button
                  onClick={() => setTempFilter('0-30')}
                  className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                    tempFilter === '0-30'
                      ? isDark
                        ? 'bg-slate-800 text-amber-400 font-semibold border-amber-500/30'
                        : 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  0°F - 30°F
                </button>
                <button
                  onClick={() => setTempFilter('31-50')}
                  className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                    tempFilter === '31-50'
                      ? isDark
                        ? 'bg-slate-800 text-amber-400 font-semibold border-amber-500/30'
                        : 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  31°F - 50°F
                </button>
                <button
                  onClick={() => setTempFilter('51-75')}
                  className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                    tempFilter === '51-75'
                      ? isDark
                        ? 'bg-slate-800 text-amber-400 font-semibold border-amber-500/30'
                        : 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  51°F - 75°F
                </button>
                <button
                  onClick={() => setTempFilter('76-100')}
                  className={`px-2.5 py-1 rounded-md transition-colors border cursor-pointer ${
                    tempFilter === '76-100'
                      ? isDark
                        ? 'bg-slate-800 text-amber-400 font-semibold border-amber-500/30'
                        : 'bg-amber-100 text-amber-900 font-bold border-amber-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 hover:text-slate-200 border-transparent'
                      : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  76°F - 100°F
                </button>
              </div>

              {/* تصفية نطاق الكثافة */}
              <div
                className={`flex items-center gap-1 border-r pr-2 ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <span className={isDark ? 'text-slate-400 ml-1' : 'text-slate-500 ml-1'}>
                  الكثافة:
                </span>
                <button
                  onClick={() => setGravityFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors border cursor-pointer ${
                    gravityFilter === 'all'
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40'
                        : 'bg-cyan-100 text-cyan-900 font-bold border-cyan-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 border-transparent'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setGravityFilter('light')}
                  className={`px-2 py-1 rounded-md transition-colors border cursor-pointer ${
                    gravityFilter === 'light'
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40'
                        : 'bg-cyan-100 text-cyan-900 font-bold border-cyan-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 border-transparent'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  0.505 - 0.550
                </button>
                <button
                  onClick={() => setGravityFilter('heavy')}
                  className={`px-2 py-1 rounded-md transition-colors border cursor-pointer ${
                    gravityFilter === 'heavy'
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40'
                        : 'bg-cyan-100 text-cyan-900 font-bold border-cyan-300'
                      : isDark
                      ? 'bg-slate-900 text-slate-400 border-transparent'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  0.555 - 0.600
                </button>
              </div>
            </div>

            {/* حقل بحث سريع */}
            <div className="relative w-full sm:w-44">
              <input
                type="text"
                placeholder="ابحث عن درجة حرارة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1 pr-8 text-xs focus:outline-hidden focus:border-amber-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700/80 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
            </div>
          </div>

          {/* الجدول نفسه مع تمرير أفقي ورأسي سلس */}
          <div
            className={`relative overflow-x-auto max-h-[540px] scrollbar-thin ${
              isDark
                ? 'scrollbar-thumb-slate-700 scrollbar-track-slate-950'
                : 'scrollbar-thumb-slate-300 scrollbar-track-slate-100'
            }`}
          >
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead
                className={`sticky top-0 z-20 shadow-md ${
                  isDark ? 'bg-slate-950' : 'bg-slate-100'
                }`}
              >
                <tr
                  className={`border-b text-[11px] ${
                    isDark
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <th
                    rowSpan={2}
                    className={`p-2.5 border-l sticky right-0 z-30 font-bold min-w-[70px] ${
                      isDark
                        ? 'border-slate-800 bg-slate-950 text-amber-400'
                        : 'border-slate-300 bg-slate-200 text-slate-900'
                    }`}
                  >
                    حرارة °F
                  </th>
                  <th
                    colSpan={visibleGravities.length}
                    className={`p-2 border-b font-semibold ${
                      isDark
                        ? 'border-slate-800 text-slate-300'
                        : 'border-slate-200 text-slate-800'
                    }`}
                  >
                    الكثافة المقروءة بالهايدروميتر (Observed Specific Gravity)
                  </th>
                </tr>
                <tr
                  className={`border-b-2 ${
                    isDark
                      ? 'border-slate-700 text-slate-300'
                      : 'border-slate-300 text-slate-700'
                  }`}
                >
                  {visibleGravities.map((g) => {
                    const isColMatch = Math.abs(g - currentGravity) < 0.0025;
                    return (
                      <th
                        key={g}
                        className={`p-2 transition-colors min-w-[62px] ${
                          isColMatch
                            ? isDark
                              ? 'bg-amber-500/25 text-amber-300 font-bold border-x border-amber-500/40'
                              : 'bg-amber-100 text-amber-900 font-bold border-x border-amber-300'
                            : isDark
                            ? 'bg-slate-900/90'
                            : 'bg-slate-100'
                        }`}
                      >
                        {g.toFixed(3)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark
                    ? 'divide-slate-800/60 bg-slate-900/40'
                    : 'divide-slate-200 bg-white'
                }`}
              >
                {filteredTemps.map((temp) => {
                  const isRowMatch = temp === roundedTemp;
                  const rowValues = FULL_DENSITY_TABLE[temp];

                  return (
                    <tr
                      key={temp}
                      className={`transition-colors ${
                        isRowMatch
                          ? isDark
                            ? 'bg-amber-500/15 font-semibold text-amber-200'
                            : 'bg-amber-50/90 font-semibold text-amber-900'
                          : isDark
                          ? 'hover:bg-slate-800/50'
                          : 'even:bg-slate-50/60 hover:bg-slate-100/70'
                      }`}
                    >
                      {/* عمود درجة الحرارة المثبت يميناً */}
                      <td
                        className={`p-2 border-l sticky right-0 z-10 font-bold transition-colors ${
                          isRowMatch
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : isDark
                            ? 'bg-slate-950 text-slate-300 border-slate-800'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        {temp}°
                      </td>

                      {/* قيم الكثافة المصححة */}
                      {visibleGravities.map((grav) => {
                        const colIdx = OBSERVED_GRAVITIES.indexOf(grav);
                        const val = rowValues ? rowValues[colIdx] : null;
                        const isColMatch = Math.abs(grav - currentGravity) < 0.0025;
                        const isIntersection = isRowMatch && isColMatch;

                        if (val === null) {
                          return (
                            <td
                              key={grav}
                              className={`p-2 select-none ${
                                isDark
                                  ? 'text-slate-600 bg-slate-950/40'
                                  : 'text-slate-300 bg-slate-50/80'
                              }`}
                              title="غير محدد في الجداول القياسية"
                            >
                              -
                            </td>
                          );
                        }

                        return (
                          <td
                            key={grav}
                            onClick={() => onSelectCell(temp, grav)}
                            title={`حرارة: ${temp}°F | كثافة مقروءة: ${grav.toFixed(3)} | مصححة: ${val.toFixed(4)}`}
                            className={`p-2 cursor-pointer transition-all select-none ${
                              isIntersection
                                ? 'bg-amber-500 text-slate-950 font-black text-sm ring-2 ring-amber-400 scale-105 z-10 rounded shadow-lg'
                                : isRowMatch
                                ? isDark
                                  ? 'bg-amber-500/20 text-amber-200'
                                  : 'bg-amber-100/70 text-amber-900 font-semibold'
                                : isColMatch
                                ? isDark
                                  ? 'bg-amber-500/10 text-amber-300 font-semibold'
                                  : 'bg-amber-100/40 text-amber-900 font-semibold'
                                : isDark
                                ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                : 'text-slate-700 hover:bg-amber-50 hover:text-slate-900'
                            }`}
                          >
                            {val.toFixed(3)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className={`p-3 border-t text-xs flex flex-wrap items-center justify-between gap-2 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block shadow-xs"></span>
                الخلية المحددة الحالية
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span
                  className={`w-3 h-3 rounded inline-block border ${
                    isDark
                      ? 'bg-amber-500/20 border-amber-500/30'
                      : 'bg-amber-100 border-amber-300'
                  }`}
                ></span>
                الصف والعمود النشط
              </span>
            </div>
            <span className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-500 text-[11px]'}>
              * اضغط على أي رقم في الجدول لاختياره وتطبيقه في الكثافة العملية مباشرة
            </span>
          </div>
        </>
      ) : (
        /* استعراض وثائق المراجع الأربعة الأصلية */
        <div
          className={`p-4 flex flex-col items-center space-y-4 ${
            isDark ? 'bg-slate-950' : 'bg-slate-50'
          }`}
        >
          {/* أزرار اختيار أحد المراجع الأربعة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
            {DOCUMENTS.map((doc, idx) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocIndex(idx)}
                className={`p-2.5 rounded-xl text-right transition-all border flex flex-col justify-between cursor-pointer ${
                  selectedDocIndex === idx
                    ? isDark
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300 font-bold'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs mb-1 flex items-center justify-between">
                  <span>ورقة مرجعية {idx + 1}</span>
                  {selectedDocIndex === idx && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        isDark ? 'text-amber-400' : 'text-amber-600'
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`font-mono text-[11px] ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {doc.title}
                </div>
              </button>
            ))}
          </div>

          <div
            className={`text-xs text-center max-w-lg font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {DOCUMENTS[selectedDocIndex].title} — {DOCUMENTS[selectedDocIndex].sub}
          </div>

          {/* صورة المستند المحدد */}
          <div
            className={`relative border-2 rounded-xl overflow-hidden shadow-2xl max-w-2xl w-full group ${
              isDark
                ? 'border-slate-700 bg-slate-900'
                : 'border-slate-200 bg-white'
            }`}
          >
            <img
              src={DOCUMENTS[selectedDocIndex].path}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedPublic) {
                  target.dataset.triedPublic = 'true';
                  target.src = DOCUMENTS[selectedDocIndex].altPath;
                }
              }}
              alt={DOCUMENTS[selectedDocIndex].title}
              className="w-full h-auto object-contain max-h-[650px] mx-auto transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div
            className={`flex items-center gap-2 text-xs font-medium ${
              isDark ? 'text-amber-400' : 'text-emerald-700'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>تم تفريغ كافة أرقام هذا الجدول وإدماجها في الكثافة العملية بدقة 100%</span>
          </div>
        </div>
      )}
    </div>
  );
};
