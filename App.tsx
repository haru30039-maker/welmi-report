
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import ExportCSV from './components/ExportCSV';
import Settings from './components/Settings';
import StaffManagement from './components/StaffManagement';
import { storageService } from './services/storageService';
import { DailyReport } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [preSelectedStaff, setPreSelectedStaff] = useState<string | undefined>(undefined);

  useEffect(() => {
    setReports(storageService.getReports());
  }, []);

  const refreshReports = () => {
    setReports(storageService.getReports());
  };

  const handleReportSubmitSuccess = () => {
    refreshReports();
    setActiveTab('history');
    setPreSelectedStaff(undefined);
    setEditingReport(null);
  };

  const navigateToReportDetail = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setActiveTab('history');
    }
  };

  const navigateToNewWithStaff = (staffName: string) => {
    setPreSelectedStaff(staffName);
    setActiveTab('new');
    setSelectedReport(null);
    setEditingReport(null);
  };

  const handleEditReport = (report: DailyReport) => {
    setEditingReport(report);
    setSelectedReport(null);
    setActiveTab('new');
  };

  const renderContent = () => {
    if (selectedReport) {
      return (
        <ReportDetail 
          report={selectedReport} 
          onBack={() => setSelectedReport(null)} 
          onEdit={handleEditReport}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            reports={reports} 
            onNavigateToReport={navigateToReportDetail}
            onNavigateToNewWithStaff={navigateToNewWithStaff}
          />
        );
      case 'new':
        return (
          <ReportForm 
            onSuccess={handleReportSubmitSuccess} 
            preSelectedStaff={preSelectedStaff} 
            editingReport={editingReport}
          />
        );
      case 'history':
        return (
          <ReportList 
            reports={reports} 
            onViewDetail={(report) => setSelectedReport(report)} 
          />
        );
      case 'staff':
        return <StaffManagement />;
      case 'export':
        return <ExportCSV reports={reports} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard reports={reports} onNavigateToReport={navigateToReportDetail} onNavigateToNewWithStaff={navigateToNewWithStaff} />;
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedReport(null);
    setEditingReport(null);
    setPreSelectedStaff(undefined);
    setActiveTab(tab);
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}
    </Layout>
  );
};

export default App;
