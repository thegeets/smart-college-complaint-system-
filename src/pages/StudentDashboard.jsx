import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  Megaphone,
  ArrowRight,
  Eye,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

export function StudentDashboard() {
  const { currentUser, complaints, announcements, language, t } = useApp();
  const isNe = language === 'ne';

  // Filter complaints filed by this student (or demo student complaints)
  const studentComplaints = complaints.filter(
    (c) => c.studentName === currentUser.name || c.studentRoll === currentUser.rollNumber || c.isAnonymous
  );

  const total = studentComplaints.length;
  const pending = studentComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = studentComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = studentComplaints.filter((c) => c.status === 'Resolved').length;

  const recentList = [...studentComplaints].sort(
    (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
  ).slice(0, 5);

  return (
    <div>
      {/* Student Welcome Header Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
          color: '#ffffff',
          padding: '1.5rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--sky-400)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            <Sparkles size={12} />
            <span>{t('studentDashboard.deskTag', 'STUDENT GRIEVANCE REDRESSAL DESK')}</span>
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800' }}>
            {t('studentDashboard.welcome', 'Welcome,')} {currentUser.name}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            {t('details.rollNumber', 'Roll No')}: <strong>{currentUser.rollNumber}</strong> | {currentUser.program} ({currentUser.semester || '4th Semester'})
          </p>
        </div>

        <Link to="/submit" className="btn btn-accent btn-md">
          <PlusCircle size={18} />
          <span>{t('studentDashboard.lodgeBtn', 'Lodge New Complaint')}</span>
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          label={t('studentDashboard.statTotal', 'Total Lodged')}
          value={total}
          icon={FileText}
          color="blue"
          helper={t('studentDashboard.statTotalHelper', 'All grievances registered')}
        />
        <StatCard
          label={t('studentDashboard.statPending', 'Pending Review')}
          value={pending}
          icon={Clock}
          color="amber"
          helper={t('studentDashboard.statPendingHelper', 'Submitted & Under Review')}
        />
        <StatCard
          label={t('studentDashboard.statProgress', 'In Progress')}
          value={inProgress}
          icon={Wrench}
          color="sky"
          helper={t('studentDashboard.statProgressHelper', 'Assigned & being resolved')}
        />
        <StatCard
          label={t('studentDashboard.statResolved', 'Resolved Cases')}
          value={resolved}
          icon={CheckCircle2}
          color="green"
          helper={t('studentDashboard.statResolvedHelper', 'Successfully remediated')}
        />
      </div>

      {/* Main Grid: Recent Complaints + Campus IT Notices */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Grievances List */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 className="card-title">{t('studentDashboard.recentTitle', 'Recent Grievance Submissions')}</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                {t('studentDashboard.recentSubtitle', 'Your latest registered concerns and real-time status')}
              </p>
            </div>
            <Link to="/student/complaints" className="btn btn-secondary btn-sm">
              <span>{t('studentDashboard.viewAll', 'View All My Complaints')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {recentList.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <Clock size={36} color="var(--sky-500)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--navy-900)' }}>
                  {t('studentDashboard.noComplaints', 'You have not submitted any complaints yet.')}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0.35rem auto 1rem' }}>
                  {t('studentDashboard.noComplaintsDesc', 'Facing a lab computer, Wi-Fi, or software issue? Report it now and follow its resolution progress.')}
                </p>
                <Link to="/submit" className="btn btn-accent btn-sm">
                  <PlusCircle size={15} />
                  <span>{t('studentDashboard.lodgeFirstComplaint', 'Lodge First Complaint')}</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentList.map((item) => {
                  const dateStr = new Date(item.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
                    dateStyle: 'medium',
                  });

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        transition: 'background 0.15s ease',
                      }}
                      className="hover-subtle"
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                          <span className="table-complaint-id">{item.id}</span>
                          <StatusBadge status={item.status} />
                          <PriorityBadge priority={item.priority} />
                        </div>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 0.2rem' }}>
                          <Link to={`/complaint/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {item.title}
                          </Link>
                        </h4>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>

                      <div>
                        <Link
                          to={`/complaint/${item.id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>{isNe ? 'गुनासोको अवस्था' : 'Track Status'}</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Campus IT Bulletins & Support Notices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={18} color="var(--sky-600)" />
                <h3 className="card-title">{t('studentDashboard.noticesTitle', 'Campus IT Notices & Updates')}</h3>
              </div>
            </div>

            <div className="card-body" style={{ padding: '0.75rem 1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((anc) => (
                  <div
                    key={anc.id}
                    style={{
                      paddingBottom: '0.85rem',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-priority-medium" style={{ fontSize: '0.65rem' }}>
                        {anc.category}
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {anc.date}
                      </span>
                    </div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--navy-900)', margin: '0 0 0.25rem' }}>
                      {anc.title}
                    </h5>
                    <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
                      {anc.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick IT Help Desk Info Card */}
          <div className="card" style={{ background: '#f8fafc' }}>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.925rem', fontWeight: '800', color: 'var(--navy-900)', marginBottom: '0.4rem' }}>
                {isNe ? 'सोच कलेज आईटी सहयोग डेस्क' : 'Soch College IT Help Desk'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                {isNe 
                  ? 'तत्काल सहयोगका लागि रानीपौवा, पोखरास्थित ल्याब प्रशासन कक्षमा सिधै सम्पर्क गर्न सक्नुहुन्छ।' 
                  : 'For urgent hardware assistance, visit the Technical Support Room at Ranipauwa campus or contact us:'}
              </p>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Email:</strong> info@sochcollege.edu.np</div>
                <div><strong>Phone:</strong> 061-574096</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
