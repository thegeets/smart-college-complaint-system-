import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { ComplaintTable } from '../components/ComplaintTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText
} from 'lucide-react';

export function StaffDashboard() {
  const { 
    currentUser, 
    complaints, 
    updateComplaintStatus, 
    resolveComplaintWithNote,
    t,
    getStatusLabel
  } = useApp();

  // Filter complaints assigned to this staff member or their department
  const assignedComplaints = complaints.filter(
    (c) => c.assignedStaff === currentUser.name || c.department === currentUser.department
  );

  const totalAssigned = assignedComplaints.length;
  const inProgress = assignedComplaints.filter((c) => c.status === 'In Progress').length;
  const pendingReview = assignedComplaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const resolved = assignedComplaints.filter((c) => c.status === 'Resolved').length;

  // Modals for staff resolution and status change
  const [selectedComp, setSelectedComp] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('In Progress');
  const [statusNote, setStatusNote] = useState('');

  const handleOpenResolve = (comp) => {
    setSelectedComp(comp);
    setResolutionNote(comp.resolutionNotes || '');
    setResolutionModalOpen(true);
  };

  const handleConfirmResolve = () => {
    if (selectedComp) {
      resolveComplaintWithNote(selectedComp.id, resolutionNote, true);
      setResolutionModalOpen(false);
      setSelectedComp(null);
    }
  };

  const handleOpenStatus = (comp, status) => {
    setSelectedComp(comp);
    setTargetStatus(status);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleConfirmStatus = () => {
    if (selectedComp) {
      updateComplaintStatus(selectedComp.id, targetStatus, statusNote, currentUser.name);
      setStatusModalOpen(false);
      setSelectedComp(null);
    }
  };

  return (
    <div>
      {/* Staff Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0a192f 0%, #0f766e 100%)',
        color: '#ffffff',
        padding: '1.5rem 1.75rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '1.75rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(20, 184, 166, 0.25)', color: 'var(--teal-100)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            <Briefcase size={14} />
            <span>{t('staffDashboard.deskTag', 'DEPARTMENT RESOLUTION DESK')}</span>
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: '800' }}>
            {currentUser.name}
          </h2>
          <p style={{ color: '#e0f2fe', fontSize: '0.85rem' }}>
            {currentUser.title} — <strong>{currentUser.department}</strong>
          </p>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.8rem' }}>
          <div>{t('staffDashboard.assignedToDesk', 'Assigned to Desk:')} <strong>{totalAssigned} complaints</strong></div>
          <div style={{ color: '#bae6fd' }}>{t('staffDashboard.activeInWork', 'Active In-Work:')} <strong>{inProgress} complaints</strong></div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          label={t('staffDashboard.statAssigned', 'Assigned to Unit')}
          value={totalAssigned}
          icon={FileText}
          color="blue"
          helper={`Under ${currentUser.department}`}
        />
        <StatCard
          label={t('staffDashboard.statAwaiting', 'Awaiting Action')}
          value={pendingReview}
          icon={Clock}
          color="amber"
          helper={t('staffDashboard.statAwaitingHelper', 'Need initial inspection')}
        />
        <StatCard
          label={t('staffDashboard.statProgress', 'Active In Progress')}
          value={inProgress}
          icon={Wrench}
          color="sky"
          helper={t('staffDashboard.statProgressHelper', 'Repair / inquiry underway')}
        />
        <StatCard
          label={t('staffDashboard.statResolved', 'Resolved by Desk')}
          value={resolved}
          icon={CheckCircle2}
          color="green"
          helper={t('staffDashboard.statResolvedHelper', 'Successfully remediated')}
        />
      </div>

      {/* Complaints Assigned Table */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="card-title">{t('staffDashboard.queueTitle', 'Assigned Grievance Queue')}</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {t('staffDashboard.queueSubtitle', 'Complaints routed directly to your department')}
            </p>
          </div>
        </div>

        <div className="card-body" style={{ padding: '1.25rem' }}>
          <ComplaintTable
            complaints={assignedComplaints}
            role="staff"
            showDepartment={false}
            showStudentInfo={true}
          />
        </div>
      </div>

      {/* Confirmation Modal: Staff Status Update */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleConfirmStatus}
        title={`${t('adminDashboard.statusChangeTitle', 'Set Status to')} "${getStatusLabel(targetStatus)}"`}
        message={`${t('adminDashboard.statusChangeMsg', 'Confirm updating complaint')} ${selectedComp?.id} ${t('adminDashboard.statusChangeTitle', 'to')} "${getStatusLabel(targetStatus)}".`}
        confirmText={t('adminDashboard.statusConfirmBtn', 'Update Status')}
        confirmVariant="primary"
        showNoteInput={true}
        noteValue={statusNote}
        onNoteChange={setStatusNote}
        noteLabel={t('adminDashboard.statusRemarkLabel', 'Operational Remark / Work Update:')}
        notePlaceholder="e.g. Technician on-site; equipment dismantled for testing."
      />

      {/* Confirmation Modal: Add Resolution Note & Close */}
      <ConfirmationModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        onConfirm={handleConfirmResolve}
        title={`${t('staffDashboard.resolveModalTitle', 'Complete & Resolve Complaint')} ${selectedComp?.id}`}
        message={t('staffDashboard.resolveModalMsg', 'Enter the formal resolution remarks for the student and central dean to confirm work completion.')}
        confirmText={t('staffDashboard.resolveConfirmBtn', 'Mark as Resolved')}
        confirmVariant="accent"
        showNoteInput={true}
        noteValue={resolutionNote}
        onNoteChange={setResolutionNote}
        noteLabel={t('staffDashboard.resolveNoteLabel', 'Detailed Resolution Statement (Required):')}
        notePlaceholder={t('staffDashboard.resolveNotePlaceholder', 'e.g. Replaced faulty workstation power supply unit and verified OS boot. All programming software tested working.')}
      />
    </div>
  );
}

export default StaffDashboard;
