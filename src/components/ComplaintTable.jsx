import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  RotateCcw, 
  Eye, 
  Calendar, 
  User, 
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge';
import { CampusEmptyState } from './CampusEmptyState';

export function ComplaintTable({
  complaints = [],
  role: _role = 'admin',
  showStudentInfo = true,
  onActionClick,
  actionButtonLabel,
  defaultStatus = 'ALL',
  defaultCategory = 'ALL',
  pageSize = 15,
}) {
  const { getCategoryLabel, getPriorityLabel, language, categories, priorities, statusList } = useApp();
  const isNe = language === 'ne';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync if default filters change from parent
  const [prevStatus, setPrevStatus] = useState(defaultStatus);
  const [prevCat, setPrevCat] = useState(defaultCategory);
  if (defaultStatus !== prevStatus) {
    setPrevStatus(defaultStatus);
    setStatusFilter(defaultStatus);
    setCurrentPage(1);
  }
  if (defaultCategory !== prevCat) {
    setPrevCat(defaultCategory);
    setCategoryFilter(defaultCategory);
    setCurrentPage(1);
  }

  // Count by status for quick pill indicators
  const statusCounts = useMemo(() => {
    const counts = { ALL: complaints.length };
    statusList.forEach((st) => { counts[st] = 0; });
    complaints.forEach((c) => {
      if (counts[c.status] !== undefined) {
        counts[c.status]++;
      }
    });
    return counts;
  }, [complaints, statusList]);

  // Filter & sort logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const refId = item.reference || item.id || '';
      const title = item.title || '';
      const cat = item.category || '';
      const studentName = item.student?.name || item.studentName || '';
      const studentRoll = item.student?.studentId || item.studentRoll || '';

      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        refId.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        studentName.toLowerCase().includes(q) ||
        studentRoll.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      const matchPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;

      return matchSearch && matchStatus && matchCategory && matchPriority;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.submittedAt || 0);
      const dateB = new Date(b.createdAt || b.submittedAt || 0);

      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'priority') {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter, sortBy]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComplaints.slice(start, start + pageSize);
  }, [filteredComplaints, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const isFiltered =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    sortBy !== 'newest';

  const defaultActionLabel = actionButtonLabel || (isNe ? 'समीक्षा' : 'Inspect');

  // Quick status pill filter config
  const quickStatusOptions = [
    { id: 'ALL', label: isNe ? 'सबै' : 'All', count: statusCounts.ALL, icon: null },
    { id: 'Submitted', label: isNe ? 'दर्ता' : 'Submitted', count: statusCounts.Submitted || 0, icon: Clock },
    { id: 'Under Review', label: isNe ? 'समीक्षामा' : 'Review', count: statusCounts['Under Review'] || 0, icon: AlertCircle },
    { id: 'In Progress', label: isNe ? 'कार्यान्वयनमा' : 'In Progress', count: statusCounts['In Progress'] || 0, icon: Wrench },
    { id: 'Resolved', label: isNe ? 'समाधान' : 'Resolved', count: statusCounts.Resolved || 0, icon: CheckCircle2 },
  ];

  return (
    <div className="complaint-table-wrapper">
      {/* Quick Status Tabs (Segmented Control) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        borderBottom: '1px solid var(--color-border)',
        scrollbarWidth: 'none'
      }}>
        {quickStatusOptions.map((opt) => {
          const isSelected = statusFilter === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setStatusFilter(opt.id);
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? '600' : '500',
                backgroundColor: isSelected ? '#101D35' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1px solid #101D35' : '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {Icon && <Icon size={12} color={isSelected ? '#5278C8' : '#64748B'} />}
              <span>{opt.label}</span>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: isSelected ? '#203B64' : '#F1F5F9',
                color: isSelected ? '#FFFFFF' : '#64748B'
              }}>
                {opt.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar" style={{ marginBottom: '14px' }}>
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={isNe ? 'सन्दर्भ कोड, शीर्षक वा विद्यार्थीको नाम खोजी गर्नुहोस्...' : 'Search by reference ID, title, student name, or roll...'}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search complaints"
            style={{ paddingRight: searchTerm ? '32px' : '12px' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-controls-group">
          {/* Category Filter */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Category"
          >
            <option value="ALL">{isNe ? 'सबै विधाहरू' : 'All Categories'}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Priority"
          >
            <option value="ALL">{isNe ? 'सबै प्राथमिकता' : 'All Priorities'}</option>
            {priorities.map((pri) => (
              <option key={pri} value={pri}>
                {getPriorityLabel(pri)}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Sort Order"
          >
            <option value="newest">{isNe ? 'नयाँ पहिले' : 'Newest First'}</option>
            <option value="oldest">{isNe ? 'पुरानो पहिले' : 'Oldest First'}</option>
            <option value="priority">{isNe ? 'उच्च प्राथमिकता' : 'Priority (Urgent)'}</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset all search filters"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <RotateCcw size={12} />
              <span>{isNe ? 'रिसेट' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Meta Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8125rem',
        color: 'var(--color-muted)',
        marginBottom: '12px',
        padding: '0 4px'
      }}>
        <div>
          {isNe ? 'जम्मा' : 'Showing'}{' '}
          <strong style={{ color: 'var(--color-heading)' }}>{filteredComplaints.length}</strong>{' '}
          {isNe ? 'उजुरीहरू' : `of ${complaints.length} complaints`}
          {isFiltered && (
            <span style={{
              marginLeft: '8px',
              fontSize: '0.75rem',
              color: '#B45309',
              backgroundColor: '#FFFBEB',
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid #FDE68A'
            }}>
              Filtered
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
        )}
      </div>

      {/* Table Results */}
      {filteredComplaints.length === 0 ? (
        <CampusEmptyState
          title={isFiltered ? (isNe ? 'कुनै नतिजा फेला परेन' : 'No Matching Grievance Records Found') : (isNe ? 'कुनै उजुरी छैन' : 'No Complaints Recorded')}
          description={
            isFiltered
              ? (isNe ? 'खोजीका सर्तहरूसँग मिल्ने कुनै उजुरी फेला परेन।' : 'No complaints match your active filter criteria. Try clearing search filters.')
              : (isNe ? 'हाल कुनै उजुरी दर्ता भएको छैन।' : 'There are currently no complaints in the system.')
          }
          actionLabel={null}
          actionTo={null}
          onReset={isFiltered ? handleResetFilters : null}
          resetLabel={isNe ? 'सबै फिल्टर हटाउनुहोस्' : 'Clear All Filters'}
        />
      ) : (
        <>
          {/* Mobile View: Responsive Cards (<= 768px) */}
          <div className="complaint-table-mobile" role="list" aria-label="Complaints list">
            {paginatedComplaints.map((item) => {
              const docId = item._id || item.id;
              const refCode = item.reference || item.id;
              const dateStr = new Date(item.createdAt || item.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const studentName = item.student?.name || item.studentName || 'Student';
              const studentRoll = item.student?.studentId || item.studentRoll || 'N/A';

              return (
                <div key={docId} className="complaint-mobile-card" role="listitem">
                  <div className="complaint-card-topbar">
                    <span className="table-complaint-id" style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      padding: '2px 8px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '4px',
                      color: 'var(--color-navy)'
                    }}>
                      #{refCode}
                    </span>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <PriorityBadge priority={item.priority} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <h3 className="complaint-card-title" style={{ margin: '8px 0 6px', fontSize: '0.9375rem', fontWeight: '600' }}>
                    <Link to={`/admin/complaints/${docId}`} className="complaint-card-title-link">
                      {item.title}
                    </Link>
                  </h3>

                  <div className="complaint-card-category-row" style={{ marginBottom: '10px' }}>
                    <CategoryBadge category={item.category} />
                  </div>

                  {showStudentInfo && (
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-body)',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <User size={13} color="var(--color-muted)" />
                      <span>{studentName} ({studentRoll})</span>
                    </div>
                  )}

                  <div className="complaint-card-footer">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      <Calendar size={12} />
                      <span>{dateStr}</span>
                    </span>

                    <div>
                      {onActionClick ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onActionClick(item)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} />
                          <span>{defaultActionLabel}</span>
                        </button>
                      ) : (
                        <Link to={`/admin/complaints/${docId}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} />
                          <span>{defaultActionLabel}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Structured Table (> 768px) */}
          <div className="table-container complaint-table-desktop">
            <table className="table" aria-label="Complaints table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>{isNe ? 'सन्दर्भ कोड' : 'Reference ID'}</th>
                  <th>{isNe ? 'विषय / उजुरी' : 'Subject / Grievance'}</th>
                  <th style={{ width: '150px' }}>{isNe ? 'आईटी विधा' : 'Category'}</th>
                  {showStudentInfo && <th style={{ width: '160px' }}>{isNe ? 'विद्यार्थी' : 'Complainant'}</th>}
                  <th style={{ width: '110px' }}>{isNe ? 'प्राथमिकता' : 'Priority'}</th>
                  <th style={{ width: '120px' }}>{isNe ? 'स्थिति' : 'Status'}</th>
                  <th style={{ width: '110px' }}>{isNe ? 'दर्ता मिति' : 'Date Filed'}</th>
                  <th style={{ width: '100px', textAlign: 'right' }}>{isNe ? 'कार्य' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.map((item) => {
                  const docId = item._id || item.id;
                  const refCode = item.reference || item.id;
                  const dateStr = new Date(item.createdAt || item.submittedAt).toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const studentName = item.student?.name || item.studentName || 'Student';
                  const studentRoll = item.student?.studentId || item.studentRoll || 'N/A';

                  return (
                    <tr key={docId} className="hover-row">
                      {/* Complaint Reference */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Link 
                          to={`/admin/complaints/${docId}`} 
                          className="table-complaint-id"
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem',
                            fontWeight: '700',
                            padding: '3px 8px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '4px',
                            color: '#101D35',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          #{refCode}
                        </Link>
                      </td>

                      {/* Title */}
                      <td>
                        <Link to={`/admin/complaints/${docId}`} className="table-title-link" style={{ fontWeight: '600', color: 'var(--color-heading)' }}>
                          {item.title}
                        </Link>
                      </td>

                      {/* Category */}
                      <td>
                        <CategoryBadge category={item.category} />
                      </td>

                      {/* Student Info */}
                      {showStudentInfo && (
                        <td style={{ fontSize: '0.8125rem' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-heading)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#EEF3FB',
                              color: '#203B64',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.625rem',
                              fontWeight: '700',
                              flexShrink: 0
                            }}>
                              {studentName.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {studentName}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)', paddingLeft: '26px' }}>
                            {studentRoll}
                          </div>
                        </td>
                      )}

                      {/* Priority */}
                      <td>
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {onActionClick ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => onActionClick(item)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} />
                            <span>{defaultActionLabel}</span>
                          </button>
                        ) : (
                          <Link to={`/admin/complaints/${docId}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Eye size={12} />
                            <span>{defaultActionLabel}</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: '#F8FAFC',
                fontSize: '0.8125rem'
              }}>
                <span style={{ color: 'var(--color-muted)' }}>
                  {isNe ? 'पृष्ठ' : 'Page'} <strong>{currentPage}</strong> {isNe ? 'मा' : 'of'} <strong>{totalPages}</strong> ({filteredComplaints.length} records)
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={13} />
                    <span>{isNe ? 'अघिल्लो' : 'Previous'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{isNe ? 'पछिल्लो' : 'Next'}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ComplaintTable;
