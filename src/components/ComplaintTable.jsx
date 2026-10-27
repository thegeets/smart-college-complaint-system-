import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, RotateCcw, ArrowRight, Eye, Calendar, User } from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from './StatusBadge';
import { CampusEmptyState } from './CampusEmptyState';

export function ComplaintTable({
  complaints = [],
  role = 'admin',
  showStudentInfo = true,
  onActionClick,
  actionButtonLabel,
}) {
  const { t, getStatusLabel, getCategoryLabel, getPriorityLabel, language, categories, priorities, statusList } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Filter & sort logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const refId = item.reference || item.id || '';
      const title = item.title || '';
      const cat = item.category || '';
      const studentName = item.student?.name || item.studentName || '';

      const matchSearch =
        !searchTerm.trim() ||
        refId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        studentName.toLowerCase().includes(searchTerm.toLowerCase());

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

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setSortBy('newest');
  };

  const isFiltered =
    searchTerm !== '' ||
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    sortBy !== 'newest';

  const defaultActionLabel = actionButtonLabel || (language === 'ne' ? 'विवरण' : 'View Details');

  return (
    <div className="complaint-table-wrapper">
      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={language === 'ne' ? 'सन्दर्भ कोड, शीर्षक वा विद्यार्थीको नाम खोजी गर्नुहोस्...' : 'Search by reference, title, or student name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search complaints"
          />
        </div>

        <div className="filter-controls-group">
          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">{language === 'ne' ? 'सबै स्थिति' : 'All Statuses'}</option>
            {statusList.map((st) => (
              <option key={st} value={st}>
                {getStatusLabel(st)}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by Category"
          >
            <option value="ALL">{language === 'ne' ? 'सबै विधाहरू' : 'All Categories'}</option>
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
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by Priority"
          >
            <option value="ALL">{language === 'ne' ? 'सबै प्राथमिकता' : 'All Priorities'}</option>
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
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort Order"
          >
            <option value="newest">{language === 'ne' ? 'नयाँ पहिले' : 'Newest First'}</option>
            <option value="oldest">{language === 'ne' ? 'पुरानो पहिले' : 'Oldest First'}</option>
            <option value="priority">{language === 'ne' ? 'उच्च प्राथमिकता' : 'Priority (Urgent First)'}</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset Filters"
            >
              <RotateCcw size={13} />
              <span>{language === 'ne' ? 'रिसेट' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Meta */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', marginBottom: 'var(--space-3)' }}>
        {language === 'ne' ? 'जम्मा' : 'Showing'}{' '}
        <strong>{filteredComplaints.length}</strong>{' '}
        {language === 'ne' ? 'उजुरीहरू देखाइँदै' : `of ${complaints.length} recorded grievances`}
      </div>

      {/* Table Results */}
      {filteredComplaints.length === 0 ? (
        <CampusEmptyState
          title={isFiltered ? (language === 'ne' ? 'कुनै नतिजा फेला परेन' : 'No Matching Grievance Records Found') : (language === 'ne' ? 'कुनै उजुरी छैन' : 'No Complaints Recorded')}
          description={
            isFiltered
              ? (language === 'ne' ? 'खोजीका सर्तहरूसँग मिल्ने कुनै उजुरी फेला परेन।' : 'No complaints match your specific filter criteria.')
              : (language === 'ne' ? 'हाल कुनै उजुरी दर्ता भएको छैन।' : 'There are currently no complaints in the system.')
          }
          actionLabel={null}
          actionTo={null}
          onReset={isFiltered ? handleResetFilters : null}
          resetLabel={language === 'ne' ? 'सबै फिल्टर हटाउनुहोस्' : 'Clear All Filters'}
        />
      ) : (
        <>
          {/* Mobile View: Responsive Cards (<= 768px) */}
          <div className="complaint-table-mobile" role="list" aria-label="Complaints list">
            {filteredComplaints.map((item) => {
              const docId = item._id || item.id;
              const refCode = item.reference || item.id;
              const dateStr = new Date(item.createdAt || item.submittedAt).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const studentName = item.student?.name || item.studentName || 'Student';
              const studentRoll = item.student?.studentId || item.studentRoll || 'N/A';

              return (
                <div key={docId} className="complaint-mobile-card" role="listitem">
                  <div className="complaint-card-topbar">
                    <span className="table-complaint-id">{refCode}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>

                  <h3 className="complaint-card-title">
                    <Link to={`/admin/complaints/${docId}`} className="complaint-card-title-link">
                      {item.title}
                    </Link>
                  </h3>

                  <div className="complaint-card-category-row">
                    <CategoryBadge category={item.category} />
                  </div>

                  {showStudentInfo && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-body)', marginBottom: 'var(--space-2)' }}>
                      <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      <span>{studentName} ({studentRoll})</span>
                    </div>
                  )}

                  <div className="complaint-card-footer">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{dateStr}</span>
                    </span>

                    <div>
                      {onActionClick ? (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => onActionClick(item)}
                        >
                          <span>{defaultActionLabel}</span>
                        </button>
                      ) : (
                        <Link to={`/admin/complaints/${docId}`} className="btn btn-secondary btn-sm">
                          <span>{defaultActionLabel}</span>
                          <ArrowRight size={12} />
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
                  <th>{language === 'ne' ? 'सन्दर्भ कोड' : 'Reference ID'}</th>
                  <th>{language === 'ne' ? 'विषय / उजुरी' : 'Subject / Issue'}</th>
                  <th>{language === 'ne' ? 'विधा' : 'Category'}</th>
                  {showStudentInfo && <th>{language === 'ne' ? 'विद्यार्थी' : 'Complainant'}</th>}
                  <th>{language === 'ne' ? 'प्राथमिकता' : 'Priority'}</th>
                  <th>{language === 'ne' ? 'स्थिति' : 'Status'}</th>
                  <th>{language === 'ne' ? 'मिति' : 'Date Filed'}</th>
                  <th style={{ textAlign: 'right' }}>{language === 'ne' ? 'कार्य' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((item) => {
                  const docId = item._id || item.id;
                  const refCode = item.reference || item.id;
                  const dateStr = new Date(item.createdAt || item.submittedAt).toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
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
                        <Link to={`/admin/complaints/${docId}`} className="table-complaint-id">
                          {refCode}
                        </Link>
                      </td>

                      {/* Title */}
                      <td>
                        <Link to={`/admin/complaints/${docId}`} className="table-title-link">
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
                          <div style={{ fontWeight: '600', color: 'var(--color-heading)' }}>
                            {studentName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
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
                          >
                            <span>{defaultActionLabel}</span>
                          </button>
                        ) : (
                          <Link to={`/admin/complaints/${docId}`} className="btn btn-secondary btn-sm">
                            <Eye size={13} />
                            <span>{defaultActionLabel}</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default ComplaintTable;
