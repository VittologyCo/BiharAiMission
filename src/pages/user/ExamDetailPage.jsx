import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { saveExamSubmission, markCertificateAsDownloaded, getCleanCourseTitle, getExamLevelBadge } from '../../utils/examStorage';
import {
  getLiveClassesFromStorage,
  getCoursesFromStorage,
  getProgramsFromStorage,
  getQuestionsForLiveClass,
  fetchLiveClassesFromSupabase,
  fetchCoursesFromSupabase,
  fetchProgramsFromSupabase,
  defaultMasterclassQuestions,
  fetchMasterclassQuestionsFromSupabase,
  recordFailedExamAttempt,
  getUserExamAttemptsCount
} from '../../utils/coursesStorage';
import SEO from '../../components/SEO/SEO';
import { supabase } from '../../utils/supabase';
import { checkProfileCompleteness } from '../../utils/profileValidation';
import './ExamDetailPage.responsive.css';

// Default 30 sample question bank for AI Fundamentals
const SAMPLE_AI_QUESTIONS = [
  { id: 1, questionText: 'Who is widely recognized as the Father of Artificial Intelligence?', questionHi: 'कृत्रिम बुद्धिमत्ता (AI) के जनक के रूप में किसे जाना जाता है?', options: ['Alan Turing', 'Geoffrey Hinton', 'Marvin Minsky', 'John McCarthy'], correctAnswerIndex: 3, explanation: 'John McCarthy coined the term Artificial Intelligence in 1956 at the Dartmouth Conference.' },
  { id: 2, questionText: 'Which branch of AI allows systems to learn automatically from experience without being explicitly programmed?', questionHi: 'AI की कौन सी शाखा प्रणालियों को बिना किसी स्पष्ट प्रोग्रामिंग के अनुभव से सीखने की अनुमति देती है?', options: ['Robotic Process Automation', 'Machine Learning', 'Cybernetics', 'Quantum Computing'], correctAnswerIndex: 1, explanation: 'Machine Learning enables systems to identify patterns and learn from data.' },
  { id: 3, questionText: 'What is the primary function of Large Language Models (LLMs)?', questionHi: 'लार्ज लैंग्वेज मॉडल्स (LLM) का मुख्य कार्य क्या है?', options: ['Process text and generate human-like language', 'Control hardware robotics directly', 'Manage SQL database transactions', 'Render 3D graphical objects'], correctAnswerIndex: 0, explanation: 'LLMs process sequential natural language data to understand and generate human text.' },
  { id: 4, questionText: 'What does "Hallucination" mean in Generative AI outputs?', questionHi: 'जेनरेटिव AI आउटपुट में "हैलुसिनेशन" का क्या अर्थ है?', options: ['Hardware overheating during model inferencing', 'Generating confident but factually incorrect information', 'Loss of internet connectivity during API calls', 'Automatic translation of non-English text'], correctAnswerIndex: 1, explanation: 'AI Hallucination occurs when a model generates plausible-sounding but incorrect or fabricated facts.' },
  { id: 5, questionText: 'What is the minimum recommended score threshold to earn the Bihar AI Mission Certificate?', questionHi: 'बिहार AI मिशन प्रमाणपत्र प्राप्त करने के लिए न्यूनतम कटऑफ क्या है?', options: ['50%', '60%', '75%', '90%'], correctAnswerIndex: 2, explanation: 'Candidates must achieve at least 75% score (23 out of 30 correct) to qualify.' },
];

function cleanQuestionDisplay(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/^\[[^\]]+\]\s*/gi, '')
    .replace(/^Question\s*\d+\s*:\s*/gi, '')
    .replace(/^प्रश्न\s*\d+\s*:\s*/gi, '')
    .trim();
}

function generateFullQuestionBank(topic) {
  if (Array.isArray(defaultMasterclassQuestions) && defaultMasterclassQuestions.length > 0) {
    return defaultMasterclassQuestions.map((q, idx) => ({
      id: q.id || idx + 1,
      questionText: q.question || q.questionText || '',
      questionHi: q.questionHi || q.question || q.questionText || '',
      options: q.options || [],
      correctAnswerIndex: q.answer !== undefined ? q.answer : (q.correctAnswerIndex || 0),
      explanation: q.explanation || '',
      explanationHi: q.explanationHi || q.explanation || ''
    }));
  }
  return [...SAMPLE_AI_QUESTIONS];
}

const EXAM_TEMPLATES = {
  'ai-fundamentals': {
    id: 'ai-fundamentals',
    title: 'AI Fundamentals',
    titleHi: 'AI मौलिक सिद्धांत',
    desc: 'Masterclass Level 1 official certification covering artificial intelligence concepts, machine learning models, and public sector AI applications.',
    descHi: 'मास्टरक्लास स्तर 1 आधिकारिक प्रमाणन जिसमें एआई अवधारणाएं, मशीन लर्निंग और प्रशासनिक एआई अनुप्रयोग शामिल हैं।',
    questionsBank: generateFullQuestionBank('AI Fundamentals'),
    passingScore: '75% Minimum Score (23/30 Correct)',
    duration: '30 Minutes',
  },
  'basics-of-prompts': {
    id: 'basics-of-prompts',
    title: 'Basics of Prompts & AI Tools',
    titleHi: 'प्रॉम्प्ट एवं AI टूल्स',
    desc: 'Learn structured prompt design, context setting, and productivity automation using state-of-the-art LLMs.',
    descHi: 'संरचित प्रॉम्प्ट डिज़ाइन, संदर्भ निर्धारण और आधुनिक एलएलएम का उपयोग करके उत्पादकता स्वचालन सीखें।',
    questionsBank: generateFullQuestionBank('Prompt Basics'),
    passingScore: '75% Minimum Score (23/30 Correct)',
    duration: '30 Minutes',
  },
  'ethics-in-ai': {
    id: 'ethics-in-ai',
    title: 'Ethics & Responsible AI Governance',
    titleHi: 'एआई नैतिकता एवं उत्तरदायी शासन',
    desc: 'Comprehensive evaluation of data privacy, bias prevention, transparency, and accountability in administrative AI deployment.',
    descHi: 'प्रशासनिक एआई तैनाती में डेटा गोपनीयता, पूर्वाग्रह निवारण, पारदर्शिता और जवाबदेही का व्यापक मूल्यांकन।',
    questionsBank: generateFullQuestionBank('Ethics in AI'),
    passingScore: '75% Minimum Score (23/30 Correct)',
    duration: '30 Minutes',
  },
  'prompt-generation': {
    id: 'prompt-generation',
    title: 'Advanced Prompt Engineering Masterclass',
    titleHi: 'उन्नत प्रॉम्प्ट इंजीनियरिंग मास्टरक्लास',
    desc: 'Advanced techniques in zero-shot, few-shot, chain-of-thought prompting, and automated workflow integration.',
    descHi: 'जीरो-शॉट, फ्यू-शॉट, चेन-ऑफ-थॉट प्रॉम्प्टिंग और स्वचालित वर्कफ़्लो एकीकरण में उन्नत तकनीकें।',
    questionsBank: generateFullQuestionBank('Advanced Prompts'),
    passingScore: '75% Minimum Score (23/30 Correct)',
    duration: '30 Minutes',
  },
};

function prepareShuffledQuestions(bank, isHi) {
  if (!Array.isArray(bank) || bank.length === 0) return [];

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledQuestions = shuffleArray(bank);

  return shuffledQuestions.map((q, idx) => {
    const rawOptions = Array.isArray(q.options)
      ? q.options
      : (typeof q.options === 'string' ? JSON.parse(q.options) : (q.choices || []));

    const origCorrectIdx = q.correctAnswerIndex !== undefined
      ? q.correctAnswerIndex
      : (q.answer !== undefined ? q.answer : 0);

    const correctOptionText = rawOptions[origCorrectIdx] !== undefined
      ? rawOptions[origCorrectIdx]
      : rawOptions[0];

    const shuffledOpts = shuffleArray(rawOptions);
    const newCorrectIdx = shuffledOpts.indexOf(correctOptionText);

    return {
      ...q,
      id: q.id || idx + 1,
      index: idx + 1,
      questionText: q.question || q.questionText || '',
      questionHi: q.questionHi || q.question || q.questionText || '',
      options: shuffledOpts,
      correctAnswerIndex: newCorrectIdx >= 0 ? newCorrectIdx : 0,
      explanation: q.explanation || '',
      explanationHi: q.explanationHi || q.explanation || ''
    };
  });
}

