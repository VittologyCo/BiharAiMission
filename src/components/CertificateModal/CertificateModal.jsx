import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode';
import { getCleanCandidateName, getCleanCourseTitle, markCertificateAsDownloaded } from '../../utils/examStorage';

export default function CertificateModal({ submission, onClose }) {
  const [certImageUrl, setCertImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayCandidateName = submission
    ? getCleanCandidateName(submission.candidateName, submission.candidateEmail)
    : 'Candidate Name';

  const credentialKey = submission?.credentialId || submission?.id || '';

  useEffect(() => {
    if (!submission || !credentialKey) return;
    let isCancelled = false;

    const certImg = new Image();
    certImg.crossOrigin = 'anonymous';
    certImg.src = '/certificate.png';

    const sigImg = new Image();
    sigImg.crossOrigin = 'anonymous';
    sigImg.src = '/certi_sign.png';

    let certLoaded = false;
    let sigLoaded = false;

    const renderCanvas = async () => {
      if (!certLoaded || isCancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = certImg.naturalWidth;
      canvas.height = certImg.naturalHeight;
      const ctx = canvas.getContext('2d');

      const W = canvas.width;
      const H = canvas.height;

      // 1. Draw certificate background template
      ctx.drawImage(certImg, 0, 0, W, H);

      // 2. Certificate No
      ctx.font = `bold ${Math.round(H * 0.018)}px Arial, sans-serif`;
      ctx.fillStyle = '#1a365d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(submission.credentialId || 'BAIM-CERT-641720', W * 0.860, H * 0.110);

      // 3. Candidate Name
      const nameFont = Math.round(H * 0.038);
      ctx.font = `bold ${nameFont}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = '#0a2540';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(displayCandidateName, W * 0.50, H * 0.478);

      // 4. Programme Title
      const rawTitle = submission?.courseName ||
                       submission?.course_name ||
                       submission?.programTitle ||
                       submission?.program_title ||
                       submission?.masterclassTitle ||
                       submission?.masterclass_title ||
                       submission?.examTitle ||
                       submission?.exam_title ||
                       submission?.title ||
                       '';
      const rawId = submission?.programId ||
                    submission?.program_id ||
                    submission?.masterclassId ||
                    submission?.masterclass_id ||
                    submission?.examId ||
                    submission?.exam_id ||
                    submission?.class_id ||
                    submission?.id ||
                    '';
      const displayCourseTitle = getCleanCourseTitle(rawTitle, rawId, rawId);
      const titleWithLevel = displayCourseTitle;
      const progFont = Math.round(H * 0.026);
      ctx.font = `bold italic ${progFont}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = '#0a2540';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleWithLevel, W * 0.50, H * 0.594);

      // 5. Signature Image
      if (sigLoaded) {
        const sigWidth = Math.round(W * 0.16);
        const sigHeight = Math.round(H * 0.065);
        const sigX = Math.round(W * 0.798 - sigWidth / 2);
        const sigY = Math.round(H * 0.916 - sigHeight);
        ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);
      }

      // 6. Issue Date
      const dateFont = Math.round(H * 0.016);
      ctx.font = `bold ${dateFont}px Arial, sans-serif`;
      ctx.fillStyle = '#1a365d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const issueDate = submission.issueDate || (submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }));
      ctx.fillText(issueDate, W * 0.170, H * 0.932);

      // 7. QR Code
      try {
        const certName = displayCandidateName;
        const certId = submission.credentialId || 'BAIM-CERT-641720';
        const courseTitle = displayCourseTitle;

        const qrText = [
          `BIHAR AI MISSION - VERIFIED CERTIFICATE`,
          `Candidate Name: ${certName}`,
          `Certificate No: ${certId}`,
          `Course Name: ${courseTitle}`,
          `Issue Date: ${issueDate}`,
          `Status: OFFICIAL & VERIFIED`
        ].join('\n');

        const qrSize = Math.round(W * 0.090);
        const qrDataUrl = await QRCode.toDataURL(qrText, {
          width: 400,
          margin: 2,
          color: { dark: '#0a2540', light: '#FFFFFF' },
          errorCorrectionLevel: 'M',
        });

        if (isCancelled) return;

        const qrImg = new Image();
        qrImg.onload = () => {
          if (isCancelled) return;
          const qrX = Math.round(W * 0.1675 - qrSize / 2);
          const qrY = Math.round(H * 0.785 - qrSize / 2);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          const dataUrl = canvas.toDataURL('image/png', 1.0);
          setCertImageUrl(dataUrl);
          setLoading(false);
        };
        qrImg.onerror = () => {
          if (isCancelled) return;
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          setCertImageUrl(dataUrl);
          setLoading(false);
        };
        qrImg.src = qrDataUrl;
      } catch (qrErr) {
        if (isCancelled) return;
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        setCertImageUrl(dataUrl);
        setLoading(false);
      }
    };

    certImg.onload = () => {
      certLoaded = true;
      renderCanvas();
    };
    sigImg.onload = () => {
      sigLoaded = true;
      renderCanvas();
    };

    return () => {
      isCancelled = true;
    };
  }, [credentialKey, displayCandidateName]);

  const handleDownload = () => {
    if (!certImageUrl) return;
    if (submission?.credentialId) {
      markCertificateAsDownloaded(submission.credentialId);
    }
    const link = document.createElement('a');
    link.download = `Bihar_AI_Mission_Certificate_${submission?.credentialId || 'Credential'}.png`;
    link.href = certImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!submission) return null;

  const rawDesignation = submission?.candidateDesignation || submission?.candidate_designation || '';
  const cleanDesignation = (rawDesignation && !['member', 'registered user', 'officer / citizen', 'learner', 'candidate', 'government officer'].includes(rawDesignation.toLowerCase().trim()))
    ? rawDesignation
    : '';

  const displayDesignationText = cleanDesignation ? ` (${cleanDesignation})` : '';

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(14, 12, 10, 0.84)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeInModal 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #1C1814 0%, #15120F 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(226, 139, 92, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#FFFFFF',
          padding: '24px 28px',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Amber Ambient Glow Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '2.5px',
          background: 'linear-gradient(90deg, transparent, #C1552C 30%, #D99B26 70%, transparent)',
          borderRadius: '2px'
        }} />

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(226, 139, 92, 0.2)', paddingBottom: '14px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34D399',
              fontSize: '10.5px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              <span>OFFICIAL VERIFIED CIVIC CREDENTIAL</span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-display, 'Fraunces', serif)",
              fontSize: '20px',
              fontWeight: '700',
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <span>{displayCandidateName}</span>
              {cleanDesignation && (
                <span style={{
                  fontSize: '12px',
                  fontFamily: "var(--font-body, sans-serif)",
                  fontWeight: '600',
                  color: 'var(--color-terracotta-400, #E28B5C)',
                  background: 'rgba(193, 85, 44, 0.15)',
                  border: '1px solid rgba(226, 139, 92, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  💼 {cleanDesignation}
                </span>
              )}
            </h2>

            <div style={{ fontSize: '12.5px', color: 'var(--color-sand-200, #C2B7A3)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#E8B23D' }}>ID: {submission.credentialId}</span>
              <span>•</span>
              <span>Score: {submission.percentage}% ({submission.score}/{submission.total || 30})</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Certificate Image Frame */}
        <div style={{
          background: 'radial-gradient(ellipse at center, #FAF7F2 0%, #EFE8DC 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(226, 215, 195, 0.8)',
          padding: '12px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px',
          maxHeight: 'calc(86vh - 190px)',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.35)'
        }}>
          {loading || !certImageUrl ? (
            <div style={{ padding: '40px', color: '#181512', fontWeight: '800', fontSize: '15px' }}>
              ⏳ Generating Official Verified High-DPI Certificate...
            </div>
          ) : (
            <img
              src={certImageUrl}
              alt="Official Bihar AI Mission Certificate"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(86vh - 215px)',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
              }}
            />
          )}
        </div>

        {/* Modal Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--color-sand-200, #C2B7A3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span>
            <span>Verifiable via QR Code & Credential ID</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#F3ECE0',
                padding: '9px 20px',
                borderRadius: '11px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              disabled={loading || !certImageUrl}
              style={{
                background: 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '9px 22px',
                borderRadius: '11px',
                fontWeight: '800',
                fontSize: '13px',
                cursor: loading || !certImageUrl ? 'not-allowed' : 'pointer',
                opacity: loading || !certImageUrl ? 0.6 : 1,
                boxShadow: '0 4px 16px rgba(193, 85, 44, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>📥</span>
              <span>Download Certificate PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
