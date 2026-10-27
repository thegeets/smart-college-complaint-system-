import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ComplaintTable } from '../components/ComplaintTable';
import { PlusCircle, FileText, CheckCircle2, Clock, Wrench } from 'lucide-react';

export function MyComplaintsPage() {
  const { currentUser, complaints, t } = useApp();

  // Find all complaints associated with this student (or demo records)
  const studentComplaints = complaints.filter(
    (c) => c.studentName === currentUser.name || c.studentRoll === currentUser.rollNumber || c.isAnonymous
  );

  const resolvedCount = studentComplaints.filter((c) => c.status === 'Resolved').length;
  const inProgressCount = studentComplaints.filter((c) => c.status === 'In Progress').length;
  const pendingCount = studentComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy-900)' }}>
            {t('myComplaints.pageTitle', 'My Submitted Complaints')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t('myComplaints.pageSubtitle', 'Review, filter, and track all grievance complaints registered under your student account.')}
          </p>
        </div>

        <Link to="/submit" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>{t('myComplaints.newComplaintBtn', 'New Complaint')}</span>
        </Link>
      </div>

      {/* Mini metric pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.65rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
          <FileText size={16} color="var(--navy-700)" />
          <span>{t('studentDashboard.statTotal', 'Total')}: <strong>{studentComplaints.length}</strong></span>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.65rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
          <Clock size={16} color="#d97706" />
          <span>{t('studentDashboard.statPending', 'Pending')}: <strong>{pendingCount}</strong></span>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.65rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
          <Wrench size={16} color="#0284c7" />
          <span>{t('studentDashboard.statProgress', 'In Progress')}: <strong>{inProgressCount}</strong></span>
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--border-light)', padding: '0.65rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem' }}>
          <CheckCircle2 size={16} color="#059669" />
          <span>{t('studentDashboard.statResolved', 'Resolved')}: <strong>{resolvedCount}</strong></span>
        </div>
      </div>

      {/* Filterable Table with Responsive Stacked Cards on Mobile */}
      <ComplaintTable
        complaints={studentComplaints}
        role="student"
        showDepartment={false}
        showStudentInfo={false}
      />
    </div>
  );
}

export default MyComplaintsPage;
