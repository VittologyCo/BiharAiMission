// Storage utility for Exam Submissions and Certificate Verifications
import { supabase } from './supabase';
const STORAGE_KEY = 'bihar_ai_exam_submissions';
const SIGNATORIES_KEY = 'bihar_ai_cert_signatories';

export const hasUserPassedExamLevel = (userEmailOrId, examId) => {
  if (!userEmailOrId || !examId) return false;
  const cleanEmail = String(userEmailOrId).toLowerCase().trim();
  const cleanExamId = String(examId).toLowerCase().trim();

  const submissions = getExamSubmissions();
  return submissions.some((sub) => {
    const subEmail = String(sub.candidateEmail || sub.user_email || '').toLowerCase().trim();
    const subExamId = String(sub.examId || sub.masterclassId || sub.program_id || '').toLowerCase().trim();
    const isPass = sub.isPassed || sub.status === 'PASSED' || (typeof sub.percentage === 'number' && sub.percentage >= 75);
    return (subEmail === cleanEmail || subEmail.includes(cleanEmail) || cleanEmail.includes(subEmail)) &&
           (subExamId === cleanExamId || subExamId.includes(cleanExamId)) &&
           isPass;
  });
};

export const getExamLevelBadge = (examId = '', examTitle = '') => {
  const str = (examId + ' ' + examTitle).toLowerCase();
  if (str.includes('ai-fundamentals') || str.includes('fundamentals')) return 'LEVEL 1 · BEGINNER';
  if (str.includes('basics-of-prompts') || str.includes('prompts')) return 'LEVEL 2 · INTERMEDIATE';
  if (str.includes('ethics-in-ai') || str.includes('ethics') || str.includes('dpdp')) return 'LEVEL 3 · ADVANCED';
  if (str.includes('prompt-generation') || str.includes('generation') || str.includes('expert')) return 'LEVEL 4 · EXPERT';
  if (str.includes('prog-1')) return 'LEVEL 1 · BEGINNER';
  if (str.includes('prog-2')) return 'LEVEL 2 · EXECUTIVE';
  if (str.includes('prog-3')) return 'LEVEL 3 · ADVANCED LAB';
  return 'OFFICER CERTIFICATION';
};

