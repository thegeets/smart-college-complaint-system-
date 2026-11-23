import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { MOTION_EASE } from '../lib/motion';
import {
  Wifi,
  Monitor,
  Cpu,
  Tv,
  BookOpen,
  Laptop,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Clock,
  Sparkles,
  RotateCcw,
  MapPin,
} from 'lucide-react';

const CATEGORY_MAP = {
  'wifi-network': 'Wi-Fi & Campus Network',
  'computer-lab': 'Computer Lab & Workstations',
  'programming-tools': 'Programming Tools & OS',
  'classroom-projectors': 'Classroom Projectors & Tech',
  'programming-classes': 'Programming Classes / Assignments',
  'it-project': 'IT Project / Supervision',
};

const CATEGORIES_CONFIG = [
  {
    key: 'Wi-Fi & Campus Network',
    labelEn: 'Wi-Fi & Campus Network',
    labelNe: 'वाइफाई तथा क्याम्पस नेटवर्क',
    descEn: 'Captive portal authentication, eduroam, high latency, or lab disconnects.',
    icon: Wifi,
    commonIssues: [
      'Captive portal login loop in Library',
      'Wi-Fi signal drops frequently in Lab 2',
      'Cannot connect to campus eduroam',
      'High packet loss during online practical',
    ],
  },
  {
    key: 'Computer Lab & Workstations',
    labelEn: 'Computer Lab & Workstations',
    labelNe: 'कम्प्युटर ल्याब तथा वर्कस्टेसन',
    descEn: 'PC failing to boot, blue screens, faulty monitors, keyboards, or mice.',
    icon: Monitor,
    commonIssues: [
      'PC will not power on in Lab 1',
      'Monitor flickering red tint on Workstation #8',
      'Keyboard keys sticking / unresponsive',
      'Windows boot error / crash loop',
    ],
  },
  {
    key: 'Programming Tools & OS',
    labelEn: 'Programming Tools & OS',
    labelNe: 'प्रोग्रामिङ औजार तथा अपरेटिङ सिस्टम',
    descEn: 'VS Code, GCC/Clang, Python virtualenvs, Git credentials, or Ubuntu dual-boot.',
    icon: Cpu,
    commonIssues: [
      'VS Code C++ compiler path not found',
      'Python pip permission denied on lab machines',
      'Git credential helper broken',
      'Ubuntu dual-boot grub error',
    ],
  },
  {
    key: 'Classroom Projectors & Tech',
    labelEn: 'Classroom Projectors & Tech',
    labelNe: 'कक्षाकोठा प्रोजेक्टर तथा प्रविधि',
    descEn: 'Ceiling projector color fading, broken HDMI cables, or speaker hum.',
    icon: Tv,
    commonIssues: [
      'Ceiling projector lamp flickering in Room 201',
      'HDMI port bent / signal cutting out',
      'Classroom soundbar audio buzzing',
      'Smart display touch calibration off',
    ],
  },
  {
    key: 'Programming Classes / Assignments',
    labelEn: 'Programming Classes & Labs',
    labelNe: 'प्रोग्रामिङ कक्षा तथा प्रयोगात्मक ल्याब',
    descEn: 'Required graphics libraries (OpenGL), databases, or practical runtime issues.',
    icon: BookOpen,
    commonIssues: [
      'OpenGL freeglut headers missing for Computer Graphics',
      'MySQL service stopped on Lab 2 PCs',
      'Java JDK version mismatch with syllabus tools',
      'Network socket blocked for DSA practical',
    ],
  },
  {
    key: 'IT Project / Supervision',
    labelEn: 'IT Project & Senior Labs',
    labelNe: 'आईटी प्रोजेक्ट तथा ल्याब सुपरिवेक्षण',
    descEn: 'Senior semester project VMs, testing server ports, or dedicated lab hardware.',
    icon: Laptop,
    commonIssues: [
      'Project VM bridge connection down',
      'Local development server port 8080 blocked',
      'Need GPU workstation access for ML project',
      'Senior project lab access card error',
    ],
  },
];

const QUICK_LOCATIONS = [
  'Lab 1 (Ground Floor)',
  'Lab 2 (1st Floor)',
  'Lab 3 (2nd Floor)',
  'Room 101 (Block A)',
  'Room 202 (Block B)',
  'Campus Library',
  'Senior Project Lab',
];

