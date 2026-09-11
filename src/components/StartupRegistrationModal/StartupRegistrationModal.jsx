import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import {
  sendStartupApplicationEmailViaResend,
  sendStartupThankYouEmailViaResend,
} from '../../utils/resendEmail';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './StartupRegistrationModal.module.css';

export default function StartupRegistrationModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  // Form State
  const [formData, setFormData] = useState({
    startupName: '',
    shortDescription: '',
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyWebsite: '',
    founderName: '',
    contactNumber: '',
    founderEmail: '',
    linkedin: '',
    portfolio: '',
    sector: '',
    stage: '',
    supportNeeded: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      startupName: '',
      shortDescription: '',
      companyName: '',
      companyEmail: '',
      companyAddress: '',
      companyWebsite: '',
      founderName: '',
      contactNumber: '',
      founderEmail: '',
      linkedin: '',
      portfolio: '',
      sector: '',
      stage: '',
      supportNeeded: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required Field Validations
    if (!formData.companyName.trim()) {
      toast.warning(isHi ? 'कृपया कंपनी का नाम दर्ज करें।' : 'Please enter your registered company name.');
      return;
    }
    if (!formData.companyEmail.trim() || !formData.companyEmail.includes('@')) {
      toast.warning(isHi ? 'कृपया एक वैध कंपनी ईमेल पता दर्ज करें।' : 'Please enter a valid company email address.');
      return;
    }
    if (!formData.companyAddress.trim()) {
      toast.warning(isHi ? 'कृपया कंपनी का पता दर्ज करें।' : 'Please enter your company address.');
      return;
    }
    if (!formData.companyWebsite.trim()) {
      toast.warning(isHi ? 'कृपया कंपनी की वेबसाइट URL दर्ज करें।' : 'Please enter your company website URL.');
      return;
    }
    if (!formData.founderName.trim()) {
      toast.warning(isHi ? 'कृपया संस्थापक (Founder) का नाम दर्ज करें।' : 'Please enter the lead founder name.');
      return;
    }
    if (!formData.contactNumber.trim()) {
      toast.warning(isHi ? 'कृपया संपर्क / WhatsApp नंबर दर्ज करें।' : 'Please enter a valid contact phone / WhatsApp number.');
      return;
    }
    if (!formData.founderEmail.trim() || !formData.founderEmail.includes('@')) {
      toast.warning(isHi ? 'कृपया संस्थापक का ईमेल पता दर्ज करें।' : 'Please enter a valid founder email address.');
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      startupName: formData.startupName.trim(),
      shortDescription: formData.shortDescription.trim(),
      companyName: formData.companyName.trim(),
      companyEmail: formData.companyEmail.trim().toLowerCase(),
      companyAddress: formData.companyAddress.trim(),
      companyWebsite: formData.companyWebsite.trim(),
      founderName: formData.founderName.trim(),
      contactNumber: formData.contactNumber.trim(),
      founderEmail: formData.founderEmail.trim().toLowerCase(),
      linkedin: formData.linkedin.trim(),
      portfolio: formData.portfolio.trim(),
      sector: formData.sector,
      stage: formData.stage,
      supportNeeded: formData.supportNeeded,
    };

    try {
      // 1. Send Complete Application to vittologyconsultants@gmail.com
      const adminResult = await sendStartupApplicationEmailViaResend(submissionData);

      if (!adminResult || !adminResult.success) {
        toast.error(
          isHi
            ? 'आवेदन जमा करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : (adminResult?.reason || 'Failed to submit application. Please try again.')
        );
        setIsSubmitting(false);
        return;
      }

      // 2. Also send confirmation Thank-You email to Founder's email
      try {
        await sendStartupThankYouEmailViaResend({
          startupName: submissionData.startupName,
          companyName: submissionData.companyName,
          founderName: submissionData.founderName,
          founderEmail: submissionData.founderEmail,
          companyWebsite: submissionData.companyWebsite,
          sector: submissionData.sector,
          stage: submissionData.stage,
        });
      } catch (founderMailErr) {
        console.warn('Founder confirmation email dispatch notice:', founderMailErr);
      }

      setIsSubmitting(false);
      toast.success(
        isHi
          ? 'बधाई! आपका स्टार्टअप आवेदन सफलतापूर्वक प्राप्त हो गया है। विवरण आपकी ईमेल पर भी भेज दिया गया है। 🚀'
          : 'Congratulations! Your startup application has been submitted successfully. A confirmation email has been sent to your founder email! 🚀'
      );

      resetForm();
      onClose();
    } catch (err) {
      console.error('Startup application error:', err);
      toast.error(
        isHi
          ? 'आवेदन भेजने में समस्या आई। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
          : 'An unexpected error occurred while sending your application. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div
        className={styles.modalContainer}
        data-lenis-prevent="true"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.headerRow}>
          <div className={styles.iconBadge}>🚀</div>
          <div className={styles.headerText}>
            <div className={styles.eyebrow}>
              {isHi ? 'बिहार AI मिशन · स्टार्टअप नवाचार हब' : 'BIHAR AI MISSION · STARTUP INCUBATION'}
            </div>
            <h2 className={styles.title}>
              {isHi ? 'अपने AI स्टार्टअप का पंजीकरण करें' : 'Register Your AI Startup'}
            </h2>
            <p className={styles.subtitle}>
              {isHi
                ? '₹10 लाख ब्याज-मुक्त सीड ग्रांट, IIT पटना लैब्स एवं सरकारी AI पायलट प्रोजेक्ट्स के लिए सीधे आवेदन करें।'
                : 'Apply directly for ₹10 Lakh State Seed Capital, IC-IIT Patna & STPI compute incubation, and live government AI pilots.'}
            </p>
          </div>
        </div>

        {/* Notice Strip */}
        <div className={styles.noticeBox}>
          <span className={styles.noticeIcon}>ℹ️</span>
          <div>
            {isHi
              ? 'यह आवेदन सीधे बिहार AI मिशन की इन्क्यूबेशन समीक्षा समिति को भेजा जाएगा और एक पावती प्रति आपकी संस्थापक ईमेल पर प्राप्त होगी।'
              : 'This application is dispatched directly to our Incubation & Grants evaluation desk, and an official confirmation will be sent to your founder email.'}
          </div>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className={styles.form}
          autoComplete="off"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* SECTION 1: STARTUP & COMPANY DETAILS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🏢</span>
              <span>{isHi ? 'कंपनी एवं स्टार्टअप विवरण' : 'Startup & Company Details'}</span>
            </div>

            <div className={styles.grid2}>
              {/* Startup Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'स्टार्टअप का नाम' : 'Name of Startup'}
                  <span className={styles.optionalTag}>{isHi ? '(वैकल्पिक)' : '(Brand)'}</span>
                </label>
                <input
                  type="text"
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleChange}
                  placeholder={isHi ? 'उदा. TruVoice AI' : 'e.g. TruVoice AI'}
                  className={styles.input}
                />
              </div>

              {/* Company Legal Name* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'कंपनी का पंजीकृत नाम' : 'Company Name'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder={isHi ? 'उदा. TruVoice Technologies Pvt Ltd' : 'e.g. TruVoice Technologies Pvt Ltd'}
                  required
                  className={styles.input}
                />
              </div>

              {/* Company Email* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'कंपनी ईमेल' : 'Company Email'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  required
                  className={styles.input}
                />
              </div>

              {/* Company Website* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'कंपनी वेबसाइट' : 'Company Website'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  placeholder="https://yourstartup.com"
                  required
                  className={styles.input}
                />
              </div>

              {/* Company Address* */}
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>
                  {isHi ? 'कंपनी का पंजीकृत पता' : 'Company Address'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  placeholder={isHi ? 'उदा. इन्क्यूबेशन सेंटर, IIT पटना, बिहटा, बिहार - 801106' : 'e.g. Incubation Centre, IIT Patna, Bihta, Bihar - 801106'}
                  required
                  className={styles.input}
                />
              </div>

              {/* Short Description */}
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>
                  {isHi ? 'स्टार्टअप का संक्षिप्त विवरण' : 'Short Description / Pitch'}
                  <span className={styles.optionalTag}>{isHi ? '(क्या समाधान बनाते हैं)' : '(What you build)'}</span>
                </label>
                <textarea
                  name="shortDescription"
                  rows={3}
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder={
                    isHi
                      ? 'अपनी AI तकनीक, उत्पाद और मुख्य समस्या का संक्षिप्त विवरण दें...'
                      : 'Briefly describe your AI solution, target customers, and core technology...'
                  }
                  className={styles.textarea}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: FOUNDER & CONTACT DETAILS */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>👤</span>
              <span>{isHi ? 'संस्थापक एवं संपर्क विवरण' : 'Founder & Contact Details'}</span>
            </div>

            <div className={styles.grid2}>
              {/* Founder Name* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'संस्थापक का नाम' : 'Founder Name'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  placeholder={isHi ? 'पूरा नाम दर्ज करें' : 'Lead Founder Full Name'}
                  required
                  className={styles.input}
                />
              </div>

              {/* Contact Number* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'संपर्क नंबर / WhatsApp' : 'Contact Number'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className={styles.input}
                />
              </div>

              {/* Founder Email* */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'संस्थापक ईमेल' : 'Founder Email'}
                  <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  type="email"
                  name="founderEmail"
                  value={formData.founderEmail}
                  onChange={handleChange}
                  placeholder="founder@email.com"
                  required
                  className={styles.input}
                />
              </div>

              {/* LinkedIn */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  LinkedIn
                  <span className={styles.optionalTag}>{isHi ? '(वैकल्पिक)' : '(Optional)'}</span>
                </label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className={styles.input}
                />
              </div>

              {/* Portfolio / Pitch Deck */}
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>
                  {isHi ? 'पोर्टफोलियो / पिच डेक लिंक' : 'Portfolio / Pitch Deck URL'}
                  <span className={styles.optionalTag}>{isHi ? '(गूगल ड्राइव, नोशन या वेबसाइट)' : '(Drive, Notion, or Demo)'}</span>
                </label>
                <input
                  type="text"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/... or https://portfolio.site"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: SECTOR & SUPPORT (OPTIONAL ENRICHMENT) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🎯</span>
              <span>{isHi ? 'क्षेत्र व विकास चरण' : 'Sector, Stage & Support'}</span>
            </div>

            <div className={styles.grid2}>
              {/* Sector */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'उद्योग / क्षेत्र' : 'Domain / Sector'}
                </label>
                <select
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">{isHi ? '-- क्षेत्र चुनें --' : '-- Select Domain --'}</option>
                  <option value="AgriTech AI">🌾 AgriTech AI & Smart Farming</option>
                  <option value="HealthTech AI">🏥 HealthTech & Diagnostics</option>
                  <option value="Speech & Indic NLP">🎙️ Speech & Indic Voice AI</option>
                  <option value="Robotics & Computer Vision">🤖 Robotics & Edge Vision</option>
                  <option value="GovTech & Civic AI">🏛️ GovTech & Public Administration</option>
                  <option value="EdTech & Skill AI">🎓 EdTech & AI Skilling</option>
                  <option value="Enterprise GenAI / LLM">⚡ Enterprise GenAI & Automations</option>
                  <option value="FinTech & Cyber AI">💳 FinTech & Fraud Prevention</option>
                  <option value="Other DeepTech">🚀 Other DeepTech / Hardware</option>
                </select>
              </div>

              {/* Stage */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {isHi ? 'वर्तमान चरण' : 'Current Stage'}
                </label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">{isHi ? '-- चरण चुनें --' : '-- Select Stage --'}</option>
                  <option value="Idea / Concept">{isHi ? 'विचार / अवधारणा (Idea)' : 'Idea / Concept'}</option>
                  <option value="Prototype / MVP">{isHi ? 'प्रोटोटाइप / MVP तैयार' : 'Prototype / MVP Built'}</option>
                  <option value="Early Traction / Pilot">{isHi ? 'शुरुआती पायलट / यूज़र्स' : 'Early Traction / Pilot'}</option>
                  <option value="Revenue Generating">{isHi ? 'राजस्व उत्पादन (Revenue)' : 'Revenue Generating'}</option>
                  <option value="Scaling / Funded">{isHi ? 'स्केलिंग / वित्तपोषित' : 'Scaling / Funded'}</option>
                </select>
              </div>

              {/* Support Needed */}
              <div className={styles.fieldGroupFull}>
                <label className={styles.label}>
                  {isHi ? 'अपेक्षित सरकारी / मिशन सहायता' : 'Primary Support Requested'}
                </label>
                <select
                  name="supportNeeded"
                  value={formData.supportNeeded}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">{isHi ? '-- सहायता प्रकार चुनें --' : '-- Select Primary Support --'}</option>
                  <option value="Startup Bihar ₹10L Seed Grant">{isHi ? '₹10 लाख स्टार्टअप बिहार ब्याज-मुक्त सीड ग्रांट' : '₹10 Lakh Startup Bihar Seed Capital (0% Interest)'}</option>
                  <option value="IIT Patna / STPI Incubation & Labs">{isHi ? 'IIT पटना / STPI इन्क्यूबेशन एवं लैब सुविधाएं' : 'IIT Patna / STPI Incubation & Testing Labs'}</option>
                  <option value="National AI GPU Compute Access">{isHi ? 'IndiaAI 10,000+ GPU क्लस्टर एवं कंप्यूट क्रेडिट्स' : 'IndiaAI GPU Cluster & High-Performance Compute'}</option>
                  <option value="Government Department Pilots">{isHi ? 'राज्य प्रशासनिक विभागों में लाइव पायलट प्रोजेक्ट्स' : 'Government Department Pilot Opportunities'}</option>
                  <option value="VC / Angel Mentorship & Funding">{isHi ? 'वेंचर कैपिटल व एंजल मेंटरशिप नेटवर्क' : 'VC & Angel Investor Networking'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className={styles.submitWrapper}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isHi ? 'आवेदन भेजा जा रहा है...' : 'Submitting Application...')
                : (isHi ? '🚀 स्टार्टअप आवेदन जमा करें' : '🚀 Submit Startup Application')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
