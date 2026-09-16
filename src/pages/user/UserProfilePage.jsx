import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getIstTimestamp } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast, toast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
import { getLiveClassesFromStorage, getProgramsFromStorage, fetchUserMasterclassEnrollmentsFromSupabase, fetchUserOfficerProgramEnrollmentsFromSupabase, saveOfficerProgramEnrollmentToSupabase, saveMasterclassEnrollmentToSupabase, getUserCourseProgress, getSessionEndedStatus } from '../../utils/coursesStorage';
import { getExamSubmissions, fetchExamSubmissionsFromSupabase } from '../../utils/examStorage';
import CertificateModal from '../../components/CertificateModal/CertificateModal';
import UserAvatar from '../../components/UserAvatar/UserAvatar';
import AIClasswork from '../../components/AIClasswork/AIClasswork';
import { getUserTaskSubmissions, getDailyTasks } from '../../services/taskService';
import SEO from '../../components/SEO/SEO';
import TaskLeaderboard from '../../components/TaskLeaderboard/TaskLeaderboard';
import ChitChat from '../../components/ChitChat/ChitChat';
import { isWithinNightChatHours } from '../../services/chitchatService';
import './UserProfilePage.responsive.css';

import {
  INDIAN_STATES as indianStates,
  BIHAR_DISTRICTS as biharDistricts,
  ROLE_TYPES,
  INTEREST_OPTIONS
} from '../../components/RegistrationModal/RegistrationModal';

