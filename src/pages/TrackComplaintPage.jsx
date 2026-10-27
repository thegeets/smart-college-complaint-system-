import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { StatusBadge } from '../components/StatusBadge';
import { ComplaintTimeline } from '../components/ComplaintTimeline';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  Search,
  AlertCircle,
  KeyRound,
  Calendar,
  Clock,
  MessageSquare,
  Lock,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export function TrackComplaintPage() {
  const { trackComplaint, language, getCategoryLabel } = useApp();
  const isNe = language === 'ne';
  const [searchParams] = useSearchParams();

  // Pre-fill reference and secret if passed from submission handover
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [trackingSecret, setTrackingSecret] = useState(searchParams.get('secret') || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackedComplaint, setTrackedComplaint] = useState(null);

  useEffect(() => {
    const urlRef = searchParams.get('ref');
    const urlSecret = searchParams.get('secret');
    if (urlRef && urlSecret) {
      const runAutoTrack = async () => {
        setIsLoading(true);
        setErrorMsg('');
        try {
          const complaint = await trackComplaint(urlRef.trim().toUpperCase(), urlSecret.trim());
          setTrackedComplaint(complaint);
        } catch (err) {
          console.error('Auto-track lookup error:', err);
          setErrorMsg(
            isNe
              ? 'यो सन्दर्भ कोड (Reference ID) र ट्र्याकिङ कोड (Tracking Secret) सँग मिल्ने कुनै उजुरी फेला परेन।'
              : 'Could not automatically verify complaint with the provided parameters. Please check your credentials.'
          );
        } finally {
          setIsLoading(false);
        }
      };
      runAutoTrack();
    }
  }, [searchParams]);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const cleanRef = reference.trim().toUpperCase();
    const cleanSecret = trackingSecret.trim();

    if (!cleanRef) {
      setErrorMsg(isNe ? 'कृपया उजुरी सन्दर्भ कोड (Complaint Reference ID) प्रविष्ट गर्नुहोस्।' : 'Please enter your Complaint Reference ID.');
      return;
    }

    if (!cleanSecret) {
      setErrorMsg(isNe ? 'कृपया गोप्य ट्र्याकिङ कोड (Private Tracking Secret) प्रविष्ट गर्नुहोस्।' : 'Please enter your Private Tracking Secret.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const complaint = await trackComplaint(cleanRef, cleanSecret);
      setTrackedComplaint(complaint);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Tracking lookup error:', err);
      // Ensure no fallback or sample complaint is displayed on failure
      setTrackedComplaint(null);
      setErrorMsg(
        isNe
          ? 'यो सन्दर्भ कोड (Reference ID) र ट्र्याकिङ कोड (Tracking Secret) सँग मिल्ने कुनै उजुरी फेला परेन। कृपया आफ्नो विवरण सही छ भनी जाँच गर्नुहोस् वा कलेज सहायता कक्षमा सम्पर्क गर्नुहोस्।'
          : 'No complaint found matching the provided Reference ID and Tracking Secret. Please verify your details or contact the college desk.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setTrackedComplaint(null);
    setReference('');
    setTrackingSecret('');
    setErrorMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-10) var(--space-4)' }}>
        <div style={{ maxWidth: '780px', width: '100%', margin: '0 auto' }}>
          
          {trackedComplaint ? (
            /* TRACKED COMPLAINT RESULT VIEW - ONLY REAL RETRIEVED COMPLAINTS */
            <div>
              {/* Back to Search Button */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={14} />
                  <span>{isNe ? 'अर्को उजुरी खोजी गर्नुहोस्' : 'Search Another Complaint'}</span>
                </button>
              </div>

              {/* Complaint Header Card */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                        {trackedComplaint.reference}
                      </span>
                      <StatusBadge status={trackedComplaint.status} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0 }}>
                      {trackedComplaint.title}
                    </h1>

                    {/* Show resolution timestamp ONLY when the complaint is resolved */}
                    {trackedComplaint.status === 'Resolved' && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        color: '#065F46',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: '700',
                        marginTop: '10px'
                      }}>
                        <CheckCircle2 size={15} color="#059669" />
                        <span>
                          {isNe ? 'समाधान मिति: ' : 'Resolved on: '}
                          {(() => {
                            const resolvedEntry = trackedComplaint.timeline?.slice().reverse().find(
                              (t) => t.toStatus === 'Resolved' || (t.action && t.action.toLowerCase().includes('resolved'))
                            );
                            const resolvedTime = resolvedEntry?.timestamp || trackedComplaint.updatedAt;
                            return new Date(resolvedTime).toLocaleString(isNe ? 'ne-NP' : 'en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            });
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                    <Calendar size={14} />
                    <span>
                      {new Date(trackedComplaint.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>
                </div>

                {/* Category & Details */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8125rem', color: '#64748B', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'विधा:' : 'Category:'} </strong>
                    <span>{getCategoryLabel(trackedComplaint.category)}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'शैक्षिक कार्यक्रम:' : 'Academic Program:'} </strong>
                    <span>{trackedComplaint.program || COLLEGE_CONFIG.program}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A' }}>{isNe ? 'कलेज:' : 'Campus:'} </strong>
                    <span>{COLLEGE_CONFIG.name}</span>
                  </div>
                  {trackedComplaint.hasAttachment && (
                    <div style={{ color: '#0F766E', fontWeight: '600' }}>
                      ✓ {isNe ? 'प्रमाण/तस्बिर संलग्न छ' : 'Attachment on file'}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#334155',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {trackedComplaint.description}
                </div>
              </div>

              {/* Student-Visible Responses from College Desk */}
              <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={17} color="#0F766E" />
                  <span>{isNe ? 'कलेजको जवाफ' : 'College response'}</span>
                </h3>

                {/* Show only responses saved by an authenticated admin */}
                {trackedComplaint.responses && trackedComplaint.responses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trackedComplaint.responses.map((resp, idx) => (
                      <div
                        key={resp.id || resp._id || idx}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: '#F0FDFA',
                          border: '1px solid #CCFBF1',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#0F766E' }}>
                            {resp.responderName || (isNe ? 'कलेज प्रशासन' : 'College Administration')}
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
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '6px', color: '#64748B', fontSize: '0.875rem' }}>
                    {isNe
                      ? 'अहिलेसम्म कलेजको तर्फबाट कुनै जवाफ रेकर्ड गरिएको छैन। उजुरी प्रशासनिक समीक्षाको क्रममा छ।'
                      : 'No college response has been recorded yet. The complaint is under administrative review.'}
                  </div>
                )}
              </div>

              {/* Recorded Status History (Audit Timeline) */}
              {trackedComplaint.timeline && trackedComplaint.timeline.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={17} color="#15365D" />
                    <span>{isNe ? 'कार्यप्रगति इतिहास' : 'Progress History'}</span>
                  </h3>
                  <ComplaintTimeline currentStatus={trackedComplaint.status} timeline={trackedComplaint.timeline} />
                </div>
              )}
            </div>
          ) : (
            /* SEARCH FORM - DISPLAYED WHEN NO COMPLAINT HAS BEEN RETRIEVED */
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#EEF4F9',
                  color: '#15365D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-3)'
                }}>
                  <Search size={24} />
                </div>

                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
                  {isNe ? 'गुनासोको अवस्था' : 'Track Complaint Status'}
                </h1>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: '1.5' }}>
                  {isNe
                    ? 'उजुरी दर्ता गर्दा प्राप्त भएको सन्दर्भ कोड (Complaint Reference ID) र गोप्य ट्र्याकिङ कोड (Private Tracking Secret) दुवै प्रविष्ट गरी वास्तविक स्थिति र कलेजको जवाफ हेर्नुहोस्।'
                    : 'Enter both your Complaint Reference ID and Private Tracking Secret provided upon submission to view current progress and college responses.'}
                </p>
              </div>

              {/* Search Card */}
              <div className="card" style={{ padding: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                <form onSubmit={handleTrackSubmit}>
                  
                  {/* Reference ID */}
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <label htmlFor="complaint-id" className="form-label">
                      {isNe ? 'उजुरी सन्दर्भ कोड (Complaint Reference ID)' : 'Complaint Reference ID'} <span className="required">*</span>
                    </label>
                    <input
                      id="complaint-id"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CMP-2026-A8F2K"
                      value={reference}
                      onChange={(e) => {
                        setReference(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.9375rem' }}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Private Tracking Secret */}
                  <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
                    <label htmlFor="tracking-secret" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <KeyRound size={14} color="#0F766E" />
                      <span>{isNe ? 'गोप्य ट्र्याकिङ कोड (Private Tracking Secret)' : 'Private Tracking Secret'}</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      id="tracking-secret"
                      type="password"
                      className="form-input"
                      placeholder="trk_..."
                      value={trackingSecret}
                      onChange={(e) => {
                        setTrackingSecret(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      style={{ fontFamily: 'monospace', fontSize: '0.9375rem' }}
                      disabled={isLoading}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      color: '#B91C1C',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: 'var(--space-4)'
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isLoading}
                    style={{ width: '100%', height: '44px', fontSize: '0.9375rem' }}
                  >
                    {isLoading ? (
                      <span>{isNe ? 'खोजी गरिँदैछ...' : 'Searching database...'}</span>
                    ) : (
                      <>
                        <Search size={16} />
                        <span>{isNe ? 'उजुरी खोजी गर्नुहोस्' : 'Track Complaint'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Privacy & No-Account Notice */}
                <div style={{
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--color-border)',
                  fontSize: '0.8125rem',
                  color: '#64748B',
                  lineHeight: '1.5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#0F172A', fontWeight: '600' }}>
                    <Lock size={14} color="#0F766E" />
                    <span>{isNe ? 'गोपनीयता तथा सुरक्षा:' : 'Privacy Protection:'}</span>
                  </div>
                  <p style={{ margin: 0 }}>
                    {isNe
                      ? 'विद्यार्थीहरूको व्यक्तिगत गोपनीयता संरक्षण गर्न उजुरीहरू सार्वजनिक सूचीमा देखाइँदैन। Reference ID र Tracking Secret दुवै भएको खण्डमा मात्र उजुरी हेर्न सकिन्छ। यदि कोड हराएमा, कलेज प्रशासनलाई info@sochcollege.edu.np मा सम्पर्क गर्नुहोस्।'
                      : 'To safeguard student privacy, complaints cannot be browsed publicly or queried by student ID alone. Both the Reference ID and Private Tracking Secret are required. If lost, automated self-service recovery is not available in this phase; contact info@sochcollege.edu.np.'}
                  </p>
                </div>
              </div>

              {/* Bottom link */}
              <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                <span>{isNe ? 'नयाँ समस्या दर्ता गर्न चाहनुहुन्छ?' : 'Need to report a new problem?'} </span>
                <Link to="/submit" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                  {isNe ? 'यहाँ उजुरी दर्ता गर्नुहोस्' : 'Submit a complaint here'}
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TrackComplaintPage;
