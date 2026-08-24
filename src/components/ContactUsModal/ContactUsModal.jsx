import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../utils/supabase';
import { sendContactEmailViaResend } from '../../utils/resendEmail';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';

export default function ContactUsModal({ isOpen, onClose }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning(isHi ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.warning(isHi ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }
    if (!description.trim()) {
      toast.warning(isHi ? 'कृपया अपना संदेश या विवरण दर्ज करें।' : 'Please enter your message or inquiry description.');
      return;
    }

    setIsSubmitting(true);

    const submissionData = {
      id: 'contact_' + Date.now(),
      full_name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: 'N/A',
      role_type: 'Contact Inquiry',
      district: 'Bihar',
      interests: [description.trim()],
      created_at: new Date().toISOString(),
    };

    // 1. Upsert to Supabase user_details table (handles duplicate emails gracefully)
    try {
      if (supabase) {
        const payload = {
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: 'N/A',
          role_type: 'Contact Inquiry',
          district: 'Bihar', // Required default — prevents NOT NULL constraint errors
          intent: 'Website Contact Inquiry',
          contribution: description.trim(),
          interests: [description.trim()],
        };
        const { error: upsertErr } = await supabase
          .from('user_details')
          .upsert([payload], { onConflict: 'email', ignoreDuplicates: false });
        if (upsertErr && upsertErr.code !== '23505') {
          // Only surface non-duplicate errors to user
          console.error('user_details contact upsert error:', upsertErr);
          toast.error(isHi
            ? 'संदेश डेटाबेस में सहेजने में विफल। कृपया पुनः प्रयास करें।'
            : 'Failed to save message to database. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err) {
      console.error('Supabase contact upsert exception:', err);
      // Non-fatal: proceed with email sending even if DB write fails
    }

    // 2. Save to local storage cache
    try {
      const existing = JSON.parse(localStorage.getItem('bihar_ai_submissions') || '[]');
      localStorage.setItem('bihar_ai_submissions', JSON.stringify([submissionData, ...existing]));
    } catch (err) {
      console.warn('Local storage save error:', err);
    }

    // 3. Send email via Resend API directly to contact@biharaimission.org
    try {
      await sendContactEmailViaResend({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        description: description.trim(),
      });
    } catch (err) {
      console.warn('Resend email error:', err);
    }

    setIsSubmitting(false);
    toast.success(isHi ? 'आपका संदेश contact@biharaimission.org पर सफलतापूर्वक भेज दिया गया है! ✨' : 'Thank you! Your message has been sent to contact@biharaimission.org successfully. ✨');

    // Reset and Close
    setName('');
    setEmail('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Modal Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(193, 85, 44, 0.1)',
            border: '1px solid var(--color-line, var(--color-line, #E2D7C3))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}
        >
          📩
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-terracotta-500, #C1552C)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isHi ? 'बिहार AI मिशन सहायता केंद्र' : 'BIHAR AI MISSION SUPPORT'}
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--color-ink, var(--color-charcoal-900, #181512))', margin: 0 }}>
            {isHi ? 'हमारी टीम से संपर्क करें' : 'Contact Our Team'}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '14px', color: 'var(--color-ink-muted, var(--color-ink-muted, #5E554D))', marginBottom: '24px', lineHeight: '1.55' }}>
        {isHi
          ? 'आपके पास कोई प्रश्न, प्रतिक्रिया या प्रशासनिक पूछताछ है? हमें अपना संदेश भेजें और हमारी टीम आपसे शीघ्र ही संपर्क करेगी।'
          : 'Have a question, feedback, or administrative inquiry? Fill out your details below and our Bihar AI Mission team will reach out to you.'}
      </p>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Field 1: Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: 'var(--color-ink, var(--color-charcoal-900, #181512))', marginBottom: '6px' }}>
            👤 {isHi ? 'पूरा नाम' : 'Full Name'} <span style={{ color: 'var(--color-error, #B3341C)' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isHi ? 'उदा. श्री प्रवीण कुमार' : 'e.g. Shri Praveen Kumar'}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm, 10px)',
              border: '1.5px solid var(--color-line, var(--color-line, #E2D7C3))',
              fontSize: '14.5px',
              fontWeight: '600',
              color: 'var(--color-ink, var(--color-charcoal-900, #181512))',
              background: 'var(--color-sand-100, var(--color-sand-100, #F3ECE0))',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Field 2: Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: 'var(--color-ink, var(--color-charcoal-900, #181512))', marginBottom: '6px' }}>
            📧 {isHi ? 'ईमेल पता' : 'Email Address'} <span style={{ color: 'var(--color-error, #B3341C)' }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isHi ? 'उदा. officer@bihar.gov.in' : 'e.g. officer@bihar.gov.in'}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm, 10px)',
              border: '1.5px solid var(--color-line, var(--color-line, #E2D7C3))',
              fontSize: '14.5px',
              fontWeight: '600',
              color: 'var(--color-ink, var(--color-charcoal-900, #181512))',
              background: 'var(--color-sand-100, var(--color-sand-100, #F3ECE0))',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Field 3: Description / Message */}
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: 'var(--color-ink, var(--color-charcoal-900, #181512))', marginBottom: '6px' }}>
            📝 {isHi ? 'विवरण / संदेश' : 'Description / Message'} <span style={{ color: 'var(--color-error, #B3341C)' }}>*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isHi ? 'यहाँ अपनी पूछताछ या संदेश का विवरण लिखें...' : 'Describe your inquiry, feedback, or administrative question here...'}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm, 10px)',
              border: '1.5px solid var(--color-line, var(--color-line, #E2D7C3))',
              fontSize: '14.5px',
              fontWeight: '600',
              color: 'var(--color-ink, var(--color-charcoal-900, #181512))',
              background: 'var(--color-sand-100, var(--color-sand-100, #F3ECE0))',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? (isHi ? 'भेजा जा रहा है...' : 'Sending Message...') : (isHi ? 'संदेश भेजें 🚀' : 'Send Message 🚀')}
        </Button>
      </form>
    </Modal>
  );
}
