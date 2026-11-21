import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ComplaintTable } from '../components/ComplaintTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Clock,
  Wrench,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileText
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
  const [searchParams, setSearchParams] = useSearchParams();
  const isNe = language === 'ne';

  const urlStatus = searchParams.get('status') || 'ALL';
  const urlCategory = searchParams.get('category') || 'ALL';

  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({ total: 0, pendingReview: 0, inProgress: 0, resolved: 0 });
  const [, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
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

  const setStatusUrl = (st) => {
    const next = new URLSearchParams(searchParams);
    if (st === 'ALL') {
      next.delete('status');
    } else {
      next.set('status', st);
    }
    setSearchParams(next);
  };

  return (
    <div>
      {/* Page Title & Operational Stats Strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
              {isNe ? 'कलेज उजुरी व्यवस्थापन सूची' : 'Complaints Management Queue'}
            </h1>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '2px 8px',
              backgroundColor: '#EEF3FB',
              color: '#203B64',
              borderRadius: '9999px',
              border: '1px solid #D5E1F7'
            }}>
              Queue Live
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? 'डाटाबेसमा सुरक्षित विद्यार्थी उजुरीहरूको प्रत्यक्ष समीक्षा, ट्रिएज र प्राविधिक समाधान'
              : 'Inspect student IT grievances, triage pending tickets, assign technician dispatch, and record resolutions'}
          </p>
        </div>

        {/* Quick Summary Chips & Refresh */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Total Chip */}
          <button
            type="button"
            onClick={() => setStatusUrl('ALL')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: urlStatus === 'ALL' ? '#101D35' : '#FFFFFF',
              color: urlStatus === 'ALL' ? '#FFFFFF' : 'var(--color-heading)',
              border: urlStatus === 'ALL' ? '1px solid #101D35' : '1px solid var(--color-border)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={13} color={urlStatus === 'ALL' ? '#FFFFFF' : 'var(--color-muted)'} />
            <span>{isNe ? 'कुल' : 'Total'}:</span>
            <strong style={{ fontWeight: '700' }}>{summary.total}</strong>
          </button>

          {/* Pending Review Chip */}
          <button
            type="button"
            onClick={() => setStatusUrl('Under Review')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: urlStatus === 'Under Review' ? '#B45309' : '#FFFBEB',
              color: urlStatus === 'Under Review' ? '#FFFFFF' : '#B45309',
              border: '1px solid #FDE68A',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Clock size={13} />
            <span>{isNe ? 'समीक्षा बाँकी' : 'Pending'}:</span>
            <strong style={{ fontWeight: '700' }}>{summary.pendingReview}</strong>
          </button>

          {/* In Progress Chip */}
          <button
            type="button"
            onClick={() => setStatusUrl('In Progress')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: urlStatus === 'In Progress' ? '#5278C8' : '#EEF3FB',
              color: urlStatus === 'In Progress' ? '#FFFFFF' : '#203B64',
              border: '1px solid #D5E1F7',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Wrench size={13} />
            <span>{isNe ? 'कार्यान्वयनमा' : 'In Progress'}:</span>
            <strong style={{ fontWeight: '700' }}>{summary.inProgress}</strong>
          </button>

          {/* Resolved Chip */}
          <button
            type="button"
            onClick={() => setStatusUrl('Resolved')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: urlStatus === 'Resolved' ? '#15803D' : '#F0FDF4',
              color: urlStatus === 'Resolved' ? '#FFFFFF' : '#15803D',
              border: '1px solid #BBF7D0',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={13} />
            <span>{isNe ? 'समाधान' : 'Resolved'}:</span>
            <strong style={{ fontWeight: '700' }}>{summary.resolved}</strong>
          </button>

          {/* Reload Button */}
          <button
            type="button"
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
            title="Reload from MongoDB Atlas"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="desktop-only">{isNe ? 'ताजा' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#B91C1C',
          fontSize: '0.875rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Filterable Table in Card Container */}
      <div className="card" style={{ padding: '24px' }}>
        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--color-royal-blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
            <span>{isNe ? 'डाटाबेसबाट उजुरीहरू लोड गरिँदैछ...' : 'Loading grievance queue from MongoDB Atlas...'}</span>
          </div>
        ) : (
          <ComplaintTable
            complaints={complaints}
            role="admin"
            showStudentInfo={true}
            defaultStatus={urlStatus}
            defaultCategory={urlCategory}
            onActionClick={(item) => navigate(`/admin/complaints/${item._id || item.id}`)}
            actionButtonLabel={isNe ? 'समीक्षा' : 'Inspect'}
          />
        )}
      </div>

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
