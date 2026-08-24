import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { getCoursesFromStorage, getLiveClassesFromStorage, fetchCoursesFromSupabase, fetchLiveClassesFromSupabase, calculateTimeLeft, getTagColorClass, saveMasterclassEnrollmentToSupabase, fetchUserMasterclassEnrollmentsFromSupabase, getSessionEndedStatus, calculate24hExpirationTimeLeft } from '../../utils/coursesStorage';
import { verifyCertificate, verifyCertificateFromSupabase, getCleanCandidateName, getCleanCourseTitle } from '../../utils/examStorage';
import { supabase } from '../../utils/supabase';
import PhonePePaymentModal from '../PhonePePaymentModal/PhonePePaymentModal';
import { savePaymentRecordToSupabase } from '../../utils/phonepePayment';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import styles from './LearningHub.module.css';
import './LearningHub.responsive.css';

/* -------------------------------------------------------------------------- */
/* LIVE CLASS HORIZONTAL CARD (RECTANGLE FORMAT WITH COUNTDOWN TIMER)          */
/* -------------------------------------------------------------------------- */
function LiveClassHorizontalCard({ item, isHi, onOpenAuth }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(item.scheduledDateTime));
  const [expiryTimeLeft, setExpiryTimeLeft] = useState(() =>
    calculate24hExpirationTimeLeft(item.sessionEndedAt, item.createdAt)
  );
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const userKey = user && user.email ? user.email.toLowerCase().trim() : null;

  useEffect(() => {
    if (!item.isSessionEnded) return;
    setExpiryTimeLeft(calculate24hExpirationTimeLeft(item.sessionEndedAt, item.createdAt));
    const interval = setInterval(() => {
      setExpiryTimeLeft(calculate24hExpirationTimeLeft(item.sessionEndedAt, item.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [item.isSessionEnded, item.sessionEndedAt, item.createdAt]);

  useEffect(() => {
    if (!user || !userKey) {
      setIsEnrolled(false);
      return;
    }
    let isMounted = true;
    async function checkEnrollment() {
      try {
        const remoteList = await fetchUserMasterclassEnrollmentsFromSupabase(user.email);
        if (Array.isArray(remoteList)) {
          const isRemoteEnrolled = remoteList.some(e => String(e.class_id) === String(item.id));
          if (!isRemoteEnrolled) {
            try { localStorage.removeItem(`bihar_ai_enrolled_${userKey}_${item.id}`); } catch (e) {}
          }
          if (isMounted) setIsEnrolled(isRemoteEnrolled);
          return;
        }
      } catch (e) {}

      try {
        const userEnrolled = localStorage.getItem(`bihar_ai_enrolled_${userKey}_${item.id}`) === 'true';
        if (isMounted) setIsEnrolled(userEnrolled);
      } catch {
        if (isMounted) setIsEnrolled(false);
      }
    }
    checkEnrollment();
    return () => { isMounted = false; };
  }, [userKey, user, item.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(item.scheduledDateTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [item.scheduledDateTime]);

  const isLive = timeLeft.isLive;

  const handleEnrollClick = async (e) => {
    e.preventDefault();
    if (!user || !userKey) {
      toast.warning(isHi ? 'कृपया इस मास्टरक्लास में एनरोल करने के लिए लॉगिन करें।' : 'Please log in to purchase or enroll in this masterclass.');
      if (typeof onOpenAuth === 'function') {
        onOpenAuth('login');
      }
      return;
    }

    const isPaid = item.certificateType === 'Paid certification' || (item.price && item.price !== 'Free');

    if (isPaid) {
      setShowPaymentModal(true);
      return;
    }

    setIsEnrolled(true);
    toast.success(isHi ? 'सफलतापूर्वक नामांकित! लाइव क्लास में आपका स्वागत है।' : 'Successfully Enrolled! Welcome to the Masterclass.');
    await saveMasterclassEnrollmentToSupabase(user, item);

    if (item.buyUrl) {
      window.open(item.buyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setIsEnrolled(true);
    setShowPaymentModal(false);
    toast.success(isHi ? '🎉 भुगतान सफल! मास्टरक्लास का एक्सेस मिल गया।' : '🎉 Payment Verified! Welcome to the Masterclass.');
    await saveMasterclassEnrollmentToSupabase(user, item);
    await savePaymentRecordToSupabase({
      user,
      item,
      txnId: paymentResult?.txnId,
      utrNumber: paymentResult?.utrNumber,
      amount: paymentResult?.amount
    });
  };

  const handleWatchRecordedClick = (e) => {
    e.preventDefault();
    if (!user || !userKey) {
      toast.warning(isHi ? '🔒 रिकॉर्डेड सत्र देखने के लिए कृपया लॉगिन या साइन अप करें।' : '🔒 Please log in or sign up to watch the recorded masterclass session!');
      if (typeof onOpenAuth === 'function') {
        onOpenAuth('login');
      }
      return;
    }
    const url = item.recordingUrl || item.recordedUrl || item.joinUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStartExamClick = (e) => {
    e.preventDefault();
    if (!user || !userKey) {
      toast.warning(isHi ? '🔒 प्रमाणपत्र परीक्षा देने के लिए कृपया लॉगिन या साइन अप करें।' : '🔒 Please log in or sign up to take the certification exam!');
      if (typeof onOpenAuth === 'function') {
        onOpenAuth('login');
      }
      return;
    }
    navigate(`/exam/live-masterclass-${item.id}`);
  };

  const formatSchedule = (dtStr, fallbackText) => {
    if (!dtStr) return fallbackText || 'Announced Soon';
    try {
      const dt = new Date(dtStr);
      if (isNaN(dt.getTime())) return fallbackText || dtStr;
      return dt.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fallbackText || dtStr;
    }
  };

  const instructorName = item.instructorName || item.courseInstructor || 'Dr. Amit Sharma';
  const instructorTitle = item.instructorTitle || 'Lead AI Researcher & Ex-IITian';
  const instructorImg = item.instructorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const priceDisplay = item.price || '₹499';

  return (
    <div className={`${styles.liveClassCard} ${isLive ? styles.isLiveActive : ''}`}>
      {/* Left Details Panel */}
      <div className={styles.detailsPanel}>
        <div>
          {/* Top Status & Certification Badges */}
          <div className={styles.statusBadgesRow}>
            <span
              className={`${styles.statusBadge} ${
                item.isSessionEnded
                  ? styles.badgeEnded
                  : isLive
                  ? styles.badgeLive
                  : styles.badgeUpcoming
              }`}
            >
              {item.isSessionEnded
                ? (isHi ? '⏹️ सत्र समाप्त' : '⏹️ SESSION CONCLUDED')
                : isLive
                ? (isHi ? '🔴 लाइव क्लास (LIVE NOW)' : '🔴 LIVE CLASS NOW')
                : (isHi ? '📅 आगामी लाइव क्लास' : '📅 UPCOMING CLASS')}
            </span>

            <span
              className={`${styles.statusBadge} ${
                isEnrolled
                  ? styles.badgeEnrolled
                  : item.certificateType === 'Paid certification'
                  ? styles.badgePaid
                  : styles.badgeFree
              }`}
            >
              {isEnrolled
                ? '✓ ENROLLED'
                : item.certificateType === 'Paid certification'
                ? `💰 ${priceDisplay}`
                : '🎓 FREE CERTIFICATION'}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className={styles.courseTitle}>{item.courseName}</h3>
          <p className={styles.courseDesc}>{item.courseDesc}</p>

          {/* Instructor Profile Card */}
          <div className={styles.instructorCard}>
            <img
              src={instructorImg}
              alt={instructorName}
              className={styles.instructorAvatar}
            />
            <div>
              <div className={styles.instructorName}>👨‍🏫 {instructorName}</div>
              <div className={styles.instructorTitle}>{instructorTitle}</div>
            </div>
          </div>
        </div>

        {/* Structured Metadata Grid */}
        <div className={styles.metaGrid}>
          {item.courseDuration && (
            <div className={styles.metaTile}>
              <span className={styles.metaIcon}>⏱️</span>
              <div>
                <div className={styles.metaLabel}>{isHi ? 'अवधि' : 'Duration'}</div>
                <div className={styles.metaValue}>{item.courseDuration}</div>
              </div>
            </div>
          )}
          <div className={styles.metaTile}>
            <span className={styles.metaIcon}>🌐</span>
            <div>
              <div className={styles.metaLabel}>{isHi ? 'भाषा' : 'Language'}</div>
              <div className={styles.metaValue}>
                {item.courseLanguage || (isHi ? 'हिंदी + अंग्रेजी' : 'Hindi + English')}
              </div>
            </div>
          </div>
          <div className={styles.metaTile}>
            <span className={styles.metaIcon}>📜</span>
            <div>
              <div className={styles.metaLabel}>{isHi ? 'प्रमाणपत्र' : 'Certification'}</div>
              <div className={styles.metaValue}>
                {item.certificateType || (isHi ? 'निःशुल्क प्रमाणपत्र' : 'Free Certification')}
              </div>
            </div>
          </div>
          <div className={styles.metaTile}>
            <span className={styles.metaIcon}>📅</span>
            <div>
              <div className={styles.metaLabel}>{isHi ? 'समय व तिथि' : 'Schedule'}</div>
              <div className={styles.metaValue}>
                {formatSchedule(item.scheduledDateTime, item.scheduledTimeText)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Action & Timer Panel */}
      <div className={styles.actionPanel}>
        <div>
          {/* Status Label */}
          {!(item.isSessionEnded && !expiryTimeLeft.isExpired) && (
            <div className={styles.panelHeader}>
              {item.isSessionEnded
                ? (isHi ? '⏹️ क्लास स्थिति' : '⏹️ SESSION STATUS')
                : isLive
                ? (isHi ? '🔴 क्लास स्थिति' : '🔴 SESSION STATUS')
                : (isHi ? '⏳ क्लास शुरू होने का समय' : '⏳ CLASS STARTS IN')}
            </div>
          )}

          {item.isSessionEnded ? (
            expiryTimeLeft.isExpired ? (
              <div className={styles.statusCardEnded}>
                🔒 {isHi ? 'सत्र व रिकॉर्डिंग समाप्त' : 'SESSION & RECORDING CONCLUDED'}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-ochre-400, #D99B26)', fontWeight: '800', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.06em' }}>
                  ⏳ {isHi ? 'रिकॉर्डिंग व परीक्षा समाप्ति समय:' : 'ACCESS EXPIRES IN:'}
                </div>
                <div className={styles.countdownRow}>
                  <div className={styles.timerTile}>
                    <span className={styles.timerNum}>{String(expiryTimeLeft.hours).padStart(2, '0')}</span>
                    <span className={styles.timerUnit}>Hrs</span>
                  </div>
                  <div className={styles.timerTile}>
                    <span className={styles.timerNum}>{String(expiryTimeLeft.minutes).padStart(2, '0')}</span>
                    <span className={styles.timerUnit}>Mins</span>
                  </div>
                  <div className={styles.timerTile}>
                    <span className={styles.timerNum}>{String(expiryTimeLeft.seconds).padStart(2, '0')}</span>
                    <span className={styles.timerUnit}>Secs</span>
                  </div>
                </div>
              </div>
            )
          ) : isLive ? (
            <div className={styles.statusBadge} style={{ width: '100%', justifyContent: 'center', background: 'rgba(193, 85, 44, 0.2)', border: '1px solid var(--color-terracotta-400, #E28B5C)', color: '#FFFFFF' }}>
              ● SESSION IS LIVE NOW
            </div>
          ) : (
            <div className={styles.countdownRow}>
              <div className={styles.timerTile}>
                <span className={styles.timerNum}>{String(timeLeft.days).padStart(2, '0')}</span>
                <span className={styles.timerUnit}>Days</span>
              </div>
              <div className={styles.timerTile}>
                <span className={styles.timerNum}>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className={styles.timerUnit}>Hrs</span>
              </div>
              <div className={styles.timerTile}>
                <span className={styles.timerNum}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className={styles.timerUnit}>Mins</span>
              </div>
              <div className={styles.timerTile}>
                <span className={styles.timerNum}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className={styles.timerUnit}>Secs</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Main Action Button */}
        {item.isSessionEnded ? (
          expiryTimeLeft.isExpired ? (
            <div className={styles.statusCardEnded}>
              🔒 {isHi ? 'रिकॉर्डेड सत्र समाप्त' : 'RECORDED SESSION EXPIRED'}
            </div>
          ) : (item.recordingUrl || item.recordedUrl || item.joinUrl) ? (
            <button
              onClick={handleWatchRecordedClick}
              className={styles.btnEnroll}
            >
              <span>▶ {isHi ? 'रिकॉर्डिंग देखें' : 'Watch Recording'}</span>
              <span>→</span>
            </button>
          ) : (
            <div className={styles.statusCardEnded}>
              ⏳ {isHi ? 'रिकॉर्डिंग प्रक्रियाधीन है' : 'Recording Processing'}
            </div>
          )
        ) : !isEnrolled ? (
          <button
            onClick={handleEnrollClick}
            className={styles.btnEnroll}
          >
            <span>{isHi ? 'एनरोल करें (Enroll Now)' : 'Enroll in Masterclass'}</span>
            <span>→</span>
          </button>
        ) : isLive && item.joinUrl ? (
          <a
            href={item.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnLiveJoin}
          >
            <span>{isHi ? '🔴 लाइव क्लास जॉइन करें' : '🔴 JOIN LIVE CLASS NOW'}</span>
            <span>↗</span>
          </a>
        ) : (
          <div className={styles.btnEnrolledDisabled}>
            ✓ {isHi ? 'एनरोल्ड (Enrolled)' : 'Enrolled ✓'}
          </div>
        )}

        {/* Secondary Section: Certification Exam */}
        <div className={styles.examSubSection}>
          <div className={styles.examLabel}>
            📜 {isHi ? 'प्रमाणपत्र परीक्षा' : 'CERTIFICATION EXAM'}
          </div>

          {item.isSessionEnded && expiryTimeLeft.isExpired ? (
            <div className={styles.examLockedPill}>
              🔒 {isHi ? 'परीक्षा बंद (24h समाप्त)' : 'Exam Closed (24h Expired)'}
            </div>
          ) : item.isExamUnlocked ? (
            <button
              onClick={handleStartExamClick}
              className={styles.btnStartExam}
            >
              📜 {isHi ? 'परीक्षा शुरू करें →' : 'Start Exam →'}
            </button>
          ) : (
            <div
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                color: '#9CA3AF',
                padding: '8px 12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '11.5px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center'
              }}
            >
              🔒 {isHi ? 'परीक्षा सत्र के बाद खुलेगी' : 'Exam Unlocks Post-Session'}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PhonePePaymentModal
          item={item}
          user={user}
          isHi={isHi}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FALLBACK LIVE CLASS CARD (SHOWN IF ADMIN HAS NO LIVE CLASS CARDS CREATED)   */
/* -------------------------------------------------------------------------- */
function FallbackLiveClassCard({ isHi }) {
  return (
    <div className={styles.liveClassCard}>
      <div className={styles.detailsPanel}>
        <div>
          <div className={styles.statusBadgesRow}>
            <span className={`${styles.statusBadge} ${styles.badgeUpcoming}`}>
              🔴 {isHi ? 'लाइव कक्षाएं एवं मास्टरक्लास' : 'LIVE CLASSES & MASTERCLASSES'}
            </span>
            <span className={`${styles.statusBadge} ${styles.badgeFree}`}>
              📢 Official Live Platform
            </span>
          </div>

          <h3 className={styles.courseTitle}>
            {isHi ? 'आगामी जल्द: बिहार शिक्षार्थियों के लिए लाइव मास्टरक्लास' : 'Upcoming Soon: Live Masterclass on AI for Bihar Learners'}
          </h3>

          <p className={styles.courseDesc}>
            {isHi
              ? 'बिहार AI मिशन के विशेषज्ञों द्वारा आयोजित लाइव मास्टरक्लास जल्द ही यहां शुरू होगी। लाइव सत्र के लिंक (Zoom, Teams, YouTube) वास्तविक समय काउंटडाउन टाइमर के साथ प्रकाशित किए जाएंगे।'
              : 'Interactive live masterclasses hosted by Bihar AI Mission experts will be broadcast here soon. Video conferencing links (YouTube, Teams, Zoom) with live countdown timers will be updated directly by the administrator.'}
          </p>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaTile}>
            <span className={styles.metaIcon}>📅</span>
            <div>
              <div className={styles.metaLabel}>{isHi ? 'समय:' : 'Schedule:'}</div>
              <div className={styles.metaValue}>{isHi ? 'तिथि व समय घोषणा जल्द' : 'Date & Time Announced Soon'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionPanel}>
        <div>
          <div className={styles.panelHeader}>
            ⏳ NEXT MASTERCLASS STATUS
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-sand-50, #FBF8F3)', textAlign: 'center', margin: '8px 0' }}>
            {isHi ? 'शेड्यूल जल्द जारी होगा' : 'Schedule Opening Soon'}
          </div>
        </div>
        <div className={styles.statusCardEnded}>
          📢 {isHi ? 'लाइव लिंक जल्द उपलब्ध होगा' : 'Live Links Available Soon'}
        </div>
      </div>
    </div>
  );
}

export default function LearningHub({ onOpenAuth }) {
  const { lang, t } = useLanguage();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  const isHi = lang === 'hi';

  const loadData = async () => {
    const cachedC = getCoursesFromStorage();
    const cachedLC = getLiveClassesFromStorage();
    if (cachedC) setCourses(cachedC);
    if (cachedLC) setLiveClasses(cachedLC);

    try {
      const liveC = await fetchCoursesFromSupabase();
      if (liveC) setCourses(liveC);
      const liveLC = await fetchLiveClassesFromSupabase();
      if (liveLC) setLiveClasses(liveLC);
    } catch (err) {}
  };

  useEffect(() => {
    loadData();

    // Listen for live updates from admin dashboard edits
    const handleCourseUpdate = () => loadData();
    const handleLiveClassUpdate = () => loadData();
    window.addEventListener('bihar_ai_courses_updated', handleCourseUpdate);
    window.addEventListener('bihar_ai_live_classes_updated', handleLiveClassUpdate);

    return () => {
      window.removeEventListener('bihar_ai_courses_updated', handleCourseUpdate);
      window.removeEventListener('bihar_ai_live_classes_updated', handleLiveClassUpdate);
    };
  }, []);

  const handleVerifyCertificate = async (sampleId) => {
    const targetId = typeof sampleId === 'string' ? sampleId : searchId;
    if (!targetId || !targetId.trim()) {
      toast.warning(isHi ? 'कृपया जांचने के लिए Credential ID दर्ज करें।' : 'Please enter a Credential ID to verify.');
      return;
    }
    const cleanId = targetId.trim().toUpperCase();
    setSearchId(cleanId);
    setIsScanning(true);
    setVerificationResult(null);

    // Use centralized Supabase-first verification (falls back to localStorage)
    const result = await verifyCertificateFromSupabase(cleanId);
    setIsScanning(false);
    if (result && (result.isValid || result.status === 'REAL')) {
      toast.success(isHi ? 'प्रमाणपत्र सफलतापूर्वक सत्यापित हुआ! ✓' : 'Certificate Verified Successfully! ✓');
    } else if (result && result.status === 'PENDING') {
      toast.warning(isHi ? 'प्रमाणपत्र व्यवस्थापक समीक्षा के अधीन है।' : 'Certificate is pending Admin approval.');
    } else {
      toast.error(isHi ? 'अमान्य Credential ID। कृपया पुनः प्रयास करें।' : 'Invalid Credential ID. Please check and try again.');
    }
    setVerificationResult(result);
  };

  const renderCard = (item, index) => {
    const title = isHi ? (item.titleHi || item.title) : item.title;
    const desc = isHi ? (item.descHi || item.desc) : item.desc;
    const bullets = isHi && item.bulletsHi && item.bulletsHi.length > 0 ? item.bulletsHi : item.bullets || [];
    const footer = item.footer || [];

    const curtainBadge = isHi ? (item.curtainBadgeHi || item.curtainBadge || 'जल्द आ रहा है') : (item.curtainBadge || 'COMING SOON');
    const curtainSub = isHi ? (item.curtainSubHi || item.curtainSub || 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।') : (item.curtainSub || 'Course under development for Bihar learners.');
    const curtainTag = isHi ? (item.curtainTagHi || item.curtainTag || 'प्रारंभ तिथि: जल्द घोषित') : (item.curtainTag || 'Launch Date: Announced Soon');

    const tagsList = item.tags && item.tags.length > 0
      ? item.tags
      : [{ cls: item.tagClass || getTagColorClass(item.tagLabel), label: item.tagLabel || 'Foundational' }];

    const cardId = item.id || `course-${index + 1}`;

    return (
      <div
        className="card"
        key={cardId}
        onClick={() => {
          if (!item.isComingSoon) {
            navigate(`/course/${cardId}`);
          }
        }}
        style={{ cursor: item.isComingSoon ? 'default' : 'pointer' }}
      >
        {/* Animated Coming Soon Curtain (Only shown if isComingSoon is true) */}
        {item.isComingSoon && (
          <div className="course-curtain">
            <div className="curtain-shimmer"></div>
            <div className="curtain-content">
              <div className="curtain-badge">
                <span className="curtain-pulse-dot"></span>
                {curtainBadge}
              </div>
              <div className="curtain-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h4 className="curtain-title">{title}</h4>
              <p className="curtain-sub">{curtainSub}</p>
              <div className="curtain-tag">{curtainTag}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {tagsList.map((tag, j) => {
            const tagText = isHi ? (tag.labelHi || tag.label) : tag.label;
            const cls = tag.cls || getTagColorClass(tag.label);
            return (
              <span key={j} className={`ctag ${cls}`}>
                {tagText}
              </span>
            );
          })}
        </div>

        <h3>{title}</h3>
        <p>{desc}</p>

        {bullets.length > 0 && (
          <ul className="m-list">
            {bullets.map((b, j) => <li key={j}>{b}</li>)}
          </ul>
        )}

        <div className="c-foot" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {footer.map((f, k) => {
            const parts = f.split(':');
            if (parts.length >= 2) {
              return (
                <span key={k}>
                  <strong>{parts[0].trim()}:</strong> {parts.slice(1).join(':').trim()}
                </span>
              );
            }
            return (
              <span key={k}>
                <strong>{f.split(' · ')[0]}</strong>
                {f.includes(' · ') ? ' · ' + f.split(' · ').slice(1).join(' · ') : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.section} id="learning">
      {/* SECTION HEADER */}
      <div className={styles.header}>
        <div className={styles.sectionBadge}>
          <span className={styles.badgeLine} />
          {t.learnEye || (isHi ? 'नागरिक AI प्रशिक्षण' : 'CIVIC AI LEARNING & CERTIFICATIONS')}
        </div>
        <h1 className={styles.title}>
          {t.learnTitle || (isHi ? 'बिहार के शिक्षार्थियों के लिए AI मास्टरक्लास' : "Online Masterclasses & AI Courses")}
        </h1>
        <p className={styles.subtitle}>
          {t.learnSub || (isHi
            ? 'सरकारी अधिकारियों, छात्रों और नागरिकों के लिए द्विभाषी (हिंदी + अंग्रेजी) मॉड्यूल। सभी निःशुल्क एवं प्रमाणित।'
            : 'Bilingual (Hindi + English) modules for government officers, students, and citizens. All free and verified.')}
        </p>
      </div>

      {/* LIVE CLASSES SECTION (HORIZONTAL RECTANGLE CARDS WITH COUNTDOWN TIMER) */}
      <div style={{ marginBottom: '36px' }}>
        {liveClasses && liveClasses.length > 0 ? (
          liveClasses.map((item) => (
            <LiveClassHorizontalCard key={item.id} item={item} isHi={isHi} onOpenAuth={onOpenAuth} />
          ))
        ) : (
          <FallbackLiveClassCard isHi={isHi} />
        )}
      </div>

      {/* MAIN FOUNDATIONAL COURSES GRID */}
      <div className="grid">
        {courses.map((item, index) => renderCard(item, index))}
      </div>

      {/* OFFICIAL CERTIFICATE VERIFICATION DESK WIDGET (#F3EADA Sand Box) */}
      <div className={styles.verificationBox}>
        {/* Top Header Badge */}
        <div className={styles.verifyHeaderRow}>
          <div className={styles.verifyBrandLeft}>
            <div className={styles.verifyIconBox}>
              🔍
            </div>
            <div>
              <div className={styles.verifyEye}>
                {isHi ? 'बिहार AI मिशन सत्यापन केंद्र' : 'OFFICIAL CERTIFICATE VERIFICATION DESK'}
              </div>
              <h3 className={styles.verifyTitle}>
                {isHi ? 'प्रमाणपत्र प्रामाणिकता जांच' : 'Verify Credential Authenticity'}
              </h3>
            </div>
          </div>

          <div className={styles.liveEngineBadge}>
            <span className={styles.liveEngineDot} />
            LIVE VERIFICATION ENGINE ONLINE
          </div>
        </div>

        <p className={styles.verifyDesc}>
          {isHi
            ? 'किसी भी परीक्षार्थी के बिहार AI मिशन डिजिटल प्रमाण पत्र की वैधता जांचने के लिए 12-अंकों का Credential ID दर्ज करें।'
            : 'Enter any candidate Credential ID below to query the Bihar AI Mission Database in real-time. Instantly verify authentic credentials vs unverified certificates.'}
        </p>

        {/* Input Bar & Controls Container */}
        <div className={styles.verifyInputRow}>
          <div className={styles.verifyInputWrap}>
            <span className={styles.inputIcon}>🆔</span>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyCertificate()}
              placeholder="e.g. BAIM-CERT-839201"
              className={styles.verifyInput}
            />
            {searchId && (
              <button
                onClick={() => { setSearchId(''); setVerificationResult(null); }}
                className={styles.clearInputBtn}
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => handleVerifyCertificate()}
            disabled={isScanning}
            className={styles.btnVerifySubmit}
          >
            {isScanning ? '⏳ Scanning Database...' : (isHi ? 'जांचें (Verify) →' : 'Verify Certificate →')}
          </button>
        </div>

        {/* Quick Sample Clickable Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)', marginTop: '16px' }}>
          <span style={{ fontWeight: '600' }}>💡 {isHi ? 'नमूना ID आजमाएं (Click Sample ID):' : 'Try Sample Credential ID:'}</span>
          <button
            onClick={() => handleVerifyCertificate('BAIM-CERT-839201')}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--color-terracotta-500, #C1552C)',
              color: 'var(--color-charcoal-900, #181512)',
              padding: '5px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '800',
              fontFamily: 'monospace',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}
          >
            BAIM-CERT-839201
          </button>
        </div>

        {/* SCANNING LOADER EFFECT */}
        {isScanning && (
          <div style={{ marginTop: '24px', padding: '24px', background: '#FFFFFF', border: '1.5px dashed var(--color-terracotta-500, #C1552C)', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-charcoal-900, #181512)' }}>
              ⏳ Connecting to Bihar AI Mission Security Database...
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted, #5E554D)', marginTop: '4px' }}>
              Verifying cryptographic hash signature & issuing authority seal.
            </div>
          </div>
        )}

        {/* VERIFICATION RESULT DISPLAY */}
        {verificationResult && !isScanning && (
          <div style={{ marginTop: '24px' }}>
            {verificationResult.status === 'REAL' && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '2px solid #10B981',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#FFFFFF', fontWeight: '900', fontSize: '12px', padding: '5px 16px', borderRadius: '32px', marginBottom: '16px', letterSpacing: '0.05em' }}>
                  ✓ OFFICIAL & AUTHENTIC VERIFIED CERTIFICATE
                </div>
                <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#064E3B', margin: '0 0 4px 0', fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                  {getCleanCandidateName(verificationResult.data.candidateName, verificationResult.data.candidateEmail)}
                </h4>
                <div style={{ fontSize: '14.5px', color: '#047857', marginBottom: '20px', fontWeight: '700' }}>
                  {verificationResult.data.candidateDesignation || 'Government Officer / Civil Learner'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', borderTop: '1px dashed #A7F3D0', paddingTop: '20px', fontSize: '13.5px', color: '#065F46' }}>
                  <div><span style={{ color: '#047857' }}>Exam Title:</span> <strong style={{ color: '#064E3B', display: 'block', marginTop: '2px' }}>{getCleanCourseTitle(verificationResult.data.examTitle || verificationResult.data.masterclassTitle, verificationResult.data.examId, verificationResult.data.masterclassId)}</strong></div>
                  <div><span style={{ color: '#047857' }}>Credential ID:</span> <strong style={{ fontFamily: 'monospace', color: '#064E3B', display: 'block', marginTop: '2px', fontSize: '14px' }}>{verificationResult.data.credentialId}</strong></div>
                  <div><span style={{ color: '#047857' }}>Score Marks:</span> <strong style={{ color: '#047857', display: 'block', marginTop: '2px' }}>{verificationResult.data.percentage}% ({verificationResult.data.score}/{verificationResult.data.total})</strong></div>
                  <div><span style={{ color: '#047857' }}>Date of Issuance:</span> <strong style={{ color: '#064E3B', display: 'block', marginTop: '2px' }}>{verificationResult.data.issueDate || (verificationResult.data.submittedAt ? new Date(verificationResult.data.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }))}</strong></div>
                  <div><span style={{ color: '#047857' }}>Official Seal:</span> <strong style={{ color: '#047857', display: 'block', marginTop: '2px' }}>Verified & Published by Admin ✓</strong></div>
                </div>
              </div>
            )}

            {verificationResult.status === 'PENDING' && (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '2px solid #F59E0B',
                  borderRadius: '20px',
                  padding: '28px',
                  color: '#78350F'
                }}
              >
                <div style={{ display: 'inline-block', background: '#F59E0B', color: '#FFFFFF', fontWeight: '900', fontSize: '12px', padding: '5px 16px', borderRadius: '32px', marginBottom: '14px', letterSpacing: '0.05em' }}>
                  ⏳ PENDING ADMIN APPROVAL
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: '#92400E' }}>
                  Record Found: {verificationResult.data.candidateName}
                </h4>
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.55', color: '#B45309' }}>
                  This exam result ({verificationResult.data.percentage}%) is currently under verification in the Admin Dashboard and has not yet been published by the Administrator.
                </p>
              </div>
            )}

            {verificationResult.status === 'FAKE' && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '2px solid #EF4444',
                  borderRadius: '20px',
                  padding: '24px',
                  color: '#991B1B',
                }}
              >
                <div style={{ display: 'inline-block', background: '#EF4444', color: '#FFFFFF', fontWeight: '900', fontSize: '12.5px', padding: '4px 14px', borderRadius: '32px', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  ❌ FAKE / UNVERIFIED CERTIFICATE
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px', color: '#991B1B' }}>
                  Invalid Credential ID
                </h4>
                <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.55' }}>
                  No official record found for Credential ID <strong>"{searchId}"</strong> in the Bihar AI Mission Database. This certificate ID is unverified or fake.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

