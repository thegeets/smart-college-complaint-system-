import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';
import { AdminComplaintDetailView } from '../components/AdminComplaintDetailView';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  RefreshCw,
  AlertCircle,
  Eye,
  User,
  ShieldCheck,
  Layers
} from 'lucide-react';

export function StaffDashboard() {
  const {
    adminUser,
    fetchAdminComplaints,
    language
  } = useApp();

  const isNe = language === 'ne';
  const staffName = adminUser?.name || 'Staff Member';
  const staffRole = adminUser?.role || 'Technician';
  const staffDept = adminUser?.specialization || adminUser?.department || 'IT Support & Operations';

  const [complaints, setComplaints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const loadAssignedComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch tickets assigned to this staff member
      const res = await fetchAdminComplaints({ tab: 'mine', limit: 50 });
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Staff dashboard load error:', err);
      setError(err.message || 'Failed to load assigned grievances.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdminComplaints]);

  useEffect(() => {
    loadAssignedComplaints();
  }, [loadAssignedComplaints]);

  // Computed metrics
  const totalAssigned = complaints.length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const pendingReview = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Pending') return c.status === 'Submitted' || c.status === 'Under Review';
    return c.status === filterStatus;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Staff Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #101D35 0%, #203B64 100%)',
        color: '#FFFFFF',
        padding: '24px 28px',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 4px 16px -2px rgba(16, 29, 53, 0.15)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#D5E1F7',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
            marginBottom: '8px',
          }}>
            <Briefcase size={13} />
            <span>{isNe ? 'प्राविधिक कार्यथलो' : `${staffRole.toUpperCase()} RESOLUTION DESK`}</span>
          </div>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px' }}>
            {staffName}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
            {staffDept} • <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Authorized Dispatcher
          </p>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          padding: '12px 18px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.8125rem',
        }}>
          <div>{isNe ? 'जिम्मा दिइएका उजुरी:' : 'Assigned to Your Desk:'} <strong>{totalAssigned} tickets</strong></div>
          <div style={{ color: '#93C5FD', marginTop: '4px' }}>{isNe ? 'कार्यान्वयनमा रहेका:' : 'Active In Progress:'} <strong>{inProgress} tickets</strong></div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="admin-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-kpi-card kpi-navy">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कुल जिम्मा' : 'Total Assigned'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#101D35' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{totalAssigned}</div>
          <div className="admin-kpi-subtext">All assigned tickets</div>
        </div>

        <div className="admin-kpi-card kpi-amber">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'निरीक्षण बाँकी' : 'Awaiting Inspection'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#FFFBEB', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{pendingReview}</div>
          <div className="admin-kpi-subtext">Needs initial review</div>
        </div>

        <div className="admin-kpi-card kpi-blue">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कार्यान्वयनमा' : 'In Progress'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#5278C8' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{inProgress}</div>
          <div className="admin-kpi-subtext">Repair/work underway</div>
        </div>

        <div className="admin-kpi-card kpi-emerald">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समाधान गरिएका' : 'Resolved'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{resolved}</div>
          <div className="admin-kpi-subtext">Successfully fixed</div>
        </div>
      </div>

      {/* Main Assigned Complaints Section */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
              {isNe ? 'तपाईंको जिम्माका उजुरीहरूको सूची' : 'Your Assigned Grievance Queue'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe
                ? 'उजुरी खोल्नुहोस्, समस्या समाधान गर्नुहोस्, र विद्यार्थीको जानकारीका लागि टिप्पणी थप्नुहोस्।'
                : 'Click any ticket to inspect evidence, record internal notes, update status, and submit resolution.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'Pending', label: 'Pending' },
                { id: 'In Progress', label: 'In Progress' },
                { id: 'Resolved', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: filterStatus === tab.id ? '#101D35' : 'transparent',
                    color: filterStatus === tab.id ? '#FFFFFF' : 'var(--color-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loadAssignedComplaints}
              disabled={isLoading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>{isNe ? 'ताजा' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#B91C1C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--color-royal-blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 10px' }} />
            <p style={{ fontSize: '0.8125rem', margin: 0 }}>
              {isNe ? 'उजुरीहरू लोड गरिँदैछ...' : 'Loading assigned queue...'}
            </p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#EEF3FB', color: '#203B64', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Layers size={20} />
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 4px' }}>
              {isNe ? 'कुनै उजुरी छैन' : 'No Assigned Tickets Found'}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              {isNe ? 'हाल तपाईंलाई तोकिएको कुनै उजुरी भेटिएन।' : 'No tickets are currently assigned to your desk under this filter.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Ref Code</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Title & Location</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Category</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Priority</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)' }}>Student</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--color-heading)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((item) => {
                  const refCode = item.reference || item.referenceId || item.id;
                  return (
                    <tr
                      key={item._id || item.id}
                      onClick={() => setSelectedComplaint(item)}
                      style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: '700', color: '#203B64' }}>
                        {refCode}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-heading)' }}>{item.title}</div>
                        {item.location && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>📍 {item.location}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <CategoryBadge category={item.category} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '500' }}>{item.student?.name || item.studentName || 'Student'}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>{item.student?.studentId || item.studentRoll || ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(item);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Detail Drawer */}
      {selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div
            onClick={() => setSelectedComplaint(null)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(16, 29, 53, 0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />
          <div style={{
            position: 'relative',
            width: '680px',
            maxWidth: '92vw',
            height: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '-8px 0 32px rgba(16, 29, 53, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 101,
            overflowY: 'auto',
          }}>
            <AdminComplaintDetailView
              complaint={selectedComplaint}
              onComplaintUpdated={(updated) => {
                setSelectedComplaint(updated);
                loadAssignedComplaints();
              }}
              onClose={() => {
                setSelectedComplaint(null);
                loadAssignedComplaints();
              }}
              isDrawer={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
