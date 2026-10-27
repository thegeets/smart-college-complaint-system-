import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DemoBanner } from './DemoBanner';
import { ToastContainer } from './ToastContainer';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Role-Specific Slide-In Menu */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className="main-layout">
        {/* Top Demo Disclaimer & Role Switcher */}
        <DemoBanner />

        {/* Dashboard Topbar */}
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main Routed Page Content with Tasteful Entrance Animation */}
        <main className="content-area">
          <div key={location.pathname} className="page-route-transition">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile One-Handed Bottom Navigation */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
}
