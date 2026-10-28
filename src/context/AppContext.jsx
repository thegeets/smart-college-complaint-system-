import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../config/translations';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  LANGUAGE: 'sccs_language_v3',
};

export const ALLOWED_CATEGORIES = [
  'Computer Lab / Hardware',
  'Internet / Wi-Fi / Network',
  'Software / Programming Tools',
  'Programming Classes / Assignments',
  'IT Project / Supervision',
  'Classroom Technology / Projector',
];

export const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const ALLOWED_STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export function AppProvider({ children }) {
  // 1. Language State ('en' | 'ne')
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'ne' || saved === 'np') return 'ne';
      if (saved === 'en') return 'en';
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang) => {
    const valid = newLang === 'ne' || newLang === 'np' ? 'ne' : 'en';
    setLanguageState(valid);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, valid);
      document.documentElement.lang = valid;
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'ne' ? 'ne' : 'en';
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  }, [language, setLanguage]);

  // 2. Toast Notification Queue
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 3. Admin Authentication Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check admin session on mount
  const checkAdminSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          setIsAdminLoggedIn(true);
          setAdminUser(data.admin);
          setCsrfToken(data.csrfToken);
        } else {
          setIsAdminLoggedIn(false);
          setAdminUser(null);
        }
      } else {
        setIsAdminLoggedIn(false);
        setAdminUser(null);
      }
    } catch (err) {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  // 4. Student Authentication Session State
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [studentUser, setStudentUser] = useState(null);
  const [isCheckingStudentSession, setIsCheckingStudentSession] = useState(true);

  // Check student session on mount
  const checkStudentSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/student/auth/me', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          setIsStudentLoggedIn(true);
          setStudentUser(data.student);
          if (data.csrfToken) setCsrfToken(data.csrfToken);
        } else {
          setIsStudentLoggedIn(false);
          setStudentUser(null);
        }
      } else {
        setIsStudentLoggedIn(false);
        setStudentUser(null);
      }
    } catch (err) {
      setIsStudentLoggedIn(false);
      setStudentUser(null);
    } finally {
      setIsCheckingStudentSession(false);
    }
  }, []);

  useEffect(() => {
    checkAdminSession();
    checkStudentSession();
  }, [checkAdminSession, checkStudentSession]);

  // Real Student Registration
  const registerStudent = useCallback(async (formData) => {
    const res = await fetch('/api/v1/student/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.message || 'Registration failed.');
      err.errors = data.errors;
      throw err;
    }

    showToast(data.message || 'Student account created.', 'success');
    return data;
  }, [showToast]);

  // Real Student Email Verification
  const verifyStudentEmail = useCallback(async (email, token) => {
    const res = await fetch('/api/v1/student/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, token }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Verification failed. Please check the code.');
    }

    setIsStudentLoggedIn(true);
    setStudentUser(data.student);
    if (data.csrfToken) setCsrfToken(data.csrfToken);
    showToast(data.message || 'Email verified successfully.', 'success');
    return data;
  }, [showToast]);

  // Resend Student Verification Code
  const resendStudentVerification = useCallback(async (email) => {
    const res = await fetch('/api/v1/student/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to resend code.');
    }

    showToast(data.message || 'Verification code resent.', 'info');
    return data;
  }, [showToast]);

  // Real Student Login
  const loginStudent = useCallback(async (email, password) => {
    const res = await fetch('/api/v1/student/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    setIsStudentLoggedIn(true);
    setStudentUser(data.student);
    if (data.csrfToken) setCsrfToken(data.csrfToken);
    showToast(data.message || 'Welcome back to your dashboard.', 'success');
    return data;
  }, [showToast]);

  // Real Student Logout
  const logoutStudent = useCallback(async () => {
    try {
      await fetch('/api/v1/student/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Student logout request failed', e);
    } finally {
      setIsStudentLoggedIn(false);
      setStudentUser(null);
      showToast('Logged out of student session.', 'info');
    }
  }, [showToast]);

  // Real Student Profile Update
  const updateStudentProfile = useCallback(async (profileData) => {
    const res = await fetch('/api/v1/student/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update profile.');
    }

    setStudentUser(data.student);
    showToast(data.message || 'Profile updated.', 'success');
    return data;
  }, [showToast]);

  // Forgot / Reset Password
  const forgotStudentPassword = useCallback(async (email) => {
    const res = await fetch('/api/v1/student/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }, []);

  const resetStudentPassword = useCallback(async (email, token, newPassword) => {
    const res = await fetch('/api/v1/student/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to reset password.');
    }
    showToast(data.message || 'Password reset successfully.', 'success');
    return data;
  }, [showToast]);

  // 5. Authenticated Student Complaints Operations
  const fetchStudentComplaints = useCallback(async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);

    const res = await fetch(`/api/v1/student/complaints?${query.toString()}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load complaints.');
    }

    return data.complaints;
  }, []);

  const fetchStudentComplaintById = useCallback(async (id) => {
    const res = await fetch(`/api/v1/student/complaints/${id}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load complaint details.');
    }

    return data.complaint;
  }, []);

  const submitStudentComplaint = useCallback(async (formData, file) => {
    const body = new FormData();
    body.append('category', formData.category);
    body.append('title', formData.title);
    body.append('description', formData.description);
    body.append('priority', formData.priority || 'Medium');

    if (file) {
      body.append('attachment', file);
    }

    const res = await fetch('/api/v1/student/complaints', {
      method: 'POST',
      credentials: 'include',
      body,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.message || 'Failed to submit complaint.');
      err.errors = data.errors;
      throw err;
    }

    showToast('Complaint lodged successfully.', 'success');
    return data; // { success: true, message, complaint }
  }, [showToast]);

  const claimLegacyComplaint = useCallback(async (reference, trackingSecret) => {
    const res = await fetch('/api/v1/student/complaints/claim-legacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reference, trackingSecret }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to claim legacy complaint.');
    }

    showToast(data.message || 'Complaint linked to your dashboard.', 'success');
    return data;
  }, [showToast]);

  // Real Admin Login
  const loginAdmin = useCallback(async (email, password) => {
    const res = await fetch('/api/v1/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    setIsAdminLoggedIn(true);
    setAdminUser(data.admin);
    setCsrfToken(data.csrfToken);
    showToast(data.message || 'Signed in successfully.', 'success');
    return data;
  }, [showToast]);

  // Real Admin Logout
  const logoutAdmin = useCallback(async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout request failed', e);
    } finally {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
      setCsrfToken(null);
      showToast('Logged out of administrative session.', 'info');
    }
  }, [showToast]);

  // Real Admin Password Change
  const changeAdminPassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    const res = await fetch('/api/v1/admin/auth/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Password update failed.');
    }

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    showToast(data.message || 'Password updated successfully.', 'success');
    return data;
  }, [csrfToken, showToast]);

  // Legacy Public Complaint Submission (preserved)
  const submitComplaint = useCallback(async (formData, file) => {
    const body = new FormData();
    body.append('studentName', formData.studentName);
    body.append('studentId', formData.studentId);
    body.append('email', formData.email);
    body.append('program', 'BSc CSIT');
    body.append('category', formData.category);
    body.append('title', formData.title);
    body.append('description', formData.description);
    body.append('priority', formData.priority || 'Medium');

    if (file) {
      body.append('attachment', file);
    }

    const res = await fetch('/api/v1/complaints', {
      method: 'POST',
      body,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      const err = new Error(data.message || 'Failed to submit complaint.');
      err.errors = data.errors;
      throw err;
    }

    return data;
  }, []);

  // Legacy Private Complaint Tracking (preserved)
  const trackComplaint = useCallback(async (reference, trackingSecret) => {
    const res = await fetch('/api/v1/complaints/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, trackingSecret }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'No complaint found matching reference and tracking secret.');
    }

    return data.complaint;
  }, []);

  // Admin Complaint Management Methods
  const fetchAdminComplaints = useCallback(async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.program && params.program !== 'All') query.set('program', params.program);
    if (params.search) query.set('search', params.search);

    const res = await fetch(`/api/v1/admin/complaints?${query.toString()}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch complaints list.');
    }

    return data;
  }, []);

  const fetchAdminComplaintById = useCallback(async (id) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to retrieve complaint detail.');
    }

    return data.complaint;
  }, []);

  const updateComplaintStatus = useCallback(async (id, newStatus, reason = '') => {
    const res = await fetch(`/api/v1/admin/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus, reason }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update status.');
    }

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    showToast(`Status updated to "${newStatus}"`, 'success');
    return data.complaint;
  }, [csrfToken, showToast]);

  const addAdminResponse = useCallback(async (id, message) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to post official response.');
    }

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    showToast('Official response recorded and dispatched to student view.', 'success');
    return data.responses;
  }, [csrfToken, showToast]);

  const addInternalNote = useCallback(async (id, note) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}/internal-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ note }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save internal note.');
    }

    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }

    showToast('Internal administrative note saved.', 'info');
    return data.internalNotes;
  }, [csrfToken, showToast]);

  const fetchReportsSummary = useCallback(async () => {
    const res = await fetch('/api/v1/admin/reports/summary', {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load reports summary.');
    }

    return data.summary;
  }, []);

  const t = useCallback(
    (keyPath, fallback = '') => {
      const keys = keyPath.split('.');
      let current = TRANSLATIONS[language] || TRANSLATIONS.en;
      for (const k of keys) {
        if (!current || typeof current !== 'object') {
          current = undefined;
          break;
        }
        current = current[k];
      }

      if (current !== undefined) return current;

      let fb = TRANSLATIONS.en;
      for (const k of keys) {
        if (!fb || typeof fb !== 'object') {
          fb = undefined;
          break;
        }
        fb = fb[k];
      }

      return fb !== undefined ? fb : fallback;
    },
    [language]
  );

  const getCategoryLabel = useCallback(
    (cat) => {
      return TRANSLATIONS[language]?.categories?.[cat] || TRANSLATIONS.en?.categories?.[cat] || cat;
    },
    [language]
  );

  const getStatusLabel = useCallback(
    (status) => {
      return TRANSLATIONS[language]?.statuses?.[status] || TRANSLATIONS.en?.statuses?.[status] || status;
    },
    [language]
  );

  const getPriorityLabel = useCallback(
    (priority) => {
      return TRANSLATIONS[language]?.priorities?.[priority] || TRANSLATIONS.en?.priorities?.[priority] || priority;
    },
    [language]
  );

  const value = {
    // Language
    language,
    setLanguage,
    toggleLanguage,
    t,
    getCategoryLabel,
    getStatusLabel,
    getPriorityLabel,
    // Constants
    categories: ALLOWED_CATEGORIES,
    priorities: ALLOWED_PRIORITIES,
    statusList: ALLOWED_STATUSES,
    // Toasts
    toasts,
    showToast,
    removeToast,
    // Student Auth & Session
    isStudentLoggedIn,
    studentUser,
    isCheckingStudentSession,
    registerStudent,
    verifyStudentEmail,
    resendStudentVerification,
    loginStudent,
    logoutStudent,
    updateStudentProfile,
    forgotStudentPassword,
    resetStudentPassword,
    // Student Complaints Flow
    fetchStudentComplaints,
    fetchStudentComplaintById,
    submitStudentComplaint,
    claimLegacyComplaint,
    // Admin Auth & Session
    isAdminLoggedIn,
    adminUser,
    csrfToken,
    isCheckingSession,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    // Legacy Complaints Flow
    submitComplaint,
    trackComplaint,
    // Admin Management Flow
    fetchAdminComplaints,
    fetchAdminComplaintById,
    updateComplaintStatus,
    addAdminResponse,
    addInternalNote,
    fetchReportsSummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
