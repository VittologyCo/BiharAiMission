import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
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

    try {
      const emailRes = await sendContactEmailViaResend({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        description: description.trim(),
      });

      if (!emailRes || !emailRes.success) {
        toast.error(isHi
          ? 'ईमेल भेजने में समस्या आई। कृपया पुनः प्रयास करें।'
          : (emailRes?.reason || 'Failed to send message. Please try again.'));
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn('Resend email error:', err);
      toast.error(isHi
        ? 'ईमेल भेजने में समस्या आई। कृपया पुनः प्रयास करें।'
        : 'An error occurred while sending your message. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    toast.success(isHi
      ? 'धन्यवाद! आपका संदेश सफलतापूर्वक भेज दिया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी। ✨'
      : 'Thank you! Your message has been sent to our team successfully. We will get back to you shortly. ✨');

    // Reset and Close
    setName('');
    setEmail('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* Modal Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '2px',
            background: '#F3ECE0',
            border: '2px solid #181512',
            boxShadow: '2px 2px 0px #181512',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0,
          }}
        >
          📩
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#C1552C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            {isHi ? 'बिहार AI मिशन सहायता केंद्र' : 'BIHAR AI MISSION SUPPORT'}
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#181512', margin: '0 0 6px 0', lineHeight: '1.25' }}>
            {isHi ? 'हमारी टीम से संपर्क करें' : 'Contact Our Team'}
          </h3>
          <p style={{ fontSize: '13.5px', color: '#5E554D', margin: 0, lineHeight: '1.5' }}>
            {isHi
              ? 'आपके पास कोई प्रश्न, प्रतिक्रिया या प्रशासनिक पूछताछ है? हमें अपना संदेश भेजें।'
              : 'Have a question, feedback, or administrative inquiry? Fill out your details below.'}
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} autoComplete="off">
        {/* Field 1: Full Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#181512', marginBottom: '6px' }}>
            👤 {isHi ? 'पूरा नाम' : 'Full Name'} <span style={{ color: '#B3341C' }}>*</span>
          </label>
          <input
            type="text"
            name="contact_user_name"
            id="contact_user_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isHi ? 'उदा. अपना पूरा नाम दर्ज करें' : 'e.g. Enter your full name'}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            required
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '2px',
              border: '2px solid #181512',
              fontSize: '14px',
              fontWeight: '600',
              color: '#181512',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              minHeight: '44px',
            }}
          />
        </div>

        {/* Field 2: Email Address */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#181512', marginBottom: '6px' }}>
            📧 {isHi ? 'ईमेल पता' : 'Email Address'} <span style={{ color: '#B3341C' }}>*</span>
          </label>
          <input
            type="email"
            name="contact_user_email"
            id="contact_user_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isHi ? 'उदा. your@email.com' : 'e.g. your@email.com'}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            required
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '2px',
              border: '2px solid #181512',
              fontSize: '14px',
              fontWeight: '600',
              color: '#181512',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              minHeight: '44px',
            }}
          />
        </div>

        {/* Field 3: Description / Message */}
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#181512', marginBottom: '6px' }}>
            📝 {isHi ? 'विवरण / संदेश' : 'Description / Message'} <span style={{ color: '#B3341C' }}>*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isHi ? 'यहाँ अपनी पूछताछ या संदेश का विवरण लिखें...' : 'Describe your inquiry, feedback, or administrative question here...'}
            required
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: '2px',
              border: '2px solid #181512',
              fontSize: '14px',
              fontWeight: '600',
              color: '#181512',
              background: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '4px' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (isHi ? 'भेजा जा रहा है...' : 'Sending Message...') : (isHi ? 'संदेश भेजें 🚀' : 'Send Message 🚀')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
