
import React, { useState, useMemo } from 'react';
import { DailyReport } from '../types';

interface ReportListProps {
  reports: DailyReport[];
  onViewDetail: (report: DailyReport) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');

  // Get unique staff list for filter
  const staffList = useMemo(() => {
    const list = Array.from(new Set(reports.map(r => r.staffName)));
    return list.sort();
  }, [reports]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.workContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.date.includes(searchTerm) ||
                          report.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaff = staffFilter === 'all' || report.staffName === staffFilter;
    
    return matchesSearch && matchesStaff;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              type="text"
              placeholder="スタッフ名、業務、日付で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
            >
              <option value="all">すべてのスタッフ</option>
              {staffList.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm self-start">
          <i className="fas fa-sort-amount-down"></i>
          <span>最新順</span>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-folder-open text-slate-300 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-600">日報が見つかりません</h3>
          <p className="text-slate-400">条件を変えて検索するか、最初の日報を投稿しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => onViewDetail(report)}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className={`px-3 py-2 rounded-xl text-center min-w-[70px] ${report.workType === 'flex' ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-bold uppercase leading-none ${report.workType === 'flex' ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {new Date(report.date).toLocaleDateString('ja-JP', { month: 'short' })}
                    </p>
                    <p className={`text-xl font-bold ${report.workType === 'flex' ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {new Date(report.date).getDate()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white bg-indigo-500 px-1.5 py-0.5 rounded uppercase">
                        {report.staffName}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {report.date}
                        {report.workType === 'flex' && (
                          <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded">FLEX</span>
                        )}
                      </h4>
                    </div>
                    
                    {/* Category Breakdown Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {report.categoryHours?.sns > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded border border-indigo-100">
                          SNS: {report.categoryHours.sns}h
                        </span>
                      )}
                      {report.categoryHours?.wix > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded border border-emerald-100">
                          Wix: {report.categoryHours.wix}h
                        </span>
                      )}
                      {report.categoryHours?.design > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-bold rounded border border-amber-100">
                          Design: {report.categoryHours.design}h
                        </span>
                      )}
                      {report.categoryHours?.other > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold rounded border border-slate-200">
                          Other: {report.categoryHours.other}h
                        </span>
                      )}
                    </div>

                    {report.workContent && (
                      <p className="text-sm text-slate-500 line-clamp-1 italic">
                        {report.workContent.split('\n').filter(line => line.trim()).slice(0, 1).join(' ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 self-end md:self-auto">
                   <div className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md whitespace-nowrap">
                     <i className="far fa-clock mr-1"></i> 合計 {report.workHours}
                   </div>
                   <button className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     <i className="fas fa-chevron-right"></i>
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
