import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
import { sendRegistrationThankYouEmail } from '../../utils/resendEmail';
import styles from './RegistrationModal.module.css';

/* ─── Indian States & UTs ─── */
const INDIAN_STATES = [
  'Bihar',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCR)', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry', 'Other (Outside India)'
];

/* ─── Bihar 38 Districts ─── */
const BIHAR_DISTRICTS = [
  'Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur',
  'Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad',
  'Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani',
  'Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa',
  'Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul',
  'Vaishali','West Champaran'
];

/* ─── Role Types ─── */
const ROLE_TYPES = [
  { value: 'government_officer', labelEn: 'Government Officer / सरकारी अधिकारी', labelHi: 'सरकारी अधिकारी' },
  { value: 'student', labelEn: 'Student / विद्यार्थी', labelHi: 'विद्यार्थी' },
  { value: 'teacher_professor', labelEn: 'Teacher / Professor', labelHi: 'शिक्षक / प्रोफेसर' },
  { value: 'startup_founder', labelEn: 'Startup Founder / Entrepreneur', labelHi: 'स्टार्टअप संस्थापक / उद्यमी' },
  { value: 'working_professional', labelEn: 'Working Professional', labelHi: 'कार्यरत पेशेवर' },
  { value: 'freelancer', labelEn: 'Freelancer / Self-Employed', labelHi: 'फ्रीलांसर / स्वरोजगार' },
  { value: 'researcher', labelEn: 'Researcher / Scholar', labelHi: 'शोधकर्ता / विद्वान' },
  { value: 'other', labelEn: 'Other', labelHi: 'अन्य' }
];

/* ─── Unified Primary Interest & Focus Options ─── */
const INTEREST_OPTIONS = [
  { value: 'ai_skills_cert', labelEn: 'Learn AI Skills & Get Certified', labelHi: 'AI कौशल सीखें और प्रमाणपत्र प्राप्त करें' },
  { value: 'ai_basics', labelEn: 'AI Fundamentals & Basics', labelHi: 'AI के बुनियादी सिद्धांत' },
  { value: 'prompt_engineering', labelEn: 'Prompt Engineering & Tools', labelHi: 'प्रॉम्प्ट इंजीनियरिंग और AI टूल्स' },
  { value: 'data_analytics', labelEn: 'Data Analytics & Visualization', labelHi: 'डेटा एनालिटिक्स और विज़ुअलाइज़ेशन' },
  { value: 'ai_governance', labelEn: 'AI in Governance & Public Policy', labelHi: 'शासन और सार्वजनिक नीति में AI' },
  { value: 'ai_agri_health', labelEn: 'AI in Agriculture & Healthcare', labelHi: 'कृषि और स्वास्थ्य सेवा में AI' },
  { value: 'coding_dev', labelEn: 'Coding & Software Development', labelHi: 'कोडिंग और सॉफ्टवेयर डेवलपमेंट' },
  { value: 'ai_startups', labelEn: 'AI for Startups & Business', labelHi: 'स्टार्टअप और बिजनेस के लिए AI' },
  { value: 'govt_training', labelEn: 'Government Officer Training Program', labelHi: 'सरकारी अधिकारी प्रशिक्षण कार्यक्रम' },
  { value: 'collaborate', labelEn: 'Collaborate / Contribute to Mission', labelHi: 'मिशन में सहयोग / योगदान' },
  { value: 'other', labelEn: '✍️ Other (Write Manually)', labelHi: '✍️ अन्य (मैन्युअल लिखें)' }
];

