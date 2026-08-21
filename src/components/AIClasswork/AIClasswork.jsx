import React, { useState, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  classworkAssignments,
  trainerNoteData,
  generateClassworkDoc
} from '../../data/classworkData';
import styles from './AIClasswork.module.css';

export default function AIClasswork() {
  // By default, the assignment subpage is hidden
  const [isSubpageOpen, setIsSubpageOpen] = useState(false);
  const subpageRef = useRef(null);
  const toast = useToast();

  const handleToggleSubpage = () => {
    const nextState = !isSubpageOpen;
    setIsSubpageOpen(nextState);
    
    // Ensure smooth scrolling library recalculates full document height
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      if (window.__lenis) {
        window.__lenis.resize();
      }
      if (nextState && subpageRef.current) {
        subpageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      if (window.__lenis) {
        window.__lenis.resize();
      }
    }, 350);
  };

  // Download Document (.doc format with all 18 assignments & Trainer's Note)
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

      {/* SUBPAGE VIEW (HIDDEN BY DEFAULT, TOGGLED BY ASSIGNMENT BUTTON) */}
      {isSubpageOpen && (
        <div className={styles.subpageWrapper} ref={subpageRef}>
          {/* SUBPAGE TOP TOOLBAR (ONLY DOWNLOAD DOCS AND CLOSE BUTTON) */}
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
                <span>Download Docs</span>
              </button>

              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsSubpageOpen(false)}
                title="Close classwork view"
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
