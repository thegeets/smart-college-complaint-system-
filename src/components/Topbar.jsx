import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  Menu,
  Bell,
  User,
  Globe
} from 'lucide-react';

export function Topbar({ onOpenMobileMenu }) {
  const { 
    currentUser, 
    notifications, 
    language,
    t 
  } = useApp();

  const location = useLocation();
  const unreadCount = notifications.filter((n) => n.unread).length;
  const isNe = language === 'ne';

  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/student') {
      return { 
        title: t('studentDashboard.deskTag', 'Student Dashboard'), 
        sub: `${t('studentDashboard.welcome', 'Welcome,')} ${currentUser.name}` 
      };
    }
    if (path === '/submit') {
      return { 
        title: t('submitComplaint.pageTitle', 'Submit an IT Complaint'), 
        sub: t('submitComplaint.pageSubtitle', 'Report computer lab, network, or classroom issues') 
      };
    }
    if (path === '/student/complaints') {
      return { 
        title: t('myComplaints.pageTitle', 'My Complaints'), 
        sub: t('myComplaints.pageSubtitle', 'Track and review your submitted grievances') 
      };
    }
    if (path === '/notifications') {
      return { 
        title: t('notificationsPage.pageTitle', 'Notifications & Alerts'), 
        sub: t('notificationsPage.pageSubtitle', 'Status updates and technical notices') 
      };
    }
    if (path === '/profile') {
      return { 
        title: t('profile.pageTitle', 'Student Profile & Settings'), 
        sub: `${currentUser.rollNumber} • ${currentUser.program}` 
      };
    }
    if (path.startsWith('/complaint/')) {
      return { 
        title: t('details.liveProgress', 'Complaint Tracking & Details'), 
        sub: t('details.demoDataWatermark', 'Read-only timeline and resolution progress') 
      };
    }
    if (path === '/track') {
      return { 
        title: t('trackPage.pageTitle', 'Track Complaint'), 
        sub: COLLEGE_CONFIG.name 
      };
    }
    return { 
      title: COLLEGE_CONFIG.portalTitle, 
      sub: COLLEGE_CONFIG.name 
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="page-breadcrumb">
          <h1 className="page-title">{pageInfo.title}</h1>
          <span className="page-subtitle">{pageInfo.sub}</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Language Switcher Control */}
        <LanguageSwitcher size="sm" />

        {/* Public Homepage Link */}
        <Link
          to="/"
          className="topbar-action-btn"
          aria-label="Go to Public Homepage"
          title={isNe ? 'कलेज गृहपृष्ठ हेर्नुहोस्' : 'View Public Website'}
        >
          <Globe size={18} />
        </Link>

        {/* Notifications Icon Button */}
        <Link
          to="/notifications"
          className="topbar-action-btn"
          aria-label={`View notifications (${unreadCount} unread)`}
          title={t('nav.notifications', 'Notifications')}
        >
          <Bell size={19} />
          {unreadCount > 0 && <span className="notif-badge-dot" />}
        </Link>

        {/* User Profile Shortcut */}
        <Link
          to="/profile"
          className="topbar-action-btn"
          aria-label="Student Profile"
          title={t('nav.profile', 'View Profile')}
        >
          <User size={19} />
        </Link>
      </div>
    </header>
  );
}

export default Topbar;
