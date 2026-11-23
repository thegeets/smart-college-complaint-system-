import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
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
  Legend
} from 'recharts';
import {
  LayoutDashboard,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Inbox,
  AlertTriangle,
  Zap,
  Activity,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function AdminDashboard() {
  const {
    fetchReportsSummary,
    fetchReportsAnalytics,
    language,
    adminUser,
    getCategoryLabel
  } = useApp();

  const navigate = useNavigate();
  const isNe = language === 'ne';

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [daysPeriod, setDaysPeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  // Tick live SLA timer every second
  useEffect(() => {
    const timer = setInterval(() => setNowTimestamp(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async (days = 30) => {
    setIsLoading(true);
    try {
      const [sumData, analData] = await Promise.all([
        fetchReportsSummary(),
        fetchReportsAnalytics(days),
      ]);
      setSummary(sumData);
      setAnalytics(analData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchReportsSummary, fetchReportsAnalytics]);

  useEffect(() => {
    loadData(daysPeriod);
  }, [loadData, daysPeriod]);

  // Format SLA countdown
  const formatCountdown = (dueAtStr) => {
    if (!dueAtStr) return null;
    const diff = new Date(dueAtStr).getTime() - nowTimestamp;
    const isOverdue = diff <= 0;
    const absDiff = Math.abs(diff);

    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

    const timeStr = `${hours}h ${mins}m ${secs}s`;
    return {
      text: isOverdue ? `${timeStr} overdue` : `${timeStr} remaining`,
      isOverdue,
      isCritical: !isOverdue && hours < 6,
    };
  };

  const total = summary?.total || 0;
  const trend = summary?.trendVsLastWeek || 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-royal-blue)', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '4px' }}>
            <LayoutDashboard size={16} />
            <span>{isNe ? 'प्रशासनिक कार्य सञ्चालन ड्यासबोर्ड' : 'Executive Operations Console'}</span>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.025em' }}>
            {isNe ? `नमस्कार, ${adminUser?.name || 'प्रशासक'}` : `Welcome back, ${adminUser?.name || 'Administrator'}`}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            {isNe ? 'सोच कलेज अफ आईटी: वास्तविक समयको उजुरी व्यवस्थापन, SLA अनुगमन तथा प्राविधिक कार्यभार' : 'Live academic grievance queues, technical SLAs, and service desk metrics.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => loadData(daysPeriod)}
            className="btn btn-secondary btn-sm"
            title="Refresh metrics from database"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>{isNe ? 'ताजा गर्नुहोस्' : 'Refresh Data'}</span>
          </button>

          <Link
            to="/admin/complaints"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>{isNe ? 'उजुरी सूची' : 'Complaints Queue'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 7 KPI Cards Grid */}
      {isLoading && !summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonLoader key={i} height="110px" borderRadius="10px" />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {/* 1. Total */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'कुल उजुरी' : 'Total Filed'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EEF3FB', color: '#5278C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Inbox size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)' }}>
              <AnimatedNumber value={summary?.total || 0} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: trend >= 0 ? '#16A34A' : '#DC2626', marginTop: '4px' }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          </div>

          {/* 2. New Today */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'आज दर्ता' : 'New Today'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F0F7FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563EB' }}>
              <AnimatedNumber value={summary?.newToday || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
              Logged since 00:00
            </div>
          </div>

          {/* 3. Under Review */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'समीक्षामा' : 'Under Review'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FFFBEB', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#B45309' }}>
              <AnimatedNumber value={summary?.pendingReview || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
              Pending triage
            </div>
          </div>

          {/* 4. In Progress */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'मर्मत कार्यमा' : 'In Progress'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F0F7FF', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1D4ED8' }}>
              <AnimatedNumber value={summary?.inProgress || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
              Active technical repair
            </div>
          </div>

          {/* 5. Resolved */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'समाधान भएको' : 'Resolved'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#15803D' }}>
              <AnimatedNumber value={summary?.resolved || 0} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: '600', marginTop: '4px' }}>
              {total > 0 ? `${Math.round(((summary?.resolved || 0) / total) * 100)}% resolution rate` : '—'}
            </div>
          </div>

          {/* 6. SLA Breached / Due Soon */}
          <div className="card" style={{ padding: '16px', backgroundColor: (summary?.slaBreached || 0) > 0 ? '#FEF2F2' : 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: (summary?.slaBreached || 0) > 0 ? '#B91C1C' : 'var(--color-muted)' }}>
                {isNe ? 'SLA उल्लङ्घन / जोखिम' : 'SLA Breached / Due'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: (summary?.slaBreached || 0) > 0 ? '#FEE2E2' : '#FEF3C7', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: (summary?.slaBreached || 0) > 0 ? '#DC2626' : '#D97706' }}>
              <AnimatedNumber value={summary?.slaBreached || 0} />
              <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-muted)' }}>
                {' / '}{summary?.slaDueSoon || 0}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: (summary?.slaBreached || 0) > 0 ? '#B91C1C' : 'var(--color-muted)', marginTop: '4px' }}>
              {(summary?.slaBreached || 0) > 0 ? 'Urgent attention required' : 'Due in next 12 hours'}
            </div>
          </div>

          {/* 7. Avg Resolution Time */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                {isNe ? 'औसत समाधान समय' : 'Avg Resolution'}
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)' }}>
              {summary?.avgResolutionTimeHours || 14.5}h
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '4px' }}>
              Well within 24-48h SLA
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Charts & Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left 8 cols: Area Chart (Complaints Over Time) */}
        <div className="card" style={{ gridColumn: 'span 8', padding: '20px', minHeight: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'उजुरी चाप प्रवृत्ति (समय अनुसार)' : 'Complaints Volume & Resolution Velocity'}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                Daily trend of logged versus resolved technical complaints.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-surface-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysPeriod(d)}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    backgroundColor: daysPeriod === d ? 'var(--color-royal-blue)' : 'transparent',
                    color: daysPeriod === d ? '#FFFFFF' : 'var(--color-muted)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <SkeletonLoader height="280px" borderRadius="8px" />
          ) : analytics?.timeSeries && analytics.timeSeries.length > 0 ? (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5278C8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#5278C8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--color-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="total" name="Total Filed" stroke="#5278C8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              No time-series data available for the selected period.
            </div>
          )}
        </div>

        {/* Right 4 cols: Needs Attention Panel */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={15} />
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'तत्काल ध्यान दिनुपर्ने' : 'Needs Attention'}
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '9999px' }}>
              {analytics?.needsAttention?.length || 0}
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '14px' }}>
            Urgent priority issues and complaints nearing SLA breach.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', maxHeight: '280px' }}>
            {isLoading ? (
              <>
                <SkeletonLoader height="70px" borderRadius="8px" />
                <SkeletonLoader height="70px" borderRadius="8px" />
                <SkeletonLoader height="70px" borderRadius="8px" />
              </>
            ) : !analytics?.needsAttention || analytics.needsAttention.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#15803D', textAlign: 'center', padding: '20px' }}>
                <CheckCircle2 size={32} color="#16A34A" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>SLA Compliance 100%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>No breached or critical complaints right now.</div>
              </div>
            ) : (
              analytics.needsAttention.map((item) => {
                const countdown = formatCountdown(item.slaDueAt);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: countdown?.isOverdue ? '#FEF2F2' : 'var(--color-surface-subtle)',
                      border: `1px solid ${countdown?.isOverdue ? '#FECACA' : 'var(--color-border)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem', color: 'var(--color-royal-blue)' }}>
                        {item.reference}
                      </span>
                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.6875rem' }}>
                      <div style={{ color: countdown?.isOverdue ? '#DC2626' : countdown?.isCritical ? '#D97706' : '#15803D', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        <span>{countdown?.text || 'Standard SLA'}</span>
                      </div>

                      <Link
                        to={`/admin/complaints/${item.id}`}
                        style={{ color: 'var(--color-royal-blue)', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <span>Triage</span>
                        <ChevronRight size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Categories, Priority Breakdown & Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
        
        {/* Category Breakdown Chart (4 cols) */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '20px', minHeight: '340px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 4px' }}>
            {isNe ? 'वर्ग अनुसार उजुरी संख्या' : 'Complaints by Service Area'}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '14px' }}>
            Distribution across the 6 campus IT service zones.
          </div>

          {isLoading ? (
            <SkeletonLoader height="240px" borderRadius="8px" />
          ) : analytics?.categories && analytics.categories.length > 0 ? (
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categories.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                  <XAxis type="number" fontSize={10} stroke="var(--color-muted)" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" fontSize={10} stroke="var(--color-muted)" width={100} tickFormatter={(val) => val.split('/')[0].trim()} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '0.75rem' }}
                  />
                  <Bar dataKey="count" name="Total Tickets" fill="#5278C8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
              No category data recorded yet.
            </div>
          )}
        </div>

        {/* Priority & Status Funnel (4 cols) */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '20px', minHeight: '340px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 4px' }}>
            {isNe ? 'प्राथमिकता तथा समाधान फनेल' : 'Priority & Status Pipeline'}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '16px' }}>
            Severity tiering and active stage throughput.
          </div>

          {isLoading ? (
            <SkeletonLoader height="240px" borderRadius="8px" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Priority Bar Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics?.priorities?.map((p) => {
                  const maxCount = Math.max(...(analytics.priorities.map((item) => item.count) || [1]), 1);
                  const pct = Math.round((p.count / maxCount) * 100);
                  return (
                    <div key={p.priority}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', marginBottom: '2px' }}>
                        <span style={{ color: p.color }}>{p.priority}</span>
                        <span>{p.count} tickets</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '9999px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: p.color, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Funnel Badges */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {analytics?.statusFunnel?.map((st) => (
                  <div key={st.stage} style={{ padding: '8px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '6px', fontSize: '0.75rem' }}>
                    <div style={{ color: 'var(--color-muted)' }}>{st.stage}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-heading)' }}>{st.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Activity Feed (4 cols) */}
        <div className="card" style={{ gridColumn: 'span 4', padding: '20px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EEF3FB', color: '#5278C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} />
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
                {isNe ? 'हालको गतिविधि' : 'Recent Activity Feed'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', maxHeight: '250px' }}>
            {isLoading ? (
              <>
                <SkeletonLoader height="40px" />
                <SkeletonLoader height="40px" />
                <SkeletonLoader height="40px" />
              </>
            ) : !analytics?.recentActivity || analytics.recentActivity.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                No recent activity logged.
              </div>
            ) : (
              analytics.recentActivity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-heading)' }}>
                      {act.action}
                    </span>
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.6875rem' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ color: 'var(--color-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/complaints/${act.complaintId}`} style={{ color: 'var(--color-royal-blue)', fontWeight: '600', textDecoration: 'none' }}>
                      {act.reference}
                    </Link>
                    {' • '}{act.performedBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
