
import React, { useState } from 'react';
import { DailyReport, AIAnalysis } from '../types';
import { geminiService } from '../services/geminiService';

interface ReportDetailProps {
  report: DailyReport;
  onBack: () => void;
  onEdit: (report: DailyReport) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack, onEdit }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await geminiService.analyzeReport(report.rawText);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report.rawText);
    alert('レポート内容をコピーしました！');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          <span>戻る</span>
        </button>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <button 
            onClick={() => onEdit(report)}
            className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 font-bold flex items-center space-x-2 transition-all whitespace-nowrap shadow-sm"
          >
            <i className="fas fa-edit"></i>
            <span>編集する</span>
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium flex items-center space-x-2 transition-all whitespace-nowrap"
          >
            <i className="far fa-copy"></i>
            <span>コピー</span>
          </button>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isAnalyzing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            <span>AI分析</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-400">REPORT CONTENT</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
              {report.rawText}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center">
              <i className="fas fa-info-circle text-indigo-500 mr-2"></i>
              提出情報
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">スタッフ名</p>
                <p className="text-sm font-bold text-slate-700">{report.staffName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">勤務形態</p>
                <p className="text-sm font-semibold text-slate-700">
                  {report.workType === 'flex' ? (
                    <span className="text-indigo-600 flex items-center"><i className="fas fa-bolt mr-1"></i> フレックス</span>
                  ) : (
                    <span className="text-slate-600 flex items-center"><i className="fas fa-clock mr-1"></i> 通常勤務</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">提出日時</p>
                <p className="text-sm text-slate-600">{report.submittedAt}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">対象日</p>
                <p className="text-sm text-slate-800 font-bold">{report.date}</p>
              </div>
            </div>
          </div>

          {analysis ? (
            <div className={`p-6 rounded-2xl border shadow-sm transition-all animate-slideUp ${
              analysis.sentiment === 'positive' ? 'bg-emerald-50 border-emerald-100' :
              analysis.sentiment === 'concerned' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <i className={`fas ${
                  analysis.sentiment === 'positive' ? 'fa-smile text-emerald-500' :
                  analysis.sentiment === 'concerned' ? 'fa-exclamation-triangle text-amber-500' : 'fa-brain text-indigo-500'
                } text-xl`}></i>
                <h4 className="font-bold text-slate-800">AIフィードバック</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">要約</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">アドバイス</p>
                  <ul className="mt-2 space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start">
                        <span className="mr-2 text-indigo-400">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
              <p className="text-sm text-slate-400">AI分析を実行すると、ここにアドバイスが表示されます。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
