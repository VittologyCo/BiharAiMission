import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
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

/* ─── Interest Areas ─── */
const INTEREST_AREAS = [
  { value: 'ai_basics', label: 'AI Fundamentals & Basics' },
  { value: 'prompt_engineering', label: 'Prompt Engineering' },
  { value: 'data_analytics', label: 'Data Analytics & Visualization' },
  { value: 'ai_governance', label: 'AI in Governance & Public Policy' },
  { value: 'ai_agriculture', label: 'AI in Agriculture' },
  { value: 'ai_healthcare', label: 'AI in Healthcare' },
  { value: 'ai_education', label: 'AI in Education' },
  { value: 'coding_dev', label: 'Coding & Software Development' },
  { value: 'ai_content', label: 'AI Content Creation & Marketing' },
  { value: 'ai_startups', label: 'AI for Startups & Business' },
  { value: 'cybersecurity', label: 'Cybersecurity & Digital Safety' },
  { value: 'machine_learning', label: 'Machine Learning & Deep Learning' }
];

/* ─── Intent Options ─── */
const INTENT_OPTIONS = [
  { value: 'General Inquiry', labelEn: 'General Inquiry / Exploration', labelHi: 'सामान्य जानकारी / अन्वेषण' },
  { value: 'Learn AI Skills', labelEn: 'Learn AI Skills & Get Certified', labelHi: 'AI कौशल सीखें और प्रमाणपत्र प्राप्त करें' },
  { value: 'Government Training', labelEn: 'Government Officer Training Program', labelHi: 'सरकारी अधिकारी प्रशिक्षण कार्यक्रम' },
  { value: 'Collaborate', labelEn: 'Collaborate / Contribute to Mission', labelHi: 'मिशन में सहयोग / योगदान' },
  { value: 'Startup Support', labelEn: 'Startup Mentorship & Support', labelHi: 'स्टार्टअप मेंटरशिप और सहायता' },
  { value: 'Research Partnership', labelEn: 'Research Partnership', labelHi: 'शोध साझेदारी' }
];

