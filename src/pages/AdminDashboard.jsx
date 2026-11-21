import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ComplaintTable } from '../components/ComplaintTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Inbox,
  BarChart2,
  Check,
  ChevronRight
} from 'lucide-react';

export function AdminDashboard() {
  const { 
    fetchAdminComplaints, 
    fetchReportsSummary, 
    updateComplaintStatus,
    statusList,
    categories,
    getCategoryLabel,
    language,
    adminUser
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
    let isMounted = true;
    (async () => {
      try {
        const [sumData, complaintsData] = await Promise.all([
          fetchReportsSummary(),
          fetchAdminComplaints({ limit: 8 }),
        ]);
        if (isMounted) {
          setSummary(sumData);
          setRecentComplaints(complaintsData.complaints || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data from database.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchReportsSummary, fetchAdminComplaints]);

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

  const total = summary.total || 0;
  const pendingPct = total > 0 ? Math.round((summary.pendingReview / total) * 100) : 0;
  const inProgPct = total > 0 ? Math.round((summary.inProgress / total) * 100) : 0;
  const resolvedPct = total > 0 ? Math.round((summary.resolved / total) * 100) : 0;

  // Pipeline stages from real database status mapping
  const pipelineStages = [
    {
      id: 'Submitted',
      label: isNe ? 'दर्ता भएको' : 'Submitted',
      count: summary.byStatus?.['Submitted'] || 0,
      color: '#203B64',
      bg: '#EEF3FB',
      border: '#D5E1F7',
      to: '/admin/complaints?status=Submitted',
    },
    {
      id: 'Under Review',
      label: isNe ? 'समीक्षामा' : 'Under Review',
      count: summary.byStatus?.['Under Review'] || 0,
      color: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      to: '/admin/complaints?status=Under%20Review',
    },
    {
      id: 'In Progress',
      label: isNe ? 'कार्यान्वयनमा' : 'In Progress',
      count: summary.byStatus?.['In Progress'] || 0,
      color: '#5278C8',
      bg: '#EEF3FB',
      border: '#D5E1F7',
      to: '/admin/complaints?status=In%20Progress',
    },
    {
      id: 'Resolved',
      label: isNe ? 'समाधान' : 'Resolved',
      count: summary.byStatus?.['Resolved'] || 0,
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      to: '/admin/complaints?status=Resolved',
    },
  ];

  return (
    <div>
      {/* Executive Welcome & Action Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
              {isNe ? 'प्रशासनिक ड्यासबोर्ड' : 'Operations Dashboard'}
            </h1>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '2px 8px',
              backgroundColor: '#EEF3FB',
              color: '#203B64',
              borderRadius: '9999px',
              border: '1px solid #D5E1F7',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              ITSM Console
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? `स्वागत छ, ${adminUser?.name || 'प्रशासक'} • सोच कलेज अफ आईटी, पोखराको प्राविधिक उजुरी व्यवस्थापन`
              : `Welcome, ${adminUser?.name || 'Administrator'} • Real-time IT service management & grievance triage`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={loadDashboardData}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Refresh database metrics"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh Metrics'}</span>
          </button>

          <Link
            to="/admin/complaints"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Inbox size={14} />
            <span>{isNe ? 'उजुरी सूची' : 'Complaints Queue'}</span>
            <ArrowRight size={13} />
          </Link>
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

      {/* Enterprise KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Total Complaints */}
        <div 
          className="admin-kpi-card kpi-navy"
          onClick={() => navigate('/admin/complaints')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/complaints'); }}
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कुल दर्ता उजुरी' : 'Total Complaints'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0F4FA', color: '#101D35' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{total}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'डाटाबेसमा सुरक्षित' : 'All records in MongoDB'}</span>
            <span style={{ fontWeight: '600', color: 'var(--color-navy)' }}>100%</span>
          </div>
        </div>

        {/* Pending Review */}
        <div 
          className="admin-kpi-card kpi-amber"
          onClick={() => navigate('/admin/complaints?status=Under%20Review')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/complaints?status=Under%20Review'); }}
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समीक्षा बाँकी' : 'Pending Triage'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#FFFBEB', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#B45309' }}>{summary.pendingReview}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'जाँच तथा कार्यभार बाँकी' : 'Awaiting review'}</span>
            <span style={{ fontWeight: '600', color: '#B45309' }}>{pendingPct}%</span>
          </div>
        </div>

        {/* In Progress */}
        <div 
          className="admin-kpi-card kpi-blue"
          onClick={() => navigate('/admin/complaints?status=In%20Progress')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/complaints?status=In%20Progress'); }}
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कार्यान्वयनमा' : 'In Progress'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#5278C8' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#5278C8' }}>{summary.inProgress}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'प्राविधिक कार्य जारी' : 'Active remediation'}</span>
            <span style={{ fontWeight: '600', color: '#5278C8' }}>{inProgPct}%</span>
          </div>
        </div>

        {/* Resolved */}
        <div 
          className="admin-kpi-card kpi-emerald"
          onClick={() => navigate('/admin/complaints?status=Resolved')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/admin/complaints?status=Resolved'); }}
        >
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समाधान भएको' : 'Resolved'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#15803D' }}>{summary.resolved}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'समाधान दर' : 'Resolution rate'}</span>
            <span style={{ fontWeight: '600', color: '#15803D' }}>{resolvedPct}%</span>
          </div>
        </div>
      </div>

      {/* Analytics Overview: Resolution Pipeline + Category Distribution */}
      <div className="admin-analytics-grid">
        
        {/* Left: Resolution Pipeline Funnel */}
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#5278C8" />
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'उजुरी समाधान पाइपलाइन' : 'Resolution Pipeline'}
              </h2>
            </div>
            <Link to="/admin/reports" style={{ fontSize: '0.75rem', color: 'var(--color-royal-blue)', fontWeight: '600', textDecoration: 'none' }}>
              {isNe ? 'विस्तृत तथ्याङ्क →' : 'Deep Analytics →'}
            </Link>
          </div>

          <div className="admin-funnel-stages" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            {pipelineStages.map((stage) => {
              const stagePct = total > 0 ? Math.round((stage.count / total) * 100) : 0;
              return (
                <div 
                  key={stage.id} 
                  className="admin-funnel-stage-card"
                  onClick={() => navigate(stage.to)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(stage.to); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: stage.bg,
                      color: stage.color,
                      border: `1px solid ${stage.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {stage.id === 'Resolved' ? <Check size={14} /> : stage.count}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-heading)' }}>
                        {stage.label}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                        {stagePct}% {isNe ? 'उजुरी' : 'of total pipeline'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '700', color: stage.color }}>
                      {stage.count}
                    </span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: IT Category Distribution */}
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#5278C8" />
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'विधागत वितरण' : 'IT Category Breakdown'}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {categories.length} {isNe ? 'विधाहरू' : 'Service Areas'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-around' }}>
            {categories.slice(0, 5).map((cat) => {
              const count = summary.byCategory?.[cat] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="admin-cat-bar-item">
                  <div className="admin-cat-bar-header">
                    <span style={{ fontWeight: '600', color: 'var(--color-heading)' }}>
                      {getCategoryLabel(cat)}
                    </span>
                    <span style={{ color: 'var(--color-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="admin-cat-bar-track">
                    <div className="admin-cat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Grievance Submissions Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'भर्खरै दर्ता भएका उजुरीहरू' : 'Recent Grievance Submissions'}
              </h2>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '2px 8px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                borderRadius: '9999px'
              }}>
                {recentComplaints.length} {isNe ? 'उजुरी' : 'dockets'}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '3px 0 0' }}>
              {isNe ? 'पछिल्लो समय डाटाबेसमा दर्ता गरिएका विद्यार्थी उजुरीहरू' : 'Latest student grievances logged in MongoDB Atlas'}
            </p>
          </div>

          <Link to="/admin/complaints" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>{isNe ? 'सबै उजुरी सूची हेर्नुहोस्' : 'View Full Queue'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--color-royal-blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
            <span>{isNe ? 'डाटाबेसबाट विवरण लोड गरिँदैछ...' : 'Loading grievance records from MongoDB...'}</span>
          </div>
        ) : (
          <ComplaintTable
            complaints={recentComplaints}
            role="admin"
            showStudentInfo={true}
            onActionClick={(item) => navigate(`/admin/complaints/${item._id || item.id}`)}
            actionButtonLabel={isNe ? 'समीक्षा गर्नुहोस्' : 'Inspect Docket'}
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
