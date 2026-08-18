import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { supabase } from '../../utils/supabase';
import {
  getCoursesFromStorage,
  saveCoursesToStorage,
  fetchCoursesFromSupabase,
  saveCourseToSupabase,
  deleteCourseFromSupabase,
  getProgramsFromStorage,
  saveProgramsToStorage,
  fetchProgramsFromSupabase,
  saveProgramToSupabase,
  saveProgramModulesToSupabase,
  deleteProgramFromSupabase,
  getLiveClassesFromStorage,
  saveLiveClassesToStorage,
  fetchLiveClassesFromSupabase,
  saveLiveClassToSupabase,
  deleteLiveClassFromSupabase,
  getMasterclassQuestionsFromStorage,
  saveMasterclassQuestionsToStorage,
  fetchMasterclassQuestionsFromSupabase,
  seedDefaultQuestionsToSupabase,
  saveMasterclassQuestionToSupabase,
  deleteMasterclassQuestionFromSupabase,
  deleteAllMasterclassQuestionsFromSupabase,
  parseQuestionsCSV,
  downloadSampleQuestionsCSV,
  uploadMasterclassQuestionsCSVToSupabase,
  getQuestionsForLiveClass,
  saveQuestionsForLiveClass,
  defaultMasterclassQuestions,
  getTagColorClass,
  getSessionEndedStatus,
  calculate24hExpirationTimeLeft,
  fetchAllMasterclassEnrollmentsFromSupabase,
  fetchAllOfficerProgramEnrollmentsFromSupabase,
  fetchAllOfficerProgramProgressFromSupabase,
  getUserCourseProgress,
  defaultPrograms,
} from '../../utils/coursesStorage';
import { getBlogsFromStorage, saveBlogsToStorage, fetchBlogsFromSupabase, saveBlogToSupabase, deleteBlogFromSupabase } from '../../utils/blogsStorage';
import { getPhonePeSettings, savePhonePeSettings } from '../../utils/phonepePayment';
import { useToast } from '../../context/ToastContext';
import {
  getExamSubmissions,
  fetchExamSubmissionsFromSupabase,
  approveExamCertificate,
  approveAllExamCertificates,
  approveAllExamCertificatesForMasterclass,
  getExamDateFolders,
  getExamSubmissionsByDate,
  getOverallQuestionAnalytics,
  deleteExamSubmission,
  clearAllExamSubmissions,
  getCertificateSignatories,
  setCertificateSignatories,
  getCleanCourseTitle,
  getExamLevelBadge
} from '../../utils/examStorage';
import styles from './Admin.module.css';
import CertificateModal from '../../components/CertificateModal/CertificateModal';

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

const ITEMS_PER_PAGE = 10;

