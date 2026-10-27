import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ComplaintTable } from '../components/ComplaintTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export function AdminComplaintsPage() {
  const {
    fetchAdminComplaints,
    fetchReportsSummary,
    updateComplaintStatus,
    statusList,
    language
  } = useApp();
  const navigate = useNavigate();
  const isNe = language === 'ne';

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pendingReview: 0, inProgress: 0, resolved: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick Status Modal
  const [selectedComp, setSelectedComp] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('In Progress');
  const [statusNote, setStatusNote] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, complaintsData] = await Promise.all([
        fetchReportsSummary(),
        fetchAdminComplaints({ limit: 50 }),
      ]);
      setSummary(sumData);
      setComplaints(complaintsData.complaints || []);
      if (complaintsData.pagination) {
        setPagination(complaintsData.pagination);
      }
    } catch (err) {
      console.error('Error loading complaints queue:', err);
      setError(err.message || 'Failed to load complaints from database.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsSummary, fetchAdminComplaints]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmStatus = async () => {
    if (!selectedComp) return;
    try {
      const docId = selectedComp._id || selectedComp.id;
      await updateComplaintStatus(docId, targetStatus, statusNote);
      setStatusModalOpen(false);
      setSelectedComp(null);
      setStatusNote('');
      await loadData();
    } catch (err) {
      alert(err.message || 'Status change failed.');
    }
  };

  return (
    <div>
      {/* Page Title & Stats Strip */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
            {isNe ? 'कलेज उजुरी व्यवस्थापन सूची' : 'Complaints Management Queue'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe ? 'डाटाबेसमा सुरक्षित विद्यार्थी उजुरीहरूको प्रत्यक्ष समीक्षा र स्थिति अद्यावधिक' : 'Inspect live student IT grievances, triage issues, and document technical resolutions'}
          </p>
        </div>

        {/* Quick Summary Badges & Refresh */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-muted)' }}>{isNe ? 'कुल' : 'Total'}: </span>
            <strong style={{ color: 'var(--color-heading)' }}>{summary.total}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-warning-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="var(--color-warning)" />
            <span style={{ color: 'var(--color-warning)' }}>{isNe ? 'बाँकी' : 'Pending'}: </span>
            <strong style={{ color: 'var(--color-warning)' }}>{summary.pendingReview}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-teal-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={12} color="var(--color-teal)" />
            <span style={{ color: 'var(--color-teal)' }}>{isNe ? 'कार्यान्वयनमा' : 'In-Progress'}: </span>
            <strong style={{ color: 'var(--color-teal)' }}>{summary.inProgress}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-success-border)', padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} color="var(--color-success)" />
            <span style={{ color: 'var(--color-success)' }}>{isNe ? 'समाधान' : 'Resolved'}: </span>
            <strong style={{ color: 'var(--color-success)' }}>{summary.resolved}</strong>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
            title="Reload from MongoDB"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा' : 'Refresh'}</span>
          </button>
        </div>
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

      {/* Main Filterable Table */}
      {isLoading ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
          {isNe ? 'डाटाबेसबाट उजुरीहरू लोड गरिँदैछ...' : 'Loading grievances from MongoDB...'}
        </div>
      ) : (
        <ComplaintTable
          complaints={complaints}
          role="admin"
          showStudentInfo={true}
          onActionClick={(item) => navigate(`/admin/complaints/${item._id || item.id}`)}
          actionButtonLabel={isNe ? 'समीक्षा' : 'Inspect'}
        />
      )}

      {/* Quick Status Modal */}
      {statusModalOpen && selectedComp && (
        <ConfirmationModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          onConfirm={handleConfirmStatus}
          title={`${isNe ? 'स्थिति परिवर्तन' : 'Update Status'} — ${selectedComp.reference || selectedComp.id}`}
          message={isNe
            ? `उजुरी "${selectedComp.title}" को नयाँ स्थिति चयन गर्नुहोस्:`
            : `Select target status for "${selectedComp.title}":`}
          confirmText={isNe ? 'अद्यावधिक गर्नुहोस्' : 'Update Status'}
          confirmVariant="primary"
          showSelect={true}
          selectLabel={isNe ? 'नयाँ स्थिति:' : 'Target Status:'}
          selectOptions={statusList.map((st) => ({ label: st, value: st }))}
          selectValue={targetStatus}
          onSelectChange={setTargetStatus}
          showNoteInput={true}
          noteLabel={isNe ? 'प्रशासनिक टिप्पणी:' : 'Administrative Audit Note:'}
          notePlaceholder="e.g. Technician dispatched; issue verified."
          noteValue={statusNote}
          onNoteChange={setStatusNote}
        />
      )}
    </div>
  );
}

export default AdminComplaintsPage;
