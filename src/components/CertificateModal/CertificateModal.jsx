import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { getCleanCandidateName, getCleanCourseTitle, markCertificateAsDownloaded } from '../../utils/examStorage';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

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

  return (
    <Modal
      isOpen={!!submission}
      onClose={onClose}
      size="xl"
      title={`${displayCandidateName}${displayDesignationText}`}
      subtitle={`ID: ${submission.credentialId} • Score: ${submission.percentage}% (${submission.score}/${submission.total || 30})`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Certificate Image Body */}
        <div style={{ background: 'var(--color-sand-100, var(--color-sand-100, #F3ECE0))', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--color-line, var(--color-line, #E2D7C3))', padding: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', overflow: 'hidden' }}>
          {loading || !certImageUrl ? (
            <div style={{ padding: '40px', color: 'var(--color-ink, var(--color-charcoal-900, #181512))', fontWeight: '700' }}>
              ⏳ Generating Official Verified High-DPI Certificate...
            </div>
          ) : (
            <img
              src={certImageUrl}
              alt="Official Bihar AI Mission Certificate"
              style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 200px)', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: '8px', boxShadow: 'var(--shadow-soft)' }}
            />
          )}
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            disabled={loading || !certImageUrl}
          >
            📥 Download Certificate PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
}