export default function RegistrationModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';
  const modalRef = useRef(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    mobile: '',
    gender: '',
    age: '',
    role_type: '',
    designation: '',
    department: '',
    organization: '',
    experience: '',
    state: 'Bihar',
    district: '',
    block_city: '',
    interests: [],
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
  const isStep1Valid = () => form.full_name.trim() && form.email.trim() && form.mobile.trim() && form.role_type;
  const isStep2Valid = () => true; // All optional
  const isStep3Valid = () => true; // All optional

  const handleNext = () => {
    if (step === 1 && !isStep1Valid()) {
      toast?.warning(isHi ? 'कृपया सभी अनिवार्य (*) फ़ील्ड भरें।' : 'Please fill all required (*) fields.');
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  /* ─── Submit to Supabase ─── */
  const handleSubmit = async () => {
    if (!isStep1Valid()) {
      toast?.warning(isHi ? 'कृपया सभी अनिवार्य (*) फ़ील्ड भरें।' : 'Please fill all required (*) fields.');
      setStep(1);
      return;
    }
    setIsSubmitting(true);
    try {
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
        experience: form.experience ? parseInt(form.experience, 10) : null,
        state: form.state || 'Bihar',
        district: form.district || 'Not Specified',
        block_city: form.block_city.trim() || null,
        interests: form.interests.length > 0 ? form.interests : null,
        intent: form.intent || 'General Inquiry',
        contribution: form.contribution.trim() || null,
        linkedin: form.linkedin.trim() || null,
        portfolio: form.portfolio.trim() || null
      };

      const { error } = await supabase.from('user_details').insert([payload]);
      if (error) {
        console.error('Supabase insert error:', error);
        if (error.code === '23505') {
          toast?.warning(isHi ? 'यह ईमेल या मोबाइल पहले से पंजीकृत है।' : 'This email or mobile is already registered.');
        } else {
          toast?.error(isHi ? 'पंजीकरण विफल हुआ। कृपया बाद में पुनः प्रयास करें।' : 'Registration failed. Please try again later.');
        }
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      toast?.success(isHi ? '🎉 पंजीकरण सफल! बिहार AI मिशन में आपका स्वागत है।' : '🎉 Registration Successful! Welcome to Bihar AI Mission.');
    } catch (err) {
      console.error('Registration exception:', err);
      toast?.error(isHi ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।' : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      full_name: '', email: '', mobile: '', gender: '', age: '', role_type: '',
      designation: '', department: '', organization: '', experience: '',
      state: 'Bihar', district: '', block_city: '',
      interests: [], intent: 'General Inquiry', contribution: '', linkedin: '', portfolio: ''
    });
    setStep(1);
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  /* ─── SUCCESS STATE ─── */
  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={handleBackdropClick}>
        <div className={styles.modal} ref={modalRef}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div className={styles.successState}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>
              {isHi ? 'पंजीकरण सफल!' : 'Registration Successful!'}
            </h2>
            <p className={styles.successDesc}>
              {isHi
                ? 'बिहार AI मिशन में आपका पंजीकरण सफलतापूर्वक हो गया है। हम आपसे जल्द ही संपर्क करेंगे।'
                : 'You have been successfully registered with Bihar AI Mission. We will reach out to you soon with updates and opportunities.'}
            </p>
            <div className={styles.successActions}>
              <button className={styles.primaryBtn} onClick={onClose}>
                {isHi ? 'ठीक है, बंद करें' : 'Okay, Close'}
              </button>
              <button className={styles.ghostBtn} onClick={handleReset}>
                {isHi ? 'एक और पंजीकरण करें' : 'Register Another Person'}
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
              ? 'नीचे अपनी जानकारी भरें और बिहार AI मिशन से जुड़ें। (* अनिवार्य फ़ील्ड)'
              : 'Fill in your details below to join Bihar AI Mission. (* Required fields)'}
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

        {/* ═══ STEP 1: BASIC INFO ═══ */}
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

            <div className={styles.row3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'लिंग' : 'Gender'}</label>
                <select className={styles.select} value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                  <option value="">{isHi ? '— चुनें —' : '— Select —'}</option>
                  <option value="Male">{isHi ? 'पुरुष' : 'Male'}</option>
                  <option value="Female">{isHi ? 'महिला' : 'Female'}</option>
                  <option value="Other">{isHi ? 'अन्य' : 'Other'}</option>
                  <option value="Prefer not to say">{isHi ? 'बताना नहीं चाहते' : 'Prefer not to say'}</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'आयु' : 'Age'}</label>
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
                <label className={styles.label}>{isHi ? 'पदनाम' : 'Designation / Title'}</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: जिलाधिकारी, इंजीनियर' : 'e.g. District Magistrate, Engineer'}
                  value={form.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'विभाग' : 'Department'}</label>
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
                <label className={styles.label}>{isHi ? 'संस्था / संगठन' : 'Organization'}</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={isHi ? 'जैसे: बिहार सरकार, IIT Patna' : 'e.g. Govt of Bihar, IIT Patna'}
                  value={form.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'अनुभव (वर्ष)' : 'Experience (Years)'}</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="e.g. 5"
                  value={form.experience}
                  onChange={(e) => handleChange('experience', e.target.value)}
                  min={0}
                  max={50}
                />
              </div>
            </div>

            <div className={styles.row3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{isHi ? 'राज्य' : 'State'}</label>
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
                  {isHi ? 'जिला' : 'District'}
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
                <label className={styles.label}>{isHi ? 'ब्लॉक / शहर' : 'Block / City'}</label>
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
                {isHi ? 'आपकी मुख्य रुचि (केवल 1 चुनें)' : 'Your Primary Interest (Select 1)'}
              </label>
              <div className={styles.chipGrid}>
                {INTEREST_AREAS.map((ia) => {
                  const isSelected = form.interests && form.interests[0] === ia.value;
                  return (
                    <button
                      key={ia.value}
                      type="button"
                      className={`${styles.interestChip} ${isSelected ? styles.chipSelected : ''}`}
                      onClick={() => selectInterest(ia.value)}
                    >
                      {isSelected ? '✓ ' : ''}{ia.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>{isHi ? 'आपका उद्देश्य / Intent' : 'Your Intent / Purpose'}</label>
              <select className={styles.select} value={form.intent} onChange={(e) => handleChange('intent', e.target.value)}>
                {INTENT_OPTIONS.map((io) => (
                  <option key={io.value} value={io.value}>{isHi ? io.labelHi : io.labelEn}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>{isHi ? 'आप कैसे योगदान कर सकते हैं?' : 'How can you contribute?'}</label>
              <textarea
                className={styles.textarea}
                placeholder={isHi ? 'जैसे: मैं AI वर्कशॉप आयोजित कर सकता/सकती हूँ...' : 'e.g. I can organize AI workshops in my district...'}
                value={form.contribution}
                onChange={(e) => handleChange('contribution', e.target.value)}
                rows={3}
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
