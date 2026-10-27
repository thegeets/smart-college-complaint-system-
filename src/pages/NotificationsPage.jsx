import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  Info
} from 'lucide-react';

export function NotificationsPage() {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    t 
  } = useApp();
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredNotifs = notifications.filter((item) => {
    if (filter === 'UNREAD') return item.unread;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (item) => {
    if (item.unread) {
      markNotificationRead(item.id);
    }
    if (item.complaintId) {
      navigate(`/complaint/${item.complaintId}`);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy-900)' }}>
            {t('notificationsPage.pageTitle', 'System Notifications & Alerts')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {t('notificationsPage.pageSubtitle', 'Stay updated with immediate status changes, staff assignments, and campus notices.')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={markAllNotificationsRead}
            >
              <CheckCheck size={14} />
              <span>{t('notificationsPage.markAllBtn', 'Mark All as Read')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('notificationsPage.tabAll', 'All Notifications')} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t('notificationsPage.tabUnread', 'Unread')} ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="card">
        {filteredNotifs.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', padding: '3rem 1.5rem' }}>
            <div className="empty-state-icon">
              <Bell size={28} />
            </div>
            <h3>{t('notificationsPage.emptyTitle', 'No Notifications')}</h3>
            <p>{t('notificationsPage.emptyDesc', 'You have caught up with all updates and grievance activities.')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredNotifs.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '1.15rem 1.4rem',
                  borderBottom: '1px solid var(--border-light)',
                  backgroundColor: item.unread ? '#f0f9ff' : '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                className="hover-row"
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: item.unread ? 'var(--sky-100)' : 'var(--bg-subtle)',
                      color: item.unread ? 'var(--sky-600)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Info size={18} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: item.unread ? '700' : '600', color: 'var(--navy-900)' }}>
                        {item.title}
                      </h4>
                      {item.unread && (
                        <span style={{ fontSize: '0.65rem', background: 'var(--sky-500)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '700' }}>
                          {t('common.newBadge', 'NEW')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                      {item.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      <span>{item.time}</span>
                      {item.complaintId && (
                        <span style={{ color: 'var(--sky-600)', fontWeight: '600' }}>
                          {t('common.referenceId', 'Complaint ID')}: {item.complaintId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  {item.unread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(item.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                      title={t('notificationsPage.markReadBtn', 'Mark as read')}
                    >
                      {t('notificationsPage.markReadBtn', 'Mark read')}
                    </button>
                  )}
                  {item.complaintId && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      <ArrowRight size={16} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
