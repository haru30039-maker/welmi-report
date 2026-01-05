
import React, { useState, useMemo } from 'react';
import { DailyReport } from '../types';

interface ExportCSVProps {
  reports: DailyReport[];
}

const ExportCSV: React.FC<ExportCSVProps> = ({ reports }) => {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => r.date >= startDate && r.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, startDate, endDate]);

  const handleDownload = () => {
    if (filteredReports.length === 0) {
      alert('対象期間のデータがありません。');
      return;
    }

    const headers = [
      '日付', '提出日時', 'スタッフ名', '勤務形態', '稼働時間', 
      'SNS時間(h)', 'Wix時間(h)', 'デザイン時間(h)', 'その他時間(h)',
      '業務内容', '学んだこと', '困っていること', '明日の予定'
    ];
    
    const rows = filteredReports.map(r => [
      r.date,
      r.submittedAt,
      r.staffName,
      r.workType === 'flex' ? 'フレックス' : '通常勤務',
      r.workHours,
      r.categoryHours?.sns || 0,
      r.categoryHours?.wix || 0,
      r.categoryHours?.design || 0,
      r.categoryHours?.other || 0,
      r.workContent.replace(/"/g, '""'),
      r.learnings.replace(/"/g, '""'),
      r.issues.replace(/"/g, '""'),
      r.tomorrowSchedule.replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `daily_reports_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <i className="fas fa-calendar-alt text-indigo-500 mr-2"></i>
          出力期間の指定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">開始日</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">終了日</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleDownload}
            className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
          >
            <i className="fas fa-download"></i>
            <span>CSVをダウンロード</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h4 className="font-bold text-slate-800">
            出力対象プレビュー 
            <span className="ml-2 text-sm font-normal text-slate-500">({filteredReports.length}件)</span>
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3 border-b border-slate-100">日付</th>
                <th className="px-6 py-3 border-b border-slate-100">勤務</th>
                <th className="px-6 py-3 border-b border-slate-100">時間配分(h)</th>
                <th className="px-6 py-3 border-b border-slate-100">業務概要</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length > 0 ? (
                filteredReports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">{r.date}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      <span className={`px-2 py-0.5 rounded font-bold ${r.workType === 'flex' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                        {r.workType === 'flex' ? 'FLEX' : 'STD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-600 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className="text-indigo-600">S:{r.categoryHours?.sns || 0}</span>
                        <span className="text-emerald-600">W:{r.categoryHours?.wix || 0}</span>
                        <span className="text-amber-600">D:{r.categoryHours?.design || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">
                      {r.workContent.split('\n')[0] || '---'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    対象期間内に日報データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportCSV;