export const getCleanCourseTitle = (rawTitle, examId = '', masterclassId = '') => {
  let title = (rawTitle || '').trim();

  // If rawTitle is an internal ID (e.g., mc-12345 or program-12345), ignore as title to force lookup/mapping
  if (/^(mc-|masterclass-|program-|course-|exam-|\d+$)/i.test(title)) {
    title = '';
  }

  // Strip trailing "Certification Exam", "Exam", "Certification"
  if (title) {
    title = title
      .replace(/\s*Certification\s*Exam$/i, '')
      .replace(/\s*Exam$/i, '')
      .replace(/\s*Certification$/i, '')
      .trim();
  }

  const genericTitles = ['AI', 'AI Masterclass', 'Online Masterclass', 'AI Course', 'Masterclass', 'Course', 'Exam'];

  // If title is valid and NOT generic, return it immediately!
  if (title && !genericTitles.includes(title)) {
    return title;
  }

  const targetId = String(examId || masterclassId || '').trim();
  const cleanTarget = targetId.toLowerCase().trim();

  // Standard Known Level & Program Mappings
  if (cleanTarget === 'ai-fundamentals' || cleanTarget.includes('fundamentals')) {
    return 'AI Fundamentals & Digital Governance';
  }
  if (cleanTarget === 'basics-of-prompts' || cleanTarget.includes('prompts')) {
    return 'Basics of Prompts & Workflow Automation';
  }
  if (cleanTarget === 'ethics-in-ai' || cleanTarget.includes('ethics') || cleanTarget.includes('dpdp')) {
    return 'Ethics in AI & DPDP Compliance';
  }
  if (cleanTarget === 'prompt-generation' || cleanTarget.includes('generation') || cleanTarget.includes('expert')) {
    return 'Prompt Generation & Advanced AI Engineering';
  }
  if (cleanTarget === 'prog-1') {
    return 'Basic AI & Digital Transformation for Civil Servants';
  }
  if (cleanTarget === 'prog-2') {
    return 'Executive AI Leadership & Governance Certification';
  }
  if (cleanTarget === 'prog-3') {
    return 'District AI Analytics & Public Grievance Lab';
  }

  // Search in live classes storage
  if (targetId) {
    try {
      const rawLive = localStorage.getItem('bihar_ai_live_classes_v1');
      if (rawLive) {
        const liveClasses = JSON.parse(rawLive);
        if (Array.isArray(liveClasses)) {
          const match = liveClasses.find(lc => 
            String(lc.id).trim() === targetId ||
            String(lc.id).trim().toLowerCase() === cleanTarget ||
            (lc.title && lc.title.trim().toLowerCase() === cleanTarget) ||
            (lc.courseName && lc.courseName.trim().toLowerCase() === cleanTarget)
          );
          if (match && (match.courseName || match.title)) {
            const matchedName = (match.courseName || match.title).trim();
            if (!genericTitles.includes(matchedName)) {
              return matchedName
                .replace(/\s*Certification\s*Exam$/i, '')
                .replace(/\s*Exam$/i, '')
                .replace(/\s*Certification$/i, '')
                .trim();
            }
          }
        }
      }
    } catch (e) {}

    // Search in programs storage
    try {
      const rawProg = localStorage.getItem('bihar_ai_programs_v5');
      if (rawProg) {
        const programs = JSON.parse(rawProg);
        if (Array.isArray(programs)) {
          const match = programs.find(p => 
            String(p.id).trim() === targetId ||
            String(p.id).trim().toLowerCase() === cleanTarget ||
            (p.title && p.title.trim().toLowerCase() === cleanTarget)
          );
          if (match && (match.title || match.course_name)) {
            const matchedName = (match.title || match.course_name).trim();
            if (!genericTitles.includes(matchedName)) return matchedName;
          }
        }
      }
    } catch (e) {}

    // Search in courses storage
    try {
      const rawCourses = localStorage.getItem('bihar_ai_courses_v5');
      if (rawCourses) {
        const courses = JSON.parse(rawCourses);
        if (Array.isArray(courses)) {
          const match = courses.find(c => 
            String(c.id).trim() === targetId ||
            String(c.id).trim().toLowerCase() === cleanTarget ||
            (c.title && c.title.trim().toLowerCase() === cleanTarget)
          );
          if (match && (match.title || match.course_name)) {
            const matchedName = (match.title || match.course_name).trim();
            if (!genericTitles.includes(matchedName)) return matchedName;
          }
        }
      }
    } catch (e) {}

    // Format targetId if it's readable (e.g. generative-ai-pk -> Generative Ai Pk)
    if (targetId && !/^(mc-|masterclass-|program-|course-|exam-|\d+$)/i.test(targetId)) {
      return targetId
        .split(/[-_]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }

  if (title) return title;

  return 'AI & Digital Transformation Masterclass';
};

export function getCleanCandidateName(rawName, email) {
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

// Generate mock 30-question responses for default sample candidates
const generateMockResponses = (wrongIndices = []) => {
  const sampleQuestions = [
    "What does Artificial Intelligence (AI) refer to in digital governance?",
    "Which machine learning subset focuses on neural networks with many layers?",
    "What is the primary function of Large Language Models (LLMs)?",
    "How does computer vision help public infrastructure monitoring in Bihar?",
    "What is prompt engineering in AI workflows?",
    "Which Bihar AI initiative focuses on digital skills certification?",
    "What is AI hallucination in automated responses?",
    "Why is human-in-the-loop essential for administrative decisions?",
    "What is the recommended rule when using AI tools for departmental decision-making?",
    "Which technology helps detect flood risks using satellite imagery in Bihar?",
    "What is natural language processing (NLP) used for in citizen services?",
    "How should sensitive citizen data be handled when interacting with AI tools?",
    "What does zero-shot prompting mean?",
    "What is the purpose of fine-tuning an AI model?",
    "Which measure prevents algorithmic bias in recruitment & public schemes?",
    "What is automated OCR (Optical Character Recognition) used for?",
    "What is the role of vector databases in AI retrieval systems?",
    "How does AI assist in smart agriculture for Bihar farmers?",
    "What is synthetic data in machine learning?",
    "Which metric measures AI model precision in diagnostic tasks?",
    "What is the primary benefit of edge AI in remote rural governance?",
    "How do chatbots improve public grievance redressal portals?",
    "What is transformer architecture in modern generative AI?",
    "Why is data encryption critical before feeding documents into AI cloud engines?",
    "What is a zero-trust security framework for AI departmental software?",
    "How does AI help in revenue & land records digitization?",
    "What is explainable AI (XAI) in public sector policy?",
    "Which open-source framework is widely used for building AI models?",
    "What is continuous learning in deployed machine learning systems?",
    "What is the ultimate objective of the Bihar AI Mission?"
  ];

  return sampleQuestions.map((qText, idx) => {
    const qId = idx + 1;
    const isWrong = wrongIndices.includes(qId);
    const correctOpt = 0;
    const selectedOpt = isWrong ? (correctOpt + 1) % 4 : correctOpt;
    return {
      questionId: qId,
      questionText: qText,
      selectedOption: selectedOpt,
      correctOption: correctOpt,
      isCorrect: !isWrong
    };
  });
};

const LEGACY_MOCK_IDS = [
  'BAIM-CERT-839201',
  'BAIM-CERT-471092',
  'BAIM-CERT-512930',
  'BAIM-CERT-392104'
];

export const defaultSubmissions = [];

export const getExamSubmissions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Auto-purge legacy mock entries & resolve clean course titles
        const cleaned = parsed.filter((s) => !LEGACY_MOCK_IDS.includes(s.credentialId)).map((s) => {
          const resolvedTitle = getCleanCourseTitle(s.examTitle || s.masterclassTitle, s.examId, s.masterclassId);
          return {
            ...s,
            examTitle: resolvedTitle,
            masterclassTitle: resolvedTitle,
          };
        });
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error reading exam submissions:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
};

export const fetchExamSubmissionsFromSupabase = async () => {
  try {
    if (supabase) {
      const [mcRes, offRes] = await Promise.all([
        supabase.from('masterclass_exam_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('officer_program_exam_submissions').select('*').order('submitted_at', { ascending: false })
      ]);

      const allRows = [
        ...(Array.isArray(mcRes.data) ? mcRes.data : []),
        ...(Array.isArray(offRes.data) ? offRes.data : [])
      ];

      if (allRows.length > 0) {
        const mapped = allRows.map((d) => {
          const resolvedTitle = getCleanCourseTitle(d.masterclass_title || d.program_title || d.exam_id, d.exam_id, d.masterclass_id || d.program_id);
          return {
            id: d.id || d.credential_id,
            credentialId: d.credential_id || d.id,
            candidateName: d.candidate_name,
            candidateEmail: d.candidate_email,
            candidateDesignation: d.candidate_designation || 'Government Officer',
            examTitle: resolvedTitle,
            masterclassTitle: resolvedTitle,
            programTitle: resolvedTitle,
            score: Number(d.score || 0),
            total: Number(d.total || 30),
            percentage: Number(d.percentage || 0),
            warningCount: d.warning_count || 0,
            penaltyDeduction: d.penalty_deduction || 0,
            attemptsCount: Number(d.attempts_count || d.attempts || 1),
            status: d.status || (d.is_approved ? 'APPROVED' : 'PASSED'),
            isPassed: d.is_passed !== false,
            isApproved: Boolean(d.is_approved === true || d.status === 'APPROVED'),
            isViolated: !!d.is_violated,
            isDownloaded: !!d.is_downloaded,
            timeTakenSeconds: d.time_taken_seconds || 0,
            submittedAt: d.submitted_at,
            dateFolder: d.date_folder || (d.submitted_at ? d.submitted_at.split('T')[0] : ''),
            questionResponses: d.question_responses || [],
          };
        });

        const currentLocal = getExamSubmissions();
        const map = new Map();

        // Overlay unique credentialIds
        mapped.forEach((remoteItem) => {
          if (remoteItem && remoteItem.credentialId) {
            map.set(remoteItem.credentialId.toUpperCase(), remoteItem);
          }
        });

        currentLocal.forEach((item) => {
          if (item && item.credentialId && !map.has(item.credentialId.toUpperCase())) {
            map.set(item.credentialId.toUpperCase(), item);
          }
        });

        const merged = Array.from(map.values()).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('bihar_ai_exams_updated'));
        return merged;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch exam submissions error:', err);
  }
  return getExamSubmissions();
};

export const saveExamSubmission = async (submission) => {
  const current = getExamSubmissions();
  
  // Ensure dateFolder format YYYY-MM-DD
  const dateFolder = submission.dateFolder || 
    (submission.submittedAt ? submission.submittedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
  
  const resolvedTitle = getCleanCourseTitle(submission.masterclassTitle || submission.examTitle, submission.examId, submission.masterclassId);
  const emailKey = String(submission.candidateEmail || '').toLowerCase().trim();
  const classKey = String(submission.masterclassId || submission.examId || '').trim();

  // Calculate total previous attempts for this candidate & exam
  const previousAttempts = current.filter(s =>
    String(s.candidateEmail || '').toLowerCase().trim() === emailKey &&
    String(s.masterclassId || s.examId || '').trim() === classKey
  ).length;

  const attemptsCount = submission.attemptsCount || submission.attempts || (previousAttempts + 1);

  const enrichedSubmission = {
    ...submission,
    examTitle: resolvedTitle,
    masterclassTitle: resolvedTitle,
    dateFolder,
    attemptsCount,
    status: submission.status || (submission.isViolated ? 'VIOLATED' : submission.isPassed ? 'PASSED' : submission.percentage > 0 ? 'FAILED' : 'IN_PROGRESS')
  };

  const existingIdx = current.findIndex((s) => s.credentialId === enrichedSubmission.credentialId);
  let updated;
  if (existingIdx >= 0) {
    current[existingIdx] = enrichedSubmission;
    updated = [...current];
  } else {
    updated = [enrichedSubmission, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync to Supabase tables
  try {
    if (supabase) {
      const basePayload = {
        id: enrichedSubmission.credentialId || enrichedSubmission.id || 'cert_' + Date.now(),
        credential_id: enrichedSubmission.credentialId || enrichedSubmission.id || 'cert_' + Date.now(),
        candidate_name: enrichedSubmission.candidateName || 'Candidate',
        candidate_email: enrichedSubmission.candidateEmail || '',
        candidate_designation: enrichedSubmission.candidateDesignation || 'Government Officer',
        score: Math.round(Number(enrichedSubmission.score || 0)),
        total: Number(enrichedSubmission.total || 30),
        percentage: Math.round(Number(enrichedSubmission.percentage || 0)),
        status: enrichedSubmission.status || 'PASSED',
        is_passed: !!enrichedSubmission.isPassed,
        is_approved: !!enrichedSubmission.isApproved,
        is_violated: !!enrichedSubmission.isViolated,
        is_downloaded: !!enrichedSubmission.isDownloaded,
        time_taken_seconds: Number(enrichedSubmission.timeTakenSeconds || 0),
        submitted_at: enrichedSubmission.submittedAt || new Date().toISOString()
      };

      const mcPayload = {
        ...basePayload,
        masterclass_id: String(enrichedSubmission.masterclassId || enrichedSubmission.examId || 'masterclass_1'),
        masterclass_title: enrichedSubmission.masterclassTitle || 'Masterclass Certification Exam'
      };

      const offPayload = {
        ...basePayload,
        program_id: String(enrichedSubmission.programId || enrichedSubmission.masterclassId || enrichedSubmission.examId || 'prog-1'),
        program_title: enrichedSubmission.programTitle || enrichedSubmission.masterclassTitle || 'Officer Program Certification'
      };

      const isOfficerProg = String(enrichedSubmission.examId || enrichedSubmission.masterclassId || '').startsWith('prog-');

      if (isOfficerProg) {
        await supabase.from('officer_program_exam_submissions').upsert([offPayload]);
      } else {
        await supabase.from('masterclass_exam_submissions').upsert([mcPayload]);
      }
    }
  } catch (err) {
    console.warn('Supabase exam submissions sync error:', err);
    return { success: false, error: err.message };
  }

  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return { success: true, data: updated };
};

export const getExamDateFolders = () => {
  const submissions = getExamSubmissions();
  const folderMap = new Map();

  submissions.forEach((sub) => {
    const folder = sub.dateFolder || (sub.submittedAt ? sub.submittedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
    folderMap.set(folder, (folderMap.get(folder) || 0) + 1);
  });

  const sortedFolders = Array.from(folderMap.keys()).sort((a, b) => b.localeCompare(a));
  return sortedFolders.map((folder) => ({
    dateFolder: folder,
    count: folderMap.get(folder),
    formattedDate: new Date(folder + 'T00:00:00').toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }));
};

export const getExamSubmissionsByDate = (dateFolder) => {
  const submissions = getExamSubmissions();
  if (!dateFolder || dateFolder === 'ALL') {
    return submissions;
  }
  return submissions.filter((s) => {
    const folder = s.dateFolder || (s.submittedAt ? s.submittedAt.split('T')[0] : '');
    return folder === dateFolder;
  });
};

export const getOverallQuestionAnalytics = (dateFolder = 'ALL') => {
  const submissions = getExamSubmissionsByDate(dateFolder);
  const questionStatsMap = new Map();

  submissions.forEach((sub) => {
    if (!sub.questionResponses || !Array.isArray(sub.questionResponses)) return;

    sub.questionResponses.forEach((res) => {
      const qId = res.questionId;
      if (!questionStatsMap.has(qId)) {
        questionStatsMap.set(qId, {
          questionId: qId,
          questionText: res.questionText || `Question ${qId}`,
          totalAttempts: 0,
          rightCount: 0,
          wrongCount: 0,
          optionCounts: { 0: 0, 1: 0, 2: 0, 3: 0 }
        });
      }

      const qStat = questionStatsMap.get(qId);
      qStat.totalAttempts += 1;
      if (res.isCorrect) {
        qStat.rightCount += 1;
      } else {
        qStat.wrongCount += 1;
      }

      if (res.selectedOption !== undefined && res.selectedOption !== null && res.selectedOption >= 0) {
        qStat.optionCounts[res.selectedOption] = (qStat.optionCounts[res.selectedOption] || 0) + 1;
      }
    });
  });

  const analyticsArray = Array.from(questionStatsMap.values()).map((q) => {
    const accuracy = q.totalAttempts > 0 ? Math.round((q.rightCount / q.totalAttempts) * 100) : 0;
    return {
      ...q,
      accuracy,
      wrongPercentage: 100 - accuracy
    };
  });

  analyticsArray.sort((a, b) => a.questionId - b.questionId);
  return analyticsArray;
};

export const approveExamCertificate = async (credentialId) => {
  const current = getExamSubmissions();
  let targetSubmission = null;
  const updated = current.map((s) => {
    if (s.credentialId === credentialId || s.id === credentialId) {
      targetSubmission = { ...s, isApproved: true, status: 'APPROVED', approvedAt: new Date().toISOString() };
      return targetSubmission;
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (supabase && (credentialId)) {
    try {
      const nowIso = new Date().toISOString();
      await Promise.all([
        supabase
          .from('masterclass_exam_submissions')
          .update({ is_approved: true, status: 'APPROVED', approved_at: nowIso })
          .or(`id.eq.${credentialId},credential_id.eq.${credentialId}`),
        supabase
          .from('officer_program_exam_submissions')
          .update({ is_approved: true, status: 'APPROVED', approved_at: nowIso })
          .or(`id.eq.${credentialId},credential_id.eq.${credentialId}`)
      ]);
    } catch (e) {
      console.warn('Supabase approve certificate error:', e);
      return { success: false, error: e.message };
    }
  }

  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return { success: true, data: updated };
};

export const approveAllExamCertificatesForMasterclass = async (masterclassId = 'ALL') => {
  const current = getExamSubmissions();
  const nowIso = new Date().toISOString();
  const updated = current.map((s) => {
    const sClassId = String(s.masterclassId || s.examId || '');
    const matches = !masterclassId || masterclassId === 'ALL' || sClassId === String(masterclassId);
    if (matches && s.isPassed && !s.isApproved) {
      return { ...s, isApproved: true, status: 'APPROVED', approvedAt: nowIso };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  if (supabase) {
    try {
      const tables = ['masterclass_exam_submissions', 'officer_program_exam_submissions'];
      for (const table of tables) {
        if (masterclassId && masterclassId !== 'ALL') {
          await supabase
            .from(table)
            .update({ is_approved: true, status: 'APPROVED', approved_at: nowIso })
            .eq('is_passed', true)
            .or(`masterclass_id.eq.${masterclassId},program_id.eq.${masterclassId}`);
        } else {
          await supabase
            .from(table)
            .update({ is_approved: true, status: 'APPROVED', approved_at: nowIso })
            .eq('is_passed', true);
        }
      }
    } catch (e) {
      console.warn('Supabase approve all certificates error:', e);
      return { success: false, error: e.message };
    }
  }

  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return { success: true, data: updated };
};

export const approveAllExamCertificates = (dateFolder = 'ALL') => {
  return approveAllExamCertificatesForMasterclass(dateFolder);
};

export const verifyCertificate = (credentialId) => {
  if (!credentialId || !credentialId.trim()) {
    return { status: 'EMPTY' };
  }

  const cleanId = credentialId.trim().toUpperCase();
  const current = getExamSubmissions();

  const found = current.find((s) => s.credentialId.toUpperCase() === cleanId);

  if (!found) {
    return {
      status: 'FAKE',
      isValid: false,
      message: 'No record found. This certificate ID is unverified or fake.',
    };
  }

  if (!found.isApproved) {
    return {
      status: 'PENDING',
      isValid: false,
      message: 'Certificate is under Admin review and not yet published by Administrator.',
      data: found,
    };
  }

  return {
    status: 'REAL',
    isValid: true,
    message: 'Official Verified Bihar AI Mission Certificate',
    data: found,
  };
};

export const markCertificateAsDownloaded = (credentialId) => {
  const current = getExamSubmissions();
  const updated = current.map((s) => {
    if (s.credentialId === credentialId) {
      return { ...s, isDownloaded: true };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return updated;
};

export const deleteExamSubmission = (idOrCredentialId) => {
  if (!idOrCredentialId) return getExamSubmissions();
  const targetId = String(idOrCredentialId).trim().toLowerCase();
  const current = getExamSubmissions();
  const updated = current.filter((s) => {
    const sId = String(s.credentialId || s.credential_id || s.id || '').trim().toLowerCase();
    return sId !== targetId && s.credentialId !== idOrCredentialId;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Sync deletion with Supabase if available
  try {
    if (supabase) {
      supabase
        .from('masterclass_exam_submissions')
        .delete()
        .or(`credential_id.eq.${idOrCredentialId},id.eq.${idOrCredentialId}`)
        .then(() => {})
        .catch(() => {});

      supabase
        .from('officer_program_exam_submissions')
        .delete()
        .or(`credential_id.eq.${idOrCredentialId},id.eq.${idOrCredentialId}`)
        .then(() => {})
        .catch(() => {});
    }
  } catch (e) {
    // Graceful fallback
  }

  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return updated;
};

export const clearAllExamSubmissions = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

  // Sync clear with Supabase if available
  try {
    if (supabase) {
      supabase
        .from('masterclass_exam_submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .then(() => {})
        .catch(() => {});

      supabase
        .from('officer_program_exam_submissions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .then(() => {})
        .catch(() => {});
    }
  } catch (e) {
    // Graceful fallback
  }

  window.dispatchEvent(new Event('bihar_ai_exams_updated'));
  return [];
};

export const getCertificateSignatories = () => {
  try {
    const data = localStorage.getItem(SIGNATORIES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Error reading certificate signatories:', e);
  }
  return { director: '', registrar: '' };
};

export const fetchCertificateSignatoriesFromSupabase = async () => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'certificate_signatories')
        .maybeSingle();

      if (!error && data && data.value) {
        localStorage.setItem(SIGNATORIES_KEY, JSON.stringify(data.value));
        return data.value;
      }
    }
  } catch (e) {
    console.warn('Supabase fetch signatories error:', e);
  }
  return getCertificateSignatories();
};

export const setCertificateSignatories = async (director, registrar) => {
  const obj = { director: (director || '').trim(), registrar: (registrar || '').trim() };
  localStorage.setItem(SIGNATORIES_KEY, JSON.stringify(obj));
  try {
    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({
        key: 'certificate_signatories',
        value: obj
      });
      if (error) {
        console.error('Supabase save signatories error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data: obj };
    }
  } catch (e) {
    console.error('Supabase save signatories exception:', e);
    return { success: false, error: e.message || 'Network error' };
  }
  return { success: true, data: obj };
};