const emptyCourseTemplate = {
  id: '',
  type: 'course',
  tags: [{ cls: 'tb', label: 'WORKSHOP' }, { cls: 'to', label: 'BEGINNER' }],
  title: '',
  titleHi: '',
  desc: '',
  descHi: '',
  bullets: [],
  bulletsHi: [],
  footer: ['Duration: 1 Day', 'For: All officers', 'Format: Hybrid'],
  isComingSoon: false,
  curtainBadge: 'COMING SOON',
  curtainBadgeHi: 'जल्द आ रहा है',
  curtainSub: 'Special program for Bihar Govt Officers.',
  curtainSubHi: 'बिहार सरकार के अधिकारियों के लिए विशेष कार्यक्रम।',
  curtainTag: 'Registration Opens Soon',
  curtainTagHi: 'पंजीकरण जल्द शुरू होगा',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' | 'courses' | 'programs'

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Courses & Programs CRUD State
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // course/program object being edited
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Live Masterclass Sub-tab & Question Bank State
  const [masterclassSubTab, setMasterclassSubTab] = useState('classes'); // 'classes' | 'certification_test' | 'certificate_issue' | 'users_enrollment'
  const [selectedClassIdForExam, setSelectedClassIdForExam] = useState('');
  const [certSelectedMasterclass, setCertSelectedMasterclass] = useState('ALL');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [masterclassQuestions, setMasterclassQuestions] = useState([]);
  const [pendingCSVQuestions, setPendingCSVQuestions] = useState([]);
  const [isSavingCSV, setIsSavingCSV] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Officer Programs Sub-tab State
  const [officerSubTab, setOfficerSubTab] = useState('manage'); // 'manage' | 'syllabus' | 'certification_test' | 'certificate_issue' | 'users_enrollment'
  const [selectedOfficerProgForSyllabus, setSelectedOfficerProgForSyllabus] = useState('prog-1');
  const [selectedOfficerProgForExam, setSelectedOfficerProgForExam] = useState('ai-fundamentals');
  const [officerQuestions, setOfficerQuestions] = useState([]);
  const [editingProgramModules, setEditingProgramModules] = useState([]);

  // Enrollment Management State
  const [masterclassEnrollments, setMasterclassEnrollments] = useState([]);
  const [officerEnrollments, setOfficerEnrollments] = useState([]);
  const [officerProgressList, setOfficerProgressList] = useState([]);
  const [masterclassEnrollFilter, setMasterclassEnrollFilter] = useState('ALL');
  const [officerEnrollFilter, setOfficerEnrollFilter] = useState('ALL');
  const [enrollSearchQuery, setEnrollSearchQuery] = useState('');

  // Live Classes Modal State
  const [editingLiveClass, setEditingLiveClass] = useState(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

  // Blog Posts Management State
  const [blogs, setBlogs] = useState([]);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Exam Submissions & Date Folder Analytics State
  const [examSubmissions, setExamSubmissions] = useState([]);
  const [selectedDateFolder, setSelectedDateFolder] = useState('ALL');
  const [examSubMode, setExamSubMode] = useState('candidates'); // 'candidates' | 'analytics'
  const [examSortFilter, setExamSortFilter] = useState('ALL'); // 'ALL' | 'FAILED' | 'VIOLATED' | 'BEST_SCORERS' | 'TOP_10'
  const [dateFoldersList, setDateFoldersList] = useState([]);
  const [selectedCertSub, setSelectedCertSub] = useState(null);

  // Certificate Signatory Names (Programme Director & Academic Registrar)
  const [directorName, setDirectorName] = useState('');
  const [registrarName, setRegistrarName] = useState('');

  // Custom Confirmation Modal Dialog State (Replaces native browser window.confirm)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const requestConfirmation = (title, message, actionFn) => {
    setConfirmModal({
      isOpen: true,
      title: title || 'Confirm Action',
      message: message || 'Are you sure you want to perform this action?',
      onConfirm: actionFn,
    });
  };

  const [tagsInputText, setTagsInputText] = useState('');
  const [bulletsText, setBulletsText] = useState('');
  const [bulletsHiText, setBulletsHiText] = useState('');
  const [footerText, setFooterText] = useState('');
  const csvFileInputRef = React.useRef(null);

  // PhonePe PG & Merchant UPI Config State
  const [phonePeConfig, setPhonePeConfig] = useState(() => getPhonePeSettings());
  const [isPhonePeSettingsOpen, setIsPhonePeSettingsOpen] = useState(false);

  const handleSavePhonePeConfig = (e) => {
    e.preventDefault();
    savePhonePeSettings(phonePeConfig);
    toast.success('PhonePe Merchant Settings saved successfully!');
    setIsPhonePeSettingsOpen(false);
  };

  const toast = useToast();
  const loadEnrollmentsData = async () => {
    try {
      const [mcEnr, offEnr, offProg] = await Promise.all([
        fetchAllMasterclassEnrollmentsFromSupabase(),
        fetchAllOfficerProgramEnrollmentsFromSupabase(),
        fetchAllOfficerProgramProgressFromSupabase()
      ]);
      setMasterclassEnrollments(mcEnr || []);
      setOfficerEnrollments(offEnr || []);
      setOfficerProgressList(offProg || []);
    } catch (err) {
      console.warn('Error loading enrollments:', err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
    loadCoursesAndPrograms();
    loadExamSubmissions();
    loadSignatories();
    loadEnrollmentsData();

    const handleExamUpdate = () => loadExamSubmissions();
    const handleLiveClassUpdate = () => setLiveClasses(getLiveClassesFromStorage());
    const handleQuestionsUpdate = () => setMasterclassQuestions(getMasterclassQuestionsFromStorage());
    const handleBlogsUpdate = () => setBlogs(getBlogsFromStorage());
    const handleProgressUpdate = () => loadEnrollmentsData();

    window.addEventListener('bihar_ai_exams_updated', handleExamUpdate);
    window.addEventListener('bihar_ai_live_classes_updated', handleLiveClassUpdate);
    window.addEventListener('bihar_ai_masterclass_questions_updated', handleQuestionsUpdate);
    window.addEventListener('bihar_ai_blogs_updated', handleBlogsUpdate);
    window.addEventListener('bihar_ai_progress_updated', handleProgressUpdate);

    return () => {
      window.removeEventListener('bihar_ai_exams_updated', handleExamUpdate);
      window.removeEventListener('bihar_ai_live_classes_updated', handleLiveClassUpdate);
      window.removeEventListener('bihar_ai_masterclass_questions_updated', handleQuestionsUpdate);
      window.removeEventListener('bihar_ai_blogs_updated', handleBlogsUpdate);
      window.removeEventListener('bihar_ai_progress_updated', handleProgressUpdate);
    };
    // eslint-disable-next-line
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (selectedClassIdForExam) {
      const localQs = getQuestionsForLiveClass(selectedClassIdForExam);
      setMasterclassQuestions(localQs || []);
      fetchMasterclassQuestionsFromSupabase(selectedClassIdForExam).then((qs) => {
        if (qs) setMasterclassQuestions(qs);
      }).catch(() => {});
    } else {
      setMasterclassQuestions([]);
    }
  }, [selectedClassIdForExam]);

  useEffect(() => {
    if (selectedOfficerProgForExam) {
      const localQs = getQuestionsForLiveClass(selectedOfficerProgForExam);
      setOfficerQuestions(localQs || []);
      fetchMasterclassQuestionsFromSupabase(selectedOfficerProgForExam).then((qs) => {
        if (Array.isArray(qs) && qs.length > 0) setOfficerQuestions(qs);
      }).catch(() => {});
    } else {
      setOfficerQuestions([]);
    }
  }, [selectedOfficerProgForExam]);

  useEffect(() => {
    if (selectedOfficerProgForSyllabus && programs.length > 0) {
      const match = programs.find((p) => p.id === selectedOfficerProgForSyllabus);
      if (match && Array.isArray(match.customModules) && match.customModules.length > 0) {
        setEditingProgramModules(match.customModules);
      } else if (match && Array.isArray(match.custom_modules) && match.custom_modules.length > 0) {
        setEditingProgramModules(match.custom_modules);
      } else {
        setEditingProgramModules([
          { id: 'mod-1', title: 'Module 1: AI Concepts & Workflow', description: 'Introduction to GenAI tools, prompt frameworks, and administrative automation.', resourceLink: '', classLink: '', materialUrl: '' },
          { id: 'mod-2', title: 'Module 2: Governance Prompt Engineering', description: 'Anatomy of effective prompts, bilingual translation & circular drafting.', resourceLink: '', classLink: '', materialUrl: '' },
          { id: 'mod-3', title: 'Module 3: Ethics, Privacy & DPDP Compliance', description: 'Understanding hallucinations, data security & DPDP Act 2023 guidelines.', resourceLink: '', classLink: '', materialUrl: '' }
        ]);
      }
    }
  }, [selectedOfficerProgForSyllabus, programs]);

  const loadSignatories = async () => {
    try {
      const remote = await fetchCertificateSignatoriesFromSupabase();
      if (remote) {
        setDirectorName(remote.director || '');
        setRegistrarName(remote.registrar || '');
        return;
      }
    } catch (e) {}
    const saved = getCertificateSignatories();
    setDirectorName(saved.director || '');
    setRegistrarName(saved.registrar || '');
  };

  const handleSaveSignatories = async () => {
    const res = await setCertificateSignatories(directorName, registrarName);
    if (res && res.success === false) {
      toast.error(`Database error: ${res.error || 'Failed to save signatories'}`);
    } else {
      toast.success('Certificate signatories saved successfully to database!');
    }
  };

  const loadCoursesAndPrograms = async () => {
    setCourses(getCoursesFromStorage());
    setPrograms(getProgramsFromStorage());
    setBlogs(getBlogsFromStorage());
    const liveList = getLiveClassesFromStorage();
    setLiveClasses(liveList);
    if (liveList.length === 0) {
      setSelectedClassIdForExam('');
      setMasterclassQuestions([]);
    } else if (!selectedClassIdForExam || !liveList.some(l => String(l.id) === String(selectedClassIdForExam))) {
      setSelectedClassIdForExam(liveList[0].id);
    }

    try {
      const remoteProgs = await fetchProgramsFromSupabase();
      if (Array.isArray(remoteProgs) && remoteProgs.length > 0) {
        setPrograms(remoteProgs);
      }
    } catch (e) {}

    try {
      const remoteLive = await fetchLiveClassesFromSupabase();
      if (Array.isArray(remoteLive)) {
        setLiveClasses(remoteLive);
        if (remoteLive.length === 0) {
          setSelectedClassIdForExam('');
          setMasterclassQuestions([]);
        } else if (!selectedClassIdForExam || !remoteLive.some(l => String(l.id) === String(selectedClassIdForExam))) {
          setSelectedClassIdForExam(remoteLive[0].id);
        }
      }
    } catch (e) {}
  };

  const handleSeedProgramsToSupabase = async () => {
    try {
      toast.info('⚡ Syncing Foundational AI Programs & Real Resources to Supabase Backend...');
      for (const prog of defaultPrograms) {
        await saveProgramToSupabase(prog);
        if (Array.isArray(prog.customModules) && prog.customModules.length > 0) {
          await saveProgramModulesToSupabase(prog.id, prog.customModules);
        }
      }
      await loadCoursesAndPrograms();
      toast.success('🎉 Successfully saved all Officer AI Programs & Resources to Supabase Backend DB!');
    } catch (err) {
      console.error(err);
      toast.error('Error syncing programs to Supabase.');
    }
  };

  const loadExamSubmissions = async () => {
    const list = await fetchExamSubmissionsFromSupabase();
    setExamSubmissions(list || getExamSubmissions());
    setDateFoldersList(getExamDateFolders());
  };

  const getLocalSubmissions = () => {
    try {
      return JSON.parse(localStorage.getItem('bihar_ai_submissions') || '[]');
    } catch {
      return [];
    }
  };

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    let allRemoteRecords = [];
    try {
      const { data, error } = await supabase.from('user_details').select('*');
      if (!error && Array.isArray(data)) {
        allRemoteRecords = data;
      }
    } catch (err) {
      console.warn('Stats fetch info:', err);
    }

    const localList = getLocalSubmissions();
    const map = new Map();
    [...allRemoteRecords, ...localList].forEach((item) => {
      const key = (item.email || item.id || '').toLowerCase().trim();
      if (key && !map.has(key)) map.set(key, item);
    });

    const allRecords = Array.from(map.values());
    const todayRecords = allRecords.filter(s => s.created_at && s.created_at.startsWith(today));

    setStats({
      total: allRecords.length,
      today: todayRecords.length,
    });
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    let allRemoteRecords = [];

    try {
      const { data, error } = await supabase.from('user_details').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        allRemoteRecords = data;
      }
    } catch (err) {
      console.warn('Submissions fetch info:', err);
    }

    const localList = getLocalSubmissions();
    const map = new Map();

    allRemoteRecords.forEach((item) => {
      const key = (item.email || item.id || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, item);
      }
    });

    localList.forEach((item) => {
      const key = (item.email || item.id || '').toLowerCase().trim();
      if (key && !map.has(key)) {
        map.set(key, item);
      }
    });

    const mergedSubmissions = Array.from(map.values());
    mergedSubmissions.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));

    setSubmissions(mergedSubmissions);
    setTotalItems(mergedSubmissions.length);
    setLoading(false);
  };

  const handleDeleteSubmission = (sub) => {
    const candidateIdentifier = sub.full_name || sub.email || 'this candidate';
    requestConfirmation(
      'Delete Candidate Application',
      `Are you sure you want to delete the application/inquiry for "${candidateIdentifier}"? This will delete the record permanently from the database.`,
      async () => {
        try {
          // 1. Delete from Supabase tables and auth.users via RPC cleanly using try/catch blocks
          if (sub.email) {
            const cleanEmail = sub.email.toLowerCase().trim();
            try { await supabase.rpc('delete_user_by_admin', { email_input: cleanEmail }); } catch (rpcErr) { console.warn('RPC delete info:', rpcErr); }
            try { await supabase.from('user_details').delete().eq('email', cleanEmail); } catch (e) {}
            try { await supabase.from('masterclass_enrollments').delete().eq('user_email', cleanEmail); } catch (e) {}
            try { await supabase.from('masterclass_exam_submissions').delete().eq('candidate_email', cleanEmail); } catch (e) {}
            try { await supabase.from('officer_program_exam_submissions').delete().eq('candidate_email', cleanEmail); } catch (e) {}
            localStorage.removeItem('bihar_ai_welcome_sent_' + cleanEmail);
          }
          if (sub.id) {
            try { await supabase.from('user_details').delete().eq('id', sub.id); } catch (e) {}
          }

          // 2. Also delete from local storage cache (`bihar_ai_submissions`)
          try {
            const localList = JSON.parse(localStorage.getItem('bihar_ai_submissions') || '[]');
            const filteredLocal = localList.filter((item) => {
              if (sub.id && item.id) return item.id !== sub.id;
              if (sub.created_at && item.created_at) return item.created_at !== sub.created_at;
              return item.email !== sub.email;
            });
            localStorage.setItem('bihar_ai_submissions', JSON.stringify(filteredLocal));
          } catch (err) {
            console.error('Local storage delete error:', err);
          }

          // 3. Purge all associated exam submissions & certificate records completely
          try {
            const allExamSubs = getExamSubmissions();
            const userEmail = sub.email ? sub.email.toLowerCase().trim() : null;
            const userName = sub.full_name ? sub.full_name.toLowerCase().trim() : null;

            allExamSubs.forEach((examSub) => {
              const examEmail = examSub.candidateEmail ? examSub.candidateEmail.toLowerCase().trim() : null;
              const examName = examSub.candidateName ? examSub.candidateName.toLowerCase().trim() : null;

              if ((userEmail && examEmail === userEmail) || (userName && examName === userName)) {
                deleteExamSubmission(examSub.credentialId || examSub.id);
              }
            });
            loadExamSubmissions();
          } catch (err) {
            console.error('Error purging associated exam submissions:', err);
          }

          if (selectedSubmission && (selectedSubmission.id === sub.id || selectedSubmission.created_at === sub.created_at)) {
            setSelectedSubmission(null);
          }

          await fetchSubmissions();
          await fetchStats();
          toast.success(`Candidate record & all associated exam certificates for "${candidateIdentifier}" deleted completely.`);
        } catch (err) {
          console.error('Error deleting submission:', err);
          toast.error('Failed to delete application. Please try again.');
        }
      }
    );
  };

  const handlePurgeAllDummyData = () => {
    requestConfirmation(
      'Purge All Test Submissions & Data',
      'Are you sure you want to purge ALL test data (inquiries, exam submissions, certificates, and enrollments) from both Supabase database and local storage? This will prepare a 100% clean production environment for real testing.',
      async () => {
        try {
          setLoading(true);

          // 1. Clear Supabase database tables
          if (supabase) {
            await supabase.from('user_details').delete().neq('email', 'keep_empty_row_sentinel');
            try { await supabase.from('masterclass_exam_submissions').delete().neq('id', 'keep_empty_row_sentinel'); } catch (e) {}
            try { await supabase.from('officer_program_exam_submissions').delete().neq('id', 'keep_empty_row_sentinel'); } catch (e) {}
            await supabase.from('masterclass_enrollments').delete().neq('id', 'keep_empty_row_sentinel');
          }

          // 2. Clear LocalStorage caches
          localStorage.removeItem('bihar_ai_submissions');
          localStorage.setItem('bihar_ai_submissions', JSON.stringify([]));

          localStorage.removeItem('bihar_ai_exam_submissions');
          localStorage.setItem('bihar_ai_exam_submissions', JSON.stringify([]));

          // Remove all enrolled keys
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('bihar_ai_enrolled_')) {
              localStorage.removeItem(key);
            }
          });

          // 3. Reset React States
          setSubmissions([]);
          setTotalItems(0);
          setExamSubmissions([]);
          setDateFoldersList([]);
          setStats({ total: 0, today: 0 });

          window.dispatchEvent(new Event('bihar_ai_exams_updated'));
          toast.success('Successfully purged all test data! Your system is now 100% clean and ready for real data testing. ✨');
        } catch (err) {
          console.error('Error purging dummy data:', err);
          toast.error('Failed to purge all test data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const exportCSV = async () => {
    try {
      const { data: itemsUD } = await supabase.from('user_details').select('*').order('created_at', { ascending: false });

      const map = new Map();
      [...(itemsUD || []), ...getLocalSubmissions()].forEach((s) => {
        const key = (s.email || s.id || '').toLowerCase().trim();
        if (key && !map.has(key)) map.set(key, s);
      });

      let list = Array.from(map.values());
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        list = list.filter(s =>
          (s.full_name && s.full_name.toLowerCase().includes(term)) ||
          (s.email && s.email.toLowerCase().includes(term)) ||
          (s.district && s.district.toLowerCase().includes(term))
        );
      }
      const headers = ['Name', 'Email', 'Phone', 'Role', 'District', 'Interests', 'Created At'];
      const rows = list.map((s) => [
        `"${s.full_name}"`,
        s.email,
        s.mobile,
        s.role_type,
        s.district,
        `"${(s.interests || []).join(', ')}"`,
        new Date(s.created_at).toLocaleString(),
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers, ...rows].map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `bihar_ai_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  // --- CRUD HANDLERS FOR COURSES & PROGRAMS ---
  const handleOpenAddModal = (type) => {
    const newItem = {
      ...emptyCourseTemplate,
      id: `${type}-${Date.now()}`,
      type: type,
      title: type === 'course' ? 'New AI Course' : 'New Officer Program',
      tags: type === 'course'
        ? [{ cls: 'tb', label: 'FOUNDATIONAL' }, { cls: 'to', label: 'BEGINNER' }]
        : [{ cls: 'tb', label: 'WORKSHOP' }, { cls: 'to', label: 'BEGINNER' }],
      curtainSub: type === 'course' ? 'Course under development for Bihar learners.' : 'Special program for Bihar Govt Officers.',
      curtainTag: type === 'course' ? 'Launch Date: Announced Soon' : 'Registration Opens Soon',
    };
    setEditingItem(newItem);
    setTagsInputText((newItem.tags || []).map((t) => t.label).join(', '));
    setBulletsText((newItem.bullets || []).join('\n'));
    setBulletsHiText((newItem.bulletsHi || []).join('\n'));
    setFooterText((newItem.footer || []).join(' · '));
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem({ ...item });
    const tagStr = item.tags && item.tags.length > 0
      ? item.tags.map((t) => t.label).join(', ')
      : item.tagLabel || '';
    setTagsInputText(tagStr);
    setBulletsText((item.bullets || []).join('\n'));
    setBulletsHiText((item.bulletsHi || []).join('\n'));
    setFooterText((item.footer || []).join(' · '));
    setIsModalOpen(true);
  };

  const handleToggleCurtain = (item) => {
    const updated = { ...item, isComingSoon: !item.isComingSoon };
    if (item.type === 'course') {
      const list = courses.map((c) => (c.id === item.id ? updated : c));
      setCourses(list);
      saveCoursesToStorage(list);
      saveCourseToSupabase(updated);
    } else {
      const list = programs.map((p) => (p.id === item.id ? updated : p));
      setPrograms(list);
      saveProgramsToStorage(list);
      saveProgramToSupabase(updated);
    }
  };

  const handleDeleteItem = (item) => {
    requestConfirmation(
      'Delete Item',
      `Are you sure you want to delete "${item.title}"?`,
      () => {
        if (item.type === 'course') {
          const list = courses.filter((c) => c.id !== item.id);
          setCourses(list);
          saveCoursesToStorage(list);
          deleteCourseFromSupabase(item.id);
        } else {
          const list = programs.filter((p) => p.id !== item.id);
          setPrograms(list);
          saveProgramsToStorage(list);
          deleteProgramFromSupabase(item.id);
        }
      }
    );
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedTags = tagsInputText
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((lbl) => ({
        label: lbl,
        cls: getTagColorClass(lbl),
      }));

    const formattedItem = {
      ...editingItem,
      tags: parsedTags.length > 0 ? parsedTags : [{ cls: 'tb', label: 'GENERAL' }],
      tagLabel: parsedTags[0]?.label || 'GENERAL',
      tagClass: parsedTags[0]?.cls || 'tb',
      bullets: bulletsText
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      bulletsHi: bulletsHiText
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      footer: footerText
        .split('·')
        .map((f) => f.trim())
        .filter(Boolean),
    };

    if (editingItem.type === 'course') {
      const exists = courses.some((c) => c.id === formattedItem.id);
      const list = exists
        ? courses.map((c) => (c.id === formattedItem.id ? formattedItem : c))
        : [...courses, formattedItem];
      setCourses(list);
      saveCoursesToStorage(list);
      saveCourseToSupabase(formattedItem);
    } else {
      const exists = programs.some((p) => p.id === formattedItem.id);
      const list = exists
        ? programs.map((p) => (p.id === formattedItem.id ? formattedItem : p))
        : [...programs, formattedItem];
      setPrograms(list);
      saveProgramsToStorage(list);
      saveProgramToSupabase(formattedItem);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const formatForDateTimeLocal = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
      return val.slice(0, 16);
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return '';
    }
  };

  const handleOpenAddLiveModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(15, 30, 0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const defaultIso = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;

    setEditingLiveClass({
      id: '',
      courseName: '',
      courseDesc: '',
      courseDuration: '1.5 Hours',
      courseInstructor: '',
      courseLanguage: 'Hindi + English (Bilingual)',
      certificateType: 'Free certification',
      platformName: 'YouTube Live',
      scheduledDateTime: defaultIso,
      scheduledTimeText: '',
      joinUrl: '',
      recordingUrl: '',
    });
    setIsLiveModalOpen(true);
  };

  const handleOpenEditLiveModal = (item) => {
    setEditingLiveClass({ ...item });
    setIsLiveModalOpen(true);
  };

  const handleSaveLiveClass = async (e) => {
    e.preventDefault();
    if (!editingLiveClass.courseName || !editingLiveClass.joinUrl) {
      toast.warning('Please fill in Course Name and Join Link.');
      return;
    }

    let savedItem = editingLiveClass;
    if (!editingLiveClass.id) {
      savedItem = {
        ...editingLiveClass,
        id: `live-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    // 1. Instantly update local state & LocalStorage so UI never reverts or flickers!
    let updatedList = [];
    if (editingLiveClass.id) {
      updatedList = liveClasses.map((item) =>
        item.id === editingLiveClass.id ? savedItem : item
      );
    } else {
      updatedList = [savedItem, ...liveClasses];
    }
    saveLiveClassesToStorage(updatedList);
    setLiveClasses(updatedList);
    setIsLiveModalOpen(false);
    setEditingLiveClass(null);

    // 2. Persist to Supabase in background
    const res = await saveLiveClassToSupabase(savedItem);
    if (res && res.error) {
      toast.error(`Supabase save warning: ${res.error.message || 'Check database connection'}`);
    } else if (res && res.fallbackUsed) {
      toast.info('🎉 Saved Live Masterclass to Supabase!');
    } else {
      toast.success('🎉 Live Masterclass saved successfully to Supabase!');
    }

    // 3. Fetch from Supabase and merge with local state so no local field is lost!
    const remote = await fetchLiveClassesFromSupabase();
    if (remote && remote.length > 0) {
      const merged = updatedList.map(localItem => {
        const remoteMatch = remote.find(r => String(r.id) === String(localItem.id));
        if (remoteMatch) {
          return {
            ...localItem,
            ...remoteMatch,
            courseName: remoteMatch.courseName || localItem.courseName,
            courseDesc: remoteMatch.courseDesc || localItem.courseDesc,
            courseDuration: remoteMatch.courseDuration || localItem.courseDuration,
            courseInstructor: remoteMatch.courseInstructor || localItem.courseInstructor,
            instructorName: remoteMatch.instructorName || localItem.instructorName,
            instructorTitle: remoteMatch.instructorTitle || localItem.instructorTitle,
            instructorImage: remoteMatch.instructorImage || localItem.instructorImage,
            joinUrl: remoteMatch.joinUrl || localItem.joinUrl,
            recordingUrl: remoteMatch.recordingUrl || localItem.recordingUrl,
            buyUrl: remoteMatch.buyUrl || localItem.buyUrl,
            certificateType: remoteMatch.certificateType || localItem.certificateType,
            scheduledDateTime: remoteMatch.scheduledDateTime || localItem.scheduledDateTime
          };
        }
        return localItem;
      });
      remote.forEach(r => {
        if (!merged.some(m => String(m.id) === String(r.id))) {
          merged.push(r);
        }
      });
      saveLiveClassesToStorage(merged);
      setLiveClasses(merged);
    }
  };

  const handleDeleteLiveClass = (id) => {
    requestConfirmation(
      'Delete Live Masterclass',
      'Are you sure you want to delete this Live Class card and all its certification questions?',
      async () => {
        const updated = liveClasses.filter((item) => String(item.id) !== String(id));
        saveLiveClassesToStorage(updated);
        setLiveClasses(updated);
        await deleteLiveClassFromSupabase(id);
        if (String(selectedClassIdForExam) === String(id)) {
          const nextId = updated.length > 0 ? updated[0].id : '';
          setSelectedClassIdForExam(nextId);
          if (!nextId) setMasterclassQuestions([]);
        }
        toast.success('Live Masterclass and its questions deleted from Supabase!');
      }
    );
  };

  const handleToggleLiveClassExam = (id) => {
    let toggledItem = null;
    const updated = liveClasses.map(item => {
      if (item.id === id) {
        toggledItem = { ...item, isExamUnlocked: !item.isExamUnlocked };
        return toggledItem;
      }
      return item;
    });
    saveLiveClassesToStorage(updated);
    setLiveClasses(updated);
    if (toggledItem) {
      saveLiveClassToSupabase(toggledItem);
    }
  };

  const handleToggleLiveClassSessionEnded = (id) => {
    let toggledItem = null;
    const updated = liveClasses.map(item => {
      if (item.id === id) {
        const nextEndedState = !item.isSessionEnded;
        const nowIso = new Date().toISOString();
        toggledItem = {
          ...item,
          isSessionEnded: nextEndedState,
          sessionEndedAt: nextEndedState ? (item.sessionEndedAt || nowIso) : null
        };
        return toggledItem;
      }
      return item;
    });
    saveLiveClassesToStorage(updated);
    setLiveClasses(updated);
    if (toggledItem) {
      saveLiveClassToSupabase(toggledItem);
    }
    if (toggledItem?.isSessionEnded) {
      toast.success('Masterclass session marked as ENDED. 24-hour video & exam access window started!');
    } else {
      toast.info('Masterclass session marked as LIVE NOW.');
    }
  };

  const handleReset24hWindow = async (id) => {
    let updatedItem = null;
    const updated = liveClasses.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, isSessionEnded: true, sessionEndedAt: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    saveLiveClassesToStorage(updated);
    setLiveClasses(updated);
    if (updatedItem) {
      await saveLiveClassToSupabase(updatedItem);
      toast.success('⏰ 24-hour recorded session & exam access timer reset successfully!');
    }
  };

  const handleSaveRecordedUrl = async (id, recordingUrl) => {
    let updatedItem = null;
    const updated = liveClasses.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, recordingUrl, recordedUrl: recordingUrl };
        return updatedItem;
      }
      return item;
    });
    saveLiveClassesToStorage(updated);
    setLiveClasses(updated);
    if (updatedItem) {
      await saveLiveClassToSupabase(updatedItem);
      toast.success('📹 Recorded Class Link saved and live on frontend!');
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion({
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q) => {
    setEditingQuestion({
      ...q,
      options: q.options ? [...q.options] : ['', '', '', '']
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestion.question || !editingQuestion.question.trim()) {
      toast.warning('Please enter Question Text.');
      return;
    }
    const targetId = selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '');
    if (!targetId) {
      toast.warning('Please create or select a Live Masterclass first.');
      return;
    }
    const currentQuestions = masterclassQuestions || [];
    const exists = currentQuestions.some((q) => String(q.id) === String(editingQuestion.id));
    let updated = [];
    if (exists) {
      updated = currentQuestions.map((q) => (String(q.id) === String(editingQuestion.id) ? editingQuestion : q));
    } else {
      updated = [...currentQuestions, editingQuestion];
    }
    saveQuestionsForLiveClass(targetId, updated);
    setMasterclassQuestions(updated);
    setIsQuestionModalOpen(false);
    await saveMasterclassQuestionToSupabase(targetId, editingQuestion);
    const refreshed = await fetchMasterclassQuestionsFromSupabase(targetId);
    if (refreshed && Array.isArray(refreshed)) {
      setMasterclassQuestions(refreshed);
    }
    toast.success('Question saved and synced to Supabase!');
  };

  const handleDeleteQuestion = (id) => {
    requestConfirmation(
      'Delete Question',
      'Are you sure you want to delete this question?',
      async () => {
        const targetId = selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '');
        if (!targetId) return;
        const currentQuestions = masterclassQuestions || [];
        const targetQ = currentQuestions.find(q => String(q.id) === String(id));
        const updated = currentQuestions.filter((q) => String(q.id) !== String(id));
        saveQuestionsForLiveClass(targetId, updated);
        setMasterclassQuestions(updated);
        if (targetQ && targetQ.dbId) {
          await deleteMasterclassQuestionFromSupabase(targetQ.dbId);
        } else {
          await deleteMasterclassQuestionFromSupabase(`q_${targetId}_${id}`);
        }
        const refreshed = await fetchMasterclassQuestionsFromSupabase(targetId);
        if (refreshed && Array.isArray(refreshed)) {
          setMasterclassQuestions(refreshed);
        }
        toast.success('Question deleted from Supabase!');
      }
    );
  };

  const handleCSVFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const targetId = selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '');
    if (!targetId) {
      toast.warning('Please create or select a Live Masterclass first before uploading questions.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsed = parseQuestionsCSV(text);
        if (!parsed || parsed.length === 0) {
          toast.error('Could not parse any valid questions from the CSV file. Please check CSV columns.');
          return;
        }

        setPendingCSVQuestions(parsed);
        toast.info(`📁 Parsed ${parsed.length} CSV questions in draft mode! Click "Save & Upload to Database" below to confirm and publish.`);
      } catch (err) {
        console.error('CSV upload error:', err);
        toast.error('Error reading CSV file. Please check file format.');
      }
      if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
  };

  const handleSavePendingCSVQuestions = () => {
    const targetId = selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '');
    if (!targetId || !pendingCSVQuestions || pendingCSVQuestions.length === 0) return;

    requestConfirmation(
      'Confirm CSV Upload & Save to Database',
      `Are you sure you want to save and upload ${pendingCSVQuestions.length} questions to the database for this Masterclass?`,
      async () => {
        try {
          setIsSavingCSV(true);
          toast.info(`☁️ Uploading ${pendingCSVQuestions.length} CSV questions to Supabase database...`);

          saveQuestionsForLiveClass(targetId, pendingCSVQuestions);
          setMasterclassQuestions(pendingCSVQuestions);

          await uploadMasterclassQuestionsCSVToSupabase(targetId, pendingCSVQuestions);
          const refreshed = await fetchMasterclassQuestionsFromSupabase(targetId);
          if (refreshed && Array.isArray(refreshed) && refreshed.length > 0) {
            setMasterclassQuestions(refreshed);
          } else {
            setMasterclassQuestions(pendingCSVQuestions);
          }

          setPendingCSVQuestions([]);
          toast.success(`🎉 Successfully uploaded & stored ${pendingCSVQuestions.length} CSV questions to Supabase database!`);
        } catch (err) {
          console.error('CSV save error:', err);
          toast.error('Failed to save CSV questions to database.');
        } finally {
          setIsSavingCSV(false);
        }
      }
    );
  };

  const handleDeleteAllQuestions = () => {
    const targetId = selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '');
    if (!targetId) {
      toast.warning('Please select a Live Masterclass first.');
      return;
    }

    requestConfirmation(
      'Delete ALL Certification Questions',
      '⚠️ Are you sure you want to delete ALL questions for this Masterclass? This will permanently delete all questions from the database for this class.',
      async () => {
        try {
          toast.info('🗑️ Deleting all questions from database...');
          saveQuestionsForLiveClass(targetId, []);
          setMasterclassQuestions([]);
          setPendingCSVQuestions([]);
          await deleteAllMasterclassQuestionsFromSupabase(targetId);
          toast.success('🎉 All questions for this masterclass have been deleted from database!');
        } catch (err) {
          console.error('Delete all questions error:', err);
          toast.error('Failed to delete questions from database.');
        }
      }
    );
  };


  // Blog CRUD Handlers
  const handleOpenAddBlog = () => {
    setEditingBlog({
      id: `blog-${Date.now()}`,
      title: '',
      category: 'Governance',
      author: 'Bihar AI Mission Editorial Desk',
      authorRole: 'AI Governance Lead',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      readTime: '4 min read',
      excerpt: '',
      content: '',
      image: '',
      isPublished: true,
      createdAt: new Date().toISOString()
    });
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlog = (blogItem) => {
    setEditingBlog({ ...blogItem });
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog.title || !editingBlog.title.trim()) {
      toast.warning('Please enter a Blog Title.');
      return;
    }
    const current = getBlogsFromStorage();
    const exists = current.some((b) => b.id === editingBlog.id);
    let updated = [];
    if (exists) {
      updated = current.map((b) => (b.id === editingBlog.id ? editingBlog : b));
    } else {
      updated = [editingBlog, ...current];
    }
    saveBlogsToStorage(updated);
    setBlogs(updated);
    setIsBlogModalOpen(false);

    const res = await saveBlogToSupabase(editingBlog);
    if (res && res.success === false) {
      toast.error(`Database error: ${res.error || 'Failed to save blog to database'}`);
    } else {
      toast.success('Blog post saved successfully to database!');
    }
  };

  const handleDeleteBlog = (id) => {
    requestConfirmation(
      'Delete Blog Post',
      'Are you sure you want to delete this blog post?',
      async () => {
        const current = getBlogsFromStorage();
        const updated = current.filter((b) => b.id !== id);
        saveBlogsToStorage(updated);
        setBlogs(updated);

        const res = await deleteBlogFromSupabase(id);
        if (res && res.success === false) {
          toast.error(`Database error: ${res.error || 'Failed to delete blog from database'}`);
        } else {
          toast.success('Blog post deleted successfully from database!');
        }
      }
    );
  };

  const handleToggleBlogPublish = async (id) => {
    const current = getBlogsFromStorage();
    let updatedBlog = null;
    const updated = current.map((b) => {
      if (b.id === id) {
        updatedBlog = { ...b, isPublished: !b.isPublished };
        return updatedBlog;
      }
      return b;
    });
    saveBlogsToStorage(updated);
    setBlogs(updated);

    if (updatedBlog) {
      const res = await saveBlogToSupabase(updatedBlog);
      if (res && res.success === false) {
        toast.error(`Database error: ${res.error || 'Failed to update blog publish status'}`);
      } else {
        toast.success(`Blog post is now ${updatedBlog.isPublished ? 'Published' : 'Draft'}!`);
      }
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning('Image size exceeds 5MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBlog((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const InfoItem = ({ label, value, fullWidth = false }) => (
    <div className={`${styles.infoItem} ${fullWidth ? styles.fullWidth : ''}`}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || '--'}</span>
    </div>
  );

  return (
    <div className={styles.adminContainer}>
      <header className={styles.dashboardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/bi_logo.png"
            alt="Bihar AI Mission Logo"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' }}>
            Bihar AI Mission{' '}
            <span style={{ color: '#000000', fontWeight: '600', fontSize: '14px', marginLeft: '4px' }}>
              Admin Portal
            </span>
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(24, 21, 18, 0.4)',
              color: '#000000',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Website ↗
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className={styles.dashboardMain}>
        {/* RECENT EXAMS PASSED CERTIFICATE ISSUANCE ALERT BANNER */}
        {(() => {
          const allSubs = getExamSubmissions();
          const pendingAlerts = allSubs.filter((s) => s.isPassed && !s.isApproved);
          if (pendingAlerts.length === 0 || alertDismissed) return null;

          const firstPending = pendingAlerts[0];
          const courseTitle = firstPending.masterclassTitle || firstPending.examTitle || 'Live Masterclass';

          return (
            <div
              style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                borderRadius: '32px',
                padding: '18px 24px',
                marginBottom: '24px',
                boxShadow: '0 10px 30px rgba(24, 21, 18, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                border: '2px solid #000000'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                <div style={{ fontSize: '28px' }}>🔔</div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '900', color: '#111827' }}>
                    Candidate Certification Alert — Action Required!
                  </h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(17, 24, 39, 0.06)', lineHeight: '1.4' }}>
                    <strong>{pendingAlerts.length} candidate(s)</strong> have recently passed the certification exam for <strong>{courseTitle}</strong>. Please generate their credentials to unlock certificates on their dashboard.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setActiveTab('live_classes');
                    setMasterclassSubTab('certificate_issue');
                    setCertSelectedMasterclass(String(firstPending.masterclassId || firstPending.examId || 'ALL'));
                  }}
                  style={{
                    background: '#000000',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(193, 85, 44, 0.3)'
                  }}
                >
                  🎓 View Results & Generate Certificates →
                </button>
                <button
                  onClick={() => setAlertDismissed(true)}
                  title="Close Alert Notification"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    fontWeight: '900',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })()}
        {/* Responsive Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '24px',
            borderBottom: '2px solid rgba(24, 21, 18, 0.2)',
            paddingBottom: '12px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            onClick={() => setActiveTab('inquiries')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: '1.5px solid #000000',
              background: activeTab === 'inquiries' ? '#000000' : '#FFFFFF',
              color: activeTab === 'inquiries' ? '#FFFFFF' : '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📋 Applications & Inquiries ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('live_classes')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: '1.5px solid #000000',
              background: activeTab === 'live_classes' ? '#000000' : '#FFFFFF',
              color: activeTab === 'live_classes' ? '#FFFFFF' : '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Live master class ({liveClasses.length})
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: '1.5px solid #000000',
              background: activeTab === 'programs' ? '#000000' : '#FFFFFF',
              color: activeTab === 'programs' ? '#FFFFFF' : '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🏛️ Programs for Bihar's Officers ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: '1.5px solid #000000',
              background: activeTab === 'exams' ? '#000000' : '#FFFFFF',
              color: activeTab === 'exams' ? '#FFFFFF' : '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📜 Exams & Certificate Approvals ({examSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              border: '1.5px solid #000000',
              background: activeTab === 'blogs' ? '#000000' : '#FFFFFF',
              color: activeTab === 'blogs' ? '#FFFFFF' : '#111827',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📝 Blog Posts ({blogs.length})
          </button>
        </div>

        {/* TAB 1: INQUIRIES & APPLICATIONS */}
        {activeTab === 'inquiries' && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Submissions</span>
                <span className={styles.statValue}>{stats.total}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>New Today</span>
                <span className={styles.statValue}>{stats.today}</span>
              </div>
              <div className={styles.statCard} style={{ borderLeft: '4px solid #000000' }}>
                <span className={styles.statLabel}>System Status</span>
                <span className={styles.statValue} style={{ fontSize: '18px', color: '#000000' }}>
                  Active & Syncing
                </span>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div className={styles.searchWrapper}>
                  <svg
                    className={styles.searchIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={exportCSV}
                    className={styles.pageBtn}
                    style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={handlePurgeAllDummyData}
                    style={{
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FCA5A5',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.12)'
                    }}
                    title="Purge all test data to start fresh for production testing"
                  >
                    🧹 Purge All Test Data
                  </button>
                </div>
              </div>

              <div className={styles.scrollArea}>
                {loading ? (
                  <div style={{ padding: '80px', textAlign: 'center', color: '#6B7280' }}>
                    Loading submissions...
                  </div>
                ) : submissions.length === 0 ? (
                  <div className={styles.emptyState}>No submissions found.</div>
                ) : (
                  <>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>District</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((s) => (
                          <tr key={s.id || s.created_at}>
                            <td style={{ fontWeight: '600' }}>{s.full_name}</td>
                            <td>{s.email}</td>
                            <td>
                              <span
                                className={`${styles.roleBadge} ${
                                  s.role_type === 'Government Officer'
                                    ? styles.roleGov
                                    : s.role_type === 'Student'
                                    ? styles.roleStudent
                                    : styles.roleDefault
                                }`}
                              >
                                {s.role_type}
                              </span>
                            </td>
                            <td>{s.district}</td>
                            <td style={{ color: '#6B7280' }}>
                              {new Date(s.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  className={styles.viewBtn}
                                  onClick={() => setSelectedSubmission(s)}
                                  title="View Details"
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => handleDeleteSubmission(s)}
                                  style={{
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    border: '1px solid #FCA5A5',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.2s ease'
                                  }}
                                  title="Delete Application / Inquiry from Database"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className={styles.paginationFooter}>
                      <div className={styles.pageInfo}>
                        Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{' '}
                        <strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> of{' '}
                        <strong>{totalItems}</strong>
                      </div>
                      <div className={styles.paginationActions}>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Prev
                        </button>
                        <button
                          className={styles.pageBtn}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}



        {/* TAB FOR LIVE MASTER CLASS & CERTIFICATION TEST MANAGEMENT */}
        {activeTab === 'live_classes' && (
          <div>
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>
                  🎓 Manage Live Master Class & Certification Test
                </h3>
                <p style={{ color: '#6B7280', fontSize: '13.5px', margin: '4px 0 0 0' }}>
                  Manage live session video conferencing cards and customize the 30-question Masterclass Certification Exam.
                </p>
              </div>
            </div>

            {/* SUB-TABS: Live classes vs Certification test vs Certificate Issue */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid rgba(17, 24, 39, 0.06)', paddingBottom: '2px' }}>
              <button
                onClick={() => setMasterclassSubTab('classes')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  borderBottom: masterclassSubTab === 'classes' ? '3px solid #000000' : '3px solid transparent',
                  background: masterclassSubTab === 'classes' ? 'rgba(24, 21, 18, 0.1)' : 'transparent',
                  color: masterclassSubTab === 'classes' ? '#000000' : '#9CA3AF',
                  cursor: 'pointer'
                }}
              >
                📡 Live classes ({liveClasses.length})
              </button>
              <button
                onClick={() => setMasterclassSubTab('certification_test')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  borderBottom: masterclassSubTab === 'certification_test' ? '3px solid #000000' : '3px solid transparent',
                  background: masterclassSubTab === 'certification_test' ? 'rgba(24, 21, 18, 0.1)' : 'transparent',
                  color: masterclassSubTab === 'certification_test' ? '#000000' : '#9CA3AF',
                  cursor: 'pointer'
                }}
              >
                📜 Certification test ({masterclassQuestions.length} Questions)
              </button>
              <button
                onClick={() => setMasterclassSubTab('certificate_issue')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  borderBottom: masterclassSubTab === 'certificate_issue' ? '3px solid #000000' : '3px solid transparent',
                  background: masterclassSubTab === 'certificate_issue' ? 'rgba(24, 21, 18, 0.1)' : 'transparent',
                  color: masterclassSubTab === 'certificate_issue' ? '#000000' : '#9CA3AF',
                  cursor: 'pointer'
                }}
              >
                🎓 Certificate Issue & Exam Results ({(() => {
                  const raw = getExamSubmissions();
                  const map = new Map();
                  raw.forEach(s => {
                    const k = `${(s.candidateEmail||s.email||'').toLowerCase().trim()}___${(s.masterclassTitle||s.examTitle||'').toLowerCase().trim()}`;
                    if (!map.has(k)) map.set(k, true);
                  });
                  return map.size;
                })()})
              </button>
              <button
                onClick={() => setMasterclassSubTab('users_enrollment')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: '800',
                  fontSize: '14px',
                  border: 'none',
                  borderBottom: masterclassSubTab === 'users_enrollment' ? '3px solid #000000' : '3px solid transparent',
                  background: masterclassSubTab === 'users_enrollment' ? 'rgba(24, 21, 18, 0.1)' : 'transparent',
                  color: masterclassSubTab === 'users_enrollment' ? '#000000' : '#9CA3AF',
                  cursor: 'pointer'
                }}
              >
                👥 Users Enrollment ({masterclassEnrollments.length})
              </button>
            </div>

            {/* SUB-TAB 1: LIVE CLASSES */}
            {masterclassSubTab === 'classes' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #5F259F 0%, #461A76 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(95, 37, 159, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => setIsPhonePeSettingsOpen(true)}
                  >
                    <span>🟣 PhonePe Gateway Settings</span>
                  </button>
                  <button
                    className={styles.submitBtn}
                    style={{ width: 'auto', padding: '10px 18px' }}
                    onClick={handleOpenAddLiveModal}
                  >
                    + Add New Live Class
                  </button>
                </div>

                {liveClasses.length === 0 ? (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '2px dashed #000000',
                      padding: '40px 24px',
                      textAlign: 'center',
                      marginTop: '12px',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📡</div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
                      No Custom Live Class Cards Created Yet
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '550px', margin: '0 auto 18px' }}>
                      The front-end is currently displaying the default fallback Live Class banner. Click below to add your first live class card!
                    </p>
                    <button
                      className={styles.submitBtn}
                      style={{ width: 'auto', padding: '10px 20px', margin: '0 auto' }}
                      onClick={handleOpenAddLiveModal}
                    >
                      + Add New Live Class
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '20px',
                    }}
                  >
                    {liveClasses.map((item) => {
                      const recordingUrl = item.recordingUrl || item.recordedUrl || '';
                      return (
                        <div
                          key={item.id}
                          style={{
                            background: '#FFFFFF',
                            border: item.isSessionEnded ? '1.5px solid rgba(17, 24, 39, 0.08)' : '1.5px solid #111827',
                            borderRadius: '32px',
                            padding: '22px',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Top Accent Strip */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: item.isSessionEnded
                                ? 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 100%)'
                                : 'linear-gradient(90deg, #EF4444 0%, #F59E0B 100%)',
                            }}
                          />

                          <div>
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '32px',
                                    fontSize: '11.5px',
                                    fontWeight: '800',
                                    background: item.isSessionEnded ? 'rgba(100, 116, 139, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: item.isSessionEnded ? '#6B7280' : '#DC2626',
                                    border: item.isSessionEnded ? '1px solid #9CA3AF' : '1px solid #FCA5A5',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                  }}
                                >
                                  {item.isSessionEnded ? '⏹️ SESSION ENDED' : '🔴 LIVE CLASS CARD'}
                                </span>
                                {item.isSessionEnded && (
                                  <span
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '32px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      background: recordingUrl ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                      color: recordingUrl ? '#059669' : '#D97706',
                                      border: recordingUrl ? '1px solid #6EE7B7' : '1px solid #FDE68A',
                                    }}
                                  >
                                    {recordingUrl ? '📹 RECORDED LINK READY' : '⚠️ RECORDING LINK MISSING'}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', background: '#EFEAE5', padding: '3px 8px', borderRadius: '6px' }}>
                                ID: {item.id}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '6px', lineHeight: '1.3' }}>
                              {item.courseName}
                            </h4>
                            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5', marginBottom: '16px' }}>
                              {item.courseDesc || 'No course description provided.'}
                            </p>

                            {/* Info Box */}
                            <div
                              style={{
                                fontSize: '12.5px',
                                color: '#374151',
                                background: '#EFEAE5',
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(17, 24, 39, 0.06)',
                                marginBottom: '16px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '10px 16px',
                              }}
                            >
                              <div><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Duration:</span> <strong style={{ color: '#111827' }}>{item.courseDuration || '--'}</strong></div>
                              <div><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Instructor:</span> <strong style={{ color: '#111827' }}>{item.courseInstructor || '--'}</strong></div>
                              <div><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Language:</span> <strong style={{ color: '#111827' }}>{item.courseLanguage || 'Bilingual'}</strong></div>
                              <div><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Certification:</span> <strong style={{ color: '#000000' }}>{item.certificateType || 'Free'}</strong></div>
                              <div><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Platform:</span> <strong style={{ color: '#111827' }}>{item.platformName || 'YouTube Live'}</strong></div>
                              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#9CA3AF', fontWeight: '600' }}>Scheduled:</span> <strong style={{ color: '#111827' }}>{item.scheduledDateTime ? new Date(item.scheduledDateTime).toLocaleString() : item.scheduledTimeText || '--'}</strong></div>
                              <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}>
                                <span style={{ color: '#9CA3AF', fontWeight: '600' }}>Live Join Link:</span>{' '}
                                <a href={item.joinUrl} target="_blank" rel="noreferrer" style={{ color: '#000000', fontWeight: '700', textDecoration: 'underline' }}>
                                  {item.joinUrl || 'Not set'}
                                </a>
                              </div>
                            </div>

                            {/* RECORDED CLASS LINK SECTION */}
                            <div
                              style={{
                                background: item.isSessionEnded ? '#FFFBEB' : 'var(--color-sand-50, #FBF8F3)',
                                border: item.isSessionEnded ? '1.5px solid #FCD34D' : '1px solid rgba(17, 24, 39, 0.06)',
                                padding: '14px',
                                borderRadius: '12px',
                                marginBottom: '16px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ fontSize: '12.5px', fontWeight: '800', color: item.isSessionEnded ? '#92400E' : 'var(--color-charcoal-900, #181512)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📹 Recorded Class Video Link</span>
                                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#9CA3AF' }}>(YouTube, G-Drive, Loom, etc.)</span>
                                </label>
                                {recordingUrl && (
                                  <a
                                    href={recordingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      fontSize: '11.5px',
                                      fontWeight: '700',
                                      color: '#059669',
                                      textDecoration: 'none',
                                      background: '#ECFDF5',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      border: '1px solid #A7F3D0',
                                    }}
                                  >
                                    🔗 Test Recording Link ↗
                                  </a>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="url"
                                  placeholder="Paste Google Drive, YouTube, Loom, or MP4 recorded video URL..."
                                  defaultValue={recordingUrl}
                                  id={`recording-input-${item.id}`}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(17, 24, 39, 0.08)',
                                    fontSize: '12.5px',
                                    outline: 'none',
                                    background: '#FFFFFF',
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = document.getElementById(`recording-input-${item.id}`)?.value || '';
                                    handleSaveRecordedUrl(item.id, val.trim());
                                  }}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#000000',
                                    color: '#FFFFFF',
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 6px rgba(193, 85, 44, 0.25)',
                                  }}
                                >
                                  💾 Save Link
                                </button>
                              </div>
                              {item.isSessionEnded && !recordingUrl && (
                                <p style={{ fontSize: '11.5px', color: '#B45309', margin: '6px 0 0', fontWeight: '600' }}>
                                  ⚠️ Session has ended! Paste the recorded video link above so learners can watch the recorded class.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* TOGGLES & ACTIONS */}
                          <div>
                            {/* EXAM UNLOCK TOGGLE SWITCH */}
                            <button
                              onClick={() => handleToggleLiveClassExam(item.id)}
                              style={{
                                width: '100%',
                                marginBottom: '10px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontWeight: '800',
                                fontSize: '12.5px',
                                border: item.isExamUnlocked ? '1.5px solid #16A34A' : '1.5px solid #E11D48',
                                background: item.isExamUnlocked ? 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)' : 'linear-gradient(135deg, #FFE4E6 0%, #FFF1F2 100%)',
                                color: item.isExamUnlocked ? '#15803D' : '#BE123C',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              {item.isExamUnlocked
                                ? '🟢 Certification Exam UNLOCKED for Learners (Click to Lock)'
                                : '🔒 Certification Exam LOCKED (Click to Unlock for Learners)'}
                            </button>

                            {/* 24-HOUR STUDENT ACCESS WINDOW INDICATOR */}
                            {item.isSessionEnded && (
                              <div
                                style={{
                                  background: getSessionEndedStatus(item).isExpired ? '#FFE4E6' : '#FEF3C7',
                                  border: getSessionEndedStatus(item).isExpired ? '1.5px solid #F43F5E' : '1.5px solid #F59E0B',
                                  borderRadius: '10px',
                                  padding: '10px 12px',
                                  marginBottom: '12px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontSize: '12px',
                                  color: getSessionEndedStatus(item).isExpired ? '#9F1239' : '#92400E',
                                  fontWeight: '700',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                }}
                              >
                                <div>
                                  <span>⏰ 24h Student Access Window: </span>
                                  <strong>
                                    {getSessionEndedStatus(item).isExpired
                                      ? '🔒 EXPIRED (Access Locked for Learners)'
                                      : `⏳ ${getSessionEndedStatus(item).remainingText} Remaining`}
                                  </strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleReset24hWindow(item.id)}
                                  style={{
                                    background: getSessionEndedStatus(item).isExpired ? '#E11D48' : '#D97706',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title="Restart the 24-hour video & exam access window for learners"
                                >
                                  🔄 Reset 24h Access
                                </button>
                              </div>
                            )}

                            {/* SESSION STATUS TOGGLE BUTTON (LIVE vs ENDED) */}
                            <button
                              onClick={() => handleToggleLiveClassSessionEnded(item.id)}
                              style={{
                                width: '100%',
                                marginBottom: '14px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                fontWeight: '800',
                                fontSize: '12.5px',
                                border: item.isSessionEnded ? '1.5px solid #9CA3AF' : '1.5px solid #F43F5E',
                                background: item.isSessionEnded ? 'linear-gradient(135deg, #EFEAE5 0%, rgba(17, 24, 39, 0.06) 100%)' : 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
                                color: item.isSessionEnded ? '#374151' : '#E11D48',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              {item.isSessionEnded
                                ? '⏹️ Session Marked as ENDED (Click to Set Session LIVE NOW)'
                                : '🔴 Session is LIVE NOW (Click to Mark Session ENDED)'}
                            </button>

                            {/* CARD ACTION BUTTONS */}
                            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #EFEAE5', paddingTop: '14px' }}>
                              <button
                                onClick={() => handleOpenEditLiveModal(item)}
                                style={{
                                  flex: 1,
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#111827',
                                  color: '#FFFFFF',
                                  fontSize: '13px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                                }}
                              >
                                ✏️ Edit Live Class
                              </button>
                              <button
                                onClick={() => handleDeleteLiveClass(item.id)}
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: '8px',
                                  border: '1.5px solid #FCA5A5',
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: CERTIFICATION TEST QUESTIONS MANAGER */}
            {masterclassSubTab === 'certification_test' && (
              <div>
                {/* Masterclass Selector Box */}
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1.5px solid #000000',
                    marginBottom: '18px',
                    boxShadow: '0 4px 15px rgba(24, 21, 18, 0.06)'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎯</span> Select Live Masterclass to Manage Dedicated Certification Questions:
                  </div>
                  {liveClasses.length === 0 ? (
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                      No Live Masterclasses created yet. Add a class in the "Live classes" tab first.
                    </div>
                  ) : (
                    <select
                      value={selectedClassIdForExam || (liveClasses[0] ? liveClasses[0].id : '')}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedClassIdForExam(newId);
                        setMasterclassQuestions(getQuestionsForLiveClass(newId));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #000000',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#111827',
                        background: '#EFEAE5',
                        cursor: 'pointer'
                      }}
                    >
                      {liveClasses.map((item) => (
                        <option key={item.id} value={item.id}>
                          🎓 {item.courseName} (ID: {item.id}) - {item.scheduledDateTime ? new Date(item.scheduledDateTime).toLocaleDateString() : 'Scheduled'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: '#FFFFFF',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(17, 24, 39, 0.06)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>
                      📜 Dedicated Question Bank for:{' '}
                      <span style={{ color: '#000000' }}>
                        {liveClasses.find(c => String(c.id) === String(selectedClassIdForExam))?.courseName || 'Live Masterclass'}
                      </span>
                    </h4>
                    <span style={{ fontSize: '13px', color: '#6B7280' }}>
                      Total Questions: <strong>{masterclassQuestions.length}</strong> | Pass Threshold: <strong>75%</strong> | Exam Time: <strong>30 Mins</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      ref={csvFileInputRef}
                      accept=".csv"
                      onChange={handleCSVFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      className={styles.submitBtn}
                      style={{ width: 'auto', padding: '9px 15px', fontSize: '13px' }}
                      onClick={handleOpenAddQuestion}
                    >
                      + Add Question
                    </button>
                    <button
                      onClick={() => csvFileInputRef.current && csvFileInputRef.current.click()}
                      style={{
                        padding: '9px 15px',
                        borderRadius: '8px',
                        border: '1.5px solid #000000',
                        background: 'var(--color-sand-50, #FBF8F3)',
                        color: 'var(--color-charcoal-900, #181512)',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      📁 Upload CSV Questions
                    </button>
                    <button
                      onClick={downloadSampleQuestionsCSV}
                      style={{
                        padding: '9px 15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(17, 24, 39, 0.08)',
                        background: '#FFFFFF',
                        color: '#6B7280',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      📥 Sample CSV
                    </button>
                    {(masterclassQuestions.length > 0 || pendingCSVQuestions.length > 0) && (
                      <button
                        onClick={handleDeleteAllQuestions}
                        style={{
                          padding: '9px 15px',
                          borderRadius: '8px',
                          border: '1.5px solid #EF4444',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete All Questions
                      </button>
                    )}
                  </div>
                </div>

                {/* Pending CSV Upload Draft Banner */}
                {pendingCSVQuestions && pendingCSVQuestions.length > 0 && (
                  <div style={{
                    background: '#FFFBEB',
                    border: '1.5px solid #F59E0B',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    marginBottom: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#92400E', marginBottom: '2px' }}>
                        📋 CSV Questions Loaded (Draft Unsaved)
                      </div>
                      <div style={{ fontSize: '13px', color: '#B45309', fontWeight: '600' }}>
                        Parsed <strong>{pendingCSVQuestions.length}</strong> questions from CSV. Click "Save & Upload to Database" to publish.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleSavePendingCSVQuestions}
                        disabled={isSavingCSV}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                          color: '#FFFFFF',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: isSavingCSV ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                        }}
                      >
                        {isSavingCSV ? 'Saving to DB...' : `💾 Save & Upload to Database (${pendingCSVQuestions.length} Qs)`}
                      </button>
                      <button
                        onClick={() => setPendingCSVQuestions([])}
                        style={{
                          background: '#FFFFFF',
                          color: '#9CA3AF',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          border: '1px solid rgba(17, 24, 39, 0.08)',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        ❌ Discard Draft
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {masterclassQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(17, 24, 39, 0.06)',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        <h5 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>
                          Q{idx + 1}. {q.question}
                        </h5>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => handleOpenEditQuestion(q)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #000000',
                              background: 'rgba(24, 21, 18, 0.1)',
                              color: '#000000',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit Q
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(239,68,68,0.3)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#DC2626',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {q.questionHi && (
                        <div style={{ fontSize: '13.5px', color: '#6B7280', marginBottom: '10px', fontStyle: 'italic' }}>
                          🇮🇳 {q.questionHi}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginTop: '10px' }}>
                        {q.options && q.options.map((opt, oIdx) => {
                          const isCorrect = q.answer === oIdx;
                          return (
                            <div
                              key={oIdx}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                background: isCorrect ? 'rgba(34, 197, 94, 0.12)' : '#EFEAE5',
                                border: isCorrect ? '1.5px solid #22C55E' : '1px solid rgba(17, 24, 39, 0.06)',
                                color: isCorrect ? '#15803D' : '#374151',
                                fontWeight: isCorrect ? '800' : '500'
                              }}
                            >
                              <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt} {isCorrect ? '✓ (Correct)' : ''}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: '#9CA3AF', background: '#EFEAE5', padding: '8px 12px', borderRadius: '6px' }}>
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CERTIFICATE ISSUE & EXAM RESULTS */}
            {masterclassSubTab === 'certificate_issue' && (() => {
              const allSubmissions = getExamSubmissions();
              
              // 1. Find selected live class object for title matching
              const targetLc = liveClasses.find(lc => String(lc.id) === String(certSelectedMasterclass));
              const targetCourseName = targetLc ? (targetLc.courseName || targetLc.title || '').toLowerCase().trim() : '';

              // 2. Filter raw submissions by selected masterclass (matching by ID or by Title)
              const filteredSubmissions = certSelectedMasterclass === 'ALL'
                ? allSubmissions
                : allSubmissions.filter(s => {
                    const cleanSelectId = String(certSelectedMasterclass).toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                    const sClassId = String(s.masterclassId || s.examId || '').toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                    const sTitle = String(s.masterclassTitle || s.examTitle || '').toLowerCase().trim();

                    if (sClassId === cleanSelectId) return true;
                    if (targetCourseName && sTitle.includes(targetCourseName)) return true;
                    if (sTitle && targetCourseName && targetCourseName.includes(sTitle)) return true;
                    if (sTitle && cleanSelectId && (sTitle.includes(cleanSelectId) || cleanSelectId.includes(sTitle))) return true;

                    return false;
                  });

              // 3. Deduplicate / aggregate candidates per course to show best/passed attempt per candidate
              const displaySubmissions = (() => {
                if (!Array.isArray(filteredSubmissions) || filteredSubmissions.length === 0) return [];

                const groupsMap = new Map();

                filteredSubmissions.forEach((sub) => {
                  const email = String(sub.candidateEmail || sub.email || '').toLowerCase().trim();
                  const course = String(sub.masterclassTitle || sub.examTitle || sub.masterclassId || '').toLowerCase().trim();
                  const key = `${email}___${course}`;

                  if (!groupsMap.has(key)) {
                    groupsMap.set(key, []);
                  }
                  groupsMap.get(key).push(sub);
                });

                const aggregated = [];

                groupsMap.forEach((userSubs) => {
                  const totalAttempts = userSubs.length;

                  // Find if candidate passed in any attempt
                  const passedSub = userSubs.find((s) => s.isPassed || s.passed || s.percentage >= 75 || s.score >= 23);

                  let chosenSub;
                  if (passedSub) {
                    // Prefer an approved passed submission if available
                    const approvedSub = userSubs.find((s) => (s.isPassed || s.passed || s.percentage >= 75) && s.isApproved);
                    chosenSub = approvedSub || passedSub;
                  } else {
                    // Candidate has not passed yet, pick the latest attempt
                    userSubs.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
                    chosenSub = userSubs[0];
                  }

                  aggregated.push({
                    ...chosenSub,
                    attemptsCount: totalAttempts,
                  });
                });

                aggregated.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
                return aggregated;
              })();

              const totalAttempts = displaySubmissions.length;
              const passedSubmissions = displaySubmissions.filter(s => s.isPassed);
              const totalPassed = passedSubmissions.length;
              const approvedSubmissions = displaySubmissions.filter(s => s.isApproved);
              const totalApproved = approvedSubmissions.length;
              const pendingSubmissions = displaySubmissions.filter(s => s.isPassed && !s.isApproved);
              const totalPending = pendingSubmissions.length;

              return (
                <div>
                  <div style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(17, 24, 39, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                          🎯 Filter Exam Results by Live Masterclass:
                        </label>
                        <select
                          value={certSelectedMasterclass}
                          onChange={(e) => setCertSelectedMasterclass(e.target.value)}
                          style={{
                            width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                            border: '1.5px solid #000000', background: 'var(--color-sand-50, #FBF8F3)', fontSize: '13.5px',
                            fontWeight: '700', color: 'var(--color-charcoal-900, #181512)'
                          }}
                        >
                          <option value="ALL">
                            🌐 All Masterclasses & Certification Exams ({(() => {
                              const map = new Map();
                              allSubmissions.forEach(s => {
                                const k = `${(s.candidateEmail||s.email||'').toLowerCase().trim()}___${(s.masterclassTitle||s.examTitle||'').toLowerCase().trim()}`;
                                if (!map.has(k)) map.set(k, true);
                              });
                              return map.size;
                            })()} Candidates / Results)
                          </option>
                          {liveClasses.map((lc) => {
                            const lcTargetName = (lc.courseName || lc.title || '').toLowerCase().trim();
                            const lcCleanId = String(lc.id).toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                            
                            const candCount = (() => {
                              const map = new Map();
                              allSubmissions.forEach(s => {
                                const sId = String(s.masterclassId || s.examId || '').toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                                const sTitle = String(s.masterclassTitle || s.examTitle || '').toLowerCase().trim();
                                const isMatch = sId === lcCleanId || (lcTargetName && sTitle.includes(lcTargetName)) || (sTitle && lcTargetName.includes(sTitle));
                                if (isMatch) {
                                  const k = (s.candidateEmail || s.email || '').toLowerCase().trim();
                                  if (k && !map.has(k)) map.set(k, true);
                                }
                              });
                              return map.size;
                            })();

                            return (
                              <option key={lc.id} value={lc.id}>
                                🎓 {lc.courseName || lc.title} (ID: {lc.id}) {candCount > 0 ? `(${candCount} Candidates)` : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <button
                          onClick={async () => {
                            await approveAllExamCertificatesForMasterclass(certSelectedMasterclass);
                            setExamSubmissions(getExamSubmissions());
                            toast.success('🎉 Official Digital Certificates generated & issued for all passed candidates!');
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '12px 22px',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '13.5px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          ⚡ Generate Certificate for All Passed Candidates ({totalPending} Pending)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div style={{ background: '#EFEAE5', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' }}>Total Attempts</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{totalAttempts}</div>
                      </div>
                      <div style={{ background: '#ECFDF5', padding: '12px 16px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Passed Candidates</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669' }}>{totalPassed}</div>
                      </div>
                      <div style={{ background: 'var(--color-sand-50, #FBF8F3)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-charcoal-900, #181512)', textTransform: 'uppercase' }}>Issued Certificates</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#000000' }}>{totalApproved}</div>
                      </div>
                      <div style={{ background: '#FEF3C7', padding: '12px 16px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#B45309', textTransform: 'uppercase' }}>Pending Generation</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#D97706' }}>{totalPending}</div>
                      </div>
                    </div>
                  </div>

                  {displaySubmissions.length === 0 ? (
                    <div style={{
                      background: '#FFFFFF', borderRadius: '12px', padding: '40px 20px',
                      textAlign: 'center', border: '1.5px dashed rgba(17, 24, 39, 0.08)'
                    }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📜</div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                        No Exam Results Recorded for Selected Filter
                      </h4>
                    </div>
                  ) : (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                        <thead>
                          <tr style={{ background: '#EFEAE5', borderBottom: '2px solid rgba(17, 24, 39, 0.06)', textAlign: 'left', color: '#6B7280', fontWeight: '800' }}>
                            <th style={{ padding: '14px 16px' }}>Candidate Name & Details</th>
                            <th style={{ padding: '14px 16px' }}>Masterclass Exam</th>
                            <th style={{ padding: '14px 16px' }}>Score / %</th>
                            <th style={{ padding: '14px 16px' }}>Attempts</th>
                            <th style={{ padding: '14px 16px' }}>Date</th>
                            <th style={{ padding: '14px 16px' }}>Status</th>
                            <th style={{ padding: '14px 16px', textAlign: 'center' }}>Certificate Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displaySubmissions.map((sub, idx) => {
                            const isApproved = sub.isApproved;
                            const isPassed = sub.isPassed;
                            const attempts = sub.attemptsCount || 1;

                            return (
                              <tr key={sub.credentialId || idx} style={{ borderBottom: '1px solid #EFEAE5' }}>
                                <td style={{ padding: '14px 16px' }}>
                                  <div style={{ fontWeight: '800', color: '#111827' }}>{sub.candidateName || 'Candidate'}</div>
                                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{sub.candidateEmail}</div>
                                </td>
                                <td style={{ padding: '14px 16px', fontWeight: '600', color: '#374151' }}>
                                  {sub.masterclassTitle || sub.examTitle}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <span style={{ fontWeight: '900', color: isPassed ? '#059669' : '#DC2626' }}>
                                    {sub.percentage}%
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '4px' }}>
                                    ({sub.score}/{sub.total || 30})
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <span style={{ background: '#EFEAE5', padding: '3px 8px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '700', color: '#6B7280' }}>
                                    {attempts === 1 ? '1st Attempt' : attempts === 2 ? '2nd Attempt' : `${attempts}th Attempt`}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#9CA3AF' }}>
                                  {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td style={{ padding: '14px 16px' }}>
                                  <span style={{
                                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800',
                                    background: isPassed ? '#ECFDF5' : '#FEF2F2',
                                    color: isPassed ? '#047857' : '#DC2626',
                                    border: isPassed ? '1px solid #A7F3D0' : '1px solid #FCA5A5'
                                  }}>
                                    {isPassed ? 'PASSED ✓' : 'FAILED ✗'}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                  {isApproved ? (
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669', background: '#ECFDF5', padding: '4px 12px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                                      ✅ Issued & Unlocked
                                    </span>
                                  ) : isPassed ? (
                                    <button
                                      onClick={async () => {
                                        await approveExamCertificate(sub.credentialId || sub.id);
                                        setExamSubmissions(getExamSubmissions());
                                        toast.success(`🎉 Certificate generated & issued for ${sub.candidateName || 'Candidate'}!`);
                                      }}
                                      style={{
                                        background: 'linear-gradient(135deg, #000000 0%, var(--color-charcoal-900, #181512) 100%)',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '8px 14px',
                                        borderRadius: '6px',
                                        fontWeight: '800',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(193, 85, 44, 0.25)'
                                      }}
                                    >
                                      📜 Generate Certificate
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SUB-TAB 4: USERS ENROLLMENT VIEW */}
            {masterclassSubTab === 'users_enrollment' && (() => {
              const allSubs = getExamSubmissions();

              let filtered = masterclassEnrollments;
              if (masterclassEnrollFilter !== 'ALL') {
                const cleanId = String(masterclassEnrollFilter).toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                const targetLc = liveClasses.find(lc => String(lc.id) === String(masterclassEnrollFilter));
                const targetTitle = targetLc ? (targetLc.courseName || targetLc.title || '').toLowerCase().trim() : '';

                filtered = filtered.filter(e => {
                  const eId = String(e.class_id || e.program_id || e.id || '').toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                  const eTitle = String(e.class_title || e.program_title || '').toLowerCase().trim();
                  if (eId === cleanId) return true;
                  if (targetTitle && eTitle.includes(targetTitle)) return true;
                  if (eTitle && targetTitle && targetTitle.includes(eTitle)) return true;
                  return false;
                });
              }

              if (enrollSearchQuery) {
                const q = enrollSearchQuery.toLowerCase().trim();
                filtered = filtered.filter(e => {
                  const name = (e.user_name || e.name || '').toLowerCase();
                  const email = (e.user_email || e.email || '').toLowerCase();
                  const title = (e.class_title || e.program_title || '').toLowerCase();
                  return name.includes(q) || email.includes(q) || title.includes(q);
                });
              }

              const totalCount = filtered.length;

              const rows = filtered.map((enr, idx) => {
                const email = (enr.user_email || enr.email || '').toLowerCase().trim();
                const name = getCleanCandidateName(enr.user_name || enr.name, email);
                const courseName = enr.class_title || enr.program_title || 'Live Masterclass';

                let rawDate = enr.enrolled_at || enr.created_at;
                let formattedDate = 'Recently';
                if (rawDate) {
                  try {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                      formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    } else {
                      formattedDate = String(rawDate);
                    }
                  } catch (e) {
                    formattedDate = String(rawDate);
                  }
                }

                return {
                  id: enr.id || idx,
                  name,
                  email,
                  courseName,
                  formattedDate
                };
              });

              return (
                <div>
                  <div style={{
                    background: '#FFFFFF', border: '1.5px solid rgba(17, 24, 39, 0.06)', borderRadius: '12px',
                    padding: '18px 20px', marginBottom: '20px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                          🎯 Filter by Live Masterclass:
                        </label>
                        <select
                          value={masterclassEnrollFilter}
                          onChange={(e) => setMasterclassEnrollFilter(e.target.value)}
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1.5px solid #000000', background: 'var(--color-sand-50, #FBF8F3)', fontSize: '13px',
                            fontWeight: '700', color: '#000000'
                          }}
                        >
                          <option value="ALL">🌐 All Live Masterclasses ({masterclassEnrollments.length} Total Enrolled)</option>
                          {liveClasses.map(lc => (
                            <option key={lc.id} value={lc.id}>🎓 {lc.courseName || lc.title} (ID: {lc.id})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                          🔍 Search Enrolled Candidate:
                        </label>
                        <input
                          type="text"
                          placeholder="Search by name, email, or course..."
                          value={enrollSearchQuery}
                          onChange={(e) => setEnrollSearchQuery(e.target.value)}
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1.5px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '600', outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={loadEnrollmentsData}
                      style={{
                        background: '#000000', color: '#FFFFFF', border: 'none', padding: '10px 16px',
                        borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      🔄 Refresh Enrollments
                    </button>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)', borderLeft: '4px solid #000000', maxWidth: '300px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' }}>Total Enrolled Users</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#111827' }}>{totalCount}</div>
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', border: '1.5px dashed rgba(17, 24, 39, 0.08)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>No User Enrollments Found</h4>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>No candidate enrollments match the selected filter or search criteria.</p>
                    </div>
                  ) : (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                        <thead>
                          <tr style={{ background: '#EFEAE5', borderBottom: '2px solid rgba(17, 24, 39, 0.06)', textAlign: 'left', color: '#6B7280', fontWeight: '800' }}>
                            <th style={{ padding: '14px 16px' }}>Candidate Name & Email</th>
                            <th style={{ padding: '14px 16px' }}>Course Name</th>
                            <th style={{ padding: '14px 16px' }}>Date of Joining</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #EFEAE5' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '800', color: '#111827' }}>{row.name}</div>
                                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{row.email}</div>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: '700', color: '#000000' }}>
                                {row.courseName}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#6B7280', fontWeight: '600' }}>
                                📅 {row.formattedDate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: PROGRAMS FOR BIHAR'S OFFICERS */}
        {activeTab === 'programs' && (
          <div>
            {/* SUB-TAB PILL BUTTONS */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '24px',
                borderBottom: '2px solid rgba(17, 24, 39, 0.06)',
                paddingBottom: '12px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <button
                onClick={() => setOfficerSubTab('manage')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1.5px solid #000000',
                  background: officerSubTab === 'manage' ? '#000000' : '#FFFFFF',
                  color: officerSubTab === 'manage' ? '#FFFFFF' : '#111827',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🎴 Manage Programs ({programs.length})
              </button>

              <button
                onClick={() => setOfficerSubTab('syllabus')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1.5px solid #000000',
                  background: officerSubTab === 'syllabus' ? '#000000' : '#FFFFFF',
                  color: officerSubTab === 'syllabus' ? '#FFFFFF' : '#111827',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                📚 Program Syllabus & Resources
              </button>

              <button
                onClick={() => setOfficerSubTab('certification_test')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1.5px solid #000000',
                  background: officerSubTab === 'certification_test' ? '#000000' : '#FFFFFF',
                  color: officerSubTab === 'certification_test' ? '#FFFFFF' : '#111827',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                📜 Certification Test ({officerQuestions.length} Questions)
              </button>

              <button
                onClick={() => setOfficerSubTab('certificate_issue')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1.5px solid #000000',
                  background: officerSubTab === 'certificate_issue' ? '#000000' : '#FFFFFF',
                  color: officerSubTab === 'certificate_issue' ? '#FFFFFF' : '#111827',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                🎓 Certificate Issue & Exam Results
              </button>

              <button
                onClick={() => setOfficerSubTab('users_enrollment')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  border: '1.5px solid #000000',
                  background: officerSubTab === 'users_enrollment' ? '#000000' : '#FFFFFF',
                  color: officerSubTab === 'users_enrollment' ? '#FFFFFF' : '#111827',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                👥 Users Enrollment ({officerEnrollments.length})
              </button>
            </div>

            {/* SUB-TAB 1: MANAGE PROGRAM CARDS */}
            {officerSubTab === 'manage' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      Officer Program Cards & Curtain Controls
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9CA3AF' }}>
                      Edit program titles, category tags, duration, or enable coming soon glassmorphic curtain.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={handleSeedProgramsToSupabase}
                      style={{
                        background: '#000000',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Sync/Seed All Foundational AI Programs and Real Online Resources directly to Supabase Backend Database"
                    >
                      ⚡ Sync AI Programs to Backend
                    </button>
                    <button
                      className={styles.submitBtn}
                      style={{ width: 'auto', padding: '10px 20px', fontSize: '13px', fontWeight: '800' }}
                      onClick={() => handleOpenAddModal('program')}
                    >
                      + Add New Program
                    </button>
                  </div>
                </div>

                {programs.length === 0 ? (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '32px',
                      border: '2px dashed #000000',
                      padding: '48px 24px',
                      textAlign: 'center',
                      marginTop: '12px',
                    }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>🏛️</div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 6px' }}>
                      No Officer Programs Created Yet in Database
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '550px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                      You have not created any Officer Programs in Supabase database yet. Click below to add your first Officer Program!
                    </p>
                    <button
                      className={styles.submitBtn}
                      style={{ width: 'auto', padding: '10px 24px', margin: '0 auto' }}
                      onClick={() => handleOpenAddModal('program')}
                    >
                      + Add New Program
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                    {programs.map((item) => {
                      const tagList = item.tags && item.tags.length > 0 ? item.tags : [{ cls: 'tb', label: item.tagLabel || 'WORKSHOP' }];
                      return (
                        <div
                          key={item.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1.5px solid rgba(17, 24, 39, 0.06)',
                            borderRadius: '32px',
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.25s ease'
                          }}
                        >
                          {/* Top Accent Strip */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: item.isComingSoon
                                ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                                : 'linear-gradient(90deg, #000000 0%, #000000 100%)',
                            }}
                          />

                          <div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {tagList.map((t, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: 'rgba(24, 21, 18, 0.08)',
                                    color: '#000000',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    padding: '4px 10px',
                                    borderRadius: '32px',
                                    border: '1px solid rgba(24, 21, 18, 0.15)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                  }}
                                >
                                  {t.label || t}
                                </span>
                              ))}
                              <span
                                style={{
                                  padding: '4px 12px',
                                  borderRadius: '32px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  background: item.isComingSoon ? '#FEF3C7' : '#ECFDF5',
                                  color: item.isComingSoon ? '#B45309' : '#047857',
                                  border: item.isComingSoon ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {item.isComingSoon ? '🔒 CURTAIN ENABLED' : '✅ ACTIVE & OPEN'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0', lineHeight: '1.38', letterSpacing: '-0.3px' }}>
                              {item.title}
                            </h4>

                            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 16px 0', lineHeight: '1.55' }}>
                              {item.desc || item.description}
                            </p>

                            {item.footer && item.footer.length > 0 && (
                              <div style={{ background: '#EFEAE5', border: '1px solid rgba(17, 24, 39, 0.06)', padding: '10px 14px', borderRadius: '10px', marginBottom: '18px', fontSize: '12px', color: '#374151', fontWeight: '600', lineHeight: '1.45' }}>
                                <span style={{ marginRight: '4px' }}>📌</span>
                                <strong style={{ color: '#111827' }}>{item.footer.join(' · ')}</strong>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons Grid (Fits 100% inside card, zero overflow) */}
                          <div style={{ borderTop: '1px solid #EFEAE5', paddingTop: '14px', marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleCurtain(item)}
                              style={{
                                width: '100%',
                                minWidth: 0,
                                padding: '9px 4px',
                                borderRadius: '8px',
                                border: item.isComingSoon ? '1.5px solid #F59E0B' : '1px solid rgba(17, 24, 39, 0.08)',
                                background: item.isComingSoon ? '#FEF3C7' : '#EFEAE5',
                                color: item.isComingSoon ? '#92400E' : '#374151',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.2s ease'
                              }}
                              title={item.isComingSoon ? "Click to Disable Curtain" : "Click to Enable Curtain"}
                            >
                              {item.isComingSoon ? '🔒 Curtain ON' : '🔓 Curtain OFF'}
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              style={{
                                width: '100%',
                                minWidth: 0,
                                padding: '9px 4px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#000000',
                                color: '#FFFFFF',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                boxShadow: '0 2px 8px rgba(24, 21, 18, 0.25)',
                                transition: 'all 0.2s ease'
                              }}
                              title="Edit Program Details"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              style={{
                                width: '100%',
                                minWidth: 0,
                                padding: '9px 4px',
                                borderRadius: '8px',
                                border: '1px solid #FCA5A5',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.2s ease'
                              }}
                              title="Delete Program"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: PROGRAM SYLLABUS & RESOURCE LINKS */}
            {officerSubTab === 'syllabus' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '32px', border: '1.5px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>
                      📚 Program Syllabus & Resource Link Editor ({editingProgramModules.length} Modules)
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                      Customize module names, descriptions, resource links, and class links. Empty fields will automatically be hidden on the user side.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        const newMod = {
                          id: `mod-${Date.now()}`,
                          num: `0${editingProgramModules.length + 1}`,
                          title: `Module ${editingProgramModules.length + 1}: `,
                          description: '',
                          resourceLink: '',
                          classLink: '',
                          materialUrl: ''
                        };
                        setEditingProgramModules([...editingProgramModules, newMod]);
                      }}
                      style={{ background: '#000000', color: '#FFFFFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                    >
                      + Add New Module
                    </button>

                    <button
                      onClick={async () => {
                        const ok = await saveProgramModulesToSupabase(selectedOfficerProgForSyllabus, editingProgramModules);
                        if (ok) {
                          toast.success(`🎉 Saved ${editingProgramModules.length} modules to Supabase DB successfully!`);
                          await loadCoursesAndPrograms();
                        } else {
                          toast.error('Failed to save modules to Supabase.');
                        }
                      }}
                      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                      💾 Save All Modules to Supabase DB
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                    🎯 Select Officer Program to Edit Syllabus & Resources:
                  </label>
                  <select
                    value={selectedOfficerProgForSyllabus}
                    onChange={(e) => setSelectedOfficerProgForSyllabus(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #000000', fontSize: '14px', fontWeight: '800', color: '#111827', background: '#EFEAE5', cursor: 'pointer' }}
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        🏛️ {p.title} (ID: {p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {editingProgramModules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#EFEAE5', borderRadius: '12px', border: '1.5px dashed rgba(17, 24, 39, 0.08)', color: '#9CA3AF' }}>
                    No modules configured for this course yet. Click "+ Add New Module" above to add your first module!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {editingProgramModules.map((mod, mIdx) => (
                      <div key={mod.id || mIdx} style={{ background: '#EFEAE5', border: '1.5px solid rgba(17, 24, 39, 0.08)', borderRadius: '32px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div>
                          {/* Module Header Bar */}
                          <div style={{ fontWeight: '800', fontSize: '15px', color: '#000000', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Module #{mIdx + 1}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', background: '#000000', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>Mod 0{mIdx + 1}</span>
                              <button
                                onClick={() => {
                                  const filtered = editingProgramModules.filter((_, i) => i !== mIdx);
                                  setEditingProgramModules(filtered);
                                }}
                                style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          {/* Field 1: Module Name / Title */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                              📝 Module Name / Title:
                            </label>
                            <input
                              type="text"
                              value={mod.title || mod.name || ''}
                              onChange={(e) => {
                                const updated = [...editingProgramModules];
                                updated[mIdx] = { ...updated[mIdx], title: e.target.value, name: e.target.value };
                                setEditingProgramModules(updated);
                              }}
                              placeholder="e.g. Module 1: GenAI Basics for Officers"
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '700' }}
                            />
                          </div>

                          {/* Field 2: Module Description / Content */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                              📄 Module Description / Syllabus Topics:
                            </label>
                            <textarea
                              rows="3"
                              value={mod.description || mod.desc || (Array.isArray(mod.items) ? mod.items.join('\n') : '')}
                              onChange={(e) => {
                                const updated = [...editingProgramModules];
                                updated[mIdx] = { ...updated[mIdx], description: e.target.value, desc: e.target.value, items: e.target.value.split('\n').filter(Boolean) };
                                setEditingProgramModules(updated);
                              }}
                              placeholder="e.g. Overview of Generative AI tools, prompt frameworks and administrative automation."
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '12.5px', fontFamily: 'inherit', resize: 'vertical' }}
                            />
                          </div>

                          {/* Field 3: Resource Link (Drive / Study Material) */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                              📁 Resource Link (Google Drive / Study Material):
                            </label>
                            <input
                              type="text"
                              value={mod.resourceLink || mod.driveUrl || mod.drive_url || ''}
                              onChange={(e) => {
                                const updated = [...editingProgramModules];
                                updated[mIdx] = { ...updated[mIdx], resourceLink: e.target.value, driveUrl: e.target.value, drive_url: e.target.value };
                                setEditingProgramModules(updated);
                              }}
                              placeholder="e.g. https://drive.google.com/drive/folders/..."
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '12.5px' }}
                            />
                          </div>

                          {/* Field 4: Class Link (YouTube / Live Lecture) */}
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                              📺 Class Link (YouTube Video / Lecture):
                            </label>
                            <input
                              type="text"
                              value={mod.classLink || mod.youtubeUrl || mod.youtube_url || ''}
                              onChange={(e) => {
                                const updated = [...editingProgramModules];
                                updated[mIdx] = { ...updated[mIdx], classLink: e.target.value, youtubeUrl: e.target.value, youtube_url: e.target.value };
                                setEditingProgramModules(updated);
                              }}
                              placeholder="e.g. https://youtube.com/watch?v=..."
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '12.5px' }}
                            />
                          </div>

                          {/* Field 5: Material PDF / Document Link */}
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
                              📄 Material PDF / Document Link:
                            </label>
                            <input
                              type="text"
                              value={mod.materialUrl || mod.pdfUrl || mod.material_url || ''}
                              onChange={(e) => {
                                const updated = [...editingProgramModules];
                                updated[mIdx] = { ...updated[mIdx], materialUrl: e.target.value, pdfUrl: e.target.value, material_url: e.target.value };
                                setEditingProgramModules(updated);
                              }}
                              placeholder="e.g. https://biharai.gov.in/materials/module1.pdf"
                              style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '12.5px' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '24px', textAlign: 'right' }}>
                  <button
                    onClick={async () => {
                      const ok = await saveProgramModulesToSupabase(selectedOfficerProgForSyllabus, editingProgramModules);
                      if (ok) {
                        toast.success(`🎉 Saved ${editingProgramModules.length} modules to Supabase DB successfully!`);
                        await loadCoursesAndPrograms();
                      } else {
                        toast.error('Failed to save modules to Supabase.');
                      }
                    }}
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', border: 'none', padding: '12px 26px', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
                  >
                    💾 Save All Modules to Supabase DB
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CERTIFICATION TEST QUESTIONS MANAGER */}
            {officerSubTab === 'certification_test' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '32px', border: '1.5px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                {/* Level & Program Selector Box */}
                <div style={{ background: '#EFEAE5', padding: '18px', borderRadius: '12px', border: '1.5px solid #000000', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                    🎯 Select Certification Level or Officer Program to Manage Question Bank:
                  </div>
                  <select
                    value={selectedOfficerProgForExam}
                    onChange={(e) => setSelectedOfficerProgForExam(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #000000', fontSize: '14px', fontWeight: '800', color: '#111827', background: '#FFFFFF', cursor: 'pointer' }}
                  >
                    <optgroup label="Level-Wise Certification Exam Questions">
                      <option value="ai-fundamentals">🔰 Level 1 · Beginner: AI Fundamentals Certification Exam</option>
                      <option value="basics-of-prompts">⚙️ Level 2 · Intermediate: Basics of Prompt Engineering Exam</option>
                      <option value="ethics-in-ai">⚖️ Level 3 · Advanced: Ethics, Privacy & DPDP Compliance Exam</option>
                      <option value="prompt-generation">🚀 Level 4 · Expert: Executive Prompt Generation Exam</option>
                    </optgroup>
                    <optgroup label="Officer Executive Programs">
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>🏛️ {p.title} (ID: {p.id})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* CSV Drag & Upload Box */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      Question Bank ({officerQuestions.length} Questions Loaded)
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9CA3AF' }}>
                      Questions dynamically saved to Supabase table <code style={{ background: '#EFEAE5', padding: '2px 6px', borderRadius: '4px' }}>officer_program_questions</code>.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={downloadSampleQuestionsCSV} style={{ background: '#FFFFFF', border: '1px solid #000000', color: '#000000', padding: '9px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}>
                      📥 Download Sample CSV
                    </button>
                    <button onClick={() => csvFileInputRef.current && csvFileInputRef.current.click()} style={{ background: '#000000', color: '#FFFFFF', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer' }}>
                      📂 Upload 30 Qs via CSV
                    </button>
                    <input type="file" ref={csvFileInputRef} accept=".csv" style={{ display: 'none' }} onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (evt) => {
                          const parsed = parseQuestionsCSV(evt.target.result);
                          if (parsed.length > 0) {
                            setOfficerQuestions(parsed);
                            await uploadMasterclassQuestionsCSVToSupabase(selectedOfficerProgForExam, parsed);
                            toast.success(`🎉 ${parsed.length} questions uploaded to Supabase successfully!`);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }} />
                  </div>
                </div>

                {/* Questions List View */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {officerQuestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#EFEAE5', borderRadius: '12px', border: '1.5px dashed rgba(17, 24, 39, 0.08)', color: '#9CA3AF' }}>
                      No questions uploaded yet for this exam level. Click "Upload 30 Qs via CSV" above to populate!
                    </div>
                  ) : (
                    officerQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: '#FFFFFF', border: '1px solid rgba(17, 24, 39, 0.06)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#111827', marginBottom: '8px' }}>
                          Q{idx + 1}. {q.question || q.questionText}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          {(q.options || []).map((opt, oIdx) => {
                            const isCorrect = (q.answer !== undefined ? q.answer : q.correctAnswerIndex) === oIdx;
                            return (
                              <div key={oIdx} style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px', background: isCorrect ? '#DCFCE7' : '#EFEAE5', border: isCorrect ? '1.5px solid #16A34A' : '1px solid rgba(17, 24, 39, 0.06)', color: isCorrect ? '#15803D' : '#374151', fontWeight: isCorrect ? '800' : '500' }}>
                                <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt} {isCorrect ? '✓' : ''}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: CERTIFICATE ISSUE & EXAM RESULTS */}
            {officerSubTab === 'certificate_issue' && (
              <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '32px', border: '1.5px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 6px 0' }}>
                    🎓 Officer Certificate Approval & Exam Submissions
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                    View officer test percentages, passing credentials, and generate level-stamped certificates.
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Officer Candidate</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Marks / %</th>
                        <th>Level</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                            No exam submissions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        examSubmissions.map((sub, idx) => (
                          <tr key={idx}>
                            <td><strong>{sub.candidateName}</strong></td>
                            <td>{sub.candidateEmail}</td>
                            <td>{sub.candidateDesignation || 'Officer'}</td>
                            <td><strong>{sub.percentage}%</strong> ({sub.score}/{sub.total})</td>
                            <td><span style={{ background: '#EFEAE5', color: '#000000', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>{getExamLevelBadge(sub.examId, sub.examTitle)}</span></td>
                            <td>{sub.isPassed ? '✅ PASSED' : '❌ FAILED'}</td>
                            <td>
                              <button onClick={() => setSelectedCertSub(sub)} style={{ background: '#000000', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                                🎓 View Certificate
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: USERS ENROLLMENT VIEW FOR OFFICERS */}
            {officerSubTab === 'users_enrollment' && (() => {
              const allSubs = getExamSubmissions();

              let filtered = officerEnrollments;
              if (officerEnrollFilter !== 'ALL') {
                const cleanId = String(officerEnrollFilter).toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                const targetProg = programs.find(p => String(p.id) === String(officerEnrollFilter));
                const targetTitle = targetProg ? (targetProg.title || targetProg.courseName || '').toLowerCase().trim() : '';

                filtered = filtered.filter(e => {
                  const eId = String(e.program_id || e.class_id || e.id || '').toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                  const eTitle = String(e.program_title || e.class_title || '').toLowerCase().trim();
                  if (eId === cleanId) return true;
                  if (targetTitle && eTitle.includes(targetTitle)) return true;
                  if (eTitle && targetTitle && targetTitle.includes(eTitle)) return true;
                  return false;
                });
              }

              if (enrollSearchQuery) {
                const q = enrollSearchQuery.toLowerCase().trim();
                filtered = filtered.filter(e => {
                  const name = (e.user_name || e.name || '').toLowerCase();
                  const email = (e.user_email || e.email || '').toLowerCase();
                  const title = (e.program_title || e.class_title || '').toLowerCase();
                  return name.includes(q) || email.includes(q) || title.includes(q);
                });
              }

              const totalCount = filtered.length;
              let completedCount = 0;
              let inProgressCount = 0;

              const rows = filtered.map((enr, idx) => {
                const email = (enr.user_email || enr.email || '').toLowerCase().trim();
                const name = getCleanCandidateName(enr.user_name || enr.name, email);
                const progTitle = enr.program_title || enr.class_title || 'Officer Program';
                const progId = String(enr.program_id || enr.id || '');

                let rawDate = enr.enrolled_at || enr.created_at;
                let formattedDate = 'Recently';
                if (rawDate) {
                  try {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                      formattedDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    } else {
                      formattedDate = String(rawDate);
                    }
                  } catch (e) {
                    formattedDate = String(rawDate);
                  }
                }

                const matchingExamSub = allSubs.find(s => {
                  const sEmail = (s.candidateEmail || s.email || '').toLowerCase().trim();
                  if (sEmail !== email) return false;
                  const sId = String(s.masterclassId || s.examId || '').toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                  const sTitle = String(s.masterclassTitle || s.examTitle || '').toLowerCase().trim();
                  const cleanPId = progId.toLowerCase().replace(/^(live-masterclass-|course-|prog-)/, '').trim();
                  const pTitle = progTitle.toLowerCase().trim();
                  return sId === cleanPId || (pTitle && sTitle.includes(pTitle)) || (sTitle && pTitle.includes(sTitle));
                });

                const isCertified = Boolean(matchingExamSub && matchingExamSub.isApproved);

                let progressPercent = 0;
                const progRec = officerProgressList.find(p => p.user_email === email && p.program_id === progId);
                if (isCertified || progRec?.is_completed) {
                  progressPercent = 100;
                } else if (progRec && typeof progRec.progress_percent === 'number') {
                  progressPercent = progRec.progress_percent;
                } else {
                  const localProg = getUserCourseProgress(email, progId);
                  progressPercent = localProg.progressPercent || 0;
                }

                if (isCertified || progressPercent >= 100) {
                  completedCount++;
                } else {
                  inProgressCount++;
                }

                return {
                  id: enr.id || idx,
                  name,
                  email,
                  progTitle,
                  formattedDate,
                  isCertified: isCertified || progressPercent >= 100,
                  progressPercent
                };
              });

              return (
                <div>
                  <div style={{
                    background: '#FFFFFF', border: '1.5px solid rgba(17, 24, 39, 0.06)', borderRadius: '12px',
                    padding: '18px 20px', marginBottom: '20px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px'
                  }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                          🎯 Filter by Officer Program:
                        </label>
                        <select
                          value={officerEnrollFilter}
                          onChange={(e) => setOfficerEnrollFilter(e.target.value)}
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1.5px solid #000000', background: 'var(--color-sand-50, #FBF8F3)', fontSize: '13px',
                            fontWeight: '700', color: '#000000'
                          }}
                        >
                          <option value="ALL">🌐 All Officer Programs ({officerEnrollments.length} Total Enrolled)</option>
                          {programs.map(p => (
                            <option key={p.id} value={p.id}>🏛️ {p.title || p.courseName} (ID: {p.id})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                          🔍 Search Enrolled Officer:
                        </label>
                        <input
                          type="text"
                          placeholder="Search by name, email, or program..."
                          value={enrollSearchQuery}
                          onChange={(e) => setEnrollSearchQuery(e.target.value)}
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1.5px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '600', outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={loadEnrollmentsData}
                      style={{
                        background: '#000000', color: '#FFFFFF', border: 'none', padding: '10px 16px',
                        borderRadius: '8px', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      🔄 Refresh Enrollments
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ background: '#FFFFFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)', borderLeft: '4px solid #000000' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' }}>Total Enrolled Officers</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#111827' }}>{totalCount}</div>
                    </div>
                    <div style={{ background: '#ECFDF5', padding: '14px 18px', borderRadius: '10px', border: '1px solid #A7F3D0', borderLeft: '4px solid #10B981' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Completed (Certified)</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>{completedCount}</div>
                    </div>
                    <div style={{ background: 'var(--color-sand-50, #FBF8F3)', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(17, 24, 39, 0.06)', borderLeft: '4px solid #000000' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--color-charcoal-900, #181512)', textTransform: 'uppercase' }}>In Progress Officers</div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#000000' }}>{inProgressCount}</div>
                    </div>
                  </div>

                  {rows.length === 0 ? (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', border: '1.5px dashed rgba(17, 24, 39, 0.08)' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏛️</div>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>No Officer Enrollments Found</h4>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>No officer enrollments match the selected filter or search criteria.</p>
                    </div>
                  ) : (
                    <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid rgba(17, 24, 39, 0.06)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                        <thead>
                          <tr style={{ background: '#EFEAE5', borderBottom: '2px solid rgba(17, 24, 39, 0.06)', textAlign: 'left', color: '#6B7280', fontWeight: '800' }}>
                            <th style={{ padding: '14px 16px' }}>Officer Candidate Name & Email</th>
                            <th style={{ padding: '14px 16px' }}>Course Name</th>
                            <th style={{ padding: '14px 16px' }}>Date of Joining</th>
                            <th style={{ padding: '14px 16px' }}>Course Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #EFEAE5' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: '800', color: '#111827' }}>{row.name}</div>
                                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{row.email}</div>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: '700', color: '#000000' }}>
                                {row.progTitle}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#6B7280', fontWeight: '600' }}>
                                📅 {row.formattedDate}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                {row.isCertified ? (
                                  <span style={{
                                    padding: '6px 14px', borderRadius: '32px', fontSize: '12px', fontWeight: '800',
                                    background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0',
                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                  }}>
                                    ✅ Completed (Certificate Issued)
                                  </span>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                                    <div style={{ flex: 1, background: 'rgba(17, 24, 39, 0.06)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${row.progressPercent}%`, height: '100%',
                                        background: row.progressPercent >= 75 ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' : 'linear-gradient(90deg, #000000 0%, var(--color-charcoal-900, #181512) 100%)',
                                        borderRadius: '10px', transition: 'width 0.3s ease'
                                      }} />
                                    </div>
                                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#111827', minWidth: '40px' }}>
                                      {row.progressPercent}%
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 4: EXAMS & CERTIFICATE APPROVAL DESK & DATE FOLDER ANALYTICS */}
        {activeTab === 'exams' && (() => {
          const filteredSubmissions = getExamSubmissionsByDate(selectedDateFolder);
          const questionAnalytics = getOverallQuestionAnalytics(selectedDateFolder);

          const totalSub = filteredSubmissions.length;
          const pendingCount = filteredSubmissions.filter((s) => s.isPassed && !s.isApproved).length;
          const approvedCount = filteredSubmissions.filter((s) => s.isApproved).length;
          const passedCount = filteredSubmissions.filter((s) => s.isPassed).length;
          const failedCount = filteredSubmissions.filter((s) => s.status === 'FAILED' || (!s.isPassed && !s.isViolated && s.status !== 'IN_PROGRESS')).length;
          const violatedCount = filteredSubmissions.filter((s) => s.status === 'VIOLATED' || s.isViolated).length;
          const passRate = totalSub > 0 ? Math.round((passedCount / totalSub) * 100) : 0;

          // Apply Sorting / Filtering according to examSortFilter
          let displayCandidates = [...filteredSubmissions];
          if (examSortFilter === 'FAILED') {
            displayCandidates = displayCandidates.filter((s) => s.status === 'FAILED' || (!s.isPassed && !s.isViolated && s.status !== 'IN_PROGRESS'));
          } else if (examSortFilter === 'VIOLATED') {
            displayCandidates = displayCandidates.filter((s) => s.status === 'VIOLATED' || s.isViolated);
          } else if (examSortFilter === 'BEST_SCORERS') {
            displayCandidates.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
          } else if (examSortFilter === 'TOP_10') {
            displayCandidates = displayCandidates
              .filter((s) => s.isPassed || s.status === 'PASSED')
              .sort((a, b) => {
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                const timeA = a.timeTakenSeconds || 1800;
                const timeB = b.timeTakenSeconds || 1800;
                return timeA - timeB;
              })
              .slice(0, 10);
          }

          return (
            <div>
              {/* OVERALL STATS CARDS */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total Submissions ({selectedDateFolder === 'ALL' ? 'All Dates' : selectedDateFolder})</span>
                  <span className={styles.statValue}>{totalSub}</span>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #EAB308' }}>
                  <span className={styles.statLabel}>Pending Approvals</span>
                  <span className={styles.statValue} style={{ color: '#B45309' }}>
                    {pendingCount}
                  </span>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #000000' }}>
                  <span className={styles.statLabel}>Approved & Published</span>
                  <span className={styles.statValue} style={{ color: '#000000' }}>
                    {approvedCount}
                  </span>
                </div>
                <div className={styles.statCard} style={{ borderLeft: '4px solid #10B981' }}>
                  <span className={styles.statLabel}>Pass Rate</span>
                  <span className={styles.statValue} style={{ color: '#10B981' }}>
                    {passRate}%
                  </span>
                </div>
              </div>

              {/* CERTIFICATE SIGNATORY SETTINGS */}
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(24, 21, 18, 0.2)',
                borderRadius: '32px',
                padding: '20px 24px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(24, 21, 18, 0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '20px' }}>✍️</span>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>
                    Certificate Signatory Names
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: '600' }}>
                    (These names will appear on generated certificates)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>
                      🎓 Programme Director Name
                    </label>
                    <input
                      type="text"
                      value={directorName}
                      onChange={(e) => setDirectorName(e.target.value)}
                      onBlur={handleSaveSignatories}
                      placeholder="e.g. Dr. Rajesh Kumar"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid rgba(17, 24, 39, 0.08)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        background: '#EFEAE5',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>
                      📋 Academic Registrar Name
                    </label>
                    <input
                      type="text"
                      value={registrarName}
                      onChange={(e) => setRegistrarName(e.target.value)}
                      onBlur={handleSaveSignatories}
                      placeholder="e.g. Prof. Anita Sharma"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid rgba(17, 24, 39, 0.08)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        background: '#EFEAE5',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      handleSaveSignatories();
                      toast.success('Signatory names saved successfully!');
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(24, 21, 18, 0.25)',
                    }}
                  >
                    💾 Save Names
                  </button>
                </div>
              </div>

              <div className={styles.viewToggleBar}>
                <button
                  className={`${styles.viewToggleBtn} ${examSubMode === 'candidates' ? styles.viewToggleBtnActive : ''}`}
                  onClick={() => setExamSubMode('candidates')}
                >
                  📋 Candidate Registrations & Certificates ({totalSub})
                </button>
                <button
                  className={`${styles.viewToggleBtn} ${examSubMode === 'analytics' ? styles.viewToggleBtnActive : ''}`}
                  onClick={() => setExamSubMode('analytics')}
                >
                  📊 Result evaluation
                </button>
              </div>

              {/* MODE 1: CANDIDATE REGISTRATIONS & CERTIFICATES */}
              {examSubMode === 'candidates' && (
                <div>
                  {/* DATE-WISE EXAM SELECTOR OPTION + BULK ACTION (NO SORTING OPTIONS) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>📅 Select Exam Date:</span>
                      <button
                        className={`${styles.sortPill} ${selectedDateFolder === 'ALL' ? styles.sortPillActive : ''}`}
                        onClick={() => setSelectedDateFolder('ALL')}
                      >
                        📂 All Dates ({examSubmissions.length})
                      </button>
                      {dateFoldersList.map((folder) => (
                        <button
                          key={folder.dateFolder}
                          className={`${styles.sortPill} ${selectedDateFolder === folder.dateFolder ? styles.sortPillActive : ''}`}
                          onClick={() => setSelectedDateFolder(folder.dateFolder)}
                        >
                          📅 {folder.formattedDate} ({folder.count})
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {pendingCount > 0 && (
                        <button
                          className={styles.bulkApproveBtn}
                          onClick={() => {
                            approveAllExamCertificates(selectedDateFolder);
                            loadExamSubmissions();
                          }}
                        >
                          ✨ Generate & Publish Certificates for All Qualified ({pendingCount})
                        </button>
                      )}
                      {totalSub > 0 && (
                        <button
                          onClick={() => {
                            requestConfirmation(
                              'Wipe All Exam Submissions',
                              'Are you sure you want to wipe ALL exam submissions from the database/storage?',
                              () => {
                                clearAllExamSubmissions();
                                setExamSubmissions([]);
                                setDateFoldersList([]);
                              }
                            );
                          }}
                          style={{
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.15)'
                          }}
                        >
                          🧹 Clear All Database Submissions
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
                        📋 Candidate Registrations & Certificates ({selectedDateFolder === 'ALL' ? 'All Dates' : `Date: ${selectedDateFolder}`})
                      </h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Marks</th>
                            <th>Certificate Number</th>
                            <th>Certificate Status</th>
                            <th>Action / Approve</th>
                            <th>View Certificate</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubmissions.length === 0 ? (
                            <tr>
                              <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                                No candidate registrations found for this date.
                              </td>
                            </tr>
                          ) : (
                            filteredSubmissions.map((sub) => {
                              return (
                                <tr key={sub.credentialId}>
                                  <td>
                                    <strong style={{ color: '#111827', display: 'block', fontSize: '14px' }}>{getCleanCandidateName(sub.candidateName, sub.candidateEmail)}</strong>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>{sub.candidateDesignation || 'Candidate'}</span>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '12.5px', color: '#374151' }}>📧 {sub.candidateEmail || 'N/A'}</div>
                                  </td>
                                  <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: sub.isPassed ? '#000000' : sub.isViolated ? '#EF4444' : '#EAB308' }}>
                                      {sub.percentage}% ({sub.score}/{sub.total})
                                    </div>
                                  </td>
                                  <td>
                                    {sub.isApproved ? (
                                      <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '800', color: '#1a1a1a', background: 'var(--color-sand-50, #FBF8F3)', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                        {sub.credentialId}
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>N/A (Not Generated)</span>
                                    )}
                                  </td>
                                  <td>
                                    {sub.isDownloaded ? (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#166534', background: '#F0FDF4', padding: '4px 10px', borderRadius: '32px', border: '1px solid #BBF7D0' }}>
                                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#22C55E' }}></span>
                                        Downloaded
                                      </span>
                                    ) : (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: '700', color: '#991B1B', background: '#FEF2F2', padding: '4px 10px', borderRadius: '32px', border: '1px solid #FECACA' }}>
                                        <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                                        Not Downloaded
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {!sub.isApproved && sub.isPassed && !sub.isViolated ? (
                                      <button
                                        onClick={() => {
                                          approveExamCertificate(sub.credentialId);
                                          loadExamSubmissions();
                                        }}
                                        style={{
                                          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                          color: '#FFFFFF',
                                          border: 'none',
                                          padding: '8px 14px',
                                          borderRadius: '6px',
                                          fontWeight: '800',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          boxShadow: '0 4px 12px rgba(24, 21, 18, 0.25)',
                                        }}
                                      >
                                        ✨ Generate Certificate
                                      </button>
                                    ) : sub.isApproved ? (
                                      <div style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: '700' }}>
                                        Published Certificate ✓
                                      </div>
                                    ) : sub.isViolated ? (
                                      <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: '700' }}>
                                        Invalidated (Rules Exceeded)
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                                        N/A (Below 85%)
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {sub.isPassed ? (
                                      <button
                                        onClick={() => setSelectedCertSub(sub)}
                                        style={{
                                          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                                          color: '#FFFFFF',
                                          border: 'none',
                                          padding: '7px 14px',
                                          borderRadius: '6px',
                                          fontWeight: '800',
                                          fontSize: '12px',
                                          cursor: 'pointer',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          boxShadow: '0 3px 10px rgba(24, 21, 18, 0.25)',
                                          transition: 'all 0.2s ease',
                                        }}
                                        title="View, Preview & Download Candidate Certificate"
                                      >
                                        📜 View Certificate
                                      </button>
                                    ) : (
                                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>N/A (Did not pass)</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      onClick={() => {
                                        requestConfirmation(
                                          'Delete Candidate Exam Record & Certificate',
                                          `Are you sure you want to delete the exam record & certificate for "${sub.candidateName}"? This will delete the record permanently.`,
                                          () => {
                                            const updated = deleteExamSubmission(sub.credentialId || sub.id);
                                            setExamSubmissions(updated);
                                            setDateFoldersList(getExamDateFolders());
                                            toast.success(`Exam record & certificate for "${sub.candidateName}" deleted successfully.`);
                                          }
                                        );
                                      }}
                                      style={{
                                        background: '#FEF2F2',
                                        color: '#EF4444',
                                        border: '1px solid #FCA5A5',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                      }}
                                      title="Delete Candidate Record"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: RESULT EVALUATION */}
              {examSubMode === 'analytics' && (
                <div>
                  {/* DATE-WISE EXAM SELECTOR OPTION + SORTING OPTIONS FOR RESULT EVALUATION */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>📅 Select Exam Date:</span>
                      <button
                        className={`${styles.sortPill} ${selectedDateFolder === 'ALL' ? styles.sortPillActive : ''}`}
                        onClick={() => setSelectedDateFolder('ALL')}
                      >
                        📂 All Dates ({examSubmissions.length})
                      </button>
                      {dateFoldersList.map((folder) => (
                        <button
                          key={folder.dateFolder}
                          className={`${styles.sortPill} ${selectedDateFolder === folder.dateFolder ? styles.sortPillActive : ''}`}
                          onClick={() => setSelectedDateFolder(folder.dateFolder)}
                        >
                          📅 {folder.formattedDate} ({folder.count})
                        </button>
                      ))}
                    </div>

                    <div className={styles.sortFilterContainer}>
                      <div className={styles.sortFilterGroup}>
                        <span className={styles.sortFilterLabel}>⚡ Filter / Sort:</span>
                        <button
                          className={`${styles.sortPill} ${examSortFilter === 'ALL' ? styles.sortPillActive : ''}`}
                          onClick={() => setExamSortFilter('ALL')}
                        >
                          📂 All ({totalSub})
                        </button>
                        <button
                          className={`${styles.sortPill} ${examSortFilter === 'FAILED' ? styles.sortPillActive : ''}`}
                          onClick={() => setExamSortFilter('FAILED')}
                        >
                          ❌ Failed ({failedCount})
                        </button>
                        <button
                          className={`${styles.sortPill} ${examSortFilter === 'VIOLATED' ? styles.sortPillActive : ''}`}
                          onClick={() => setExamSortFilter('VIOLATED')}
                        >
                          ⚠️ Exam Violated ({violatedCount})
                        </button>
                        <button
                          className={`${styles.sortPill} ${examSortFilter === 'BEST_SCORERS' ? styles.sortPillActive : ''}`}
                          onClick={() => setExamSortFilter('BEST_SCORERS')}
                        >
                          🏆 Best Scorers
                        </button>
                        <button
                          className={`${styles.sortPill} ${examSortFilter === 'TOP_10' ? styles.sortPillActive : ''}`}
                          onClick={() => setExamSortFilter('TOP_10')}
                        >
                          🥇 Top 10 Best (Marks & Speed)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tableContainer}>
                    <div className={styles.tableHeader}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
                        📊 Result Evaluation ({selectedDateFolder === 'ALL' ? 'All Dates' : `Date: ${selectedDateFolder}`}) - {examSortFilter.replace('_', ' ')}
                      </h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Designation</th>
                            <th>Marks</th>
                            <th>Time Taken</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayCandidates.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#9CA3AF' }}>
                                No candidate exam results found for this filter/date.
                              </td>
                            </tr>
                          ) : (
                            displayCandidates.map((sub, idx) => {
                              const formatTime = (secs) => {
                                if (secs === undefined || secs === null || secs === 0) return 'N/A';
                                const mins = Math.floor(secs / 60);
                                const remainderSecs = secs % 60;
                                return `${mins}m ${remainderSecs}s`;
                              };

                              return (
                                <tr key={sub.credentialId}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      {(examSortFilter === 'TOP_10' || examSortFilter === 'BEST_SCORERS') && (
                                        <span className={styles.rankBadge}>#{idx + 1}</span>
                                      )}
                                      <strong style={{ color: '#111827', fontSize: '14px' }}>{getCleanCandidateName(sub.candidateName, sub.candidateEmail)}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ fontSize: '12.5px', color: '#374151' }}>📧 {sub.candidateEmail || 'N/A'}</div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                                      {sub.candidateDesignation || 'Candidate'}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{ fontWeight: '800', fontSize: '14px', color: sub.isPassed ? '#000000' : sub.isViolated ? '#EF4444' : '#EAB308' }}>
                                      {sub.percentage}% ({sub.score}/{sub.total})
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: '12.5px', color: '#6B7280', fontWeight: '600' }}>
                                      ⏱️ {formatTime(sub.timeTakenSeconds)}
                                    </span>
                                  </td>
                                  <td>
                                    {sub.isViolated ? (
                                      <span className={`${styles.statusBadge} ${styles.statusViolated}`}>
                                        ⚠️ VIOLATED
                                      </span>
                                    ) : sub.isPassed ? (
                                      <span className={`${styles.statusBadge} ${styles.statusPassed}`}>
                                        ✓ PASSED
                                      </span>
                                    ) : (
                                      <span className={`${styles.statusBadge} ${styles.statusFailed}`}>
                                        ❌ FAILED
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <button
                                      onClick={() => {
                                        requestConfirmation(
                                          'Delete Candidate Exam Result',
                                          `Are you sure you want to delete the exam result for "${sub.candidateName}"?`,
                                          () => {
                                            const updated = deleteExamSubmission(sub.credentialId);
                                            setExamSubmissions(updated);
                                            setDateFoldersList(getExamDateFolders());
                                          }
                                        );
                                      }}
                                      style={{
                                        background: '#FEF2F2',
                                        color: '#EF4444',
                                        border: '1px solid #FCA5A5',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s ease'
                                      }}
                                      title="Delete Result Info"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        {/* TAB 5: BLOG POSTS & NEWS ARTICLES MANAGER */}
        {activeTab === 'blogs' && (
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '32px', border: '1px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>
                  📝 Bihar AI Mission Blog Posts & News Articles
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
                  Write, publish, edit, and upload images for articles featured on the public Blog page.
                </p>
              </div>
              <button
                className={styles.submitBtn}
                style={{ width: 'auto', padding: '10px 18px', fontSize: '13.5px' }}
                onClick={handleOpenAddBlog}
              >
                + Write New Blog Post
              </button>
            </div>

            {blogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#EFEAE5', borderRadius: '10px', color: '#9CA3AF' }}>
                No blog posts created yet. Click "+ Write New Blog Post" above to publish your first article!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(17, 24, 39, 0.06)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    {b.image && (
                      <div style={{ height: '160px', overflow: 'hidden', background: '#EFEAE5' }}>
                        <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ background: 'rgba(24, 21, 18, 0.1)', color: '#000000', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                          {b.category}
                        </span>
                        <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{b.date}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.35' }}>
                        {b.title}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#6B7280', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {b.excerpt}
                      </p>
                      
                      <div style={{ marginTop: 'auto', borderTop: '1px solid #EFEAE5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => handleToggleBlogPublish(b.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: b.isPublished ? '1px solid #16A34A' : '1px solid #DC2626',
                            background: b.isPublished ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                            color: b.isPublished ? '#15803D' : '#B91C1C',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {b.isPublished ? '🟢 Published' : '🔴 Draft'}
                        </button>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenEditBlog(b)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #000000',
                              background: '#000000',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* END OF EXAMS & BLOGS TABS */}
      </main>

      {/* EDIT / ADD MODAL FOR COURSES & PROGRAMS */}
      {isModalOpen && editingItem && (
        <div className={styles.detailsOverlay}>
          <div
            className={styles.detailsPanel}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className={styles.detailsHeader}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#111827' }}>
                {editingItem.id
                  ? `Edit ${editingItem.type === 'course' ? 'Learner Course' : 'Officer Program'} Details`
                  : `Add New ${editingItem.type === 'course' ? 'Learner Course' : 'Officer Program'}`}
              </h3>
              <button className={styles.viewBtn} onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className={styles.detailsBody}>
              {/* Coming Soon Curtain Permission & Toggle */}
              <div
                style={{
                  background: 'rgba(24, 21, 18, 0.08)',
                  border: '1.5px solid #000000',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: '800',
                    fontSize: '14px',
                    color: '#111827',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editingItem.isComingSoon}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, isComingSoon: e.target.checked }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#000000' }}
                  />
                  Enable "Coming Soon" Animated Curtain Overlay
                </label>
                <p style={{ margin: '6px 0 12px 28px', fontSize: '12px', color: '#6B7280' }}>
                  When enabled, an animated glassmorphic curtain will cover this card on the website.
                </p>

                {editingItem.isComingSoon && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className={styles.infoLabel}>Curtain Badge (EN)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainBadge || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainBadge: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={styles.infoLabel}>Curtain Badge (HI)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainBadgeHi || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainBadgeHi: e.target.value }))
                        }
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className={styles.infoLabel}>Curtain Subtitle (EN)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainSub || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainSub: e.target.value }))
                        }
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className={styles.infoLabel}>Curtain Subtitle (HI)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainSubHi || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainSubHi: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={styles.infoLabel}>Curtain Launch Tag (EN)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainTag || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainTag: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className={styles.infoLabel}>Curtain Launch Tag (HI)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={editingItem.curtainTagHi || ''}
                        onChange={(e) =>
                          setEditingItem((prev) => ({ ...prev, curtainTagHi: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Tags Input */}
              <div className={styles.infoSection}>
                <h4>Category Tags (Separate tags with commas)</h4>
                <div>
                  <label className={styles.infoLabel}>
                    Card Tags (e.g. WORKSHOP, BEGINNER or FOUNDATIONAL, ONLINE)
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={tagsInputText}
                    onChange={(e) => setTagsInputText(e.target.value)}
                    placeholder="e.g. WORKSHOP, BEGINNER"
                  />
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
                    Colors are automatically highlighted based on tag names (Blue, Orange, Teal, Green, Purple, Red).
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className={styles.infoSection}>
                <h4>Title</h4>
                <div>
                  <label className={styles.infoLabel}>Title</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editingItem.title || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className={styles.infoSection}>
                <h4>Description</h4>
                <div>
                  <label className={styles.infoLabel}>Description</label>
                  <textarea
                    rows={3}
                    className={styles.inputField}
                    value={editingItem.desc || ''}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, desc: e.target.value }))
                    }
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  💡 Hindi translation is handled automatically by Google Translate — no need to enter Hindi content separately.
                </span>
              </div>

              {/* Detail Page Controls: Overview & What You Will Learn */}
              <div className={styles.infoSection}>
                <h4 style={{ color: '#000000' }}>📖 Detail Page: Course Overview & What You Will Learn</h4>
                <textarea
                  rows={4}
                  className={styles.inputField}
                  value={editingItem.overviewText || ''}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, overviewText: e.target.value }))
                  }
                  placeholder="Detailed course overview shown when clicking View Program Details..."
                />
              </div>

              {/* Detail Page Controls: Quick Highlights Badges */}
              <div className={styles.infoSection}>
                <h4 style={{ color: '#000000' }}>⚡ Detail Page: Quick Highlight Badges (4 Stat Cards)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className={styles.infoLabel}>Modules Stat (e.g. 06 Comprehensive Modules)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingItem.modulesCountText || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, modulesCountText: e.target.value }))
                      }
                      placeholder="06 Comprehensive Modules"
                    />
                  </div>
                  <div>
                    <label className={styles.infoLabel}>Duration Stat (e.g. 6 Hrs Self-Paced Learning)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingItem.durationText || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, durationText: e.target.value }))
                      }
                      placeholder="6 Hrs Self-Paced Learning"
                    />
                  </div>
                  <div>
                    <label className={styles.infoLabel}>Access Stat (e.g. 100% Free Forever Access)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingItem.accessText || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, accessText: e.target.value }))
                      }
                      placeholder="100% Free Forever Access"
                    />
                  </div>
                  <div>
                    <label className={styles.infoLabel}>Medium Stat (e.g. EN + हिं Bilingual Medium)</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingItem.mediumText || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, mediumText: e.target.value }))
                      }
                      placeholder="EN + हिं Bilingual Medium"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Metadata */}
              <div className={styles.infoSection}>
                <h4>Card Details / Footer Metadata (Separate items with ·)</h4>
                <input
                  type="text"
                  className={styles.inputField}
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. Duration: 1 Day · For: All officers · Format: In-person / Online"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className={styles.submitBtn}>
                  Save & Apply Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.logoutBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Side Panel for Submissions */}
      {selectedSubmission && (
        <div className={styles.detailsOverlay}>
          <div className={styles.detailsPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailsHeader}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Submission Details</h3>
              <button className={styles.viewBtn} onClick={() => setSelectedSubmission(null)}>
                ✕
              </button>
            </div>

            <div className={styles.detailsBody}>
              <div className={styles.infoSection}>
                <h4>Personal Information</h4>
                <div className={styles.infoGrid}>
                  <InfoItem label="Full Name" value={selectedSubmission.full_name} />
                  <InfoItem label="Email" value={selectedSubmission.email} />
                  <InfoItem label="Mobile" value={selectedSubmission.mobile} />
                  <InfoItem label="Gender" value={selectedSubmission.gender} />
                  <InfoItem label="Age" value={selectedSubmission.age} />
                  <InfoItem
                    label="Created On"
                    value={new Date(selectedSubmission.created_at).toLocaleString()}
                  />
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Professional Details</h4>
                <div className={styles.infoGrid}>
                  <InfoItem label="Role Type" value={selectedSubmission.role_type} />
                  <InfoItem label="Designation" value={selectedSubmission.designation} />
                  <InfoItem label="Department" value={selectedSubmission.department} />
                  <InfoItem label="Organization" value={selectedSubmission.organization} />
                  <InfoItem label="Years of Exp" value={selectedSubmission.experience} />
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Location</h4>
                <div className={styles.infoGrid}>
                  <InfoItem label="District" value={selectedSubmission.district} />
                  <InfoItem label="Block / City" value={selectedSubmission.block_city} />
                  <InfoItem label="State" value={selectedSubmission.state} />
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Areas of Interest</h4>
                <div style={{ marginTop: '12px' }}>
                  {selectedSubmission.interests && selectedSubmission.interests.length > 0
                    ? selectedSubmission.interests.map((item) => (
                        <span key={item} className={styles.interestTag}>
                          {item}
                        </span>
                      ))
                    : '--'}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Statement of Intent</h4>
                <div className={styles.intentBox}>{selectedSubmission.intent || '--'}</div>
              </div>

              <div className={styles.infoSection}>
                <h4>Proposed Contribution</h4>
                <div className={styles.intentBox}>
                  {selectedSubmission.contribution || 'No contribution specified'}
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4>Professional Links</h4>
                <div className={styles.infoGrid}>
                  <InfoItem
                    label="LinkedIn Profile"
                    value={
                      selectedSubmission.linkedin ? (
                        <a
                          href={
                            selectedSubmission.linkedin.startsWith('http')
                              ? selectedSubmission.linkedin
                              : `https://${selectedSubmission.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#000000', textDecoration: 'underline', fontWeight: '600' }}
                        >
                          {selectedSubmission.linkedin}
                        </a>
                      ) : (
                        'Not provided'
                      )
                    }
                  />
                  <InfoItem
                    label="Portfolio / GitHub"
                    value={
                      selectedSubmission.portfolio ? (
                        <a
                          href={
                            selectedSubmission.portfolio.startsWith('http')
                              ? selectedSubmission.portfolio
                              : `https://${selectedSubmission.portfolio}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#000000', textDecoration: 'underline', fontWeight: '600' }}
                        >
                          {selectedSubmission.portfolio}
                        </a>
                      ) : (
                        'Not provided'
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CLASS MODAL (CREATE / EDIT) */}
      {isLiveModalOpen && editingLiveClass && (
        <div className={styles.detailsOverlay}>
          <div
            className={styles.detailsPanel}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className={styles.detailsHeader}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                {editingLiveClass.id ? 'Edit Live Class Card' : 'Add New Live Class Card'}
              </h3>
              <button className={styles.viewBtn} onClick={() => setIsLiveModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLiveClass} className={styles.detailsBody}>
              {/* Course Name */}
              <div className={styles.infoSection}>
                <h4>Course Name :-</h4>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editingLiveClass.courseName || ''}
                  onChange={(e) =>
                    setEditingLiveClass((prev) => ({ ...prev, courseName: e.target.value }))
                  }
                  placeholder="e.g. Generative AI & Prompt Engineering Masterclass"
                  required
                />
              </div>

              {/* Course Description */}
              <div className={styles.infoSection}>
                <h4>Course Discription :-</h4>
                <textarea
                  rows={3}
                  className={styles.inputField}
                  value={editingLiveClass.courseDesc || ''}
                  onChange={(e) =>
                    setEditingLiveClass((prev) => ({ ...prev, courseDesc: e.target.value }))
                  }
                  placeholder="e.g. Live interactive session for Bihar learners and officers..."
                  required
                />
              </div>

              {/* Course Duration, Instructor, Language & Platform Name */}
              <div className={styles.infoSection}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <h4>Course duration :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.courseDuration || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({ ...prev, courseDuration: e.target.value }))
                      }
                      placeholder="e.g. 1.5 Hours / 90 Mins"
                      required
                    />
                  </div>
                  <div>
                    <h4>Course Instructor :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.courseInstructor || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({ ...prev, courseInstructor: e.target.value }))
                      }
                      placeholder="e.g. Dr. Amit Sharma (AI Lead)"
                      required
                    />
                  </div>
                  <div>
                    <h4>Class Language :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.courseLanguage || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({ ...prev, courseLanguage: e.target.value }))
                      }
                      placeholder="e.g. Hindi + English (Bilingual)"
                      required
                    />
                  </div>
                  <div>
                    <h4>Certification Type :-</h4>
                    <select
                      className={styles.inputField}
                      value={editingLiveClass.certificateType || 'Free certification'}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const isPaid = newType === 'Paid certification';
                        setEditingLiveClass((prev) => ({
                          ...prev,
                          certificateType: newType,
                          price: isPaid ? (prev.price && prev.price !== 'Free' ? prev.price : '') : 'Free',
                          priceDisplay: isPaid ? (prev.priceDisplay && prev.priceDisplay !== 'Free' ? prev.priceDisplay : '') : 'Free'
                        }));
                      }}
                      required
                    >
                      <option value="Free certification">Free certification (100% Free)</option>
                      <option value="Paid certification">Paid certification (Set Course Fee)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <h4>Platform Name :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.platformName || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({ ...prev, platformName: e.target.value }))
                      }
                      placeholder="e.g. YouTube Live / MS Teams / Zoom"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Masterclass Price Field (Only shown when Paid Certification is selected) */}
              {editingLiveClass.certificateType === 'Paid certification' && (
                <div className={styles.infoSection}>
                  <h4>Masterclass Price (₹) :-</h4>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editingLiveClass.price || ''}
                    onChange={(e) =>
                      setEditingLiveClass((prev) => ({
                        ...prev,
                        price: e.target.value,
                        priceDisplay: e.target.value
                      }))
                    }
                    placeholder="e.g. ₹699"
                    required
                  />
                  <span style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                    Set the course fee. Learners will scan the PhonePe UPI QR code for this exact amount on your website.
                  </span>
                </div>
              )}

              {/* Instructor Name, Title, & Image URL */}
              <div className={styles.infoSection}>
                <h4>Instructor Profile Details :-</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <h4>Instructor Full Name :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.instructorName || editingLiveClass.courseInstructor || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({
                          ...prev,
                          instructorName: e.target.value,
                          courseInstructor: e.target.value,
                        }))
                      }
                      placeholder="e.g. Dr. Anand Kumar"
                      required
                    />
                  </div>
                  <div>
                    <h4>Instructor Designation / Title :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingLiveClass.instructorTitle || ''}
                      onChange={(e) =>
                        setEditingLiveClass((prev) => ({ ...prev, instructorTitle: e.target.value }))
                      }
                      placeholder="e.g. Lead AI Scientist & Ex-IITian"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className={styles.infoLabel}>
                    Instructor Photo / Profile Image URL (Paste link from Google, LinkedIn, Facebook, Instagram, etc.):
                  </label>
                  <input
                    type="url"
                    className={styles.inputField}
                    value={editingLiveClass.instructorImage || ''}
                    onChange={(e) =>
                      setEditingLiveClass((prev) => ({ ...prev, instructorImage: e.target.value }))
                    }
                    placeholder="https://... (Paste photo link from Google, LinkedIn, Facebook, Instagram, etc.)"
                  />

                  {editingLiveClass.instructorImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <img
                        src={editingLiveClass.instructorImage}
                        alt="Instructor Preview"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #000000' }}
                      />
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>✓ Instructor Photo Preview Loaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Day, Date, Time */}
              <div className={styles.infoSection}>
                <h4>Day,Date,time :-</h4>
                <input
                  type="datetime-local"
                  className={styles.inputField}
                  value={formatForDateTimeLocal(editingLiveClass.scheduledDateTime)}
                  onChange={(e) =>
                    setEditingLiveClass((prev) => ({ ...prev, scheduledDateTime: e.target.value }))
                  }
                  required
                />
                <span style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  Select the scheduled date & time when the live class begins. The website will show a dynamic countdown timer until this time, and then activate the join link!
                </span>
              </div>

              {/* Join at Link */}
              <div className={styles.infoSection}>
                <h4>Join at :- (Video Conferencing Link)</h4>
                <input
                  type="url"
                  className={styles.inputField}
                  value={editingLiveClass.joinUrl || ''}
                  onChange={(e) =>
                    setEditingLiveClass((prev) => ({ ...prev, joinUrl: e.target.value }))
                  }
                  placeholder="e.g. https://youtube.com/live/... or https://teams.microsoft.com/... or https://zoom.us/j/..."
                  required
                />
                <span style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  Admin can put any video conferencing tool link here (YouTube Live, MS Teams, Zoom, Google Meet, etc.).
                </span>
              </div>

              {/* Recorded Class Video Link */}
              <div className={styles.infoSection}>
                <h4>📹 Recorded Class Video Link :- (Optional / Post-Session)</h4>
                <input
                  type="url"
                  className={styles.inputField}
                  value={editingLiveClass.recordingUrl || editingLiveClass.recordedUrl || ''}
                  onChange={(e) =>
                    setEditingLiveClass((prev) => ({ ...prev, recordingUrl: e.target.value, recordedUrl: e.target.value }))
                  }
                  placeholder="e.g. https://youtube.com/watch?v=... or https://drive.google.com/file/d/... or Loom / Vimeo link..."
                />
                <span style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  Admin can share recorded session link (Google Drive, YouTube, Loom, Vimeo, MP4, etc.). Displayed on frontend once session is marked ENDED.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className={styles.submitBtn}>
                  Save Live Class Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsLiveModalOpen(false)}
                  className={styles.logoutBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUESTION MODAL (CREATE / EDIT) */}
      {isQuestionModalOpen && editingQuestion && (
        <div className={styles.detailsOverlay}>
          <div
            className={styles.detailsPanel}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className={styles.detailsHeader}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button className={styles.viewBtn} onClick={() => setIsQuestionModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className={styles.detailsBody}>
              {/* Question Text */}
              <div className={styles.infoSection}>
                <h4>Question Text :-</h4>
                <textarea
                  rows={2}
                  className={styles.inputField}
                  value={editingQuestion.question || ''}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="e.g. What is the primary function of Generative AI?"
                  required
                />
              </div>

              {/* 4 Options */}
              <div className={styles.infoSection}>
                <h4>Multiple Choice Options :-</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Option A (0)', 'Option B (1)', 'Option C (2)', 'Option D (3)'].map((lbl, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', width: '90px', fontSize: '12px' }}>{lbl}:</span>
                      <input
                        type="text"
                        className={styles.inputField}
                        value={(editingQuestion.options && editingQuestion.options[idx]) || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingQuestion(prev => {
                            const newOpts = [...(prev.options || ['', '', '', ''])];
                            newOpts[idx] = val;
                            return { ...prev, options: newOpts };
                          });
                        }}
                        placeholder={`Enter ${lbl}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer Selector */}
              <div className={styles.infoSection}>
                <h4>Select Correct Answer :-</h4>
                <select
                  className={styles.inputField}
                  value={editingQuestion.answer ?? 0}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev, answer: parseInt(e.target.value, 10) }))}
                  required
                >
                  <option value={0}>Option A (Index 0)</option>
                  <option value={1}>Option B (Index 1)</option>
                  <option value={2}>Option C (Index 2)</option>
                  <option value={3}>Option D (Index 3)</option>
                </select>
              </div>

              {/* Explanation EN & HI */}
              <div className={styles.infoSection}>
                <h4>Explanation (English) :-</h4>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Brief explanation for correct answer..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className={styles.submitBtn}>
                  Save Question
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className={styles.logoutBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* BLOG EDITOR MODAL (CREATE / EDIT WITH IMAGE UPLOAD) */}
      {isBlogModalOpen && editingBlog && (
        <div className={styles.detailsOverlay}>
          <div
            className={styles.detailsPanel}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div className={styles.detailsHeader}>
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                {editingBlog.id ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h3>
              <button className={styles.viewBtn} onClick={() => setIsBlogModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className={styles.detailsBody}>
              {/* Blog Title */}
              <div className={styles.infoSection}>
                <h4>Blog Title :-</h4>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editingBlog.title || ''}
                  onChange={(e) => setEditingBlog((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Generative AI Workflows for Bihar Public Administration"
                  required
                />
              </div>

              {/* Category, Date & Read Time */}
              <div className={styles.infoSection}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <h4>Category :-</h4>
                    <select
                      className={styles.inputField}
                      value={editingBlog.category || 'Governance'}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, category: e.target.value }))}
                      required
                    >
                      <option value="Governance">Governance</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Education">Education</option>
                      <option value="GenAI">GenAI</option>
                      <option value="Startups">Startups</option>
                    </select>
                  </div>
                  <div>
                    <h4>Date :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingBlog.date || ''}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. 28 July 2026"
                      required
                    />
                  </div>
                  <div>
                    <h4>Read Time :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingBlog.readTime || ''}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, readTime: e.target.value }))}
                      placeholder="e.g. 5 min read"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Author & Author Role */}
              <div className={styles.infoSection}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <h4>Author Name :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingBlog.author || ''}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="e.g. Praveer Kishore / Bihar AI Team"
                      required
                    />
                  </div>
                  <div>
                    <h4>Author Role :-</h4>
                    <input
                      type="text"
                      className={styles.inputField}
                      value={editingBlog.authorRole || ''}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, authorRole: e.target.value }))}
                      placeholder="e.g. AI Governance Specialist"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload & Image URL */}
              <div className={styles.infoSection}>
                <h4>Featured Header Image :-</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Option 1: Upload Image File from Computer:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className={styles.inputField}
                      style={{ padding: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      Option 2: Or enter direct Image Web URL:
                    </label>
                    <input
                      type="url"
                      className={styles.inputField}
                      value={editingBlog.image || ''}
                      onChange={(e) => setEditingBlog((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                    />
                  </div>
                  {editingBlog.image && (
                    <div style={{ marginTop: '6px', borderRadius: '8px', overflow: 'hidden', height: '140px', background: '#EFEAE5', border: '1px solid rgba(17, 24, 39, 0.08)' }}>
                      <img src={editingBlog.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div className={styles.infoSection}>
                <h4>Short Excerpt / Card Summary :-</h4>
                <textarea
                  rows={2}
                  className={styles.inputField}
                  value={editingBlog.excerpt || ''}
                  onChange={(e) => setEditingBlog((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="A brief 2-3 line summary displayed on the blog card preview..."
                  required
                />
              </div>

              {/* Full Content */}
              <div className={styles.infoSection}>
                <h4>Full Article Content :-</h4>
                <textarea
                  rows={8}
                  className={styles.inputField}
                  value={editingBlog.content || ''}
                  onChange={(e) => setEditingBlog((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write the full blog article content here. Separate paragraphs with double enter/returns..."
                  required
                />
              </div>

              {/* Publish Checkbox */}
              <div className={styles.infoSection}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingBlog.isPublished !== false}
                    onChange={(e) => setEditingBlog((prev) => ({ ...prev, isPublished: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#000000' }}
                  />
                  Publish this Blog Post Immediately to Public Website
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className={styles.submitBtn}>
                  Save Blog Post
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className={styles.logoutBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL FOR ADMIN */}
      {selectedCertSub && (
        <AdminCertificateModal
          submission={selectedCertSub}
          onClose={() => setSelectedCertSub(null)}
        />
      )}

      {/* CUSTOM MINIMAL CONFIRMATION MODAL DIALOG */}
      {confirmModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '32px',
              border: '1px solid rgba(17, 24, 39, 0.08)',
              padding: '24px 28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              color: '#111827',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: 0 }}>
                ⚠️
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#111827' }}>
                  {confirmModal.title}
                </h4>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#6B7280', margin: '0 0 20px 0', lineHeight: '1.5' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                style={{
                  padding: '8.5px 18px',
                  borderRadius: '8px',
                  background: '#EFEAE5',
                  color: '#6B7280',
                  border: '1px solid rgba(17, 24, 39, 0.08)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (typeof confirmModal.onConfirm === 'function') {
                    confirmModal.onConfirm();
                  }
                  setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                style={{
                  padding: '8.5px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHONEPE MERCHANT SETTINGS MODAL */}
      {isPhonePeSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '32px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', color: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#5F259F' }}>
                🟣 PhonePe & UPI Merchant Gateway Settings
              </h3>
              <button onClick={() => setIsPhonePeSettingsOpen(false)} style={{ background: '#EFEAE5', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: '700' }}>✕</button>
            </div>

            <form onSubmit={handleSavePhonePeConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Merchant UPI VPA (Target Payments)</label>
                <input
                  type="text"
                  value={phonePeConfig.merchantVpa}
                  onChange={(e) => setPhonePeConfig({ ...phonePeConfig, merchantVpa: e.target.value })}
                  placeholder="e.g. biharaimission@ybl"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Your PhonePe / Merchant UPI ID where course money deposits (0% fee).</span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>PhonePe Merchant ID (MID)</label>
                <input
                  type="text"
                  value={phonePeConfig.merchantId}
                  onChange={(e) => setPhonePeConfig({ ...phonePeConfig, merchantId: e.target.value })}
                  placeholder="e.g. PGTESTPAYUAT or BIHARAIMISSIONONLINE"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Salt Key</label>
                  <input
                    type="text"
                    value={phonePeConfig.saltKey}
                    onChange={(e) => setPhonePeConfig({ ...phonePeConfig, saltKey: e.target.value })}
                    placeholder="Salt Key"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Salt Index</label>
                  <input
                    type="text"
                    value={phonePeConfig.saltIndex}
                    onChange={(e) => setPhonePeConfig({ ...phonePeConfig, saltIndex: e.target.value })}
                    placeholder="1"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', display: 'block', marginBottom: '4px' }}>Environment Mode</label>
                <select
                  value={phonePeConfig.env}
                  onChange={(e) => setPhonePeConfig({ ...phonePeConfig, env: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(17, 24, 39, 0.08)', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}
                >
                  <option value="SANDBOX">🧪 Test / Sandbox Mode (PGTESTPAYUAT)</option>
                  <option value="PRODUCTION">🚀 Live Production Mode</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPhonePeSettingsOpen(false)}
                  style={{ padding: '8.5px 16px', borderRadius: '8px', background: '#EFEAE5', color: '#6B7280', border: '1px solid rgba(17, 24, 39, 0.08)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8.5px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #5F259F 0%, #461A76 100%)', color: '#FFFFFF', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(95, 37, 159, 0.35)' }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ADMIN CERTIFICATE PREVIEW MODAL COMPONENT                                  */
/* -------------------------------------------------------------------------- */
const AdminCertificateModal = ({ submission, onClose }) => {
  return <CertificateModal submission={submission} onClose={onClose} />;
};

export default AdminDashboard;
