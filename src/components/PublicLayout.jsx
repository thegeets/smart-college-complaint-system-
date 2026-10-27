import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from './DemoBanner';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';
import { ToastContainer } from './ToastContainer';

export function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Honest Demo Notice Strip */}
      <DemoBanner />

      {/* College Public Navigation */}
      <PublicNavbar />

      {/* Routed Public Pages (Landing, Track) */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* College Footer */}
      <Footer />

      {/* Global Alerts */}
      <ToastContainer />
    </div>
  );
}

export default PublicLayout;
