import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

export function ReportsAnalyticsPage() {
  const { fetchReportsSummary, categories, language, getCategoryLabel } = useApp();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isNe = language === 'ne';

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReportsSummary();
      setSummary(data);
    } catch (err) {
      console.error('Reports load error:', err);
      setError(err.message || 'Failed to load reports from database.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsSummary]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const total = summary?.total || 0;
  const resolved = summary?.resolved || 0;
  const pending = summary?.pendingReview || 0;
  const inProgress = summary?.inProgress || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-1)' }}>
            {isNe ? 'उजुरी प्रतिवेदन तथा तथ्याङ्क' : 'Grievance Reports & Analytics'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe ? 'डाटाबेस-आधारित तथ्याङ्क: समाधान दर, समस्याका विधा, तथा स्थिति वितरण' : 'Real-time database analytics: resolution rate, IT category breakdown, and status distribution'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadReports}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
          >
            <Printer size={14} />
            <span>{isNe ? 'प्रिन्ट गर्नुहोस्' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '6px',
          color: '#B91C1C',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isNe ? 'कुल दर्ता उजुरी' : 'Total Filed'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {isNe ? 'डाटाबेसमा सुरक्षित' : 'Recorded in MongoDB'}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isNe ? 'समीक्षा बाँकी' : 'Pending Review'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-warning)' }}>
            {pending}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {isNe ? 'खटन पर्खिरहेको' : 'Awaiting admin triage'}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isNe ? 'कार्यान्वयनमा' : 'In Progress'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-teal)' }}>
            {inProgress}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {isNe ? 'प्राविधिक कार्य जारी' : 'Under active technical repair'}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
            {isNe ? 'समाधान दर' : 'Resolution Rate'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {resolutionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {resolved} {isNe ? 'सम्पन्न' : 'complaints closed'}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="#0F766E" />
          <span>{isNe ? 'आईटी विधागत तथ्याङ्क' : 'Complaints by IT Category'}</span>
        </h2>

        {/* Visual Distribution Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {categories.map((cat) => {
            const count = summary?.byCategory?.[cat] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: '600', color: '#1E293B' }}>{getCategoryLabel(cat)}</span>
                  <span style={{ color: '#64748B', fontWeight: '500' }}>
                    {count} {isNe ? 'उजुरी' : 'items'} ({pct}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: '#0F766E',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>{isNe ? 'आईटी विधा' : 'Category'}</th>
                <th style={{ textAlign: 'center' }}>{isNe ? 'संख्या' : 'Complaint Count'}</th>
                <th style={{ textAlign: 'right' }}>{isNe ? 'प्रतिशत' : 'Share of Total'}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const count = summary?.byCategory?.[cat] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <tr key={cat}>
                    <td>
                      <strong style={{ color: '#0F172A' }}>{getCategoryLabel(cat)}</strong>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#15365D' }}>{count}</span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748B' }}>
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalyticsPage;
