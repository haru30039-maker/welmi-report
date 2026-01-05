
import React, { useState, useEffect, useMemo } from 'react';
import { DailyReport, AppSettings, Staff } from '../types';
import { storageService } from '../services/storageService';

interface ReportFormProps {
  onSuccess: () => void;
  preSelectedStaff?: string;
  editingReport?: DailyReport | null;
}

const CATEGORY_LABELS = {
  sns: 'SNS運用',
  wix: 'Wix実装',
  design: 'デザイン',
  other: 'その他'
};

const ReportForm: React.FC<ReportFormProps> = ({ onSuccess, preSelectedStaff, editingReport }) => {
  const [settings] = useState<AppSettings>(storageService.getSettings());
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [workType, setWorkType] = useState<'standard' | 'flex'>(editingReport?.workType || 'standard');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    staffName: editingReport?.staffName || preSelectedStaff || '',
    date: editingReport?.date || new Date().toISOString().split('T')[0],
    workHours: editingReport?.workHours || settings.defaultWorkHours,
    flexDetails: {
      total: editingReport?.workType === 'flex' ? editingReport.workHours.split('h')[0] : '8.0',
      start: '10:00',
      end: '19:00',
      core: '11:00〜15:00',
      break: '1.0' 
    },
    categories: {
      sns: { text: editingReport?.categoryTexts?.sns || '', hours: editingReport?.categoryHours?.sns || 0 },
      wix: { text: editingReport?.categoryTexts?.wix || '', hours: editingReport?.categoryHours?.wix || 0 },
      design: { text: editingReport?.categoryTexts?.design || '', hours: editingReport?.categoryHours?.design || 0 },
      other: { text: editingReport?.categoryTexts?.other || '', hours: editingReport?.categoryHours?.other || 0 }
    },
    learnings: editingReport?.learnings || '',
    issues: editingReport?.issues || '',
    tomorrowSchedule: editingReport?.tomorrowSchedule || ''
  });

  useEffect(() => {
    const list = storageService.getStaffs();
    setStaffs(list);
    if (!formData.staffName && list.length > 0) {
      setFormData(prev => ({ ...prev, staffName: list[0].name }));
    }
  }, []);

  // Automatic calculation for Flex Total
  useEffect(() => {
    if (workType === 'flex') {
      const { start, end, break: breakTime } = formData.flexDetails;
      if (start && end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        
        const startTotalMin = startH * 60 + startM;
        const endTotalMin = endH * 60 + endM;
        
        let diffMin = endTotalMin - startTotalMin;
        if (diffMin < 0) diffMin += 24 * 60; 

        const breakMin = parseFloat(breakTime || '0') * 60;
        const actualWorkMin = Math.max(0, diffMin - breakMin);
        const actualWorkHours = (actualWorkMin / 60).toFixed(1);

        setFormData(prev => ({
          ...prev,
          flexDetails: { ...prev.flexDetails, total: actualWorkHours }
        }));
      }
    }
  }, [formData.flexDetails.start, formData.flexDetails.end, formData.flexDetails.break, workType]);

  // Derive target total hours for validation
  const targetTotalHours = useMemo(() => {
    if (workType === 'flex') {
      return parseFloat(formData.flexDetails.total) || 0;
    } else {
      // Extract number from standard strings like "8時間..."
      const match = formData.workHours.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    }
  }, [workType, formData.flexDetails.total, formData.workHours]);

  // Derive current category total hours
  const currentCategoryTotal = useMemo(() => {
    return Object.values(formData.categories).reduce((sum, cat) => sum + (Number(cat.hours) || 0), 0);
  }, [formData.categories]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const handleCategoryChange = (cat: keyof typeof CATEGORY_LABELS, field: 'text' | 'hours', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [cat]: { ...prev.categories[cat], [field]: value }
      }
    }));
    setValidationError(null);
  };

  const handleFlexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      flexDetails: { ...prev.flexDetails, [name]: value }
    }));
    setValidationError(null);
  };

  const generateReportText = () => {
    const dateObj = new Date(formData.date);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日（${dayNames[dateObj.getDay()]}）`;

    let hoursText = formData.workHours;
    if (workType === 'flex') {
      const f = formData.flexDetails;
      hoursText = `${f.total}時間（フレックス制：${f.start}〜${f.end}、コアタイム：${f.core}、休憩${f.break}時間）`;
    }

    const workContentParts = Object.entries(formData.categories)
      .filter(([_, data]) => data.text.trim() !== '')
      .map(([key, data]) => {
        const label = CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS];
        const timeTag = data.hours > 0 ? ` [${data.hours}h]` : '';
        return `■${label}${timeTag}\n${data.text.trim()}`;
      });
    
    const workContent = workContentParts.join('\n\n');
    const template = settings.reportTemplate;

    return template
      .replace('{{date}}', formattedDate)
      .replace('{{workHours}}', hoursText)
      .replace('{{workContent}}', workContent || '特になし')
      .replace('{{learnings}}', formData.learnings || '特になし')
      .replace('{{issues}}', formData.issues || '特になし')
      .replace('{{tomorrowSchedule}}', formData.tomorrowSchedule || '特になし');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffName) {
      alert('スタッフを選択してください。');
      return;
    }

    // Validation: Total category hours must match target work hours
    if (Math.abs(currentCategoryTotal - targetTotalHours) > 0.01) {
      setValidationError(`稼働時間の不整合: カテゴリ合計 (${currentCategoryTotal}h) が今日の総稼働時間 (${targetTotalHours}h) と一致しません。内容を確認して再入力してください。`);
      return;
    }

    setIsSubmitting(true);

    const reportText = generateReportText();
    const catHours = {
      sns: Number(formData.categories.sns.hours),
      wix: Number(formData.categories.wix.hours),
      design: Number(formData.categories.design.hours),
      other: Number(formData.categories.other.hours),
    };
    const catTexts = {
      sns: formData.categories.sns.text,
      wix: formData.categories.wix.text,
      design: formData.categories.design.text,
      other: formData.categories.other.text,
    };

    const updatedReport: DailyReport = {
      id: editingReport?.id || crypto.randomUUID(),
      createdAt: editingReport?.createdAt || new Date().toISOString(),
      submittedAt: editingReport?.submittedAt || new Date().toLocaleString('ja-JP'),
      staffName: formData.staffName,
      date: formData.date,
      workType: workType,
      workHours: workType === 'flex' 
        ? `${formData.flexDetails.total}h (Flex)` 
        : formData.workHours,
      categoryHours: catHours,
      categoryTexts: catTexts,
      workContent: reportText.split('【本日の業務内容】')[1]?.split('━━━━━━━━━━━━━━')[0]?.trim() || '',
      learnings: formData.learnings,
      issues: formData.issues,
      tomorrowSchedule: formData.tomorrowSchedule,
      rawText: reportText
    };

    if (editingReport) {
      storageService.updateReport(updatedReport);
    } else {
      storageService.saveReport(updatedReport);
    }
    
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{editingReport ? '日報を修正' : '日報を新規作成'}</h3>
          <p className="text-sm text-slate-500">業務内容を調整して保存してください。</p>
        </div>
        
        <div className="flex p-1 bg-slate-200 rounded-xl">
          <button type="button" onClick={() => { setWorkType('standard'); setValidationError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${workType === 'standard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>通常</button>
          <button type="button" onClick={() => { setWorkType('flex'); setValidationError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${workType === 'flex' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>フレックス</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">提出スタッフ</label>
            <select name="staffName" value={formData.staffName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white" required>
              <option value="">スタッフを選択してください</option>
              {staffs.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">対象日付</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
          </div>
        </div>

        {workType === 'flex' ? (
          <div className="space-y-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center">
                <i className="fas fa-info-circle mr-1.5"></i>
                フレックス勤務詳細設定
              </p>
              <span className="text-[10px] text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100">
                自動計算モード
              </span>
            </div>
            
            <div className="text-xs text-slate-600 mb-4 leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-50/50">
              <p className="font-bold text-indigo-600 mb-1">【フレックス制とは】</p>
              フレックスタイム制とは、コアタイム（必ず勤務しなければならない時間）を除き、始業・終業時刻をスタッフ自身が自由に決めることができる制度です。<br/>
              <span className="font-bold">入力方法：</span> 開始と終了、休憩時間を入力すると、本日の総稼働時間が算出されます。
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">開始時間</label>
                <input type="time" name="start" value={formData.flexDetails.start} onChange={handleFlexChange} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">終了時間</label>
                <input type="time" name="end" value={formData.flexDetails.end} onChange={handleFlexChange} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">コアタイム</label>
                <input type="text" name="core" placeholder="11:00〜15:00" value={formData.flexDetails.core} onChange={handleFlexChange} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">休憩時間 (h)</label>
                <input type="number" step="0.5" name="break" value={formData.flexDetails.break} onChange={handleFlexChange} className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-indigo-100/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">算出された本日の稼働合計:</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-indigo-600">{formData.flexDetails.total}</span>
                <span className="text-xs font-bold text-indigo-400">時間 (h)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">稼働時間（シフト選択）</label>
            <select name="workHours" value={formData.workHours} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white">
              <option value="8時間（9:00〜18:00、休憩1時間）">8時間（9:00〜18:00）</option>
              <option value="8時間（10:00〜19:00、休憩1時間）">8時間（10:00〜19:00）</option>
              <option value="7時間（10:00〜18:00、休憩1時間）">7時間（10:00〜18:00）</option>
              <option value="">カスタム入力...</option>
            </select>
            {!['8時間（9:00〜18:00、休憩1時間）', '8時間（10:00〜19:00、休憩1時間）', '7時間（10:00〜18:00、休憩1時間）'].includes(formData.workHours) && (
              <input type="text" name="workHours" value={formData.workHours} onChange={handleChange} className="w-full mt-2 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required placeholder="例: 4時間（13:00〜17:00）" />
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between border-l-4 border-indigo-500 pl-3">
            <label className="block text-sm font-bold text-slate-800">本日の業務内容（カテゴリ別）</label>
            <div className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center space-x-2 ${Math.abs(currentCategoryTotal - targetTotalHours) < 0.01 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <span>合計: {currentCategoryTotal}h / {targetTotalHours}h</span>
              <i className={`fas ${Math.abs(currentCategoryTotal - targetTotalHours) < 0.01 ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map(cat => (
              <div key={cat} className="group relative bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-indigo-300 focus-within:bg-white transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-700 flex items-center">
                    <i className={`fas fa-tag mr-2 ${cat === 'sns' ? 'text-indigo-500' : cat === 'wix' ? 'text-emerald-500' : cat === 'design' ? 'text-amber-500' : 'text-slate-400'}`}></i>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                    <input type="number" step="0.5" min="0" placeholder="0" value={formData.categories[cat].hours || ''} onChange={(e) => handleCategoryChange(cat, 'hours', e.target.value === '' ? 0 : Number(e.target.value))} className="w-12 text-sm text-center font-bold text-indigo-600 outline-none" />
                    <span className="text-[10px] font-bold text-slate-400">時間</span>
                  </div>
                </div>
                <textarea rows={2} placeholder={`${CATEGORY_LABELS[cat]}の内容を入力してください...`} value={formData.categories[cat].text} onChange={(e) => handleCategoryChange(cat, 'text', e.target.value)} className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">【学んだこと・気づいたこと】</label>
            <textarea name="learnings" rows={3} value={formData.learnings} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="本日得られた知見などを入力してください。" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">【困っていること・質問】</label>
            <textarea name="issues" rows={3} value={formData.issues} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="相談したいことや、解決中の課題を入力してください。" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">【明日の予定】</label>
          <textarea name="tomorrowSchedule" rows={2} value={formData.tomorrowSchedule} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" placeholder="明日の主要なタスクを入力してください。" />
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4 flex flex-col items-end">
          {validationError && (
            <div className="w-full bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 animate-shake">
              <i className="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
              <p className="text-sm font-bold text-amber-800">{validationError}</p>
            </div>
          )}
          
          <button type="submit" disabled={isSubmitting} className={`px-12 py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center space-x-2 active:translate-y-0 ${Math.abs(currentCategoryTotal - targetTotalHours) < 0.01 ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-80'}`}>
            {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            <span>{editingReport ? '修正を反映して保存' : '日報を提出して保存'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
