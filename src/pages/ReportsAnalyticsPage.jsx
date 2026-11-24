import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../config/api';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Printer,
  RefreshCw,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Wrench,
  FileText,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  TrendingUp,
  Award
} from 'lucide-react';

const PRIORITY_COLORS = {
  Urgent: '#B91C1C',
  High: '#B45309',
  Medium: '#5278C8',
  Low: '#15803D',
};

const STATUS_COLORS = {
  Submitted: '#64748B',
  'Under Review': '#B45309',
  'In Progress': '#5278C8',
  Resolved: '#15803D',
};

export function ReportsAnalyticsPage() {
  const { fetchReportsAnalytics, language } = useApp();
  const isNe = language === 'ne';

  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchReportsAnalytics({ range });
      setData(res);
    } catch (err) {
      console.error('Reports load error:', err);
      setError(err.message || 'Failed to load analytics from database.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsAnalytics, range]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data?.summary || {};
  const total = summary.total || 0;
  const resolved = summary.resolved || 0;
  const inProgress = summary.inProgress || 0;
  const pending = summary.pendingReview || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const avgHours = summary.avgResolutionTimeHours || 0;
  const slaBreached = summary.slaBreached || 0;

  // Chart data
  const volumeData = (data?.volumeOverTime || []).map((item) => ({
    date: item.date?.slice(5) || item._id?.slice(5) || item.date || '',
    count: item.count || 0,
  }));

  const categoryData = (data?.byCategory || []).map((item) => ({
    name: item._id || item.category || 'Other',
    count: item.count || 0,
  }));

  const priorityData = (data?.byPriority || []).map((item) => ({
    name: item._id || item.priority || 'Medium',
    count: item.count || 0,
    color: PRIORITY_COLORS[item._id] || '#5278C8',
  }));

  const statusFunnel = data?.statusFunnel || [
    { status: 'Submitted', count: summary.submitted || 0 },
    { status: 'Under Review', count: pending },
    { status: 'In Progress', count: inProgress },
    { status: 'Resolved', count: resolved },
  ];

  const technicianWorkload = (data?.technicianWorkload || []).map((item) => ({
    name: item.name || 'Technician',
    active: item.active || 0,
    resolved: item.resolved || 0,
  }));

  const handleExportCsv = () => {
    window.location.href = apiUrl('/api/v1/admin/complaints/export/csv');
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
              {isNe ? 'उजुरी प्रतिवेदन तथा तथ्याङ्क' : 'Grievance Reports & Analytics'}
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
              MongoDB Real-Time Pipeline
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {isNe
              ? 'समस्याका आईटी विधागत वितरण, समाधान गति र प्राविधिक कार्यसम्पादनको पूर्ण विश्लेषण'
              : 'Database aggregation of IT grievances, SLA compliance, resolution throughput, and technician performance.'}
          </p>
        </div>

        {/* Action Controls & Range Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Time Range Selector */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '8px' }}>
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: range === r ? '#101D35' : 'transparent',
                  color: range === r ? '#FFFFFF' : 'var(--color-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span className="desktop-only">{isNe ? 'ताजा' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={13} />
            <span>{isNe ? 'प्रिन्ट' : 'Print'}</span>
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
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-kpi-card kpi-navy">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'कुल दर्ता उजुरी' : 'Total Complaints'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#101D35' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{total}</div>
          <div className="admin-kpi-subtext">{isNe ? 'समीक्षाको दायरामा' : `In current ${range} window`}</div>
        </div>

        <div className="admin-kpi-card kpi-emerald">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'समाधान दर' : 'Resolution Rate'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#F0FDF4', color: '#15803D' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{resolutionRate}%</div>
          <div className="admin-kpi-subtext">{resolved} of {total} tickets resolved</div>
        </div>

        <div className="admin-kpi-card kpi-blue">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'औसत समाधान समय' : 'Avg Resolution Time'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#EEF3FB', color: '#5278C8' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{avgHours > 0 ? `${avgHours}h` : '—'}</div>
          <div className="admin-kpi-subtext">{isNe ? 'टिकट बन्द सम्मको समय' : 'From submission to resolution'}</div>
        </div>

        <div className="admin-kpi-card kpi-amber">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">{isNe ? 'एसएलए उल्लंघन' : 'SLA Breaches'}</span>
            <div className="admin-kpi-icon-bubble" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-kpi-value" style={{ color: slaBreached > 0 ? '#B91C1C' : 'var(--color-heading)' }}>
            {slaBreached}
          </div>
          <div className="admin-kpi-subtext">
            {slaBreached === 0 ? '✓ Zero SLA breaches' : 'Tickets exceeding SLA window'}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Daily Volume Over Time (Area Chart) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                {isNe ? 'दैनिक उजुरी आगमन प्रवाह' : 'Complaint Volume Over Time'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                {isNe ? 'विगतका दिनहरूमा दर्ता भएका उजुरीहरूको प्रवृत्ति' : `Intake timeline across the last ${range}`}
              </p>
            </div>
            <TrendingUp size={18} color="#5278C8" />
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5278C8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5278C8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101D35', borderRadius: '6px', color: '#FFFFFF', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Area type="monotone" dataKey="count" name="Complaints" stroke="#203B64" strokeWidth={2} fillOpacity={1} fill="url(#volumeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category (Bar Chart) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                {isNe ? 'विधागत उजुरी वितरण' : 'Volume by Category'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                {isNe ? 'कलेजका विभिन्न पूर्वाधार विधामा दर्ता' : 'Breakdown across campus IT infrastructure'}
              </p>
            </div>
            <BarChart3 size={18} color="#203B64" />
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101D35', borderRadius: '6px', color: '#FFFFFF', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Bar dataKey="count" name="Tickets" fill="#203B64" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie / Bar Chart) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                {isNe ? 'प्राथमिकता अनुसार वितरण' : 'Priority Distribution'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                {isNe ? 'उजुरीको गम्भीरता स्तर' : 'Urgent vs High vs Medium vs Low'}
              </p>
            </div>
            <Award size={18} color="#B45309" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#101D35', borderRadius: '6px', color: '#FFFFFF', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.75rem' }}>
            {priorityData.map((p) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: p.color }} />
                <span>{p.name}: <strong>{p.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Lifecycle Funnel */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                {isNe ? 'उजुरी स्थिति रूपान्तरण फनेल' : 'Resolution Pipeline Funnel'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                {isNe ? 'दर्ता देखि समाधान सम्मको प्रक्रिया' : 'Stage progression from Submitted to Resolved'}
              </p>
            </div>
            <Layers size={18} color="#15803D" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px' }}>
            {statusFunnel.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const color = STATUS_COLORS[item.status] || '#5278C8';

              return (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-heading)' }}>{item.status}</span>
                    <span style={{ color: 'var(--color-muted)' }}>
                      <strong>{item.count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technician Workload Card (if available) */}
      {technicianWorkload.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                {isNe ? 'प्राविधिक कार्यबोझ तथा समाधान' : 'Technician Workload & Performance'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>
                {isNe ? 'तोकिएका सक्रिय उजुरी र सफलतापूर्वक सम्पन्न कार्य' : 'Active assigned tickets vs successfully closed tickets'}
              </p>
            </div>
            <Wrench size={18} color="#203B64" />
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={technicianWorkload} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101D35', borderRadius: '6px', color: '#FFFFFF', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="active" name="Active Tickets" fill="#5278C8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved Tickets" fill="#15803D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsAnalyticsPage;
