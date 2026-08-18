import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import {
  getCoursesFromStorage,
  getProgramsFromStorage,
  fetchCoursesFromSupabase,
  fetchProgramsFromSupabase,
  getTagColorClass,
  getUserCourseProgress,
  setUserModuleComplete,
  getUserExamAttemptsCount,
  resetUserCourseProgressAndAttempts
} from '../../utils/coursesStorage';
import { useAuth } from '../../hooks/useAuth';
import { hasUserPassedExamLevel } from '../../utils/examStorage';
import SEO from '../../components/SEO/SEO';
const DEFAULT_FAQS_EN = [
  {
    q: 'Is this certification course free of cost?',
    a: 'Yes, this course and digital certificate evaluation are 100% free forever for all learners and Bihar officers.'
  },
  {
    q: 'What is the passing cutoff score for certification?',
    a: 'Candidates must achieve a minimum score of 75% (23 correct out of 30 questions) to qualify and earn their verified digital certificate.'
  },
  {
    q: 'How many exam attempts are allowed?',
    a: 'Candidates are allowed up to 3 attempts. If 3 attempts are failed, you can re-complete/review the course modules to reset your attempts and try again.'
  },
  {
    q: 'How and when do I receive the verified certificate?',
    a: 'Upon scoring 75%+ in the evaluation exam, your verified certificate is generated instantly for viewing, printing, and downloading under My Profile.'
  }
];

const DEFAULT_FAQS_HI = [
  {
    q: 'क्या यह पाठ्यक्रम निःशुल्क है?',
    a: 'हाँ, यह डिजिटल प्रमाणन पाठ्यक्रम पूरी तरह से निःशुल्क है।'
  },
  {
    q: 'प्रमाणपत्र परीक्षा पास करने का कटऑफ क्या है?',
    a: 'परीक्षा पास करने के लिए न्यूनतम 75% अंक (30 में से 23 प्रश्न सही) आवश्यक हैं।'
  },
  {
    q: 'परीक्षा कितनी बार दे सकते हैं?',
    a: 'आपको अधिकतम 3 प्रयास मिलते हैं। यदि 3 प्रयास विफल हो जाते हैं, तो आपको पाठ्यक्रम पुनः पूरा करके नए 3 प्रयास अनलॉक करने होंगे।'
  },
  {
    q: 'प्रमाणपत्र कैसे और कब मिलेगा?',
    a: '75% अंक प्राप्त करने के तुरंत बाद प्रमाणपत्र डिजिटल रूप से डाउनलोड के लिए उपलब्ध हो जाता है।'
  }
];

