import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { ComplaintTable } from '../components/ComplaintTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

export function AdminDashboard() {
  const { 
    fetchAdminComplaints, 
    fetchReportsSummary, 
    updateComplaintStatus,
    statusList,
    language,
    getCategoryLabel
  } = useApp();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  const [summary, setSummary] = useState({
    total: 0,
    pendingReview: 0,
    inProgress: 0,
    resolved: 0,
    byStatus: {},
    byCategory: {},
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Modal State
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState('In Progress');
  const [statusReason, setStatusReason] = useState('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, complaintsData] = await Promise.all([
        fetchReportsSummary(),
        fetchAdminComplaints({ limit: 8 }),
      ]);
      setSummary(sumData);
      setRecentComplaints(complaintsData.complaints || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data from database.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsSummary, fetchAdminComplaints]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleConfirmStatusChange = async () => {
    if (!activeComplaint) return;
    try {
      const docId = activeComplaint._id || activeComplaint.id;
      await updateComplaintStatus(docId, selectedNewStatus, statusReason);
      setStatusModalOpen(false);
      setActiveComplaint(null);
      setStatusReason('');
      await loadDashboardData();
    } catch (err) {
      alert(err.message || 'Status change failed.');
    }
  };

  return (
    <div>
      {/* Title & Refresh Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
            {isNe ? 'प्रशासनिक ड्यासबोर्ड' : 'Administrative Dashboard'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? 'सोच कलेज अफ आईटी, पोखराका प्राविधिक उजुरीहरूको वास्तविक डाटाबेस स्थिति र कार्यभार'
              : 'Live database operational overview for campus IT grievances and support triage'}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          className="btn btn-secondary btn-sm"
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh Data'}</span>
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '6px',
          color: '#B91C1C',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards with Real MongoDB Data */}
      <div className="stat-cards-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <StatCard
          label={isNe ? 'कुल उजुरी' : 'Total Filed'}
          value={summary.total}
          icon={FileText}
          color="blue"
          helper={isNe ? 'डाटाबेसमा सुरक्षित' : 'Saved in MongoDB'}
        />
        <StatCard
          label={isNe ? 'समीक्षा बाँकी' : 'Pending Review'}
          value={summary.pendingReview}
          icon={Clock}
          color="amber"
          helper={isNe ? 'जाँच तथा कार्यभार बाँकी' : 'Awaiting admin triage'}
        />
        <StatCard
          label={isNe ? 'कार्यान्वयनमा' : 'In Progress'}
          value={summary.inProgress}
          icon={Wrench}
          color="teal"
          helper={isNe ? 'प्राविधिक कार्य जारी' : 'Under active resolution'}
        />
        <StatCard
          label={isNe ? 'समाधान भएको' : 'Resolved'}
          value={summary.resolved}
          icon={CheckCircle2}
          color="emerald"
          helper={isNe ? 'सम्पन्न' : 'Verified and closed'}
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'भर्खरै दर्ता भएका उजुरीहरू' : 'Recent Grievance Submissions'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '2px 0 0' }}>
              {isNe ? 'पछिल्लो समय डाटाबेसमा दर्ता गरिएका विद्यार्थी उजुरीहरू' : 'Latest student complaints recorded in MongoDB'}
            </p>
          </div>

          <Link to="/admin/complaints" className="btn btn-secondary btn-sm">
            <span>{isNe ? 'सबै उजुरी सूची हेर्नुहोस्' : 'View Full Queue'}</span>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            {isNe ? 'डाटाबेसबाट विवरण लोड गरिँदैछ...' : 'Loading records from MongoDB...'}
          </div>
        ) : (
          <ComplaintTable
            complaints={recentComplaints}
            role="admin"
            showStudentInfo={true}
            onActionClick={(item) => navigate(`/admin/complaints/${item._id || item.id}`)}
            actionButtonLabel={isNe ? 'समीक्षा' : 'Inspect'}
          />
        )}
      </div>

      {/* Status Modal */}
      {statusModalOpen && activeComplaint && (
        <ConfirmationModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleConfirmStatusChange}
          title={`${isNe ? 'स्थिति परिवर्तन' : 'Update Status'} — ${activeComplaint.reference || activeComplaint.id}`}
          message={isNe
            ? `उजुरी "${activeComplaint.title}" को नयाँ स्थिति चयन गर्नुहोस्:`
            : `Select target status for "${activeComplaint.title}":`}
          confirmText={isNe ? 'अद्यावधिक गर्नुहोस्' : 'Update Status'}
          confirmVariant="primary"
          showSelect={true}
          selectLabel={isNe ? 'नयाँ स्थिति:' : 'Target Status:'}
          selectOptions={statusList.map((st) => ({ label: st, value: st }))}
          selectValue={selectedNewStatus}
          onSelectChange={setSelectedNewStatus}
          showNoteInput={true}
          noteLabel={isNe ? 'प्रशासनिक टिप्पणी:' : 'Audit Note:'}
          notePlaceholder="e.g. Technician dispatched to inspect lab."
          noteValue={statusReason}
          onNoteChange={setStatusReason}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
