import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  classworkAssignments,
  trainerNoteData,
  generateClassworkDoc,
  generateClassworkText
} from '../../data/classworkData';
import styles from './AIClasswork.module.css';

export default function AIClasswork() {
  const [isSubpageOpen, setIsSubpageOpen] = useState(true);
  const subpageRef = useRef(null);
  const toast = useToast();

  const handleToggleSubpage = () => {
    const nextState = !isSubpageOpen;
    setIsSubpageOpen(nextState);
    if (nextState) {
      setTimeout(() => {
        if (subpageRef.current) {
          subpageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Download Word Document (.doc) containing all assignments
  const handleDownloadDoc = () => {
    try {
      const docContent = generateClassworkDoc();
      const blob = new Blob(['\ufeff', docContent], {
        type: 'application/msword;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AI_Practical_Classwork_Assignments.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (toast) {
        toast.success('Assignment document (.doc) downloaded successfully! 📄');
      }
    } catch (err) {
      if (toast) {
        toast.error('Download failed. Please try again.');
      }
    }
  };

  // Download Plain Text (.txt)
  const handleDownloadText = () => {
    try {
      const textContent = generateClassworkText();
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'AI_Practical_Classwork_Assignments.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (toast) {
        toast.success('Assignment text file (.txt) downloaded successfully! 📝');
      }
    } catch (err) {
      if (toast) {
        toast.error('Download failed. Please try again.');
      }
    }
  };

  // Print or Save as PDF
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      if (toast) {
        toast.warning('Please allow popup windows to print or save PDF.');
      }
      return;
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Practical Classwork - Bihar AI Mission</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #181512; line-height: 1.5; margin: 0; padding: 12px; }
          h1 { color: #C1552C; font-size: 20px; border-bottom: 2px solid #C1552C; padding-bottom: 6px; margin-bottom: 14px; }
          .item { border: 1px solid #E2D7C3; border-radius: 6px; padding: 10px 12px; margin-bottom: 12px; page-break-inside: avoid; background: #FAF8F5; }
          .item-title { font-size: 14px; font-weight: bold; color: #C1552C; margin-bottom: 4px; }
          .label { font-weight: bold; color: #181512; }
          ul { margin: 4px 0 6px 18px; padding: 0; font-size: 12px; }
          p { margin: 3px 0; font-size: 12px; }
          .note { background: #FFF8EE; border-left: 4px solid #C1552C; padding: 10px; margin-top: 18px; font-size: 11.5px; }
        </style>
      </head>
      <body>
        <h1>AI Practical Classwork</h1>
        ${classworkAssignments.map(item => `
          <div class="item">
            <div class="item-title">${item.num}. ${item.toolName} — ${item.title}</div>
            <p><span class="label">Classwork:</span> ${item.classwork}</p>
            <p><span class="label">Instructions:</span> ${item.instructions}</p>
            <p><span class="label">Final submission:</span></p>
            <ul>
              ${item.finalSubmission.map(sub => `<li>${sub}</li>`).join('')}
            </ul>
          </div>
        `).join('')}

        <div class="note">
          <p><strong>3. ${trainerNoteData.title}</strong></p>
          <p>${trainerNoteData.content}</p>
          <p><em>Source basis: ${trainerNoteData.source}</em></p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  return (
    <div className={styles.classworkContainer} id="ai-practical-classwork">
      {/* CARD SECTION */}
      <div className={styles.classworkCardBanner}>
        <div className={styles.cardBannerContent}>
          <div className={styles.cardLeft}>
            <div className={styles.cardBadge}>
              <span>⚡</span>
              <span>18 GOVERNANCE EXERCISES</span>
            </div>
            <h2 className={styles.cardTitle}>
              AI Practical <span className={styles.cardHighlight}>Classwork</span>
            </h2>
            <p className={styles.cardDesc}>
              18 hands-on officer practical classwork assignments covering ChatGPT, Copilot, Gemini, Perplexity, Canva, Zapier, ElevenLabs, and more with step-by-step instructions and submission guidelines.
            </p>
          </div>

          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleToggleSubpage}
              title="View all 18 Classwork Assignments"
            >
              <span>📖</span>
              <span>{isSubpageOpen ? 'Assignment Details ▲' : 'Assignment ▼'}</span>
            </button>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleDownloadDoc}
              title="Download full assignment document (.doc)"
            >
              <span>📥</span>
              <span>Download Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBPAGE VIEW */}
      {isSubpageOpen && (
        <div className={styles.subpageWrapper} ref={subpageRef}>
          {/* SUBPAGE TOP TOOLBAR */}
          <div className={styles.subpageHeader}>
            <h3 className={styles.subpageTitle}>
              AI Practical Classwork Assignments
            </h3>

            <div className={styles.subpageHeaderActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleDownloadDoc}
                title="Download Word Document"
              >
                <span>📄</span>
                <span>Download .doc</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handlePrintPDF}
                title="Print or Save PDF"
              >
                <span>🖨️</span>
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={handleDownloadText}
                title="Download Plain Text"
              >
                <span>📝</span>
                <span>Text (.txt)</span>
              </button>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsSubpageOpen(false)}
                title="Collapse classwork view"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* EXACT 18 ASSIGNMENTS LIST */}
          <div className={styles.assignmentsList}>
            {classworkAssignments.map((item) => (
              <div key={item.num} className={styles.assignmentCard}>
                <div className={styles.assignmentTitle}>
                  <span className={styles.assignmentNum}>{item.num}.</span>
                  <span className={styles.assignmentToolName}>{item.toolName}</span>
                  <span>—</span>
                  <span>{item.title}</span>
                </div>

                <div className={styles.assignmentRow}>
                  <strong>Classwork:</strong> {item.classwork}
                </div>

                <div className={styles.assignmentRow}>
                  <strong>Instructions:</strong> {item.instructions}
                </div>

                <div className={styles.submissionBox}>
                  <div className={styles.submissionTitle}>Final submission:</div>
                  <ul className={styles.submissionList}>
                    {item.finalSubmission.map((sub, idx) => (
                      <li key={idx} className={styles.submissionItem}>
                        <span className={styles.submissionDot}>•</span>
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* 3. TRAINER'S NOTE */}
          <div className={styles.trainerBox}>
            <div className={styles.trainerTitle}>
              3. {trainerNoteData.title}
            </div>
            <div className={styles.trainerContent}>
              {trainerNoteData.content}
            </div>
            <div className={styles.trainerSource}>
              <strong>Source basis:</strong> {trainerNoteData.source}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