const MANDATORY_REGISTRATION_FIELDS = [
  'full_name',
  'username',
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

export default function UserProfilePage({ onOpenAuth, onOpenRegistration, onOpenContact }) {
  const { user, logout, forcePurgeAndLogout, updateUserSession } = useAuth();
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
    username: '',
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

  // One-time username creation state
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [profileUsernameStatus, setProfileUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [isClaimingUsername, setIsClaimingUsername] = useState(false);
  const [showClaimConfirmModal, setShowClaimConfirmModal] = useState(false);
  const profileUsernameTimer = useRef(null);
  const profileUsernameCache = useRef({});

  const isBiharState = !formData.state || formData.state === 'Bihar';

  const cleanProfileUsername = (str) => (str || '').replace(/^@+/, '').trim().toLowerCase();

  const checkProfileUsernameAvailability = useCallback(async (usernameVal) => {
    if (profileUsernameTimer.current) clearTimeout(profileUsernameTimer.current);
    const clean = cleanProfileUsername(usernameVal);
    if (!clean) {
      setProfileUsernameStatus(null);
      return;
    }
    if (!/^[a-z0-9_]{5,10}$/.test(clean)) {
      setProfileUsernameStatus('invalid');
      return;
    }
    if (profileUsernameCache.current[clean] !== undefined) {
      setProfileUsernameStatus(profileUsernameCache.current[clean] ? 'taken' : 'available');
      return;
    }
    setProfileUsernameStatus('checking');
    try {
      // 1. Try secure RPC
      const { data: rpcData, error: rpcErr } = await supabase.rpc('check_username_exists', { username_input: clean });
      if (!rpcErr && typeof rpcData === 'boolean') {
        profileUsernameCache.current[clean] = rpcData;
        setProfileUsernameStatus(rpcData ? 'taken' : 'available');
        return;
      }

      // 2. Direct query fallback
      const { data: directData, error: directErr } = await supabase
        .from('user_details')
        .select('id, email')
        .ilike('username', clean)
        .limit(1);

      if (!directErr) {
        const isTaken = Array.isArray(directData) && directData.length > 0 && directData[0].email?.toLowerCase() !== currentUser?.email?.toLowerCase();
        profileUsernameCache.current[clean] = isTaken;
        setProfileUsernameStatus(isTaken ? 'taken' : 'available');
      } else {
        setProfileUsernameStatus(null);
      }
    } catch {
      setProfileUsernameStatus(null);
    }
  }, [currentUser?.email]);

  const handleProfileUsernameChange = (val) => {
    const rawClean = (val || '').replace(/^@+/, '').replace(/\s+/g, '').toLowerCase().slice(0, 10);
    setNewUsernameInput(rawClean);

    if (profileUsernameTimer.current) clearTimeout(profileUsernameTimer.current);
    if (!rawClean) {
      setProfileUsernameStatus(null);
      return;
    }
    if (rawClean.length < 5 || !/^[a-z0-9_]{5,10}$/.test(rawClean)) {
      setProfileUsernameStatus('invalid');
      return;
    }
    // Instant cache check
    if (profileUsernameCache.current[rawClean] !== undefined) {
      setProfileUsernameStatus(profileUsernameCache.current[rawClean] ? 'taken' : 'available');
      return;
    }
    // Instant checking feedback & fast 150ms debounce
    setProfileUsernameStatus('checking');
    profileUsernameTimer.current = setTimeout(() => {
      checkProfileUsernameAvailability(rawClean);
    }, 150);
  };

  const handleClaimUsername = () => {
    const cleanUser = cleanProfileUsername(newUsernameInput);
    if (!cleanUser) {
      toast?.warning(isHi ? 'कृपया एक यूज़रनेम दर्ज करें।' : 'Please enter a username.');
      return;
    }
    if (!/^[a-z0-9_]{5,10}$/.test(cleanUser)) {
      toast?.warning(isHi ? 'यूज़रनेम 5-10 वर्णों का होना चाहिए (केवल अक्षर, संख्या और अंडरस्कोर)।' : 'Username must be 5-10 characters (letters, numbers, underscore only).');
      return;
    }
    if (profileUsernameStatus === 'taken') {
      toast?.error(isHi ? 'यह यूज़रनेम पहले से लिया जा चुका है। कृपया दूसरा चुनें।' : 'This username is already taken. Please choose another.');
      return;
    }

    setShowClaimConfirmModal(true);
  };

  const executeClaimUsername = async () => {
    setShowClaimConfirmModal(false);
    const cleanUser = cleanProfileUsername(newUsernameInput);
    const targetEmail = currentUser?.email || formData.email;
    if (!targetEmail) {
      toast?.error('User email not found. Please log in again.');
      return;
    }

    setIsClaimingUsername(true);
    try {
      let success = false;
      let errMsg = '';
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('claim_user_username', {
          email_input: targetEmail.toLowerCase().trim(),
          username_input: cleanUser
        });
        if (!rpcErr && rpcRes && rpcRes.success) {
          success = true;
        } else if (rpcErr) {
          errMsg = rpcErr.message;
        } else if (rpcRes && !rpcRes.success) {
          errMsg = rpcRes.error || 'Failed to claim username';
        }
      } catch (rpcEx) {
        errMsg = rpcEx.message;
      }

      // Direct table update fallback
      if (!success) {
        const { data: checkData } = await supabase
          .from('user_details')
          .select('id, email')
          .ilike('username', cleanUser)
          .limit(1);

        if (checkData && checkData.length > 0 && checkData[0].email?.toLowerCase() !== targetEmail.toLowerCase()) {
          toast?.error(isHi ? 'यह यूज़रनेम पहले से लिया जा चुका है।' : 'This username is already taken by another account.');
          setIsClaimingUsername(false);
          return;
        }

        const { error: updateErr } = await supabase
          .from('user_details')
          .update({ username: cleanUser, updated_at: getIstTimestamp() })
          .ilike('email', targetEmail.toLowerCase().trim());

        if (!updateErr) {
          success = true;
        } else {
          errMsg = updateErr.message;
        }
      }

      if (success) {
        setFormData(prev => ({ ...prev, username: cleanUser }));
        setExistingSubmission(prev => prev ? ({ ...prev, username: cleanUser }) : null);
        if (updateUserSession) {
          updateUserSession({ username: cleanUser });
        }
        toast?.success(isHi ? `🎉 आपका यूज़रनेम @${cleanUser} सफलतापूर्वक सेट और स्थायी रूप से लॉक हो गया है!` : `🎉 Your username @${cleanUser} has been permanently set and locked!`);
      } else {
        toast?.error(errMsg || 'Could not set username. Please try again.');
      }
    } catch (err) {
      toast?.error(err.message || 'Error setting username');
    } finally {
      setIsClaimingUsername(false);
    }
  };

  const forcePurgeRef = useRef(forcePurgeAndLogout);
  useEffect(() => {
    forcePurgeRef.current = forcePurgeAndLogout;
  }, [forcePurgeAndLogout]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => {
        const nextFullName = currentUser.fullName || prev.full_name;
        const nextUsername = currentUser.username || prev.username;
        const nextEmail = currentUser.email || prev.email;
        const nextMobile = (currentUser.phone && currentUser.phone !== 'N/A') ? currentUser.phone : prev.mobile;
        const nextDesignation = (currentUser.designation && currentUser.designation !== 'Member' && currentUser.designation !== 'Officer / Citizen') ? currentUser.designation : prev.designation;
        const nextDistrict = (currentUser.district && currentUser.district !== 'Bihar') ? currentUser.district : prev.district;

        if (
          prev.full_name === nextFullName &&
          prev.username === nextUsername &&
          prev.email === nextEmail &&
          prev.mobile === nextMobile &&
          prev.designation === nextDesignation &&
          prev.district === nextDistrict
        ) {
          return prev;
        }

        return {
          ...prev,
          full_name: nextFullName,
          username: nextUsername,
          email: nextEmail,
          mobile: nextMobile,
          designation: nextDesignation,
          district: nextDistrict
        };
      });
    }
  }, [currentUser?.email, currentUser?.username, currentUser?.fullName, currentUser?.phone, currentUser?.designation, currentUser?.district]);

  // Check for existing saved submission in Supabase or localStorage
  const checkExisting = useCallback(async () => {
    const userEmail = currentUser?.email;
    if (!userEmail) return;

    let isSavedLocally = false;
    let localSub = null;
    try {
      if (localStorage.getItem(`bihar_ai_profile_saved_${userEmail.toLowerCase().trim()}`) === 'true') {
        isSavedLocally = true;
      }
      const localSubs = JSON.parse(localStorage.getItem('bihar_ai_local_submissions') || '[]');
      localSub = localSubs.find(s => s.email && s.email.toLowerCase() === userEmail.toLowerCase());
      if (localSub && (localSub.is_profile_locked || localSub.is_profile_saved)) {
        isSavedLocally = true;
      }
    } catch (lsErr) {}

    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('user_details')
          .select('*')
          .eq('email', userEmail.trim())
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          setExistingSubmission(prev => {
            if (
              prev &&
              prev.id === data[0].id &&
              prev.updated_at === data[0].updated_at &&
              prev.full_name === data[0].full_name &&
              prev.designation === data[0].designation
            ) {
              return prev;
            }
            return {
              ...data[0],
              is_profile_locked: data[0].is_profile_locked || isSavedLocally || Boolean(localSub?.is_profile_locked),
              is_profile_saved: data[0].is_profile_saved || isSavedLocally || Boolean(localSub?.is_profile_saved)
            };
          });
          return;
        } else if (!error) {
          // Check if user is in a recent registration grace period (< 30s)
          const isRegInProgress = localStorage.getItem('bihar_ai_registration_in_progress') === 'true';
          const regTime = parseInt(localStorage.getItem('bihar_ai_reg_time') || '0', 10);
          if (isRegInProgress || (Date.now() - regTime < 30000)) {
            return;
          }

          // User was deleted by admin from database: trigger instant revocation & logout!
          console.warn('🚨 Account record missing in user_details — executing instant logout.');
          if (forcePurgeRef.current) {
            forcePurgeRef.current('Your account has been deleted by an administrator.');
          }
          return;
        }
      }
    } catch (err) {}

    if (localSub) {
      setExistingSubmission(prev => {
        if (
          prev &&
          prev.email === localSub.email &&
          prev.updated_at === localSub.updated_at
        ) {
          return prev;
        }
        return {
          ...localSub,
          is_profile_locked: localSub.is_profile_locked || isSavedLocally,
          is_profile_saved: localSub.is_profile_saved || isSavedLocally
        };
      });
    }
  }, [currentUser?.email]);

  useEffect(() => {
    if (currentUser?.email) {
      checkExisting();
    }
  }, [currentUser?.email, checkExisting]);

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
  const [totalTasksCount, setTotalTasksCount] = useState(18);
  const [showGupShupModal, setShowGupShupModal] = useState(false);

  const loadTaskSubmissions = async () => {
    try {
      const allTasks = await getDailyTasks();
      if (allTasks && allTasks.length > 0) {
        setTotalTasksCount(allTasks.length);
      }
    } catch (e) {}

    const targetEmail = currentUser?.email || 'candidate@biharaimission.org';
    try {
      const subs = await getUserTaskSubmissions(targetEmail);
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
          table: 'daily_tasks'
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
    const handleSwitchTab = (e) => {
      const tab = e?.detail || 'profile';
      setActiveTab(tab);
      if (tab === 'profile') {
        setTimeout(() => {
          const el = document.getElementById('createUsernameSection') || document.querySelector('.formGrid');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
      }
    };
    window.addEventListener('switch_profile_tab', handleSwitchTab);
    window.addEventListener('bihar_ai_programs_updated', handleEvents);
    window.addEventListener('bihar_ai_progress_updated', handleEvents);
    window.addEventListener('bihar_ai_tasks_updated', handleEvents);
    window.addEventListener('bihar_ai_task_submitted', handleEvents);
    window.addEventListener('storage', handleEvents);

    return () => {
      supabase.removeChannel(realtimeChannel);
      window.removeEventListener('switch_profile_tab', handleSwitchTab);
      window.removeEventListener('bihar_ai_programs_updated', handleEvents);
      window.removeEventListener('bihar_ai_progress_updated', handleEvents);
      window.removeEventListener('bihar_ai_tasks_updated', handleEvents);
      window.removeEventListener('bihar_ai_task_submitted', handleEvents);
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

      setFormData(prev => {
        if (
          prev.full_name === (existingSubmission.full_name || prev.full_name) &&
          prev.email === (existingSubmission.email || prev.email) &&
          prev.role_type === (cleanRoleType || prev.role_type) &&
          prev.designation === (cleanDesignation || prev.designation) &&
          prev.district === (cleanDistrict || prev.district) &&
          prev.department === (existingSubmission.department || prev.department) &&
          prev.organization === (existingSubmission.organization || prev.organization)
        ) {
          return prev;
        }

        return {
          ...prev,
          full_name: existingSubmission.full_name || prev.full_name,
          username: existingSubmission.username || prev.username || '',
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
        };
      });
    }
  }, [existingSubmission]);

  const hasSetUsername = Boolean(
    (formData.username && formData.username.trim()) ||
    (existingSubmission && existingSubmission.username && existingSubmission.username.trim()) ||
    (currentUser && currentUser.username && currentUser.username.trim())
  );

  // Mandatory registration fields are locked (non-editable); Non-mandatory fields are always editable
  const isFieldLocked = (fieldKey) => {
    if (fieldKey === 'username') return hasSetUsername;
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

  const syncUserExams = useCallback(async () => {
    const targetEmail = currentUser?.email;
    if (!targetEmail) return;
    try {
      const all = await fetchExamSubmissionsFromSupabase();
      if (all && Array.isArray(all)) {
        const userName = (currentUser?.fullName || '').toLowerCase();
        const filtered = all.filter((sub) => {
          if (!sub.candidateEmail && !sub.candidateName) return false;
          return (
            (sub.candidateEmail && sub.candidateEmail.toLowerCase() === targetEmail.toLowerCase()) ||
            (sub.candidateName && userName && sub.candidateName.toLowerCase().includes(userName))
          );
        });
        setUserSubmissions(filtered);
      }
    } catch (err) {
      console.warn('Error syncing user exams:', err);
    }
  }, [currentUser?.email, currentUser?.fullName]);

  useEffect(() => {
    if (currentUser?.email) {
      syncUserExams();
    }

    const handleUpdate = () => syncUserExams();
    window.addEventListener('bihar_ai_exams_updated', handleUpdate);
    return () => window.removeEventListener('bihar_ai_exams_updated', handleUpdate);
  }, [currentUser?.email, syncUserExams]);

  // Candidate Dashboard live refresh from Supabase (Profile, Tasks, Enrollments, Exams)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        checkExisting(),
        loadRemoteEnrollments(),
        loadTaskSubmissions(),
        syncUserExams()
      ]);

      window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
      window.dispatchEvent(new Event('bihar_ai_programs_updated'));
      window.dispatchEvent(new Event('bihar_ai_progress_updated'));
      window.dispatchEvent(new Event('bihar_ai_exams_updated'));

      toast.success(isHi ? '✨ डेटा सफलतापूर्वक रीफ्रेश हो गया!' : '✨ Data refreshed successfully!');
    } catch (err) {
      console.error('Refresh error:', err);
      toast.error(isHi ? 'डेटा रीफ्रेश करने में असमर्थ' : 'Failed to refresh profile data.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

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
          <div className="profileBreadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/" style={{ color: 'var(--color-ink, #181512)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
              <span style={{ opacity: 0.6 }}>/</span>
              <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontWeight: '700' }}>{isHi ? 'सदस्य डैशबोर्ड' : 'Candidate Dashboard'}</span>
            </div>
            <Link
              to="/"
              style={{
                background: 'var(--color-sand-100, #F3ECE0)',
                border: '1px solid var(--color-line, #E2D7C3)',
                color: 'var(--color-ink, #181512)',
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
            background: '#FFFFFF',
            borderRadius: 'var(--radius-sm, 2px)',
            padding: '48px 36px',
            color: 'var(--color-ink, #181512)',
            border: '1px solid var(--color-line, #E2D7C3)',
            boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
            textAlign: 'center',
            overflow: 'hidden'
          }}>
            {/* Top Gazette Rule */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'var(--color-terracotta-500, #C1552C)'
            }} />

            {/* Lock Icon */}
            <div style={{
              width: '56px',
              height: '56px',
              background: 'var(--color-sand-50, #FBF8F3)',
              border: '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              color: 'var(--color-terracotta-500, #C1552C)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>

            {/* Civic Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--color-sand-50, #FBF8F3)',
              border: '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--color-ink, #181512)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              BIHAR AI CIVIC ECOSYSTEM · CANDIDATE PORTAL
            </div>

            {/* Heading */}
            <h1 style={{
              fontFamily: "var(--font-display, 'Fraunces', serif)",
              fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)',
              fontWeight: '700',
              margin: '0 0 14px 0',
              letterSpacing: '-0.02em',
              color: 'var(--color-ink, #181512)'
            }}>
              {isHi ? (
                <>कैंडिडेट पोर्टल <span style={{ color: 'var(--color-terracotta-500, #C1552C)', fontStyle: 'italic' }}>साइन-इन आवश्यक</span></>
              ) : (
                <>Member Access <span style={{ color: 'var(--color-terracotta-500, #C1552C)', fontStyle: 'italic' }}>Required</span></>
              )}
            </h1>

            <p style={{
              fontSize: '15px',
              color: 'var(--color-ink-muted, #5E554D)',
              lineHeight: '1.6',
              maxWidth: '560px',
              margin: '0 auto 28px auto'
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
                  height: '44px',
                  padding: '0 26px',
                  background: 'var(--color-terracotta-500, #C1552C)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: 'var(--radius-sm, 2px)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease'
                }}
              >
                <span>{isHi ? 'साइन इन करें' : 'Sign In to Account'}</span>
                <span style={{ fontSize: '12px' }}>→</span>
              </button>

              <button
                onClick={() => onOpenRegistration && onOpenRegistration()}
                style={{
                  height: '44px',
                  padding: '0 22px',
                  background: '#FFFFFF',
                  color: 'var(--color-ink, #181512)',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '1px solid var(--color-line, #E2D7C3)',
                  borderRadius: 'var(--radius-sm, 2px)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease'
                }}
              >
                <span>✨ {isHi ? 'नया सदस्य पंजीकरण' : 'Register New Account'}</span>
              </button>

              <Link
                to="/"
                style={{
                  height: '44px',
                  padding: '0 18px',
                  background: 'transparent',
                  color: 'var(--color-ink-muted, #5E554D)',
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

    const activeUsername = (formData.username || existingSubmission?.username || currentUser?.username || '').replace(/^@+/, '').trim().toLowerCase();
    if (activeUsername) {
      dbPayload.username = activeUsername;
    }

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
        <div className="profileBreadcrumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link to="/" style={{ color: 'var(--color-ink, #181512)', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <span style={{ opacity: 0.6 }}>/</span>
            <Link to="/learning" style={{ color: 'var(--color-ink, #181512)', textDecoration: 'none', fontWeight: '600' }}>Learning Hub</Link>
            <span style={{ opacity: 0.6 }}>/</span>
            <span style={{ color: 'var(--color-terracotta-400, #E28B5C)', fontWeight: '700' }}>{isHi ? 'मेरा लर्निंग डैशबोर्ड' : 'My Learning Dashboard'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'var(--color-sand-100, #F3ECE0)',
                border: '1px solid var(--color-line, #E2D7C3)',
                color: 'var(--color-ink, #181512)',
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
              ← {isHi ? 'वापस' : 'Back'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '24px auto 48px auto', padding: '0 20px' }}>

        {/* FEEDBACK & GLITCH REPORTING BANNER */}
        <div 
          className="feedbackBanner"
          style={{
            position: 'relative',
            background: 'var(--color-sand-100, #F3ECE0)',
            border: '1px solid var(--color-line, #E2D7C3)',
            borderRadius: 'var(--radius-sm, 2px)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '280px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm, 2px)',
              background: 'var(--color-sand-50, #FBF8F3)',
              border: '1px solid var(--color-line, #E2D7C3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0
            }}>
              🛠️
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-display, 'Fraunces', serif)",
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--color-ink, #181512)',
                letterSpacing: '-0.01em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span>{isHi ? 'कोई तकनीकी समस्या या बग मिला? सुधारने में हमारी मदद करें' : 'Found any glitches or website issues? Help us improve!'}</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm, 2px)',
                  background: 'rgba(217, 155, 38, 0.15)',
                  color: '#9E6E10',
                  border: '1px solid rgba(217, 155, 38, 0.4)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  {isHi ? 'प्रतिक्रिया' : 'FEEDBACK'}
                </span>
              </div>
              <p style={{
                fontSize: '13px',
                color: 'var(--color-ink-muted, #5E554D)',
                lineHeight: 1.5,
                margin: '4px 0 0 0'
              }}>
                {isHi 
                  ? 'यदि आपको वेबसाइट में कोई गड़बड़ी, क्रैश या कार्यक्षमता से संबंधित कोई समस्या मिलती है, तो कृपया हमारी टीम को लिखें ताकि हम प्लेटफॉर्म को और बेहतर बना सकें।' 
                  : 'If you found any glitches, website crash, or any problem related to functionality, please write to us to help us improve our website.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="feedbackBtn"
            onClick={() => {
              if (onOpenContact) {
                onOpenContact();
              } else {
                window.dispatchEvent(new CustomEvent('bihar_ai_open_contact_modal'));
              }
            }}
            style={{
              background: 'var(--color-terracotta-500, #C1552C)',
              color: '#FFFFFF',
              border: '1px solid var(--color-terracotta-600, #A4431E)',
              borderRadius: 'var(--radius-sm, 2px)',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: '700',
              fontFamily: "var(--font-body, 'General Sans', sans-serif)",
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s ease',
              flexShrink: 0
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{isHi ? 'समस्या रिपोर्ट करें / संपर्क करें' : 'Report Glitch / Contact Us'}</span>
          </button>
        </div>

        {/* PROFILE HEADER HERO CARD */}
        <div style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-sm, 2px)',
          padding: '32px 36px',
          color: 'var(--color-ink, #181512)',
          border: '1px solid var(--color-line, #E2D7C3)',
          boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          overflow: 'hidden'
        }} className="profileHero">
          {/* Top Gazette Rule */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'var(--color-terracotta-500, #C1552C)'
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
            {/* Square 2px Avatar */}
            <div className="profileHeroAvatar" style={{
              width: '76px',
              height: '76px',
              borderRadius: 'var(--radius-sm, 2px)',
              background: 'var(--color-terracotta-500, #C1552C)',
              color: '#FFFFFF',
              fontSize: '28px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-line, #E2D7C3)',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <UserAvatar user={currentUser} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-sm, 2px)', objectFit: 'cover' }} />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Member Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-sand-50, #FBF8F3)',
                border: '1px solid var(--color-line, #E2D7C3)',
                color: 'var(--color-ink, #181512)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm, 2px)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                <span>BIHAR AI MISSION MEMBER</span>
              </div>

              {/* User Name */}
              <h1 style={{
                fontFamily: "var(--font-display, 'Fraunces', serif)",
                fontSize: 'clamp(1.65rem, 3vw, 2.25rem)',
                fontWeight: '700',
                margin: '0 0 10px 0',
                letterSpacing: '-0.025em',
                color: 'var(--color-ink, #181512)',
                lineHeight: 1.15
              }}>
                {currentUser?.fullName || currentUser?.full_name || 'Civic Member'}
              </h1>

              {/* Meta Chips */}
              <div style={{
                fontSize: '13px',
                color: 'var(--color-ink-muted, #5E554D)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {currentUser?.designation && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-sand-50, #FBF8F3)', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)', border: '1px solid var(--color-line, #E2D7C3)', fontWeight: '600', color: 'var(--color-ink, #181512)' }}>
                    💼 {currentUser.designation}
                  </span>
                )}
                {currentUser?.district && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-sand-50, #FBF8F3)', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)', border: '1px solid var(--color-line, #E2D7C3)', fontWeight: '600', color: 'var(--color-ink, #181512)' }}>
                    📍 {currentUser.district}, Bihar
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-sand-50, #FBF8F3)', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)', border: '1px solid var(--color-line, #E2D7C3)', color: 'var(--color-ink-muted, #5E554D)' }}>
                  ✉ {currentUser?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              style={{
                background: isRefreshing ? 'rgba(193, 85, 44, 0.12)' : 'var(--color-sand-50, #FBF8F3)',
                border: isRefreshing ? '1px solid var(--color-terracotta-500, #C1552C)' : '1px solid var(--color-line, #E2D7C3)',
                color: isRefreshing ? 'var(--color-terracotta-500, #C1552C)' : 'var(--color-ink, #181512)',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: isRefreshing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
                flexShrink: 0
              }}
              title={isHi ? 'सुपाबेस से सभी लाइव डेटा रीफ्रेश करें' : 'Refresh and sync profile & tasks from Supabase'}
              className="heroActionBtn profileRefreshBtn"
            >
              <span
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.5s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
                className={isRefreshing ? 'spinActive' : ''}
              >
                🔄
              </span>
              <span>{isRefreshing ? (isHi ? 'रीफ्रेश हो रहा है...' : 'Refreshing...') : (isHi ? 'रीफ्रेश' : 'Refresh')}</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#DC2626',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.2s ease',
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
            background: '#FFF5F5',
            border: '1px solid #FECDD3',
            borderRadius: 'var(--radius-sm, 2px)',
            padding: '18px 22px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <div>
                <div style={{ color: '#BE123C', fontWeight: '800', fontSize: '15px', marginBottom: '3px' }}>
                  Action Required: {userTaskSubmissions.filter((s) => s.status === 'REJECTED').length} Daily Task(s) Need Revision!
                </div>
                <div style={{ color: 'var(--color-ink, #181512)', fontSize: '13.5px' }}>
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
                background: '#BE123C',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm, 2px)',
                fontWeight: '800',
                fontSize: '13.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Fix & Re-upload Tasks →
            </button>
          </div>
        )}

        {/* QUICK STATS BENTO CARDS */}
        <div className="profileStats">
          {/* Card 1: Joined Masterclasses (LOCKED) */}
          <div
            onClick={() => setLockedModal({
              title: isHi ? 'मास्टरक्लासेज' : 'Joined Masterclasses',
              icon: '🎓',
              subtitle: 'Live Certification Masterclasses',
              message: 'Masterclasses enrollment portal is currently locked for upcoming batch registration. Stay tuned for dates!'
            })}
            className="bentoStatCard"
            style={{
              background: '#FFFFFF',
              padding: '20px 22px',
              borderRadius: 'var(--radius-sm, 2px)',
              border: '1px solid var(--color-line, #E2D7C3)',
              boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-ink-muted, #5E554D)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Joined Masterclasses
                </span>
                <span style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 5px', borderRadius: 'var(--radius-sm, 2px)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} title="Locked">
                  🔒
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-ink, #181512)', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }} className="statNum">
                {joinedMasterclasses.length}
              </div>
              <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔒 Portal Locked (Upcoming Batch)
              </div>
            </div>
            <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: 'var(--radius-sm, 2px)', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              🎓
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px', background: 'var(--color-sand-100, #F3ECE0)', borderRadius: 'var(--radius-sm, 2px)', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-line, #E2D7C3)' }}>🔒</span>
            </div>
          </div>

          {/* Card 2: Officer Programs (LOCKED) */}
          <div
            onClick={() => setLockedModal({
              title: isHi ? 'अधिकारी कार्यक्रम' : 'Enrolled Programs',
              icon: '🏛️',
              subtitle: 'Executive AI Programs for Officers',
              message: 'Officer Programs are currently locked for upcoming cohort onboarding. Stay tuned for government circulars!'
            })}
            className="bentoStatCard"
            style={{
              background: '#FFFFFF',
              padding: '20px 22px',
              borderRadius: 'var(--radius-sm, 2px)',
              border: '1px solid var(--color-line, #E2D7C3)',
              boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-ink-muted, #5E554D)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Officer Programs
                </span>
                <span style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 5px', borderRadius: 'var(--radius-sm, 2px)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} title="Locked">
                  🔒
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#2D6A4F', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }} className="statNum">
                {joinedOfficerPrograms.length}
              </div>
              <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔒 Currently Locked (Upcoming Cohort)
              </div>
            </div>
            <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: 'var(--radius-sm, 2px)', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              🏛️
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px', background: 'var(--color-sand-100, #F3ECE0)', borderRadius: 'var(--radius-sm, 2px)', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-line, #E2D7C3)' }}>🔒</span>
            </div>
          </div>

          {/* Card 3: Certificates Earned (LOCKED) */}
          <div
            onClick={() => setLockedModal({
              title: isHi ? 'प्रमाणपत्र' : 'Certificates Earned',
              icon: '📜',
              subtitle: 'Official AI Certification & Verification',
              message: 'Examination and certificate portal is currently locked for upcoming session evaluation. Certificates will unlock after exam grading!'
            })}
            className="bentoStatCard"
            style={{
              background: '#FFFFFF',
              padding: '20px 22px',
              borderRadius: 'var(--radius-sm, 2px)',
              border: '1px solid var(--color-line, #E2D7C3)',
              boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-ink-muted, #5E554D)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Certificates Earned
                </span>
                <span style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1px 5px', borderRadius: 'var(--radius-sm, 2px)', fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }} title="Locked">
                  🔒
                </span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-terracotta-500, #C1552C)', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }} className="statNum">
                {userSubmissions.filter(s => s.isPassed).length}
              </div>
              <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔒 Exam & Cert Portal Locked
              </div>
            </div>
            <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: 'var(--radius-sm, 2px)', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              📜
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px', background: 'var(--color-sand-100, #F3ECE0)', borderRadius: 'var(--radius-sm, 2px)', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-line, #E2D7C3)' }}>🔒</span>
            </div>
          </div>

          {/* Card 4: Daily Tasks Progress */}
          <div
            onClick={() => setActiveTab('daily_tasks')}
            className="bentoStatCard"
            style={{
              background: '#FFFFFF',
              padding: '20px 22px',
              borderRadius: 'var(--radius-sm, 2px)',
              border: activeTab === 'daily_tasks' ? '1px solid var(--color-terracotta-500, #C1552C)' : userTaskSubmissions.filter((s) => s.status === 'REJECTED').length > 0 ? '1px solid #FECDD3' : '1px solid var(--color-line, #E2D7C3)',
              boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-ink-muted, #5E554D)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Daily Tasks
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--color-ink, #181512)', fontFamily: "var(--font-display, 'Fraunces', serif)", letterSpacing: '-0.02em', lineHeight: 1.1 }} className="statNum">
                  {userTaskSubmissions.length}
                </span>
                <span style={{ fontSize: '15px', color: 'var(--color-ink-muted, #5E554D)', fontWeight: '700' }}>
                  / {totalTasksCount}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 0 ? '#B45309' : userTaskSubmissions.filter((s) => s.status === 'APPROVED').length > 0 ? '#2D6A4F' : 'var(--color-ink-muted, #5E554D)', fontWeight: '700', marginTop: '6px' }}>
                {userTaskSubmissions.filter((s) => s.status === 'APPROVED').length > 0 && userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 0
                  ? `✅ ${userTaskSubmissions.filter((s) => s.status === 'APPROVED').length} Approved · ⏳ ${userTaskSubmissions.filter((s) => s.status === 'PENDING').length} Under Review`
                  : userTaskSubmissions.filter((s) => s.status === 'APPROVED').length > 0
                  ? `✅ ${userTaskSubmissions.filter((s) => s.status === 'APPROVED').length} of ${totalTasksCount} Approved`
                  : userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 0
                  ? `⏳ ${userTaskSubmissions.filter((s) => s.status === 'PENDING').length} Task${userTaskSubmissions.filter((s) => s.status === 'PENDING').length > 1 ? 's' : ''} Under Review`
                  : userTaskSubmissions.filter((s) => s.status === 'REJECTED').length > 0
                  ? `⚠️ ${userTaskSubmissions.filter((s) => s.status === 'REJECTED').length} Needs Revision`
                  : `${totalTasksCount} Practical Tasks →`}
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm, 2px)', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              ⚡
            </div>
          </div>
        </div>

        {/* DASHBOARD TABS NAVIGATION DOCK */}
        <div style={{
          background: 'var(--color-sand-100, #F3ECE0)',
          padding: '6px 8px',
          borderRadius: 'var(--radius-sm, 2px)',
          border: '1px solid var(--color-line, #E2D7C3)',
          boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
          marginBottom: '32px',
          boxSizing: 'border-box',
          width: '100%'
        }} className="profileTabs">
          {/* 1. PROFILE DETAILS (UNLOCKED) */}
          <button
            type="button"
            data-active={activeTab === 'get_involved'}
            onClick={() => setActiveTab('get_involved')}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'get_involved' ? '1px solid var(--color-terracotta-500, #C1552C)' : '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: activeTab === 'get_involved' ? 'var(--color-terracotta-500, #C1552C)' : '#FFFFFF',
              color: activeTab === 'get_involved' ? '#FFFFFF' : 'var(--color-ink, #181512)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          >
            <span>👤</span>
            <span>{isHi ? 'प्रोफाइल विवरण' : 'Profile Details'}</span>
          </button>

          {/* 2. LEADERBOARD (UNLOCKED) */}
          <button
            type="button"
            data-active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'leaderboard' ? '1px solid var(--color-terracotta-500, #C1552C)' : '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: activeTab === 'leaderboard' ? 'var(--color-terracotta-500, #C1552C)' : '#FFFFFF',
              color: activeTab === 'leaderboard' ? '#FFFFFF' : 'var(--color-ink, #181512)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          >
            <span>🏆</span>
            <span>{isHi ? 'लीडरबोर्ड' : 'Leaderboard'}</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
          </button>

          {/* 3. DAILY TASKS (UNLOCKED) */}
          <button
            type="button"
            data-active={activeTab === 'daily_tasks'}
            onClick={() => setActiveTab('daily_tasks')}
            title={`${userTaskSubmissions.length} of ${totalTasksCount} Daily Tasks Submitted`}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'daily_tasks' ? '1px solid var(--color-terracotta-500, #C1552C)' : '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: activeTab === 'daily_tasks' ? 'var(--color-terracotta-500, #C1552C)' : '#FFFFFF',
              color: activeTab === 'daily_tasks' ? '#FFFFFF' : 'var(--color-ink, #181512)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1, flexShrink: 0 }}>⚡</span>
            <span>{isHi ? 'दैनिक कार्य' : 'Daily Tasks'}</span>
            <span style={{
              background: activeTab === 'daily_tasks'
                ? 'rgba(255, 255, 255, 0.25)'
                : 'var(--color-sand-100, #F3ECE0)',
              color: activeTab === 'daily_tasks'
                ? '#FFFFFF'
                : 'var(--color-ink, #181512)',
              border: activeTab === 'daily_tasks'
                ? '1px solid rgba(255, 255, 255, 0.35)'
                : '1px solid var(--color-line, #E2D7C3)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm, 2px)',
              fontSize: '11px',
              fontWeight: '800',
              lineHeight: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              letterSpacing: '0.02em',
              flexShrink: 0
            }}>
              {userTaskSubmissions.length > 0
                ? `${userTaskSubmissions.length}/${totalTasksCount}`
                : totalTasksCount}
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
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: 'var(--color-sand-50, #FBF8F3)',
              color: 'var(--color-ink-muted, #5E554D)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title="Joined Masterclasses (Locked)"
          >
            <span>🎓</span>
            <span>{isHi ? 'मास्टरक्लासेज' : 'Masterclasses'}</span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm, 2px)',
              fontSize: '10px',
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
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: 'var(--color-sand-50, #FBF8F3)',
              color: 'var(--color-ink-muted, #5E554D)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title="Enrolled Programs (Locked)"
          >
            <span>🏛️</span>
            <span>{isHi ? 'कार्यक्रम' : 'Officer Programs'}</span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm, 2px)',
              fontSize: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              🔒
            </span>
          </button>

          {/* 6. GUP-SHUP / CHIT-CHAT (ACTIVE) */}
          <button
            type="button"
            onClick={() => setActiveTab('gupshup')}
            style={{
              width: '100%',
              minWidth: 0,
              padding: '9px 10px',
              fontSize: '12.8px',
              fontWeight: '700',
              border: activeTab === 'gupshup'
                ? '1px solid var(--color-terracotta-500, #C1552C)'
                : '1px solid var(--color-line, #E2D7C3)',
              borderRadius: 'var(--radius-sm, 2px)',
              background: activeTab === 'gupshup' ? 'var(--color-terracotta-500, #C1552C)' : '#FFFFFF',
              color: activeTab === 'gupshup' ? '#FFFFFF' : 'var(--color-ink, #181512)',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title="Gup-Shup (Chit-Chat)"
          >
            <span>💬</span>
            <span>{isHi ? 'गप-शप' : 'Gup-Shup'}</span>
            <span style={{
              background: activeTab === 'gupshup'
                ? 'rgba(255, 255, 255, 0.25)'
                : (isWithinNightChatHours() ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
              border: activeTab === 'gupshup'
                ? '1px solid rgba(255, 255, 255, 0.35)'
                : (isWithinNightChatHours() ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'),
              color: activeTab === 'gupshup'
                ? '#FFFFFF'
                : (isWithinNightChatHours() ? '#059669' : '#D97706'),
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm, 2px)',
              fontSize: '10px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {isWithinNightChatHours() ? '🌙 8PM-8AM' : '🔑 Pass'}
            </span>
          </button>
        </div>

        {/* TAB 1: JOINED MASTERCLASSES */}
        {activeTab === 'masterclasses' && (
          <div>
            {joinedMasterclasses.length === 0 ? (
              <div style={{
                background: 'var(--color-sand-100, #F3ECE0)',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid var(--color-line, #E2D7C3)',
                boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: '0 0 8px 0', fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                  No Enrolled Masterclasses Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted, #5E554D)', margin: '0 0 20px 0' }}>
                  Explore live bilingual masterclasses offered by Bihar AI Mission.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-terracotta-500, #C1552C)',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-sm, 2px)',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none'
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
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-sm, 2px)',
                      border: '1px solid var(--color-line, #E2D7C3)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
                      color: 'var(--color-ink, #181512)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-500, #C1552C)', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)' }}>
                            {cls.category || 'Masterclass'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: '700' }}>✓ Enrolled</span>
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                          {cls.title}
                        </h3>
                        <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted, #5E554D)', fontWeight: '600', marginBottom: '12px' }}>
                          📅 Joined Date: <strong>{getJoinedDate(cls.id)}</strong>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                          {cls.description ? cls.description.slice(0, 100) + '…' : ''}
                        </p>
                      </div>

                      {hasPassed && isApproved ? (
                        <button
                          onClick={() => setActiveCertSubmission(sub)}
                          style={{
                            width: '100%',
                            background: '#2D6A4F',
                            color: '#FFFFFF',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm, 2px)',
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
                          📜 View & Download Certificate
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {cls.isExamExpired ? (
                            <div
                              style={{
                                width: '100%',
                                background: '#FFF5F5',
                                color: '#BE123C',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm, 2px)',
                                fontWeight: '800',
                                fontSize: '12px',
                                border: '1px solid #FECDD3',
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
                                    background: 'var(--color-sand-50, #FBF8F3)',
                                    border: '1px solid var(--color-line, #E2D7C3)',
                                    color: 'var(--color-ink, #181512)',
                                    padding: '9px 12px',
                                    borderRadius: 'var(--radius-sm, 2px)',
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
                                  background: 'var(--color-terracotta-500, #C1552C)',
                                  color: '#FFFFFF',
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm, 2px)',
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
                background: 'var(--color-sand-100, #F3ECE0)',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '48px 32px',
                textAlign: 'center',
                border: '1px solid var(--color-line, #E2D7C3)',
                boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏛️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: '0 0 8px 0', fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                  No Enrolled Officer Programs Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted, #5E554D)', margin: '0 0 20px 0' }}>
                  You have not enrolled in any specialized officer programs yet.
                </p>
                <Link
                  to="/learning"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#2D6A4F',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-sm, 2px)',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  Explore Programs & Enroll →
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {joinedOfficerPrograms.map((prog) => (
                  <div key={prog.id} style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-sm, 2px)',
                    border: '1px solid var(--color-line, #E2D7C3)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
                    color: 'var(--color-ink, #181512)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2D6A4F', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)' }}>
                          SPECIALIZED PROGRAM
                        </span>
                        <span style={{ fontSize: '12px', color: '#2D6A4F', fontWeight: '700' }}>✓ Enrolled</span>
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                        {prog.title}
                      </h3>
                      <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted, #5E554D)', fontWeight: '600', marginBottom: '12px' }}>
                        📅 Joined Date: <strong>{getJoinedDate(prog.id)}</strong>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        {prog.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/exam/${prog.id || 'ai-fundamentals'}`)}
                      style={{
                        width: '100%',
                        background: '#2D6A4F',
                        color: '#FFFFFF',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 2px)',
                        fontWeight: '800',
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer'
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
              background: '#FFFFFF',
              borderRadius: 'var(--radius-sm, 2px)',
              border: '1px solid var(--color-line, #E2D7C3)',
              padding: '32px 36px',
              boxShadow: 'var(--shadow-soft, 0 1px 2px rgba(24, 21, 18, 0.04))',
              color: 'var(--color-ink, #181512)'
            }} className="profileForm">
              <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--color-line, #E2D7C3)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-500, #C1552C)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    BIHAR AI MISSION
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-ink, #181512)', margin: 0, fontFamily: "var(--font-display, 'Fraunces', serif)" }}>
                    Profile Details
                  </h2>
                </div>
              </div>

              <div style={{
                background: 'var(--color-sand-100, #F3ECE0)',
                border: '1px solid var(--color-line, #E2D7C3)',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '16px 20px',
                marginBottom: '24px',
                color: 'var(--color-ink, #181512)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13.5px'
              }}>
                <span style={{ fontSize: '22px' }}>🔒</span>
                <div>
                  <strong style={{ color: 'var(--color-ink, #181512)' }}>Registration Integrity Notice:</strong> Mandatory identity inputs (Full Name, Email, Mobile, Gender, Age, Category, State, District, and Block) were verified during registration and are permanently locked. You can edit and update your <strong>designation, organization, experience, AI interests, and professional links</strong> anytime.
                </div>
              </div>

              {formSuccess && (
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '24px'
                }}>
                  {formSuccess}
                </div>
              )}

              {formError && (
                <div style={{
                  background: '#FFF5F5',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm, 2px)',
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
                  background: 'var(--color-sand-50, #FBF8F3)',
                  border: '1px solid var(--color-line, #E2D7C3)',
                  borderRadius: 'var(--radius-sm, 2px)',
                  padding: '20px 22px',
                  marginBottom: '28px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-line, #E2D7C3)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🔒</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: 0 }}>
                        Mandatory Registration Details
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: 'var(--color-ink-muted, #5E554D)',
                      background: 'var(--color-sand-100, #F3ECE0)',
                      border: '1px solid var(--color-line, #E2D7C3)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 2px)'
                    }}>
                      🔒 Non-Editable (Verified)
                    </span>
                  </div>

                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
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
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    {/* UNIQUE USERNAME (@) - DYNAMIC LOCKED OR ONE-TIME CREATION */}
                    {hasSetUsername ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', margin: 0 }}>
                            Unique Username (@) *
                          </label>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            color: '#166534',
                            background: '#DCFCE7',
                            border: '1px solid #BBF7D0',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm, 2px)'
                          }}>
                            🔒 Permanent (Locked)
                          </span>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <span style={{ position: 'absolute', left: '12px', fontSize: '14px', fontWeight: '800', color: '#B45309', fontFamily: 'monospace', pointerEvents: 'none' }}>@</span>
                          <input
                            type="text"
                            readOnly
                            value={(formData.username || existingSubmission?.username || currentUser?.username || '').replace(/^@+/, '')}
                            style={{
                              width: '100%', height: '42px', padding: '0 14px 0 28px', borderRadius: 'var(--radius-sm, 2px)',
                              border: '1px solid var(--color-line, #E2D7C3)',
                              background: 'var(--color-sand-100, #F3ECE0)',
                              fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed',
                              fontWeight: '700', fontFamily: 'monospace'
                            }}
                          />
                        </div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#786F66', marginTop: '4px' }}>
                          🔒 Verified unique username is locked and cannot be changed.
                        </span>
                      </div>
                    ) : (
                      <div
                        id="createUsernameSection"
                        style={{
                          gridColumn: '1 / -1',
                          background: '#FFFDF9',
                          border: '1.5px solid #F59E0B',
                          borderRadius: '6px',
                          padding: '16px',
                          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                          <label style={{ fontSize: '13.5px', fontWeight: '800', color: '#92400E', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✍️</span>
                            <span>{isHi ? 'अपना यूनीक यूज़रनेम (@) बनाएं' : 'Create Your Unique Username (@)'} <span style={{ color: '#DC2626' }}>*</span></span>
                          </label>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            color: '#B45309',
                            background: '#FEF3C7',
                            border: '1px solid #FDE68A',
                            padding: '2px 8px',
                            borderRadius: '3px'
                          }}>
                            ⚡ {isHi ? 'आवश्यक: केवल एक बार सेट किया जा सकता है' : 'Action Required · One-Time Creation'}
                          </span>
                        </div>

                        {/* Prominent Warning Banner */}
                        <div style={{
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '4px',
                          padding: '10px 12px',
                          marginBottom: '14px',
                          fontSize: '12.5px',
                          lineHeight: 1.5,
                          color: '#991B1B',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
                          <span>
                            <strong>{isHi ? 'महत्वपूर्ण चेतावनी:' : 'Important Warning:'}</strong>{' '}
                            {isHi
                              ? 'आप अपना यूज़रनेम (@) केवल एक बार बना सकते हैं। एक बार सेट करने के बाद यह हमेशा के लिए लॉक हो जाएगा और इसे दोबारा कभी बदला या संपादित नहीं किया जा सकेगा।'
                              : 'You can set your unique username (@) only ONCE. Once set, it will be permanently locked and cannot be changed or edited under any circumstances.'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '240px' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: '800', color: '#B45309', fontFamily: 'monospace', pointerEvents: 'none', zIndex: 2 }}>@</span>
                            <input
                              type="text"
                              placeholder={isHi ? 'apna_username (उदा. rahul_patna)' : 'choose_username (e.g. rahul_kumar)'}
                              value={newUsernameInput}
                              maxLength={10}
                              onChange={(e) => handleProfileUsernameChange(e.target.value)}
                              onBlur={() => checkProfileUsernameAvailability(newUsernameInput)}
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="none"
                              spellCheck="false"
                              style={{
                                width: '100%', height: '42px', padding: '0 38px 0 30px', borderRadius: '4px',
                                border: profileUsernameStatus === 'available' ? '1.5px solid #16A34A' : profileUsernameStatus === 'taken' || profileUsernameStatus === 'invalid' ? '1.5px solid #DC2626' : '1.5px solid #D1D5DB',
                                background: profileUsernameStatus === 'available' ? '#F4FBF7' : profileUsernameStatus === 'taken' || profileUsernameStatus === 'invalid' ? '#FEF2F2' : '#FFFFFF',
                                fontSize: '14px', color: '#181512', fontWeight: '700', fontFamily: 'monospace'
                              }}
                            />

                            {/* Inside input indicator: Green tick / Red cross / Spinner */}
                            {profileUsernameStatus && (
                              <span className="profileUsernameInsideIndicator" aria-hidden="true">
                                {profileUsernameStatus === 'checking' && (
                                  <span className="profileInsideChecking" title={isHi ? 'जाँच हो रही है…' : 'Checking availability…'}></span>
                                )}
                                {profileUsernameStatus === 'available' && (
                                  <span className="profileInsideSuccess" title={isHi ? 'उपलब्ध है' : 'Available'}>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                                {(profileUsernameStatus === 'taken' || profileUsernameStatus === 'invalid') && (
                                  <span className="profileInsideError" title={profileUsernameStatus === 'taken' ? (isHi ? 'यूज़रनेम पहले से लिया जा चुका है' : 'Username already taken') : (isHi ? 'अमान्य यूज़रनेम' : 'Invalid username')}>
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={handleClaimUsername}
                            disabled={
                              isClaimingUsername ||
                              !newUsernameInput.trim() ||
                              profileUsernameStatus === 'checking' ||
                              profileUsernameStatus === 'taken' ||
                              profileUsernameStatus === 'invalid'
                            }
                            style={{
                              height: '42px',
                              padding: '0 20px',
                              background: (!newUsernameInput.trim() || profileUsernameStatus === 'taken' || profileUsernameStatus === 'invalid') ? '#9CA3AF' : 'linear-gradient(135deg, #B45309, #92400E)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: '800',
                              fontSize: '13px',
                              cursor: (!newUsernameInput.trim() || profileUsernameStatus === 'taken' || profileUsernameStatus === 'invalid' || isClaimingUsername) ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isClaimingUsername ? (
                              <>⏳ {isHi ? 'सहेज रहे हैं…' : 'Saving…'}</>
                            ) : (
                              <>{isHi ? 'यूज़रनेम सेट करें' : 'Set Username'}</>
                            )}
                          </button>
                        </div>

                        {/* Availability status indicators */}
                        <div style={{ marginTop: '8px', minHeight: '18px' }}>
                          {profileUsernameStatus === 'checking' && (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>
                              ⏳ {isHi ? 'यूज़रनेम की उपलब्धता जाँची जा रही है…' : 'Checking availability in database…'}
                            </span>
                          )}
                          {profileUsernameStatus === 'available' && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A' }}>
                              ✅ {isHi ? `@${cleanProfileUsername(newUsernameInput)} उपलब्ध है! 'यूज़रनेम सेट करें' पर क्लिक करें।` : `@${cleanProfileUsername(newUsernameInput)} is available! Click 'Set Username' to set.`}
                            </span>
                          )}
                          {profileUsernameStatus === 'taken' && (
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#DC2626' }}>
                              ❌ {isHi ? `यह यूज़रनेम @${cleanProfileUsername(newUsernameInput)} पहले से किसी ने ले लिया है। कृपया दूसरा नाम चुनें।` : `Username @${cleanProfileUsername(newUsernameInput)} is already taken. Please choose another.`}
                            </span>
                          )}
                          {profileUsernameStatus === 'invalid' && (
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#B45309' }}>
                              ⚠️ {isHi ? '5-10 वर्ण (केवल अक्षर a-z, संख्या 0-9 और अंडरस्कोर _)' : 'Must be 5-10 characters (lowercase letters, numbers, and underscore _ only)'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        readOnly
                        placeholder="e.g. user@example.com"
                        value={formData.email}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        readOnly
                        placeholder="e.g. 9876543210"
                        value={formData.mobile === 'N/A' ? '' : formData.mobile}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        Gender *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.gender || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        Age *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.age ? `${formData.age} Years` : 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
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
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        State *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.state || 'Bihar'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.district || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        Block / Sub-Division / City *
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.block_city || 'Not Specified'}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: 'var(--color-sand-100, #F3ECE0)',
                          fontSize: '13.5px', color: 'var(--color-ink-muted, #5E554D)', cursor: 'not-allowed'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. NON-MANDATORY & EDITABLE PROFILE DETAILS */}
                <div style={{
                  background: 'var(--color-sand-50, #FBF8F3)',
                  border: '1px solid var(--color-line, #E2D7C3)',
                  borderRadius: 'var(--radius-sm, 2px)',
                  padding: '20px 22px',
                  marginBottom: '28px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-line, #E2D7C3)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>✏️</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-ink, #181512)', margin: 0 }}>
                        Professional & Profile Details
                      </h3>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#065F46',
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 2px)'
                    }}>
                      ✏️ Editable Anytime
                    </span>
                  </div>

                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                        Designation / Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Software Engineer / Officer / Student"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                        Department / Wing
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Information Technology / Education / Health"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                        Organization / College / Company
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Government of Bihar / IIT Patna / Tech Corp"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
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
                            flex: 1, height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                            border: '1px solid var(--color-line, #E2D7C3)',
                            background: '#FFFFFF',
                            fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                          }}
                        />
                        <select
                          value={formData.experience_unit || 'Years'}
                          onChange={(e) => setFormData({ ...formData, experience_unit: e.target.value })}
                          style={{
                            width: '110px', height: '42px', padding: '0 10px', borderRadius: 'var(--radius-sm, 2px)',
                            border: '1px solid var(--color-line, #E2D7C3)',
                            background: '#FFFFFF',
                            fontSize: '13.5px', color: 'var(--color-ink, #181512)', fontWeight: '600'
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
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '8px' }}>
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
                              padding: '6px 12px',
                              borderRadius: 'var(--radius-sm, 2px)',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              border: isSelected ? '1px solid var(--color-terracotta-500, #C1552C)' : '1px solid var(--color-line, #E2D7C3)',
                              background: isSelected ? 'var(--color-terracotta-500, #C1552C)' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : 'var(--color-ink, #181512)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'background 0.2s ease'
                            }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{isHi ? item.labelHi : item.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-ink-muted, #5E554D)', marginBottom: '6px' }}>
                        ✍️ Custom / Additional Interest (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Vision, Autonomous Drones, Local LLMs..."
                        value={formData.custom_interest || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_interest: e.target.value }))}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                        }}
                      />
                    </div>
                  </div>

                  {/* CONTRIBUTION / STATEMENT OF INTENT */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                      How do you wish to contribute to Bihar AI Mission?
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. AI research, mentoring candidates, civic innovation, local language LLM development, hackathon mentoring..."
                      value={formData.contribution || ''}
                      onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm, 2px)',
                        border: '1px solid var(--color-line, #E2D7C3)',
                        background: '#FFFFFF',
                        fontSize: '13.5px', fontFamily: 'inherit', color: 'var(--color-ink, #181512)'
                      }}
                    />
                  </div>

                  {/* SOCIAL & PORTFOLIO LINKS */}
                  <div className="formGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={formData.linkedin || ''}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--color-ink, #181512)', marginBottom: '6px' }}>
                        Portfolio / GitHub / Website URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username or https://yourportfolio.com"
                        value={formData.portfolio || ''}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        style={{
                          width: '100%', height: '42px', padding: '0 14px', borderRadius: 'var(--radius-sm, 2px)',
                          border: '1px solid var(--color-line, #E2D7C3)',
                          background: '#FFFFFF',
                          fontSize: '13.5px', color: 'var(--color-ink, #181512)'
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
                    height: '46px',
                    background: formSubmitting
                      ? 'rgba(193, 85, 44, 0.5)'
                      : 'var(--color-terracotta-500, #C1552C)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '800',
                    border: 'none',
                    borderRadius: 'var(--radius-sm, 2px)',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <span>💾</span>
                  <span>{formSubmitting ? 'Saving to Database…' : 'Save & Update Profile Details'}</span>
                </button>
              </form>
            </div>
          );
        })()}

        {/* TAB 5: DEDICATED REAL-TIME LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <TaskLeaderboard isHi={isHi} />
        )}

        {/* TAB 6: CHIT-CHAT (GUP-SHUP) */}
        {activeTab === 'gupshup' && (
          <ChitChat
            currentUser={{
              ...currentUser,
              ...formData,
              username: (formData.username || existingSubmission?.username || currentUser?.username || '').replace(/^@+/, '').trim()
            }}
            isHi={isHi}
            onGoToProfile={() => {
              setActiveTab('profile');
              setTimeout(() => {
                const el = document.getElementById('createUsernameSection') || document.querySelector('.formGrid');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 120);
            }}
          />
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
            background: 'rgba(24, 21, 18, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowGupShupModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-sand-300, #D8CEBE)',
              borderTop: '3px solid var(--color-terracotta, #C1552C)',
              borderRadius: 'var(--radius-sm, 2px)',
              maxWidth: '520px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              position: 'relative',
              color: 'var(--color-ink, #181512)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowGupShupModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--color-sand-100, #F3ECE0)',
                border: '1px solid var(--color-sand-300, #D8CEBE)',
                color: 'var(--color-ink-muted, #5C554B)',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm, 2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-ink, #181512)';
                e.currentTarget.style.background = 'var(--color-sand-200, #E6DCB8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-ink-muted, #5C554B)';
                e.currentTarget.style.background = 'var(--color-sand-100, #F3ECE0)';
              }}
            >
              ✕
            </button>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-sm, 2px)',
                  background: 'var(--color-sand-100, #F3ECE0)',
                  border: '1px solid var(--color-sand-300, #D8CEBE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}
              >
                💬
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading, "Fraunces", Georgia, serif)', fontWeight: '700', margin: 0, color: 'var(--color-ink, #181512)', letterSpacing: '-0.01em' }}>
                    Gup-Shup
                  </h3>
                  <span
                    style={{
                      background: '#FEF2F2',
                      color: '#991B1B',
                      border: '1px solid #FECDD3',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm, 2px)',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}
                    title="Locked"
                  >
                    🔒
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-ink-muted, #5C554B)' }}>
                  Community Chit-Chat World — Department Groups, @Mentions & Achievements
                </p>
              </div>
            </div>

            {/* WHATSAPP CHAT PREVIEW MOCKUP BUBBLE */}
            <div
              style={{
                background: 'var(--color-sand-50, #FBF8F3)',
                border: '1px solid var(--color-sand-300, #D8CEBE)',
                borderRadius: 'var(--radius-sm, 2px)',
                padding: '14px',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm, 2px)',
                    background: 'var(--color-terracotta, #C1552C)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}
                >
                  🤖
                </div>
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-sand-200, #E6DCB8)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm, 2px)',
                    fontSize: '13px',
                    color: 'var(--color-ink, #181512)',
                    lineHeight: '1.5',
                    maxWidth: '88%'
                  }}
                >
                  <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#15803D' }}>
                    Gup-Shup Community Bot
                  </p>
                  <p style={{ margin: 0 }}>
                    Namaste! 🙏 <strong>Gup-Shup</strong> is an interactive community world. You will be able to join <strong>Department-Wise Groups</strong>, chat statewide in the <strong>Overall Group</strong>, tag peers with <strong>@mentions</strong>, and share <strong>Achievement Photos & Certificates</strong>!
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--color-ink-muted, #7A7265)', display: 'block', textAlign: 'right', marginTop: '6px' }}>
                    Just now · 🔒 End-to-End Civic Network
                  </span>
                </div>
              </div>
            </div>

            {/* UPCOMING HIGHLIGHTS */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-terracotta, #C1552C)', margin: '0 0 8px 0' }}>
                Features in Next Rollout:
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
                      background: 'var(--color-sand-100, #F3ECE0)',
                      border: '1px solid var(--color-sand-300, #D8CEBE)',
                      borderRadius: 'var(--radius-sm, 2px)',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--color-ink, #181512)'
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
                  background: 'var(--color-terracotta, #C1552C)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm, 2px)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-terracotta-dark, #A9431E)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-terracotta, #C1552C)';
                }}
              >
                Coming Soon — Understood
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
            background: 'rgba(24, 21, 18, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLockedModal(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-sand-300, #D8CEBE)',
              borderTop: '3px solid var(--color-terracotta, #C1552C)',
              borderRadius: 'var(--radius-sm, 2px)',
              maxWidth: '480px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
              position: 'relative',
              color: 'var(--color-ink, #181512)',
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
                background: 'var(--color-sand-100, #F3ECE0)',
                border: '1px solid var(--color-sand-300, #D8CEBE)',
                color: 'var(--color-ink-muted, #5C554B)',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm, 2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-ink, #181512)';
                e.currentTarget.style.background = 'var(--color-sand-200, #E6DCB8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-ink-muted, #5C554B)';
                e.currentTarget.style.background = 'var(--color-sand-100, #F3ECE0)';
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '38px', marginBottom: '10px' }}>
              {lockedModal.icon || '🔒'}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECDD3', padding: '3px 10px', borderRadius: 'var(--radius-sm, 2px)', fontSize: '11px', fontWeight: '700', marginBottom: '12px' }}>
              🔒 Feature Locked
            </div>

            <h3 style={{ fontSize: '19px', fontFamily: 'var(--font-heading, "Fraunces", Georgia, serif)', fontWeight: '700', color: 'var(--color-ink, #181512)', margin: '0 0 6px 0' }}>
              {lockedModal.title}
            </h3>

            {lockedModal.subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--color-terracotta, #C1552C)', margin: '0 0 12px 0', fontWeight: '600' }}>
                {lockedModal.subtitle}
              </p>
            )}

            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted, #5C554B)', lineHeight: '1.55', margin: '0 0 20px 0' }}>
              {lockedModal.message}
            </p>

            <button
              type="button"
              onClick={() => setLockedModal(null)}
              style={{
                width: '100%',
                background: 'var(--color-terracotta, #C1552C)',
                border: 'none',
                color: '#FFFFFF',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm, 2px)',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-terracotta-dark, #A9431E)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-terracotta, #C1552C)';
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* CLAIM USERNAME PERMANENT CONFIRMATION MODAL */}
      {showClaimConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(12, 10, 8, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#181512' }}>
                {isHi ? 'यूज़रनेम स्थायी रूप से लॉक करें?' : 'Lock Username Permanently?'}
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {isHi ? (
                <>
                  आप अपना यूनीक यूज़रनेम <strong style={{ color: '#B45309', fontFamily: 'monospace' }}>@{cleanProfileUsername(newUsernameInput)}</strong> सेट करने जा रहे हैं।
                  <br /><br />
                  <strong>महत्वपूर्ण सूचना:</strong> यह क्रिया केवल <strong>एक बार</strong> ही की जा सकती है। इसके बाद आपका यूज़रनेम स्थायी रूप से लॉक हो जाएगा और इसे दोबारा कभी बदला या संपादित नहीं किया जा सकेगा।
                </>
              ) : (
                <>
                  You are about to permanently set your unique username as <strong style={{ color: '#B45309', fontFamily: 'monospace' }}>@{cleanProfileUsername(newUsernameInput)}</strong>.
                  <br /><br />
                  <strong>Important Notice:</strong> You can only do this <strong>ONCE</strong>. After setting it, this username is permanently locked to your account and cannot be changed or edited.
                </>
              )}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowClaimConfirmModal(false)}
                style={{
                  padding: '8px 16px', borderRadius: '4px',
                  border: '1px solid #D1D5DB', background: '#F3F4F6',
                  color: '#374151', fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeClaimUsername}
                style={{
                  padding: '8px 18px', borderRadius: '4px',
                  border: 'none', background: '#B45309',
                  color: '#FFFFFF', fontWeight: '800', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {isHi ? 'हाँ, यूज़रनेम सेट करें' : 'Yes, Set Username'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
