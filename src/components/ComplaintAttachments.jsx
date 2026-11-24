import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';
import {
  Paperclip,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  ImageOff,
  ImageIcon
} from 'lucide-react';

/**
 * Format bytes to human readable string
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if an attachment is an image
 */
function isImageAttachment(att) {
  if (!att) return false;
  const mime = (att.mimetype || att.mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) return true;
  const name = (att.originalName || att.filename || '').toLowerCase();
  return /\.(jpe?g|png|webp|gif|svg)$/i.test(name);
}

/**
 * ComplaintAttachments Component
 * Displays attached images with thumbnails, lightbox zoom/navigation,
 * download buttons, and non-image document links.
 */
export function ComplaintAttachments({ complaint, isNe = false, title = null }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Collect and normalize all attachments
  const attachments = Array.isArray(complaint?.attachments) && complaint.attachments.length > 0
    ? complaint.attachments
    : complaint?.attachment
      ? [complaint.attachment]
      : [];

  const complaintId = complaint?.id || complaint?._id || complaint?.referenceId || complaint?.reference || '';

  // Filter image attachments for the lightbox
  const imageAttachments = attachments.filter(isImageAttachment);

  // Helper to generate file URLs
  const getFileUrl = (att, isDownload = false) => {
    const fn = att.filename || att.storageFilename || att.originalName;
    const downloadQuery = isDownload ? '?download=1' : '';
    return apiUrl(`/api/v1/complaints/${encodeURIComponent(complaintId)}/attachments/${encodeURIComponent(fn)}${downloadQuery}`);
  };

  const openLightbox = (imageAtt) => {
    const idx = imageAttachments.findIndex(
      (img) => (img.filename || img.storageFilename) === (imageAtt.filename || imageAtt.storageFilename)
    );
    if (idx !== -1) {
      setLightboxIndex(idx);
      setIsZoomed(false);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsZoomed(false);
  };

  const nextImage = () => {
    if (imageAttachments.length <= 1) return;
    setLightboxIndex((prev) => (prev + 1) % imageAttachments.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    if (imageAttachments.length <= 1) return;
    setLightboxIndex((prev) => (prev - 1 + imageAttachments.length) % imageAttachments.length);
    setIsZoomed(false);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll while lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, imageAttachments.length]);

  const currentLightboxImg = lightboxIndex !== null ? imageAttachments[lightboxIndex] : null;

  return (
    <div className="complaint-attachments-section">
      <div className="attachments-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Paperclip size={18} color="var(--color-royal-blue, #5278C8)" />
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-heading, #101D35)', margin: 0 }}>
            {title || (isNe ? 'संलग्न प्रमाण तथा तस्बिरहरू' : 'Attachments')}
          </h3>
          {attachments.length > 0 && (
            <span className="attachments-count-badge">
              {attachments.length}
            </span>
          )}
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="no-attachments-box">
          <ImageIcon size={22} color="#94A3B8" />
          <span>{isNe ? 'कुनै प्रमाण वा तस्बिर फाइल संलग्न छैन।' : 'No attachments'}</span>
        </div>
      ) : (
        <div className="complaint-attachments-grid">
          {attachments.map((att, idx) => {
            const isImg = isImageAttachment(att);
            const key = att.filename || att.storageFilename || `${idx}`;
            const fileStreamUrl = getFileUrl(att, false);
            const fileDownloadUrl = getFileUrl(att, true);
            const isFailed = failedImages[key];

            return (
              <div key={key} className={`attachment-card ${isImg ? 'image-card' : 'doc-card'}`}>
                {isImg ? (
                  <div className="attachment-thumb-wrapper">
                    {isFailed ? (
                      <div className="attachment-placeholder-error">
                        <ImageOff size={24} color="#94A3B8" />
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {isNe ? 'तस्बिर लोड हुन सकेन' : 'Preview unavailable'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={fileStreamUrl}
                          alt={att.originalName}
                          loading="lazy"
                          className="attachment-thumb-img"
                          onError={() => setFailedImages((prev) => ({ ...prev, [key]: true }))}
                          onClick={() => openLightbox(att)}
                        />
                        <button
                          type="button"
                          className="attachment-preview-overlay-btn"
                          onClick={() => openLightbox(att)}
                          title={isNe ? 'पूर्वावलोकन हेर्नुहोस्' : 'Click to preview'}
                          aria-label="Preview image"
                        >
                          <Eye size={18} />
                          <span>{isNe ? 'हेर्नुहोस्' : 'Preview'}</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="attachment-doc-wrapper">
                    <div className="doc-icon-pill">
                      <FileText size={28} color="#0284C7" />
                    </div>
                  </div>
                )}

                <div className="attachment-card-info">
                  <div className="attachment-meta">
                    <span className="attachment-filename" title={att.originalName}>
                      {att.originalName}
                    </span>
                    <span className="attachment-size">
                      {formatFileSize(att.size)}
                    </span>
                  </div>

                  <a
                    href={fileDownloadUrl}
                    download={att.originalName}
                    className="attachment-action-download"
                    title={isNe ? 'डाउनलोड गर्नुहोस्' : 'Download file'}
                    aria-label={`Download ${att.originalName}`}
                  >
                    <Download size={15} />
                    <span>{isNe ? 'डाउनलोड' : 'Download'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && currentLightboxImg && (
        <div
          className="attachment-lightbox-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Attachment Lightbox"
        >
          <div className="attachment-lightbox-container">
            {/* Top Toolbar */}
            <div className="lightbox-toolbar">
              <div className="lightbox-info">
                <span className="lightbox-filename" title={currentLightboxImg.originalName}>
                  {currentLightboxImg.originalName}
                </span>
                <span className="lightbox-subinfo">
                  {formatFileSize(currentLightboxImg.size)}
                  {imageAttachments.length > 1 && ` • ${lightboxIndex + 1} / ${imageAttachments.length}`}
                </span>
              </div>

              <div className="lightbox-actions">
                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={() => setIsZoomed((prev) => !prev)}
                  title={isZoomed ? (isNe ? 'जुम घटाउनुहोस्' : 'Zoom out') : (isNe ? 'जुम बढाउनुहोस्' : 'Zoom in')}
                  aria-label="Toggle zoom"
                >
                  {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                </button>

                <a
                  href={getFileUrl(currentLightboxImg, true)}
                  download={currentLightboxImg.originalName}
                  className="lightbox-btn"
                  title={isNe ? 'डाउनलोड गर्नुहोस्' : 'Download image'}
                  aria-label="Download image"
                >
                  <Download size={18} />
                </a>

                <button
                  type="button"
                  className="lightbox-btn lightbox-btn-close"
                  onClick={closeLightbox}
                  title={isNe ? 'बन्द गर्नुहोस् (Esc)' : 'Close (Esc)'}
                  aria-label="Close lightbox"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div className="lightbox-viewport" onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}>
              {imageAttachments.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  title={isNe ? 'अघिल्लो' : 'Previous (Left arrow)'}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <div className="lightbox-img-stage">
                <img
                  src={getFileUrl(currentLightboxImg, false)}
                  alt={currentLightboxImg.originalName}
                  className={`lightbox-active-img ${isZoomed ? 'zoomed' : ''}`}
                  onClick={() => setIsZoomed((prev) => !prev)}
                  title={isZoomed ? (isNe ? 'क्लिक गरेर जुम घटाउनुहोस्' : 'Click to zoom out') : (isNe ? 'क्लिक गरेर जुम गर्नुहोस्' : 'Click to zoom in')}
                />
              </div>

              {imageAttachments.length > 1 && (
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  title={isNe ? 'पछिल्लो' : 'Next (Right arrow)'}
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComplaintAttachments;