function resolveExamObject(rawExamId) {
  const targetId = String(rawExamId || '').trim();

  const cleanId = targetId
    .replace(/^live-masterclass-/, '')
    .replace(/^course-/, '')
    .replace(/^prog-/, '');

  // 1. Search in Live Masterclasses Storage FIRST
  const liveClasses = getLiveClassesFromStorage();
  const foundLive = liveClasses.find(
    (lc) => String(lc.id) === String(cleanId) ||
            String(lc.id) === String(targetId) ||
            String(lc.courseName || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanId.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  if (foundLive) {
    const rawTitle = (foundLive.courseName || foundLive.title || 'Generative Ai')
      .replace(/\s*Certification\s*Exam$/i, '')
      .replace(/\s*Exam$/i, '')
      .replace(/\s*Certification$/i, '')
      .trim();
    const title = rawTitle;
    const titleHi = foundLive.courseNameHi || foundLive.titleHi || title;
    const desc = foundLive.courseDesc || foundLive.description || foundLive.desc || 'Official Bihar AI Mission Level 1 Masterclass Certification Exam.';
    const descHi = foundLive.courseDescHi || foundLive.descHi || desc;
    const qBank = getQuestionsForLiveClass(foundLive.id);

    return {
      id: foundLive.id,
      title,
      titleHi,
      desc,
      descHi,
      questionsBank: (qBank && qBank.length > 0) ? qBank : generateFullQuestionBank(rawTitle),
      passingScore: '75% Minimum Score (23/30 Correct)',
      duration: '30 Minutes',
    };
  }

  // 2. Search in Courses Storage
  const courses = getCoursesFromStorage();
  const foundCourse = courses.find(
    (c) => String(c.id) === String(cleanId) ||
            String(c.id) === String(targetId) ||
            String(c.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanId.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  if (foundCourse) {
    const rawTitle = (foundCourse.title || 'AI Course')
      .replace(/\s*Certification\s*Exam$/i, '')
      .replace(/\s*Exam$/i, '')
      .replace(/\s*Certification$/i, '')
      .trim();
    const title = rawTitle;
    const titleHi = foundCourse.titleHi || title;
    const desc = foundCourse.desc || foundCourse.description || 'Official Bihar AI Mission course certification exam.';
    const descHi = foundCourse.descHi || desc;

    return {
      id: foundCourse.id,
      title,
      titleHi,
      desc,
      descHi,
      questionsBank: generateFullQuestionBank(rawTitle),
      passingScore: '75% Minimum Score (23/30 Correct)',
      duration: '30 Minutes',
    };
  }

  // 3. Search in Officer Programs Storage
  const programs = getProgramsFromStorage();
  const foundProg = programs.find(
    (p) => String(p.id) === String(cleanId) || String(p.id) === String(targetId)
  );
  if (foundProg) {
    const rawTitle = (foundProg.title || 'Officer Program')
      .replace(/\s*Certification\s*Exam$/i, '')
      .replace(/\s*Exam$/i, '')
      .replace(/\s*Certification$/i, '')
      .trim();
    const title = rawTitle;
    const titleHi = foundProg.titleHi || title;
    const desc = foundProg.desc || foundProg.description || 'Official Bihar AI Mission officer program certification exam.';
    const descHi = foundProg.descHi || desc;

    return {
      id: foundProg.id,
      title,
      titleHi,
      desc,
      descHi,
      questionsBank: generateFullQuestionBank(rawTitle),
      passingScore: '75% Minimum Score (23/30 Correct)',
      duration: '30 Minutes',
    };
  }

  // 4. Match in built-in EXAM_TEMPLATES
  if (targetId && EXAM_TEMPLATES[targetId]) {
    return EXAM_TEMPLATES[targetId];
  }
  if (cleanId && EXAM_TEMPLATES[cleanId]) {
    return EXAM_TEMPLATES[cleanId];
  }

  // 5. Formatted Title Fallback if ID is descriptive
  if (cleanId && cleanId !== 'undefined' && cleanId !== 'null' && cleanId !== '') {
    const formattedTitle = cleanId
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    
    return {
      id: targetId,
      title: formattedTitle,
      titleHi: formattedTitle,
      desc: `Official Bihar AI Mission Level 1 certification exam for ${formattedTitle}.`,
      descHi: `बिहार AI मिशन की आधिकारिक ${formattedTitle} प्रमाणन परीक्षा।`,
      questionsBank: generateFullQuestionBank(formattedTitle),
      passingScore: '75% Minimum Score (23/30 Correct)',
      duration: '30 Minutes',
    };
  }

  // 6. Default Fallback
  return {
    id: 'generative-ai',
    title: 'Generative Ai',
    titleHi: 'जेनरेटिव AI',
    desc: 'Official Bihar AI Mission Level 1 Masterclass Certification Exam for Generative Ai.',
    descHi: 'जेनरेटिव AI के लिए बिहार AI मिशन का आधिकारिक मास्टरक्लास स्तर 1 प्रमाणन परीक्षा।',
    questionsBank: generateFullQuestionBank('Generative Ai'),
    passingScore: '75% Minimum Score (23/30 Correct)',
    duration: '30 Minutes',
  };
}

function getCleanCandidateName(rawName, email) {
  let target = '';
  if (rawName && !rawName.includes('@') && rawName.trim().toLowerCase() !== 'candidate' && rawName.trim().toLowerCase() !== 'officer candidate') {
    target = rawName.trim();
  } else {
    target = (email || rawName || '').split('@')[0];
  }

  if (!target) return 'Officer Candidate';

  if (target.includes(' ')) {
    return target
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  let cleaned = target.replace(/[0-9_.]+/g, ' ').trim();
  if (!cleaned) return 'Officer Candidate';

  if (cleaned.includes(' ')) {
    return cleaned
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  const firstNamePatterns = [
    'praveer', 'dheeraj', 'abhishek', 'aditya', 'rahul', 'amit', 'anand', 'rohit',
    'sumit', 'vikas', 'alok', 'manish', 'deepak', 'sanjay', 'vijay', 'suresh',
    'ramesh', 'rajesh', 'shivam', 'saurabh', 'gaurav', 'priya', 'neha', 'pooja',
    'anita', 'sunita', 'kavita', 'swati', 'anjali', 'chandan', 'rajan', 'pawan',
    'sachin', 'varun', 'arun', 'nitin', 'rohan', 'gautam', 'shyam', 'ram', 'krishna'
  ];

  const lastNamePatterns = [
    'kishore', 'kumar', 'singh', 'sharma', 'verma', 'gupta', 'prasad', 'raj',
    'yadav', 'mishra', 'jha', 'pandey', 'tiwari', 'choudhary', 'sri', 'srivastava',
    'roy', 'das', 'sen', 'dutta', 'banerjee', 'sinha', 'sahay', 'sah', 'mahto', 'tripathi'
  ];

  let str = cleaned.toLowerCase();
  for (const fn of firstNamePatterns) {
    if (str.startsWith(fn) && str.length > fn.length) {
      const rest = str.slice(fn.length);
      for (const ln of lastNamePatterns) {
        if (rest === ln || rest.startsWith(ln)) {
          const part1 = fn.charAt(0).toUpperCase() + fn.slice(1);
          const part2 = rest.charAt(0).toUpperCase() + rest.slice(1);
          return `${part1} ${part2}`;
        }
      }
      const part1 = fn.charAt(0).toUpperCase() + fn.slice(1);
      const part2 = rest.charAt(0).toUpperCase() + rest.slice(1);
      return `${part1} ${part2}`;
    }
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
}

export default function ExamDetailPage({ onGetInvolved }) {
  const routeParams = useParams();
  const rawExamId = routeParams.examId || routeParams.id || '';
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const isHi = lang === 'hi';

  const [exam, setExam] = useState(() => resolveExamObject(rawExamId));

  useEffect(() => {
    async function syncRemoteAndResolve() {
      await Promise.all([
        fetchLiveClassesFromSupabase().catch(() => {}),
        fetchCoursesFromSupabase().catch(() => {}),
        fetchProgramsFromSupabase().catch(() => {})
      ]);
      setExam(resolveExamObject(rawExamId));
    }
    syncRemoteAndResolve();
  }, [rawExamId]);

  const [examState, setExamState] = useState('INSTRUCTIONS'); // 'INSTRUCTIONS' | 'ACTIVE' | 'DISMISSED' | 'RESULT' | 'EVALUATION' | 'CERTIFICATE'
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState({});

  useEffect(() => {
    if (examState === 'ACTIVE') {
      setVisitedQuestions((prev) => ({ ...prev, [currentQuestionIdx]: true }));
    }
  }, [currentQuestionIdx, examState]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800);
  const [scoreResult, setScoreResult] = useState(null);
  const [dismissalReason, setDismissalReason] = useState('');
  const [warningCount, setWarningCount] = useState(0);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [lastWarningReason, setLastWarningReason] = useState('');
  const certificateRef = useRef(null);
  const currentCredentialIdRef = useRef(null);
  const lastWarningTimeRef = useRef(0);
  const timerRef = useRef(null);

  const candidateName = getCleanCandidateName(user?.fullName || user?.name, user?.email);
  const candidateDesignation = user?.designation || 'Government Officer';
  const candidateEmail = user?.email || 'candidate@bihar.gov.in';
  const candidatePhone = user?.phone || 'N/A';

  // Certificate canvas state
  const [certImageUrl, setCertImageUrl] = useState(null);
  const [certGenerating, setCertGenerating] = useState(false);

  // Responsive layout tracking
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Profile Completeness Check state
  const [userProfile, setUserProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState({ isComplete: true, missingFields: [] });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      if (!user || !user.email) {
        setLoadingProfile(false);
        return;
      }
      try {
        setLoadingProfile(true);
        let profile = null;
        if (supabase) {
          const { data } = await supabase
            .from('user_details')
            .select('*')
            .eq('email', user.email.toLowerCase().trim())
            .maybeSingle();

          if (data) {
            profile = data;
          }
        }

        if (!profile) {
          try {
            const localUser = localStorage.getItem('bihar_ai_user');
            if (localUser) profile = JSON.parse(localUser);
          } catch (e) {}
        }

        const status = checkProfileCompleteness(profile || user);
        setUserProfile(profile || user);
        setProfileStatus(status);
      } catch (err) {
        console.warn('Error loading user profile for exam check:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile();
  }, [user]);

  const safeExitFullscreen = () => {
    try {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (isFS) {
        const exitFS =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;
        if (exitFS) {
          const res = exitFS.call(document);
          if (res && typeof res.catch === 'function') {
            res.catch(() => {});
          }
        }
      }
    } catch (e) {}
  };

  const safeRequestFullscreen = () => {
    try {
      const docEl = document.documentElement;
      const reqFS =
        docEl.requestFullscreen ||
        docEl.webkitRequestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.msRequestFullscreen;
      if (reqFS) {
        const res = reqFS.call(docEl);
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      }
    } catch (e) {}
  };

  const [dynamicQuestionsBank, setDynamicQuestionsBank] = useState(exam.questionsBank);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomQuestions() {
      if (!exam || !exam.id) return;
      try {
        const fetched = await fetchMasterclassQuestionsFromSupabase(exam.id);
        if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
          const formatted = fetched.map((q, idx) => ({
            id: q.id || idx + 1,
            questionText: q.question || q.questionText || '',
            questionHi: q.questionHi || q.question || q.questionText || '',
            options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
            correctAnswerIndex: q.answer !== undefined ? q.answer : (q.correctAnswerIndex || 0),
            explanation: q.explanation || '',
            explanationHi: q.explanationHi || q.explanation || ''
          }));
          setDynamicQuestionsBank(formatted);
        }
      } catch (err) {
        console.warn('Error fetching custom exam questions:', err);
      }
    }
    loadCustomQuestions();
    return () => { isMounted = false; };
  }, [exam.id]);

  const handleStartExam = () => {
    if (!profileStatus.isComplete) {
      setShowProfileIncompleteModal(true);
      toast.warning(isHi ? 'कृपया परीक्षा शुरू करने से पहले अपना प्रोफ़ाइल विवरण पूरा करें।' : 'Please complete your required profile details under My Dashboard to unlock certification exams.');
      return;
    }
    const bank = (dynamicQuestionsBank && dynamicQuestionsBank.length > 0)
      ? dynamicQuestionsBank
      : ((exam.questionsBank && exam.questionsBank.length > 0) ? exam.questionsBank : generateFullQuestionBank(exam.title || 'AI Masterclass'));
    const qList = prepareShuffledQuestions(bank, isHi);
    setQuestions(qList);
    setUserAnswers({});
    setVisitedQuestions({ 0: true });
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds(1800);
    setWarningCount(0);
    setWarningModalOpen(false);

    safeRequestFullscreen();

    setExamState('ACTIVE');
  };

  // COUNTDOWN TIMER EFFECT (30 Mins)
  useEffect(() => {
    if (examState === 'ACTIVE') {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  // SUBMIT EXAM & CALCULATE RESULTS
  const handleCalculateScore = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const targetCorrectIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.answer !== undefined ? q.answer : 0);
      if (selected !== undefined && selected !== null && Number(selected) === Number(targetCorrectIndex)) {
        correctCount += 1;
      }
    });

    const total = questions.length || 30;
    const penaltyDeduction = warningCount * 0.5;
    const finalScore = Math.max(0, correctCount - penaltyDeduction);
    const percentage = Math.round((finalScore / total) * 100);
    const isPassed = percentage >= 75; // 75% requirement (23/30 correct)

    const nowIso = new Date().toISOString();
    const dateFolder = nowIso.split('T')[0];
    const credId = isPassed
      ? (currentCredentialIdRef.current || `BAIM-CERT-${Math.floor(100000 + Math.random() * 900000)}`)
      : null;
    const timeTakenSeconds = 1800 - timeLeftSeconds;

    const questionResponses = questions.map((q, idx) => {
      const selected = userAnswers[idx];
      const targetCorrectIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.answer !== undefined ? q.answer : 0);
      const isCorrect = selected !== undefined && selected !== null && Number(selected) === Number(targetCorrectIndex);
      const qText = isHi
        ? (q.questionHi || q.questionText || q.question || '')
        : (q.questionText || q.question || q.questionHi || '');
      const qOpts = q.options || q.choices || [];
      const qExpl = isHi
        ? (q.explanationHi || q.explanation || '')
        : (q.explanation || q.explanationHi || '');

      return {
        questionId: idx + 1,
        questionText: qText,
        options: qOpts,
        selectedOption: selected !== undefined && selected !== null ? Number(selected) : -1,
        correctOption: Number(targetCorrectIndex),
        isCorrect,
        explanation: qExpl,
      };
    });

    const resultObj = {
      credentialId: credId,
      candidateName,
      candidateDesignation,
      candidateEmail,
      candidatePhone,
      examId: exam.id,
      examTitle: exam.title,
      masterclassId: exam.id,
      masterclassTitle: exam.title,
      score: finalScore,
      rawScore: correctCount,
      correctCount: correctCount,
      warningCount,
      penaltyDeduction,
      total,
      percentage,
      isPassed,
      isApproved: false,
      isViolated: false,
      status: isPassed ? 'PASSED' : 'FAILED',
      timeTakenSeconds,
      issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      submittedAt: nowIso,
      dateFolder,
      questionResponses,
    };

    if (!isPassed) {
      recordFailedExamAttempt(candidateEmail, exam.id);
    }

    saveExamSubmission(resultObj);
    setScoreResult(resultObj);
    setExamState('RESULT');

    safeExitFullscreen();
  };

  const handleAutoSubmit = () => {
    toast.warning(isHi ? 'समय समाप्त हो गया है! आपकी परीक्षा स्वचालित रूप से सबमिट की जा रही है।' : 'Time has expired! Your exam is being automatically submitted.');
    handleCalculateScore();
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate certificate image on a Canvas using certificate.png template
  const generateCertificateCanvas = useCallback(async () => {
    if (!scoreResult) return;
    setCertGenerating(true);

    const certImg = new Image();
    certImg.crossOrigin = 'anonymous';
    certImg.src = '/certificate.png';

    const sigImg = new Image();
    sigImg.crossOrigin = 'anonymous';
    sigImg.src = '/certi_sign.png';

    let certLoaded = false;
    let sigLoaded = false;

    const renderCanvas = async () => {
      if (!certLoaded) return;

      const canvas = document.createElement('canvas');
      canvas.width = certImg.naturalWidth;
      canvas.height = certImg.naturalHeight;
      const ctx = canvas.getContext('2d');

      const W = canvas.width;
      const H = canvas.height;

      ctx.drawImage(certImg, 0, 0, W, H);

      ctx.font = `bold ${Math.round(H * 0.018)}px Arial, sans-serif`;
      ctx.fillStyle = '#1a365d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(scoreResult.credentialId, W * 0.860, H * 0.110);

      const nameFont = Math.round(H * 0.038);
      ctx.font = `bold ${nameFont}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = '#0a2540';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(candidateName, W * 0.50, H * 0.478);

      const displayCourseTitle = getCleanCourseTitle(scoreResult?.examTitle || exam?.title, exam?.id, scoreResult?.masterclassId);
      const titleWithLevel = displayCourseTitle;
      const progFont = Math.round(H * 0.026);
      ctx.font = `bold italic ${progFont}px Georgia, 'Times New Roman', serif`;
      ctx.fillStyle = '#0a2540';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(titleWithLevel, W * 0.50, H * 0.594);

      if (sigLoaded) {
        const sigWidth = Math.round(W * 0.16);
        const sigHeight = Math.round(H * 0.065);
        const sigX = Math.round(W * 0.798 - sigWidth / 2);
        const sigY = Math.round(H * 0.916 - sigHeight);
        ctx.drawImage(sigImg, sigX, sigY, sigWidth, sigHeight);
      }

      const dateFont = Math.round(H * 0.016);
      ctx.font = `bold ${dateFont}px Arial, sans-serif`;
      ctx.fillStyle = '#1a365d';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const issueDate = scoreResult.issueDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      ctx.fillText(issueDate, W * 0.170, H * 0.932);

      try {
        const certName = candidateName || 'Learner Name';
        const certId = scoreResult.credentialId || 'BAIM-CERT-641720';
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

        const qrImg = new Image();
        qrImg.onload = () => {
          const qrX = Math.round(W * 0.1675 - qrSize / 2);
          const qrY = Math.round(H * 0.785 - qrSize / 2);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

          const dataUrl = canvas.toDataURL('image/png', 1.0);
          setCertImageUrl(dataUrl);
          setCertGenerating(false);
        };
        qrImg.onerror = () => {
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          setCertImageUrl(dataUrl);
          setCertGenerating(false);
        };
        qrImg.src = qrDataUrl;
      } catch (qrErr) {
        console.error('QR Code generation error:', qrErr);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        setCertImageUrl(dataUrl);
        setCertGenerating(false);
      }
    };

    certImg.onload = () => {
      certLoaded = true;
      renderCanvas();
    };
    certImg.onerror = () => {
      setCertGenerating(false);
    };

    sigImg.onload = () => {
      sigLoaded = true;
      renderCanvas();
    };
    sigImg.onerror = () => {
      sigLoaded = false;
      renderCanvas();
    };
  }, [candidateName, exam.title, scoreResult]);

  useEffect(() => {
    if (examState === 'CERTIFICATE' && scoreResult && !certImageUrl) {
      generateCertificateCanvas();
    }
  }, [examState]);

  const handleDownloadCertificate = () => {
    if (!certImageUrl) return;

    if (scoreResult && scoreResult.credentialId) {
      markCertificateAsDownloaded(scoreResult.credentialId);
    }

    const link = document.createElement('a');
    link.download = `Bihar_AI_Certificate_${scoreResult.credentialId || 'cert'}.png`;
    link.href = certImageUrl;
    link.click();
  };

  // STRICT ANTI-CHEATING / SECURITY LISTENERS
  useEffect(() => {
    if (examState !== 'ACTIVE') return;

    const triggerSecurityWarning = (reason) => {
      const now = Date.now();
      if (now - lastWarningTimeRef.current < 1500) return;
      lastWarningTimeRef.current = now;

      setWarningCount((prevCount) => {
        const newCount = prevCount + 1;

        if (newCount >= 3) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDismissalReason(reason);
          setExamState('DISMISSED');
          setWarningModalOpen(false);

          const nowIso = new Date().toISOString();
          const dateFolder = nowIso.split('T')[0];
          const credId = currentCredentialIdRef.current || `BAIM-CERT-${Math.floor(100000 + Math.random() * 900000)}`;

          saveExamSubmission({
            credentialId: credId,
            candidateName,
            candidateDesignation: candidateDesignation || 'Candidate',
            candidateEmail,
            candidatePhone: candidatePhone || 'N/A',
            examId: exam.id,
            examTitle: exam.title,
            masterclassId: exam.id,
            masterclassTitle: exam.title,
            score: 0,
            rawScore: 0,
            total: 30,
            percentage: 0,
            isPassed: false,
            isApproved: false,
            isViolated: true,
            warningCount: newCount,
            status: 'VIOLATED',
            dismissalReason: reason,
            submittedAt: nowIso,
            dateFolder,
          });

          safeExitFullscreen();
        } else {
          setLastWarningReason(reason);
          setWarningModalOpen(true);
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden && examState === 'ACTIVE') {
        triggerSecurityWarning(
          isHi
            ? 'सुरक्षा चेतावनी: टैब बदलना या ब्राउज़र विंडो मिनिमाइज़ करना पाया गया। 0.5 अंक का जुर्माना काटा गया है।'
            : 'Security Warning: Tab switching or minimizing browser window detected. A penalty of 0.5 marks has been deducted.'
        );
      }
    };

    const handleWindowBlur = () => {
      if (examState === 'ACTIVE' && !document.hidden) {
        triggerSecurityWarning(
          isHi
            ? 'सुरक्षा चेतावनी: परीक्षा विंडो से फ़ोकस हट गया है। 0.5 अंक का जुर्माना काटा गया है।'
            : 'Security Warning: Exam window lost focus. Security warning issued and 0.5 marks deducted.'
        );
      }
    };

    const handleFullscreenChange = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isFS && examState === 'ACTIVE') {
        triggerSecurityWarning(
          isHi
            ? 'सुरक्षा चेतावनी: फुलस्क्रीन मोड बंद कर दिया गया। 0.5 अंक का जुर्माना काटा गया है।'
            : 'Security Warning: Fullscreen mode exited. Security warning issued and 0.5 marks deducted.'
        );
      }
    };

    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        triggerSecurityWarning(
          isHi
            ? 'सुरक्षा चेतावनी: Esc कुंजी द्वारा फुलस्क्रीन बंद किया गया। 0.5 अंक का जुर्माना काटा गया है।'
            : 'Security Warning: Escape key pressed to exit fullscreen. Security warning issued and 0.5 marks deducted.'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [examState, isHi, candidateName, candidateEmail, candidateDesignation, candidatePhone, exam]);

  // STATE 1: DISMISSED OVERLAY
  if (examState === 'DISMISSED') {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', color: 'var(--color-sand-50, #FBF8F3)', fontFamily: "'General Sans', sans-serif" }}>
        <div
          style={{
            background: '#FFFFFF',
            color: '#111827',
            borderRadius: '32px',
            maxWidth: '560px',
            width: '100%',
            padding: '40px 36px',
            textAlign: 'center',
            border: '2px solid #000000',
            boxShadow: '0 12px 40px rgba(24, 21, 18, 0.14)',
          }}
        >
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', border: '2px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px' }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#DC2626', marginBottom: '12px' }}>
            {isHi ? 'परीक्षा सुरक्षा निरस्तीकरण (3 चेतावनियाँ प्रयुक्त)' : 'Exam Dismissed - Security Threshold Exceeded'}
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.6', marginBottom: '24px' }}>
            {dismissalReason || (isHi ? '3 से अधिक सुरक्षा चेतावनियाँ (टैब स्विच / फुलस्क्रीन एग्जिट) प्राप्त होने के कारण आपकी परीक्षा निरस्त कर दी गई है।' : 'Exceeded the 3-warning security threshold (tab switching, window blur, or fullscreen exit). Your exam attempt has been automatically terminated.')}
          </p>

          <div style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '16px', borderRadius: '12px', fontSize: '13.5px', color: '#991B1B', marginBottom: '32px', textAlign: 'left', lineHeight: '1.55' }}>
            <strong>📌 Policy Note:</strong> Each warning incurs a <strong>0.5 marks penalty</strong>. Exceeding 3 warnings invalidates the exam session to uphold credential integrity under Bihar AI Mission guidelines.
          </div>

          <button
            onClick={() => {
              setWarningCount(0);
              setExamState('INSTRUCTIONS');
            }}
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(24, 21, 18, 0.3)',
            }}
          >
            🔄 {isHi ? 'निर्देशों पर वापस जाएं' : 'Return to Instructions & Retry'}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: ACTIVE EXAM INTERFACE (CONNECTED HEADER & WORKING PALETTE COLORS)
  // -------------------------------------------------------------
  if (examState === 'ACTIVE' && questions.length > 0) {
    const currentQ = questions[currentQuestionIdx];
    const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k] !== undefined && userAnswers[k] !== null).length;
    const progressPercent = Math.round(((currentQuestionIdx + 1) / questions.length) * 100);

    return (
      <div
        className="examPage"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          background: '#F4F8FA',
          color: '#111827',
          overflowY: 'auto',
          padding: '24px 20px',
          fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
          boxSizing: 'border-box',
        }}
      >
        {/* TOP FIXED SECURITY HEADER WITH CONNECTED NAME, EMAIL, & COURSE TITLE */}
        <div
          className="examHeader"
          style={{
            maxWidth: '1140px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            color: '#FFFFFF',
            borderRadius: '32px',
            padding: isMobile ? '16px 16px' : '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(24, 21, 18, 0.22)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{ fontSize: '11.5px', background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', fontWeight: '800', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🔒 SECURE EXAM SESSION
              </span>
              <span style={{ fontSize: isMobile ? '11.5px' : '13px', color: 'rgba(17, 24, 39, 0.06)', fontWeight: '700' }}>
                👤 <strong>{candidateName}</strong> ({candidateEmail})
              </span>
              <span
                style={{
                  background: warningCount > 0 ? '#FEF2F2' : 'rgba(255, 255, 255, 0.15)',
                  color: warningCount > 0 ? '#F87171' : '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '11.5px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: warningCount > 0 ? '1px solid #FCA5A5' : '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                ⚠️ Warnings: {warningCount} / 3 (-{(warningCount * 0.5).toFixed(1)} pts penalty)
              </span>
            </div>
            <h2 style={{ fontSize: isMobile ? '17px' : '21px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
              📘 {isHi ? (exam.titleHi || 'AI प्रमाणन परीक्षा') : exam.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.12)', padding: '8px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '800', textTransform: 'uppercase' }}>{isHi ? 'शेष समय' : 'TIME REMAINING'}</div>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  color: timeLeftSeconds < 300 ? '#F87171' : '#FFFFFF',
                  fontFamily: 'monospace',
                }}
              >
                ⏰ {formatTimer(timeLeftSeconds)}
              </div>
            </div>

            <button
              onClick={handleCalculateScore}
              style={{
                background: '#FFFFFF',
                color: '#1a1a1a',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              }}
            >
              {isHi ? 'परीक्षा सबमिट करें ✓' : 'Submit Exam ✓'}
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div style={{ maxWidth: '1140px', margin: '0 auto 20px', background: 'rgba(17, 24, 39, 0.08)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #000000 0%, #1a1a1a 100%)', transition: 'width 0.3s' }}></div>
        </div>

        {/* MAIN QUESTION DISPLAY & PALETTE GRID */}
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 310px', gap: '20px' }}>
          {/* LEFT: QUESTION CARD */}
          <div
            className="questionCard"
            style={{
              background: '#FFFFFF',
              color: '#111827',
              borderRadius: '32px',
              padding: '36px',
              border: '1.5px solid rgba(24, 21, 18, 0.15)',
              boxShadow: '0 8px 30px rgba(24, 21, 18, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ background: '#EFEAE5', color: '#000000', fontWeight: '800', fontSize: '13px', padding: '6px 16px', borderRadius: '32px', border: '1px solid rgba(24, 21, 18, 0.2)' }}>
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <span style={{ fontSize: '13.5px', color: '#6B7280', fontWeight: '700' }}>
                  Answered: <strong style={{ color: '#059669' }}>{answeredCount}</strong>/{questions.length}
                </span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '28px', lineHeight: '1.45' }}>
                {currentQuestionIdx + 1}. {cleanQuestionDisplay(
                  isHi
                    ? (currentQ.questionHi || currentQ.questionText || currentQ.question || '')
                    : (currentQ.questionText || currentQ.question || currentQ.questionHi || '')
                )}
              </h3>

              {/* OPTIONS GRID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                {(currentQ.options || []).map((optionText, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIdx] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => {
                        setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: optIdx }));
                        setVisitedQuestions((prev) => ({ ...prev, [currentQuestionIdx]: true }));
                      }}
                      style={{
                        border: isSelected ? '2.5px solid #000000' : '1.5px solid rgba(17, 24, 39, 0.06)',
                        background: isSelected ? 'var(--color-sand-50, #FBF8F3)' : '#FFFFFF',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(24, 21, 18, 0.15)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          border: isSelected ? '6px solid #000000' : '2px solid #9CA3AF',
                          background: '#FFFFFF',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      ></div>
                      <span style={{ fontSize: '15px', fontWeight: isSelected ? '700' : '500', color: isSelected ? '#1a1a1a' : '#374151' }}>
                        {optionText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PREV / NEXT NAVIGATION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #EFEAE5' }}>
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => {
                    setCurrentQuestionIdx((prev) => Math.max(0, prev - 1));
                    setVisitedQuestions((prev) => ({ ...prev, [currentQuestionIdx - 1]: true }));
                }}
                style={{
                  background: currentQuestionIdx === 0 ? '#EFEAE5' : '#111827',
                  color: currentQuestionIdx === 0 ? '#9CA3AF' : '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>

              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={() => {
                      setCurrentQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1));
                      setVisitedQuestions((prev) => ({ ...prev, [currentQuestionIdx + 1]: true }));
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(24, 21, 18, 0.25)',
                  }}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleCalculateScore}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                  }}
                >
                  Finish & Submit ✓
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: QUESTION PALETTE GRID SIDEBAR (BULLETPROOF STATUS COLOR CODING) */}
          <div
            className="examPalette"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(24, 21, 18, 0.15)',
              borderRadius: '32px',
              padding: '20px',
              height: 'fit-content',
              boxShadow: '0 8px 30px rgba(24, 21, 18, 0.08)',
              boxSizing: 'border-box',
            }}
          >
            <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1a1a1a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Question Palette ({questions.length})
            </h4>

            {/* 5-Column Grid with minmax(0, 1fr) preventing element overflow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', marginBottom: '20px' }}>
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== null;
                const isCurrent = currentQuestionIdx === idx;
                const isVisited = !!visitedQuestions[idx];
                const isSkipped = isVisited && !isAnswered && !isCurrent;

                let btnClass = 'qp-btn qp-btn-unvisited';

                if (isCurrent) {
                  btnClass = 'qp-btn qp-btn-active';
                } else if (isAnswered) {
                  btnClass = 'qp-btn qp-btn-answered';
                } else if (isSkipped) {
                  btnClass = 'qp-btn qp-btn-skipped';
                }

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => {
                      setCurrentQuestionIdx(idx);
                      setVisitedQuestions((prev) => ({ ...prev, [idx]: true }));
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* PALETTE LEGEND */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid #EFEAE5', fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#000000', border: '2px solid var(--color-charcoal-900, #181512)' }}></div>
                <span>Current Active Question (Blue)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#059669' }}></div>
                <span>Answered Question (Green)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#FEF3C7', border: '1.5px solid #F59E0B' }}></div>
                <span>Left Blank / Skipped (Amber)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: '#EFEAE5', border: '1px solid rgba(17, 24, 39, 0.06)' }}></div>
                <span>Unvisited Question (Grey)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY WARNING MODAL POPUP DIALOG */}
        {warningModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              zIndex: 999999,
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                maxWidth: '520px',
                width: '100%',
                padding: '36px',
                textAlign: 'center',
                border: '3px solid #DC2626',
                boxShadow: '0 20px 50px rgba(220, 38, 38, 0.3)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '3px solid #FCA5A5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  margin: '0 auto 20px',
                }}
              >
                ⚠️
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#DC2626', marginBottom: '10px' }}>
                {isHi ? 'सुरक्षा उल्लंघन चेतावनी!' : 'SECURITY VIOLATION DETECTED'}
              </h3>

              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', marginBottom: '20px', fontWeight: '600' }}>
                {lastWarningReason ||
                  (isHi
                    ? 'फुलस्क्रीन मोड बंद या टैब स्विच का पता चला है।'
                    : 'Fullscreen mode exit or focus loss was detected.')}
              </p>

              <div
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#991B1B',
                  fontWeight: '700',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>🚨 {isHi ? 'चेतावनी संख्या:' : 'Current Warning:'} <strong>{warningCount} / 3</strong></span>
                <span>📉 {isHi ? 'कटौती:' : 'Penalty:'} <strong>-0.5 pts</strong></span>
              </div>

              <button
                onClick={() => {
                  setWarningModalOpen(false);
                  safeRequestFullscreen();
                }}
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '15.5px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.35)',
                  width: '100%',
                }}
              >
                🔒 {isHi ? 'फुलस्क्रीन मोड पुनः सक्रिय करें और जारी रखें' : 'Re-enter Fullscreen & Resume Exam'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  // STATE 3: EXAM RESULT SUMMARY INTERFACE
  // -------------------------------------------------------------
  if (examState === 'RESULT' && scoreResult) {
    const isApproved = scoreResult.isApproved !== false;

    return (
      <div className="examPage examResults" style={{ background: 'transparent', minHeight: '100vh', padding: '40px 20px', color: 'var(--color-sand-50, #FBF8F3)', fontFamily: "'General Sans', sans-serif" }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* RESULT HEADER CARD */}
          <div
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              borderRadius: '32px',
              padding: '40px 32px',
              color: '#FFFFFF',
              textAlign: 'center',
              boxShadow: '0 12px 35px rgba(24, 21, 18, 0.2)',
              marginBottom: '28px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {scoreResult.isPassed ? '🎉' : '📊'}
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>
              {scoreResult.isPassed
                ? (isHi ? 'बधाई हो! आप उत्तीर्ण हुए' : 'Congratulations! You Passed')
                : (isHi ? 'परीक्षा परिणाम' : 'Exam Results')}
            </h2>

            <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '24px' }}>
              {candidateName} ({candidateDesignation || 'Candidate'})
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '16px 32px',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                marginBottom: '28px',
              }}
            >
              <div>
                <div style={{ fontSize: '36px', fontWeight: '900' }}>{scoreResult.percentage}%</div>
                <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: '700' }}>
                  {scoreResult.score} / {scoreResult.total} {isHi ? 'सही' : 'Correct'}
                </div>
              </div>

              <div style={{ width: '1px', height: '40px', background: 'rgba(255, 255, 255, 0.3)' }}></div>

              <div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>
                  {scoreResult.isPassed ? (isHi ? 'PASSED (उत्तीर्ण)' : 'PASSED') : (isHi ? 'NEEDS IMPROVEMENT' : 'NEEDS IMPROVEMENT')}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {isHi ? 'कटऑफ: 75% (23/30)' : 'Passing Cutoff: 75% (23/30)'}
                </div>
              </div>
            </div>

            {/* VERIFIED CREDENTIAL ID BADGE */}
            {scoreResult.isPassed && scoreResult.credentialId ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#FFFFFF',
                border: '1.5px solid rgba(24, 21, 18, 0.2)',
                borderRadius: '12px',
                padding: '16px 24px',
                flexWrap: 'wrap',
                gap: '24px',
                color: '#111827',
                maxWidth: '600px',
                margin: '0 auto 28px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>VERIFIED CREDENTIAL ID</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#000000', fontFamily: 'monospace' }}>{scoreResult.credentialId}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>CANDIDATE</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{candidateName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>ISSUE DATE</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{scoreResult.issueDate}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' }}>SCORE</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#000000' }}>{scoreResult.percentage}%</div>
              </div>
            </div>
            ) : (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  color: '#991B1B',
                  maxWidth: '600px',
                  margin: '0 auto 28px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  lineHeight: '1.5',
                }}
              >
                Certification Not Awarded — A minimum cutoff of 75% (23/30 correct) is required. Digital Certificate is issued only upon achieving passing marks.
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', width: '100%' }}>
                <button
                  onClick={() => setExamState('EVALUATION')}
                  style={{
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '14.5px',
                    cursor: 'pointer',
                  }}
                >
                  📖 {isHi ? 'उत्तर एवं विस्तृत व्याख्या देखें' : 'Evaluate Results & Answer Key'}
                </button>

                {!scoreResult.isPassed && (
                  <button
                    onClick={handleStartExam}
                    style={{
                      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '14.5px',
                      cursor: 'pointer',
                    }}
                  >
                    🔄 {isHi ? 'पुनः परीक्षा दें' : 'Retake Exam'}
                  </button>
                )}

                {scoreResult.isPassed && isApproved && (
                  <button
                    onClick={() => setExamState('CERTIFICATE')}
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '14px 32px',
                      borderRadius: '8px',
                      fontWeight: '900',
                      fontSize: '15px',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    📜 {isHi ? 'प्रमाणपत्र देखें और डाउनलोड करें' : 'View & Download Certificate'}
                  </button>
                )}

                <button
                  onClick={() => navigate('/learning')}
                  style={{
                    background: 'transparent',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(255, 255, 255, 0.6)',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '14.5px',
                    cursor: 'pointer',
                  }}
                >
                  ← {isHi ? 'लर्निंग हब पर लौटें' : 'Back to Learning Hub'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 4: DETAILED ANSWER EVALUATION VIEW
  // -------------------------------------------------------------
  if (examState === 'EVALUATION' && scoreResult) {
    const questionResponses = (scoreResult.questionResponses && scoreResult.questionResponses.length > 0)
      ? scoreResult.questionResponses
      : questions.map((q, idx) => {
          const selected = userAnswers[idx];
          const targetCorrectIndex = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.answer !== undefined ? q.answer : 0);
          const isCorrect = selected !== undefined && selected !== null && Number(selected) === Number(targetCorrectIndex);
          const qText = cleanQuestionDisplay(
            isHi
              ? (q.questionHi || q.questionText || q.question || '')
              : (q.questionText || q.question || q.questionHi || '')
          );
          const qOpts = q.options || q.choices || [];
          const qExpl = isHi
            ? (q.explanationHi || q.explanation || '')
            : (q.explanation || q.explanationHi || '');

          return {
            questionId: idx + 1,
            questionText: qText,
            options: qOpts,
            selectedOption: selected !== undefined && selected !== null ? Number(selected) : -1,
            correctOption: Number(targetCorrectIndex),
            isCorrect,
            explanation: qExpl,
          };
        });

    const correctCount = scoreResult.correctCount !== undefined
      ? scoreResult.correctCount
      : (scoreResult.rawScore !== undefined ? scoreResult.rawScore : Math.round(scoreResult.score));

    return (
      <EvaluationView
        scoreResult={scoreResult}
        responses={questionResponses}
        correctCount={correctCount}
        incorrectCount={scoreResult.total - correctCount}
        candidateName={candidateName}
        candidateDesignation={candidateDesignation}
        exam={exam}
        isHi={isHi}
        setExamState={setExamState}
      />
    );
  }

  // -------------------------------------------------------------
  // STATE 5: CERTIFICATE PREVIEW & DOWNLOAD VIEW
  // -------------------------------------------------------------
  if (examState === 'CERTIFICATE' && scoreResult) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', padding: '40px 20px', color: 'var(--color-sand-50, #FBF8F3)', fontFamily: "'General Sans', sans-serif" }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '32px',
              padding: '36px',
              boxShadow: '0 12px 35px rgba(24, 21, 18, 0.12)',
              border: '2px solid #000000',
              marginBottom: '28px',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1a1a1a', marginBottom: '8px' }}>
              📜 {isHi ? 'आधिकारिक डिजिटल प्रमाण पत्र' : 'Official Bihar AI Mission Digital Credential'}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14.5px', marginBottom: '24px' }}>
              {isHi
                ? 'आपका प्रमाण पत्र सफलतापूर्वक जनरेट हो गया है। आप इसे उच्च-गुणवत्ता वाले PNG के रूप में डाउनलोड कर सकते हैं।'
                : 'Your verified digital certificate has been generated. You can download and print it for official records.'}
            </p>

            {certImageUrl ? (
              <img
                src={certImageUrl}
                alt="Bihar AI Mission Certificate"
                style={{
                  width: '100%',
                  maxWidth: '850px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(17, 24, 39, 0.08)',
                  marginBottom: '28px',
                }}
              />
            ) : (
              <div style={{ padding: '60px 20px', color: '#6B7280', fontWeight: '700' }}>
                ⏳ {isHi ? 'प्रमाण पत्र तैयार किया जा रहा है...' : 'Generating Official Digital Certificate...'}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadCertificate}
                disabled={!certImageUrl}
                style={{
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '14px 36px',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '15px',
                  cursor: certImageUrl ? 'pointer' : 'not-allowed',
                  boxShadow: '0 6px 20px rgba(24, 21, 18, 0.25)',
                }}
              >
                ⬇️ {isHi ? 'प्रमाण पत्र डाउनलोड करें (PNG)' : 'Download Certificate (PNG)'}
              </button>

              <button
                onClick={() => setExamState('RESULT')}
                style={{
                  background: '#FFFFFF',
                  color: '#111827',
                  border: '1.5px solid rgba(17, 24, 39, 0.08)',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14.5px',
                  cursor: 'pointer',
                }}
              >
                ← {isHi ? 'परिणाम सारांश पर वापस जाएं' : 'Back to Result Summary'}
              </button>
            </div>
          </div>

          {/* HIGHLIGHTED INSTRUCTIONS WARNING ALERT BEFORE EXAM LAUNCH */}
          <div
            style={{
              background: '#FFFBEB',
              border: '2px solid #FCD34D',
              borderRadius: '32px',
              padding: '22px 26px',
              marginTop: '28px',
              marginBottom: '24px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 6px 20px rgba(217, 119, 6, 0.12)',
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: 1 }}>⚠️</span>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '900', color: '#92400E' }}>
                {isHi ? 'महत्वपूर्ण सूचना: परीक्षा शुरू करने से पहले ध्यान दें' : 'Important Notice: Read Instructions Carefully'}
              </h4>
              <p style={{ margin: 0, fontSize: '14.5px', color: '#B45309', lineHeight: '1.6', fontWeight: '600' }}>
                {isHi
                  ? 'कृपया परीक्षा शुरू करने से पहले ऊपर दिए गए सभी आधिकारिक नियमों और दिशानिर्देशों को ध्यानपूर्वक पढ़ें। परीक्षा के दौरान 3 सुरक्षा चेतावनियों के उपरांत सत्र निरस्त कर दिया जाएगा।'
                  : 'Please read all official guidelines and exam rules above carefully before launching your exam. Exceeding 3 security warnings during the proctored session will automatically terminate your exam.'}
              </p>
            </div>
          </div>

          {/* LAUNCH EXAM ACTION BUTTON */}
          <div
            id="registration-box"
            style={{
              textAlign: 'center',
              padding: '12px 0 24px 0',
              marginBottom: '36px',
            }}
          >
            <button
              onClick={handleStartExam}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '16px 42px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '17px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(24, 21, 18, 0.35)',
                letterSpacing: '0.02em',
                transition: 'transform 0.2s, boxShadow 0.2s',
              }}
            >
              🚀 {isHi ? 'परीक्षा शुरू करें' : 'Launch Exam'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 0: PRE-EXAM INSTRUCTIONS & CANDIDATE REGISTRATION
  // -------------------------------------------------------------
  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '60px', color: 'var(--color-sand-50, #FBF8F3)' }}>
      {/* Breadcrumb Navigation Header */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(24, 21, 18, 0.2)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px', color: '#6B7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#000000', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <span>/</span>
            <Link to="/learning" style={{ color: '#000000', textDecoration: 'none', fontWeight: '600' }}>
              {isHi ? 'लर्निंग हब' : 'Learning Hub'}
            </Link>
            <span>/</span>
            <span style={{ color: '#111827', fontWeight: '700' }}>{exam.title}</span>
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

      <div style={{ maxWidth: '1140px', margin: '30px auto', padding: '0 20px' }}>
        {/* HERO BANNER SECTION (Site Default Colors) */}
        <div
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
            {exam.level} · BIHAR AI MISSION CERTIFICATION
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '14px', lineHeight: '1.25' }}>
            {isHi ? exam.titleHi : exam.title}
          </h1>

          <p style={{ fontSize: '16px', opacity: 0.95, maxWidth: '780px', lineHeight: '1.65', marginBottom: '28px' }}>
            {isHi ? exam.descHi : exam.desc}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(-1)}
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
              ← {isHi ? 'वापस जाएं' : 'Back to Program'}
            </button>
          </div>
        </div>

        {/* QUICK EXAM STATS HIGHLIGHT GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '36px',
          }}
        >
          <div style={statCardStyle}>
            <span style={statNumberStyle}>30 Mins</span>
            <span style={statLabelStyle}>{isHi ? 'परीक्षा की अवधि' : 'Exam Duration'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>30 MCQs</span>
            <span style={statLabelStyle}>{isHi ? 'कुल प्रश्न संख्या' : 'Total Questions'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>75% Pass</span>
            <span style={statLabelStyle}>{isHi ? 'न्यूनतम उत्तीर्णांक (23/30)' : 'Passing Criteria (23/30)'}</span>
          </div>
          <div style={statCardStyle}>
            <span style={statNumberStyle}>Strict Proctored</span>
            <span style={statLabelStyle}>{isHi ? 'फुलस्क्रीन सुरक्षा' : 'Fullscreen Proctored'}</span>
          </div>
        </div>

        {/* EXAM GUIDELINES CARD (Placed BEFORE Candidate Registration) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              {isHi ? 'आधिकारिक परीक्षा नियम एवं दिशानिर्देश' : 'Official Exam Rules & Assessment Guidelines'}
            </h2>
          </div>

          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
            {isHi
              ? 'परीक्षा शुरू करने से पहले कृपया निम्नलिखित 7 दिशानिर्देशों को ध्यानपूर्वक पढ़ें। ये नियम प्रमाणन की निष्पक्षता और सुरक्षा सुनिश्चित करने के लिए लागू हैं।'
              : 'Please read the following guidelines carefully before launching your examination. These rules enforce credential integrity and compliance with Bihar AI Mission certification standards.'}
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>1.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'प्रॉक्टर्ड सुरक्षा एवं निगरानी नीति:' : '3-Warning Security & Focus Monitoring:'}</strong>{' '}
                {isHi ? 'परीक्षा स्वचालित रूप से फुलस्क्रीन मोड में खुलेगी। टैब बदलना या फुलस्क्रीन छोड़ना सुरक्षा उल्लंघन माना जाएगा।' : 'The examination will automatically launch in full-screen locked mode. Exiting full-screen or switching browser tabs triggers an automatic security violation warning.'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#FFFBEB', padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #FCD34D' }}>
              <span style={{ color: '#D97706', fontWeight: '900', fontSize: '15px' }}>2.</span>
              <div>
                <strong style={{ color: '#92400E' }}>{isHi ? '0.5 अंक कटौती नीति एवं 3 चेतावनियाँ सीमित सीमा:' : '0.5 Marks Cut Penalty Per Warning (Max 3 Warnings):'}</strong>{' '}
                {isHi ? 'प्रत्येक सुरक्षा चेतावनी पर आपके कुल अंकों में से 0.5 अंक काट लिए जाएंगे। 3 चेतावनियाँ पूरी होने पर परीक्षा तुरंत निरस्त कर दी जाएगी।' : 'Each security warning deducts 0.5 marks from your final score. Triggering 3 warnings will immediately dismiss and terminate your exam session.'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>3.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'समयबद्ध मूल्यांकन:' : 'Time-Bound Assessment:'}</strong>{' '}
                {isHi ? '30 बहुविकल्पीय प्रश्नों का उत्तर देने के लिए 30 मिनट का समय दिया जाएगा। समय समाप्त होने पर आपके उत्तर स्वचालित रूप से जमा हो जाएंगे।' : 'You will have strictly 30 minutes to complete 30 multiple-choice questions. Unsubmitted responses will auto-submit upon timer expiration.'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>4.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'सत्यापित पहचान पंजीकरण:' : 'Verified Candidate Identification:'}</strong>{' '}
                {isHi ? 'पंजीकरण फॉर्म में सही नाम, पदनाम, आधिकारिक ईमेल और मोबाइल नंबर दर्ज करना अनिवार्य है। प्रमाण पत्र गैर-हस्तांतरणीय हैं।' : 'Provide accurate identity credentials (Name, Designation, Official Email, and Phone Number). Certificates are non-transferable and issued strictly to verified registrants.'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>5.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'अर्हक अंक सीमा (75%+ कटऑफ):' : 'Qualifying Threshold (75%+ Cutoff):'}</strong>{' '}
                {isHi ? 'प्रमाणपत्र प्राप्त करने के लिए कम से कम 75% अंक (30 में से 23 प्रश्न सही) प्राप्त करना अनिवार्य है।' : 'To earn the official Bihar AI Mission Level 1 Digital Credential, candidates must achieve a minimum score of 75% (at least 23 out of 30 correct answers).'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>6.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'नेविगेशन एवं उत्तर समीक्षा स्पेक्ट्रम:' : 'Navigation & Answer Palette Controls:'}</strong>{' '}
                {isHi ? 'अंतिम सबमिशन से पहले आप किसी भी समय साइड पैलेट का उपयोग करके प्रश्नों की समीक्षा और उत्तर बदल सकते हैं।' : 'You can review and navigate between questions at any time before final submission using the interactive Question Palette.'}
              </div>
            </li>

            <li style={{ fontSize: '14px', color: '#374151', display: 'flex', gap: '12px', background: '#EFEAE5', padding: '14px 16px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
              <span style={{ color: '#000000', fontWeight: '900', fontSize: '15px' }}>7.</span>
              <div>
                <strong style={{ color: '#111827' }}>{isHi ? 'तत्काल डिजिटल प्रमाण पत्र डाउनलोड:' : 'Instant Credential Generation:'}</strong>{' '}
                {isHi ? 'उत्तीर्ण होने पर आपका डिजिटल प्रमाण पत्र तुरंत तैयार हो जाएगा जिसे आप सीधे PDF के रूप में डाउनलोड और प्रिंट कर सकते हैं।' : 'Upon successful completion, your verified digital certificate will be instantly generated and available for immediate PDF print/download.'}
              </div>
            </li>
          </ul>
        </div>

        {/* CANDIDATE REGISTRATION CARD (Redesigned Spacious 2-Column Responsive Layout) */}
        {/* HIGHLIGHTED INSTRUCTIONS WARNING ALERT BEFORE EXAM LAUNCH */}
        <div
          style={{
            background: '#FFFBEB',
            border: '2px solid #FCD34D',
            borderRadius: '32px',
            padding: '22px 26px',
            marginTop: '28px',
            marginBottom: '24px',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            boxShadow: '0 6px 20px rgba(217, 119, 6, 0.12)',
          }}
        >
          <span style={{ fontSize: '32px', lineHeight: 1 }}>⚠️</span>
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '900', color: '#92400E' }}>
              {isHi ? 'महत्वपूर्ण सूचना: परीक्षा शुरू करने से पहले ध्यान दें' : 'Important Notice: Read Instructions Carefully'}
            </h4>
            <p style={{ margin: 0, fontSize: '14.5px', color: '#B45309', lineHeight: '1.6', fontWeight: '600' }}>
              {isHi
                ? 'कृपया परीक्षा शुरू करने से पहले ऊपर दिए गए सभी आधिकारिक नियमों और दिशानिर्देशों को ध्यानपूर्वक पढ़ें। परीक्षा के दौरान 3 सुरक्षा चेतावनियों के उपरांत सत्र निरस्त कर दिया जाएगा।'
                : 'Please read all official guidelines and exam rules above carefully before launching your exam. Exceeding 3 security warnings during the proctored session will automatically terminate your exam.'}
            </p>
          </div>
        </div>

        {/* LAUNCH EXAM ACTION BUTTON */}
        <div
          id="registration-box"
          style={{
            textAlign: 'center',
            padding: '12px 0 24px 0',
            marginBottom: '36px',
          }}
        >
          <button
            onClick={handleStartExam}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px 42px',
              borderRadius: '12px',
              fontWeight: '900',
              fontSize: '17px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(24, 21, 18, 0.35)',
              letterSpacing: '0.02em',
              transition: 'transform 0.2s, boxShadow 0.2s',
            }}
          >
            🚀 {isHi ? 'परीक्षा शुरू करें' : 'Launch Exam'}
          </button>
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
  fontSize: '22px',
  fontWeight: '900',
  color: '#000000',
  marginBottom: '4px',
};

const statLabelStyle = {
  fontSize: '12.5px',
  color: '#6B7280',
  fontWeight: '600',
};

function EvaluationView({
  scoreResult,
  responses,
  correctCount,
  incorrectCount,
  candidateName,
  candidateDesignation,
  exam,
  isHi,
  setExamState,
}) {
  const [evalFilter, setEvalFilter] = useState('ALL');

  const filteredResponses = responses.filter((r) => {
    if (evalFilter === 'CORRECT') return r.isCorrect;
    if (evalFilter === 'INCORRECT') return !r.isCorrect;
    return true;
  });

  return (
    <div style={{ background: '#E9F1FA', minHeight: '100vh', padding: '40px 20px', color: '#111827', fontFamily: "'Manrope', sans-serif" }}>
      <SEO
        title={`${exam.title} | Bihar AI Mission`}
        description={`Take the official ${exam.title}. Score minimum 75% cutoff to earn your Bihar AI Mission Level 1 Digital Certification.`}
        canonical={`https://biharaimission.org/exam/${exam.id}`}
        keywords={`${exam.title}, Bihar AI Exam, Level 1 Certification Exam, Proctored AI Assessment`}
      />
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* HEADER CARD */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #000000',
            borderRadius: '32px',
            padding: '32px',
            boxShadow: '0 12px 35px rgba(24, 21, 18, 0.12)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              🔍 {isHi ? 'परिणाम मूल्यांकन एवं उत्तर समीक्षा' : 'Detailed Results Evaluation & Answer Key'}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 6px' }}>
              {candidateName || 'Candidate'} ({candidateDesignation || 'Officer Candidate'})
            </h2>
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>
              {exam.title} · Score: <strong style={{ color: '#1a1a1a' }}>{scoreResult.percentage}%</strong> ({correctCount} / {scoreResult.total} Correct)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setExamState('RESULT')}
              style={{
                background: '#FFFFFF',
                color: '#111827',
                border: '1.5px solid rgba(17, 24, 39, 0.08)',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← {isHi ? 'परिणाम सारांश पर वापस जाएं' : 'Back to Result Summary'}
            </button>
            <button
              onClick={() => setExamState('INSTRUCTIONS')}
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(24, 21, 18, 0.25)',
              }}
            >
              🔄 {isHi ? 'पुनः परीक्षा दें' : 'Retake Exam'}
            </button>
          </div>
        </div>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setEvalFilter('ALL')}
            style={{
              background: evalFilter === 'ALL' ? '#000000' : '#FFFFFF',
              color: evalFilter === 'ALL' ? '#FFFFFF' : '#6B7280',
              border: '1.5px solid ' + (evalFilter === 'ALL' ? '#000000' : 'rgba(17, 24, 39, 0.08)'),
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: '800',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: evalFilter === 'ALL' ? '0 4px 12px rgba(24, 21, 18, 0.2)' : 'none',
            }}
          >
            📌 {isHi ? 'सभी प्रश्न' : 'All Questions'} ({responses.length})
          </button>
          <button
            onClick={() => setEvalFilter('CORRECT')}
            style={{
              background: evalFilter === 'CORRECT' ? '#16A34A' : '#FFFFFF',
              color: evalFilter === 'CORRECT' ? '#FFFFFF' : '#15803D',
              border: '1.5px solid ' + (evalFilter === 'CORRECT' ? '#16A34A' : '#BBF7D0'),
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: '800',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: evalFilter === 'CORRECT' ? '0 4px 12px rgba(22, 163, 74, 0.2)' : 'none',
            }}
          >
            ✅ {isHi ? 'सही उत्तर' : 'Correct'} ({correctCount})
          </button>
          <button
            onClick={() => setEvalFilter('INCORRECT')}
            style={{
              background: evalFilter === 'INCORRECT' ? '#DC2626' : '#FFFFFF',
              color: evalFilter === 'INCORRECT' ? '#FFFFFF' : '#B91C1C',
              border: '1.5px solid ' + (evalFilter === 'INCORRECT' ? '#DC2626' : '#FECACA'),
              padding: '10px 20px',
              borderRadius: '25px',
              fontWeight: '800',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: evalFilter === 'INCORRECT' ? '0 4px 12px rgba(220, 38, 38, 0.2)' : 'none',
            }}
          >
            ❌ {isHi ? 'गलत / छूटे उत्तर' : 'Incorrect / Skipped'} ({incorrectCount})
          </button>
        </div>

        {/* QUESTIONS EVALUATION CARDS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          {filteredResponses.length === 0 ? (
            <div style={{ background: '#FFFFFF', padding: '40px', borderRadius: '32px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>
              {isHi ? 'इस फ़िल्टर के तहत कोई प्रश्न नहीं है।' : 'No questions found for this filter.'}
            </div>
          ) : (
            filteredResponses.map((item, idx) => {
              const opts = item.options || [];
              const explanation = item.explanation || '';

              return (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '32px',
                    padding: '28px 32px',
                    border: item.isCorrect ? '1.5px solid #86EFAC' : '1.5px solid #FCA5A5',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* QUESTION HEADER BADGE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a1a', background: 'rgba(24, 21, 18, 0.1)', padding: '4px 12px', borderRadius: '15px' }}>
                      Question #{item.questionId}
                    </span>

                    {item.isCorrect ? (
                      <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', fontWeight: '900', fontSize: '12.5px', padding: '5px 14px', borderRadius: '32px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        ✓ {isHi ? 'सही उत्तर (+1 अंक)' : 'Correct (+1 Point)'}
                      </span>
                    ) : item.selectedOption === -1 ? (
                      <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', fontWeight: '900', fontSize: '12.5px', padding: '5px 14px', borderRadius: '32px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        ⚠️ {isHi ? 'उत्तर नहीं दिया (0 अंक)' : 'Skipped / Unanswered (0 Points)'}
                      </span>
                    ) : (
                      <span style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', fontWeight: '900', fontSize: '12.5px', padding: '5px 14px', borderRadius: '32px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        ✗ {isHi ? 'गलत उत्तर (0 अंक)' : 'Incorrect Answer (0 Points)'}
                      </span>
                    )}
                  </div>

                  {/* QUESTION TEXT */}
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '20px', lineHeight: '1.45' }}>
                    {item.questionText}
                  </h3>

                  {/* OPTIONS DISPLAY */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {opts.map((optText, optIdx) => {
                      const isCorrectOpt = optIdx === item.correctOption;
                      const isSelectedOpt = optIdx === item.selectedOption;

                      let optBg = '#EFEAE5';
                      let optBorder = 'rgba(17, 24, 39, 0.06)';
                      let optColor = '#374151';
                      let badgeText = null;
                      let badgeBg = null;
                      let badgeColor = null;

                      if (isCorrectOpt) {
                        optBg = '#F0FDF4';
                        optBorder = '#16A34A';
                        optColor = '#14532D';
                        badgeText = isSelectedOpt ? (isHi ? '✓ आपका उत्तर (सही)' : '✓ Your Answer (Correct)') : (isHi ? '✓ सही उत्तर' : '✓ Correct Answer');
                        badgeBg = '#DCFCE7';
                        badgeColor = '#15803D';
                      } else if (isSelectedOpt && !isCorrectOpt) {
                        optBg = '#FEF2F2';
                        optBorder = '#EF4444';
                        optColor = '#7F1D1D';
                        badgeText = isHi ? '✗ आपका चुना हुआ उत्तर (गलत)' : '✗ Your Selected Choice (Incorrect)';
                        badgeBg = '#FEE2E2';
                        badgeColor = '#B91C1C';
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '10px',
                            border: `1.5px solid ${optBorder}`,
                            background: optBg,
                            color: optColor,
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            fontSize: '14.5px',
                            fontWeight: isCorrectOpt || isSelectedOpt ? '700' : '500',
                          }}
                        >
                          <span>{optText}</span>
                          {badgeText && (
                            <span style={{ background: badgeBg, color: badgeColor, fontSize: '11.5px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', flexShrink: 0, marginLeft: '10px' }}>
                              {badgeText}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* WHY IS IT CORRECT / EXPLANATION BOX */}
                  <div
                    style={{
                      background: 'var(--color-sand-50, #FBF8F3)',
                      border: '1.5px solid #000000',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#111827',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: '#1a1a1a', marginBottom: '6px' }}>
                      <span>💡</span>
                      <span>{isHi ? 'यह उत्तर क्यों सही है? (कारण और व्याख्या)' : 'Why is this the correct answer? (Explanation)'}</span>
                    </div>
                    <div style={{ color: '#374151', fontWeight: '500' }}>
                      {explanation || (isHi ? 'व्याख्या उपलब्ध है।' : 'Explanation is available.')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM ACTIONS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px 28px', borderRadius: '32px', border: '1.5px solid rgba(24, 21, 18, 0.2)', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => setExamState('RESULT')}
            style={{
              background: '#FFFFFF',
              color: '#111827',
              border: '1.5px solid rgba(17, 24, 39, 0.08)',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            ← {isHi ? 'परिणाम सारांश पर वापस जाएं' : 'Back to Result Summary'}
          </button>

          <button
            onClick={() => setExamState('INSTRUCTIONS')}
            style={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(24, 21, 18, 0.3)',
            }}
          >
            🔄 {isHi ? 'पुनः परीक्षा दें' : 'Retake Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
