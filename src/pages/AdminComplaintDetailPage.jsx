import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';
import { ComplaintTimeline } from '../components/ComplaintTimeline';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Download,
  MessageSquare,
  Lock,
  Clock,
  Send,
  User,
  Mail,
  Hash,
  Paperclip
} from 'lucide-react';

export function AdminComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchAdminComplaintById,
    updateComplaintStatus,
    addAdminResponse,
    addInternalNote,
    statusList,
    language,
    getCategoryLabel,
    showToast
  } = useApp();

  const isNe = language === 'ne';

  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change State
  const [newStatus, setNewStatus] = useState('');
  const [statusAuditNote, setStatusAuditNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Official Response State
  const [publicResponseMsg, setPublicResponseMsg] = useState('');
  const [isPostingResponse, setIsPostingResponse] = useState(false);

  // Internal Note State
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);

  const loadComplaint = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminComplaintById(id);
      setComplaint(data);
      setNewStatus(data.status);
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

  // Handle Status Transition
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!complaint || !newStatus) return;

    if (newStatus === complaint.status) {
      showToast(isNe ? 'स्थिति उस्तै छ।' : 'Selected status is identical to current status.', 'info');
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(complaint._id || complaint.id, newStatus, statusAuditNote);
      setComplaint(updated);
      setStatusAuditNote('');
    } catch (err) {
      alert(err.message || 'Status transition failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Public Response
  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!publicResponseMsg.trim()) return;

    setIsPostingResponse(true);
    try {
      const updated = await addAdminResponse(complaint._id || complaint.id, publicResponseMsg.trim());
      setComplaint(updated);
      setPublicResponseMsg('');
    } catch (err) {
      alert(err.message || 'Failed to post official response.');
    } finally {
      setIsPostingResponse(false);
    }
  };

  // Handle Private Internal Note
  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNoteText.trim()) return;

    setIsPostingNote(true);
    try {
      const updated = await addInternalNote(complaint._id || complaint.id, internalNoteText.trim());
      setComplaint(updated);
      setInternalNoteText('');
    } catch (err) {
      alert(err.message || 'Failed to save internal note.');
    } finally {
      setIsPostingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-muted)' }}>
        {isNe ? 'डाटाबेसबाट उजुरी विवरण लोड गरिँदैछ...' : 'Loading complaint record from MongoDB...'}
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
        <AlertCircle size={40} color="var(--color-warning)" style={{ margin: '0 auto var(--space-3)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
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

  const docId = complaint._id || complaint.id;
  const refCode = complaint.reference || complaint.id;
  const lodgedDateStr = new Date(complaint.createdAt || complaint.submittedAt).toLocaleString(isNe ? 'ne-NP' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div>
      {/* Top Back Link */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link 
          to="/admin/complaints" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--color-muted)', fontWeight: '600', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          <span>{isNe ? 'उजुरी सूचीमा फर्कनुहोस्' : 'Back to Complaints Queue'}</span>
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                {refCode}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-2)' }}>
              {complaint.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--color-muted)', flexWrap: 'wrap' }}>
              <CategoryBadge category={complaint.category} />
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                <span>{isNe ? 'दर्ता मिति:' : 'Filed:'} {lodgedDateStr}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Student Complainant Profile Strip */}
        <div style={{
          marginTop: 'var(--space-4)',
          padding: '12px 16px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          fontSize: '0.8125rem'
        }}>
          <div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
              {isNe ? 'विद्यार्थीको नाम' : 'Student Name'}
            </div>
            <strong style={{ color: '#0F172A' }}>{complaint.student?.name || 'N/A'}</strong>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
              {isNe ? 'विद्यार्थी परिचयपत्र / रोल नं' : 'Student ID / Roll'}
            </div>
            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#15365D' }}>
              {complaint.student?.studentId || 'N/A'}
            </span>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
              {isNe ? 'इमेल' : 'Email Address'}
            </div>
            <a href={`mailto:${complaint.student?.email}`} style={{ color: '#0F766E', textDecoration: 'none' }}>
              {complaint.student?.email || 'N/A'}
            </a>
          </div>

          <div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>
              {isNe ? 'शैक्षिक कार्यक्रम' : 'Academic Program'}
            </div>
            <strong style={{ color: '#0F172A' }}>{complaint.program || complaint.student?.program || COLLEGE_CONFIG.program}</strong>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
            {isNe ? 'समस्याको विवरण:' : 'Reported Grievance Description:'}
          </h3>
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#334155',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {complaint.description}
          </div>
        </div>

        {/* File Attachment Strip */}
        {complaint.attachment && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: '12px 16px',
            backgroundColor: '#F0FDFA',
            border: '1px solid #CCFBF1',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Paperclip size={16} color="#0F766E" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F766E' }}>
                {complaint.attachment.originalName}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                ({(complaint.attachment.size / 1024).toFixed(0)} KB)
              </span>
            </div>

            <a
              href={`/api/v1/admin/complaints/${docId}/attachment`}
              className="btn btn-secondary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Download size={13} />
              <span>{isNe ? 'प्रमाण फाइल डाउनलोड गर्नुहोस्' : 'Download Attachment'}</span>
            </a>
          </div>
        )}
      </div>

      {/* Two Column Administrative Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        
        {/* Card A: Update Status */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#15365D" />
            <span>{isNe ? 'स्थिति अद्यावधिक (Status Transition)' : 'Transition Complaint Status'}</span>
          </h2>

          <form onSubmit={handleStatusUpdate}>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="selectStatus" className="form-label">
                {isNe ? 'नयाँ स्थिति चयन गर्नुहोस्' : 'Target Status'}
              </label>
              <select
                id="selectStatus"
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={isUpdatingStatus}
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>
                    {st} {st === complaint.status ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="statusAuditNote" className="form-label">
                {isNe ? 'अडिट टिप्पणी (Audit Note)' : 'Audit Trail Note'}
              </label>
              <input
                id="statusAuditNote"
                type="text"
                className="form-input"
                placeholder={isNe ? 'जस्तै: ल्याब सहायकलाई निरीक्षणका लागि खटाइयो' : 'e.g. Technician dispatched to replace network cable'}
                value={statusAuditNote}
                onChange={(e) => setStatusAuditNote(e.target.value)}
                disabled={isUpdatingStatus}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isUpdatingStatus || newStatus === complaint.status}
              style={{ width: '100%' }}
            >
              {isUpdatingStatus ? (
                <span>{isNe ? 'अद्यावधिक हुँदैछ...' : 'Updating status in MongoDB...'}</span>
              ) : (
                <span>{isNe ? 'स्थिति परिवर्तन गर्नुहोस्' : 'Apply Status Transition'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Card B: Post Official Student-Visible Response */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} color="#0F766E" />
            <span>{isNe ? 'विद्यार्थीका लागि आधिकारिक जवाफ' : 'Official Student-Visible Response'}</span>
          </h2>

          <form onSubmit={handleAddResponse}>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="publicResponseMsg" className="form-label">
                {isNe ? 'जवाफको व्यहोरा (ट्र्याकिङमा विद्यार्थीले देख्नेछन्)' : 'Response Message (Visible to student upon tracking)'}
              </label>
              <textarea
                id="publicResponseMsg"
                rows={3}
                className="form-textarea"
                placeholder={isNe ? 'विद्यार्थीलाई दिइने आधिकारिक प्राविधिक जानकारी यहाँ लेख्नुहोस्...' : 'Explain the resolution or progress updates clearly for the student...'}
                value={publicResponseMsg}
                onChange={(e) => setPublicResponseMsg(e.target.value)}
                disabled={isPostingResponse}
              />
            </div>

            <button
              type="submit"
              className="btn btn-teal btn-sm"
              disabled={isPostingResponse || !publicResponseMsg.trim()}
              style={{ width: '100%' }}
            >
              {isPostingResponse ? (
                <span>{isNe ? 'रेकर्ड हुँदैछ...' : 'Saving to database...'}</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={13} />
                  <span>{isNe ? 'आधिकारिक जवाफ पठाउनुहोस्' : 'Post Official Response'}</span>
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Card C: Add Private Internal Note (Admin Only) */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="#B45309" />
            <span>{isNe ? 'आन्तरिक टिप्पणी (प्रशासक मात्र)' : 'Private Internal Note (Admins Only)'}</span>
          </h2>

          <form onSubmit={handleAddInternalNote}>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="internalNoteText" className="form-label">
                {isNe ? 'गोप्य प्रशासनिक टिपोट (विद्यार्थीले देख्न पाउँदैनन्)' : 'Internal Staff Note (Never visible to students)'}
              </label>
              <textarea
                id="internalNoteText"
                rows={3}
                className="form-textarea"
                placeholder={isNe ? 'आन्तरिक निरीक्षण वा सामान माग सम्बन्धी टिपोट...' : 'Add private staff audit notes or inventory requests...'}
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                disabled={isPostingNote}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              disabled={isPostingNote || !internalNoteText.trim()}
              style={{ width: '100%' }}
            >
              {isPostingNote ? (
                <span>{isNe ? 'सुरक्षित हुँदैछ...' : 'Saving internal note...'}</span>
              ) : (
                <span>{isNe ? 'आन्तरिक टिपोट सुरक्षित गर्नुहोस्' : 'Save Private Note'}</span>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Internal Notes Display (Admin Only) */}
      {complaint.internalNotes && complaint.internalNotes.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', borderLeft: '4px solid #B45309' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0F172A', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={15} color="#B45309" />
            <span>{isNe ? 'सुरक्षित आन्तरिक टिपोटहरू:' : 'Recorded Internal Staff Notes:'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complaint.internalNotes.map((note, idx) => (
              <div key={note._id || idx} style={{ padding: '10px 14px', backgroundColor: '#FEF3C7', borderRadius: '6px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#92400E', fontWeight: '600' }}>
                  <span>{note.createdBy?.name || 'Administrator'}</span>
                  <span>{new Date(note.createdAt).toLocaleString(isNe ? 'ne-NP' : 'en-US')}</span>
                </div>
                <div style={{ color: '#78350F' }}>{note.note}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Responses Display */}
      {complaint.responses && complaint.responses.length > 0 && (
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0F172A', margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={15} color="#0F766E" />
            <span>{isNe ? 'दर्ता भएका आधिकारिक जवाफहरू:' : 'Documented Official Responses:'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complaint.responses.map((resp, idx) => (
              <div key={resp._id || idx} style={{ padding: '10px 14px', backgroundColor: '#F0FDFA', borderRadius: '6px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#0F766E', fontWeight: '600' }}>
                  <span>{resp.createdBy?.name || 'College IT Desk'}</span>
                  <span>{new Date(resp.createdAt).toLocaleString(isNe ? 'ne-NP' : 'en-US')}</span>
                </div>
                <div style={{ color: '#0F172A' }}>{resp.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit History Timeline */}
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-heading)', margin: '0 0 var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#15365D" />
          <span>{isNe ? 'सम्पूर्ण कार्यप्रगति अडिट इतिहास' : 'Complete Audit Timeline'}</span>
        </h3>
        <ComplaintTimeline timeline={complaint.timeline || []} />
      </div>
    </div>
  );
}

export default AdminComplaintDetailPage;
