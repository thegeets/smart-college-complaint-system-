import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  PlusCircle,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Search,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Link2,
  KeyRound,
  Eye,
  Check,
  User
} from 'lucide-react';

export function MyComplaintsPage() {
  const {
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    fetchStudentComplaints,
    claimLegacyComplaint,
    categories,
    language,
    getCategoryLabel,
    t,
    showToast,
  } = useApp();

  const isNe = language === 'ne';
  const navigate = useNavigate();

  // Guard: if not logged in, redirect to login
  useEffect(() => {
    if (!isCheckingStudentSession && !isStudentLoggedIn) {
      navigate('/login?redirect=/student/complaints', { replace: true });
    }
  }, [isCheckingStudentSession, isStudentLoggedIn, navigate]);

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Claim legacy modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimRef, setClaimRef] = useState('');
  const [claimSecret, setClaimSecret] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchStudentComplaints({
        status: selectedStatus,
        category: selectedCategory,
        search: searchQuery,
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load student complaints:', err);
      setErrorMsg(err.message || 'Failed to load your complaints.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudentComplaints, selectedStatus, selectedCategory, searchQuery]);

  useEffect(() => {
    if (isStudentLoggedIn) {
      loadComplaints();
    }
  }, [isStudentLoggedIn, loadComplaints]);

  const handleClaimLegacy = async (e) => {
    e.preventDefault();
    if (!claimRef.trim() || !claimSecret.trim()) {
      setClaimError(isNe ? 'कृपया सन्दर्भ कोड र गोप्य ट्र्याकिङ कोड दुवै प्रविष्ट गर्नुहोस्।' : 'Please enter both Reference ID and Tracking Secret.');
      return;
    }

    setIsClaiming(true);
    setClaimError('');

    try {
      await claimLegacyComplaint(claimRef.trim().toUpperCase(), claimSecret.trim());
      setShowClaimModal(false);
      setClaimRef('');
      setClaimSecret('');
      await loadComplaints();
    } catch (err) {
      setClaimError(err.message || 'Failed to claim complaint. Please check your credentials.');
    } finally {
      setIsClaiming(false);
    }
  };

  // Metrics calculation
  const total = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  if (isCheckingStudentSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center', color: '#15365B' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>Loading student portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div className="container">
          
          {/* Welcome Header */}
          <div style={{
            background: 'linear-gradient(135deg, #15365B 0%, #0F2844 100%)',
            color: '#FFFFFF',
            padding: '24px 28px',
            borderRadius: '12px',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(21, 54, 91, 0.12)'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(13, 129, 120, 0.25)',
                color: '#5EEAD4',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.04em',
                marginBottom: '8px'
              }}>
                <Sparkles size={12} />
                <span>{isNe ? 'विद्यार्थी गुनासो व्यवस्थापन' : 'STUDENT COMPLAINT DASHBOARD'}</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#FFFFFF', margin: '0 0 4px' }}>
                {isNe ? 'नमस्ते,' : 'Welcome back,'} {studentUser?.name}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0 }}>
                {isNe ? 'रोल नं:' : 'Student ID:'} <strong>{studentUser?.studentId}</strong> • {studentUser?.program || 'BSc CSIT'} ({studentUser?.semester})
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowClaimModal(true)}
                className="btn btn-secondary btn-md"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                title="Claim previous guest complaint with secret"
              >
                <Link2 size={16} />
                <span>{isNe ? 'पुरानो उजुरी लिंक गर्नुहोस्' : 'Link Old Complaint'}</span>
              </button>

              <Link to="/submit" className="btn btn-primary btn-md" style={{ backgroundColor: '#0D8178', borderColor: '#0D8178' }}>
                <PlusCircle size={16} />
                <span>{isNe ? 'नयाँ उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
              </Link>
            </div>
          </div>

          {/* Email verification warning if unverified */}
          {studentUser && !studentUser.isEmailVerified && (
            <div style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontSize: '0.875rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  {isNe
                    ? 'तपाईंको इमेल स्वामित्व अझै प्रमाणित भएको छैन। नयाँ उजुरी दर्ता गर्न इमेल प्रमाणीकरण आवश्यक छ।'
                    : 'Your email ownership has not been confirmed yet. Please verify your email to lodge complaints.'}
                </span>
              </div>
              <Link
                to={`/verify-email?email=${encodeURIComponent(studentUser.email)}`}
                className="btn btn-sm"
                style={{ backgroundColor: '#D97706', color: '#FFFFFF', fontWeight: '700' }}
              >
                {isNe ? 'अहिले प्रमाणित गर्नुहोस्' : 'Verify Email Now'}
              </Link>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isNe ? 'कुल दर्ता उजुरी' : 'Total Complaints'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#15365B' }}>
                {total}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                {isNe ? 'मेरो खातामा रेकर्ड' : 'Lodged under your account'}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isNe ? 'समीक्षा बाँकी' : 'Pending Review'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#D97706' }}>
                {pendingCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                {isNe ? 'प्रशासनिक छानबिनमा' : 'Awaiting admin triage'}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isNe ? 'कार्यप्रगतिमा' : 'In Progress'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0D8178' }}>
                {inProgressCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                {isNe ? 'मर्मत तथा समाधान जारी' : 'Being repaired by technicians'}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                {isNe ? 'समाधान सम्पन्न' : 'Resolved'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#059669' }}>
                {resolvedCount}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                {isNe ? 'सफलतापूर्वक बन्द भएका' : 'Closed cases'}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card" style={{ padding: '16px 20px', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Search input */}
              <div style={{ flex: '1 1 240px', minWidth: '0', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isNe ? 'सन्दर्भ कोड वा शीर्षक खोज्नुहोस्...' : 'Search by reference ID or subject...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              {/* Status Select */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{ width: 'auto', minWidth: '130px' }}
                >
                  <option value="All">{isNe ? 'सबै स्थिति' : 'All Statuses'}</option>
                  <option value="Submitted">{isNe ? 'दर्ता (Submitted)' : 'Submitted'}</option>
                  <option value="Under Review">{isNe ? 'समीक्षा (Under Review)' : 'Under Review'}</option>
                  <option value="In Progress">{isNe ? 'प्रगतिमा (In Progress)' : 'In Progress'}</option>
                  <option value="Resolved">{isNe ? 'समाधान (Resolved)' : 'Resolved'}</option>
                </select>

                <button
                  type="button"
                  onClick={loadComplaints}
                  className="btn btn-secondary btn-sm"
                  disabled={isLoading}
                  title="Refresh complaints"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Complaints List / Table */}
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              color: '#B91C1C',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: 'var(--space-6)'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="card" style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', color: '#0D8178' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading your complaints from database...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#EEF4F9',
                color: '#15365B',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 6px' }}>
                {isNe ? 'कुनै उजुरी फेला परेन' : 'No Complaints Found'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                {searchQuery || selectedStatus !== 'All'
                  ? (isNe ? 'तपाईंको खोजीसँग मिल्ने कुनै उजुरी भेटिएन। कृपया फिल्टर खाली गर्नुहोस्।' : 'No complaints match your current search or status filter.')
                  : (isNe ? 'तपाईंले अहिलेसम्म कुनै उजुरी दर्ता गर्नुभएको छैन। क्याम्पस आईटी समस्याहरू सिधै यहाँ दर्ता गर्न सक्नुहुन्छ।' : 'You have not submitted any complaints yet. Report lab equipment, Wi-Fi, or software problems directly.')}
              </p>
              <Link to="/submit" className="btn btn-primary btn-md">
                <PlusCircle size={16} />
                <span>{isNe ? 'नयाँ उजुरी दर्ता गर्नुहोस्' : 'Submit a Complaint'}</span>
              </Link>
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="complaint-table-desktop card" style={{ overflow: 'hidden' }}>
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>{isNe ? 'सन्दर्भ कोड' : 'Reference'}</th>
                      <th>{isNe ? 'उजुरी शीर्षक' : 'Subject'}</th>
                      <th style={{ width: '180px' }}>{isNe ? 'विधा' : 'Category'}</th>
                      <th style={{ width: '120px' }}>{isNe ? 'स्थिति' : 'Status'}</th>
                      <th style={{ width: '120px' }}>{isNe ? 'मिति' : 'Date'}</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>{isNe ? 'विवरण' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id || c.reference}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#15365B', fontSize: '0.875rem' }}>
                            {c.reference}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '2px', fontSize: '0.9375rem' }}>
                            {c.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                            {c.description}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: '#475569' }}>
                            {getCategoryLabel(c.category)}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={c.status} />
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {new Date(c.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
                              dateStyle: 'medium',
                            })}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Link
                            to={`/student/complaints/${encodeURIComponent(c.reference)}`}
                            className="btn btn-secondary btn-sm"
                            style={{ height: '32px', padding: '0 8px', fontSize: '0.75rem' }}
                            title="View details and admin replies"
                          >
                            <span>{isNe ? 'हेर्नुहोस्' : 'View'}</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (<= 768px) */}
              <div className="complaint-table-mobile" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
                {complaints.map((c) => (
                  <div key={c.id || c.reference} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#15365B', fontSize: '0.875rem' }}>
                        {c.reference}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>

                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0F172A', margin: '0 0 6px', lineHeight: '1.35' }}>
                      {c.title}
                    </h4>

                    <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '10px' }}>
                      {getCategoryLabel(c.category)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {new Date(c.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { dateStyle: 'medium' })}
                      </span>

                      <Link
                        to={`/student/complaints/${encodeURIComponent(c.reference)}`}
                        className="btn btn-primary btn-sm"
                        style={{ height: '32px', padding: '0 12px', fontSize: '0.75rem' }}
                      >
                        <span>{isNe ? 'विवरण हेर्नुहोस्' : 'View Details'}</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Legacy Complaint Modal */}
          {showClaimModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '16px'
            }}>
              <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Link2 size={20} color="#0D8178" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#15365B' }}>
                    {isNe ? 'पुरानो उजुरी खातामा लिंक गर्नुहोस्' : 'Link Previous Guest Complaint'}
                  </h3>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px' }}>
                  {isNe
                    ? 'यदि तपाईंले पहिले बिना खाता उजुरी दर्ता गर्नुभएको थियो भने, प्राप्त भएको Reference ID र Private Tracking Secret प्रविष्ट गरी यसलाई आफ्नो खातामा जोड्न सक्नुहुन्छ।'
                    : 'If you filed an issue earlier as a guest, authenticate ownership with your Reference ID and Private Tracking Secret to link it to your student dashboard.'}
                </p>

                {claimError && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    color: '#B91C1C',
                    fontSize: '0.75rem',
                    marginBottom: '14px'
                  }}>
                    {claimError}
                  </div>
                )}

                <form onSubmit={handleClaimLegacy}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      {isNe ? 'सन्दर्भ कोड (Reference ID)' : 'Complaint Reference ID'} *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CMP-2026-A8F2K"
                      value={claimRef}
                      onChange={(e) => setClaimRef(e.target.value)}
                      style={{ fontFamily: 'monospace', fontWeight: '700' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>
                      {isNe ? 'गोप्य ट्र्याकिङ कोड (Private Tracking Secret)' : 'Private Tracking Secret'} *
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="trk_..."
                      value={claimSecret}
                      onChange={(e) => setClaimSecret(e.target.value)}
                      style={{ fontFamily: 'monospace' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowClaimModal(false)}
                      className="btn btn-secondary btn-sm"
                      disabled={isClaiming}
                    >
                      {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={isClaiming}
                    >
                      {isClaiming ? (isNe ? 'लिंक गरिँदैछ...' : 'Linking...') : (isNe ? 'खातामा जोड्नुहोस्' : 'Link to Account')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyComplaintsPage;
