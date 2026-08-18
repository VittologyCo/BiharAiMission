import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getIstTimestamp } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
import { getLiveClassesFromStorage, getProgramsFromStorage, fetchUserMasterclassEnrollmentsFromSupabase, fetchUserOfficerProgramEnrollmentsFromSupabase, saveOfficerProgramEnrollmentToSupabase, saveMasterclassEnrollmentToSupabase, getUserCourseProgress, getSessionEndedStatus } from '../../utils/coursesStorage';
import { getExamSubmissions, fetchExamSubmissionsFromSupabase } from '../../utils/examStorage';
import CertificateModal from '../../components/CertificateModal/CertificateModal';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import SEO from '../../components/SEO/SEO';
import './UserProfilePage.responsive.css';

const biharDistricts = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Purnia', 'Rohtas', 'Nalanda',
  'Begusarai', 'Saran', 'Bhojpur', 'East Champaran', 'West Champaran', 'Samastipur', 'Katihar',
  'Vaishali', 'Saharsa', 'Munger', 'Sitamarhi', 'Buxar', 'Siwan', 'Kishanganj', 'Araria',
  'Gopalganj', 'Jehanabad', 'Arwal', 'Aurangabad', 'Banka', 'Bhabua (Kaimur)', 'Jamui',
  'Khagaria', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Nawada', 'Sheohar', 'Sheikhpura', 'Supaul'
];

const indianStates = [
  'Bihar',
  'Jharkhand',
  'Uttar Pradesh',
  'West Bengal',
  'Delhi (NCT)',
  'Maharashtra',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Punjab',
  'Haryana',
  'Uttarakhand',
  'Chhattisgarh',
  'Odisha',
  'Assam',
  'Telangana',
  'Andhra Pradesh',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Ladakh',
  'Goa',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
  'Andaman & Nicobar Islands',
  'Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu',
  'Lakshadweep',
  'Puducherry',
  'Other'
];

const blockSuggestionsMap = {
  'Patna': ['Danapur', 'Phulwari Sharif', 'Patna Sadar', 'Sampatchak', 'Fatuha', 'Bakhtiyarpur', 'Barh', 'Bihta', 'Maner', 'Paliganj', 'Naubatpur', 'Khusrupur', 'Punpun', 'Masaurhi'],
  'Nawada': ['Warisaliganj', 'Nawada Sadar', 'Rajauli', 'Pakribarawan', 'Hisua', 'Nardiganj', 'Kashi Chak', 'Gobindpur', 'Meskaur', 'Narhat', 'Akbarpur', 'Roh'],
  'Gaya': ['Gaya Sadar', 'Bodh Gaya', 'Sherghati', 'Tekari', 'Wazirganj', 'Manpur', 'Atri', 'Imamganj', 'Belaganj', 'Khizarsarai', 'Mohanpur', 'Fatehpur'],
  'Muzaffarpur': ['Muzaffarpur Sadar', 'Kanti', 'Motipur', 'Marwan', 'Kurhani', 'Sakra', 'Bochahan', 'Minapur', 'Musahari', 'Paroo', 'Sahebganj', 'Aurai'],
  'Bhagalpur': ['Bhagalpur Sadar', 'Nathnagar', 'Sabour', 'Kahalgaon', 'Sultanganj', 'Pirpainti', 'Shahkund', 'Bihpur', 'Naugachhia'],
  'Darbhanga': ['Darbhanga Sadar', 'Keoti', 'Jale', 'Benipur', 'Biraul', 'Bahadurpur', 'Hayaghat', 'Singhwara', 'Hanuman Nagar'],
  'Purnia': ['Purnia Sadar', 'Kasba', 'Dhamdaha', 'Banmankhi', 'Baisa', 'Amour', 'Bhawani Pur', 'Rupauli'],
  'Rohtas': ['Sasaram', 'Dehri', 'Bikramganj', 'Nokha', 'Kargahar', 'Chenari', 'Sheosagar', 'Dawath'],
  'Nalanda': ['Biharsharif', 'Rajgir', 'Hilsa', 'Asthawan', 'Ekangarsarai', 'Harnaut', 'Islampur', 'Giriak'],
  'Begusarai': ['Begusarai Sadar', 'Barauni', 'Teghra', 'Bachhwara', 'Bakhri', 'Ballia', 'Cheria Bariarpur', 'Mahi Bhagwanpur'],
  'Saran': ['Chapra', 'Marhaura', 'Revelganj', 'Sonepur', 'Ekma', 'Garkha', 'Parsa', 'Baniapur'],
  'Bhojpur': ['Ara Sadar', 'Jagdispur', 'Piro', 'Bihiya', 'Shahpur', 'Koilwar', 'Udwantnagar', 'Garahani']
};

const availableInterests = [
  'AI Governance & Public Policy',
  'AgriTech AI Solutioning',
  'MedTech & Maternal Health AI',
  'EdTech & Vernacular AI',
  'Smart Municipal & Citizen Services',
  'Machine Learning & Data Engineering',
  'Disaster Management & Flood Forecasting'
];

function parseExperience(exp) {
  if (exp === null || exp === undefined) return { val: '', unit: 'Years' };
  const str = String(exp).trim();
  if (!str) return { val: '', unit: 'Years' };

  if (str.toLowerCase().includes('month')) {
    const num = str.replace(/[^0-9.]/g, '');
    return { val: num, unit: 'Months' };
  }
  const num = str.replace(/[^0-9.]/g, '');
  return { val: num, unit: 'Years' };
}

