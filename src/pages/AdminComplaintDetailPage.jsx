import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AdminComplaintDetailView } from '../components/AdminComplaintDetailView';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export function AdminComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchAdminComplaintById, language } = useApp();
  const isNe = language === 'ne';

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComplaint = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminComplaintById(id);
      setComplaint(data);
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      setError(err.message || 'Complaint record not found.');
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchAdminComplaintById]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid var(--color-royal-blue)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px' }} />
        <span>{isNe ? 'डाटाबेसबाट उजुरी विवरण लोड गरिँदैछ...' : 'Loading complaint record from MongoDB...'}</span>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <AlertCircle size={40} color="var(--color-warning)" style={{ margin: '0 auto var(--space-3)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
          {isNe ? 'उजुरी फेला परेन' : 'Complaint Record Not Found'}
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-4)' }}>
          {error || `No record matches ID: ${id}`}
        </p>
        <button type="button" onClick={() => navigate('/admin/complaints')} className="btn btn-primary btn-md">
          <ArrowLeft size={16} />
          <span>{isNe ? 'उजुरी सूचीमा फर्कनुहोस्' : 'Return to Complaints Queue'}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link
          to="/admin/complaints"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          <ArrowLeft size={16} />
          <span>{isNe ? 'सबै उजुरीहरूमा फर्कनुहोस्' : 'Back to Complaints Queue'}</span>
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <AdminComplaintDetailView
          complaint={complaint}
          onComplaintUpdated={setComplaint}
          onClose={() => navigate('/admin/complaints')}
          isDrawer={false}
        />
      </div>
    </div>
  );
}

export default AdminComplaintDetailPage;
