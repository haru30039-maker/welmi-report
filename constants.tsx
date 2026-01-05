
import React from 'react';

export const STORAGE_KEYS = {
  REPORTS: 'smart_nippo_reports',
  SETTINGS: 'smart_nippo_settings',
  STAFFS: 'smart_nippo_staffs'
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'ダッシュボード', icon: <i className="fas fa-chart-line"></i> },
  { id: 'new', label: '日報作成', icon: <i className="fas fa-pen-nib"></i> },
  { id: 'history', label: '履歴一覧', icon: <i className="fas fa-history"></i> },
  { id: 'staff', label: 'スタッフ管理', icon: <i className="fas fa-user-tie"></i> },
  { id: 'export', label: 'CSV出力', icon: <i className="fas fa-file-csv"></i> },
  { id: 'settings', label: '設定', icon: <i className="fas fa-cog"></i> },
];

export const DEFAULT_TEMPLATE = `━━━━━━━━━━━━━━━━━━━━━━
業務日報
━━━━━━━━━━━━━━━━━━━━━━

【日付】{{date}}

【稼働時間】{{workHours}}

━━━━━━━━━━━━━━━━━━━━━━
【本日の業務内容】
━━━━━━━━━━━━━━━━━━━━━━

{{workContent}}

━━━━━━━━━━━━━━━━━━━━━━
【学んだこと・気づいたこと】
━━━━━━━━━━━━━━━━━━━━━━

{{learnings}}

━━━━━━━━━━━━━━━━━━━━━━
【困っていること・質問】
━━━━━━━━━━━━━━━━━━━━━━

{{issues}}

━━━━━━━━━━━━━━━━━━━━━━
【明日の予定】
━━━━━━━━━━━━━━━━━━━━━━

{{tomorrowSchedule}}

━━━━━━━━━━━━━━━━━━━━━━`;
