
import React, { useMemo, useState, useEffect } from 'react';
import { DailyReport, Staff } from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { storageService } from '../services/storageService';

interface DashboardProps {
  reports: DailyReport[];
  onNavigateToReport: (reportId: string) => void;
  onNavigateToNewWithStaff: (staffName: string) => void;
}

const COLORS = {
  sns: '#6366f1',    // Indigo
  wix: '#10b981',    // Emerald
  design: '#f59e0b', // Amber
  other: '#94a3b8'   // Slate
};

const MONTHLY_TARGET_HOURS = 160;

const Dashboard: React.FC<DashboardProps> = ({ reports, onNavigateToReport, onNavigateToNewWithStaff }) => {
  // 表示対象の月を管理 (デフォルトは現在)
  const [viewDate, setViewDate] = useState(new Date());
  const [pieMode, setPieMode] = useState<'7days' | 'monthly'>('monthly');
  const [selectedStaffForPie, setSelectedStaffForPie] = useState<string>('all');
  const [registeredStaffs, setRegisteredStaffs] = useState<Staff[]>([]);

  useEffect(() => {
    setRegisteredStaffs(storageService.getStaffs());
  }, []);

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setViewDate(new Date());
  };

  const stats = useMemo(() => {
    const targetMonth = viewDate.getMonth();
    const targetYear = viewDate.getFullYear();
    const actualTodayStr = new Date().toISOString().split('T')[0];

    // 直近7日間の計算（表示月ではなく、常に実際の本日から遡る）
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    // Staff Aggregation
    const staffMap: Record<string, { name: string, totalHours: number, lastDate: string, todayReportId: string | null, color: string }> = {};
    
    registeredStaffs.forEach((s) => {
      staffMap[s.name] = { name: s.name, totalHours: 0, lastDate: '-', todayReportId: null, color: s.color || 'bg-indigo-400' };
    });

    reports.forEach(r => {
      const d = new Date(r.date);
      const isTargetMonth = d.getMonth() === targetMonth && d.getFullYear() === targetYear;

      // スタッフが登録済みリストにない場合（名前変更前など）も集計対象にする
      if (!staffMap[r.staffName]) {
        staffMap[r.staffName] = { name: r.staffName, totalHours: 0, lastDate: r.date, todayReportId: null, color: 'bg-slate-400' };
      }
      
      // 選択された月の稼働を集計
      if (isTargetMonth) {
        const hours = (Number(r.categoryHours?.sns) || 0) + (Number(r.categoryHours?.wix) || 0) + (Number(r.categoryHours?.design) || 0) + (Number(r.categoryHours?.other) || 0);
        staffMap[r.staffName].totalHours += hours;

        if (r.date > staffMap[r.staffName].lastDate || staffMap[r.staffName].lastDate === '-') {
          staffMap[r.staffName].lastDate = r.date;
        }
      }
      
      // 「今日の日報」判定は常に実際の今日と比較
      if (r.date === actualTodayStr) {
        staffMap[r.staffName].todayReportId = r.id;
      }
    });

    const staffList = Object.values(staffMap).sort((a, b) => b.totalHours - a.totalHours);

    // Category Aggregation
    const categoryTargetHours = { sns: 0, wix: 0, design: 0, other: 0 };

    reports.forEach(r => {
      if (selectedStaffForPie !== 'all' && r.staffName !== selectedStaffForPie) return;

      const d = new Date(r.date);
      const isTargetMonth = d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      const isRecent = last7Days.includes(r.date);
      
      const sns = Number(r.categoryHours?.sns) || 0;
      const wix = Number(r.categoryHours?.wix) || 0;
      const design = Number(r.categoryHours?.design) || 0;
      const other = Number(r.categoryHours?.other) || 0;

      if (pieMode === 'monthly' && isTargetMonth) {
        categoryTargetHours.sns += sns;
        categoryTargetHours.wix += wix;
        categoryTargetHours.design += design;
        categoryTargetHours.other += other;
      } else if (pieMode === '7days' && isRecent) {
        categoryTargetHours.sns += sns;
        categoryTargetHours.wix += wix;
        categoryTargetHours.design += design;
        categoryTargetHours.other += other;
      }
    });

    const pieData = [
      { name: 'SNS運用', value: categoryTargetHours.sns, color: COLORS.sns },
      { name: 'Wix実装', value: categoryTargetHours.wix, color: COLORS.wix },
      { name: 'デザイン', value: categoryTargetHours.design, color: COLORS.design },
      { name: 'その他', value: categoryTargetHours.other, color: COLORS.other },
    ].filter(d => d.value > 0);

    return { pieData, staffList };
  }, [reports, pieMode, selectedStaffForPie, registeredStaffs, viewDate]);

  const viewMonthStr = `${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`;
  const isActualCurrentMonth = new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="px-4 py-1 text-center min-w-[140px]">
            <span className="text-lg font-black text-slate-800 tracking-tight">{viewMonthStr}</span>
          </div>
          <button 
            onClick={handleNextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <button 
          onClick={handleCurrentMonth}
          disabled={isActualCurrentMonth}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isActualCurrentMonth 
            ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-sm'
          }`}
        >
          今月に戻る
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center">
              <i className="fas fa-user-friends text-indigo-500 mr-2"></i> 
              スタッフ稼働状況 ({viewDate.getMonth() + 1}月)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
              目標: {MONTHLY_TARGET_HOURS}h / 月
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="px-6 py-3">スタッフ</th>
                  <th className="px-6 py-3">今日の日報</th>
                  <th className="px-6 py-3">月間累計</th>
                  <th className="px-6 py-3">進捗</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.staffList.map((staff) => {
                  const progress = Math.min(100, (staff.totalHours / MONTHLY_TARGET_HOURS) * 100);
                  return (
                    <tr key={staff.name} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${staff.color}`}>{staff.name.charAt(0)}</div>
                          <span className="text-sm font-bold text-slate-700">{staff.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {staff.todayReportId ? (
                          <button 
                            onClick={() => onNavigateToReport(staff.todayReportId!)}
                            className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                          >
                            <i className="fas fa-check mr-1"></i> 提出済
                          </button>
                        ) : (
                          <button 
                            onClick={() => onNavigateToNewWithStaff(staff.name)}
                            className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                              isActualCurrentMonth 
                              ? 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'
                              : 'bg-slate-50 text-slate-300 opacity-50 cursor-default'
                            }`}
                            disabled={!isActualCurrentMonth}
                          >
                            未提出
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-800">{staff.totalHours} <span className="text-[10px] font-normal text-slate-400">h</span></span>
                      </td>
                      <td className="px-6 py-4 min-w-[120px]">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : progress > 80 ? 'bg-indigo-400' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {stats.staffList.length === 0 && (
                  <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">この月のデータはありません</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[440px]">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800">業務配分分析</h3>
              <div className="flex p-0.5 bg-slate-100 rounded-lg">
                <button onClick={() => setPieMode('7days')} className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${pieMode === '7days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>7日</button>
                <button onClick={() => setPieMode('monthly')} className={`px-2 py-1 rounded-md text-[9px] font-black transition-all ${pieMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>選択月</button>
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={selectedStaffForPie}
                onChange={(e) => setSelectedStaffForPie(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                <option value="all">チーム全体</option>
                {registeredStaffs.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <i className="fas fa-chevron-down text-[10px]"></i>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {stats.pieData.length > 0 ? (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats.pieData} 
                      cx="50%" 
                      cy="45%" 
                      innerRadius={55} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {stats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(v) => `${v}h`} 
                      contentStyle={{ fontSize: '12px', borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                    />
                    <Legend 
                      iconType="circle" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 text-xs italic space-y-2">
                <i className="fas fa-chart-pie text-2xl opacity-20"></i>
                <p>対象データの集計なし</p>
                <p className="text-[10px] mt-1 not-italic">({pieMode === 'monthly' ? `${viewDate.getMonth() + 1}月分` : '直近7日分'})</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
