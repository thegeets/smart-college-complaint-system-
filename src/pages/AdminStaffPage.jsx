import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Users,
  UserPlus,
  Shield,
  Wrench,
  CheckCircle,
  XCircle,
  Search,
  Phone,
  Mail,
  RefreshCw,
  Building,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

export function AdminStaffPage() {
  const { fetchStaffMembers, createStaffMember, updateStaffStatus, language } = useApp();
  const isNe = language === 'ne';

  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Technician',
    title: 'Hardware & Lab Technician',
    department: 'Central IT Support Desk',
    specialization: 'Networking & Hardware Diagnostics',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchStaffMembers();
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStaffMembers]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleToggleStatus = async (staff) => {
    try {
      await updateStaffStatus(staff._id || staff.id, !staff.isActive);
      loadStaff();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await createStaffMember(formData);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Technician',
        title: 'Hardware & Lab Technician',
        department: 'Central IT Support Desk',
        specialization: 'Networking & Hardware Diagnostics',
        phone: '',
      });
      loadStaff();
    } catch (err) {
      setFormError(err.message || 'Failed to onboard staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.specialization?.toLowerCase().includes(q) ||
      s.title?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const totalTechnicians = staffList.filter((s) => s.role === 'Technician' || s.role === 'Staff').length;
  const totalActiveWorkload = staffList.reduce((acc, s) => acc + (s.activeComplaintsCount || 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-royal-blue)', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '4px' }}>
            <Users size={16} />
            <span>{isNe ? 'प्रशासनिक जनशक्ति व्यवस्थापन' : 'Staff & Personnel Directory'}</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0, letterSpacing: '-0.02em' }}>
            {isNe ? 'प्राविधिक तथा कर्मचारी टोली' : 'Technicians & IT Support Staff'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: '4px 0 0' }}>
            {isNe ? 'उजुरी समाधानका लागि खटिएका इन्जिनियर तथा प्राविधिकहरूको कार्यभार व्यवस्थापन' : 'Manage IT coordinators, lab technicians, and live ticket distribution.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn btn-primary btn-md"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={16} />
          <span>{isNe ? 'नयाँ प्राविधिक थप्नुहोस्' : 'Onboard Technician'}</span>
        </button>
      </div>

      {/* Metric Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px' }}>
            {isNe ? 'कुल कर्मचारी / प्राविधिक' : 'Total IT Staff'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-heading)' }}>
            {staffList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {totalTechnicians} {isNe ? 'सक्रिय प्राविधिकहरू' : 'field specialists'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px' }}>
            {isNe ? 'सञ्चालित कार्यभार' : 'Active Assigned Tasks'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563EB' }}>
            {totalActiveWorkload}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '4px' }}>
            {isNe ? 'समाधानको क्रममा रहेका टिकटहरू' : 'tickets currently in repair'}
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px' }}>
            {isNe ? 'सेवा केन्द्र स्थिति' : 'Service Desk Status'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: '700', color: '#16A34A', marginTop: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            <span>{isNe ? 'सञ्चालनमा' : 'Optimal'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '6px' }}>
            {isNe ? 'सबै विभाग सक्रिय' : 'Full lab coverage active'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isNe ? 'नाम, इमेल वा विशेषज्ञता खोजी...' : 'Search by name, email, or specialization...'}
                className="input-field"
                style={{ paddingLeft: '38px', height: '40px', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {['All', 'Technician', 'Staff', 'Admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`btn btn-sm ${roleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                style={{ height: '36px', fontSize: '0.75rem', fontWeight: '600' }}
              >
                {role}
              </button>
            ))}

            <button
              type="button"
              onClick={loadStaff}
              className="btn btn-secondary btn-sm"
              title="Refresh staff roster"
              style={{ height: '36px', width: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          <SkeletonLoader height="180px" borderRadius="12px" />
          <SkeletonLoader height="180px" borderRadius="12px" />
          <SkeletonLoader height="180px" borderRadius="12px" />
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Users size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 6px' }}>
            {isNe ? 'कुनै कर्मचारी फेला परेन' : 'No staff members found'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0 }}>
            {searchQuery ? 'Try clearing your search query or role filter.' : 'Onboard your first technician using the button above.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredStaff.map((staff) => {
            const initials = staff.name
              ? staff.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : 'ST';

            return (
              <div key={staff._id || staff.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: staff.role === 'Admin' ? '#101D35' : staff.role === 'Technician' ? '#2563EB' : '#0F766E',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '1rem'
                    }}>
                      {initials}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading)', margin: '0 0 2px' }}>
                        {staff.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                        {staff.title || 'Technical Staff'}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: staff.role === 'Admin' ? '#EEF2FF' : '#F0F9FF',
                    color: staff.role === 'Admin' ? '#4338CA' : '#0369A1',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {staff.role}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#475569', marginBottom: '16px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="#64748B" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{staff.email}</span>
                  </div>
                  {staff.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="#64748B" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={14} color="#64748B" />
                    <span>{staff.specialization || 'General IT Support'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={14} color="#64748B" />
                    <span>{staff.department || 'Central IT Desk'}</span>
                  </div>
                </div>

                {/* Footer Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontWeight: '700',
                      color: staff.activeComplaintsCount > 0 ? '#2563EB' : '#16A34A'
                    }}>
                      {staff.activeComplaintsCount || 0}
                    </span>
                    <span style={{ color: 'var(--color-muted)' }}>{isNe ? 'सक्रिय कार्यभार' : 'active tasks'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(staff)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      color: staff.isActive ? '#15803D' : '#DC2626',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {staff.isActive ? (
                      <>
                        <CheckCircle size={13} />
                        <span>{isNe ? 'सक्रिय' : 'Active'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} />
                        <span>{isNe ? 'निष्क्रिय' : 'Inactive'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Technician Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 29, 53, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '520px', width: '100%', padding: '28px', backgroundColor: 'var(--color-surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EEF3FB', color: '#5278C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: 'var(--color-heading)', margin: 0 }}>
                    {isNe ? 'नयाँ प्राविधिक दर्ता' : 'Onboard New Technician'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    Add credentials and assign IT support duties.
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '0.8125rem', marginBottom: '16px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Er. Sujan Shrestha"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sujan@sochcollege.edu.np"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="Technician">Technician</option>
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Wi-Fi & Switches, Linux OS"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Network Tech"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-md"
                >
                  {isSubmitting ? 'Onboarding...' : 'Onboard Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStaffPage;
