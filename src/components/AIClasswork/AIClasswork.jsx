import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import {
  classworkAssignments as defaultClassworkAssignments,
  trainerNoteData,
  generateClassworkDoc
} from '../../data/classworkData';
import { getUserTaskSubmissions, submitTaskWork, getDailyTasks } from '../../services/taskService';
import styles from './AIClasswork.module.css';

export default function AIClasswork({ user: propUser, onSubmissionUpdated }) {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser || {
    email: 'candidate@biharaimission.org',
    fullName: 'Praveer Kishore'
  };

  const [isSubpageOpen, setIsSubpageOpen] = useState(true);
  const [tasksList, setTasksList] = useState(defaultClassworkAssignments);
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [activeModalTask, setActiveModalTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [submissionNotes, setSubmissionNotes] = useState('');

  const subpageRef = useRef(null);
  const toast = useToast();

  const loadData = async () => {
    try {
      const fetchedTasks = await getDailyTasks();
      if (fetchedTasks && fetchedTasks.length > 0) {
        setTasksList(fetchedTasks);
      }
    } catch (e) {}

    if (currentUser?.email) {
      const subs = await getUserTaskSubmissions(currentUser.email);
      setTaskSubmissions(subs || []);
      if (onSubmissionUpdated) onSubmissionUpdated(subs);
    }
  };

  useEffect(() => {
    loadData();
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bihar_ai_tasks_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bihar_ai_tasks_updated', handleStorageChange);
    };
  }, [currentUser?.email]);

  const handleToggleSubpage = () => {
    const nextState = !isSubpageOpen;
    setIsSubpageOpen(nextState);
    
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      if (window.__lenis) {
        window.__lenis.resize();
      }
      if (nextState && subpageRef.current) {
        subpageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

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

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;
    const MAX_SIZE = 50 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      if (toast) toast.error(`File exceeds 50MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB). Please choose a smaller file.`);
      return;
    }
    setUploadFile(selectedFile);
    if (toast) toast.success(`Attached: ${selectedFile.name}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const openSubmitModal = (task) => {
    const existing = taskSubmissions.find((s) => s.task_id === task.num);
    setActiveModalTask(task);
    setUploadFile(null);
    setIsDragging(false);
    setSubmissionNotes(existing?.notes || '');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile && !submissionNotes.trim()) {
      if (toast) toast.error('Please attach a file or write notes before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitTaskWork({
        user: currentUser,
        taskId: activeModalTask.num,
        taskTitle: `${activeModalTask.toolName} — ${activeModalTask.title}`,
        category: 'AI Practical Classwork',
        file: uploadFile,
        notes: submissionNotes.trim(),
      });

      if (toast) {
        toast.success(`🎉 Task #${activeModalTask.num} submitted for Admin review!`);
      }
      await loadData();
      setActiveModalTask(null);
    } catch (err) {
      if (toast) toast.error(err.message || 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
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
              18 hands-on officer practical classwork assignments covering ChatGPT, Copilot, Gemini, Perplexity, Canva, Zapier, ElevenLabs, and more. Complete your tasks, upload files or links, and receive digital certification.
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
              <span>{isSubpageOpen ? 'Assignments List ▲' : 'Open Assignments ▼'}</span>
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
            <div>
              <h3 className={styles.subpageTitle}>
                AI Practical Classwork Assignments
              </h3>
              <p style={{ color: 'var(--color-sand-200, #C2B7A3)', fontSize: '13px', margin: '4px 0 0 0' }}>
                Complete each task, click <strong>"Submit Work"</strong> to upload evidence, and monitor your verification status.
              </p>
            </div>

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

          {/* DYNAMIC ASSIGNMENTS LIST */}
          <div className={styles.assignmentsList}>
            {tasksList.map((item) => {
              const sub = taskSubmissions.find((s) => s.task_id === item.num);
              const status = sub?.status || 'NOT_SUBMITTED';

              return (
                <div key={item.num} className={styles.assignmentCard}>
                  <div className={styles.taskHeaderRow}>
                    <div className={styles.assignmentTitle} style={{ margin: 0 }}>
                      <span className={styles.assignmentNum}>{item.num}.</span>
                      <span className={styles.assignmentToolName}>{item.toolName}</span>
                      <span>—</span>
                      <span>{item.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {status === 'APPROVED' && (
                        <span className={`${styles.statusPill} ${styles.statusApproved}`}>
                          ✅ Approved
                        </span>
                      )}
                      {status === 'PENDING' && (
                        <span className={`${styles.statusPill} ${styles.statusPending}`}>
                          ⏳ Under Review
                        </span>
                      )}
                      {status === 'REJECTED' && (
                        <span className={`${styles.statusPill} ${styles.statusRejected}`}>
                          ❌ Revision Needed
                        </span>
                      )}
                      {status === 'NOT_SUBMITTED' && (
                        <span className={`${styles.statusPill} ${styles.statusNone}`}>
                          ⭕ Not Submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ADMIN REJECTION FEEDBACK ALERT */}
                  {status === 'REJECTED' && (
                    <div className={styles.rejectionFeedbackBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', marginBottom: '4px', color: '#FDA4AF' }}>
                        <span>⚠️</span>
                        <span>Admin Revision Request:</span>
                      </div>
                      <div style={{ lineHeight: '1.5' }}>
                        {sub.admin_feedback || 'The task submission did not meet the criteria. Please review the instructions and re-upload your work.'}
                      </div>
                    </div>
                  )}

                  <div className={styles.assignmentRow}>
                    <strong>Classwork:</strong> {item.classwork}
                  </div>

                  <div className={styles.assignmentRow}>
                    <strong>Instructions:</strong> {item.instructions}
                  </div>

                  <div className={styles.submissionBox}>
                    <div className={styles.submissionTitle}>Final submission guidelines:</div>
                    <ul className={styles.submissionList}>
                      {item.finalSubmission.map((req, idx) => (
                        <li key={idx} className={styles.submissionItem}>
                          <span className={styles.submissionDot}>•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* USER SUBMISSION SUMMARY (IF SUBMITTED) */}
                  {sub && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '12.5px',
                      color: 'var(--color-sand-100, #F3ECE0)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          {sub.file_name && <span>📎 <strong>File:</strong> {sub.file_name} ({sub.file_size || 'Attached'})</span>}
                          {sub.file_url && !sub.file_url.startsWith('blob:') && <span style={{ marginLeft: sub.file_name ? '14px' : 0 }}>📁 <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#E28B5C', textDecoration: 'underline' }}>View / Download Document ↗</a></span>}
                        </div>
                        <div style={{ opacity: 0.7 }}>
                          Submitted on {new Date(sub.updated_at || sub.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTON */}
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {status === 'REJECTED' ? (
                      <button
                        type="button"
                        className={styles.reSubmitBtn}
                        onClick={() => openSubmitModal(item)}
                      >
                        <span>🔄</span>
                        <span>Re-upload & Fix Task #{item.num}</span>
                      </button>
                    ) : status === 'APPROVED' ? (
                      <button
                        type="button"
                        className={styles.submitBtn}
                        style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6EE7B7' }}
                        onClick={() => openSubmitModal(item)}
                      >
                        <span>✓</span>
                        <span>View / Update Submission</span>
                      </button>
                    ) : status === 'PENDING' ? (
                      <button
                        type="button"
                        className={styles.submitBtn}
                        style={{ background: 'rgba(232, 178, 61, 0.2)', border: '1px solid rgba(232, 178, 61, 0.4)', color: '#FDE68A' }}
                        onClick={() => openSubmitModal(item)}
                      >
                        <span>🔄</span>
                        <span>Resubmit Work (Replace File)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.submitBtn}
                        onClick={() => openSubmitModal(item)}
                      >
                        <span>📤</span>
                        <span>Submit Task #{item.num} Work →</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* TASK SUBMISSION / RE-UPLOAD MODAL */}
      {activeModalTask && (() => {
        const existingSub = taskSubmissions.find((s) => Number(s.task_id) === Number(activeModalTask.num));
        const isResubmission = Boolean(existingSub);

        return (
          <div className={styles.modalBackdrop} onClick={() => !submitting && setActiveModalTask(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-400, #E28B5C)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {isResubmission ? `TASK #${activeModalTask.num} RESUBMISSION` : `TASK #${activeModalTask.num} SUBMISSION`}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0 0 0', color: '#FFFFFF' }}>
                    {activeModalTask.toolName} — {activeModalTask.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !submitting && setActiveModalTask(null)}
                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '22px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Previous Admin Feedback (if rejected) */}
              {existingSub?.admin_feedback && existingSub.status === 'REJECTED' && (
                <div style={{
                  marginBottom: '16px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: '#FCA5A5',
                  lineHeight: '1.4'
                }}>
                  ⚠️ <strong>Admin Revision Feedback:</strong> {existingSub.admin_feedback}
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                {/* File Attachment Dropzone */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase' }}>
                    Upload File / Evidence (max 50MB — PDF, Image, Doc, Zip)
                  </label>
                  <div
                    className={`${styles.fileDropzone} ${isDragging ? styles.fileDropzoneActive : ''}`}
                    onClick={() => document.getElementById('taskFileInput')?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      id="taskFileInput"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelection(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                    {isDragging ? (
                      <div style={{ padding: '6px 0' }}>
                        <div style={{ fontSize: '36px', marginBottom: '6px', transform: 'scale(1.15)', transition: 'transform 0.2s' }}>
                          📥
                        </div>
                        <strong style={{ color: '#E8B23D', fontSize: '15px' }}>
                          Drop your file here to attach
                        </strong>
                        <div style={{ fontSize: '12px', color: '#F3ECE0', marginTop: '4px' }}>
                          Release mouse to attach directly
                        </div>
                      </div>
                    ) : uploadFile ? (
                      <div>
                        <div style={{ fontSize: '30px', marginBottom: '6px' }}>📄</div>
                        <strong style={{ color: '#E28B5C', fontSize: '14px' }}>{uploadFile.name}</strong>
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '3px' }}>
                          {uploadFile.size > 1024 * 1024 ? `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB` : `${(uploadFile.size / 1024).toFixed(1)} KB`} · (Click or drag new file to replace)
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '30px', marginBottom: '6px' }}>📁</div>
                        <strong style={{ color: '#FFFFFF', fontSize: '14px' }}>
                          {isResubmission
                            ? 'Drag & drop replacement file or click to browse'
                            : 'Drag & drop your file here or click to browse'}
                        </strong>
                        <div style={{ fontSize: '12px', color: 'var(--color-sand-200, #C2B7A3)', marginTop: '4px' }}>
                          Supports PDF, PNG, JPG, DOCX, ZIP (Up to 50MB on Dedicated Storage)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes / Explanation */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase' }}>
                    Submission Notes & Execution Prompt:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how you completed the task, prompts used, or any notes for the admin reviewer..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    className={styles.inputField}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Modal Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveModalTask(null)}
                    disabled={submitting}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#FFFFFF',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={styles.submitBtn}
                    style={{ padding: '10px 24px' }}
                  >
                    {submitting ? 'Submitting...' : isResubmission ? '🔄 Replace & Resubmit Work' : '🚀 Submit for Verification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

