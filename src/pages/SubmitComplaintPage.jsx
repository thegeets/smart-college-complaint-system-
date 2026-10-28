import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  PlusCircle,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Layers,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';

export function SubmitComplaintPage() {
  const {
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    submitStudentComplaint,
    categories,
    priorities,
    language,
    getCategoryLabel,
    getPriorityLabel,
    showToast,
  } = useApp();

  const isNe = language === 'ne';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Authentication guard: redirect unauthenticated visitor to login
  useEffect(() => {
    if (!isCheckingStudentSession && !isStudentLoggedIn) {
      navigate('/login?redirect=/submit', { replace: true });
    }
  }, [isCheckingStudentSession, isStudentLoggedIn, navigate]);

  const initialCategory = searchParams.get('category') || '';

  const [formData, setFormData] = useState({
    category: initialCategory,
    priority: 'Medium',
    title: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const cleanCategories = categories.filter((c) => c !== 'General');

  const validate = () => {
    const errs = {};
    if (!formData.category) {
      errs.category = isNe ? 'कृपया समस्याको विधा छनोट गर्नुहोस्।' : 'Please select an issue category.';
    }
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      errs.title = isNe ? 'शीर्षक कम्तीमा ५ अक्षरको हुनुपर्छ।' : 'Title must be at least 5 characters.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 15) {
      errs.description = isNe ? 'विवरण कम्तीमा १५ अक्षरको हुनुपर्छ।' : 'Description must be at least 15 characters.';
    }
    return errs;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(isNe ? 'फाइलको आकार ५ MB भन्दा बढी हुनुहुँदैन।' : 'File size cannot exceed 5 MB.', 'error');
      return;
    }
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      showToast(isNe ? 'केवल JPG, PNG वा PDF फाइलहरू मात्र स्वीकार गरिन्छ।' : 'Only JPG, PNG, and PDF files are allowed.', 'error');
      return;
    }
    setSelectedFile(file);
    showToast(isNe ? 'फाइल संलग्न गरियो।' : 'File attached.', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const data = await submitStudentComplaint(formData, selectedFile);
      setSubmittedComplaint(data.complaint);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      setServerError(err.message || 'Failed to submit complaint.');
      if (err.errors) setErrors(err.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingStudentSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ fontWeight: '600', color: '#15365B' }}>Checking student credentials...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link
              to="/student/complaints"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: '600' }}
            >
              <ArrowLeft size={14} />
              <span>{isNe ? 'मेरो ड्यासबोर्डमा फर्कनुहोस्' : 'Back to Dashboard'}</span>
            </Link>
          </div>

          {/* Email Unverified Warning */}
          {studentUser && !studentUser.isEmailVerified && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.875rem' }}>
                  <strong>{isNe ? 'इमेल प्रमाणीकरण आवश्यक:' : 'Email Verification Required:'} </strong>
                  <span>{isNe ? 'नयाँ उजुरी दर्ता गर्न कृपया पहिले आफ्नो इमेल स्वामित्व प्रमाणित गर्नुहोस्।' : 'Please confirm your email ownership before lodging new grievances.'}</span>
                </div>
              </div>
              <Link
                to={`/verify-email?email=${encodeURIComponent(studentUser.email)}&redirect=/submit`}
                className="btn btn-sm"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: '700' }}
              >
                {isNe ? 'अहिले प्रमाणित गर्नुहोस्' : 'Verify Email Now'}
              </Link>
            </div>
          )}

          {submittedComplaint ? (
            /* SUCCESS CONFIRMATION */
            <div className="card" style={{ padding: 'var(--space-8)', border: '1px solid #10B981', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#10B981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#065F46', margin: '0 0 8px' }}>
                {isNe ? 'उजुरी सफलतापूर्वक दर्ता भयो!' : 'Complaint Submitted Successfully!'}
              </h2>
              <p style={{ fontSize: '0.9375rem', color: '#475569', maxWidth: '520px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                {isNe
                  ? `तपाईंको उजुरी कलेज प्राविधिक डेस्कमा रेकर्ड गरिएको छ। सन्दर्भ कोड ${submittedComplaint.reference} हो।`
                  : `Your grievance has been safely logged in the college database under reference ${submittedComplaint.reference}.`}
              </p>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '16px',
                maxWidth: '440px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: '600' }}>
                  {isNe ? 'सन्दर्भ कोड:' : 'Complaint Reference:'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.1rem', color: '#15365B' }}>
                  {submittedComplaint.reference}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  to={`/student/complaints/${encodeURIComponent(submittedComplaint.reference)}`}
                  className="btn btn-primary btn-md"
                >
                  <ExternalLink size={16} />
                  <span>{isNe ? 'उजुरीको विवरण हेर्नुहोस्' : 'View in My Complaints'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmittedComplaint(null);
                    setFormData({ category: '', priority: 'Medium', title: '', description: '' });
                    setSelectedFile(null);
                  }}
                  className="btn btn-secondary btn-md"
                >
                  <PlusCircle size={16} />
                  <span>{isNe ? 'अर्को नयाँ उजुरी' : 'Submit Another'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* SUBMISSION FORM */
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              
              <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0D8178', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  {COLLEGE_CONFIG.name}
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 6px' }}>
                  {isNe ? 'आईटी उजुरी दर्ता फारम' : 'Lodge a Campus IT Complaint'}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, lineHeight: '1.5' }}>
                  {isNe
                    ? 'कम्प्युटर ल्याब, इन्टरनेट, प्रोग्रामिङ सफ्टवेयर, तथा प्राविधिक उपकरण सम्बन्धी समस्याहरू दर्ता गर्नुहोस्।'
                    : 'Report workstation faults, campus Wi-Fi outages, compiler bugs, or classroom tech issues.'}
                </p>
              </div>

              {serverError && (
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
                  <AlertCircle size={18} />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                
                {/* 1. Student Identification (Auto-filled) */}
                <div style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <User size={16} color="#15365B" />
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#15365B', margin: 0 }}>
                      {isNe ? '१. विद्यार्थी परिचय (खाताबाट स्वचालित)' : '1. Student Identification (From Active Account)'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                        {isNe ? 'विद्यार्थीको नाम:' : 'Full Name:'}
                      </span>
                      <strong style={{ color: '#0F172A', fontSize: '0.875rem' }}>{studentUser?.name}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                        {isNe ? 'रोल नं / आइडी:' : 'Roll No / ID:'}
                      </span>
                      <strong style={{ color: '#0F172A', fontSize: '0.875rem' }}>{studentUser?.studentId}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                        {isNe ? 'इमेल:' : 'Email:'}
                      </span>
                      <strong style={{ color: '#0F172A', fontSize: '0.875rem' }}>{studentUser?.email}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginBottom: '2px' }}>
                        {isNe ? 'कार्यक्रम / सेमेस्टर:' : 'Program & Semester:'}
                      </span>
                      <strong style={{ color: '#0F172A', fontSize: '0.875rem' }}>{studentUser?.program || 'BSc CSIT'} ({studentUser?.semester})</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Issue Details */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Layers size={16} color="#15365B" />
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#15365B', margin: 0 }}>
                      {isNe ? '२. उजुरीको वर्गीकरण तथा विवरण' : '2. Grievance Details'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    {/* Category */}
                    <div className="form-group">
                      <label htmlFor="complaint-category" className="form-label">
                        {isNe ? 'समस्याको विधा' : 'IT Category'} <span className="required">*</span>
                      </label>
                      <select
                        id="complaint-category"
                        className={`form-select ${errors.category ? 'error' : ''}`}
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (errors.category) setErrors({ ...errors, category: null });
                        }}
                        required
                      >
                        <option value="">{isNe ? '-- विधा छनोट गर्नुहोस् --' : '-- Select IT Category --'}</option>
                        {cleanCategories.map((c) => (
                          <option key={c} value={c}>{getCategoryLabel(c)}</option>
                        ))}
                      </select>
                      {errors.category && <span className="form-error-msg">{errors.category}</span>}
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                      <label htmlFor="complaint-priority" className="form-label">
                        {isNe ? 'प्राथमिकता स्तर' : 'Urgency Level'}
                      </label>
                      <select
                        id="complaint-priority"
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>{getPriorityLabel(p)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label htmlFor="complaint-title" className="form-label" style={{ margin: 0 }}>
                        {isNe ? 'उजुरी शीर्षक' : 'Subject / Title'} <span className="required">*</span>
                      </label>
                      <span style={{ fontSize: '0.6875rem', color: formData.title.length < 5 ? '#94A3B8' : '#0D8178' }}>
                        {formData.title.length}/100
                      </span>
                    </div>
                    <input
                      id="complaint-title"
                      type="text"
                      maxLength={100}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder={isNe ? 'जस्तै: ल्याब २ को कम्प्युटर १० को मनिटर डिस्प्ले नखुलेको' : 'e.g. Workstation PC 10 display malfunction in Computer Lab 2'}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: null });
                      }}
                      required
                    />
                    {errors.title && <span className="form-error-msg">{errors.title}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label htmlFor="complaint-description" className="form-label" style={{ margin: 0 }}>
                        {isNe ? 'विस्तृत विवरण' : 'Detailed Description'} <span className="required">*</span>
                      </label>
                      <span style={{ fontSize: '0.6875rem', color: formData.description.length < 15 ? '#94A3B8' : '#0D8178' }}>
                        {isNe ? 'कम्तीमा १५ अक्षर' : 'Min 15 chars'} ({formData.description.length})
                      </span>
                    </div>
                    <textarea
                      id="complaint-description"
                      rows={5}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder={isNe ? 'कृपया ल्याब कोठा नं, कम्प्युटर आइडी, र समस्याको स्पष्ट लक्षण खुलाउनुहोस्...' : 'Please specify the lab room number, workstation ID, error message, and how to reproduce the issue...'}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: null });
                      }}
                      required
                    />
                    {errors.description && <span className="form-error-msg">{errors.description}</span>}
                  </div>
                </div>

                {/* 3. File Attachment */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Upload size={16} color="#15365B" />
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#15365B', margin: 0 }}>
                      {isNe ? '३. ऐच्छिक प्रमाण वा स्क्रिनसट' : '3. Optional Photo / Log Attachment'}
                    </h2>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 12px' }}>
                    {isNe
                      ? 'त्रुटिको स्क्रिनसट वा तस्बिर (JPG, PNG, वा PDF मात्र; अधिकतम ५ MB)'
                      : 'Attach a screenshot or error log (JPG, PNG, or PDF only; max 5 MB). Uploads are private and accessible only to IT staff.'}
                  </p>

                  {selectedFile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: '#F0FDFA',
                      border: '1px solid #CCFBF1',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#0D8178" />
                        <div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A' }}>{selectedFile.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '8px' }}>
                            ({Math.round(selectedFile.size / 1024)} KB)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                        title="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        id="submit-attachment-file"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="submit-attachment-file"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          border: isDragging ? '2px dashed #0D8178' : '2px dashed #CBD5E1',
                          borderRadius: '6px',
                          backgroundColor: isDragging ? '#F0FDFA' : '#F8FAFC',
                          cursor: 'pointer',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processFile(file);
                        }}
                      >
                        <Upload size={22} color={isDragging ? '#0D8178' : '#64748B'} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#15365B' }}>
                          {isNe ? 'फाइल चयन गर्न यहाँ थिच्नुहोस्' : 'Click to browse or drop file here'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          JPG, PNG, or PDF up to 5 MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/student/complaints" className="btn btn-secondary btn-md">
                    {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </Link>

                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isSubmitting || (studentUser && !studentUser.isEmailVerified)}
                    style={{ minWidth: '160px', height: '44px' }}
                  >
                    {isSubmitting ? (
                      <span>{isNe ? 'दर्ता हुँदैछ...' : 'Submitting...'}</span>
                    ) : (
                      <>
                        <PlusCircle size={16} />
                        <span>{isNe ? 'उजुरी दर्ता गर्नुहोस्' : 'Submit Complaint'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SubmitComplaintPage;
