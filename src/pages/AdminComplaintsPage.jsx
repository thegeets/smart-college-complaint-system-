import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../config/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';
import { AdminComplaintDetailView } from '../components/AdminComplaintDetailView';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  Square,
  User,
  ShieldAlert,
  ArrowUpDown,
  Calendar,
  Layers,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

const QUICK_TABS = [
  { id: 'all', label: 'All Tickets', labelNe: 'सबै उजुरी' },
  { id: 'unassigned', label: 'Unassigned', labelNe: 'जिम्मा नदिइएका' },
  { id: 'urgent', label: 'Urgent', labelNe: 'अति जरुरी' },
  { id: 'overdue', label: 'Overdue SLA', labelNe: 'म्याद नाघेका' },
  { id: 'mine', label: 'Assigned to Me', labelNe: 'मेरो जिम्मा' },
];

export function AdminComplaintsPage() {
  const {
    fetchAdminComplaints,
    fetchStaffMembers,
    bulkAssignComplaints,
    bulkUpdateComplaintStatus,
    adminUser,
    statusList,
    language,
    showToast,
    categories,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNe = language === 'ne';

  // URL state synchronization
  const currentTab = searchParams.get('tab') || 'all';
  const urlStatus = searchParams.get('status') || 'All';
  const urlCategory = searchParams.get('category') || 'All';
  const urlPriority = searchParams.get('priority') || 'All';
  const urlTechnician = searchParams.get('technician') || 'all';
  const urlSlaState = searchParams.get('slaState') || 'all';
  const urlSearch = searchParams.get('search') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlSortBy = searchParams.get('sortBy') || 'newest';
  const urlSortOrder = searchParams.get('sortOrder') || 'desc';
  const urlStartDate = searchParams.get('startDate') || '';
  const urlEndDate = searchParams.get('endDate') || '';

  // Local state
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [tabCounts, setTabCounts] = useState({ all: 0, unassigned: 0, urgent: 0, overdue: 0, mine: 0 });
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input with 300ms debounce
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debounceTimerRef = useRef(null);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [bulkAssignTechId, setBulkAssignTechId] = useState('');
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState('In Progress');
  const [bulkStatusNote, setBulkStatusNote] = useState('');
  const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = useState(false);

  // Drawer detail state (desktop slide-in)
  const [drawerComplaint, setDrawerComplaint] = useState(null);

  // Live timer for SLA countdowns
  const [now, setNow] = useState(Date.now());
  const [copiedRef, setCopiedRef] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch staff list once for filters and assignments
  useEffect(() => {
    fetchStaffMembers()
      .then((data) => setStaffList(data || []))
      .catch((err) => console.warn('Could not fetch staff members:', err));
  }, [fetchStaffMembers]);

  // Update URL helper
  const updateUrlParams = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'All' || val === 'all') {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });
    // Reset to page 1 if filters/search change (unless explicitly setting page)
    if (!('page' in updates)) {
      next.delete('page');
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  // Load complaints from backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminComplaints({
        page: urlPage,
        limit: 15,
        tab: currentTab,
        status: urlStatus,
        category: urlCategory,
        priority: urlPriority,
        technician: urlTechnician,
        slaState: urlSlaState,
        search: urlSearch,
        sortBy: urlSortBy,
        sortOrder: urlSortOrder,
        startDate: urlStartDate,
        endDate: urlEndDate,
      });

      setComplaints(res.complaints || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (res.tabCounts) {
        setTabCounts(res.tabCounts);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
      setError(err.message || 'Failed to load complaints queue from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchAdminComplaints,
    urlPage,
    currentTab,
    urlStatus,
    urlCategory,
    urlPriority,
    urlTechnician,
    urlSlaState,
    urlSearch,
    urlSortBy,
    urlSortOrder,
    urlStartDate,
    urlEndDate,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search change handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateUrlParams({ search: val.trim() });
    }, 300);
  };

  // Clear single filter chip
  const handleClearFilter = (key) => {
    if (key === 'search') {
      setSearchInput('');
      updateUrlParams({ search: '' });
    } else {
      updateUrlParams({ [key]: null });
    }
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchInput('');
    const next = new URLSearchParams();
    if (currentTab !== 'all') {
      next.set('tab', currentTab);
    }
    setSearchParams(next);
  };

  // Count active filters (excluding tab)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (urlStatus !== 'All') count++;
    if (urlCategory !== 'All') count++;
    if (urlPriority !== 'All') count++;
    if (urlTechnician !== 'all') count++;
    if (urlSlaState !== 'all') count++;
    if (urlSearch) count++;
    if (urlStartDate || urlEndDate) count++;
    return count;
  }, [urlStatus, urlCategory, urlPriority, urlTechnician, urlSlaState, urlSearch, urlStartDate, urlEndDate]);

  // Bulk selection logic
  const isAllSelected = complaints.length > 0 && selectedIds.length === complaints.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < complaints.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(complaints.map((c) => c._id || c.id));
    }
  };

  const handleToggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk actions executions
  const handleConfirmBulkAssign = async () => {
    if (!bulkAssignTechId || selectedIds.length === 0) return;
    setIsBulkAssigning(true);
    try {
      await bulkAssignComplaints(selectedIds, bulkAssignTechId);
      setBulkAssignModalOpen(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      alert(err.message || 'Bulk assignment failed.');
    } finally {
      setIsBulkAssigning(false);
    }
  };

  const handleConfirmBulkStatus = async () => {
    if (!bulkTargetStatus || selectedIds.length === 0) return;
    setIsBulkUpdatingStatus(true);
    try {
      await bulkUpdateComplaintStatus(selectedIds, bulkTargetStatus, bulkStatusNote);
      setBulkStatusModalOpen(false);
      setBulkStatusNote('');
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      alert(err.message || 'Bulk status update failed.');
    } finally {
      setIsBulkUpdatingStatus(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const params = new URLSearchParams({
      tab: currentTab,
      status: urlStatus,
      category: urlCategory,
      priority: urlPriority,
      technician: urlTechnician,
      slaState: urlSlaState,
      search: urlSearch,
      startDate: urlStartDate,
      endDate: urlEndDate,
    });
    window.location.href = apiUrl(`/api/v1/admin/complaints/export/csv?${params.toString()}`);
  };

  // Copy reference code
  const handleCopyRef = (refCode, e) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refCode);
      setCopiedRef(refCode);
      showToast('Reference copied', 'success');
      setTimeout(() => setCopiedRef(null), 1500);
    }
  };

  // Live SLA calculation helper
  const getSlaInfo = (slaDueAt) => {
    if (!slaDueAt) return null;
    const diff = new Date(slaDueAt).getTime() - now;
    const isOverdue = diff <= 0;
    const absDiff = Math.abs(diff);
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (isOverdue) {
      return { text: `${hours}h ${mins}m overdue`, isOverdue: true };
    }
    return {
      text: `${hours}h ${mins}m left`,
      isOverdue: false,
      isNearBreach: hours < 6,
    };
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
              {isNe ? 'कलेज उजुरी व्यवस्थापन कन्सोल' : 'Complaints Management Queue'}
            </h1>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 10px',
              backgroundColor: '#EEF3FB',
              color: '#203B64',
              borderRadius: '9999px',
              border: '1px solid #D5E1F7',
            }}>
              {pagination.total} {isNe ? 'कुल उजुरी' : 'Total Tickets'}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? 'उजुरी समीक्षा, प्राविधिक खटनपटन, एसएलए अनुगमन तथा सामूहिक प्रशासनिक कारबाही'
              : 'Triage student grievances, dispatch technicians, monitor real-time SLAs, and execute bulk actions.'}
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Reload queue"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="desktop-only">{isNe ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Download CSV of current filter set"
          >
            <Download size={13} />
            <span>{isNe ? 'सीएसभी निर्यात' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Quick View Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {QUICK_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          const count = tabCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateUrlParams({ tab: tab.id })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? '700' : '500',
                backgroundColor: isActive ? '#101D35' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--color-muted)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isNe ? tab.labelNe : tab.label}</span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#203B64' : 'var(--color-border)',
                color: isActive ? '#FFFFFF' : 'var(--color-muted)',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder={isNe ? 'आईडी, शीर्षक वा विद्यार्थी खोज्नुहोस्...' : 'Search Ref, Title, Student...'}
              value={searchInput}
              onChange={handleSearchChange}
              style={{ paddingLeft: '32px', fontSize: '0.8125rem', height: '36px' }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleClearFilter('search')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="input-field"
              value={urlStatus}
              onChange={(e) => updateUrlParams({ status: e.target.value })}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="All">{isNe ? 'सबै स्थिति (Status: All)' : 'All Statuses'}</option>
              {statusList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="input-field"
              value={urlCategory}
              onChange={(e) => updateUrlParams({ category: e.target.value })}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="All">{isNe ? 'सबै विधा (Category: All)' : 'All Categories'}</option>
              {(categories || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="input-field"
              value={urlPriority}
              onChange={(e) => updateUrlParams({ priority: e.target.value })}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="All">{isNe ? 'सबै प्राथमिकता (Priority: All)' : 'All Priorities'}</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div>
            <select
              className="input-field"
              value={urlTechnician}
              onChange={(e) => updateUrlParams({ technician: e.target.value })}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="all">{isNe ? 'सबै प्राविधिक (Technicians)' : 'All Technicians'}</option>
              <option value="unassigned">{isNe ? 'जिम्मा नदिइएका (Unassigned)' : 'Unassigned Only'}</option>
              {staffList.map((tech) => (
                <option key={tech._id} value={tech._id}>{tech.name} ({tech.role})</option>
              ))}
            </select>
          </div>

          {/* SLA State Filter */}
          <div>
            <select
              className="input-field"
              value={urlSlaState}
              onChange={(e) => updateUrlParams({ slaState: e.target.value })}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="all">{isNe ? 'सबै एसएलए (SLA: All)' : 'All SLA States'}</option>
              <option value="breached">{isNe ? 'म्याद नाघेका (Breached)' : 'Breached Overdue'}</option>
              <option value="due_soon">{isNe ? 'नजिकिँदै गरेको (<6h Due Soon)' : 'Due Soon (<6h)'}</option>
              <option value="on_track">{isNe ? 'समयमै (On Track)' : 'On Track'}</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <select
              className="input-field"
              value={`${urlSortBy}_${urlSortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                updateUrlParams({ sortBy: sb, sortOrder: so });
              }}
              style={{ fontSize: '0.8125rem', height: '36px' }}
            >
              <option value="newest_desc">{isNe ? 'नयाँ पहिले' : 'Newest First'}</option>
              <option value="oldest_asc">{isNe ? 'पुरानो पहिले' : 'Oldest First'}</option>
              <option value="priority_desc">{isNe ? 'उच्च प्राथमिकता' : 'Highest Priority'}</option>
              <option value="slaDueAt_asc">{isNe ? 'एसएलए चाँडै सकिने' : 'SLA Due Soonest'}</option>
            </select>
          </div>
        </div>

        {/* Removable Active Filter Chips & Clear All */}
        {activeFilterCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', marginRight: '4px' }}>
              Active Filters:
            </span>

            {urlSearch && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Search: "{urlSearch}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('search')} />
              </span>
            )}

            {urlStatus !== 'All' && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Status: {urlStatus}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('status')} />
              </span>
            )}

            {urlCategory !== 'All' && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Category: {urlCategory}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('category')} />
              </span>
            )}

            {urlPriority !== 'All' && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Priority: {urlPriority}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('priority')} />
              </span>
            )}

            {urlTechnician !== 'all' && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Tech: {staffList.find((s) => s._id === urlTechnician)?.name || urlTechnician}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('technician')} />
              </span>
            )}

            {urlSlaState !== 'all' && (
              <span className="badge" style={{ backgroundColor: '#EEF3FB', color: '#203B64', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                SLA: {urlSlaState}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleClearFilter('slaState')} />
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#B91C1C',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '8px',
                textDecoration: 'underline',
              }}
            >
              {isNe ? 'सबै हटाउनुहोस्' : 'Clear all'}
            </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && (
        <div style={{
          position: 'sticky',
          top: '70px',
          zIndex: 20,
          backgroundColor: '#101D35',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 8px 24px -4px rgba(16, 29, 53, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              backgroundColor: '#203B64',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.8125rem',
            }}>
              {selectedIds.length} {isNe ? 'उजुरी चयन गरिएको' : 'tickets selected'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isNe ? 'रद्द गर्नुहोस्' : 'Deselect all'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setBulkAssignModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: '#203B64', color: '#FFFFFF', borderColor: '#5278C8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={14} />
              <span>{isNe ? 'प्राविधिक तोक्नुहोस्' : 'Assign Technician'}</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkStatusModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: '#203B64', color: '#FFFFFF', borderColor: '#5278C8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={14} />
              <span>{isNe ? 'स्थिति परिवर्तन' : 'Change Status'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card (Desktop / Laptop) & Stacked Cards (Mobile) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <div className="animate-spin" style={{ width: '28px', height: '28px', border: '2px solid var(--color-royal-blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {isNe ? 'डाटाबेसबाट उजुरीहरू लोड गरिँदैछ...' : 'Retrieving complaints from MongoDB Atlas...'}
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#EEF3FB', color: '#203B64', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: '4px' }}>
              {isNe ? 'कुनै उजुरी फेला परेन' : 'No Complaints Match Filters'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
              {isNe
                ? 'तपाईंले छान्नुभएको फिल्टर अनुसार कुनै रेकर्ड भेटिएन। कृपया अन्य फिल्टर प्रयास गर्नुहोस्।'
                : 'No grievance records match your active search terms or selected filters.'}
            </p>
            {activeFilterCount > 0 && (
              <button type="button" onClick={handleClearAllFilters} className="btn btn-primary btn-sm">
                {isNe ? 'सबै फिल्टर हटाउनुहोस्' : 'Reset All Filters'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Laptop Table View */}
            <div className="desktop-only" style={{ overflowX: 'auto', maxHeight: '720px', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid var(--color-border)',
                  zIndex: 2,
                }}>
                  <tr>
                    <th style={{ width: '40px', padding: '12px 14px' }}>
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-muted)' }}
                      >
                        {isAllSelected ? <CheckSquare size={16} color="#101D35" /> : <Square size={16} />}
                      </button>
                    </th>
                    <th style={{
                      padding: '12px 14px',
                      fontWeight: '700',
                      color: 'var(--color-heading)',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: '#F8FAFC',
                      zIndex: 3,
                      boxShadow: '1px 0 0 var(--color-border)',
                    }}>
                      {isNe ? 'सन्दर्भ कोड' : 'Ref Code'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'शीर्षक र विधा' : 'Title & Category'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'प्राथमिकता' : 'Priority'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'स्थिति' : 'Status'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'विद्यार्थी' : 'Student'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'तोकिएको प्राविधिक' : 'Technician'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)' }}>
                      {isNe ? 'एसएलए' : 'SLA Target'}
                    </th>
                    <th style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-heading)', textAlign: 'right' }}>
                      {isNe ? 'कार्य' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((item) => {
                    const rowId = item._id || item.id;
                    const isSelected = selectedIds.includes(rowId);
                    const refCode = item.reference || item.referenceId || item.id;
                    const sla = getSlaInfo(item.slaDueAt);

                    return (
                      <tr
                        key={rowId}
                        onClick={() => setDrawerComplaint(item)}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: isSelected ? '#F0F5FF' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '12px 14px' }} onClick={(e) => handleToggleSelectRow(rowId, e)}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {isSelected ? <CheckSquare size={16} color="#101D35" /> : <Square size={16} color="#94A3B8" />}
                          </button>
                        </td>

                        {/* Sticky Ref Code */}
                        <td style={{
                          padding: '12px 14px',
                          fontFamily: 'monospace',
                          fontWeight: '700',
                          color: '#203B64',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: isSelected ? '#F0F5FF' : '#FFFFFF',
                          zIndex: 1,
                          boxShadow: '1px 0 0 var(--color-border)',
                          whiteSpace: 'nowrap',
                        }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span>{refCode}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyRef(refCode, e)}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--color-muted)' }}
                              title="Copy Reference"
                            >
                              {copiedRef === refCode ? <Check size={12} color="#15803D" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }} title={item.title}>
                            {item.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CategoryBadge category={item.category} />
                            {item.location && (
                              <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                                • {item.location}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Priority */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <PriorityBadge priority={item.priority} />
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <StatusBadge status={item.status} />
                        </td>

                        {/* Student Info */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-heading)' }}>
                            {item.student?.name || item.studentName || 'Guest Student'}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                            {item.student?.studentId || item.studentRoll || item.email || ''}
                          </div>
                        </td>

                        {/* Assigned Technician */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {item.assignedStaff?.name ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600', color: '#101D35' }}>
                              <User size={13} color="#5278C8" />
                              {item.assignedStaff.name}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* SLA Countdown */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {item.status === 'Resolved' ? (
                            <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '600' }}>
                              ✓ Resolved
                            </span>
                          ) : sla ? (
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: sla.isOverdue ? '#B91C1C' : sla.isNearBreach ? '#B45309' : '#15803D',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              <Clock size={12} />
                              {sla.text}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Action Column */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerComplaint(item);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} />
                            <span>{isNe ? 'विवरण' : 'Inspect'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Stacked Cards (<768px) */}
            <div className="mobile-only" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {complaints.map((item) => {
                const rowId = item._id || item.id;
                const isSelected = selectedIds.includes(rowId);
                const refCode = item.reference || item.referenceId || item.id;
                const sla = getSlaInfo(item.slaDueAt);

                return (
                  <div
                    key={rowId}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '12px',
                      backgroundColor: isSelected ? '#F0F5FF' : '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleSelectRow(rowId, e)}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          {isSelected ? <CheckSquare size={18} color="#101D35" /> : <Square size={18} color="#94A3B8" />}
                        </button>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8125rem', color: '#203B64' }}>
                          {refCode}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>

                    <h4 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--color-heading)', margin: '0 0 6px' }}>
                      {item.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <CategoryBadge category={item.category} />
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '8px' }}>
                      <strong>{item.student?.name || item.studentName || 'Student'}</strong> ({item.student?.studentId || item.studentRoll || item.email || ''})
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                      <div>
                        {sla && item.status !== 'Resolved' && (
                          <span style={{ fontWeight: '700', color: sla.isOverdue ? '#B91C1C' : '#15803D' }}>
                            {sla.text}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/admin/complaints/${rowId}`}
                        className="btn btn-secondary btn-sm"
                        style={{ minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={14} />
                        <span>{isNe ? 'उजुरी हेर्नुहोस्' : 'Inspect Ticket'}</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: '#FAFCFE',
              fontSize: '0.8125rem',
              color: 'var(--color-muted)',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                {isNe
                  ? `पृष्ठ ${pagination.page} / ${pagination.totalPages} (कुल ${pagination.total} उजुरी)`
                  : `Showing page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total records)`}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page <= 1}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', minHeight: '36px' }}
                >
                  <ChevronLeft size={14} />
                  <span>{isNe ? 'अघिल्लो' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateUrlParams({ page: Math.min(pagination.totalPages, pagination.page + 1) })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', minHeight: '36px' }}
                >
                  <span>{isNe ? 'पछिल्लो' : 'Next'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Slide-in Detail Drawer for Desktop / Tablet */}
      {drawerComplaint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerComplaint(null)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(16, 29, 53, 0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Drawer Body */}
          <div style={{
            position: 'relative',
            width: '680px',
            maxWidth: '92vw',
            height: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '-8px 0 32px rgba(16, 29, 53, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 101,
            overflowY: 'auto',
          }}>
            <AdminComplaintDetailView
              complaint={drawerComplaint}
              onComplaintUpdated={(updated) => {
                setDrawerComplaint(updated);
                loadData();
              }}
              onClose={() => {
                setDrawerComplaint(null);
                loadData();
              }}
              isDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Bulk Assign Technician Modal */}
      {bulkAssignModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 29, 53, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 8px' }}>
              {isNe ? 'सामूहिक प्राविधिक खटनपटन' : 'Bulk Assign Technician'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 16px' }}>
              Assign {selectedIds.length} selected tickets to a designated technician or staff member:
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px', color: 'var(--color-heading)' }}>
                Select Staff / Technician:
              </label>
              <select
                className="input-field"
                value={bulkAssignTechId}
                onChange={(e) => setBulkAssignTechId(e.target.value)}
              >
                <option value="">-- Choose technician --</option>
                {staffList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.role} - {s.specialization || s.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setBulkAssignModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkAssign}
                disabled={!bulkAssignTechId || isBulkAssigning}
                className="btn btn-primary btn-sm"
              >
                {isBulkAssigning ? 'Assigning...' : `Assign to ${selectedIds.length} Tickets`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Status Modal */}
      {bulkStatusModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(16, 29, 53, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '16px',
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 8px' }}>
              {isNe ? 'सामूहिक स्थिति परिवर्तन' : 'Bulk Update Status'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 16px' }}>
              Update the status for {selectedIds.length} selected complaints at once:
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px', color: 'var(--color-heading)' }}>
                Target Status:
              </label>
              <select
                className="input-field"
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value)}
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '6px', color: 'var(--color-heading)' }}>
                Administrative Audit Note (Optional):
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Bulk resolution after laboratory inspection"
                value={bulkStatusNote}
                onChange={(e) => setBulkStatusNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setBulkStatusModalOpen(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkStatus}
                disabled={isBulkUpdatingStatus}
                className="btn btn-primary btn-sm"
              >
                {isBulkUpdatingStatus ? 'Updating...' : `Update ${selectedIds.length} Tickets`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaintsPage;
