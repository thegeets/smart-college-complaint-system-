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

  // Check existing session on mount
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

  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

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

  // 4. Public Complaint Submission
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

    return data; // { success: true, reference, trackingSecret, message, submittedAt }
  }, []);

  // 5. Private Complaint Tracking
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

  // 6. Admin Complaint Management Methods
  const fetchAdminComplaints = useCallback(async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.priority) query.set('priority', params.priority);
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`/api/v1/admin/complaints?${query.toString()}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load complaints.');
    }

    return data; // { complaints, pagination }
  }, []);

  const fetchAdminComplaintById = useCallback(async (id) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}`, {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load complaint details.');
    }

    return data.complaint;
  }, []);

  const updateComplaintStatus = useCallback(async (id, status, note) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify({ status, note }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update complaint status.');
    }

    showToast(data.message || `Status changed to ${status}.`, 'success');
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
      throw new Error(data.message || 'Failed to save official response.');
    }

    showToast(data.message || 'Official response recorded.', 'success');
    return data.complaint;
  }, [csrfToken, showToast]);

  const addInternalNote = useCallback(async (id, note) => {
    const res = await fetch(`/api/v1/admin/complaints/${id}/notes`, {
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
      throw new Error(data.message || 'Failed to record internal note.');
    }

    showToast(data.message || 'Internal note saved.', 'success');
    return data.complaint;
  }, [csrfToken, showToast]);

  const fetchReportsSummary = useCallback(async () => {
    const res = await fetch('/api/v1/admin/reports/summary', {
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load report summary.');
    }

    return data.summary;
  }, []);

  // 7. Translation helper
  const t = useCallback(
    (keyPath, fallback = '') => {
      if (!keyPath) return '';
      const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      const enDict = TRANSLATIONS.en;

      if (currentDict[keyPath] !== undefined) {
        return currentDict[keyPath];
      }

      const parts = keyPath.split('.');
      let val = currentDict;
      for (const p of parts) {
        if (val && typeof val === 'object' && p in val) {
          val = val[p];
        } else {
          val = undefined;
          break;
        }
      }

      if (val !== undefined && typeof val !== 'object') {
        return val;
      }

      let enVal = enDict;
      for (const p of parts) {
        if (enVal && typeof enVal === 'object' && p in enVal) {
          enVal = enVal[p];
        } else {
          enVal = undefined;
          break;
        }
      }

      if (enVal !== undefined && typeof enVal !== 'object') {
        return enVal;
      }

      return fallback || keyPath;
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
    // Admin Auth
    isAdminLoggedIn,
    adminUser,
    csrfToken,
    isCheckingSession,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    // Public Complaints Flow
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
