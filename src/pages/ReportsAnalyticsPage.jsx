import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  RefreshCw,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Wrench,
  FileText,
  AlertTriangle
} from 'lucide-react';

export function ReportsAnalyticsPage() {
  const { fetchReportsSummary, categories, language, getCategoryLabel, getPriorityLabel, priorities } = useApp();
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
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchReportsSummary();
        if (isMounted) {
          setSummary(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load reports from database.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fetchReportsSummary]);

  const total = summary?.total || 0;
  const resolved = summary?.resolved || 0;
  const pending = summary?.pendingReview || 0;
  const inProgress = summary?.inProgress || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
              {isNe ? 'उजुरी प्रतिवेदन तथा तथ्याङ्क' : 'Grievance Reports & Analytics'}
            </h1>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: '700',
              padding: '2px 8px',
              backgroundColor: '#EEF3FB',
              color: '#203B64',
              borderRadius: '9999px',
              border: '1px solid #D5E1F7'
            }}>
              MongoDB Aggregated
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? 'डाटाबेस-आधारित तथ्याङ्क: समाधान दर, समस्याका आईटी विधागत वितरण र प्राथमिकता विश्लेषण'
              : 'Real-time database analytics: resolution rate, service area distribution, and severity breakdown'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={loadReports}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh Metrics'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={13} />
            <span>{isNe ? 'प्रिन्ट प्रतिवेदन' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '8px',
          color: '#B91C1C',
          fontSize: '0.875rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card kpi-navy">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कुल दर्ता उजुरी' : 'Total Filed'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0F4FA', color: '#101D35' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{total}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'डाटाबेसमा सुरक्षित' : 'Recorded in MongoDB Atlas'}</span>
            <span style={{ fontWeight: '600', color: '#101D35' }}>100%</span>
          </div>
        </div>

        <div className="admin-kpi-card kpi-amber">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समीक्षा बाँकी' : 'Pending Triage'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#FFFBEB', color: '#B45309' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#B45309' }}>{pending}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'खटन पर्खिरहेको' : 'Awaiting admin triage'}</span>
            <span style={{ fontWeight: '600', color: '#B45309' }}>
              {total > 0 ? Math.round((pending / total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="admin-kpi-card kpi-blue">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कार्यान्वयनमा' : 'In Progress'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#5278C8' }}>
              <Wrench size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#5278C8' }}>{inProgress}</div>
          <div className="admin-kpi-subtext">
            <span>{isNe ? 'प्राविधिक कार्य जारी' : 'Active remediation'}</span>
            <span style={{ fontWeight: '600', color: '#5278C8' }}>
              {total > 0 ? Math.round((inProgress / total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="admin-kpi-card kpi-emerald">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समाधान दर' : 'Resolution Rate'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: '#15803D' }}>{resolutionRate}%</div>
          <div className="admin-kpi-subtext">
            <span>{resolved} {isNe ? 'सम्पन्न' : 'closed tickets'}</span>
            <span style={{ fontWeight: '600', color: '#15803D' }}>{resolved}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections Grid */}
      <div className="admin-analytics-grid">
        {/* Category Breakdown Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#5278C8" />
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'आईटी विधागत तथ्याङ्क' : 'Complaints by IT Category'}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {categories.length} {isNe ? 'विधाहरू' : 'Categories'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {categories.map((cat) => {
              const count = summary?.byCategory?.[cat] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat} className="admin-cat-bar-item">
                  <div className="admin-cat-bar-header">
                    <span style={{ fontWeight: '600', color: '#1E293B' }}>{getCategoryLabel(cat)}</span>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>
                      {count} {isNe ? 'उजुरी' : 'items'} ({pct}%)
                    </span>
                  </div>
                  <div className="admin-cat-bar-track">
                    <div className="admin-cat-bar-fill" style={{ width: `${pct}%` }} />
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
                  <th style={{ textAlign: 'center' }}>{isNe ? 'संख्या' : 'Count'}</th>
                  <th style={{ textAlign: 'right' }}>{isNe ? 'प्रतिशत' : 'Share'}</th>
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
                        <span style={{ fontWeight: '700', color: 'var(--color-navy)' }}>{count}</span>
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

        {/* Priority Severity Breakdown Card */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#B45309" />
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'प्राथमिकता स्तर विश्लेषण' : 'Severity & Priority Breakdown'}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
              {priorities.length} {isNe ? 'तहहरू' : 'Tiers'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {priorities.map((pri) => {
              const count = summary?.byPriority?.[pri] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              const priColors = {
                Urgent: { color: '#B91C1C', bg: '#FEF2F2', fill: '#DC2626' },
                High: { color: '#C2410C', bg: '#FFEDD5', fill: '#EA580C' },
                Medium: { color: '#854D0E', bg: '#FEF3C7', fill: '#D97706' },
                Low: { color: '#475569', bg: '#F1F5F9', fill: '#64748B' },
              };
              const c = priColors[pri] || priColors.Low;

              return (
                <div key={pri} className="admin-cat-bar-item">
                  <div className="admin-cat-bar-header">
                    <span style={{ fontWeight: '600', color: c.color }}>{getPriorityLabel(pri)}</span>
                    <span style={{ color: '#64748B', fontWeight: '600' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="admin-cat-bar-track">
                    <div className="admin-cat-bar-fill" style={{ width: `${pct}%`, backgroundColor: c.fill }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{isNe ? 'प्राथमिकता तह' : 'Priority Level'}</th>
                  <th style={{ textAlign: 'center' }}>{isNe ? 'संख्या' : 'Count'}</th>
                  <th style={{ textAlign: 'right' }}>{isNe ? 'प्रतिशत' : 'Share'}</th>
                </tr>
              </thead>
              <tbody>
                {priorities.map((pri) => {
                  const count = summary?.byPriority?.[pri] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <tr key={pri}>
                      <td>
                        <strong style={{ color: '#0F172A' }}>{getPriorityLabel(pri)}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-navy)' }}>{count}</span>
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
    </div>
  );
}

export default ReportsAnalyticsPage;
