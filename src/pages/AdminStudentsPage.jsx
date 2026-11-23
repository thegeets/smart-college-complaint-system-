import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import {
  GraduationCap,
  Search,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export function AdminStudentsPage() {
  const { fetchStudentsList, language } = useApp();
  const isNe = language === 'ne';

  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudentsList({ page, limit: 15, search: debouncedSearch });
      setStudents(data.students || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStudentsList, page, debouncedSearch]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-royal-blue)', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px' }}>
            <GraduationCap size={16} />
            <span>{isNe ? 'विद्यार्थी निर्देशिका तथा उजुरी अभिलेख' : 'Student Registry & Grievance Directory'}</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            {isNe ? 'दर्ता भएका विद्यार्थीहरू' : 'Registered CSIT Students'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            {isNe ? 'कलेजमा दर्ता भएका विद्यार्थीहरू र उनीहरूले दर्ता गरेका उजुरी विवरण' : 'Directory of verified BSc CSIT students and their complaint history.'}
          </p>
        </div>

        <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          {isNe ? 'कुल विद्यार्थी:' : 'Total Students:'} <span style={{ color: 'var(--color-royal-blue)' }}>{total}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isNe ? 'विद्यार्थीको नाम, रोल नम्बर वा इमेलबाट खोजी...' : 'Search by student name, roll number, or email...'}
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px', width: '100%', fontSize: '0.875rem' }}
            />
          </div>

          <button
            type="button"
            onClick={loadStudents}
            className="btn btn-secondary btn-sm"
            title="Refresh directory"
            style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Students Table / Cards */}
      {isLoading ? (
        <div className="card" style={{ padding: '24px' }}>
          <SkeletonLoader height="40px" style={{ marginBottom: '12px' }} />
          <SkeletonLoader height="50px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader height="50px" style={{ marginBottom: '8px' }} />
          <SkeletonLoader height="50px" />
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <GraduationCap size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 6px' }}>
            {isNe ? 'कुनै विद्यार्थी फेला परेन' : 'No students found'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {search ? 'Try clearing your search term.' : 'Students will appear here once they register.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 18px' }}>Student Info</th>
                  <th style={{ padding: '12px 18px' }}>Roll / Student ID</th>
                  <th style={{ padding: '12px 18px' }}>Program & Semester</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>Total Filed</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>Active</th>
                  <th style={{ padding: '12px 18px', textAlign: 'center' }}>Resolved</th>
                  <th style={{ padding: '12px 18px' }}>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const initials = student.name
                    ? student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr
                      key={student._id || student.id}
                      style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.15s ease' }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            backgroundColor: '#EEF3FB',
                            color: '#5278C8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: '700'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--color-heading)' }}>{student.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail size={12} />
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: '600', color: '#334155' }}>
                        {student.studentId}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569'
                        }}>
                          <BookOpen size={12} />
                          <span>{student.program || 'BSc CSIT'} • {student.semester || 'Semester'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-heading)' }}>
                          {student.complaintsCount || 0}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: student.activeCount > 0 ? '#EFF6FF' : '#F1F5F9',
                          color: student.activeCount > 0 ? '#2563EB' : '#94A3B8'
                        }}>
                          {student.activeCount || 0}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: student.resolvedCount > 0 ? '#F0FDF4' : '#F1F5F9',
                          color: student.resolvedCount > 0 ? '#16A34A' : '#94A3B8'
                        }}>
                          {student.resolvedCount || 0}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid var(--color-border)', fontSize: '0.8125rem' }}>
              <div style={{ color: 'var(--color-muted)' }}>
                Page {page} of {totalPages}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminStudentsPage;