const PRIORITY_OPTIONS = [
  {
    value: 'Low',
    labelEn: 'Low Priority',
    slaEn: '48h SLA',
    hintEn: 'Minor cosmetic flaw or non-urgent setup inquiry.',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    value: 'Medium',
    labelEn: 'Medium Priority',
    slaEn: '48h SLA',
    hintEn: 'Standard problem affecting a single workstation.',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    value: 'High',
    labelEn: 'High Priority',
    slaEn: '24h SLA',
    hintEn: 'Affects multiple students or practical class.',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
  {
    value: 'Urgent',
    labelEn: 'Urgent Priority',
    slaEn: '24h SLA',
    hintEn: 'Total lab outage, lab exam disruption, or safety issue.',
    color: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
  },
];

const DRAFT_STORAGE_KEY = 'sccs_complaint_draft_v2';

export function SubmitComplaintPage() {
  const {
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    submitStudentComplaint,
    language,
    showToast,
  } = useApp();

  const isNe = language === 'ne';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Wizard Step (1: Category & Common Issue, 2: Details & Location, 3: Evidence & Review)
  const [step, setStep] = useState(1);

  // Authentication guard: redirect unauthenticated visitor to login preserving intended target
  useEffect(() => {
    if (!isCheckingStudentSession && !isStudentLoggedIn) {
      const redirectUrl = location.search ? `/submit${location.search}` : '/submit';
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`, { replace: true });
    }
  }, [isCheckingStudentSession, isStudentLoggedIn, navigate, location.search]);

  // Derive initial category from query param
  const rawCategoryParam = searchParams.get('category') || '';
  const resolvedCategory = CATEGORY_MAP[rawCategoryParam] || rawCategoryParam;

  // Form State
  const [formData, setFormData] = useState(() => {
    // Check localStorage for saved draft
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            category: resolvedCategory || parsed.category || '',
            title: parsed.title || '',
            description: parsed.description || '',
            location: parsed.location || '',
            pcNumber: parsed.pcNumber || '',
            priority: parsed.priority || 'Medium',
          };
        }
      }
    } catch {
      // Ignore parse errors
    }
    return {
      category: resolvedCategory || '',
      title: '',
      description: '',
      location: '',
      pcNumber: '',
      priority: 'Medium',
    };
  });

  // Attachments (up to 3 files, max 5 MB each)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [hasCopiedRef, setHasCopiedRef] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  // Draft Autosave to localStorage (only text data, never files)
  useEffect(() => {
    if (submittedComplaint) return;
    const hasData =
      formData.category ||
      formData.title.trim() ||
      formData.description.trim() ||
      formData.location.trim() ||
      formData.pcNumber.trim();

    if (hasData) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        const timer = setTimeout(() => {
          setDraftSavedAt(new Date());
        }, 0);
        return () => clearTimeout(timer);
      } catch {
        // quota exceeded fallback
      }
    }
  }, [formData, submittedComplaint]);

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore storage error
    }
    setFormData({
      category: '',
      title: '',
      description: '',
      location: '',
      pcNumber: '',
      priority: 'Medium',
    });
    setSelectedFiles([]);
    setDraftSavedAt(null);
    showToast(isNe ? 'मस्यौदा मेटाइयो।' : 'Draft cleared.', 'info');
  };

  // Generate previews for attachments
  const filePreviews = useMemo(() => {
    return selectedFiles.map((file) => {
      const isImg = file.type.startsWith('image/');
      return {
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        isImage: isImg,
        url: isImg ? URL.createObjectURL(file) : null,
      };
    });
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      filePreviews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [filePreviews]);

  const handleFilesAdded = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);

    if (selectedFiles.length + newFiles.length > 3) {
      showToast(isNe ? 'अधिकतम ३ वटा फाइल मात्र संलग्न गर्न सकिन्छ।' : 'You can attach a maximum of 3 files.', 'error');
      return;
    }

    const validNewFiles = [];
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(
          isNe
            ? `फाइल "${file.name}" ५ MB भन्दा ठूलो छ।`
            : `File "${file.name}" exceeds 5 MB limit.`,
          'error'
        );
        continue;
      }
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.pdf', '.webp'].includes(ext)) {
        showToast(
          isNe
            ? `फाइल प्रकार अस्वीकृत: ${ext}। केवल JPG, PNG, PDF, WEBP स्वीकार गरिन्छ।`
            : `File type "${ext}" not supported. Only JPG, PNG, PDF, and WEBP allowed.`,
          'error'
        );
        continue;
      }
      validNewFiles.push(file);
    }

    if (validNewFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validNewFiles]);
      showToast(
        isNe
          ? `${validNewFiles.length} फाइल संलग्न गरियो।`
          : `${validNewFiles.length} file(s) attached.`,
        'info'
      );
    }
  };

  const handleRemoveFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs = {};
    if (!formData.category) {
      errs.category = isNe ? 'कृपया उजुरीको विधा छनोट गर्नुहोस्।' : 'Please select an issue category.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      errs.title = isNe ? 'शीर्षक कम्तीमा ५ अक्षरको हुनुपर्छ।' : 'Title must be at least 5 characters.';
    } else if (formData.title.trim().length > 100) {
      errs.title = isNe ? 'शीर्षक १०० अक्षरभन्दा बढी हुन सक्दैन।' : 'Title cannot exceed 100 characters.';
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = isNe
        ? 'विवरण कम्तीमा २० अक्षरको हुनुपर्छ (थप प्रष्ट पार्नुहोस्)।'
        : 'Description must be at least 20 characters (provide key details).';
    } else if (formData.description.trim().length > 1500) {
      errs.description = isNe ? 'विवरण १५०० अक्षरभन्दा बढी हुन सक्दैन।' : 'Description cannot exceed 1500 characters.';
    }

    if (!formData.location.trim() || formData.location.trim().length < 2) {
      errs.location = isNe ? 'कृपया समस्या भएको स्थान/ल्याब उल्लेख गर्नुहोस्।' : 'Please specify the lab or classroom location.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Wizard Navigation
  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission
  const handleSubmitComplaint = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      showToast('Please resolve validation errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const data = await submitStudentComplaint(formData, selectedFiles);
      setSubmittedComplaint(data.complaint || data);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore storage error
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      setServerError(err.message || 'Failed to submit complaint. Please check your inputs.');
      if (err.errors) setErrors(err.errors);
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    const ref = submittedComplaint?.referenceId || submittedComplaint?.reference;
    if (ref) {
      navigator.clipboard.writeText(ref);
      setHasCopiedRef(true);
      showToast(isNe ? 'सन्दर्भ कोड प्रतिलिपि गरियो!' : 'Reference ID copied to clipboard!', 'success');
      setTimeout(() => setHasCopiedRef(false), 2500);
    }
  };

  const selectedCategoryConfig = CATEGORIES_CONFIG.find((c) => c.key === formData.category);

  if (isCheckingStudentSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <p style={{ fontWeight: 600, color: '#101D35' }}>Verifying student credentials...</p>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
        <PublicNavbar />

        <main style={{ flex: 1, padding: '36px 16px 64px' }}>
          <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto' }}>

            {/* Back link */}
            <div style={{ marginBottom: '18px' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: '#64748B',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <ArrowLeft size={15} />
                <span>{isNe ? 'मेरो ड्यासबोर्डमा फर्कनुहोस्' : 'Back to Student Dashboard'}</span>
              </Link>
            </div>

            {/* =========================================================================
                SUCCESS SCREEN: Rendered when submittedComplaint exists
                ========================================================================= */}
            {submittedComplaint ? (
              <m.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: MOTION_EASE }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '40px 32px',
                  boxShadow: '0 4px 24px -2px rgba(16, 29, 53, 0.08)',
                  textAlign: 'center',
                }}
              >
                {/* Animated Draw Checkmark */}
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    border: '2px solid #10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <m.svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <m.polyline
                      points="20 6 9 17 4 12"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </m.svg>
                </div>

                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                  }}
                >
                  Grievance Registered Successfully
                </span>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#101D35', margin: '0 0 10px 0' }}>
                  {isNe ? 'तपाईंको उजुरी दर्ता भएको छ' : 'Complaint Successfully Lodged'}
                </h1>

                <p style={{ fontSize: '0.9375rem', color: '#64748B', maxWidth: '540px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  {isNe
                    ? 'हाम्रो ल्याब प्राविधिक टोलीलाई सूचना पठाइएको छ। तपाईं आफ्नो ड्यासबोर्डबाट वास्तविक समयमा यसको अनुगमन गर्न सक्नुहुन्छ।'
                    : 'Your grievance has been logged into our campus IT queue. The responsible laboratory technician has been assigned.'}
                </p>

                {/* Reference Code Box */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    maxWidth: '480px',
                    margin: '0 auto 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                      Reference Code
                    </span>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.375rem', fontWeight: 800, color: '#101D35', letterSpacing: '0.04em' }}>
                      {submittedComplaint.referenceId || submittedComplaint.reference}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyReference}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: hasCopiedRef ? '#10B981' : '#FFFFFF',
                      color: hasCopiedRef ? '#FFFFFF' : '#101D35',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {hasCopiedRef ? <Check size={14} /> : <Copy size={14} />}
                    <span>{hasCopiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* SLA Indicator */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    marginBottom: '32px',
                  }}
                >
                  <Clock size={16} />
                  <span>
                    Target SLA: {submittedComplaint.priority === 'Urgent' || submittedComplaint.priority === 'High' ? 'Within 24 Hours' : 'Within 48 Hours'}
                    {submittedComplaint.slaDueAt && ` (Due ${new Date(submittedComplaint.slaDueAt).toLocaleDateString()})`}
                  </span>
                </div>

                {/* 4-Stage Resolution Pipeline View */}
                <div style={{ maxWidth: '600px', margin: '0 auto 36px', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '14px', textAlign: 'center' }}>
                    Resolution Pipeline
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
                    {[
                      { name: 'Submitted', active: true, done: true },
                      { name: 'Under Review', active: false, done: false },
                      { name: 'In Progress', active: false, done: false },
                      { name: 'Resolved', active: false, done: false },
                    ].map((st, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: st.done ? '#101D35' : '#F1F5F9',
                            color: st.done ? '#FFFFFF' : '#94A3B8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: st.done ? 700 : 500, color: st.done ? '#101D35' : '#94A3B8' }}>
                          {st.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    style={{
                      backgroundColor: '#101D35',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{isNe ? 'ड्यासबोर्डमा हेर्नुहोस्' : 'Track in My Complaints'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedComplaint(null);
                      setStep(1);
                      setFormData({
                        category: '',
                        title: '',
                        description: '',
                        location: '',
                        pcNumber: '',
                        priority: 'Medium',
                      });
                      setSelectedFiles([]);
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#101D35',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>{isNe ? 'अर्को उजुरी दिनुहोस्' : 'Submit Another Complaint'}</span>
                  </button>
                </div>
              </m.div>
            ) : (
              /* =========================================================================
                  WIZARD FORM: Steps 1, 2, 3
                  ========================================================================= */
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  boxShadow: '0 2px 16px -2px rgba(16, 29, 53, 0.05)',
                }}
              >
                {/* Header & Title */}
                <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#356ACB',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {COLLEGE_CONFIG.name} IT Service Desk
                      </span>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#101D35', margin: '4px 0 0 0' }}>
                        {isNe ? 'नयाँ क्याम्पस उजुरी दर्ता' : 'Submit a Campus IT Complaint'}
                      </h1>
                    </div>

                    {/* Autosave Draft Badge */}
                    {draftSavedAt && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.6875rem',
                          color: '#64748B',
                        }}
                      >
                        <Sparkles size={12} color="#356ACB" />
                        <span>Draft saved</span>
                        <button
                          type="button"
                          onClick={handleClearDraft}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            fontSize: '0.6875rem',
                            padding: '0 0 0 4px',
                            textDecoration: 'underline',
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3-Step Wizard Navigation Stepper */}
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', position: 'relative' }}>
                      {[
                        { num: 1, title: isNe ? '१. विधा छनोट' : '1. Category & Issue' },
                        { num: 2, title: isNe ? '२. विस्तृत विवरण' : '2. Details & Location' },
                        { num: 3, title: isNe ? '३. प्रमाण र समीक्षा' : '3. Evidence & Review' },
                      ].map((s) => {
                        const isCurrent = step === s.num;
                        const isCompleted = step > s.num;
                        return (
                          <div
                            key={s.num}
                            onClick={() => {
                              if (s.num < step) setStep(s.num);
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              backgroundColor: isCurrent ? '#EFF6FF' : isCompleted ? '#F8FAFC' : '#FFFFFF',
                              border: `1px solid ${isCurrent ? '#BFDBFE' : isCompleted ? '#E2E8F0' : '#E2E8F0'}`,
                              cursor: s.num < step ? 'pointer' : 'default',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isCurrent ? '#2563EB' : isCompleted ? '#101D35' : '#E2E8F0',
                                color: isCurrent || isCompleted ? '#FFFFFF' : '#64748B',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {isCompleted ? <Check size={12} /> : s.num}
                            </div>
                            <span
                              style={{
                                fontSize: '0.8125rem',
                                fontWeight: isCurrent ? 700 : 600,
                                color: isCurrent ? '#1E40AF' : isCompleted ? '#101D35' : '#64748B',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {s.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Server Error Banner */}
                {serverError && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#B91C1C',
                      fontSize: '0.875rem',
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* =====================================================================
                    STEP 1: Category Selection & Dynamic Common Issue Chips
                    ===================================================================== */}
                {step === 1 && (
                  <m.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: MOTION_EASE }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#101D35', marginBottom: '6px' }}>
                        {isNe ? 'उजुरीको विधा छनोट गर्नुहोस्' : 'Select Issue Category'} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
                        {isNe
                          ? 'कलेजको ६ वटा आधिकारिक प्राविधिक सेवा विधाहरू मध्ये एक छान्नुहोस्:'
                          : 'Choose the area best matching your technical problem:'}
                      </p>
                    </div>

                    {errors.category && (
                      <p style={{ color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 12px 0' }}>
                        {errors.category}
                      </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
                      {CATEGORIES_CONFIG.map((cat) => {
                        const isSelected = formData.category === cat.key;
                        const Icon = cat.icon;
                        return (
                          <div
                            key={cat.key}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, category: cat.key }));
                              setErrors((prev) => ({ ...prev, category: null }));
                            }}
                            style={{
                              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                              border: `1.5px solid ${isSelected ? '#356ACB' : '#E2E8F0'}`,
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              boxShadow: isSelected ? '0 4px 14px -2px rgba(53, 106, 203, 0.15)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  backgroundColor: isSelected ? '#356ACB' : '#F1F5F9',
                                  color: isSelected ? '#FFFFFF' : '#101D35',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Icon size={18} />
                              </div>
                              {isSelected && (
                                <div
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#356ACB',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101D35', margin: '0 0 4px 0' }}>
                                {isNe ? cat.labelNe : cat.labelEn}
                              </h3>
                              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                                {cat.descEn}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Common Issue Chips for Selected Category */}
                    {selectedCategoryConfig && (
                      <m.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '16px 18px',
                          marginBottom: '28px',
                        }}
                      >
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Common issues in this category (click to auto-fill title):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedCategoryConfig.commonIssues.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, title: chip }));
                                setErrors((prev) => ({ ...prev, title: null }));
                                showToast('Title autofilled from suggestion.', 'info');
                              }}
                              style={{
                                backgroundColor: formData.title === chip ? '#EFF6FF' : '#FFFFFF',
                                border: `1px solid ${formData.title === chip ? '#356ACB' : '#CBD5E1'}`,
                                color: formData.title === chip ? '#1E40AF' : '#1E293B',
                                borderRadius: '9999px',
                                padding: '5px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              + {chip}
                            </button>
                          ))}
                        </div>
                      </m.div>
                    )}

                    {/* Step 1 Actions */}
                    <div className="wizard-actions-footer" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!formData.category}
                        style={{
                          backgroundColor: formData.category ? '#101D35' : '#94A3B8',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: formData.category ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{isNe ? 'अर्को चरण: विवरण भर्नुहोस्' : 'Next: Fill Issue Details'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </m.div>
                )}

                {/* =====================================================================
                    STEP 2: Issue Details, Location, PC Number & Priority
                    ===================================================================== */}
                {step === 2 && (
                  <m.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: MOTION_EASE }}
                  >
                    {/* Complaint Title */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label htmlFor="complaint-title" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101D35' }}>
                          {isNe ? 'उजुरीको शीर्षक' : 'Complaint Title'} <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <span style={{ fontSize: '0.75rem', color: formData.title.length > 100 ? '#DC2626' : '#64748B' }}>
                          {formData.title.length} / 100
                        </span>
                      </div>
                      <input
                        id="complaint-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (errors.title) setErrors({ ...errors, title: null });
                        }}
                        placeholder="e.g. Workstation #14 blue screen crash during Database practical"
                        maxLength={100}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${errors.title ? '#DC2626' : '#CBD5E1'}`,
                          fontSize: '0.875rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      {errors.title && (
                        <p style={{ color: '#DC2626', fontSize: '0.8125rem', margin: '4px 0 0 0' }}>{errors.title}</p>
                      )}
                    </div>

                    {/* Location Field with Quick Suggestion Pills */}
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="complaint-location" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#101D35', marginBottom: '6px' }}>
                        {isNe ? 'ल्याब / कक्षाकोठा स्थान' : 'Campus Location'} <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            id="complaint-location"
                            type="text"
                            value={formData.location}
                            onChange={(e) => {
                              setFormData({ ...formData, location: e.target.value });
                              if (errors.location) setErrors({ ...errors, location: null });
                            }}
                            placeholder="e.g. Lab 2 (1st Floor) or Room 102"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: `1px solid ${errors.location ? '#DC2626' : '#CBD5E1'}`,
                              fontSize: '0.875rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      {/* Location suggestions */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {QUICK_LOCATIONS.map((loc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, location: loc }));
                              setErrors((prev) => ({ ...prev, location: null }));
                            }}
                            style={{
                              backgroundColor: formData.location === loc ? '#EFF6FF' : '#F1F5F9',
                              border: `1px solid ${formData.location === loc ? '#356ACB' : '#E2E8F0'}`,
                              color: formData.location === loc ? '#1E40AF' : '#475569',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                            }}
                          >
                            <MapPin size={10} style={{ display: 'inline', marginRight: '3px' }} />
                            {loc}
                          </button>
                        ))}
                      </div>
                      {errors.location && (
                        <p style={{ color: '#DC2626', fontSize: '0.8125rem', margin: '4px 0 0 0' }}>{errors.location}</p>
                      )}
                    </div>

                    {/* Optional PC / Workstation ID */}
                    <div style={{ marginBottom: '20px' }}>
                      <label htmlFor="complaint-pc" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#101D35', marginBottom: '6px' }}>
                        {isNe ? 'कम्प्युटर / वर्कस्टेसन नम्बर (ऐच्छिक)' : 'Workstation / PC Number (Optional)'}
                      </label>
                      <input
                        id="complaint-pc"
                        type="text"
                        value={formData.pcNumber}
                        onChange={(e) => setFormData({ ...formData, pcNumber: e.target.value })}
                        placeholder="e.g. LAB-2-PC14 or WS-09"
                        maxLength={30}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.875rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Complaint Description with Live Character Counter */}
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label htmlFor="complaint-desc" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101D35' }}>
                          {isNe ? 'समस्याको विस्तृत विवरण' : 'Detailed Description'} <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: formData.description.length < 20 ? '#DC2626' : formData.description.length > 1500 ? '#DC2626' : '#64748B',
                          }}
                        >
                          {formData.description.length} / 1500 {formData.description.length < 20 ? '(min 20)' : ''}
                        </span>
                      </div>
                      <textarea
                        id="complaint-desc"
                        rows={5}
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({ ...formData, description: e.target.value });
                          if (errors.description) setErrors({ ...errors, description: null });
                        }}
                        placeholder="Describe the steps to reproduce the issue, any error messages shown, and how it impacts your practical session..."
                        maxLength={1500}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${errors.description ? '#DC2626' : '#CBD5E1'}`,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                        }}
                      />
                      {errors.description && (
                        <p style={{ color: '#DC2626', fontSize: '0.8125rem', margin: '4px 0 0 0' }}>{errors.description}</p>
                      )}
                    </div>

                    {/* Priority Selector with SLA hints */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#101D35', marginBottom: '8px' }}>
                        {isNe ? 'प्राथमिकता स्तर' : 'Urgency & Priority Level'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {PRIORITY_OPTIONS.map((p) => {
                          const isSelected = formData.priority === p.value;
                          return (
                            <div
                              key={p.value}
                              onClick={() => setFormData({ ...formData, priority: p.value })}
                              style={{
                                backgroundColor: isSelected ? p.bg : '#FFFFFF',
                                border: `1.5px solid ${isSelected ? p.color : '#E2E8F0'}`,
                                borderRadius: '10px',
                                padding: '12px 14px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? p.color : '#101D35' }}>
                                  {p.labelEn}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 700,
                                    color: p.color,
                                    backgroundColor: '#FFFFFF',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: `1px solid ${p.border}`,
                                  }}
                                >
                                  {p.slaEn}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.6875rem', color: '#64748B', lineHeight: 1.35 }}>
                                {p.hintEn}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="wizard-actions-footer" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#64748B',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        style={{
                          backgroundColor: '#101D35',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span>{isNe ? 'प्रमाण र समीक्षामा जानुहोस्' : 'Next: Evidence & Review'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </m.div>
                )}

                {/* =====================================================================
                    STEP 3: Attachments (up to 3) & Complete Summary Review
                    ===================================================================== */}
                {step === 3 && (
                  <m.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: MOTION_EASE }}
                  >
                    {/* Drag-and-Drop Attachment Zone */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#101D35', marginBottom: '6px' }}>
                        {isNe ? 'फोटो वा कागजात संलग्न गर्नुहोस् (अधिकतम ३)' : 'Evidence & Screenshots (Up to 3 files)'}
                      </label>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.8125rem', color: '#64748B' }}>
                        Attach screenshots of error dialogues or photos of faulty hardware (JPG, PNG, PDF, WEBP up to 5 MB each).
                      </p>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleFilesAdded(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: `2px dashed ${isDragging ? '#356ACB' : '#CBD5E1'}`,
                          backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                          borderRadius: '12px',
                          padding: '28px 20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf,.webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFilesAdded(e.target.files)}
                        />
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px',
                            color: '#356ACB',
                          }}
                        >
                          <Upload size={20} />
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: '#101D35' }}>
                          Drag and drop files here, or <span style={{ color: '#356ACB', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          JPG, PNG, PDF, WEBP &bull; Max 5 MB each &bull; {selectedFiles.length} of 3 added
                        </span>
                      </div>

                      {/* File Previews List */}
                      {filePreviews.length > 0 && (
                        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {filePreviews.map((preview, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                padding: '10px 14px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                {preview.isImage && preview.url ? (
                                  <img
                                    src={preview.url}
                                    alt="Preview"
                                    style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '4px',
                                      backgroundColor: '#EFF6FF',
                                      color: '#356ACB',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <FileText size={18} />
                                  </div>
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                  <span style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#101D35', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {preview.name}
                                  </span>
                                  <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>{preview.size}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                title="Remove file"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DC2626',
                                  cursor: 'pointer',
                                  padding: '6px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review Summary Card with Quick Jump Links */}
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '28px',
                      }}
                    >
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#101D35', margin: '0 0 16px 0', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                        Review Complaint Details
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8125rem' }}>
                        {/* Section 1: Category & Priority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>CATEGORY & PRIORITY</span>
                            <span style={{ fontWeight: 700, color: '#101D35', marginRight: '8px' }}>{formData.category}</span>
                            <span
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                              }}
                            >
                              {formData.priority} Priority
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            style={{ background: 'none', border: 'none', color: '#356ACB', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                          >
                            Edit
                          </button>
                        </div>

                        {/* Section 2: Location & PC Number */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>LOCATION</span>
                            <span style={{ fontWeight: 600, color: '#101D35' }}>
                              {formData.location} {formData.pcNumber ? `(Workstation: ${formData.pcNumber})` : ''}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            style={{ background: 'none', border: 'none', color: '#356ACB', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                          >
                            Edit
                          </button>
                        </div>

                        {/* Section 3: Title & Description */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>TITLE & DESCRIPTION</span>
                            <span style={{ fontWeight: 700, color: '#101D35', display: 'block', marginBottom: '2px' }}>{formData.title}</span>
                            <p style={{ margin: 0, color: '#475569', lineHeight: 1.45 }}>{formData.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            style={{ background: 'none', border: 'none', color: '#356ACB', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                          >
                            Edit
                          </button>
                        </div>

                        {/* Section 4: Attachments count */}
                        <div>
                          <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ATTACHMENTS</span>
                          <span style={{ fontWeight: 600, color: '#101D35' }}>
                            {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) attached` : 'No files attached (optional)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 Actions */}
                    <div className="wizard-actions-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: '#FFFFFF',
                          color: '#64748B',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitComplaint}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: isSubmitting ? '#94A3B8' : '#101D35',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 28px',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(16, 29, 53, 0.15)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid #FFFFFF',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite',
                              }}
                            />
                            <span>Lodging Grievance...</span>
                          </>
                        ) : (
                          <>
                            <span>Confirm & Submit Complaint</span>
                            <CheckCircle2 size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </m.div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </LazyMotion>
  );
}
