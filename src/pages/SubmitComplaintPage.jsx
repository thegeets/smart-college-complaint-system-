import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  ShieldAlert,
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
  const navigate = useNavigate();
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      <PublicNavbar />

      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-4)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          
          {/* Back link */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link 
              to="/" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: '600', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              <span>{isNe ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Home'}</span>
            </Link>
          </div>

          {/* Success Confirmation Card */}
          {successData ? (
            <div className="card" style={{ padding: 'var(--space-8)', border: '1px solid #10B981' }}>
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
                    ? 'तपाईंको उजुरी सोध कलेज अफ आईटीको डाटाबेसमा सुरक्षित भइसकेको छ।'
                    : 'Your grievance has been permanently saved to the college complaint database.'}
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
                  <KeyRound size={18} color="#0F766E" />
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
                      color: '#15365D'
                    }}>
                      {successData.reference}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(successData.reference, 'ref')}
                      className="btn btn-secondary btn-md"
                      title="Copy Reference"
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
                      color: '#0F766E',
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
                    >
                      {copiedSecret ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                      <span>{copiedSecret ? (isNe ? 'कपी भयो' : 'Copied') : (isNe ? 'कपी' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Important Notice */}
                <div style={{
                  padding: '10px 12px',
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
                    : 'Because student registration is not required, both the Reference ID and Tracking Secret are strictly required to check progress and responses. This secret is shown only once and cannot be recovered automatically. If lost, contact the college desk at info@sochcollege.edu.np.'}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link 
                  to={`/track?ref=${encodeURIComponent(successData.reference)}&secret=${encodeURIComponent(successData.trackingSecret)}`} 
                  className="btn btn-primary btn-md"
                >
                  <span>{isNe ? 'अहिले नै उजुरी ट्र्याक गर्नुहोस्' : 'Track This Complaint'}</span>
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
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
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

              {/* Server Error Alert (Preserves inputs) */}
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
                <Info size={15} color="#0F766E" style={{ flexShrink: 0 }} />
                <span>
                  {isNe
                    ? 'विद्यार्थी परिचयपत्र वा रोल नम्बर प्रविष्ट गर्नाले कलेजको सदस्यता स्वचालित रूपमा प्रमाणीकरण हुँदैन। दर्ता भएका उजुरीहरू कलेज प्रशासनद्वारा जाँचिनेछन्।'
                    : 'Entering a student ID or roll number does not verify college membership. Submissions are triaged directly by college IT staff.'}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                
                {/* Fieldset 1: Student Information */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6)' }}>
                  <legend style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-3)' }}>
                    {isNe ? '१. विद्यार्थी विवरण' : '1. Student Information'}
                  </legend>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* Student Name */}
                    <div className="form-group">
                      <label htmlFor="studentName" className="form-label">
                        {isNe ? 'पूरा नाम' : 'Full Name'} <span className="required">*</span>
                      </label>
                      <input
                        id="studentName"
                        type="text"
                        className={`form-input ${errors.studentName ? 'error' : ''}`}
                        placeholder="e.g. Kiran Shrestha"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        disabled={isSubmitting}
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
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        disabled={isSubmitting}
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
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isSubmitting}
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
                </fieldset>

                {/* Fieldset 2: Complaint Details */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6)' }}>
                  <legend style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-3)' }}>
                    {isNe ? '२. उजुरीको विवरण' : '2. Complaint Details'}
                  </legend>

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
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled={isSubmitting}
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
                    <label htmlFor="complaintTitle" className="form-label">
                      {isNe ? 'उजुरीको शीर्षक' : 'Subject / Title'} <span className="required">*</span>
                    </label>
                    <input
                      id="complaintTitle"
                      type="text"
                      className={`form-input ${errors.title ? 'error' : ''}`}
                      placeholder={isNe ? 'जस्तै: कम्प्युटर ल्याबको मनिटर डिस्प्ले नखुलेको वा इन्टरनेट अवरुद्ध भएको' : 'e.g. Monitor display not powering on or slow network in computer lab'}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={isSubmitting}
                    />
                    {errors.title && <span className="form-error-msg">{errors.title}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label htmlFor="complaintDescription" className="form-label">
                      {isNe ? 'समस्याको विस्तृत विवरण' : 'Detailed Description'} <span className="required">*</span>
                    </label>
                    <textarea
                      id="complaintDescription"
                      rows={5}
                      className={`form-textarea ${errors.description ? 'error' : ''}`}
                      placeholder={isNe ? 'कृपया समस्या, ल्याब नम्बर, र प्रयोग गरिएको सफ्टवेयरको विवरण स्पष्ट लेख्नुहोस्...' : 'Please specify the room, workstation number, symptoms, and any steps to reproduce...'}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isSubmitting}
                    />
                    {errors.description && <span className="form-error-msg">{errors.description}</span>}
                  </div>
                </fieldset>

                {/* Fieldset 3: Optional Attachment */}
                <fieldset style={{ border: 'none', padding: 0, margin: '0 0 var(--space-6)' }}>
                  <legend style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
                    {isNe ? '३. ऐच्छिक प्रमाण वा तस्बिर' : '3. Optional Attachment'}
                  </legend>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 var(--space-3)' }}>
                    {isNe
                      ? 'त्रुटिको स्क्रिनसट वा तस्बिर अपलोड गर्नुहोस् (JPG, PNG, PDF मात्र; अधिकतम ५ MB)'
                      : 'Attach a screenshot or error log (JPG, PNG, or PDF only; max 5 MB). Uploads are stored privately and accessible only to administrators.'}
                  </p>

                  {selectedFile ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#0F766E" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A' }}>
                          {selectedFile.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
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
                          padding: '4px'
                        }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
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
                          padding: '24px',
                          border: '2px dashed #CBD5E1',
                          borderRadius: '6px',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer',
                          gap: '6px'
                        }}
                      >
                        <Upload size={22} color="#64748B" />
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#15365D' }}>
                          {isNe ? 'फाइल चयन गर्नुहोस्' : 'Click to select an attachment'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          JPG, PNG, or PDF up to 5 MB
                        </span>
                      </label>
                    </div>
                  )}
                </fieldset>

                {/* Submit button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  <Link to="/" className="btn btn-secondary btn-md" style={{ textDecoration: 'none' }}>
                    {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </Link>

                  <button
                    type="submit"
                    className="btn btn-primary btn-md"
                    disabled={isSubmitting}
                    style={{ minWidth: '160px' }}
                  >
                    {isSubmitting ? (
                      <span>{isNe ? 'दर्ता हुँदैछ...' : 'Submitting to database...'}</span>
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
