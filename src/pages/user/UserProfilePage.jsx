import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getIstTimestamp } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
import { getLiveClassesFromStorage, getProgramsFromStorage, fetchUserMasterclassEnrollmentsFromSupabase, fetchUserOfficerProgramEnrollmentsFromSupabase, saveOfficerProgramEnrollmentToSupabase, saveMasterclassEnrollmentToSupabase, getUserCourseProgress, getSessionEndedStatus } from '../../utils/coursesStorage';
import { getExamSubmissions, fetchExamSubmissionsFromSupabase } from '../../utils/examStorage';
import CertificateModal from '../../components/CertificateModal/CertificateModal';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import AIClasswork from '../../components/AIClasswork/AIClasswork';
import { getUserTaskSubmissions } from '../../services/taskService';
import SEO from '../../components/SEO/SEO';
import TaskLeaderboard from '../../components/TaskLeaderboard/TaskLeaderboard';
import './UserProfilePage.responsive.css';

import {
  INDIAN_STATES as indianStates,
  BIHAR_DISTRICTS as biharDistricts,
  ROLE_TYPES,
  INTEREST_OPTIONS
} from '../../components/RegistrationModal/RegistrationModal';

const MANDATORY_REGISTRATION_FIELDS = [
  'full_name',
  'email',
  'mobile',
  'gender',
  'age',
  'role_type',
  'state',
  'district',
  'block_city'
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

export default function UserProfilePage({ onOpenAuth, onOpenRegistration }) {
  const { user, logout, forcePurgeAndLogout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const hasPromptedAuth = useRef(false);

  const currentUser = user;

  // Auto-prompt login popup once on direct unauthenticated access; allow user to dismiss freely
  useEffect(() => {
    if (!user && onOpenAuth && !hasPromptedAuth.current) {
      hasPromptedAuth.current = true;
      onOpenAuth('login');
    }
  }, [user, onOpenAuth]);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return (location.state && location.state.activeTab) || 'get_involved';
  });
  const [lockedModal, setLockedModal] = useState(null);

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
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        full_name: currentUser.fullName || prev.full_name,
        email: currentUser.email || prev.email,
        mobile: (currentUser.phone && currentUser.phone !== 'N/A') ? currentUser.phone : prev.mobile,
        designation: (currentUser.designation && currentUser.designation !== 'Member' && currentUser.designation !== 'Officer / Citizen') ? currentUser.designation : prev.designation,
        district: (currentUser.district && currentUser.district !== 'Bihar') ? currentUser.district : prev.district
      }));
    }
  }, [currentUser]);

  // Check for existing saved submission in Supabase or localStorage
  useEffect(() => {
    async function checkExisting() {
      if (!currentUser || !currentUser.email) return;

      let isSavedLocally = false;
      let localSub = null;
      try {
        if (localStorage.getItem(`bihar_ai_profile_saved_${currentUser.email.toLowerCase().trim()}`) === 'true') {
          isSavedLocally = true;
        }
        const localSubs = JSON.parse(localStorage.getItem('bihar_ai_local_submissions') || '[]');
        localSub = localSubs.find(s => s.email && s.email.toLowerCase() === currentUser.email.toLowerCase());
        if (localSub && (localSub.is_profile_locked || localSub.is_profile_saved)) {
          isSavedLocally = true;
        }
      } catch (lsErr) {}

      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('user_details')
            .select('*')
            .eq('email', currentUser.email.trim())
            .order('created_at', { ascending: false })
            .limit(1);

          if (data && data.length > 0) {
            setExistingSubmission({
              ...data[0],
              is_profile_locked: data[0].is_profile_locked || isSavedLocally || Boolean(localSub?.is_profile_locked),
              is_profile_saved: data[0].is_profile_saved || isSavedLocally || Boolean(localSub?.is_profile_saved)
            });
            return;
          } else if (!error) {
            // User was deleted by admin from database: trigger instant revocation & logout!
            console.warn('🚨 Account record missing in user_details — executing instant logout.');
            if (forcePurgeAndLogout) {
              forcePurgeAndLogout('Your account has been deleted by an administrator.');
            }
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
  }, [currentUser, forcePurgeAndLogout]);

  const [remoteEnrolledClassIds, setRemoteEnrolledClassIds] = useState([]);
  const [remoteEnrollments, setRemoteEnrollments] = useState([]);
  const [remoteOfficerEnrollments, setRemoteOfficerEnrollments] = useState([]);

  const loadRemoteEnrollments = async () => {
    if (!currentUser || !currentUser.email) return;
    try {
      // Fetch remote database enrollments from Supabase masterclass_enrollments & officer_program_enrollments
      const enrollments = await fetchUserMasterclassEnrollmentsFromSupabase(currentUser.email);
      const officerEnrollments = await fetchUserOfficerProgramEnrollmentsFromSupabase(currentUser.email);
      
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

  const [userTaskSubmissions, setUserTaskSubmissions] = useState([]);
  const [showGupShupModal, setShowGupShupModal] = useState(false);

  const loadTaskSubmissions = async () => {
    if (!currentUser || !currentUser.email) return;
    try {
      const subs = await getUserTaskSubmissions(currentUser.email);
      setUserTaskSubmissions(subs || []);
    } catch (e) {
      console.warn('Error loading task submissions:', e);
    }
  };

  // Realtime Supabase Database Sync for Profile, Daily Tasks, and Enrollments
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;
    const cleanEmail = currentUser.email.toLowerCase().trim();

    // Initial fetch
    loadRemoteEnrollments();
    loadTaskSubmissions();

    if (!supabase) return;

    // Realtime channel
    const realtimeChannel = supabase
      .channel(`realtime-user-profile-${cleanEmail}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_details',
          filter: `email=eq.${cleanEmail}`
        },
        (payload) => {
          if (payload.new) {
            setExistingSubmission(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_task_submissions',
          filter: `user_email=eq.${cleanEmail}`
        },
        () => {
          loadTaskSubmissions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'masterclass_enrollments',
          filter: `user_email=eq.${cleanEmail}`
        },
        () => {
          loadRemoteEnrollments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'officer_program_enrollments',
          filter: `user_email=eq.${cleanEmail}`
        },
        () => {
          loadRemoteEnrollments();
        }
      )
      .subscribe();

    const handleEvents = () => {
      loadRemoteEnrollments();
      loadTaskSubmissions();
    };
    window.addEventListener('bihar_ai_programs_updated', handleEvents);
    window.addEventListener('bihar_ai_progress_updated', handleEvents);
    window.addEventListener('storage', handleEvents);

    return () => {
      supabase.removeChannel(realtimeChannel);
      window.removeEventListener('bihar_ai_programs_updated', handleEvents);
      window.removeEventListener('bihar_ai_progress_updated', handleEvents);
      window.removeEventListener('storage', handleEvents);
    };
  }, [currentUser?.email]);

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
      const knownInterestValues = INTEREST_OPTIONS.map((o) => o.value);
      const selectedPredefined = subInterests.filter((i) => knownInterestValues.includes(i));
      const customInterests = subInterests.filter((i) => !knownInterestValues.includes(i));

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

  // Mandatory registration fields are locked (non-editable); Non-mandatory fields are always editable
  const isFieldLocked = (fieldKey) => {
    return MANDATORY_REGISTRATION_FIELDS.includes(fieldKey);
  };

  const isPersonalSectionLocked = true; // All mandatory registration fields
  const isProfSectionLocked = false;   // Editable professional details
  const isLocSectionLocked = true;    // Mandatory location from registration
  const isIntentSectionLocked = false; // Editable focus & interest
  const isLinksSectionLocked = false;  // Editable portfolio / links
  const allFieldsLocked = false;       // Non-mandatory fields are always editable

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

  // If user is not logged in, show luxury gate or allow instant dev-mode preview
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.port === '3000'
  );

  if (!user) {
    return (
      <div className="profilePage" style={{ background: 'transparent', minHeight: '80vh', paddingBottom: '80px', color: 'inherit', fontFamily: "'Manrope', sans-serif" }}>
        <SEO
          title="Candidate Dashboard | Bihar AI Mission"
          description="Sign in to access your Bihar AI Mission learning dashboard, enrolled masterclasses, and verified digital certificates."
          canonical="https://biharaimission.org/profile"
        />

        {/* Top Breadcrumb */}
        <div style={{ maxWidth: '1200px', margin: '24px auto 0 auto', padding: '0 20px' }}>
          <div className="profileBreadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13px', color: 'var(--color-sand-200, #C2B7A3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/" style={{ color: 'var(--color-sand-100, #F3ECE0)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
              <span style={{ opacity: 0.6 }}>/</span>
              <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontWeight: '700' }}>{isHi ? 'सदस्य डैशबोर्ड' : 'Candidate Dashboard'}</span>
            </div>
            <Link
              to="/"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                padding: '6px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '12.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              ← {isHi ? 'मुख्य पृष्ठ' : 'Home'}
            </Link>
          </div>
        </div>

        {/* Dark Luxury Gateway Hero */}
        <div style={{ maxWidth: '1200px', margin: '28px auto 48px auto', padding: '0 20px' }}>
          <div style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #181512 0%, #201C18 55%, #15120F 100%)',
            borderRadius: '24px',
            padding: '48px 36px',
            color: '#FFFFFF',
            border: '1px solid rgba(226, 139, 92, 0.28)',
            boxShadow: '0 20px 45px -15px rgba(24, 21, 18, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            overflow: 'hidden'
          }}>
            {/* Top Amber Ambient Glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '320px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #C1552C, #D99B26, transparent)',
              borderRadius: '2px'
            }} />

            {/* Lock Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, rgba(193, 85, 44, 0.25) 0%, rgba(217, 155, 38, 0.18) 100%)',
              border: '1px solid rgba(226, 139, 92, 0.4)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              color: '#E28B5C',
              boxShadow: '0 8px 24px rgba(193, 85, 44, 0.25)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            {/* Civic Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(193, 85, 44, 0.22)',
              border: '1px solid rgba(226, 139, 92, 0.4)',
              borderRadius: '9999px',
              padding: '4px 14px',
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--color-sand-50, #FBF8F3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              BIHAR AI CIVIC ECOSYSTEM · CANDIDATE PORTAL
            </div>

            {/* Heading */}
            <h1 style={{
              fontFamily: "var(--font-display, 'Fraunces', serif)",
              fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)',
              fontWeight: '700',
              margin: '0 0 14px 0',
              letterSpacing: '-0.02em',
              color: '#FFFFFF'
            }}>
              {isHi ? (
                <>कैंडिडेट पोर्टल <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontStyle: 'italic' }}>साइन-इन आवश्यक</span></>
              ) : (
                <>Member Access <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontStyle: 'italic' }}>Required</span></>
              )}
            </h1>

            <p style={{
              fontSize: '15px',
              color: 'var(--color-sand-100, #F3ECE0)',
              lineHeight: '1.6',
              maxWidth: '560px',
              margin: '0 auto 28px auto',
              opacity: 0.9
            }}>
              {isHi
                ? 'अपने व्यक्तिगत शिक्षण डैशबोर्ड, पंजीकृत मास्टरक्लास, टेस्ट स्कोर और सत्यापित डिजिटल प्रमाणपत्रों तक पहुंचने के लिए साइन इन करें।'
                : 'Sign in with your registered account to access your AI learning workspace, course progress, exam attempts, and digital credentials.'}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onOpenAuth && onOpenAuth('login')}
                style={{
                  height: '46px',
                  padding: '0 28px',
                  background: 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(193, 85, 44, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{isHi ? 'साइन इन करें' : 'Sign In to Account'}</span>
                <span style={{ fontSize: '12px' }}>→</span>
              </button>

              <button
                onClick={() => onOpenRegistration && onOpenRegistration()}
                style={{
                  height: '46px',
                  padding: '0 24px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>✨ {isHi ? 'नया सदस्य पंजीकरण' : 'Register New Account'}</span>
              </button>

              <Link
                to="/"
                style={{
                  height: '46px',
                  padding: '0 20px',
                  background: 'transparent',
                  color: 'var(--color-sand-200, #C2B7A3)',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← {isHi ? 'होम पर लौटें' : 'Back to Home'}
              </Link>
            </div>
          </div>
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
    <div className="profilePage" style={{ background: 'transparent', minHeight: 'auto', paddingBottom: '80px', color: 'inherit', fontFamily: "'Manrope', sans-serif" }}>
      <SEO
        title="Candidate Dashboard & Credentials | Bihar AI Mission"
        description="View enrolled AI Masterclasses, track exam attempts, update user profile, and access verifiable Bihar AI Mission digital certificates."
        canonical="https://biharaimission.org/profile"
      />
      <div style={{ maxWidth: '1200px', margin: '24px auto 0 auto', padding: '0 20px' }}>
        <div className="profileBreadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13px', color: 'var(--color-sand-200, #C2B7A3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--color-sand-100, #F3ECE0)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <span style={{ opacity: 0.6 }}>/</span>
            <Link to="/learning" style={{ color: 'var(--color-sand-100, #F3ECE0)', textDecoration: 'none', fontWeight: '600' }}>Learning Hub</Link>
            <span style={{ opacity: 0.6 }}>/</span>
            <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontWeight: '700' }}>{isHi ? 'मेरा लर्निंग डैशबोर्ड' : 'My Learning Dashboard'}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '24px auto 48px auto', padding: '0 20px' }}>

        {/* PROFILE HEADER HERO CARD (Machined Double-Bezel Dark Charcoal & Amber) */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(145deg, #181512 0%, #201C18 55%, #15120F 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          color: '#FFFFFF',
          border: '1px solid rgba(226, 139, 92, 0.3)',
          boxShadow: '0 24px 50px -15px rgba(24, 21, 18, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          overflow: 'hidden'
        }} className="profileHero">
          {/* Top Amber Ambient Glow Accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #C1552C 30%, #D99B26 70%, transparent)',
            borderRadius: '2px'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
            {/* Dual-Ring Gradient Avatar */}
            <div className="profileHeroAvatar" style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)',
              color: '#FFFFFF',
              fontSize: '32px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3.5px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 10px 28px rgba(193, 85, 44, 0.45), 0 0 0 2px rgba(226, 139, 92, 0.3)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <UserAvatar user={currentUser} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Member Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(193, 85, 44, 0.18)',
                border: '1px solid rgba(226, 139, 92, 0.45)',
                color: 'var(--color-sand-50, #FBF8F3)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 14px',
                borderRadius: '9999px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                <span>BIHAR AI MISSION MEMBER</span>
              </div>

              {/* User Name */}
              <h1 style={{
                fontFamily: "var(--font-display, 'Fraunces', serif)",
                fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                fontWeight: '700',
                margin: '0 0 10px 0',
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
                lineHeight: 1.15
              }}>
                {currentUser?.fullName || currentUser?.full_name || 'Civic Member'}
              </h1>

              {/* Meta Chips */}
              <div style={{
                fontSize: '13.5px',
                color: 'var(--color-sand-100, #F3ECE0)',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {currentUser?.designation && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontWeight: '600' }}>
                    💼 {currentUser.designation}
                  </span>
                )}
                {currentUser?.district && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontWeight: '600' }}>
                    📍 {currentUser.district}, Bihar
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-sand-200, #C2B7A3)' }}>
                  ✉ {currentUser?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FCA5A5',
                borderRadius: '12px',
                padding: '11px 20px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(10px)',
                flexShrink: 0
              }}
              className="heroLogoutBtn"
            >
              <span>🚪</span>
              <span>{isHi ? 'साइन आउट' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* ADMIN TASK REVISION REQUIRED BANNER */}
        {userTaskSubmissions.filter((s) => s.status === 'REJECTED').length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(225, 29, 72, 0.12) 100%)',
            border: '1.5px solid rgba(244, 63, 94, 0.65)',
            borderRadius: '18px',
            padding: '20px 26px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 12px 32px rgba(244, 63, 94, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>⚠️</span>
              <div>
                <div style={{ color: '#FDA4AF', fontWeight: '800', fontSize: '15.5px', marginBottom: '3px' }}>
                  Action Required: {userTaskSubmissions.filter((s) => s.status === 'REJECTED').length} Daily Task(s) Need Revision!
                </div>
                <div style={{ color: 'var(--color-sand-100, #F3ECE0)', fontSize: '13.5px' }}>
                  Admin reviewer requested updates on:{' '}
                  <strong>
                    {userTaskSubmissions
                      .filter((s) => s.status === 'REJECTED')
                      .map((t) => `Task #${t.task_id}`)
                      .join(', ')}
                  </strong>
                  . Please review the feedback comments and re-upload your work.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('daily_tasks')}
              style={{
                background: 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '11px 24px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(244, 63, 94, 0.45)',
                whiteSpace: 'nowrap'
              }}
            >
              Fix & Re-upload Tasks →
            </button>
          </div>
        )}

        {/* QUICK STATS BENTO CARDS (Interactive Machined Double-Bezel Tiles) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginBottom: '32px'
        }} className="profileStats">
          {/* Card 1: Masterclasses */}
          <div
            onClick={() => setActiveTab('masterclasses')}
            className="bentoStatCard"
            style={{
              background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.88) 0%, rgba(20, 17, 15, 0.94) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '24px 26px',
              borderRadius: '22px',
              border: activeTab === 'masterclasses' ? '1.5px solid rgba(226, 139, 92, 0.6)' : '1px solid rgba(226, 139, 92, 0.22)',
              boxShadow: activeTab === 'masterclasses' ? '0 16px 40px -10px rgba(193, 85, 44, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)' : '0 16px 36px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '6px' }}>
                Joined Masterclasses
              </div>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#FFFFFF', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {joinedMasterclasses.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-terracotta-400, #E28B5C)', fontWeight: '700', marginTop: '6px' }}>
                {joinedMasterclasses.length > 0 ? `${joinedMasterclasses.length} Active Cohorts` : 'Explore Lectures →'}
              </div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(193, 85, 44, 0.18)', border: '1px solid rgba(226, 139, 92, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              🎓
            </div>
          </div>

          {/* Card 2: Officer Programs */}
          <div
            onClick={() => setActiveTab('programs')}
            className="bentoStatCard"
            style={{
              background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.88) 0%, rgba(20, 17, 15, 0.94) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '24px 26px',
              borderRadius: '22px',
              border: activeTab === 'programs' ? '1.5px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(226, 139, 92, 0.22)',
              boxShadow: activeTab === 'programs' ? '0 16px 40px -10px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)' : '0 16px 36px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '6px' }}>
                Officer Programs
              </div>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#10B981', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {joinedOfficerPrograms.length}
              </div>
              <div style={{ fontSize: '11px', color: '#34D399', fontWeight: '700', marginTop: '6px' }}>
                Executive AI Training →
              </div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              🏛️
            </div>
          </div>

          {/* Card 3: Certificates Earned */}
          <div
            onClick={() => {
              if (userSubmissions.filter(s => s.isPassed).length > 0) {
                const passSub = userSubmissions.find(s => s.isPassed);
                if (passSub) setActiveCertSubmission(passSub);
              } else {
                setActiveTab('masterclasses');
              }
            }}
            className="bentoStatCard"
            style={{
              background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.88) 0%, rgba(20, 17, 15, 0.94) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '24px 26px',
              borderRadius: '22px',
              border: '1px solid rgba(232, 178, 61, 0.35)',
              boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '6px' }}>
                Certificates Earned
              </div>
              <div style={{ fontSize: '34px', fontWeight: '900', color: '#E8B23D', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {userSubmissions.filter(s => s.isPassed).length}
              </div>
              <div style={{ fontSize: '11px', color: '#FCD34D', fontWeight: '700', marginTop: '6px' }}>
                {userSubmissions.filter(s => s.isPassed).length > 0 ? '📜 Click to View / Download' : 'Pass exams to earn'}
              </div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(232, 178, 61, 0.18)', border: '1px solid rgba(232, 178, 61, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              📜
            </div>
          </div>

          {/* Card 4: Daily Tasks Progress */}
          <div
            onClick={() => setActiveTab('daily_tasks')}
            className="bentoStatCard"
            style={{
              background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.88) 0%, rgba(20, 17, 15, 0.94) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '24px 26px',
              borderRadius: '22px',
              border: activeTab === 'daily_tasks' ? '1.5px solid rgba(217, 155, 38, 0.6)' : userTaskSubmissions.filter((s) => s.status === 'REJECTED').length > 0 ? '1.5px solid rgba(244, 63, 94, 0.6)' : '1px solid rgba(226, 139, 92, 0.22)',
              boxShadow: activeTab === 'daily_tasks' ? '0 16px 40px -10px rgba(217, 155, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)' : '0 16px 36px -12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-sand-200, #C2B7A3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '6px' }}>
                Daily Tasks
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '34px', fontWeight: '900', color: '#FFFFFF', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {userTaskSubmissions.filter((s) => s.status === 'APPROVED').length}
                </span>
                <span style={{ fontSize: '16px', color: 'var(--color-sand-200, #C2B7A3)', fontWeight: '800' }}>
                  / 18
                </span>
              </div>
              <div style={{ fontSize: '11px', color: userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 0 ? '#E8B23D' : 'var(--color-sand-200, #C2B7A3)', fontWeight: '700', marginTop: '6px' }}>
                {userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 0
                  ? `⏳ ${userTaskSubmissions.filter((s) => s.status === 'PENDING').length} Under Review`
                  : userTaskSubmissions.filter((s) => s.status === 'REJECTED').length > 0
                  ? `⚠️ ${userTaskSubmissions.filter((s) => s.status === 'REJECTED').length} Needs Revision`
                  : `18 Practical Tasks →`}
              </div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(217, 155, 38, 0.18)', border: '1px solid rgba(217, 155, 38, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              ⚡
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS NAVIGATION DOCK (Machined Segmented Rail - Full-Width Balanced Grid) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(20, 17, 14, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '7px 8px',
          borderRadius: '16px',
          border: '1px solid rgba(226, 139, 92, 0.25)',
          boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.45)',
          marginBottom: '32px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          alignItems: 'center',
          width: '100%',
          boxSizing: 'border-box'
        }} className="profileTabs">
          {/* 1. PROFILE DETAILS (UNLOCKED) */}
          <button
            type="button"
            onClick={() => setActiveTab('get_involved')}
            style={{
              flex: '1 1 0%',
              minWidth: '135px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'get_involved' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: activeTab === 'get_involved' ? 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)' : 'rgba(255, 255, 255, 0.04)',
              color: '#FFFFFF',
              boxShadow: activeTab === 'get_involved' ? '0 4px 14px rgba(193, 85, 44, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>👤</span>
            <span>{isHi ? 'प्रोफाइल विवरण' : 'Profile Details'}</span>
          </button>

          {/* 2. LEADERBOARD (UNLOCKED) */}
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            style={{
              flex: '1 1 0%',
              minWidth: '135px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'leaderboard' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: activeTab === 'leaderboard' ? 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)' : 'rgba(255, 255, 255, 0.04)',
              color: '#FFFFFF',
              boxShadow: activeTab === 'leaderboard' ? '0 4px 14px rgba(193, 85, 44, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>🏆</span>
            <span>{isHi ? 'लीडरबोर्ड' : 'Leaderboard'}</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          </button>

          {/* 3. DAILY TASKS (UNLOCKED) */}
          <button
            type="button"
            onClick={() => setActiveTab('daily_tasks')}
            style={{
              flex: '1 1 0%',
              minWidth: '145px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'daily_tasks' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: activeTab === 'daily_tasks' ? 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)' : 'rgba(255, 255, 255, 0.04)',
              color: '#FFFFFF',
              boxShadow: activeTab === 'daily_tasks' ? '0 4px 14px rgba(193, 85, 44, 0.4)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>⚡</span>
            <span>{isHi ? 'दैनिक कार्य' : 'Daily Tasks'}</span>
            <span style={{
              background: activeTab === 'daily_tasks' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(232, 178, 61, 0.22)',
              color: activeTab === 'daily_tasks' ? '#FFFFFF' : '#E8B23D',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: '800'
            }}>
              18 Tasks
            </span>
          </button>

          {/* 4. MASTERCLASSES (LOCKED) */}
          <button
            type="button"
            onClick={() => setLockedModal({
              title: isHi ? 'मास्टरक्लासेज' : 'Joined Masterclasses',
              icon: '🎓',
              subtitle: 'Live Certification Masterclasses',
              message: 'Masterclasses enrollment portal is currently locked for upcoming batch registration. Stay tuned for dates!'
            })}
            style={{
              flex: '1 1 0%',
              minWidth: '135px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: 'rgba(32, 28, 24, 0.65)',
              color: '#E2D7C3',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226, 139, 92, 0.35)';
              e.currentTarget.style.background = 'rgba(193, 85, 44, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(32, 28, 24, 0.65)';
            }}
            title="Joined Masterclasses (Locked)"
          >
            <span>🎓</span>
            <span>{isHi ? 'मास्टरक्लासेज' : 'Masterclasses'}</span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              🔒
            </span>
          </button>

          {/* 5. OFFICER PROGRAMS (LOCKED) */}
          <button
            type="button"
            onClick={() => setLockedModal({
              title: isHi ? 'अधिकारी कार्यक्रम' : 'Enrolled Programs',
              icon: '🏛️',
              subtitle: 'Executive AI Programs for Officers',
              message: 'Officer Programs are currently locked for upcoming cohort onboarding. Stay tuned for government circulars!'
            })}
            style={{
              flex: '1 1 0%',
              minWidth: '145px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: 'rgba(32, 28, 24, 0.65)',
              color: '#E2D7C3',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226, 139, 92, 0.35)';
              e.currentTarget.style.background = 'rgba(193, 85, 44, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(32, 28, 24, 0.65)';
            }}
            title="Enrolled Programs (Locked)"
          >
            <span>🏛️</span>
            <span>{isHi ? 'कार्यक्रम' : 'Officer Programs'}</span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              🔒
            </span>
          </button>

          {/* 6. GUP-SHUP (LOCKED) */}
          <button
            type="button"
            onClick={() => setShowGupShupModal(true)}
            style={{
              flex: '1 1 0%',
              minWidth: '130px',
              padding: '10px 12px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '11px',
              background: 'rgba(32, 28, 24, 0.65)',
              color: '#E2D7C3',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226, 139, 92, 0.35)';
              e.currentTarget.style.background = 'rgba(193, 85, 44, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(32, 28, 24, 0.65)';
            }}
            title="Gup-Shup (Locked - Coming Soon)"
          >
            <span>💬</span>
            <span>Gup-Shup</span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              🔒
            </span>
          </button>
        </div>

        {/* TAB 1: JOINED MASTERCLASSES */}
        {activeTab === 'masterclasses' && (
          <div>
            {joinedMasterclasses.length === 0 ? (
              <div style={{
                background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.85) 0%, rgba(20, 17, 15, 0.92) 100%)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid rgba(226, 139, 92, 0.22)',
                boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px 0', fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                  No Enrolled Masterclasses Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-sand-200, #C2B7A3)', margin: '0 0 20px 0' }}>
                  Explore live bilingual masterclasses offered by Bihar AI Mission.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(193, 85, 44, 0.35)'
                  }}
                >
                  Explore Masterclasses →
                </Link>
              </div>
            ) : (
              <div className="mcGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
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
                    candidateName: currentUser.fullName,
                    candidateEmail: currentUser.email,
                    course_name: cls.title
                  } : null;

                  const hasPassed = Boolean(sub && (sub.isPassed || sub.passed || sub.percentage >= 75 || sub.score >= 23));
                  const isApproved = Boolean(sub && (sub.isApproved === true || sub.status === 'APPROVED'));

                  return (
                    <div key={cls.id} style={{
                      background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.9) 0%, rgba(20, 17, 15, 0.95) 100%)',
                      borderRadius: '20px',
                      border: '1px solid rgba(226, 139, 92, 0.25)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)',
                      color: '#FFFFFF'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-400, #E28B5C)', background: 'rgba(193, 85, 44, 0.16)', border: '1px solid rgba(226, 139, 92, 0.35)', padding: '3px 10px', borderRadius: '8px' }}>
                            {cls.category || 'Masterclass'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>✓ Enrolled</span>
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                          {cls.title}
                        </h3>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-sand-200, #C2B7A3)', fontWeight: '600', marginBottom: '12px' }}>
                          📅 Joined Date: <strong>{getJoinedDate(cls.id)}</strong>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
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
                            borderRadius: '10px',
                            fontWeight: '800',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          📜 View & Download Certificate
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {cls.isExamExpired ? (
                            <div
                              style={{
                                width: '100%',
                                background: 'rgba(244, 63, 94, 0.15)',
                                color: '#FDA4AF',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                fontWeight: '800',
                                fontSize: '12px',
                                border: '1.5px solid rgba(244, 63, 94, 0.4)',
                                textAlign: 'center',
                                boxSizing: 'border-box'
                              }}
                            >
                              🔒 Recorded Video & Exam Expired
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
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.16)',
                                    color: '#FFFFFF',
                                    padding: '10px 12px',
                                    borderRadius: '10px',
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
                                  background: 'linear-gradient(135deg, #D45D31 0%, #BA491F 60%, #9F3812 100%)',
                                  color: '#FFFFFF',
                                  padding: '11px 14px',
                                  borderRadius: '10px',
                                  fontWeight: '800',
                                  fontSize: '13px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 16px rgba(193, 85, 44, 0.35)'
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
                background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.85) 0%, rgba(20, 17, 15, 0.92) 100%)',
                backdropFilter: 'blur(16px)',
                borderRadius: '24px',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid rgba(226, 139, 92, 0.22)',
                boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px 0', fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                  No Enrolled Officer Programs Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-sand-200, #C2B7A3)', margin: '0 0 20px 0' }}>
                  You have not enrolled in any specialized officer programs yet.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  Explore Programs & Enroll →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {joinedOfficerPrograms.map((prog) => (
                  <div key={prog.id} style={{
                    background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.9) 0%, rgba(20, 17, 15, 0.95) 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(226, 139, 92, 0.25)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.45)',
                    color: '#FFFFFF'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10B981', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '3px 10px', borderRadius: '8px' }}>
                          SPECIALIZED PROGRAM
                        </span>
                        <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>✓ Enrolled</span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {prog.title}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: 'var(--color-sand-200, #C2B7A3)', fontWeight: '600', marginBottom: '12px' }}>
                        📅 Joined Date: <strong>{getJoinedDate(prog.id)}</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        {prog.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/exam/${prog.id || 'ai-fundamentals'}`)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: '#FFFFFF',
                        padding: '11px 14px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
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

        {/* TAB 3: DAILY TASKS & PRACTICAL CLASSWORK */}
        {activeTab === 'daily_tasks' && (
          <div className="profileClassworkWrapper" style={{ marginBottom: '32px' }}>
            <AIClasswork user={currentUser} onSubmissionUpdated={setUserTaskSubmissions} />
          </div>
        )}

        {/* TAB 4: PROFILE DETAILS FORM */}
        {activeTab === 'get_involved' && (() => {
          return (
            <div style={{
              background: 'linear-gradient(145deg, rgba(32, 28, 24, 0.9) 0%, rgba(20, 17, 15, 0.95) 100%)',
              borderRadius: '24px',
              border: '1px solid rgba(226, 139, 92, 0.25)',
              padding: '36px 40px',
              boxShadow: '0 20px 45px -15px rgba(0, 0, 0, 0.5)',
              color: '#FFFFFF'
            }} className="profileForm">
              <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-400, #E28B5C)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    BIHAR AI MISSION
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: 0, fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                    Profile Details
                  </h2>
                </div>
              </div>

              <div style={{
                background: 'rgba(24, 21, 18, 0.65)',
                border: '1px solid rgba(226, 139, 92, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px',
                color: 'var(--color-sand-100, #F3ECE0)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13.5px'
              }}>
                <span style={{ fontSize: '22px' }}>🔒</span>
                <div>
                  <strong style={{ color: '#FFFFFF' }}>Registration Integrity Notice:</strong> Mandatory identity inputs (Full Name, Email, Mobile, Gender, Age, Category, State, District, and Block) were verified during registration and are permanently locked. You can edit and update your <strong>designation, organization, experience, AI interests, and professional links</strong> anytime.
                </div>
              </div>

              {formSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#6EE7B7',
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
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#FCA5A5',
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

                {/* 1. MANDATORY REGISTRATION DETAILS (LOCKED) */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px 22px',
                  marginBottom: '28px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🔒</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                        Mandatory Registration Details
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#9CA3AF',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      🔒 Non-Editable (Verified)
                    </span>
                  </div>

                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        readOnly
                        placeholder="e.g. Full Name"
                        value={formData.full_name}
                        autoComplete="off"
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        readOnly
                        placeholder="e.g. user@example.com"
                        value={formData.email}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        readOnly
                        placeholder="e.g. 9876543210"
                        value={formData.mobile === 'N/A' ? '' : formData.mobile}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Gender *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.gender || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Age *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.age ? `${formData.age} Years` : 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Role / Category *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={
                          ROLE_TYPES.find(r => r.value === formData.role_type)?.labelEn ||
                          formData.role_type ||
                          'Registered Member'
                        }
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.state || 'Bihar'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.district || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-200, #C2B7A3)', marginBottom: '6px' }}>
                        Block / Sub-Division / City *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.block_city || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          fontSize: '13.5px', color: '#9CA3AF', cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. NON-MANDATORY & EDITABLE PROFILE DETAILS */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(226, 139, 92, 0.3)',
                  borderRadius: '16px',
                  padding: '20px 22px',
                  marginBottom: '28px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✏️</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                        Professional & Profile Details
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#34D399',
                      background: 'rgba(52, 211, 153, 0.12)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      ✏️ Editable Anytime
                    </span>
                  </div>

                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        Designation / Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer / Officer / Student"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        Department / Wing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Information Technology / Education / Health"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        Organization / College / Company
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Government of Bihar / IIT Patna / Tech Corp"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        Experience
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 3"
                          value={formData.experience_val || ''}
                          onChange={(e) => setFormData({ ...formData, experience_val: e.target.value })}
                          style={{
                            flex: 1, height: '42px', padding: '0 14px', borderRadius: '8px',
                            border: '1.5px solid rgba(255, 255, 255, 0.15)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            fontSize: '13.5px', color: '#FFFFFF'
                          }}
                        />
                        <select
                          value={formData.experience_unit || 'Years'}
                          onChange={(e) => setFormData({ ...formData, experience_unit: e.target.value })}
                          style={{
                            width: '110px', height: '42px', padding: '0 10px', borderRadius: '8px',
                            border: '1.5px solid rgba(255, 255, 255, 0.15)',
                            background: '#201C18',
                            fontSize: '13.5px', color: '#FFFFFF', fontWeight: '600'
                          }}
                        >
                          <option value="Years">Years</option>
                          <option value="Months">Months</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* PRIMARY AI FOCUS & INTERESTS */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '8px' }}>
                      Primary AI Interest & Focus (Select your focus area)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {INTEREST_OPTIONS.map((item) => {
                        const isSelected = formData.interests && formData.interests.includes(item.value);
                        return (
                          <button
                            type="button"
                            key={item.value}
                            onClick={() => handleInterestToggle(item.value)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '24px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              border: isSelected ? '1.5px solid #C1552C' : '1px solid rgba(255, 255, 255, 0.15)',
                              background: isSelected ? 'rgba(193, 85, 44, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                              color: isSelected ? '#FFFFFF' : 'var(--color-sand-200, #C2B7A3)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{isHi ? item.labelHi : item.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-sand-300, #9CA3AF)', marginBottom: '6px' }}>
                        ✍️ Custom / Additional Interest (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Vision, Autonomous Drones, Local LLMs..."
                        value={formData.custom_interest || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_interest: e.target.value }))}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* CONTRIBUTION / STATEMENT OF INTENT */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                      How do you wish to contribute to Bihar AI Mission?
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. AI research, mentoring candidates, civic innovation, local language LLM development, hackathon mentoring..."
                      value={formData.contribution || ''}
                      onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '13.5px', fontFamily: 'inherit', color: '#FFFFFF'
                      }}
                    />
                  </div>

                  {/* SOCIAL & PORTFOLIO LINKS */}
                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-sand-100, #F3ECE0)', marginBottom: '6px' }}>
                        Portfolio / GitHub / Website URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username or https://yourportfolio.com"
                        value={formData.portfolio || ''}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: '8px',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          background: 'rgba(255, 255, 255, 0.08)',
                          fontSize: '13.5px', color: '#FFFFFF'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: formSubmitting
                      ? 'rgba(193, 85, 44, 0.5)'
                      : 'linear-gradient(135deg, #C1552C 0%, #E28B5C 100%)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(193, 85, 44, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>💾</span>
                  <span>{formSubmitting ? 'Saving to Database…' : 'Save & Update Profile Details'}</span>
                </button>
              </form>

              {/* REAL-TIME CANDIDATES TASK LEADERBOARD (JUST AFTER PROFILE DETAILS) */}
              <TaskLeaderboard isHi={isHi} />
            </div>
          );
        })()}

        {/* TAB 5: DEDICATED REAL-TIME LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <TaskLeaderboard isHi={isHi} />
        )}

      </div>

      {modalSubmission && (
        <CertificateModal
          submission={modalSubmission}
          onClose={() => setActiveCertSubmission(null)}
        />
      )}

      {/* GUP-SHUP AI WHATSAPP CHAT COMING SOON MODAL */}
      {showGupShupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 8, 7, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowGupShupModal(false)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #1E1B18 0%, #14110E 100%)',
              border: '1.5px solid rgba(226, 139, 92, 0.35)',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px 28px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(193, 85, 44, 0.2)',
              position: 'relative',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowGupShupModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#9CA3AF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9CA3AF';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              ✕
            </button>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                  flexShrink: 0
                }}
              >
                💬
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '21px', fontWeight: '800', margin: 0, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                    Gup-Shup
                  </h3>
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#FCA5A5',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '800'
                    }}
                  >
                    🔒 Locked
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#C2B7A3' }}>
                  Community Chit-Chat World — Department Groups, @Mentions & Achievements
                </p>
              </div>
            </div>

            {/* WHATSAPP CHAT PREVIEW MOCKUP BUBBLE */}
            <div
              style={{
                background: 'rgba(11, 20, 26, 0.85)',
                border: '1px solid rgba(37, 211, 102, 0.25)',
                borderRadius: '18px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C1552C 0%, #A9431E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '800',
                    flexShrink: 0
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    background: '#202C33',
                    padding: '10px 14px',
                    borderRadius: '0 14px 14px 14px',
                    fontSize: '13px',
                    color: '#E9EDEF',
                    lineHeight: '1.5',
                    maxWidth: '85%'
                  }}
                >
                  <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#25D366' }}>
                    Gup-Shup Community Bot
                  </p>
                  <p style={{ margin: 0 }}>
                    Namaste! 🙏 <strong>Gup-Shup</strong> is an interactive community world. You will be able to join <strong>Department-Wise Groups</strong>, chat statewide in the <strong>Overall Group</strong>, tag peers with <strong>@mentions</strong>, and share <strong>Achievement Photos & Certificates</strong>!
                  </p>
                  <span style={{ fontSize: '10px', color: '#8696A0', display: 'block', textAlign: 'right', marginTop: '6px' }}>
                    Just now · 🔒 End-to-End Civic Network
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING HIGHLIGHTS */}
            <div style={{ marginBottom: '22px' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#E28B5C', margin: '0 0 10px 0' }}>
                ✨ Features in Next Rollout:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {[
                  '🏛️ Department & Overall Groups',
                  '🏷️ WhatsApp-Style @Mentions',
                  '📸 Post Achievement Images',
                  '🎉 Live Reactions & Peer Chat'
                ].map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: '#F3ECE0'
                    }}
                  >
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* STATUS BADGE & CLOSE BUTTON */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowGupShupModal(false)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #C1552C 0%, #A9431E 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(193, 85, 44, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 22px rgba(193, 85, 44, 0.55)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(193, 85, 44, 0.4)';
                }}
              >
                🚀 Coming Soon — Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERIC LOCKED FEATURE MODAL (FOR MASTERCLASSES & PROGRAMS) */}
      {lockedModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 8, 7, 0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLockedModal(null)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #1E1B18 0%, #14110E 100%)',
              border: '1.5px solid rgba(226, 139, 92, 0.35)',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              padding: '30px 26px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(193, 85, 44, 0.2)',
              position: 'relative',
              color: '#FFFFFF',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setLockedModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#9CA3AF',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700'
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '46px', marginBottom: '12px' }}>
              {lockedModal.icon || '🔒'}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', marginBottom: '12px' }}>
              🔒 Feature Locked
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
              {lockedModal.title}
            </h3>

            {lockedModal.subtitle && (
              <p style={{ fontSize: '13px', color: '#E28B5C', margin: '0 0 14px 0', fontWeight: '600' }}>
                {lockedModal.subtitle}
              </p>
            )}

            <p style={{ fontSize: '13.5px', color: '#C2B7A3', lineHeight: '1.55', margin: '0 0 24px 0' }}>
              {lockedModal.message}
            </p>

            <button
              type="button"
              onClick={() => setLockedModal(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #C1552C 0%, #A9431E 100%)',
                border: 'none',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(193, 85, 44, 0.4)'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
