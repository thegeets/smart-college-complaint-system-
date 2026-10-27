import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Info,
  ArrowRight,
  PlusCircle,
  ArrowLeft,
  X,
  FileText,
  KeyRound,
  User,
  Layers,
  Search
} from 'lucide-react';

export function SubmitComplaintPage() {
  const { 
    categories, 
    priorities, 
    submitComplaint, 
    language,
    getCategoryLabel, 
    getPriorityLabel,
    showToast
  } = useApp();
  const isNe = language === 'ne';

  // Ensure only authorized IT categories appear
  const cleanCategories = (categories || []).filter(
    (c) => !c.toLowerCase().includes('hostel')
  );

  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const initialCategory = cleanCategories.includes(categoryParam) ? categoryParam : '';

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    email: '',
    title: '',
    category: initialCategory,
    priority: 'Medium',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const validate = () => {
    const errs = {};

    if (!formData.studentName.trim()) {
      errs.studentName = isNe
        ? 'कृपया विद्यार्थीको पूरा नाम प्रविष्ट गर्नुहोस्।'
        : 'Student full name is required.';
    } else if (formData.studentName.trim().length < 2) {
      errs.studentName = isNe
        ? 'नाम कम्तीमा २ अक्षरको हुनुपर्छ।'
        : 'Name must be at least 2 characters.';
    }

    if (!formData.studentId.trim()) {
      errs.studentId = isNe
        ? 'कृपया विद्यार्थी परिचयपत्र वा रोल नम्बर प्रविष्ट गर्नुहोस्।'
        : 'Student ID or roll number is required.';
    }

    if (!formData.email.trim()) {
      errs.email = isNe
        ? 'कृपया विद्यार्थी वा कलेज इमेल प्रविष्ट गर्नुहोस्।'
        : 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = isNe
        ? 'कृपया मान्य इमेल ठेगाना लेख्नुहोस्।'
        : 'Please enter a valid email address.';
    }

    if (!formData.category) {
      errs.category = isNe
        ? 'कृपया समस्याको विधा छनोट गर्नुहोस्।'
        : 'Please select an issue category.';
    }

    if (!formData.title.trim()) {
      errs.title = isNe
        ? 'कृपया उजुरीको संक्षिप्त शीर्षक प्रविष्ट गर्नुहोस्।'
        : 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = isNe
        ? 'शीर्षक कम्तीमा ५ अक्षरको हुनुपर्छ।'
        : 'Title must be at least 5 characters.';
    }

    if (!formData.description.trim()) {
      errs.description = isNe
        ? 'कृपया समस्याको विस्तृत विवरण प्रविष्ट गर्नुहोस्।'
        : 'Please provide a description of the issue.';
    } else if (formData.description.trim().length < 15) {
      errs.description = isNe
        ? 'विवरण कम्तीमा १५ अक्षरको हुनुपर्छ।'
        : 'Please describe the problem in at least 15 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setServerError('');
      showToast(
        isNe ? 'कृपया फारमका आवश्यक विवरणहरू पूरा गर्नुहोस्।' : 'Please correct the highlighted fields.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setServerError('');

    try {
      const result = await submitComplaint(formData, selectedFile);
      setSuccessData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Complaint submission error:', err);
      const msg = err.message || (isNe ? 'उजुरी दर्ता गर्न सकिएन। पुनः प्रयास गर्नुहोस्।' : 'Failed to register complaint. Please try again.');
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    if (type === 'ref') {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
    showToast(isNe ? 'कपी भयो!' : 'Copied to clipboard!', 'success');
  };

  const processUploadedFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        isNe ? 'फाइलको आकार ५ MB भन्दा बढी हुनुहुँदैन।' : 'File size cannot exceed 5 MB.',
        'error'
      );
      return;
    }

    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(fileExt)) {
      showToast(
        isNe ? 'केवल JPG, PNG वा PDF फाइलहरू मात्र स्वीकार गरिन्छ।' : 'Only JPG, PNG, and PDF files are allowed.',
        'error'
      );
      return;
    }

    setSelectedFile(file);
    showToast(isNe ? 'फाइल संलग्न गरियो।' : 'File attached successfully.', 'info');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processUploadedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          {/* Back link */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link 
              to="/" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: '600', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              <span>{isNe ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}</span>
            </Link>
          </div>

          {/* SUCCESS CONFIRMATION CARD */}
          {successData ? (
            <div className="card" style={{ padding: 'var(--space-8)', border: '1px solid #10B981', boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.12)' }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-3)'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
                  {isNe ? 'उजुरी सफलतापूर्वक दर्ता भयो' : 'Complaint Submitted Successfully'}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
                  {isNe
                    ? 'तपाईंको उजुरी सोध कलेज अफ आईटीको केन्द्रीय डाटाबेसमा सुरक्षित भइसकेको छ।'
                    : 'Your grievance has been permanently saved to the Soch College IT database.'}
                </p>
              </div>

              {/* CRITICAL CREDENTIALS BOX */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: 'var(--space-6)',
                marginBottom: 'var(--space-6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)', color: '#0F172A' }}>
                  <KeyRound size={18} color="#0D8178" />
                  <strong style={{ fontSize: '0.9375rem' }}>
                    {isNe ? 'उजुरी ट्र्याकिङ विवरण (तुरुन्तै सुरक्षित राख्नुहोस्)' : 'Complaint Tracking Credentials (Save Now)'}
                  </strong>
                </div>

                {/* Reference ID */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {isNe ? 'उजुरी सन्दर्भ कोड (Reference ID)' : 'Complaint Reference ID'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '1.125rem',
                      fontWeight: '800',
                      color: '#15365B',
                      overflowX: 'auto'
                    }}>
                      {successData.reference}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.reference, 'ref')}
                      className="btn btn-secondary btn-md"
                      title="Copy Reference"
                      style={{ height: '42px', padding: '0 14px' }}
                    >
                      {copiedRef ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                      <span>{copiedRef ? (isNe ? 'कपी भयो' : 'Copied') : (isNe ? 'कपी' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Tracking Secret */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {isNe ? 'गोप्य ट्र्याकिङ कोड (Private Tracking Secret)' : 'Private Tracking Secret'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1,
                      padding: '10px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#0D8178',
                      overflowX: 'auto',
                      whiteSpace: 'nowrap'
                    }}>
                      {successData.trackingSecret}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.trackingSecret, 'secret')}
                      className="btn btn-secondary btn-md"
                      title="Copy Secret"
                      style={{ height: '42px', padding: '0 14px' }}
                    >
                      {copiedSecret ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                      <span>{copiedSecret ? (isNe ? 'कपी भयो' : 'Copied') : (isNe ? 'कपी' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Important Notice */}
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  color: '#92400E',
                  lineHeight: '1.5'
                }}>
                  <strong>{isNe ? 'महत्वपूर्ण सूचना:' : 'Important:'} </strong>
                  {isNe
                    ? 'विद्यार्थीहरूले खाता बनाउनु नपर्ने भएकाले, पछि स्थिति र कलेजको जवाफ हेर्नका लागि माथिको Reference ID र Tracking Secret दुवै अनिवार्य हुन्छ। यो गोप्य कोड प्रणालीले फेरि देखाउने छैन। यदि कोड हराएमा, कलेज प्रशासनलाई info@sochcollege.edu.np मा सम्पर्क गर्नुहोस्।'
                    : 'Because student accounts are not used, both your Reference ID and Tracking Secret are strictly required to check live status and read college responses. This secret is shown only once and cannot be re-generated.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to={`/track?ref=${encodeURIComponent(successData.reference)}&secret=${encodeURIComponent(successData.trackingSecret)}`} 
                  className="btn btn-primary btn-md"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Search size={16} />
                  <span>{isNe ? 'अहिले नै उजुरी ट्र्याक गर्नुहोस्' : 'Track This Complaint Now'}</span>
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    setFormData({
                      studentName: '',
                      studentId: '',
                      email: '',
                      title: '',
                      category: '',
                      priority: 'Medium',
                      description: '',
                    });
                    setSelectedFile(null);
                  }}
                  className="btn btn-secondary btn-md"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <PlusCircle size={16} />
                  <span>{isNe ? 'अर्को नयाँ उजुरी दर्ता गर्नुहोस्' : 'Submit Another Complaint'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* SUBMISSION FORM */
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              
              {/* Header */}
              <div style={{ marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-4)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0D8178', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  {COLLEGE_CONFIG.name}
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-2)' }}>
                  {isNe ? 'आईटी उजुरी दर्ता फारम' : 'Submit an IT Complaint'}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, lineHeight: '1.5' }}>
                  {isNe
                    ? 'सोच कलेज अफ आईटी, पोखराका कम्प्युटर ल्याब, इन्टरनेट, प्रोग्रामिङ सफ्टवेयर, तथा प्राविधिक उपकरण सम्बन्धी समस्याहरू यहाँ दर्ता गर्नुहोस्। विद्यार्थी दर्ता आवश्यक पर्दैन।'
                    : 'Report IT workstation, network, software tools, or lab equipment concerns at Soch College of IT, Pokhara. No student registration or login is required.'}
                </p>
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  color: '#B91C1C',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{isNe ? 'त्रुटि:' : 'Submission Error:'} </strong>
                    <span>{serverError}</span>
                  </div>
                </div>
              )}

              {/* Membership Disclaimer Note */}
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                color: '#64748B',
                marginBottom: 'var(--space-6)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Info size={15} color="#0D8178" style={{ flexShrink: 0 }} />
                <span>
                  {isNe
                    ? 'विद्यार्थी परिचयपत्र वा रोल नम्बर प्रविष्ट गर्नाले कलेजको सदस्यता स्वचालित रूपमा प्रमाणीकरण हुँदैन। दर्ता भएका उजुरीहरू कलेज प्रशासनद्वारा प्रत्यक्ष रूपमा छानबिन हुनेछन्।'
                    : 'Student ID or roll number is used strictly for internal triage. Submissions are reviewed directly by college IT staff.'}
                </span>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                
                {/* SECTION 1: STUDENT IDENTIFICATION */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '18px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <User size={18} color="#15365B" />
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                      {isNe ? '१. विद्यार्थी विवरण' : '1. Student Identification'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* Student Name */}
                    <div className="form-group">
                      <label htmlFor="studentName" className="form-label">
                        {isNe ? 'विद्यार्थीको पूरा नाम' : 'Full Name'} <span className="required">*</span>
                      </label>
                      <input
                        id="studentName"
                        type="text"
                        className={`form-input ${errors.studentName ? 'error' : ''}`}
                        placeholder="e.g. Kiran Shrestha"
                        value={formData.studentName}
                        onChange={(e) => {
                          setFormData({ ...formData, studentName: e.target.value });
                          if (errors.studentName) setErrors({ ...errors, studentName: null });
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.studentName && <span className="form-error-msg">{errors.studentName}</span>}
                    </div>

                    {/* Student ID */}
                    <div className="form-group">
                      <label htmlFor="studentId" className="form-label">
                        {isNe ? 'विद्यार्थी परिचयपत्र / रोल नं' : 'Student ID / Roll No'} <span className="required">*</span>
                      </label>
                      <input
                        id="studentId"
                        type="text"
                        className={`form-input ${errors.studentId ? 'error' : ''}`}
                        placeholder="e.g. SOCH-CSIT-2024-042"
                        value={formData.studentId}
                        onChange={(e) => {
                          setFormData({ ...formData, studentId: e.target.value });
                          if (errors.studentId) setErrors({ ...errors, studentId: null });
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.studentId && <span className="form-error-msg">{errors.studentId}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="studentEmail" className="form-label">
                        {isNe ? 'इमेल ठेगाना' : 'Email Address'} <span className="required">*</span>
                      </label>
                      <input
                        id="studentEmail"
                        type="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="e.g. kiran@sochcollege.edu.np"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.email && <span className="form-error-msg">{errors.email}</span>}
                    </div>

                    {/* Academic Program (Read-only; Soch College of IT exclusively offers BSc CSIT) */}
                    <div className="form-group">
                      <label htmlFor="academicProgram" className="form-label">
                        {isNe ? 'शैक्षिक कार्यक्रम' : 'Academic Program'}
                      </label>
                      <input
                        id="academicProgram"
                        type="text"
                        className="form-input"
                        value={COLLEGE_CONFIG.program}
                        readOnly
                        disabled
                        aria-readonly="true"
                        style={{ backgroundColor: '#F8FAFC', color: '#334155', cursor: 'default' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COMPLAINT DETAILS */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '18px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Layers size={18} color="#15365B" />
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                      {isNe ? '२. उजुरीको वर्गीकरण तथा विवरण' : '2. Grievance Classification & Details'}
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    {/* Category */}
                    <div className="form-group">
                      <label htmlFor="complaintCategory" className="form-label">
                        {isNe ? 'समस्याको विधा' : 'IT Category'} <span className="required">*</span>
                      </label>
                      <select
                        id="complaintCategory"
                        className={`form-select ${errors.category ? 'error' : ''}`}
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          if (errors.category) setErrors({ ...errors, category: null });
                        }}
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">{isNe ? '-- विधा छनोट गर्नुहोस् --' : '-- Select IT Category --'}</option>
                        {cleanCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {getCategoryLabel(cat)}
                          </option>
                        ))}
                      </select>
                      {errors.category && <span className="form-error-msg">{errors.category}</span>}
                    </div>

                    {/* Priority */}
                    <div className="form-group">
                      <label htmlFor="complaintPriority" className="form-label">
                        {isNe ? 'प्राथमिकता स्तर' : 'Urgency Level'}
                      </label>
                      <select
                        id="complaintPriority"
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        disabled={isSubmitting}
                      >
                        {priorities.map((p) => (
                          <option key={p} value={p}>
                            {getPriorityLabel(p)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label htmlFor="complaintTitle" className="form-label" style={{ margin: 0 }}>
                        {isNe ? 'उजुरीको शीर्षक' : 'Subject / Title'} <span className="required">*</span>
                      </label>
                      <span style={{ fontSize: '0.6875rem', color: formData.title.length < 5 ? '#94A3B8' : '#0D8178' }}>
                        {formData.title.length}/100
                      </span>
                    </div>
                    <input
                      id="complaintTitle"
                      type="text"
                      maxLength={100}
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder={isNe ? 'जस्तै: कम्प्युटर ल्याब १ को मनिटर डिस्प्ले नखुलेको' : 'e.g. Workstation PC 08 blue screen error in Computer Lab 2'}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: null });
                      }}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.title && <span className="form-error-msg">{errors.title}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label htmlFor="complaintDescription" className="form-label" style={{ margin: 0 }}>
                        {isNe ? 'समस्याको विस्तृत विवरण' : 'Detailed Description'} <span className="required">*</span>
                      </label>
                      <span style={{ fontSize: '0.6875rem', color: formData.description.length < 15 ? '#94A3B8' : '#0D8178' }}>
                        {isNe ? 'कम्तीमा १५ अक्षर' : 'Min 15 chars'} ({formData.description.length})
                      </span>
                    </div>
                    <textarea
                      id="complaintDescription"
                      rows={5}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder={isNe ? 'कृपया ल्याब नम्बर, कम्प्युटर आइडी, र समस्याको स्पष्ट लक्षण खुलाउनुहोस्...' : 'Please specify the lab room number, PC station ID, exact error messages, and reproducible steps...'}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: null });
                      }}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.description && <span className="form-error-msg">{errors.description}</span>}
                  </div>
                </div>

                {/* SECTION 3: SUPPORTING EVIDENCE */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '18px',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Upload size={18} color="#15365B" />
                    <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                      {isNe ? '३. ऐच्छिक प्रमाण वा तस्बिर' : '3. Optional Photo / Log Attachment'}
                    </h2>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 var(--space-4)' }}>
                    {isNe
                      ? 'त्रुटिको स्क्रिनसट वा तस्बिर अपलोड गर्नुहोस् (JPG, PNG, वा PDF मात्र; अधिकतम ५ MB)'
                      : 'Attach a screenshot or terminal error log (JPG, PNG, or PDF only; max 5 MB). Uploads are private and accessible only to IT staff.'}
                  </p>

                  {selectedFile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#F0FDFA',
                      border: '1px solid #CCFBF1',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} color="#0D8178" />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A' }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {(selectedFile.size / 1024).toFixed(0)} KB • Ready for upload
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px',
                          borderRadius: '4px'
                        }}
                        title={isNe ? 'फाइल हटाउनुहोस्' : 'Remove file'}
                        aria-label="Remove attached file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{ position: 'relative' }}
                    >
                      <input
                        id="attachmentFile"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="attachmentFile"
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
                      >
                        <Upload size={24} color={isDragging ? '#0D8178' : '#64748B'} />
                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#15365B' }}>
                          {isNe ? 'फाइल चयन गर्न यहाँ थिच्नुहोस् वा तानेर छोड्नुहोस्' : 'Click to browse or drag and drop file here'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          JPG, PNG, or PDF up to 5 MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* SUBMIT BUTTON ROW */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  <Link to="/" className="btn btn-secondary btn-md" style={{ textDecoration: 'none' }}>
                    {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </Link>

                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isSubmitting}
                    style={{ minWidth: '170px', height: '44px' }}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span className="animate-spin">•</span>
                        <span>{isNe ? 'दर्ता हुँदैछ...' : 'Submitting to database...'}</span>
                      </span>
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
