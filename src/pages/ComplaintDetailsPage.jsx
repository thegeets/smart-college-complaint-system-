import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ComplaintTimeline } from '../components/ComplaintTimeline';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Download,
  AlertCircle,
  RefreshCw,
  Printer,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function ComplaintDetailsPage() {
  const { id } = useParams();
  const { isStudentLoggedIn, isCheckingStudentSession, fetchStudentComplaintById, getCategoryLabel, language } = useApp();
  const isNe = language === 'ne';
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isCheckingStudentSession && !isStudentLoggedIn) {
      navigate(`/login?redirect=/student/complaints/${encodeURIComponent(id || '')}`, { replace: true });
    }
  }, [isCheckingStudentSession, isStudentLoggedIn, navigate, id]);

  useEffect(() => {
    if (isStudentLoggedIn && id) {
      const loadData = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
          const data = await fetchStudentComplaintById(id);
          setComplaint(data);
        } catch (err) {
          console.error('Error fetching complaint details:', err);
          setErrorMsg(err.message || 'Could not load complaint details.');
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [isStudentLoggedIn, id, fetchStudentComplaintById]);

  if (isCheckingStudentSession || isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
        <PublicNavbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#15365B' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px', color: '#0D8178' }} />
            <p style={{ fontWeight: '600', fontSize: '0.9375rem' }}>Loading grievance docket...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ maxWidth: '820px', width: '100%', margin: '0 auto' }}>
          
          {/* Back Navigation Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
            <Link
              to="/student/complaints"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={14} />
              <span>{isNe ? 'मेरो उजुरीहरूमा फर्कनुहोस्' : 'Back to My Complaints'}</span>
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} />
              <span>{isNe ? 'प्रिन्ट गर्नुहोस्' : 'Print Docket'}</span>
            </button>
          </div>

          {errorMsg ? (
            <div className="card" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991B1B', margin: '0 0 8px' }}>
                {isNe ? 'उजुरी लोड हुन सकेन' : 'Unable to Access Complaint'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                {errorMsg}
              </p>
              <Link to="/student/complaints" className="btn btn-primary btn-sm">
                <span>{isNe ? 'मेरो ड्यासबोर्डमा जानुहोस्' : 'Return to My Complaints'}</span>
              </Link>
            </div>
          ) : complaint && (
            <div>
              {/* Header Card */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '800', color: '#15365B' }}>
                        {complaint.reference}
                      </span>
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px', lineHeight: '1.3' }}>
                      {complaint.title}
                    </h1>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#64748B' }}>
                    <Calendar size={15} />
                    <span>
                      {new Date(complaint.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>

                {/* Metadata strip */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#475569', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'विधा:' : 'Category:'} </strong>
                    <span>{getCategoryLabel(complaint.category)}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'कार्यक्रम:' : 'Program:'} </strong>
                    <span>{complaint.program || 'BSc CSIT'}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'विद्यार्थी आइडी:' : 'Student Roll:'} </strong>
                    <span>{complaint.student?.studentId}</span>
                  </div>
                </div>
              </div>

              {/* 4-Stage Resolution Process Card */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#15365B', margin: '0 0 16px' }}>
                  {isNe ? 'समाधान प्रगति चरणहरू' : '4-Stage Resolution Process'}
                </h3>
                <ComplaintTimeline currentStatus={complaint.status} timeline={complaint.timeline} />
              </div>

              {/* Full Description & Attached Evidence */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#15365B', margin: '0 0 12px' }}>
                  {isNe ? 'समस्याको विस्तृत विवरण' : 'Reported Description'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {complaint.description}
                </p>

                {/* Attachment Section */}
                {complaint.hasAttachment && (
                  <div style={{
                    marginTop: '20px',
                    padding: '14px 16px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={20} color="#0D8178" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A' }}>
                          {complaint.attachment?.originalName || 'Attached Evidence File'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {complaint.attachment?.size ? `${Math.round(complaint.attachment.size / 1024)} KB` : 'Verified attachment'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/api/v1/student/complaints/${encodeURIComponent(complaint.id || complaint.reference)}/attachment`}
                      download
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} />
                      <span>{isNe ? 'डाउनलोड गर्नुहोस्' : 'Download Attachment'}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Official College Responses */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MessageSquare size={18} color="#0D8178" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15365B', margin: 0 }}>
                    {isNe ? 'कलेज प्रशासनको आधिकारिक जवाफ' : 'College Administration Replies'}
                  </h3>
                </div>

                {complaint.responses && complaint.responses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {complaint.responses.map((resp, i) => (
                      <div
                        key={resp.id || i}
                        style={{
                          backgroundColor: '#F0FDFA',
                          border: '1px solid #CCFBF1',
                          borderRadius: '8px',
                          padding: '14px 16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#0F766E' }}>
                            {resp.responderName || (isNe ? 'कलेज प्राविधिक डेस्क' : 'Central IT Desk')}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {new Date(resp.createdAt).toLocaleString(isNe ? 'ne-NP' : 'en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#0F172A', lineHeight: '1.5' }}>
                          {resp.message}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '0.875rem' }}>
                    {isNe
                      ? 'अहिलेसम्म कलेजको तर्फबाट कुनै जवाफ रेकर्ड गरिएको छैन। उजुरी प्रशासनिक समीक्षाको क्रममा छ।'
                      : 'No official reply recorded yet. The grievance is currently under technical review.'}
                  </div>
                )}
              </div>

              {/* Recorded Status History */}
              {complaint.timeline && complaint.timeline.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Clock size={18} color="#15365B" />
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#15365B', margin: 0 }}>
                      {isNe ? 'अवस्था परिवर्तन इतिहास' : 'Status History & Audit Trail'}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {complaint.timeline.map((entry, idx) => (
                      <div
                        key={entry.id || idx}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#0F172A', marginRight: '8px' }}>
                            {entry.action}
                          </span>
                          {entry.note && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              ({entry.note})
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          {new Date(entry.timestamp).toLocaleString(isNe ? 'ne-NP' : 'en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ComplaintDetailsPage;