export default function CourseDetailPage({ onGetInvolved }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const isHi = lang === 'hi';
  const faqs = isHi ? DEFAULT_FAQS_HI : DEFAULT_FAQS_EN;

  const [item, setItem] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const userKey = user ? (user.email || user.id) : 'guest';
  const [courseProgress, setCourseProgress] = useState({ completedModules: [], progressPercent: 0, isCompleted: false });
  const [attemptsCount, setAttemptsCount] = useState(0);

  const refreshProgressAndAttempts = () => {
    if (userKey && id) {
      setCourseProgress(getUserCourseProgress(userKey, id));
      setAttemptsCount(getUserExamAttemptsCount(userKey, id));
    }
  };

  useEffect(() => {
    refreshProgressAndAttempts();
    window.addEventListener('bihar_ai_progress_updated', refreshProgressAndAttempts);
    window.addEventListener('bihar_ai_attempts_updated', refreshProgressAndAttempts);
    return () => {
      window.removeEventListener('bihar_ai_progress_updated', refreshProgressAndAttempts);
      window.removeEventListener('bihar_ai_attempts_updated', refreshProgressAndAttempts);
    };
  }, [userKey, id]);

  const handleToggleModuleComplete = (moduleIdx, totalMods) => {
    if (!user) {
      if (typeof onGetInvolved === 'function') onGetInvolved('login');
      return;
    }
    const updated = setUserModuleComplete(userKey, id, moduleIdx, totalMods);
    setCourseProgress(updated);
  };

  const handleResetCourseAndAttempts = () => {
    resetUserCourseProgressAndAttempts(userKey, id);
    setCourseProgress({ completedModules: [], progressPercent: 0, isCompleted: false });
    setAttemptsCount(0);
  };

  useEffect(() => {
    async function loadItem() {
      const localC = getCoursesFromStorage();
      const localP = getProgramsFromStorage();
      const localFound = localC.find((c) => c.id === id) || localP.find((p) => p.id === id);
      if (localFound) setItem(localFound);

      try {
        const courses = await fetchCoursesFromSupabase();
        const programs = await fetchProgramsFromSupabase();
        const found = courses.find((c) => c.id === id) || programs.find((p) => p.id === id);
        if (found) setItem(found);
      } catch (err) {}
    }
    loadItem();
  }, [id]);

  if (!item) {
    return (
      <div style={{ padding: '120px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Loading Course Details...</h2>
      </div>
    );
  }

  // Gate Officer Programs to logged-in users only
  const isProgram = id.startsWith('prog-') || item.type === 'program';
  if (isProgram && !user) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(180deg, #EFEAE5 0%, var(--color-sand-50, #FBF8F3) 100%)',
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid rgba(17, 24, 39, 0.06)',
          borderRadius: '32px',
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(193, 85, 44, 0.12)',
            border: '1px solid rgba(226, 139, 92, 0.3)',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            color: 'var(--color-terracotta-500, #C1552C)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div style={{ fontSize: '10px', fontWeight: '800', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            BIHAR AI MISSION
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
            Officer Access Required 🔒
          </h2>
          <p style={{ fontSize: '13.5px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 22px 0' }}>
            This officer program is restricted to logged-in users. Please log in or register to view full curriculum details and course modules.
          </p>
          <button
            onClick={() => onGetInvolved && onGetInvolved('login')}
            style={{
              width: '100%',
              height: '38px',
              background: '#000000',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(24, 21, 18, 0.2)',
            }}
          >
            Log In to Access Officer Program →
          </button>
        </div>
      </div>
    );
  }

  const title = isHi ? (item.titleHi || item.title) : item.title;
  const desc = isHi ? (item.descHi || item.desc) : item.desc;
  const bullets = isHi && item.bulletsHi && item.bulletsHi.length > 0 ? item.bulletsHi : item.bullets || [];

  const defaultModules = [
    {
      num: '01',
      title: isHi ? 'AI, ML और GenAI बुनियादी सिद्धांत' : 'AI, ML & GenAI Fundamentals',
      items: [
        isHi ? 'आर्टिफिशियल इंटेलिजेंस और मशीन लर्निंग का परिचय' : 'Introduction to Artificial Intelligence & ML',
        isHi ? 'जनरेटिव AI (ChatGPT, Claude, Gemini) कैसे काम करता है' : 'How Generative AI (ChatGPT, Claude, Gemini) Works',
        isHi ? 'मुख्य अवधारणाएं: LLMs, प्रॉम्ट्स और न्यूरल नेटवर्क' : 'Key Concepts: LLMs, Prompts, and Neural Networks',
      ],
      color: '#000000',
    },
    {
      num: '02',
      title: isHi ? 'दैनिक कार्य में AI अनुप्रयोग' : 'AI Applications in Daily Work',
      items: [
        isHi ? 'सरकारी दस्तावेज़ और ज्ञापन तैयार करना' : 'Drafting Official Letters & Government Circulars',
        isHi ? 'लंबी रिपोर्टों और नीतियों का त्वरित सारांश' : 'Summarising Long Reports & Policy Documents',
        isHi ? 'डेटा प्रोसेसिंग और तालिका विश्लेषण' : 'Data Processing & Spreadsheet Automation',
      ],
      color: '#1a1a1a',
    },
    {
      num: '03',
      title: isHi ? 'प्रॉम्ट इंजीनियरिंग और प्रैक्टिकल टूल्स' : 'Prompt Engineering & Practical Tools',
      items: [
        isHi ? 'प्रभावी प्रॉम्ट की संरचना और फॉर्मूला' : 'Anatomy of an Effective AI Prompt',
        isHi ? 'द्विभाषी अनुवाद (हिंदी <-> अंग्रेजी)' : 'Bilingual Translation & Localization (Hindi <-> English)',
        isHi ? 'RTI पूछताछ और नागरिक उत्तर तैयार करना' : 'Responding to Public Grievances & RTI Queries',
      ],
      color: '#000000',
    },
    {
      num: '04',
      title: isHi ? 'AI जोखिम, गोपनीयता और नैतिकता' : 'AI Risks, Privacy & Ethics',
      items: [
        isHi ? 'हैलुसिनेशन और भ्रामक जानकारी से बचाव' : 'Understanding Hallucinations & Bias',
        isHi ? 'डेटा सुरक्षा और DPDP अधिनियम 2023 अनुपालन' : 'Data Privacy & DPDP Act 2023 Compliance',
        isHi ? 'सार्वजनिक क्षेत्र में जिम्मेदार AI का उपयोग' : 'Responsible & Ethical AI in Public Governance',
      ],
      color: '#1a1a1a',
    },
    {
      num: '05',
      title: isHi ? 'क्षेत्र-विशिष्ट केस स्टडीज' : 'Sector-Specific Case Studies',
      items: [
        isHi ? 'कृषि और ग्रामीण विकास में AI उपकरण' : 'AI in Agriculture & Rural Schemes',
        isHi ? 'स्वास्थ्य और नागरिक सेवा स्वचालन' : 'Healthcare & Citizen Service Automation',
        isHi ? 'बाढ़ प्रबंधन और उपग्रह डेटा विश्लेषण' : 'Disaster Management & GIS Data Analytics',
      ],
      color: '#C1552C',
    },
    {
      num: '06',
      title: isHi ? 'व्यावहारिक प्रोजेक्ट और मूल्यांकन' : 'Hands-on Capstone & Certification',
      items: [
        isHi ? 'अपनी पहली AI प्रॉम्ट वर्कफ़्लो का निर्माण' : 'Building Your First Custom AI Workflow',
        isHi ? 'ऑनलाइन ज्ञान मूल्यांकन (MCQ परीक्षा)' : 'Online Evaluation Quiz (Multiple Choice)',
        isHi ? 'बिहार AI মিশন प्रमाण पत्र डाउनलोड करें' : 'Download Verified Certificate of Completion',
      ],
      color: '#000000',
    },
  ];

  const modules = item.customModules && item.customModules.length > 0 ? item.customModules : defaultModules;

  const statCardStyle = {
    background: '#FFFFFF',
    border: '1px solid rgba(17, 24, 39, 0.06)',
    borderRadius: '12px',
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  };

  const statNumberStyle = {
    display: 'block',
    fontSize: '22px',
    fontWeight: '900',
    color: '#000000',
    marginBottom: '4px',
  };

  const statLabelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  };



  return (
    <div className="courseDetailPage" style={{ background: '#E3DDD7', minHeight: '100vh', paddingBottom: '60px', color: '#111827', fontFamily: "'Manrope', sans-serif" }}>
      <SEO
        title={item ? `${item.title} | Bihar AI Mission` : "Course Details | Bihar AI Mission"}
        description={item ? item.desc : "Masterclass Level 1 course details, curriculum modules, and digital certification exam instructions."}
        canonical={item ? `https://biharaimission.org/course/${item.id}` : "https://biharaimission.org/learning"}
        keywords={item ? `${item.title}, Bihar AI Course, Level 1 Certification, Governance AI` : "Bihar AI Course"}
        schema={item ? {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: item.title,
          description: item.desc,
          provider: {
            '@type': 'EducationalOrganization',
            name: 'Bihar AI Mission',
            url: 'https://biharaimission.org',
          },
          educationalCredentialAwarded: 'Bihar AI Mission Level 1 Digital Credential',
        } : null}
      />
      {/* Breadcrumb Navigation Header */}
      <div className="courseBreadcrumb" style={{ background: 'var(--bg-card, #FFFFFF)', borderBottom: '1px solid var(--border, rgba(17, 24, 39, 0.05))', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px', color: 'var(--text-muted, #9CA3AF)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--btn-primary, #000000)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <span>/</span>
            <Link to={item.type === 'program' ? '/#training' : '/learning'} style={{ color: 'var(--btn-primary, #000000)', textDecoration: 'none', fontWeight: '600' }}>
              {item.type === 'program' ? (isHi ? 'अधिकारी कार्यक्रम' : 'Officer Programs') : (isHi ? 'पाठ्यक्रम' : 'Courses')}
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--text-main, #111827)', fontWeight: '700' }}>{title}</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#EFEAE5',
              border: '1px solid rgba(17, 24, 39, 0.08)',
              color: '#1a1a1a',
              padding: '6px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="courseMainContainer" style={{ maxWidth: '1140px', margin: '30px auto', padding: '0 20px' }}>
        {/* HERO BANNER SECTION (DPDPA Style) */}
        <div
          className="courseHero"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            borderRadius: '32px',
            padding: '44px 36px',
            color: '#FFFFFF',
            boxShadow: '0 12px 35px rgba(24, 21, 18, 0.25)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '6px 16px',
              borderRadius: '32px',
              fontWeight: '800',
              fontSize: '12px',
              letterSpacing: '0.05em',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {item.type === 'program' ? 'OFFICER EXECUTIVE TRAINING' : 'FREE CERTIFICATE COURSE'} · VERIFIED v2.5
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '14px', lineHeight: '1.25' }}>
            {title}
          </h1>

          <p style={{ fontSize: '16px', opacity: 0.95, maxWidth: '780px', lineHeight: '1.65', marginBottom: '28px' }}>
            {desc}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => onGetInvolved && onGetInvolved(title)}
              style={{
                background: '#FFFFFF',
                color: '#1a1a1a',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontWeight: '900',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              🚀 {isHi ? 'मुफ्त में अभी दाखिला लें' : 'Enroll Now for Free'}
            </button>
            <button
              onClick={() => navigate(item.type === 'program' ? '/#training' : '/#learning')}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                padding: '14px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '14.5px',
                cursor: 'pointer',
              }}
            >
              ← {item.type === 'program' ? (isHi ? 'कार्यक्रमों पर वापस जाएं' : 'Back to Programs') : (isHi ? 'वापस जाएं' : 'Back to Courses')}
            </button>
          </div>
        </div>

        {/* QUICK STATS HIGHLIGHT BAR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          <div style={statCardStyle}>
            <span style={statNumberStyle}>06</span>
            <span style={statLabelStyle}>{isHi ? 'मॉड्यूल' : 'Comprehensive Modules'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>6 Hrs</span>
            <span style={statLabelStyle}>{isHi ? 'स्व-गति से अध्ययन' : 'Self-Paced Learning'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>100%</span>
            <span style={statLabelStyle}>{isHi ? 'निःशुल्क शिक्षा' : 'Free Forever Access'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>EN + हिं</span>
            <span style={statLabelStyle}>{isHi ? 'द्विभाषी माध्यम' : 'Bilingual Medium'}</span>
          </div>
        </div>

        {/* COURSE OVERVIEW & WHAT YOU WILL LEARN */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(24, 21, 18, 0.2)',
            borderRadius: '32px',
            padding: '32px',
            marginBottom: '36px',
            boxShadow: '0 6px 20px rgba(24, 21, 18, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>
            📌 {isHi ? 'पाठ्यक्रम अवलोकन और लाभ' : 'Course Overview & What You Will Learn'}
          </h2>
          <p style={{ color: '#6B7280', lineHeight: '1.7', fontSize: '15px', marginBottom: '24px' }}>
            {isHi
              ? 'यह पाठ्यक्रम विशेष रूप से बिहार के नागरिकों, छात्रों और अधिकारियों के लिए आर्टिफिशियल इंटेलिजेंस के बुनियादी सिद्धांतों को आसानी से समझाने के लिए तैयार किया गया है।'
              : 'This comprehensive certification training provides a structured foundation in Artificial Intelligence, Prompt Engineering, Data Governance, and practical AI tools for civil administration and daily life.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {bullets.map((b, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#EFEAE5',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(17, 24, 39, 0.06)',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#10B981',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    fontWeight: '800',
                    fontSize: '12px',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EXAM QUALIFICATION RULES & ATTEMPT WARNING BANNER */}
        <div style={{
          background: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          borderRadius: '32px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div style={{ fontSize: '26px' }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#92400E', marginBottom: '4px' }}>
              {isHi ? 'प्रमाणपत्र परीक्षा नियम एवं 3 प्रयास चेतावनी (Qualification Warning)' : 'Certification Exam Rules & 3-Attempt Qualification Warning'}
            </div>
            <div style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.6' }}>
              • <strong>Cutoff Score:</strong> Pass with <strong>75% marks</strong> (minimum 23/30 correct answers) to earn your official verified certificate.<br />
              • <strong>Attempt Limit:</strong> Maximum <strong>3 attempts</strong> allowed per cycle. (Current Used: <strong>{attemptsCount}/3 Attempts</strong>).<br />
              • <strong>Re-Locking Security:</strong> If you fail 3 attempts, the exam automatically <strong>LOCKS AGAIN</strong>. Officers must re-review/re-complete the course modules to reset attempts and unlock the exam again.
            </div>
          </div>
        </div>

        {/* COURSE PROGRESS & EXAM UNLOCK BAR */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid rgba(17, 24, 39, 0.06)',
          borderRadius: '32px',
          padding: '24px 28px',
          marginBottom: '32px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Officer Learning Progress
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '2px 0 0 0' }}>
                Syllabus Progress: {courseProgress.progressPercent}% ({courseProgress.completedModules.length}/{modules.length} Modules Completed)
              </h3>
            </div>

            {attemptsCount >= 3 ? (
              <button
                onClick={handleResetCourseAndAttempts}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                }}
              >
                🔄 Re-complete Course & Reset Exam Attempts (3 Failed)
              </button>
            ) : courseProgress.progressPercent >= 100 ? (
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#10B981', background: '#DCFCE7', padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #16A34A' }}>
                🎉 Syllabus 100% Completed — Exams Unlocked Below!
              </div>
            ) : (
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#9CA3AF', background: '#EFEAE5', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
                🔒 Complete 100% Syllabus Modules to Unlock Certification Exams
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: '10px', background: 'rgba(17, 24, 39, 0.06)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${courseProgress.progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #000000 0%, #10B981 100%)', transition: 'width 0.4s ease' }}></div>
          </div>
        </div>

        {/* CURRICULUM MODULES GRID */}
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', marginBottom: '20px' }}>
          📚 {isHi ? 'पाठ्यक्रम मॉड्यूल एवं सामग्री' : 'Course Curriculum & Materials'}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {modules.map((m, idx) => {
            const isModuleDone = courseProgress.completedModules.includes(idx);
            // Sequential Unlocking: Module 0 is always unlocked; Module N requires Module N-1 to be completed
            const isModuleUnlocked = idx === 0 || courseProgress.completedModules.includes(idx - 1);
            const modTitle = m.title || m.name;
            const hasTitle = modTitle && String(modTitle).trim().length > 0;

            return (
              <div
                key={idx}
                style={{
                  background: isModuleUnlocked ? '#FFFFFF' : '#EFEAE5',
                  border: isModuleDone ? '2px solid #10B981' : (isModuleUnlocked ? '1.5px solid rgba(17, 24, 39, 0.08)' : '1.5px dashed rgba(17, 24, 39, 0.08)'),
                  borderRadius: '32px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  boxShadow: isModuleDone ? '0 6px 20px rgba(16, 185, 129, 0.12)' : (isModuleUnlocked ? '0 4px 16px rgba(15, 23, 42, 0.05)' : 'none'),
                  opacity: isModuleUnlocked ? 1 : 0.7,
                  transition: 'all 0.25s ease-in-out',
                }}
              >
                <div>
                  {/* Header: Title & Status Badge / Lock Circle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                    {hasTitle ? (
                      <h3
                        style={{
                          fontSize: '17.5px',
                          fontWeight: '800',
                          color: isModuleDone ? '#059669' : (isModuleUnlocked ? '#111827' : '#9CA3AF'),
                          margin: 0,
                          lineHeight: '1.35',
                          flex: 1
                        }}
                      >
                        {modTitle}
                      </h3>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}

                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        borderRadius: '50%',
                        background: isModuleDone ? '#10B981' : (isModuleUnlocked ? '#000000' : '#9CA3AF'),
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontWeight: '900',
                        fontSize: '14px',
                        boxShadow: isModuleDone ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                      }}
                    >
                      {isModuleDone ? '✓' : (!isModuleUnlocked ? '🔒' : (m.num || `0${idx + 1}`))}
                    </div>
                  </div>

                  {/* Module Progress Bar Indicator */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', marginBottom: '6px' }}>
                      <span style={{ color: isModuleDone ? '#059669' : (isModuleUnlocked ? '#000000' : '#9CA3AF') }}>
                        {isModuleDone ? '100% Completed' : (isModuleUnlocked ? '0% In Progress' : 'Locked')}
                      </span>
                      <span style={{ color: '#9CA3AF' }}>
                        {isModuleDone ? '✅ Finished' : (!isModuleUnlocked ? `🔒 Complete Mod 0${idx} First` : 'Ready')}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(17, 24, 39, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: isModuleDone ? '100%' : '0%', height: '100%', background: '#10B981', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>

                  {/* Module Description / Syllabus Topics */}
                  {(() => {
                    const itemsList = Array.isArray(m.items) && m.items.length > 0
                      ? m.items
                      : ((m.description || m.desc) ? [m.description || m.desc] : []);
                    if (itemsList.length === 0) return null;
                    return (
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
                        {itemsList.map((itemText, j) => (
                          <li
                            key={j}
                            style={{
                              fontSize: '13.5px',
                              color: isModuleUnlocked ? '#6B7280' : '#9CA3AF',
                              padding: '5px 0',
                              paddingLeft: '20px',
                              position: 'relative',
                              lineHeight: '1.5',
                            }}
                          >
                            <span
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '9px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: isModuleDone ? '#10B981' : (isModuleUnlocked ? '#000000' : '#9CA3AF'),
                              }}
                            ></span>
                            {itemText}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>

                <div>
                  {/* Resource & Class Links (Drive, YouTube, Materials) */}
                  {(() => {
                    const resLink = m.resourceLink || m.driveUrl || m.drive_url;
                    const clsLink = m.classLink || m.youtubeUrl || m.youtube_url;
                    const matLink = m.materialUrl || m.material_url || m.pdfUrl;
                    if (!resLink && !clsLink && !matLink) return null;

                    return (
                      <div style={{ background: isModuleUnlocked ? '#EFEAE5' : '#EFEAE5', padding: '12px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {isModuleUnlocked ? 'Resource Links:' : '🔒 Resource Links Locked:'}
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {resLink && String(resLink).trim().length > 0 && (
                            <a
                              href={isModuleUnlocked ? resLink : '#'}
                              onClick={(e) => {
                                if (!isModuleUnlocked) {
                                  e.preventDefault();
                                  toast.warning(`🔒 Please complete Module ${idx} first to unlock this module!`);
                                } else {
                                  handleToggleModuleComplete(idx, modules.length);
                                }
                              }}
                              target={isModuleUnlocked ? "_blank" : "_self"}
                              rel="noreferrer"
                              style={{
                                textDecoration: 'none',
                                background: isModuleUnlocked ? 'var(--color-sand-50, #FBF8F3)' : 'rgba(17, 24, 39, 0.06)',
                                color: isModuleUnlocked ? 'var(--color-terracotta-600, #A3411B)' : '#9CA3AF',
                                border: isModuleUnlocked ? '1px solid var(--color-sand-100, #F3ECE0)' : '1px solid rgba(17, 24, 39, 0.08)',
                                padding: '6px 11px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: isModuleUnlocked ? 'pointer' : 'not-allowed'
                              }}
                            >
                              📁 Google Drive Resources
                            </a>
                          )}
                          {clsLink && String(clsLink).trim().length > 0 && (
                            <a
                              href={isModuleUnlocked ? clsLink : '#'}
                              onClick={(e) => {
                                if (!isModuleUnlocked) {
                                  e.preventDefault();
                                  toast.warning(`🔒 Please complete Module ${idx} first to unlock this module!`);
                                } else {
                                  handleToggleModuleComplete(idx, modules.length);
                                }
                              }}
                              target={isModuleUnlocked ? "_blank" : "_self"}
                              rel="noreferrer"
                              style={{
                                textDecoration: 'none',
                                background: isModuleUnlocked ? '#FEF2F2' : 'rgba(17, 24, 39, 0.06)',
                                color: isModuleUnlocked ? '#DC2626' : '#9CA3AF',
                                border: isModuleUnlocked ? '1px solid #FECACA' : '1px solid rgba(17, 24, 39, 0.08)',
                                padding: '6px 11px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: isModuleUnlocked ? 'pointer' : 'not-allowed'
                              }}
                            >
                              📺 YouTube Video Lecture
                            </a>
                          )}
                          {matLink && String(matLink).trim().length > 0 && (
                            <a
                              href={isModuleUnlocked ? matLink : '#'}
                              onClick={(e) => {
                                if (!isModuleUnlocked) {
                                  e.preventDefault();
                                  toast.warning(`🔒 Please complete Module ${idx} first to unlock this module!`);
                                } else {
                                  handleToggleModuleComplete(idx, modules.length);
                                }
                              }}
                              target={isModuleUnlocked ? "_blank" : "_self"}
                              rel="noreferrer"
                              style={{
                                textDecoration: 'none',
                                background: isModuleUnlocked ? '#F0FDF4' : 'rgba(17, 24, 39, 0.06)',
                                color: isModuleUnlocked ? '#15803D' : '#9CA3AF',
                                border: isModuleUnlocked ? '1px solid #BBF7D0' : '1px solid rgba(17, 24, 39, 0.08)',
                                padding: '6px 11px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: isModuleUnlocked ? 'pointer' : 'not-allowed'
                              }}
                            >
                              📄 PDF Material Document
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Module Status Action Button (No Mark as Complete button) */}
                  <button
                    onClick={() => {
                      if (!isModuleUnlocked) {
                        toast.warning(`🔒 Please complete Module ${idx} first!`);
                      } else {
                        handleToggleModuleComplete(idx, modules.length);
                      }
                    }}
                    style={{
                      width: '100%',
                      background: isModuleDone ? '#DCFCE7' : (isModuleUnlocked ? '#000000' : 'rgba(17, 24, 39, 0.06)'),
                      color: isModuleDone ? '#15803D' : (isModuleUnlocked ? '#FFFFFF' : '#9CA3AF'),
                      border: isModuleDone ? '1.5px solid #16A34A' : 'none',
                      padding: '11px 16px',
                      borderRadius: '9px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: isModuleUnlocked ? 'pointer' : 'not-allowed',
                      boxShadow: isModuleDone ? 'none' : (isModuleUnlocked ? '0 4px 12px rgba(24, 21, 18, 0.15)' : 'none'),
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '6px'
                    }}
                  >
                    {isModuleDone
                      ? '✓ Module 100% Completed'
                      : (isModuleUnlocked ? '📘 Access & Complete Module →' : `🔒 Locked — Complete Module ${idx} First`)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CERTIFICATION EXAMS SECTION (Website Brand Colors with 4 Mini Cards) */}
        {(() => {
          const isCourseFullyCompleted = courseProgress.progressPercent >= 100;
          const passedL1 = hasUserPassedExamLevel(userKey, 'ai-fundamentals');
          const passedL2 = hasUserPassedExamLevel(userKey, 'basics-of-prompts');
          const passedL3 = hasUserPassedExamLevel(userKey, 'ethics-in-ai');
          const passedL4 = hasUserPassedExamLevel(userKey, 'prompt-generation');

          return (
            <div
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                borderRadius: '32px',
                padding: '36px 28px',
                color: '#FFFFFF',
                marginBottom: '40px',
                boxShadow: '0 10px 30px rgba(24, 21, 18, 0.25)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    padding: '5px 16px',
                    borderRadius: '32px',
                    fontWeight: '800',
                    fontSize: '11.5px',
                    letterSpacing: '0.05em',
                    marginBottom: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  STEP-WISE EVALUATION & CERTIFICATION PATHWAY
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '8px' }}>
                  🎓 {isHi ? 'प्रमाणपत्र परीक्षाएं' : 'Certification Exams'}
                </h2>
                <p style={{ fontSize: '14px', opacity: 0.92, maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
                  {!isCourseFullyCompleted
                    ? '🔒 Complete 100% course modules above to unlock step-wise level certification exams.'
                    : 'Pass step-wise certification exams from Level 1 to Level 4. Passing each level unlocks the next difficulty level!'}
                </p>
              </div>

              {/* 4 MINI CARDS GRID WITH SEQUENTIAL UNLOCKING */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '18px',
                }}
              >
                {/* Level 1: AI Fundamentals */}
                <div
                  style={{
                    background: '#FFFFFF',
                    color: '#111827',
                    borderRadius: '32px',
                    padding: '22px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                    border: passedL1 ? '2px solid #10B981' : '1px solid rgba(24, 21, 18, 0.2)',
                    opacity: isCourseFullyCompleted ? 1 : 0.75
                  }}
                >
                  <div>
                    <div style={{ display: 'inline-block', background: passedL1 ? '#DCFCE7' : 'rgba(24, 21, 18, 0.12)', color: passedL1 ? '#15803D' : '#1a1a1a', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                      LEVEL 1 · BEGINNER
                    </div>
                    <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: '1.35' }}>
                      AI Fundamentals Certification Exam
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                      Master essential concepts of Artificial Intelligence, Machine Learning, and Generative AI.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isCourseFullyCompleted) {
                        toast.warning('🔒 Please complete 100% of course modules first!');
                      } else {
                        navigate('/exam/ai-fundamentals');
                      }
                    }}
                    style={{
                      width: '100%',
                      background: passedL1 ? '#DCFCE7' : (isCourseFullyCompleted ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' : 'rgba(17, 24, 39, 0.08)'),
                      color: passedL1 ? '#15803D' : (isCourseFullyCompleted ? '#FFFFFF' : '#6B7280'),
                      border: passedL1 ? '1.5px solid #16A34A' : 'none',
                      padding: '10px 14px',
                      borderRadius: '7px',
                      fontWeight: '800',
                      fontSize: '12.5px',
                      cursor: isCourseFullyCompleted ? 'pointer' : 'not-allowed',
                      boxShadow: isCourseFullyCompleted && !passedL1 ? '0 4px 12px rgba(24, 21, 18, 0.25)' : 'none',
                    }}
                  >
                    {passedL1 ? '✅ PASSED (View Certificate)' : (isCourseFullyCompleted ? 'Take Level 1 Exam →' : '🔒 Locked (Finish Course)')}
                  </button>
                </div>

                {/* Level 2: Basics of Prompts */}
                {(() => {
                  const isL2Unlocked = isCourseFullyCompleted && passedL1;
                  return (
                    <div
                      style={{
                        background: '#FFFFFF',
                        color: '#111827',
                        borderRadius: '32px',
                        padding: '22px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                        border: passedL2 ? '2px solid #10B981' : '1px solid rgba(24, 21, 18, 0.2)',
                        opacity: isL2Unlocked ? 1 : 0.65
                      }}
                    >
                      <div>
                        <div style={{ display: 'inline-block', background: passedL2 ? '#DCFCE7' : 'rgba(24, 21, 18, 0.12)', color: passedL2 ? '#15803D' : '#1a1a1a', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                          LEVEL 2 · INTERMEDIATE
                        </div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: '1.35' }}>
                          Basics of Prompt Engineering Exam
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                          Learn structured prompt techniques to draft official notices and automate daily tasks.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isL2Unlocked) {
                            toast.warning('🔒 Please pass Level 1 (AI Fundamentals) Exam first!');
                          } else {
                            navigate('/exam/basics-of-prompts');
                          }
                        }}
                        style={{
                          width: '100%',
                          background: passedL2 ? '#DCFCE7' : (isL2Unlocked ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' : 'rgba(17, 24, 39, 0.08)'),
                          color: passedL2 ? '#15803D' : (isL2Unlocked ? '#FFFFFF' : '#6B7280'),
                          border: passedL2 ? '1.5px solid #16A34A' : 'none',
                          padding: '10px 14px',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: isL2Unlocked ? 'pointer' : 'not-allowed',
                          boxShadow: isL2Unlocked && !passedL2 ? '0 4px 12px rgba(24, 21, 18, 0.25)' : 'none',
                        }}
                      >
                        {passedL2 ? '✅ PASSED (View Certificate)' : (isL2Unlocked ? 'Take Level 2 Exam →' : '🔒 Pass Level 1 First')}
                      </button>
                    </div>
                  );
                })()}

                {/* Level 3: Ethics in AI */}
                {(() => {
                  const isL3Unlocked = isCourseFullyCompleted && passedL2;
                  return (
                    <div
                      style={{
                        background: '#FFFFFF',
                        color: '#111827',
                        borderRadius: '32px',
                        padding: '22px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                        border: passedL3 ? '2px solid #10B981' : '1px solid rgba(24, 21, 18, 0.2)',
                        opacity: isL3Unlocked ? 1 : 0.65
                      }}
                    >
                      <div>
                        <div style={{ display: 'inline-block', background: passedL3 ? '#DCFCE7' : 'rgba(24, 21, 18, 0.12)', color: passedL3 ? '#15803D' : '#1a1a1a', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                          LEVEL 3 · ADVANCED
                        </div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: '1.35' }}>
                          Ethics, Privacy & DPDP Compliance Exam
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                          Understand AI risks, hallucinations, data security standards, and DPDP Act 2023 compliance.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isL3Unlocked) {
                            toast.warning('🔒 Please pass Level 2 (Basics of Prompts) Exam first!');
                          } else {
                            navigate('/exam/ethics-in-ai');
                          }
                        }}
                        style={{
                          width: '100%',
                          background: passedL3 ? '#DCFCE7' : (isL3Unlocked ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' : 'rgba(17, 24, 39, 0.08)'),
                          color: passedL3 ? '#15803D' : (isL3Unlocked ? '#FFFFFF' : '#6B7280'),
                          border: passedL3 ? '1.5px solid #16A34A' : 'none',
                          padding: '10px 14px',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: isL3Unlocked ? 'pointer' : 'not-allowed',
                          boxShadow: isL3Unlocked && !passedL3 ? '0 4px 12px rgba(24, 21, 18, 0.25)' : 'none',
                        }}
                      >
                        {passedL3 ? '✅ PASSED (View Certificate)' : (isL3Unlocked ? 'Take Level 3 Exam →' : '🔒 Pass Level 2 First')}
                      </button>
                    </div>
                  );
                })()}

                {/* Level 4: Executive Prompt Generation */}
                {(() => {
                  const isL4Unlocked = isCourseFullyCompleted && passedL3;
                  return (
                    <div
                      style={{
                        background: '#FFFFFF',
                        color: '#111827',
                        borderRadius: '32px',
                        padding: '22px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
                        border: passedL4 ? '2px solid #10B981' : '1px solid rgba(24, 21, 18, 0.2)',
                        opacity: isL4Unlocked ? 1 : 0.65
                      }}
                    >
                      <div>
                        <div style={{ display: 'inline-block', background: passedL4 ? '#DCFCE7' : 'rgba(24, 21, 18, 0.12)', color: passedL4 ? '#15803D' : '#1a1a1a', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
                          LEVEL 4 · EXPERT
                        </div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: '#111827', marginBottom: '8px', lineHeight: '1.35' }}>
                          Executive Prompt Generation Exam
                        </h3>
                        <p style={{ fontSize: '12.5px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                          Advanced hands-on mastery in creating custom prompt templates, complex AI pipelines, and decision systems.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (!isL4Unlocked) {
                            toast.warning('🔒 Please pass Level 3 (Ethics & Privacy) Exam first!');
                          } else {
                            navigate('/exam/prompt-generation');
                          }
                        }}
                        style={{
                          width: '100%',
                          background: passedL4 ? '#DCFCE7' : (isL4Unlocked ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' : 'rgba(17, 24, 39, 0.08)'),
                          color: passedL4 ? '#15803D' : (isL4Unlocked ? '#FFFFFF' : '#6B7280'),
                          border: passedL4 ? '1.5px solid #16A34A' : 'none',
                          padding: '10px 14px',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          cursor: isL4Unlocked ? 'pointer' : 'not-allowed',
                          boxShadow: isL4Unlocked && !passedL4 ? '0 4px 12px rgba(24, 21, 18, 0.25)' : 'none',
                        }}
                      >
                        {passedL4 ? '✅ PASSED (View Certificate)' : (isL4Unlocked ? 'Take Level 4 Exam →' : '🔒 Pass Level 3 First')}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(24, 21, 18, 0.2)',
            borderRadius: '32px',
            padding: '32px',
            boxShadow: '0 6px 20px rgba(24, 21, 18, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '20px' }}>
            ❓ {isHi ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid rgba(17, 24, 39, 0.06)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  style={{
                    padding: '16px 20px',
                    background: '#EFEAE5',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: '#111827',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: '#000000' }}>{activeFaq === idx ? '−' : '+'}</span>
                </div>
                {activeFaq === idx && (
                  <div style={{ padding: '16px 20px', fontSize: '14px', color: '#6B7280', lineHeight: '1.6', background: '#FFFFFF' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const statCardStyle = {
  background: '#FFFFFF',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid rgba(24, 21, 18, 0.2)',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(24, 21, 18, 0.06)',
};

const statNumberStyle = {
  display: 'block',
  fontSize: '28px',
  fontWeight: '900',
  color: '#000000',
  marginBottom: '4px',
};

const statLabelStyle = {
  fontSize: '12.5px',
  color: '#6B7280',
  fontWeight: '600',
};
