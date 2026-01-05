
import { DailyReport, AppSettings } from '../types';

export const externalService = {
  triggerWebhook: async (report: DailyReport, settings: AppSettings) => {
    if (!settings.webhookUrl) {
      console.warn("Webhook URL not configured. Skipping external integration.");
      return false;
    }

    try {
      // Typically used with Google Apps Script or Make/Zapier
      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Common for GAS webhooks
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'daily_report',
          timestamp: new Date().toISOString(),
          staff: settings.staffName,
          email: settings.emailRecipient,
          report: report
        }),
      });
      return true;
    } catch (error) {
      console.error("Webhook trigger failed:", error);
      return false;
    }
  }
};