export default function UserProfilePage({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return (location.state && location.state.activeTab) || 'masterclasses';
  });

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Saved Submission state
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [activeCertSubmission, setActiveCertSubmission] = useState(null);

  // Form input state - start with clean empty values (no fake pre-filled defaults)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    gender: '',
    age: '',
    role_type: '',
    designation: '',
    department: '',
    organization: '',
    experience_val: '',
    experience_unit: 'Years',
    state: 'Bihar',
    district: '',
    block_city: '',
    interests: [],
    custom_interest: '',
    intent: '',
    contribution: '',
    linkedin: '',
    portfolio: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);

  const isBiharState = !formData.state || formData.state === 'Bihar';

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.fullName || prev.full_name,
        email: user.email || prev.email,
        mobile: (user.phone && user.phone !== 'N/A') ? user.phone : prev.mobile,
        designation: (user.designation && user.designation !== 'Member' && user.designation !== 'Officer / Citizen') ? user.designation : prev.designation,
        district: (user.district && user.district !== 'Bihar') ? user.district : prev.district
      }));
    }
  }, [user]);

  // Check for existing saved submission in Supabase or localStorage
  useEffect(() => {
    async function checkExisting() {
      if (!user || !user.email) return;

      let isSavedLocally = false;
      let localSub = null;
      try {
        if (localStorage.getItem(`bihar_ai_profile_saved_${user.email.toLowerCase().trim()}`) === 'true') {
          isSavedLocally = true;
        }
        const localSubs = JSON.parse(localStorage.getItem('bihar_ai_local_submissions') || '[]');
        localSub = localSubs.find(s => s.email && s.email.toLowerCase() === user.email.toLowerCase());
        if (localSub && (localSub.is_profile_locked || localSub.is_profile_saved)) {
          isSavedLocally = true;
        }
      } catch (lsErr) {}

      try {
        if (supabase) {
          const { data } = await supabase
            .from('user_details')
            .select('*')
            .eq('email', user.email.trim())
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0) {
            setExistingSubmission({
              ...data[0],
              is_profile_locked: data[0].is_profile_locked || isSavedLocally || Boolean(localSub?.is_profile_locked),
              is_profile_saved: data[0].is_profile_saved || isSavedLocally || Boolean(localSub?.is_profile_saved)
            });
            return;
          }
        }
      } catch (err) {}

      if (localSub) {
        setExistingSubmission({
          ...localSub,
          is_profile_locked: localSub.is_profile_locked || isSavedLocally,
          is_profile_saved: localSub.is_profile_saved || isSavedLocally
        });
      }
    }
    checkExisting();
  }, [user]);

  const [remoteEnrolledClassIds, setRemoteEnrolledClassIds] = useState([]);
  const [remoteEnrollments, setRemoteEnrollments] = useState([]);
  const [remoteOfficerEnrollments, setRemoteOfficerEnrollments] = useState([]);

  const loadRemoteEnrollments = async () => {
    if (!user || !user.email) return;
    try {
      // Fetch remote database enrollments from Supabase masterclass_enrollments & officer_program_enrollments
      const enrollments = await fetchUserMasterclassEnrollmentsFromSupabase(user.email);
      const officerEnrollments = await fetchUserOfficerProgramEnrollmentsFromSupabase(user.email);
      
      if (!enrollments || enrollments.length === 0) {
        setRemoteEnrollments([]);
        setRemoteEnrolledClassIds([]);
      } else {
        setRemoteEnrollments(enrollments);
        const ids = enrollments.map((e) => String(e.class_id));
        setRemoteEnrolledClassIds(ids);
      }

      if (officerEnrollments && officerEnrollments.length > 0) {
        setRemoteOfficerEnrollments(officerEnrollments);
      } else {
        setRemoteOfficerEnrollments([]);
      }
    } catch (err) {
      console.warn('Error loading remote enrollments from Supabase:', err);
    }
  };

  useEffect(() => {
    loadRemoteEnrollments();
    const handleEvents = () => loadRemoteEnrollments();
    window.addEventListener('bihar_ai_programs_updated', handleEvents);
    window.addEventListener('bihar_ai_progress_updated', handleEvents);
    return () => {
      window.removeEventListener('bihar_ai_programs_updated', handleEvents);
      window.removeEventListener('bihar_ai_progress_updated', handleEvents);
    };
  }, [user]);

  // Sync existing submission data into formData
  useEffect(() => {
    if (existingSubmission) {
      const cleanDesignation = (existingSubmission.designation && existingSubmission.designation !== 'Member' && existingSubmission.designation !== 'Officer / Citizen')
        ? existingSubmission.designation : '';
      const cleanDistrict = (existingSubmission.district && existingSubmission.district !== 'Bihar')
        ? existingSubmission.district : '';
      const cleanRoleType = (existingSubmission.role_type && existingSubmission.role_type !== 'Registered User')
        ? existingSubmission.role_type : '';
      const cleanMobile = (existingSubmission.mobile && existingSubmission.mobile !== 'N/A')
        ? existingSubmission.mobile : '';
      const parsedExp = parseExperience(existingSubmission.experience);

      const subInterests = Array.isArray(existingSubmission.interests) ? existingSubmission.interests : [];
      const selectedPredefined = subInterests.filter(i => availableInterests.includes(i));
      const customInterests = subInterests.filter(i => !availableInterests.includes(i));

      setFormData(prev => ({
        ...prev,
        full_name: existingSubmission.full_name || prev.full_name,
        email: existingSubmission.email || prev.email,
        mobile: cleanMobile || prev.mobile,
        gender: existingSubmission.gender || prev.gender,
        age: existingSubmission.age || prev.age,
        role_type: cleanRoleType || prev.role_type,
        designation: cleanDesignation || prev.designation,
        department: existingSubmission.department || prev.department,
        organization: existingSubmission.organization || prev.organization,
        experience_val: parsedExp.val || prev.experience_val,
        experience_unit: parsedExp.unit || prev.experience_unit,
        state: existingSubmission.state || prev.state || 'Bihar',
        district: cleanDistrict || prev.district,
        block_city: existingSubmission.block_city || prev.block_city,
        interests: selectedPredefined.length > 0 ? selectedPredefined : prev.interests,
        custom_interest: customInterests.length > 0 ? customInterests.join(', ') : prev.custom_interest,
        intent: existingSubmission.intent || prev.intent,
        contribution: existingSubmission.contribution || prev.contribution,
        linkedin: existingSubmission.linkedin || prev.linkedin,
        portfolio: existingSubmission.portfolio || prev.portfolio,
      }));
    }
  }, [existingSubmission]);

  // Helper to check if user has explicitly filled and saved their profile details
  const isProfileSaved = Boolean(
    (existingSubmission && (existingSubmission.is_profile_locked || existingSubmission.is_profile_saved)) ||
    (user && user.email && localStorage.getItem(`bihar_ai_profile_saved_${user.email.toLowerCase().trim()}`) === 'true')
  );

  // Helper to check if a specific field is locked (ONLY locked if profile was explicitly saved by user AND field has non-empty user-input saved value)
  const isFieldLocked = (fieldKey) => {
    if (!existingSubmission || !isProfileSaved) return false;
    if (fieldKey === 'email') return true;

    const val = existingSubmission[fieldKey];
    if (val === null || val === undefined) return false;
    const strVal = String(val).trim();
    if (!strVal || strVal === 'N/A') return false;

    // Filter out auto-sync default placeholders
    if (fieldKey === 'role_type' && strVal === 'Registered User') return false;
    if (fieldKey === 'designation' && (strVal === 'Member' || strVal === 'Officer / Citizen')) return false;
    if (fieldKey === 'district' && strVal === 'Bihar') return false;
    if (fieldKey === 'state' && strVal === 'Bihar') return false;

    if (Array.isArray(val)) {
      return val.length > 0;
    }

    // Check if user explicitly saved this field
    try {
      if (user && user.email) {
        const savedFieldsStr = localStorage.getItem(`bihar_ai_user_saved_fields_${user.email.toLowerCase().trim()}`);
        if (savedFieldsStr) {
          const savedFields = JSON.parse(savedFieldsStr);
          if (Array.isArray(savedFields)) {
            return savedFields.includes(fieldKey);
          }
        }
      }
    } catch (e) {}

    // State field is ALWAYS unlocked unless explicitly saved by user in user_saved_fields
    if (fieldKey === 'state') return false;

    return Boolean(strVal);
  };

  // Section level locking helpers
  const isPersonalSectionLocked = isFieldLocked('full_name') && isFieldLocked('mobile') && isFieldLocked('gender') && isFieldLocked('age');
  const isProfSectionLocked = isFieldLocked('role_type') && isFieldLocked('designation') && isFieldLocked('department') && isFieldLocked('organization') && isFieldLocked('experience');
  const isLocSectionLocked = isFieldLocked('district') && isFieldLocked('block_city') && isFieldLocked('state');
  const isIntentSectionLocked = isFieldLocked('interests') && isFieldLocked('intent');
  const isLinksSectionLocked = isFieldLocked('contribution') && isFieldLocked('linkedin') && isFieldLocked('portfolio');

  const allFieldsLocked = Boolean(
    isProfileSaved &&
    isPersonalSectionLocked &&
    isProfSectionLocked &&
    isLocSectionLocked &&
    isIntentSectionLocked &&
    isLinksSectionLocked
  );

  // Fetch user exam submissions / certificates dynamically from Supabase database
  const [userSubmissions, setUserSubmissions] = useState([]);

  useEffect(() => {
    async function syncUserExams() {
      if (!user || !user.email) return;
      const all = await fetchExamSubmissionsFromSupabase();
      if (all && Array.isArray(all)) {
        const filtered = all.filter((sub) => {
          if (!sub.candidateEmail && !sub.candidateName) return false;
          return (
            (sub.candidateEmail && sub.candidateEmail.toLowerCase() === user.email.toLowerCase()) ||
            (sub.candidateName && user.fullName && sub.candidateName.toLowerCase().includes(user.fullName.toLowerCase()))
          );
        });
        setUserSubmissions(filtered);
      }
    }

    syncUserExams();

    const handleUpdate = () => syncUserExams();
    window.addEventListener('bihar_ai_exams_updated', handleUpdate);
    return () => window.removeEventListener('bihar_ai_exams_updated', handleUpdate);
  }, [user]);

  const modalSubmission = React.useMemo(() => {
    if (!activeCertSubmission) return null;
    const cleanDesig = (existingSubmission?.designation && !['member', 'registered user', 'officer / citizen'].includes(existingSubmission.designation.toLowerCase().trim()))
      ? existingSubmission.designation
      : (user?.designation && !['member', 'registered user', 'officer / citizen'].includes(user.designation.toLowerCase().trim()))
        ? user.designation
        : (activeCertSubmission.candidateDesignation && !['member', 'registered user', 'officer / citizen'].includes(activeCertSubmission.candidateDesignation.toLowerCase().trim()))
          ? activeCertSubmission.candidateDesignation
          : '';

    return {
      ...activeCertSubmission,
      candidateDesignation: cleanDesig
    };
  }, [activeCertSubmission, existingSubmission?.designation, user?.designation]);

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <div style={{
        minHeight: '75vh',
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
          maxWidth: '480px',
          width: '100%',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'rgba(193, 85, 44, 0.12)',
            border: '1px solid rgba(226, 139, 92, 0.3)',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto',
            color: 'var(--color-terracotta-500, #C1552C)',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            BIHAR AI MISSION LEARNING HUB
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 10px 0' }}>
            {isHi ? 'लॉगिन आवश्यक है 🔒' : 'Login Required 🔒'}
          </h2>
          <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.55', margin: '0 0 24px 0' }}>
            {isHi
              ? 'अपने डैशबोर्ड, एनरोल किए गए मास्टरक्लास और प्रमाणपत्रों तक पहुंचने के लिए कृपया लॉगिन करें।'
              : 'Please log in to view your learning dashboard, joined masterclasses, and earned certificates.'}
          </p>
          <button
            onClick={() => onOpenAuth && onOpenAuth('login')}
            style={{
              width: '100%',
              height: '42px',
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(24, 21, 18, 0.25)',
            }}
          >
            {isHi ? 'लॉग इन करें →' : 'Log In to Access Dashboard →'}
          </button>
        </div>
      </div>
    );
  }

  // Get User Initials
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'AI';
  };

  const userKey = user && user.email ? user.email.toLowerCase().trim() : null;

  // Helper to retrieve enrollment date
  const getJoinedDate = (itemId) => {
    if (!userKey || !itemId) return new Date().toLocaleDateString();
    try {
      const savedDate = localStorage.getItem(`bihar_ai_enrolled_date_${userKey}_${itemId}`) ||
                        localStorage.getItem(`bihar_ai_enrolled_date_${itemId}`);
      if (savedDate) return savedDate;
    } catch (err) {}
    return new Date().toLocaleDateString();
  };

  // Build list of Joined Masterclasses DIRECTLY FROM SUPABASE DATABASE TABLE (masterclass_enrollments)
  const masterclassesMap = new Map();
  const allLiveClasses = getLiveClassesFromStorage();

  // 1. Process database enrollments fetched directly from Supabase masterclass_enrollments table
  remoteEnrollments.forEach((enr) => {
    if (!enr.class_id) return;
    const strId = String(enr.class_id);
    const matchingLive = allLiveClasses.find(c => String(c.id) === strId);
    let formattedDate = getJoinedDate(strId);
    if (enr.enrolled_at) {
      try { formattedDate = new Date(enr.enrolled_at).toLocaleDateString(); } catch (e) {}
    }

    masterclassesMap.set(strId, {
      id: strId,
      title: enr.class_title || (matchingLive && (matchingLive.courseName || matchingLive.title)) || 'Live Masterclass',
      category: (matchingLive && matchingLive.category) || 'Live Masterclass',
      description: (matchingLive && (matchingLive.courseDesc || matchingLive.description)) || 'Bihar AI Mission Live Masterclass',
      joinedDate: formattedDate
    });
  });

  // 2. Process active masterclasses where remoteEnrolledClassIds includes classId
  allLiveClasses.forEach((item) => {
    if (!userKey) return;
    const strId = String(item.id);
    if (remoteEnrolledClassIds.includes(strId) && !masterclassesMap.has(strId)) {
      masterclassesMap.set(strId, {
        id: strId,
        title: item.courseName || item.title || 'Live Masterclass',
        category: item.category || 'Live Masterclass',
        description: item.courseDesc || item.description || '',
        joinedDate: getJoinedDate(strId)
      });
    }
  });

  // 3. Process exam submissions (if user completed exam / earned certificate for an enrolled class)
  userSubmissions.forEach((sub) => {
    const classId = String(sub.examId || sub.masterclassId || sub.id || 'mc_exam');
    if (!masterclassesMap.has(classId) && remoteEnrolledClassIds.includes(classId)) {
      let formattedDate = getJoinedDate(classId);
      if (sub.createdAt || sub.date) {
        try { formattedDate = new Date(sub.createdAt || sub.date).toLocaleDateString(); } catch (e) {}
      }
      masterclassesMap.set(classId, {
        id: classId,
        title: sub.courseTitle || sub.masterclassTitle || 'Generative AI Masterclass',
        category: 'Live Masterclass',
        description: 'Bihar AI Mission Masterclass Certification Exam',
        joinedDate: formattedDate
      });
    }
  });

  const joinedMasterclasses = Array.from(masterclassesMap.values());

  // Fetch all officer programs & filter ONLY enrolled officer programs
  const officerPrograms = getProgramsFromStorage();
  const joinedOfficerPrograms = officerPrograms.filter((item) => {
    if (!userKey) return false;
    try {
      return (
        localStorage.getItem(`bihar_ai_enrolled_${userKey}_${item.id}`) === 'true' ||
        localStorage.getItem(`bihar_ai_enrolled_${item.id}`) === 'true'
      );
    } catch {
      return false;
    }
  });

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      const updated = exists
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Require Full Name and Email
    if (!formData.full_name.trim() || !formData.email.trim()) {
      setFormError('⚠️ Please provide your Full Name and Email.');
      return;
    }

    setFormSubmitting(true);

    const cleanAge = parseInt(formData.age, 10);
    const cleanExpVal = parseInt(formData.experience_val, 10);
    const cleanExp = isNaN(cleanExpVal) ? null : cleanExpVal;

    let experienceCombined = '';
    if (cleanExp !== null) {
      const unit = formData.experience_unit || 'Years';
      experienceCombined = `${cleanExp} ${unit}`;
    }

    const customList = formData.custom_interest
      ? formData.custom_interest.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const combinedInterests = Array.from(new Set([...(formData.interests || []), ...customList]));

    // Track which fields were explicitly given input by user
    const userSavedFields = [];
    if (formData.full_name.trim()) userSavedFields.push('full_name');
    if (formData.mobile.trim() && formData.mobile.trim() !== 'N/A') userSavedFields.push('mobile');
    if (formData.gender.trim()) userSavedFields.push('gender');
    if (!isNaN(cleanAge) && cleanAge > 0) userSavedFields.push('age');
    if (formData.role_type.trim() && formData.role_type !== 'Registered User') userSavedFields.push('role_type');
    if (formData.designation.trim() && formData.designation !== 'Member' && formData.designation !== 'Officer / Citizen') userSavedFields.push('designation');
    if (formData.department.trim()) userSavedFields.push('department');
    if (formData.organization.trim()) userSavedFields.push('organization');
    if (cleanExp !== null) userSavedFields.push('experience');
    if (formData.state.trim() && formData.state !== 'Bihar') userSavedFields.push('state');
    if (formData.district.trim() && formData.district !== 'Bihar') userSavedFields.push('district');
    if (formData.block_city.trim()) userSavedFields.push('block_city');
    if (combinedInterests.length > 0) userSavedFields.push('interests');
    if (formData.intent.trim()) userSavedFields.push('intent');
    if (formData.contribution.trim()) userSavedFields.push('contribution');
    if (formData.linkedin.trim()) userSavedFields.push('linkedin');
    if (formData.portfolio.trim()) userSavedFields.push('portfolio');

    // DB Payload containing ONLY valid schema columns for user_details
    const dbPayload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile ? formData.mobile.trim() : '',
      gender: formData.gender || '',
      age: isNaN(cleanAge) ? null : cleanAge,
      role_type: formData.role_type || '',
      designation: formData.designation ? formData.designation.trim() : '',
      department: formData.department ? formData.department.trim() : '',
      organization: formData.organization ? formData.organization.trim() : '',
      experience: cleanExp, // INTEGER for PostgreSQL user_details table schema
      state: formData.state ? formData.state.trim() : 'Bihar',
      district: formData.district ? formData.district.trim() : '',
      block_city: formData.block_city ? formData.block_city.trim() : '',
      interests: combinedInterests,
      intent: formData.intent ? formData.intent.trim() : '',
      contribution: formData.contribution ? formData.contribution.trim() : '',
      linkedin: formData.linkedin ? formData.linkedin.trim() : '',
      portfolio: formData.portfolio ? formData.portfolio.trim() : '',
      created_at: existingSubmission?.created_at || getIstTimestamp()
    };

    let dbSuccess = false;
    let dbErrorMessage = '';

    try {
      if (supabase) {
        // 1. Check if record exists in user_details table
        const { data: existingDet } = await supabase
          .from('user_details')
          .select('id')
          .eq('email', dbPayload.email)
          .maybeSingle();

        if (existingDet && existingDet.id) {
          const { error: updateErr } = await supabase
            .from('user_details')
            .update(dbPayload)
            .eq('id', existingDet.id);
          
          if (!updateErr) {
            dbSuccess = true;
          } else {
            dbErrorMessage = updateErr.message;
            console.error('user_details update error:', updateErr);
          }
        } else {
          const { error: insertErr } = await supabase
            .from('user_details')
            .insert([dbPayload]);
          
          if (!insertErr) {
            dbSuccess = true;
          } else {
            console.error('user_details insert error:', insertErr);
            dbErrorMessage = insertErr.message;
          }
        }
      }
    } catch (err) {
      console.error('Profile DB save exception:', err);
      dbErrorMessage = err.message;
    }

    if (!dbSuccess && dbErrorMessage) {
      setFormError(`⚠️ Could not save to database: ${dbErrorMessage}. Please check your connection and try again.`);
      setFormSubmitting(false);
      return;
    }

    // Save to local submission cache and set profile saved flag & user saved fields
    const uiPayload = {
      ...dbPayload,
      is_profile_locked: true,
      is_profile_saved: true,
      user_saved_fields: userSavedFields
    };
    try {
      if (user && user.email) {
        const cleanEm = user.email.toLowerCase().trim();
        localStorage.setItem(`bihar_ai_profile_saved_${cleanEm}`, 'true');
        localStorage.setItem(`bihar_ai_user_saved_fields_${cleanEm}`, JSON.stringify(userSavedFields));
      }
      const localSubs = JSON.parse(localStorage.getItem('bihar_ai_local_submissions') || '[]');
      const filtered = localSubs.filter(s => s.email && s.email.toLowerCase() !== dbPayload.email);
      filtered.unshift(uiPayload);
      localStorage.setItem('bihar_ai_local_submissions', JSON.stringify(filtered));
    } catch (lsErr) {}

    try {
      const storedUser = JSON.parse(localStorage.getItem('bihar_ai_user') || '{}');
      storedUser.fullName = dbPayload.full_name;
      storedUser.designation = dbPayload.designation;
      storedUser.district = dbPayload.district;
      storedUser.phone = dbPayload.mobile;
      localStorage.setItem('bihar_ai_user', JSON.stringify(storedUser));
    } catch (usrErr) {}

    const successMsg = '🎉 Profile details updated successfully!';
    toast.success(successMsg);
    setFormSuccess(successMsg);
    setExistingSubmission(uiPayload);

    setFormSubmitting(false);
  };

  const blockOptions = blockSuggestionsMap[formData.district] || [];

  return (
    <div className="profilePage" style={{ background: '#F4F8FA', minHeight: '100vh', paddingBottom: '60px', color: '#111827', fontFamily: "'Manrope', sans-serif" }}>
      <SEO
        title="Candidate Dashboard & Credentials | Bihar AI Mission"
        description="View enrolled AI Masterclasses, track exam attempts, update user profile, and access verifiable Bihar AI Mission digital certificates."
        canonical="https://biharaimission.org/profile"
      />
      <div style={{ maxWidth: '1140px', margin: '32px auto', padding: '0 20px' }}>
        <div className="profileBreadcrumb" style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13.5px', color: '#9CA3AF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: '#000000', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <span>/</span>
            <Link to="/learning" style={{ color: '#000000', textDecoration: 'none', fontWeight: '600' }}>Learning Hub</Link>
            <span>/</span>
            <span style={{ color: '#111827', fontWeight: '700' }}>{isHi ? 'मेरा लर्निंग डैशबोर्ड' : 'My Learning Dashboard'}</span>
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

      <div style={{ maxWidth: '1140px', margin: '32px auto', padding: '0 20px' }}>

        {/* PROFILE HEADER HERO CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #000000 0%, #111827 100%)',
          borderRadius: '32px',
          padding: '32px 36px',
          color: '#FFFFFF',
          boxShadow: '0 12px 35px rgba(24, 21, 18, 0.25)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }} className="profileHero">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div className="profileHeroAvatar" style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #000000 0%, var(--color-charcoal-900, #181512) 100%)',
              color: '#FFFFFF',
              fontSize: '26px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 16px rgba(193, 85, 44, 0.35)',
              overflow: 'hidden'
            }}>
              <UserAvatar user={user} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{
                background: 'rgba(193, 85, 44, 0.18)',
                border: '1px solid rgba(226, 139, 92, 0.35)',
                color: 'var(--color-sand-50, #FBF8F3)',
                fontSize: '11.5px',
                fontWeight: '800',
                padding: '3px 12px',
                borderRadius: '32px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                BIHAR AI MISSION MEMBER
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 6px 0' }}>
                {user.fullName}
              </h1>
              <div style={{ fontSize: '14px', color: '#9CA3AF', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {user.designation && <span>💼 {user.designation}</span>}
                {user.district && <span>📍 {user.district}</span>}
                <span>✉️ {user.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid #EF4444',
              color: '#F87171',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Out
          </button>
        </div>

        {/* QUICK STATS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }} className="profileStats">
          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '32px', border: '1px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
              Joined Masterclasses
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#000000' }}>
              {joinedMasterclasses.length}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '32px', border: '1px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
              Officer Programs
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#059669' }}>
              {joinedOfficerPrograms.length}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: '32px', border: '1px solid rgba(17, 24, 39, 0.06)', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
              Certificates Earned
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#000000' }}>
              {userSubmissions.filter(s => s.isPassed).length}
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS NAVIGATION */}
        <div style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid rgba(17, 24, 39, 0.06)',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }} className="profileTabs">
          <button
            onClick={() => setActiveTab('masterclasses')}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '800',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'masterclasses' ? '#000000' : '#9CA3AF',
              borderBottom: activeTab === 'masterclasses' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🎓 Joined Masterclasses ({joinedMasterclasses.length})
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '800',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'programs' ? '#000000' : '#9CA3AF',
              borderBottom: activeTab === 'programs' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            🏛️ Enrolled Programs ({joinedOfficerPrograms.length})
          </button>



          <button
            onClick={() => setActiveTab('get_involved')}
            style={{
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '800',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'get_involved' ? '#000000' : '#9CA3AF',
              borderBottom: activeTab === 'get_involved' ? '3px solid #000000' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            👤 Profile Details
          </button>
        </div>

        {/* TAB 1: JOINED MASTERCLASSES */}
        {activeTab === 'masterclasses' && (
          <div>
            {joinedMasterclasses.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '32px',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid rgba(17, 24, 39, 0.06)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
                  No Enrolled Masterclasses Yet
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 20px 0' }}>
                  Explore live masterclasses offered by Bihar AI Mission.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#000000',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Explore Masterclasses →
                </Link>
              </div>
            ) : (
              <div className="mcGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {joinedMasterclasses.map((cls) => {
                  const rawSub = userSubmissions.find(s => 
                    String(s.examId) === String(cls.id) || 
                    String(s.masterclassId) === String(cls.id) ||
                    String(s.id) === String(cls.id) ||
                    (s.courseName && s.courseName.toLowerCase() === String(cls.title || '').toLowerCase()) ||
                    (s.masterclassTitle && s.masterclassTitle.toLowerCase() === String(cls.title || '').toLowerCase()) ||
                    (s.examTitle && s.examTitle.toLowerCase() === String(cls.title || '').toLowerCase())
                  );

                  const baseSub = rawSub || (userSubmissions.length > 0 ? userSubmissions[0] : null);
                  const sub = baseSub ? {
                    ...baseSub,
                    examId: cls.id,
                    masterclassId: cls.id,
                    courseName: cls.title,
                    masterclassTitle: cls.title,
                    examTitle: cls.title,
                    course_name: cls.title
                  } : null;

                  const hasPassed = Boolean(sub && (sub.isPassed || sub.passed || sub.percentage >= 75 || sub.score >= 23));
                  const isApproved = Boolean(sub && (sub.isApproved === true || sub.status === 'APPROVED'));

                  return (
                    <div key={cls.id} style={{
                      background: '#FFFFFF',
                      borderRadius: '32px',
                      border: '1px solid rgba(17, 24, 39, 0.06)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-500, #C1552C)', background: 'rgba(193, 85, 44, 0.12)', border: '1px solid rgba(226, 139, 92, 0.25)', padding: '2px 10px', borderRadius: '12px' }}>
                            {cls.category || 'Masterclass'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>✓ Enrolled</span>
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                          {cls.title}
                        </h3>
                        <div style={{ fontSize: '12.5px', color: '#9CA3AF', fontWeight: '600', marginBottom: '12px' }}>
                          📅 Joined Date: <strong>{getJoinedDate(cls.id)}</strong>
                        </div>
                        <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                          {cls.description ? cls.description.slice(0, 100) + '…' : ''}
                        </p>
                      </div>

                      {hasPassed && isApproved ? (
                        <button
                          onClick={() => setActiveCertSubmission(sub)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#FFFFFF',
                            padding: '11px 14px',
                            borderRadius: '8px',
                            fontWeight: '800',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          📜 View & Download Certificate
                        </button>
                      ) : hasPassed && !isApproved ? (
                        <div
                          style={{
                            width: '100%',
                            background: '#FEF3C7',
                            color: '#B45309',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            border: '1.5px solid #F59E0B',
                            textAlign: 'center'
                          }}
                        >
                          ⏳ Passed ({sub?.score || 23}/30) — Certificate Pending Admin Generation
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          {getSessionEndedStatus(cls).isExpired ? (
                            <div
                              style={{
                                width: '100%',
                                background: '#FFE4E6',
                                color: '#BE123C',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '12px',
                                border: '1.5px solid #F43F5E',
                                textAlign: 'center',
                                boxSizing: 'border-box'
                              }}
                            >
                              🔒 Recorded Video & Exam Expired (24h Window Closed)
                            </div>
                          ) : (
                            <>
                              {(cls.recordingUrl || cls.recordedUrl) && (
                                <a
                                  href={cls.recordingUrl || cls.recordedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    width: '100%',
                                    background: 'linear-gradient(135deg, #000000 0%, var(--color-charcoal-900, #181512) 100%)',
                                    color: '#FFFFFF',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontWeight: '800',
                                    fontSize: '12.5px',
                                    textDecoration: 'none',
                                    textAlign: 'center',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    boxSizing: 'border-box'
                                  }}
                                >
                                  ▶️ Watch Recorded Class ↗
                                </a>
                              )}
                              <button
                                onClick={() => navigate(`/exam/${cls.id}`)}
                                style={{
                                  width: '100%',
                                  background: (cls.recordingUrl || cls.recordedUrl) ? '#111827' : '#000000',
                                  color: '#FFFFFF',
                                  padding: '11px 14px',
                                  borderRadius: '8px',
                                  fontWeight: '800',
                                  fontSize: '13px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                📝 Take Certification Exam →
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENROLLED OFFICER PROGRAMS ONLY */}
        {activeTab === 'programs' && (
          <div>
            {joinedOfficerPrograms.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '32px',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid rgba(17, 24, 39, 0.06)',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
                  No Enrolled Officer Programs Yet
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 20px 0' }}>
                  You have not enrolled in any specialized officer programs yet.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#059669',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Explore Programs & Enroll →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {joinedOfficerPrograms.map((prog) => (
                  <div key={prog.id} style={{
                    background: '#FFFFFF',
                    borderRadius: '32px',
                    border: '1px solid rgba(17, 24, 39, 0.06)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', background: 'rgba(5, 150, 105, 0.1)', padding: '2px 10px', borderRadius: '12px' }}>
                          SPECIALIZED PROGRAM
                        </span>
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>✓ Enrolled</span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
                        {prog.title}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: '#9CA3AF', fontWeight: '600', marginBottom: '12px' }}>
                        📅 Joined Date: <strong>{getJoinedDate(prog.id)}</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        {prog.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/exam/${prog.id || 'ai-fundamentals'}`)}
                      style={{
                        width: '100%',
                        background: '#059669',
                        color: '#FFFFFF',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      View Certificate →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* TAB 4: PROFILE DETAILS FORM */}
        {activeTab === 'get_involved' && (() => {
          return (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '32px',
              border: '1px solid rgba(17, 24, 39, 0.06)',
              padding: '32px 36px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)'
            }} className="profileForm">
              <div style={{ marginBottom: '24px', borderBottom: '1px solid #EFEAE5', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    BIHAR AI MISSION
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#111827', margin: 0 }}>
                    Profile Details
                  </h2>
                </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {allFieldsLocked ? (
                      <div style={{
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        color: '#15803D',
                        padding: '6px 14px',
                        borderRadius: '32px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🔒</span>
                        <span>All Profile Details Saved & Locked</span>
                      </div>
                    ) : isProfileSaved ? (
                      <div style={{
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        color: '#15803D',
                        padding: '6px 14px',
                        borderRadius: '32px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>🔒</span>
                        <span>Profile Details Saved</span>
                      </div>
                    ) : (
                      <div style={{
                        background: 'var(--color-sand-50, #FBF8F3)',
                        border: '1.5px solid var(--color-sand-100, #F3ECE0)',
                        color: 'var(--color-charcoal-900, #181512)',
                        padding: '6px 14px',
                        borderRadius: '32px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>✏️</span>
                        <span>Fill & Save Profile Details</span>
                      </div>
                    )}
                  </div>
                </div>

              {!isProfileSaved ? (
                <div style={{
                  background: 'var(--color-sand-50, #FBF8F3)',
                  border: '1.5px solid var(--color-sand-100, #F3ECE0)',
                  borderRadius: '32px',
                  padding: '14px 20px',
                  marginBottom: '24px',
                  color: 'var(--color-charcoal-900, #181512)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13.5px'
                }}>
                  <span style={{ fontSize: '20px' }}>ℹ️</span>
                  <div>
                    <strong>Fill & Save Profile Notice:</strong> Please fill your details below and click <strong>"Save Profile Details"</strong>. Unsaved fields are editable so you can complete your profile.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '32px',
                  padding: '14px 20px',
                  marginBottom: '24px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '700',
                  fontSize: '13.5px'
                }}>
                  <span>🔒</span>
                  <span>Profile Details Verified & Saved</span>
                </div>
              )}

              {formSuccess && (
                <div style={{
                  background: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  color: '#166534',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '24px'
                }}>
                  {formSuccess}
                </div>
              )}

              {formError && (
                <div style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '24px'
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleProfileFormSubmit}>

                {/* PERSONAL INFORMATION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#000000', margin: 0 }}>
                    Personal Information
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isPersonalSectionLocked ? '#9CA3AF' : '#000000' }}>
                    {isPersonalSectionLocked ? '🔒 Locked' : '✏️ Editable'}
                  </span>
                </div>

                <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={isFieldLocked('full_name')}
                      placeholder="e.g. Praveer Kishore"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('full_name') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('full_name') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('full_name') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      readOnly
                      placeholder="e.g. user@example.com"
                      value={formData.email}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: '1.5px solid rgba(17, 24, 39, 0.06)', background: '#EFEAE5', fontSize: '13.5px', color: '#9CA3AF'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Mobile
                    </label>
                    <input
                      type="tel"
                      readOnly={isFieldLocked('mobile')}
                      placeholder="e.g. 9876543210"
                      value={formData.mobile === 'N/A' ? '' : formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('mobile') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('mobile') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('mobile') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Gender
                    </label>
                    <select
                      disabled={isFieldLocked('gender')}
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('gender') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('gender') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('gender') ? '#9CA3AF' : '#111827'
                      }}
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Age
                    </label>
                    <input
                      type="number"
                      readOnly={isFieldLocked('age')}
                      placeholder="e.g. 24"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('age') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('age') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('age') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>
                </div>

                {/* PROFESSIONAL DETAILS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#000000', margin: 0 }}>
                    💼 Professional Details
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isProfSectionLocked ? '#9CA3AF' : '#000000' }}>
                    {isProfSectionLocked ? '🔒 Locked' : '✏️ Editable'}
                  </span>
                </div>

                <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Role Type
                    </label>
                    <select
                      disabled={isFieldLocked('role_type')}
                      value={formData.role_type}
                      onChange={(e) => setFormData({ ...formData, role_type: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('role_type') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('role_type') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('role_type') ? '#9CA3AF' : '#111827'
                      }}
                    >
                      <option value="">-- Select Role Type --</option>
                      <option value="Student">Student</option>
                      <option value="Government Officer">Government Officer</option>
                      <option value="AI Researcher / Engineer">AI Researcher / Engineer</option>
                      <option value="Citizen / Professional">Citizen / Professional</option>
                      <option value="Academician">Academician</option>
                      <option value="Entrepreneur">Entrepreneur</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('designation')}
                      placeholder="e.g. Software Engineer / Student / Officer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('designation') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('designation') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('designation') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('department')}
                      placeholder="e.g. Computer Science / Information Technology"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('department') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('department') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('department') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Organization
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('organization')}
                      placeholder="e.g. Bihar AI Mission / University / Company"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('organization') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('organization') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('organization') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Experience
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        readOnly={isFieldLocked('experience')}
                        placeholder="e.g. 2"
                        value={formData.experience_val || ''}
                        onChange={(e) => setFormData({ ...formData, experience_val: e.target.value })}
                        style={{
                          flex: 1, height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: isFieldLocked('experience') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                          background: isFieldLocked('experience') ? '#EFEAE5' : '#FFFFFF',
                          fontSize: '13.5px', color: isFieldLocked('experience') ? '#9CA3AF' : '#111827'
                        }}
                      />
                      <select
                        disabled={isFieldLocked('experience')}
                        value={formData.experience_unit || 'Years'}
                        onChange={(e) => setFormData({ ...formData, experience_unit: e.target.value })}
                        style={{
                          width: '105px', height: '42px', padding: '0 10px', borderRadius: '8px',
                          border: isFieldLocked('experience') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                          background: isFieldLocked('experience') ? '#EFEAE5' : '#FFFFFF',
                          fontSize: '13.5px', color: isFieldLocked('experience') ? '#9CA3AF' : '#111827', fontWeight: '600'
                        }}
                      >
                        <option value="Years">Years</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LOCATION SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#000000', margin: 0 }}>
                    📍 Location Details
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isLocSectionLocked ? '#9CA3AF' : '#000000' }}>
                    {isLocSectionLocked ? '🔒 Locked' : '✏️ Editable'}
                  </span>
                </div>

                <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      State
                    </label>
                    <select
                      disabled={isFieldLocked('state')}
                      value={formData.state}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          state: newSt,
                          district: (newSt !== 'Bihar' && prev.district && biharDistricts.includes(prev.district)) ? '' : prev.district
                        }));
                      }}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('state') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('state') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('state') ? '#9CA3AF' : '#111827'
                      }}
                    >
                      <option value="">-- Select State --</option>
                      {indianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      District
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('district')}
                      placeholder="e.g. Patna, Gaya, Nawada, Ranchi, Lucknow"
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('district') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('district') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('district') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Block / City / Village
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('block_city')}
                      placeholder="e.g. Danapur, Sadar, Warisaliganj, Village Name"
                      value={formData.block_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, block_city: e.target.value }))}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('block_city') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('block_city') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('block_city') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>
                </div>

                {/* AREAS OF INTEREST & STATEMENT OF INTENT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#000000', margin: 0 }}>
                    💡 Areas of Interest & Statement of Intent
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isIntentSectionLocked ? '#9CA3AF' : '#000000' }}>
                    {isIntentSectionLocked ? '🔒 Locked' : '✏️ Editable'}
                  </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                    Areas of Interest
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {availableInterests.map((interest) => {
                      const isSelected = formData.interests.includes(interest);
                      const isLocked = isFieldLocked('interests');
                      return (
                        <button
                          type="button"
                          key={interest}
                          disabled={isLocked}
                          onClick={() => handleInterestToggle(interest)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '32px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            border: isSelected ? '1.5px solid #000000' : '1.5px solid rgba(17, 24, 39, 0.08)',
                            background: isSelected ? '#EFEAE5' : '#FFFFFF',
                            color: isSelected ? 'var(--color-charcoal-900, #181512)' : '#6B7280',
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            opacity: isLocked && !isSelected ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{interest}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: formData.interests.length > 0 ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                      Other / Custom Interest(s) {formData.interests.length > 0 ? '(Disabled - Predefined Interest Selected Above)' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      readOnly={isFieldLocked('interests') || formData.interests.length > 0}
                      disabled={isFieldLocked('interests') || formData.interests.length > 0}
                      placeholder={
                        formData.interests.length > 0
                          ? "Disabled because you selected interest option(s) above. Uncheck pills to type custom interests."
                          : "e.g. Robotics, Computer Vision, Generative Models, NLP (type custom interest here)"
                      }
                      value={formData.interests.length > 0 ? '' : (formData.custom_interest || '')}
                      onChange={(e) => setFormData(prev => ({ ...prev, custom_interest: e.target.value }))}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: (isFieldLocked('interests') || formData.interests.length > 0) ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: (isFieldLocked('interests') || formData.interests.length > 0) ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: (isFieldLocked('interests') || formData.interests.length > 0) ? '#9CA3AF' : '#111827',
                        cursor: (isFieldLocked('interests') || formData.interests.length > 0) ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Statement of Intent
                  </label>
                  <textarea
                    rows="3"
                    readOnly={isFieldLocked('intent')}
                    placeholder="Describe your background, goals, or interest for participating in Bihar AI Mission initiatives..."
                    value={formData.intent}
                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: isFieldLocked('intent') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                      background: isFieldLocked('intent') ? '#EFEAE5' : '#FFFFFF',
                      fontSize: '13.5px', fontFamily: 'inherit', color: isFieldLocked('intent') ? '#9CA3AF' : '#111827'
                    }}
                  />
                </div>

                {/* CONTRIBUTION & PROFESSIONAL LINKS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(17, 24, 39, 0.06)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#000000', margin: 0 }}>
                    🔗 Contribution & Professional Links
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: isLinksSectionLocked ? '#9CA3AF' : '#000000' }}>
                    {isLinksSectionLocked ? '🔒 Locked' : '✏️ Editable'}
                  </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Proposed Contribution
                  </label>
                  <textarea
                    rows="2"
                    readOnly={isFieldLocked('contribution')}
                    placeholder="How can you contribute to Bihar AI Mission? (e.g. AI research, mentoring students, civic tool development, volunteering...)"
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: isFieldLocked('contribution') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                      background: isFieldLocked('contribution') ? '#EFEAE5' : '#FFFFFF',
                      fontSize: '13.5px', fontFamily: 'inherit', color: isFieldLocked('contribution') ? '#9CA3AF' : '#111827'
                    }}
                  />
                </div>

                <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      readOnly={isFieldLocked('linkedin')}
                      placeholder="e.g. https://www.linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('linkedin') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('linkedin') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('linkedin') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                      Portfolio / GitHub / Website URL
                    </label>
                    <input
                      type="url"
                      readOnly={isFieldLocked('portfolio')}
                      placeholder="e.g. https://github.com/username or portfolio link"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      style={{
                        width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                        border: isFieldLocked('portfolio') ? '1.5px solid rgba(17, 24, 39, 0.06)' : '1.5px solid rgba(17, 24, 39, 0.08)',
                        background: isFieldLocked('portfolio') ? '#EFEAE5' : '#FFFFFF',
                        fontSize: '13.5px', color: isFieldLocked('portfolio') ? '#9CA3AF' : '#111827'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting || allFieldsLocked}
                  style={{
                    width: '100%',
                    height: '46px',
                    background: allFieldsLocked
                      ? '#9CA3AF'
                      : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: allFieldsLocked ? 'not-allowed' : 'pointer',
                    boxShadow: allFieldsLocked ? 'none' : '0 4px 14px rgba(24, 21, 18, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {allFieldsLocked
                    ? '🔒 All Profile Information Saved & Locked'
                    : formSubmitting
                    ? 'Saving Profile Details…'
                    : '💾 Save Profile Details →'}
                </button>
              </form>
            </div>
          );
        })()}

      </div>

      {modalSubmission && (
        <CertificateModal
          submission={modalSubmission}
          onClose={() => setActiveCertSubmission(null)}
        />
      )}
    </div>
  );
}
