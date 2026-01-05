
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_TEMPLATE } from '../constants';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleResetTemplate = () => {
    if (window.confirm('テンプレートをデフォルトに戻しますか？')) {
      setSettings(prev => ({ ...prev, reportTemplate: DEFAULT_TEMPLATE }));
    }
  };

  const handleSave = () => {
    storageService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">基本設定</h3>
          <p className="text-sm text-slate-500">日報作成時のデフォルト設定や通知先を管理します。</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">デフォルトの稼働時間（通常）</label>
            <input
              type="text"
              name="defaultWorkHours"
              value={settings.defaultWorkHours}
              onChange={handleChange}
              placeholder="例: 8時間（9:00〜18:00、休憩1時間）"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <p className="text-[10px] text-slate-400">作成時の初期値として入力されます。</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">通知用メールアドレス</label>
            <input
              type="email"
              name="emailRecipient"
              value={settings.emailRecipient}
              onChange={handleChange}
              placeholder="例: boss@example.com"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-emerald-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-emerald-800">日報テンプレート編集</h3>
              <p className="text-sm text-emerald-600/70">出力されるテキストのフォーマットをカスタマイズします。</p>
            </div>
            <button 
              onClick={handleResetTemplate}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full transition-colors"
            >
              デフォルトに戻す
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">テンプレート内容</label>
            <textarea
              name="reportTemplate"
              rows={12}
              value={settings.reportTemplate}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
              placeholder="テンプレートを入力してください..."
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center">
              <i className="fas fa-tags mr-1"></i> 使用可能なプレースホルダー
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                { key: '{{date}}', label: '対象日付' },
                { key: '{{workHours}}', label: '稼働時間' },
                { key: '{{workContent}}', label: '業務内容' },
                { key: '{{learnings}}', label: '学んだこと' },
                { key: '{{issues}}', label: '課題/質問' },
                { key: '{{tomorrowSchedule}}', label: '明日の予定' },
              ].map(item => (
                <div key={item.key} className="flex items-center text-[11px]">
                  <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded mr-2">{item.key}</code>
                  <span className="text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        {saved && (
          <span className="text-emerald-500 text-sm font-bold flex items-center">
            <i className="fas fa-check-circle mr-1"></i> 保存しました
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          設定を保存する
        </button>
      </div>
    </div>
  );
};

export default Settings;
