import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  Search,
  Menu
} from 'lucide-react';

export function MobileBottomNav({ onOpenMenu }) {
  const { language, t } = useApp();
  const isNe = language === 'ne';

  const navItems = [
    { to: '/student', label: isNe ? 'ड्यासबोर्ड' : 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/submit', label: isNe ? 'दर्ता' : 'Lodge', icon: PlusCircle, isPrimaryAction: true },
    { to: '/student/complaints', label: isNe ? 'गुनासोहरू' : 'Complaints', icon: ListFilter },
    { to: '/track', label: isNe ? 'गुनासोको अवस्था' : 'Track Complaint', icon: Search },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'active' : ''} ${item.isPrimaryAction ? 'primary-action' : ''}`
            }
          >
            <div className="mobile-nav-icon-wrap">
              <Icon size={20} />
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Slide-in Menu Opener Button */}
      <button
        type="button"
        className="mobile-nav-link mobile-nav-menu-btn"
        onClick={onOpenMenu}
        aria-label="Open main menu and quick links"
      >
        <div className="mobile-nav-icon-wrap">
          <Menu size={20} />
        </div>
        <span className="mobile-nav-label">{t('nav.menu', 'Menu')}</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
