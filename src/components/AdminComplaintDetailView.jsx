import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { ComplaintTimeline } from './ComplaintTimeline';
import { ComplaintAttachments } from './ComplaintAttachments';
import { ConfirmationModal } from './ConfirmationModal';
import {
  X,
  Copy,
  Check,
  Clock,
  User,
  Mail,
  GraduationCap,
  MapPin,
  Monitor,
  Calendar,
  Wrench,
  MessageSquare,
  Lock,
  Send,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function AdminComplaintDetailView({
  complaint,
  onComplaintUpdated,
  onClose,
  isDrawer = false,
}) {
  const {
    updateComplaintStatus,
    assignComplaintTechnician,
    updateComplaintPriority,
    addAdminResponse,
    addInternalNote,
    deleteComplaint,
    fetchStaffMembers,
    language,
    showToast,
    statusList
  } = useApp();

  const isNe = language === 'ne';
  const [copied, setCopied] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Action states
  const [targetStatus, setTargetStatus] = useState(complaint?.status || 'In Progress');
  const [statusAuditNote, setStatusAuditNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);

  const [selectedTechId, setSelectedTechId] = useState(complaint?.assignedTo || '');
  const [isAssigning, setIsAssigning] = useState(false);

  const [currentPriority, setCurrentPriority] = useState(complaint?.priority || 'Medium');
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const [officialReply, setOfficialReply] = useState('');
  const [isPostingReply, setIsPostingReply] = useState(false);

  const [internalNote, setInternalNote] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (complaint) {
      setTargetStatus(complaint.status);
      setSelectedTechId(complaint.assignedTo || '');
      setCurrentPriority(complaint.priority);
    }
  }, [complaint]);

  useEffect(() => {
    fetchStaffMembers()
      .then((data) => setStaffList(data || []))
      .catch(() => {});
  }, [fetchStaffMembers]);

  if (!complaint) return null;

  const docId = complaint._id || complaint.id;
  const refCode = complaint.reference || complaint.referenceId || complaint.id;

  // Copy Reference
  const handleCopyRef = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refCode);
      setCopied(true);
      showToast('Reference code copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Live SLA Countdown
  const calculateSlaRemaining = () => {
    if (!complaint.slaDueAt) return null;
    const diff = new Date(complaint.slaDueAt).getTime() - now;
    const isOverdue = diff <= 0;
    const absDiff = Math.abs(diff);

    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((absDiff % (1000 * 60)) / 1000);

    return {
      text: isOverdue ? `${hours}h ${mins}m ${secs}s overdue` : `${hours}h ${mins}m ${secs}s left`,
      isOverdue,
      isNearBreach: !isOverdue && hours < 6,
    };
  };

  const slaRemaining = calculateSlaRemaining();

  // Status Change
  const executeStatusChange = async (statusToSet, noteText) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(docId, statusToSet, noteText);
      setStatusAuditNote('');
      if (onComplaintUpdated) onComplaintUpdated(updated);
    } catch (err) {
      alert(err.message || 'Status transition failed.');
    } finally {
      setIsUpdatingStatus(false);
      setResolveConfirmOpen(false);
    }
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (targetStatus === 'Resolved' && !statusAuditNote.trim()) {
      alert('A resolution note detailing the fix is required when marking a complaint as Resolved.');
      return;
    }
    if (targetStatus === 'Resolved') {
      setResolveConfirmOpen(true);
      return;
    }
    executeStatusChange(targetStatus, statusAuditNote);
  };

  // Technician Assignment
  const handleAssignTechnician = async (techId) => {
    setIsAssigning(true);
    try {
      const updated = await assignComplaintTechnician(docId, techId || null);
      setSelectedTechId(techId);
      if (onComplaintUpdated) onComplaintUpdated(updated);
    } catch (err) {
      alert(err.message || 'Technician assignment failed.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Priority Update
  const handlePriorityChange = async (newPri) => {
    setIsUpdatingPriority(true);
    try {
      const updated = await updateComplaintPriority(docId, newPri);
      setCurrentPriority(newPri);
      if (onComplaintUpdated) onComplaintUpdated(updated);
    } catch (err) {
      alert(err.message || 'Failed to update priority.');
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  // Official Student-Visible Reply
  const handleAddOfficialReply = async (e) => {
    e.preventDefault();
    if (!officialReply.trim()) return;
    setIsPostingReply(true);
    try {
      await addAdminResponse(docId, officialReply.trim());
      setOfficialReply('');
      if (onComplaintUpdated) {
        onComplaintUpdated({
          ...complaint,
          responses: [
            ...(complaint.responses || []),
            {
              message: officialReply.trim(),
              createdAt: new Date(),
              createdBy: { name: 'IT Desk Coordinator' },
            },
          ],
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to post official reply.');
    } finally {
      setIsPostingReply(false);
    }
  };

  // Internal Private Staff Note
  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setIsPostingNote(true);
    try {
      await addInternalNote(docId, internalNote.trim());
      setInternalNote('');
      if (onComplaintUpdated) {
        onComplaintUpdated({
          ...complaint,
          internalNotes: [
            ...(complaint.internalNotes || []),
            {
              note: internalNote.trim(),
              createdAt: new Date(),
              createdBy: { name: 'Staff Member' },
            },
          ],
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to add internal note.');
    } finally {
      setIsPostingNote(false);
    }
  };

  // Delete Complaint
  const handleDeleteComplaint = async () => {
    setIsDeleting(true);
    try {
      await deleteComplaint(docId);
      setDeleteConfirmOpen(false);
      if (onClose) onClose(true);
    } catch (err) {
      alert(err.message || 'Failed to delete complaint.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-heading)' }}>
      {/* Header Banner */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.125rem', color: 'var(--color-royal-blue)' }}>
              {refCode}
            </span>
            <button
              type="button"
              onClick={handleCopyRef}
              title="Copy Reference ID"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 4px',
                color: 'var(--color-muted)',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            </button>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: '800', margin: 0, color: 'var(--color-heading)', lineHeight: '1.3' }}>
            {complaint.title}
          </h2>

          {slaRemaining && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: slaRemaining.isOverdue ? '#FEE2E2' : slaRemaining.isNearBreach ? '#FEF3C7' : '#F0FDF4',
              color: slaRemaining.isOverdue ? '#DC2626' : slaRemaining.isNearBreach ? '#B45309' : '#15803D',
            }}>
              <Clock size={12} />
              <span>{slaRemaining.text}</span>
            </div>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={() => onClose()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Scrollable Body Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Student Information */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', margin: '0 0 12px' }}>
            {isNe ? 'उजुरीकर्ता विद्यार्थी विवरण' : 'Student Information'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} color="#5278C8" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Name</div>
                <div style={{ fontWeight: '700' }}>{complaint.student?.name || 'Guest / Not Specified'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={15} color="#5278C8" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Roll / Student ID</div>
                <div style={{ fontWeight: '700', fontFamily: 'monospace' }}>{complaint.student?.studentId || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="#5278C8" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Email</div>
                <div style={{ fontWeight: '600', color: 'var(--color-royal-blue)' }}>{complaint.student?.email || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={15} color="#5278C8" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Program & Semester</div>
                <div style={{ fontWeight: '600' }}>{complaint.program || 'BSc CSIT'} • {complaint.student?.semester || '1st Semester'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Complaint Details & Description */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', margin: '0 0 12px' }}>
            {isNe ? 'समस्या तथा स्थान विवरण' : 'Issue Details & Location'}
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '14px', fontSize: '0.8125rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#64748B" />
              <span style={{ color: 'var(--color-muted)' }}>Location:</span>
              <strong style={{ color: 'var(--color-heading)' }}>{complaint.location || 'General Campus'}</strong>
            </div>

            {complaint.pcNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Monitor size={14} color="#64748B" />
                <span style={{ color: 'var(--color-muted)' }}>Workstation / PC:</span>
                <strong>{complaint.pcNumber}</strong>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#64748B" />
              <span style={{ color: 'var(--color-muted)' }}>Lodged:</span>
              <span>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: 'var(--color-body)',
            whiteSpace: 'pre-wrap',
          }}>
            {complaint.description}
          </div>
        </div>

        {/* Section 3: Attachments Viewer (GridFS with Lightbox & Download) */}
        <div className="card" style={{ padding: '16px' }}>
          <ComplaintAttachments
            complaint={complaint}
            isNe={isNe}
            title={isNe ? 'संलग्न फोटो तथा कागजात (GridFS)' : 'Attached Media & Documents (GridFS)'}
          />
        </div>

        {/* Section 4: Operational Actions (Assign, Priority, Transition) */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', margin: '0 0 14px' }}>
            {isNe ? 'प्रशासनिक कारबाही तथा जिम्मेवारी' : 'Workflow & Technician Assignment'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            {/* Technician Assignment */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                Assigned Technician
              </label>
              <select
                value={selectedTechId}
                disabled={isAssigning}
                onChange={(e) => handleAssignTechnician(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.8125rem' }}
              >
                <option value="">-- Unassigned --</option>
                {staffList.map((st) => (
                  <option key={st._id || st.id} value={st._id || st.id}>
                    {st.name} ({st.role} • {st.activeComplaintsCount || 0} active)
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Change */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                Ticket Priority
              </label>
              <select
                value={currentPriority}
                disabled={isUpdatingPriority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.8125rem' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status Change Form */}
          <form onSubmit={handleStatusSubmit} style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'flex-start' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                  Transition Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                >
                  {statusList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-heading)' }}>
                  Audit Note {targetStatus === 'Resolved' && <span style={{ color: '#DC2626' }}>* (Required on Resolve)</span>}
                </label>
                <input
                  type="text"
                  value={statusAuditNote}
                  onChange={(e) => setStatusAuditNote(e.target.value)}
                  placeholder={targetStatus === 'Resolved' ? 'Detail how the issue was fixed...' : 'Optional audit note...'}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isUpdatingStatus || targetStatus === complaint.status}
                className="btn btn-primary btn-sm"
              >
                {isUpdatingStatus ? 'Updating...' : `Update Status to "${targetStatus}"`}
              </button>
            </div>
          </form>
        </div>

        {/* Section 5: Staff Discussion & Internal Notes */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Lock size={15} color="#D97706" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'कर्मचारी आन्तरिक टिपोट (निजी)' : 'Internal Staff Discussion (Private)'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {(!complaint.internalNotes || complaint.internalNotes.length === 0) ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', padding: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '6px' }}>
                No internal notes posted yet. Notes here are strictly hidden from students.
              </div>
            ) : (
              complaint.internalNotes.map((note, idx) => (
                <div key={note._id || idx} style={{ padding: '10px 12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.6875rem', color: '#92400E', fontWeight: '700' }}>
                    <span>{note.createdBy?.name || 'Staff Member'}</span>
                    <span>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <div style={{ color: '#78350F', whiteSpace: 'pre-wrap' }}>{note.note}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddInternalNote} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add private technician note or diagnostic findings..."
              className="input-field"
              style={{ flex: 1, fontSize: '0.8125rem' }}
            />
            <button
              type="submit"
              disabled={isPostingNote || !internalNote.trim()}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={13} />
              <span>Post Note</span>
            </button>
          </form>
        </div>

        {/* Section 6: Official Student-Visible Reply */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare size={15} color="#2563EB" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-heading)', margin: 0 }}>
              {isNe ? 'कलेजको आधिकारिक जवाफ (विद्यार्थीलाई देखिने)' : 'Official College Reply (Student-Visible)'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {(!complaint.responses || complaint.responses.length === 0) ? (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', padding: '10px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '6px' }}>
                No official responses sent yet. Messages posted here will be displayed on the student portal.
              </div>
            ) : (
              complaint.responses.map((resp, idx) => (
                <div key={resp._id || idx} style={{ padding: '10px 12px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '6px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.6875rem', color: '#0369A1', fontWeight: '700' }}>
                    <span>{resp.responderName || resp.createdBy?.name || 'College IT Desk'}</span>
                    <span>{resp.createdAt ? new Date(resp.createdAt).toLocaleString() : ''}</span>
                  </div>
                  <div style={{ color: '#0C4A6E', whiteSpace: 'pre-wrap' }}>{resp.message}</div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddOfficialReply} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={officialReply}
              onChange={(e) => setOfficialReply(e.target.value)}
              placeholder="Send official status message or instructions to student..."
              className="input-field"
              style={{ flex: 1, fontSize: '0.8125rem' }}
            />
            <button
              type="submit"
              disabled={isPostingReply || !officialReply.trim()}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={13} />
              <span>Send Reply</span>
            </button>
          </form>
        </div>

        {/* Section 7: Audit Timeline */}
        <div className="card" style={{ padding: '16px' }}>
          <ComplaintTimeline timeline={complaint.timeline || []} isNe={isNe} />
        </div>

        {/* Destructive Zone: Delete Record */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
          <button
            type="button"
            onClick={() => setDeleteConfirmOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#DC2626',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            <Trash2 size={14} />
            <span>Delete Complaint Record</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Resolve */}
      <ConfirmationModal
        isOpen={resolveConfirmOpen}
        onClose={() => setResolveConfirmOpen(false)}
        onConfirm={() => executeStatusChange('Resolved', statusAuditNote)}
        title={isNe ? 'उजुरी समाधान पुष्टि' : 'Confirm Complaint Resolution'}
        message={isNe ? 'के यो उजुरी समाधान भइसकेको हो? विद्यार्थीलाई समाधान भएको सूचना जानेछ।' : `Are you sure you want to mark ${refCode} as Resolved? This will finalize the ticket and record SLA achievement.`}
        confirmText="Confirm Resolved"
        type="primary"
      />

      {/* Confirmation Dialog for Delete */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteComplaint}
        title="Delete Complaint Record"
        message={`Are you sure you want to permanently delete complaint ${refCode}? This will remove the record and any GridFS attachments. This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Permanently'}
        type="danger"
      />
    </div>
  );
}

export default AdminComplaintDetailView;
