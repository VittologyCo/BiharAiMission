import React, { useState, useEffect } from 'react';
import styles from './GetInvolvedModal.module.css';
import { supabase } from '../../utils/supabase';
import { sendContactEmailViaResend } from '../../utils/resendEmail';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

const districts = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", 
  "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", 
  "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", 
  "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", 
  "Siwan", "Supaul", "Vaishali", "West Champaran"
];

const interestAreas = [
  "AI Learning Programs",
  "Government AI Implementation",
  "Training / Workshops",
  "Startup Collaboration",
  "Volunteering",
  "Research / Policy",
  "Community Outreach"
];

const initialFormState = {
  fullName: '',
  email: '',
  mobile: '',
  gender: '',
  age: '',
  roleType: '',
  designation: '',
  department: '',
  organization: '',
  experience: '',
  state: 'Bihar',
  district: '',
  blockCity: '',
  interests: [],
  intent: '',
  contribution: '',
  linkedin: '',
  portfolio: '',
  consent: false
};

const GetInvolvedModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setIsSubmitting(false);
      setIsSubmitted(false);
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid Indian mobile number (10 digits)';
    }

    if (!formData.roleType) newErrors.roleType = 'Role Type is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.intent.trim()) newErrors.intent = 'Intent is required';
    if (!formData.consent) newErrors.consent = 'You must agree to be contacted';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleInterestChange = (area) => {
    setFormData(prev => {
      const interests = prev.interests.includes(area)
        ? prev.interests.filter(i => i !== area)
        : [...prev.interests, area];
      return { ...prev, interests };
    });
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setSubmitError('');
      
      const record = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        created_at: new Date().toISOString(),
        full_name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        age: formData.age ? parseInt(formData.age) : null,
        role_type: formData.roleType,
        designation: formData.designation,
        department: formData.department,
        organization: formData.organization,
        experience: formData.experience ? parseInt(formData.experience) : null,
        state: formData.state,
        district: formData.district,
        block_city: formData.blockCity,
        interests: formData.interests,
        intent: formData.intent,
        contribution: formData.contribution,
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
      };

      try {
        try {
          const existing = JSON.parse(localStorage.getItem('bihar_ai_submissions') || '[]');
          localStorage.setItem('bihar_ai_submissions', JSON.stringify([record, ...existing]));
        } catch (lsErr) {
          console.warn('LocalStorage save error:', lsErr);
        }

        // Upsert on email — handles both new registrations and returning users
        const dbRecord = {
          full_name: record.full_name,
          email: record.email,
          mobile: record.mobile,
          gender: record.gender,
          age: record.age,
          role_type: record.role_type,
          designation: record.designation,
          department: record.department,
          organization: record.organization,
          experience: record.experience,
          state: record.state || 'Bihar',
          district: record.district || 'Bihar',
          block_city: record.block_city,
          interests: record.interests,
          intent: record.intent,
          contribution: record.contribution,
          linkedin: record.linkedin,
          portfolio: record.portfolio,
        };

        const { error: upsertErr } = await supabase
          .from('user_details')
          .upsert([dbRecord], { onConflict: 'email', ignoreDuplicates: false });

        if (upsertErr) {
          if (upsertErr.code === '23505') {
            // Duplicate — treat as successful update, not an error
            console.info('Existing record updated for:', record.email);
          } else {
            console.error('user_details upsert error:', upsertErr);
            setSubmitError(upsertErr.message || 'Failed to submit application to database.');
            setIsSubmitting(false);
            return;
          }
        }
        
        setIsSubmitted(true);

        try {
          await sendContactEmailViaResend({
            name: formData.fullName,
            email: formData.email,
            description: `Role: ${formData.roleType}\nDistrict: ${formData.district}\nIntent: ${formData.intent}\nInterests: ${formData.interests.join(', ')}`
          });
        } catch (emailErr) {
          console.warn('Notification email trigger info:', emailErr);
        }

      } catch (err) {
        console.error('Submission error:', err);
        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className={styles.successIcon}>✓</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--color-ink)', marginBottom: '8px' }}>Thank you for your interest!</h3>
          <p style={{ color: 'var(--color-ink-muted)', marginBottom: '20px', lineHeight: 1.5 }}>We have received your application. Our team will reach out to you at {formData.email} soon.</p>
          <Button variant="primary" size="md" fullWidth onClick={onClose}>Finish</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Get Involved with Bihar AI" subtitle="Translate the national AI vision into local action for Bihar.">
      <form className={styles.body} onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Personal Details
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name<span className={styles.required}>*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`} placeholder="Enter your full name" />
              {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address<span className={styles.required}>*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="yourname@domain.com" />
              {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Mobile Number<span className={styles.required}>*</span></label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className={`${styles.input} ${errors.mobile ? styles.inputError : ''}`} placeholder="+91" />
              {errors.mobile && <span className={styles.errorMsg}>{errors.mobile}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gender (Optional)</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={styles.select}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Age (Optional)</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className={styles.input} placeholder="Enter age" min="10" max="100" />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Professional Details
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Role Type<span className={styles.required}>*</span></label>
              <select name="roleType" value={formData.roleType} onChange={handleChange} className={`${styles.select} ${errors.roleType ? styles.inputError : ''}`}>
                <option value="">Select Role Type</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Student">Student</option>
                <option value="Startup Founder">Startup Founder</option>
                <option value="Developer / Tech Professional">Developer / Tech Professional</option>
                <option value="Citizen">Citizen</option>
                <option value="NGO / Organization">NGO / Organization</option>
              </select>
              {errors.roleType && <span className={styles.errorMsg}>{errors.roleType}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Current Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={styles.input} placeholder="e.g. SDE, Collector, etc." />
            </div>
            {formData.roleType === 'Government Officer' && (
              <div className={styles.field}>
                <label className={styles.label}>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className={styles.input} placeholder="e.g. Agriculture, Health" />
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label}>Organization / College Name</label>
              <input type="text" name="organization" value={formData.organization} onChange={handleChange} className={styles.input} placeholder="Where do you work/study?" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Years of Experience</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} className={styles.input} placeholder="e.g. 5" min="0" />
            </div>
          </div>
        </div>

        {/* Location details */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Location Details
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>State</label>
              <input type="text" value="Bihar" disabled className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>District<span className={styles.required}>*</span></label>
              <select name="district" value={formData.district} onChange={handleChange} className={`${styles.select} ${errors.district ? styles.inputError : ''}`}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.district && <span className={styles.errorMsg}>{errors.district}</span>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Block / City (Optional)</label>
              <input type="text" name="blockCity" value={formData.blockCity} onChange={handleChange} className={styles.input} placeholder="Enter your city/block" />
            </div>
          </div>
        </div>

        {/* Interest Areas */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Interest Areas
          </div>
          <div className={styles.checkboxGrp}>
            {interestAreas.map(area => (
              <label key={area} className={`${styles.checkboxLabel} ${formData.interests.includes(area) ? styles.checked : ''}`}>
                <input type="checkbox" checked={formData.interests.includes(area)} onChange={() => handleInterestChange(area)} className={styles.checkboxInput} />
                {area}
              </label>
            ))}
          </div>
        </div>

        {/* Intent */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            Intent &amp; Contribution
          </div>
          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>Why do you want to get involved?<span className={styles.required}>*</span></label>
              <textarea name="intent" value={formData.intent} onChange={handleChange} className={`${styles.textarea} ${errors.intent ? styles.inputError : ''}`} placeholder="Tell us about your motivation..." />
              {errors.intent && <span className={styles.errorMsg}>{errors.intent}</span>}
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label}>What can you contribute? (Optional)</label>
              <textarea name="contribution" value={formData.contribution} onChange={handleChange} className={styles.textarea} placeholder="e.g. technical expertise, field coordination, research..." />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Optional Links
          </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>LinkedIn Profile</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className={styles.input} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Portfolio / Website</label>
              <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className={styles.input} placeholder="https://..." />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.consentGrp}>
            <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} id="consent-check" className={styles.checkboxInput} />
            <label htmlFor="consent-check" style={{ cursor: 'pointer' }}>I agree to be contacted regarding Bihar AI Mission initiatives<span className={styles.required}>*</span></label>
            {errors.consent && <div className={styles.errorMsg} style={{ position: 'absolute', bottom: '5px', left: '32px' }}>{errors.consent}</div>}
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" size="md" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </form>
      {submitError && (
        <div style={{ padding: '10px 32px', background: 'var(--color-error, #fef0f0)', color: '#FFFFFF', fontSize: '12px', textAlign: 'center', borderRadius: 'var(--radius-sm, 10px)', marginTop: '12px' }}>
          {submitError}
        </div>
      )}
    </Modal>
  );
};

export default GetInvolvedModal;
