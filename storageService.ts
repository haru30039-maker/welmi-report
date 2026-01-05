
import { DailyReport, AppSettings, Staff } from '../types';
import { STORAGE_KEYS, DEFAULT_TEMPLATE } from '../constants';

export const storageService = {
  getReports: (): DailyReport[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return data ? JSON.parse(data) : [];
  },

  saveReport: (report: DailyReport) => {
    const reports = storageService.getReports();
    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  },

  updateReport: (updatedReport: DailyReport) => {
    const reports = storageService.getReports();
    const index = reports.findIndex(r => r.id === updatedReport.id);
    if (index !== -1) {
      reports[index] = updatedReport;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    }
  },

  getStaffs: (): Staff[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STAFFS);
    return data ? JSON.parse(data) : [];
  },

  saveStaffs: (staffs: Staff[]) => {
    localStorage.setItem(STORAGE_KEYS.STAFFS, JSON.stringify(staffs));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : {};
    return {
      staffName: parsed.staffName || '',
      webhookUrl: parsed.webhookUrl || '',
      emailRecipient: parsed.emailRecipient || '',
      reportTemplate: parsed.reportTemplate || DEFAULT_TEMPLATE,
      defaultWorkHours: parsed.defaultWorkHours || '8時間（9:00〜18:00、休憩1時間）'
    };
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