export default function RegistrationModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
    gender: '',
    age: '',
    role_type: '',
    designation: '',
    department: '',
    organization: '',
    experience: '',
    experience_unit: 'Years',
    state: 'Bihar',
    district: '',
    block_city: '',
    interests: [],
    custom_interest: '',
    intent: 'General Inquiry',
    contribution: '',
    linkedin: '',
    portfolio: ''
  });

  // Prevent body & root scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Single Interest Selection (User can only select 1)
  const selectInterest = (val) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests && prev.interests[0] === val ? [] : [val]
    }));
  };

  /* ─── Step Validation ─── */
  const isStep1Valid = () => {
    return (
      form.full_name.trim() &&
      form.email.trim() &&
      form.mobile.trim().length === 10 &&
      form.password &&
      form.password.length >= 6 &&
      form.password === form.confirm_password &&
      form.gender &&
      form.age &&
      form.role_type
    );
  };

  const isStep2Valid = () => {
    return (
      form.designation.trim() &&
      form.department.trim() &&
      form.organization.trim() &&
      (form.experience !== '' && form.experience !== null && !isNaN(form.experience) && Number(form.experience) >= 0) &&
      form.state.trim() &&
      form.district.trim() &&
      form.block_city.trim()
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.full_name.trim()) {
        toast?.warning(isHi ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
        return;
      }
      if (!form.email.trim() || !form.email.includes('@')) {
        toast?.warning(isHi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
        return;
      }
      if (!form.mobile.trim() || form.mobile.trim().length !== 10) {
        toast?.warning(isHi ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!form.password || form.password.length < 6) {
        toast?.warning(isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
        return;
      }
      if (form.password !== form.confirm_password) {
        toast?.warning(isHi ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
        return;
      }
      if (!form.gender) {
        toast?.warning(isHi ? 'कृपया लिंग चुनें।' : 'Please select your gender.');
        return;
      }
      if (!form.age) {
        toast?.warning(isHi ? 'कृपया आयु दर्ज करें।' : 'Please enter your age.');
        return;
      }
      if (!form.role_type) {
        toast?.warning(isHi ? 'कृपया अपनी भूमिका / प्रकार चुनें।' : 'Please select your role type.');
        return;
      }
    } else if (step === 2) {
      if (!form.designation.trim()) {
        toast?.warning(isHi ? 'कृपया अपना पदनाम दर्ज करें।' : 'Please enter your designation / title.');
        return;
      }
      if (!form.department.trim()) {
        toast?.warning(isHi ? 'कृपया अपना विभाग दर्ज करें।' : 'Please enter your department.');
        return;
      }
      if (!form.organization.trim()) {
        toast?.warning(isHi ? 'कृपया संस्था / संगठन का नाम दर्ज करें।' : 'Please enter your organization.');
        return;
      }
      if (form.experience === '' || form.experience === null || isNaN(form.experience) || Number(form.experience) < 0) {
        toast?.warning(isHi ? 'कृपया अनुभव दर्ज करें (0 या अधिक)।' : 'Please enter experience (0 or more).');
        return;
      }
      if (!form.state) {
        toast?.warning(isHi ? 'कृपया राज्य चुनें।' : 'Please select your state.');
        return;
      }
      if (!form.district.trim()) {
        toast?.warning(isHi ? 'कृपया जिला चुनें या दर्ज करें।' : 'Please select or enter your district.');
        return;
      }
      if (!form.block_city.trim()) {
        toast?.warning(isHi ? 'कृपया अपना प्रखंड (Block) दर्ज करें।' : 'Please enter your Block.');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  /* ─── Submit to Supabase ─── */
  const handleSubmit = async () => {
    if (!isStep1Valid()) {
      toast?.warning(isHi ? 'कृपया पहले चरण की सभी अनिवार्य (*) फ़ील्ड भरें।' : 'Please fill all required (*) fields in Step 1.');
      setStep(1);
      return;
    }
    if (!isStep2Valid()) {
      toast?.warning(isHi ? 'कृपया दूसरे चरण की सभी अनिवार्य (*) फ़ील्ड भरें।' : 'Please fill all required (*) fields in Step 2.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const expVal = parseInt(form.experience, 10) || 0;
      const expFinal = form.experience_unit === 'Months'
        ? (expVal >= 12 ? Math.round(expVal / 12) : 0)
        : expVal;

      const selectedOption = INTEREST_OPTIONS.find(o => o.value === (form.interests && form.interests[0]));
      const isOther = form.interests && form.interests[0] === 'other';
      const chosenInterest = isOther 
        ? (form.custom_interest.trim() || 'Other')
        : (selectedOption ? (isHi ? selectedOption.labelHi : selectedOption.labelEn) : 'General Inquiry');

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        gender: form.gender || null,
        age: form.age ? parseInt(form.age, 10) : null,
        role_type: form.role_type,
        designation: form.designation.trim() || null,
        department: form.department.trim() || null,
        organization: form.organization.trim() || null,
        experience: expFinal,
        state: form.state || 'Bihar',
        district: form.district || 'Not Specified',
        block_city: form.block_city.trim() || null,
        interests: [chosenInterest],
        intent: chosenInterest,
        contribution: form.contribution.trim() || null,
        linkedin: form.linkedin.trim() || null,
        portfolio: form.portfolio.trim() || null
      };

      // 1. Create or register user in Supabase Auth with encrypted password
      if (supabase && supabase.auth && form.password) {
        try {
          const { error: authErr } = await supabase.auth.signUp({
            email: payload.email,
            password: form.password,
            options: {
              data: {
                full_name: payload.full_name,
                fullName: payload.full_name,
                designation: payload.designation || 'Member',
                phone: payload.mobile,
                district: payload.district,
              }
            }
          });
          if (authErr && authErr.message && (authErr.message.includes('already registered') || authErr.message.includes('User already exists'))) {
            // Already in auth, try sign in with provided password
            await supabase.auth.signInWithPassword({
              email: payload.email,
              password: form.password
            }).catch(() => {});
          }
        } catch (authEx) {
          console.warn('Supabase auth signup warning:', authEx);
        }
      }

      // 2. Save profile to public.user_details table
      const { error } = await supabase
        .from('user_details')
        .upsert([payload], { onConflict: 'email', ignoreDuplicates: false });
      if (error) {
        console.error('Supabase upsert error:', error);
        if (error.code === '23505') {
          toast?.warning(isHi ? 'यह ईमेल या मोबाइल पहले से पंजीकृत है।' : 'This email or mobile is already registered.');
        } else {
          toast?.error(isHi ? 'पंजीकरण विफल हुआ। कृपया बाद में पुनः प्रयास करें।' : 'Registration failed. Please try again later.');
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Send official confirmation email
      sendRegistrationThankYouEmail({
        fullName: payload.full_name,
        email: payload.email,
        roleType: ROLE_TYPES.find((r) => r.value === payload.role_type)?.labelEn || payload.role_type,
        state: payload.state,
        district: payload.district,
        intent: INTEREST_OPTIONS.find((i) => i.value === payload.intent)?.labelEn || payload.intent
      }).catch((err) => console.warn('Background email dispatch warning:', err));

      setIsSuccess(true);
      toast?.success(
        isHi
          ? '🎉 पंजीकरण सफल! Bihar AI Mission में आपका स्वागत है।'
          : '🎉 Registration Successful! Welcome to Bihar AI Mission.'
      );
    } catch (err) {
      console.error('Registration exception:', err);
      toast?.error(isHi ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      full_name: '', email: '', mobile: '', password: '', confirm_password: '', gender: '', age: '', role_type: '',
      designation: '', department: '', organization: '', experience: '', experience_unit: 'Years',
      state: 'Bihar', district: '', block_city: '',
      interests: [], custom_interest: '', intent: 'General Inquiry', contribution: '', linkedin: '', portfolio: ''
    });
    setStep(1);
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  /* ─── SUCCESS STATE ─── */
  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={handleBackdropClick} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
        <div className={styles.modal} ref={modalRef} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div className={styles.successState}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>
              {isHi ? 'पंजीकरण सफल!' : 'Registration Successful!'}
            </h2>
            <p className={styles.successDesc}>
              {isHi
                ? 'बिहार AI मिशन में आपका खाता और प्रोफ़ाइल सफलतापूर्वक बन गया है। अब आप सीधे अपने ईमेल और पासवर्ड से साइन इन कर सकते हैं।'
                : 'Your account and profile have been successfully created with Bihar AI Mission. You can now sign in directly using your email and password to access your dashboard.'}
            </p>
            <div className={styles.successActions}>
              <button className={styles.primaryBtn} onClick={onClose} style={{ minWidth: '160px' }}>
                {isHi ? 'ठीक है, बंद करें' : 'Okay, Close'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={handleBackdropClick} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
      <div className={styles.modal} ref={modalRef} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* MODAL HEADER */}
        <div className={styles.header}>
          <div className={styles.headerBadge}>
            <span className={styles.badgeDot}></span>
            <span>{isHi ? 'बिहार AI मिशन · पंजीकरण फ़ॉर्म' : 'BIHAR AI MISSION · REGISTRATION'}</span>
          </div>
          <h2 className={styles.headerTitle}>
            {isHi ? 'अपना पंजीकरण करें' : 'Register With Us'}
          </h2>
          <p className={styles.headerSub}>
            {isHi
              ? 'नीचे अपनी सभी अनिवार्य जानकारी भरें और पासवर्ड बनाएं। (* अनिवार्य फ़ील्ड)'
              : 'Fill in your required details and create your login password below. (* Required fields)'}
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className={styles.stepBar}>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''} ${step === s ? styles.stepCurrent : ''}`}>
              <span className={styles.stepNum}>{s}</span>
              <span className={styles.stepLabel}>
                {s === 1
                  ? isHi ? 'मूल जानकारी' : 'Basic Info'
                  : s === 2
                  ? isHi ? 'पेशेवर विवरण' : 'Professional'
                  : isHi ? 'रुचि और लक्ष्य' : 'Interests'}
              </span>
            </div>
          ))}
          <div className={styles.stepLine}>
            <div className={styles.stepLineFill} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
        </div>

        {/* ═══ STEP 1: BASIC INFO & PASSWORD ═══ */}
        {step === 1 && (
          <div className={styles.formBody} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{isHi ? 'पूरा नाम' : 'Full Name'} <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                type="text"
                placeholder={isHi ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'ईमेल' : 'Email Address'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="email"
                  placeholder={isHi ? 'example@email.com' : 'your@email.com'}
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'मोबाइल नंबर' : 'Mobile Number'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="tel"
                  placeholder={isHi ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                  value={form.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
              </div>
            </div>

            {/* PASSWORD CREATION FIELDS */}
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'पासवर्ड बनाएं' : 'Create Password'} <span className={styles.req}>*</span>
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    className={`${styles.input} ${styles.passwordInput} ${
                      form.password && form.password.length >= 8 && /[a-zA-Z]/.test(form.password) && /[\d\W]/.test(form.password)
                        ? styles.inputStrong
                        : ''
                    }`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isHi ? 'मजबूत पासवर्ड बनाएं' : 'Create strong password'}
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} <span className={styles.req}>*</span>
                </label>
                <input
                  className={`${styles.input} ${
                    form.confirm_password &&
                    form.confirm_password === form.password &&
                    form.password.length >= 6
                      ? styles.inputMatch
                      : ''
                  }`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isHi ? 'वही पासवर्ड पुनः दर्ज करें' : 'Re-enter password'}
                  value={form.confirm_password}
                  onChange={(e) => handleChange('confirm_password', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'लिंग' : 'Gender'} <span className={styles.req}>*</span></label>
                <select className={styles.select} value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                  <option value="">{isHi ? '— चुनें —' : '— Select —'}</option>
                  <option value="Male">{isHi ? 'पुरुष' : 'Male'}</option>
                  <option value="Female">{isHi ? 'महिला' : 'Female'}</option>
                  <option value="Other">{isHi ? 'अन्य' : 'Other'}</option>
                  <option value="Prefer not to say">{isHi ? 'बताना नहीं चाहते' : 'Prefer not to say'}</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'आयु' : 'Age'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="e.g. 28"
                  value={form.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  min={10}
                  max={100}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'भूमिका / प्रकार' : 'Role Type'} <span className={styles.req}>*</span></label>
                <select className={styles.select} value={form.role_type} onChange={(e) => handleChange('role_type', e.target.value)}>
                  <option value="">{isHi ? '— चुनें —' : '— Select —'}</option>
                  {ROLE_TYPES.map((r) => (
                    <option key={r.value} value={r.value}>{isHi ? r.labelHi : r.labelEn}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: PROFESSIONAL ═══ */}
        {step === 2 && (
          <div className={styles.formBody} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'पदनाम' : 'Designation / Title'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: जिलाधिकारी, इंजीनियर' : 'e.g. District Magistrate, Engineer'}
                  value={form.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'विभाग' : 'Department'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: IT विभाग, शिक्षा विभाग' : 'e.g. IT Department, Education'}
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'संस्था / संगठन' : 'Organization'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: बिहार सरकार, IIT Patna' : 'e.g. Govt of Bihar, IIT Patna'}
                  value={form.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'अनुभव' : 'Experience'} <span className={styles.req}>*</span>
                </label>
                <div className={styles.experienceGroup}>
                  <input
                    className={styles.input}
                    type="number"
                    placeholder={form.experience_unit === 'Months' ? (isHi ? 'जैसे: 6' : 'e.g. 6') : (isHi ? 'जैसे: 3' : 'e.g. 3')}
                    value={form.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                    min={0}
                    max={form.experience_unit === 'Months' ? 120 : 50}
                  />
                  <select
                    className={styles.select}
                    value={form.experience_unit || 'Years'}
                    onChange={(e) => handleChange('experience_unit', e.target.value)}
                  >
                    <option value="Years">{isHi ? 'वर्ष (Years)' : 'Years'}</option>
                    <option value="Months">{isHi ? 'महीने (Months)' : 'Months'}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.row3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'राज्य' : 'State'} <span className={styles.req}>*</span></label>
                <select
                  className={styles.select}
                  value={form.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      state: newState,
                      district: newState.toLowerCase() === 'bihar' ? '' : prev.district
                    }));
                  }}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'जिला' : 'District'} <span className={styles.req}>*</span>
                  {(form.state || '').trim().toLowerCase() !== 'bihar' && (
                    <span style={{ fontSize: '10.5px', color: '#C1552C', marginLeft: '4px', fontWeight: 600 }}>
                      ({isHi ? 'मैन्युअल' : 'Manual'})
                    </span>
                  )}
                </label>
                {(form.state || '').trim().toLowerCase() === 'bihar' ? (
                  <select
                    className={styles.select}
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  >
                    <option value="">{isHi ? '— जिला चुनें —' : '— Select District —'}</option>
                    {BIHAR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={styles.input}
                    type="text"
                    placeholder={isHi ? 'अपना जिला दर्ज करें' : 'Enter your District / City'}
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  />
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'प्रखंड (Block)' : 'Block'} <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: पटना सदर, दानापुर' : 'e.g. Patna Sadar, Danapur'}
                  value={form.block_city}
                  onChange={(e) => handleChange('block_city', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: INTERESTS & GOAL ═══ */}
        {step === 3 && (
          <div className={styles.formBody} data-lenis-prevent="true" onWheel={(e) => e.stopPropagation()}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                {isHi ? 'आपकी मुख्य रुचि / उद्देश्य (केवल 1 चुनें)' : 'Primary Focus & Purpose (Select 1)'} <span className={styles.req}>*</span>
              </label>
              <div className={styles.chipGrid}>
                {INTEREST_OPTIONS.map((opt) => {
                  const isSelected = form.interests && form.interests[0] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.interestChip} ${isSelected ? styles.chipSelected : ''}`}
                      onClick={() => selectInterest(opt.value)}
                    >
                      {isSelected ? '✓ ' : ''}{isHi ? opt.labelHi : opt.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual custom interest write-in field */}
            {form.interests && form.interests[0] === 'other' && (
              <div className={styles.fieldGroup} style={{ marginTop: '12px' }}>
                <label className={styles.label}>
                  {isHi ? 'अपनी रुचि / उद्देश्य यहाँ लिखें' : 'Specify Your Interest / Purpose Manually'} <span className={styles.req}>*</span>
                </label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: AI रोबोटिक्स, मशीन लर्निंग रिसर्च, आदि...' : 'e.g. AI Robotics, Machine Learning Research, etc.'}
                  value={form.custom_interest || ''}
                  onChange={(e) => handleChange('custom_interest', e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className={styles.fieldGroup} style={{ marginTop: '14px' }}>
              <label className={styles.label}>{isHi ? 'आप कैसे योगदान कर सकते हैं? (वैकल्पिक)' : 'How can you contribute? (Optional)'}</label>
              <textarea
                className={styles.textarea}
                placeholder={isHi ? 'जैसे: मैं AI वर्कशॉप आयोजित कर सकता/सकती हूँ...' : 'e.g. I can organize AI workshops in my district...'}
                value={form.contribution}
                onChange={(e) => handleChange('contribution', e.target.value)}
                rows={2}
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>LinkedIn</label>
                <input
                  className={styles.input}
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={form.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'पोर्टफोलियो / वेबसाइट' : 'Portfolio / Website'}</label>
                <input
                  className={styles.input}
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={form.portfolio}
                  onChange={(e) => handleChange('portfolio', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══ FORM NAVIGATION FOOTER ═══ */}
        <div className={styles.footer}>
          {step > 1 && (
            <button className={styles.backBtn} type="button" onClick={handlePrev}>
              ← {isHi ? 'पीछे' : 'Back'}
            </button>
          )}
          <div className={styles.footerRight}>
            <span className={styles.stepIndicatorText}>
              {isHi ? `चरण ${step} / 3` : `Step ${step} of 3`}
            </span>
            {step < 3 ? (
              <button className={styles.primaryBtn} type="button" onClick={handleNext}>
                {isHi ? 'अगला →' : 'Next →'}
              </button>
            ) : (
              <button
                className={`${styles.submitBtn} ${isSubmitting ? styles.submitting : ''}`}
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? isHi ? 'पंजीकरण हो रहा है...' : 'Submitting...'
                  : isHi ? '✓ पंजीकरण करें' : '✓ Submit Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
