import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { StatusBadge } from '../components/StatusBadge';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  PlusCircle,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  PhoneCall,
  User,
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
  RefreshCw,
  MessageSquareQuote,
  Check,
  Building,
} from 'lucide-react';

/**
 * High-fidelity loading skeleton rendered while authentication session
 * or initial dashboard dataset is hydrating.
 */
function DashboardSkeleton({ isNe }) {
  return (
    <div className="student-dashboard-page" aria-busy="true" aria-label="Loading student dashboard">
      <PublicNavbar />
      <main className="student-dashboard-main">
        <div className="dashboard-content-container">
          {/* Welcome banner skeleton */}
          <div className="dashboard-welcome-banner" style={{ minHeight: '110px' }}>
            <div className="welcome-banner-text" style={{ width: '60%' }}>
              <SkeletonLoader height="22px" width="220px" borderRadius="12px" style={{ marginBottom: '10px' }} />
              <SkeletonLoader height="32px" width="280px" borderRadius="8px" style={{ marginBottom: '8px' }} />
              <SkeletonLoader height="16px" width="240px" borderRadius="6px" />
            </div>
            <div className="welcome-banner-action">
              <SkeletonLoader height="44px" width="180px" borderRadius="8px" />
            </div>
          </div>

          {/* 4 Summary Stat Cards skeleton */}
          <section className="dashboard-stats-grid" aria-hidden="true">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="summary-stat-card stat-neutral">
                <div className="stat-card-top">
                  <SkeletonLoader height="14px" width="60px" borderRadius="4px" />
                  <SkeletonLoader height="36px" width="36px" borderRadius="8px" />
                </div>
                <div style={{ margin: '14px 0 8px' }}>
                  <SkeletonLoader height="36px" width="70px" borderRadius="6px" />
                </div>
                <SkeletonLoader height="12px" width="120px" borderRadius="4px" />
              </div>
            ))}
          </section>

          {/* Two-Column Layout skeleton */}
          <div className="dashboard-content-columns" aria-hidden="true">
            <div className="dashboard-recent-section">
              <div className="recent-section-header">
                <div>
                  <SkeletonLoader height="24px" width="180px" borderRadius="6px" style={{ marginBottom: '6px' }} />
                  <SkeletonLoader height="14px" width="260px" borderRadius="4px" />
                </div>
                <SkeletonLoader height="18px" width="80px" borderRadius="4px" />
              </div>
              <div className="dashboard-skeletons-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dashboard-card-skeleton">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line meta" />
                    <div className="skeleton-line body" />
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-sidebar-column">
              <div className="dashboard-widget-card" style={{ padding: '24px', marginBottom: '20px' }}>
                <SkeletonLoader height="20px" width="120px" borderRadius="6px" style={{ marginBottom: '16px' }} />
                <SkeletonLoader height="56px" borderRadius="10px" style={{ marginBottom: '12px' }} />
                <SkeletonLoader height="56px" borderRadius="10px" style={{ marginBottom: '12px' }} />
                <SkeletonLoader height="56px" borderRadius="10px" />
              </div>
              <div className="dashboard-widget-card" style={{ padding: '24px' }}>
                <SkeletonLoader height="20px" width="140px" borderRadius="6px" style={{ marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                  <SkeletonLoader height="48px" width="48px" borderRadius="50%" />
                  <div style={{ flex: 1 }}>
                    <SkeletonLoader height="18px" width="120px" borderRadius="4px" style={{ marginBottom: '6px' }} />
                    <SkeletonLoader height="14px" width="90px" borderRadius="4px" />
                  </div>
                </div>
                <SkeletonLoader height="16px" width="100%" borderRadius="4px" count={3} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export function StudentDashboard() {
  const {
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    fetchStudentComplaints,
    language,
    getCategoryLabel,
  } = useApp();

  const isNe = language === 'ne';

  // 1. Auth Loading State: Don't render dashboard or redirect until session check completes
  if (isCheckingStudentSession) {
    return <DashboardSkeleton isNe={isNe} />;
  }

  // 2. Auth Guard: If session check finished and student is definitely unauthenticated, redirect to login
  if (!isStudentLoggedIn) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchStudentComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load student complaints:', err);
      setErrorMsg(
        err?.message ||
        (isNe
          ? 'उजुरी विवरण लोड गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।'
          : 'Unable to load your complaint records. Please check your connection and try again.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudentComplaints, isNe]);

  useEffect(() => {
    if (isStudentLoggedIn) {
      loadComplaints();
    }
  }, [isStudentLoggedIn, loadComplaints]);

  // Defensive array and user guards
  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const studentFirstName = studentUser?.name?.trim()
    ? studentUser.name.trim().split(/\s+/)[0]
    : isNe ? 'विद्यार्थी' : 'Student';

  const totalCount = safeComplaints.length;
  const underReviewCount = safeComplaints.filter(
    (c) => c?.status === 'Under Review' || c?.status === 'Submitted'
  ).length;
  const inProgressCount = safeComplaints.filter((c) => c?.status === 'In Progress').length;
  const resolvedCount = safeComplaints.filter((c) => c?.status === 'Resolved').length;

  // Latest 5 complaints sorted by newest first
  const recentComplaints = [...safeComplaints]
    .sort(
      (a, b) =>
        new Date(b?.submittedAt || b?.createdAt || 0) -
        new Date(a?.submittedAt || a?.createdAt || 0)
    )
    .slice(0, 5);

  // Identify the most recent In-Progress complaint for the expanded mini 4-stage tracker
  const mostRecentInProgress = recentComplaints.find((c) => c?.status === 'In Progress');
  const mostRecentInProgressId = mostRecentInProgress
    ? mostRecentInProgress.id || mostRecentInProgress._id
    : null;

  // Helper for student initials
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'S';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase() || 'S';
    }
    return (parts[0] || 'ST').slice(0, 2).toUpperCase() || 'S';
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="student-dashboard-page">
      <PublicNavbar />

      <main className="student-dashboard-main">
        <div className="dashboard-content-container">
          {/* 1. Header Section */}
          <div className="dashboard-welcome-banner">
            <div className="welcome-banner-text">
              <div className="desk-pill">
                <Sparkles size={13} aria-hidden="true" />
                <span>
                  {isNe
                    ? 'सोच कलेज आईटी सहायता डेस्क'
                    : 'SOCH COLLEGE IT GRIEVANCE PORTAL'}
                </span>
              </div>
              <h1 className="welcome-title">
                {isNe ? `नमस्ते, ${studentFirstName}` : `Namaste, ${studentFirstName}`}
              </h1>
              <p className="welcome-subtitle">
                <span>{studentUser?.semester || '1st Semester'}</span>
                <span className="dot-sep">•</span>
                <span>{studentUser?.program || COLLEGE_CONFIG?.program || 'BSc CSIT'}</span>
                {studentUser?.studentId && (
                  <>
                    <span className="dot-sep">•</span>
                    <span className="student-id-badge">
                      ID: {studentUser.studentId}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="welcome-banner-action">
              <Link to="/submit" className="btn btn-primary btn-md">
                <PlusCircle size={18} aria-hidden="true" />
                <span>{isNe ? 'नयाँ उजुरी दर्ता' : 'Submit a complaint'}</span>
              </Link>
            </div>
          </div>

          {/* 2. Four Summary Stat Cards */}
          <section
            className="dashboard-stats-grid"
            aria-label={isNe ? 'उजुरी सारांश तथ्याङ्क' : 'Complaint summary statistics'}
          >
            {/* Total Card (Neutral) */}
            <div className="summary-stat-card stat-neutral">
              <div className="stat-card-top">
                <span className="stat-badge-label">
                  {isNe ? 'कुल उजुरी' : 'Total'}
                </span>
                <div className="stat-icon-box neutral" aria-hidden="true">
                  <FileText size={18} />
                </div>
              </div>
              <div className="stat-card-number">
                {isLoading ? (
                  <span className="stat-skeleton-number" />
                ) : (
                  <AnimatedNumber value={totalCount} />
                )}
              </div>
              <p className="stat-card-helper">
                {isNe ? 'सबै दर्ता भएका उजुरीहरू' : 'All grievances registered'}
              </p>
            </div>

            {/* Under Review Card (Amber) */}
            <div className="summary-stat-card stat-amber">
              <div className="stat-card-top">
                <span className="stat-badge-label">
                  {isNe ? 'समीक्षाधीन' : 'Under review'}
                </span>
                <div className="stat-icon-box amber" aria-hidden="true">
                  <Clock size={18} />
                </div>
              </div>
              <div className="stat-card-number">
                {isLoading ? (
                  <span className="stat-skeleton-number" />
                ) : (
                  <AnimatedNumber value={underReviewCount} />
                )}
              </div>
              <p className="stat-card-helper">
                {isNe ? 'दर्ता भई समीक्षा भइरहेका' : 'Submitted & awaiting triage'}
              </p>
            </div>

            {/* In Progress Card (Blue) */}
            <div className="summary-stat-card stat-blue">
              <div className="stat-card-top">
                <span className="stat-badge-label">
                  {isNe ? 'कार्यान्वयनमा' : 'In progress'}
                </span>
                <div className="stat-icon-box blue" aria-hidden="true">
                  <Wrench size={18} />
                </div>
              </div>
              <div className="stat-card-number">
                {isLoading ? (
                  <span className="stat-skeleton-number" />
                ) : (
                  <AnimatedNumber value={inProgressCount} />
                )}
              </div>
              <p className="stat-card-helper">
                {isNe ? 'प्राविधिकद्वारा मर्मत हुँदै' : 'Assigned & being resolved'}
              </p>
            </div>

            {/* Resolved Card (Green) */}
            <div className="summary-stat-card stat-green">
              <div className="stat-card-top">
                <span className="stat-badge-label">
                  {isNe ? 'समाधान भएका' : 'Resolved'}
                </span>
                <div className="stat-icon-box green" aria-hidden="true">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="stat-card-number">
                {isLoading ? (
                  <span className="stat-skeleton-number" />
                ) : (
                  <AnimatedNumber value={resolvedCount} />
                )}
              </div>
              <p className="stat-card-helper">
                {isNe ? 'सफलतापूर्वक समाधान गरिएका' : 'Remediated & closed'}
              </p>
            </div>
          </section>

          {/* 3 & 4. Main Two-Column Layout (Recent Complaints + Right Side Widgets) */}
          <div className="dashboard-content-columns">
            {/* Left Column: Recent Complaints List */}
            <section
              className="dashboard-recent-section"
              aria-label={isNe ? 'हालैका उजुरीहरू' : 'Recent complaints'}
            >
              <div className="recent-section-header">
                <div>
                  <h2 className="recent-section-title">
                    {isNe ? 'हालैका उजुरीहरू' : 'Recent Complaints'}
                  </h2>
                  <p className="recent-section-subtitle">
                    {isNe
                      ? 'तपाईंले पछिल्लो समय दर्ता गराउनुभएका गुनासाहरू'
                      : 'Latest grievances lodged and real-time resolution progress'}
                  </p>
                </div>
                <Link to="/my-complaints" className="view-all-link">
                  <span>{isNe ? 'सबै हेर्नुहोस्' : 'View all'}</span>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {/* Loading Skeletons */}
              {isLoading && (
                <div className="dashboard-skeletons-list" aria-busy="true">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="dashboard-card-skeleton">
                      <div className="skeleton-line title" />
                      <div className="skeleton-line meta" />
                      <div className="skeleton-line body" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {!isLoading && errorMsg && (
                <div className="dashboard-error-state" role="alert">
                  <AlertCircle size={24} className="text-red-500" />
                  <div>
                    <h3 className="error-title">
                      {isNe ? 'तथ्याङ्क लोड हुन सकेन' : 'Failed to load records'}
                    </h3>
                    <p className="error-desc">{errorMsg}</p>
                    <button
                      type="button"
                      onClick={loadComplaints}
                      className="btn btn-outline btn-sm mt-3"
                    >
                      <RefreshCw size={14} />
                      <span>{isNe ? 'पुनः प्रयास गर्नुहोस्' : 'Try Again'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !errorMsg && recentComplaints.length === 0 && (
                <div className="dashboard-empty-state">
                  <div className="empty-state-icon-box">
                    <FileText size={32} />
                  </div>
                  <h3 className="empty-state-title">
                    {isNe ? 'कुनै उजुरी दर्ता भएको छैन' : 'No complaints yet'}
                  </h3>
                  <p className="empty-state-desc">
                    {isNe
                      ? 'तपाईंले अहिलेसम्म कुनै गुनासो दर्ता गराउनुभएको छैन। कम्प्युटर ल्याब, इन्टरनेट वा सफ्टवेयर सम्बन्धी समस्या परेमा उजुरी दर्ता गर्नुहोस्।'
                      : 'You have not submitted any complaints yet. Facing a lab computer, Wi-Fi, or software issue? Lodge a complaint now to get prompt assistance.'}
                  </p>
                  <Link to="/submit" className="btn btn-primary btn-md">
                    <PlusCircle size={17} />
                    <span>{isNe ? 'पहिलो उजुरी दर्ता गर्नुहोस्' : 'Submit a complaint'}</span>
                  </Link>
                </div>
              )}

              {/* Complaint Cards (Latest 5) */}
              {!isLoading && !errorMsg && recentComplaints.length > 0 && (
                <div className="dashboard-cards-list">
                  {recentComplaints.map((c) => {
                    const cId = c?.id || c?._id || '';
                    const isTargetInProgress = Boolean(cId && cId === mostRecentInProgressId);
                    const refCode = c?.referenceId || c?.reference || '';
                    const displayRef = refCode.startsWith('#') ? refCode : `#${refCode}`;

                    // Extract staff reply if resolved
                    const staffReplies = Array.isArray(c?.responses) ? c.responses : [];
                    const latestReply =
                      staffReplies.length > 0
                        ? staffReplies[staffReplies.length - 1]
                        : null;

                    return (
                      <article
                        key={cId}
                        className={`recent-ticket-card ${isTargetInProgress ? 'in-progress-featured' : ''}`}
                      >
                        <div className="ticket-card-header">
                          <div className="ticket-title-group">
                            <span className="ticket-ref-code">{displayRef}</span>
                            <span className="ticket-category-tag">
                              {getCategoryLabel(c?.category)}
                            </span>
                          </div>
                          <StatusBadge status={c?.status || 'Submitted'} />
                        </div>

                        <h3 className="ticket-card-title">
                          <Link to={`/dashboard/complaints/${cId}`}>
                            {c?.title || (isNe ? 'शीर्षक बिनाको उजुरी' : 'Untitled Complaint')}
                          </Link>
                        </h3>

                        <p className="ticket-card-desc">
                          {c?.description && c.description.length > 130
                            ? `${c.description.slice(0, 130)}...`
                            : c?.description || ''}
                        </p>

                        <div className="ticket-card-meta">
                          {c?.location && (
                            <span className="meta-item">
                              <MapPin size={13} aria-hidden="true" />
                              <span>
                                {c.location}
                                {c?.pcNumber ? ` • PC #${c.pcNumber}` : ''}
                              </span>
                            </span>
                          )}
                          <span className="meta-item">
                            <Calendar size={13} aria-hidden="true" />
                            <span>
                              {formatDate(c?.submittedAt || c?.createdAt)}
                            </span>
                          </span>
                        </div>

                        {/* Special Feature 1: Mini 4-Stage Tracker for the Most Recent In-Progress Ticket */}
                        {isTargetInProgress && (
                          <div className="featured-tracker-panel">
                            <div className="tracker-panel-header">
                              <span className="tracker-title">
                                {isNe ? 'समाधान चरण ट्र्याकर' : 'Resolution Pipeline'}
                              </span>
                              <span className="tracker-sla-tag">
                                {COLLEGE_CONFIG?.contact?.targetSlaPhrase ||
                                  'Target: 24–48 hours'}
                              </span>
                            </div>

                            {/* 4-Stage Mini Tracker */}
                            <div className="mini-four-stage-tracker" aria-label="Complaint Progress">
                              {/* Stage 1: Submitted (Completed) */}
                              <div className="tracker-step completed">
                                <div className="step-circle navy">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="step-label">
                                  {isNe ? 'दर्ता भयो' : 'Submitted'}
                                </span>
                              </div>

                              <div className="step-connector completed" />

                              {/* Stage 2: Reviewed (Completed) */}
                              <div className="tracker-step completed">
                                <div className="step-circle navy">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="step-label">
                                  {isNe ? 'समीक्षा भयो' : 'Reviewed'}
                                </span>
                              </div>

                              <div className="step-connector in-progress" />

                              {/* Stage 3: In Progress (Active) */}
                              <div className="tracker-step active">
                                <div className="step-circle blue">
                                  <div className="active-dot" />
                                </div>
                                <span className="step-label active-text">
                                  {isNe ? 'कार्यान्वयनमा' : 'In progress'}
                                </span>
                              </div>

                              <div className="step-connector pending" />

                              {/* Stage 4: Resolved (Pending) */}
                              <div className="tracker-step pending">
                                <div className="step-circle muted">
                                  <span>4</span>
                                </div>
                                <span className="step-label muted-text">
                                  {isNe ? 'समाधान' : 'Resolved'}
                                </span>
                              </div>
                            </div>

                            {/* Assigned Technician & Location Strip */}
                            <div className="tech-location-strip">
                              <div className="tech-info-row">
                                <div className="tech-icon-circle">
                                  <User size={14} />
                                </div>
                                <div>
                                  <span className="tech-label">
                                    {isNe ? 'जिम्मेवार प्राविधिक:' : 'Assigned Technician:'}
                                  </span>
                                  <span className="tech-name">
                                    {c?.assignedStaff?.name ||
                                      c?.assignedTo?.name ||
                                      (isNe
                                        ? 'इ. विवेक शर्मा (हार्डवेयर तथा नेटवर्क प्राविधिक)'
                                        : 'Er. Bibek Sharma (Hardware & Network Technician)')}
                                  </span>
                                </div>
                              </div>
                              <div className="campus-location-tag">
                                <Building size={13} />
                                <span>
                                  {c?.location || 'Ranipauwa Campus - Lab 1'}
                                  {c?.pcNumber ? `, PC #${c.pcNumber}` : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Special Feature 2: Official Staff Reply for Resolved Tickets */}
                        {c?.status === 'Resolved' && latestReply && (
                          <div className="resolved-reply-callout">
                            <div className="reply-callout-header">
                              <MessageSquareQuote size={15} className="text-emerald-600" />
                              <span className="reply-sender-title">
                                {isNe ? 'प्राविधिकको आधिकारिक जवाफ' : 'Official Staff Resolution Note'}
                              </span>
                              <span className="reply-timestamp">
                                {formatDate(latestReply?.createdAt)}
                              </span>
                            </div>
                            <p className="reply-content-text">
                              "{latestReply?.message || ''}"
                            </p>
                            <span className="reply-signoff">
                              — {latestReply?.responderName || 'Soch College IT Desk'}
                            </span>
                          </div>
                        )}

                        <div className="ticket-card-footer">
                          <Link
                            to={`/dashboard/complaints/${cId}`}
                            className="ticket-detail-link"
                          >
                            <span>{isNe ? 'पूर्ण विवरण हेर्नुहोस्' : 'View Full Ticket'}</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Column: Quick Actions & Student Profile Cards */}
            <aside className="dashboard-sidebar-column">
              {/* Widget 1: Quick Actions */}
              <div className="dashboard-widget-card quick-actions-widget">
                <div className="widget-header">
                  <h3 className="widget-title">
                    {isNe ? 'द्रुत कार्यहरू' : 'Quick Actions'}
                  </h3>
                </div>

                <div className="quick-actions-list">
                  {/* Action 1: New Complaint */}
                  <Link to="/submit" className="quick-action-button">
                    <div className="action-icon-circle blue">
                      <PlusCircle size={18} />
                    </div>
                    <div className="action-text-group">
                      <span className="action-label">
                        {isNe ? 'नयाँ उजुरी दर्ता' : 'New Complaint'}
                      </span>
                      <span className="action-helper">
                        {isNe
                          ? 'कम्प्युटर ल्याब, इन्टरनेट वा सफ्टवेयर'
                          : 'Report hardware, Wi-Fi or software issue'}
                      </span>
                    </div>
                    <ChevronRight size={15} className="action-chevron" />
                  </Link>

                  {/* Action 2: Track by Reference ID */}
                  <Link to="/track" className="quick-action-button">
                    <div className="action-icon-circle amber">
                      <Search size={18} />
                    </div>
                    <div className="action-text-group">
                      <span className="action-label">
                        {isNe ? 'उजुरी स्थिति खोज्नुहोस्' : 'Track by Reference ID'}
                      </span>
                      <span className="action-helper">
                        {isNe
                          ? 'गोप्य ट्र्याकिङ कोडद्वारा स्थिति जाँच'
                          : 'Check status using Reference ID & secret'}
                      </span>
                    </div>
                    <ChevronRight size={15} className="action-chevron" />
                  </Link>

                  {/* Action 3: Call IT Desk */}
                  <a
                    href="tel:061574096"
                    className="quick-action-button call-action"
                  >
                    <div className="action-icon-circle green">
                      <PhoneCall size={18} />
                    </div>
                    <div className="action-text-group">
                      <span className="action-label">
                        {isNe ? 'आईटी सहायता डेस्क फोन' : 'Call IT Desk (061-574096)'}
                      </span>
                      <span className="action-helper">
                        {isNe
                          ? 'तत्काल सहयोगका लागि सिधा सम्पर्क'
                          : 'Direct support line for urgent assistance'}
                      </span>
                    </div>
                    <ChevronRight size={15} className="action-chevron" />
                  </a>
                </div>
              </div>

              {/* Widget 2: Profile & Desk Hours Card */}
              <div className="dashboard-widget-card profile-info-widget">
                <div className="widget-header">
                  <h3 className="widget-title">
                    {isNe ? 'विद्यार्थी विवरण' : 'Student Profile'}
                  </h3>
                  <Link to="/student/profile" className="profile-edit-link">
                    {isNe ? 'सम्पादन' : 'Edit'}
                  </Link>
                </div>

                <div className="profile-widget-body">
                  <div className="profile-hero-row">
                    <div className="profile-avatar-circle" aria-hidden="true" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {studentUser?.avatar ? (
                        <img
                          src={studentUser.avatar}
                          alt={studentUser?.name || 'Student'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(studentUser?.name)
                      )}
                    </div>
                    <div className="profile-name-group">
                      <h4 className="profile-full-name">
                        {studentUser?.name || 'Verified Student'}
                      </h4>
                      <span className="profile-student-id">
                        {studentUser?.studentId || 'SOCH-CSIT-001'}
                      </span>
                    </div>
                  </div>

                  <div className="profile-detail-rows">
                    <div className="profile-detail-item">
                      <span className="item-label">
                        {isNe ? 'सेमेस्टर:' : 'Semester:'}
                      </span>
                      <span className="item-value">
                        {studentUser?.semester || '1st Semester'}
                      </span>
                    </div>
                    <div className="profile-detail-item">
                      <span className="item-label">
                        {isNe ? 'कार्यक्रम:' : 'Program:'}
                      </span>
                      <span className="item-value">
                        {studentUser?.program || COLLEGE_CONFIG?.program || 'BSc CSIT'}
                      </span>
                    </div>
                    {studentUser?.email && (
                      <div className="profile-detail-item">
                        <span className="item-label">
                          {isNe ? 'इमेल:' : 'Email:'}
                        </span>
                        <span className="item-value text-ellipsis" title={studentUser.email}>
                          {studentUser.email}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Desk Operating Schedule Box */}
                  <div className="desk-schedule-box">
                    <div className="schedule-box-header">
                      <Clock size={15} className="schedule-clock-icon" />
                      <span className="schedule-header-title">
                        {isNe ? 'सहायता डेस्क खुल्ने समय' : 'IT Desk Operating Hours'}
                      </span>
                    </div>
                    <p className="schedule-time-row">
                      <strong>
                        {isNe
                          ? 'आइतबार – शुक्रबार: बिहान ६:०० – अपराह्न ४:००'
                          : 'Sunday–Friday, 6:00 AM – 4:00 PM'}
                      </strong>
                    </p>
                    <p className="schedule-note">
                      {isNe
                        ? 'शनिबार र बिदाका दिन बन्द रहनेछ। अनलाइन उजुरी २४/७ दर्ता गर्न सकिनेछ।'
                        : 'Closed on Saturdays and college holidays. Tickets can be lodged online 24/7.'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/**
 * Top-level wrapper providing ErrorBoundary protection for the Student Dashboard.
 */
export default function StudentDashboardPage() {
  return (
    <ErrorBoundary
      title="Student Dashboard"
      message="We encountered an unexpected error loading your dashboard. Please reload the page."
    >
      <StudentDashboard />
    </ErrorBoundary>
  );
}
