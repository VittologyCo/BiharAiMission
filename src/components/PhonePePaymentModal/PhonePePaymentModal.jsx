import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getPhonePeSettings,
  generateTransactionId,
  generateUpiUri,
  generateQrDataUrl,
  verifyUpiTransaction,
  savePaymentRecordToSupabase
} from '../../utils/phonepePayment';
import { supabase } from '../../utils/supabase';
import './PhonePePaymentModal.css';

export default function PhonePePaymentModal({ item, user, isHi, onClose, onSuccess }) {
  const settings = getPhonePeSettings();
  const [txnId] = useState(() => generateTransactionId(item?.id));
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 minutes countdown

  const rawPrice = item?.price || item?.priceDisplay || '₹699';
  const numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 699;
  const formattedPrice = `₹${numericPrice.toFixed(2)}`;

  // Generate Dynamic QR Code on Mount
  useEffect(() => {
    let isMounted = true;
    async function buildQr() {
      const uri = generateUpiUri({
        vpa: settings.merchantVpa,
        merchantName: settings.merchantName,
        amount: numericPrice,
        txnId: txnId,
        note: `Masterclass ${item?.courseName || 'Course'} Enrollment`
      });

      if (isMounted) setUpiUri(uri);

      const dataUrl = await generateQrDataUrl(uri);
      if (isMounted && dataUrl) {
        setQrCodeUrl(dataUrl);
      }
    }
    buildQr();
    return () => { isMounted = false; };
  }, [settings.merchantVpa, settings.merchantName, numericPrice, txnId, item?.courseName]);

  // Background Status Polling (checks Supabase for PhonePe webhook / payment callback completion)
  useEffect(() => {
    if (isSuccess || !txnId) return;

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        if (!supabase) return;
        const { data } = await supabase
          .from('masterclass_payments')
          .select('*')
          .eq('transaction_id', txnId)
          .eq('payment_status', 'SUCCESS')
          .maybeSingle();

        if (data && isSubscribed) {
          setIsSuccess(true);
          clearInterval(pollInterval);
          toast.success(isHi ? '🎉 भुगतान ऑनलाइन सत्यापित! क्लास अनलॉक हो गई।' : '🎉 Payment Verified! Course Unlocked.');
          setTimeout(() => {
            if (typeof onSuccess === 'function') {
              onSuccess({
                success: true,
                txnId: data.transaction_id,
                utrNumber: data.utr_number || 'AUTO_VERIFIED',
                amount: data.amount,
                userEmail: data.user_email,
                classId: item?.id
              });
            }
          }, 1200);
        }
      } catch (e) {
        console.warn('Payment status polling info:', e);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [txnId, isSuccess, item?.id, isHi, onSuccess]);

  // 2-Minute Payment Timer Countdown & Auto-Close on Expiration
  useEffect(() => {
    if (isSuccess) return;

    if (timerSeconds <= 0) {
      toast.error(
        isHi
          ? '⏱️ भुगतान समय समाप्त! QR कोड एक्सपायर हो गया है, कृपया पुनः प्रयास करें।'
          : '⏱️ Payment Timed Out! QR Code expired. Please try again.'
      );
      if (typeof onClose === 'function') {
        onClose();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerSeconds, isSuccess, isHi, onClose]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handlePaymentConfirm = async () => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      // 1. Verify transaction
      const res = await verifyUpiTransaction({
        txnId,
        utrNumber: 'UPI_AUTO_VERIFIED',
        amount: numericPrice,
        userEmail: user?.email,
        classId: item?.id
      });

      // 2. Save payment record to Supabase database masterclass_payments table with timestamp & transaction ID
      await savePaymentRecordToSupabase({
        user,
        item,
        txnId,
        utrNumber: 'UPI_AUTO_VERIFIED',
        amount: numericPrice
      });

      setIsSuccess(true);
      setTimeout(() => {
        if (typeof onSuccess === 'function') {
          onSuccess(res);
        }
      }, 1200);
    } catch (err) {
      setErrorMessage(isHi ? 'सत्यापन विफल रहा। कृपया पुनः प्रयास करें।' : 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="phonepe-payment-wrapper">
        {isSuccess ? (
          /* SUCCESS CELEBRATION VIEW */
          <div className="phonepe-success-view">
            <div className="phonepe-success-icon-wrap">
              <div className="phonepe-success-icon">🎉</div>
            </div>
            <h2 className="phonepe-success-title">
              {isHi ? 'भुगतान सफल! क्लास अनलॉक हो गई' : 'Payment Verified Successfully!'}
            </h2>
            <p className="phonepe-success-subtitle">
              {isHi ? 'आपको इस मास्टरक्लास का पूर्ण एक्सेस मिल गया है।' : 'Your enrollment is confirmed. Welcome to the masterclass!'}
            </p>
            <div className="phonepe-success-badge">
              ✓ {formattedPrice} Paid via UPI ({txnId})
            </div>
          </div>
        ) : (
          /* PREMIUM PAYMENT CHECKOUT CARD */
          <>
            {/* Header */}
            <div className="phonepe-modal-header">
              <div className="phonepe-header-content">
                <span className="phonepe-brand-tag">
                  ⚡ {isHi ? 'सुरक्षित चेकआउट' : 'EXECUTIVE CHECKOUT'}
                </span>
                <h2 className="phonepe-course-title">{item?.courseName || 'Masterclass Course'}</h2>
              </div>
              <div className="phonepe-price-row">
                <span className="phonepe-price-label">{isHi ? 'कुल राशि:' : 'Total Amount:'}</span>
                <span className="phonepe-price-value">{formattedPrice}</span>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="phonepe-modal-body">
              {/* Dynamic QR Code Section */}
              <div className="phonepe-qr-container">
                <div className="phonepe-qr-box">
                  {qrCodeUrl ? (
                    <>
                      <img src={qrCodeUrl} alt="UPI Payment QR Code" className="phonepe-qr-img" />
                      <div className="phonepe-scan-line" />
                    </>
                  ) : (
                    <div className="phonepe-qr-loading">
                      <span>🔄 Generating ₹{numericPrice} QR...</span>
                    </div>
                  )}
                </div>

                <div className="phonepe-qr-instruction">
                  <span>📱 Scan with <strong>PhonePe, Google Pay, Paytm, or BHIM</strong></span>
                </div>

                <div className="phonepe-timer-badge">
                  <span className="phonepe-timer-dot"></span>
                  <span>{isHi ? 'QR समय सीमा:' : 'QR Expires in:'} <strong>{formatTimer(timerSeconds)}</strong></span>
                </div>
              </div>

              {/* Divider with Badge */}
              <div className="phonepe-divider">
                <span>{isHi ? 'या मोबाइल ऐप से भुगतान करें' : 'OR PAY DIRECTLY VIA APP'}</span>
              </div>

              {/* Direct UPI App CTA Button */}
              <div className="phonepe-actions-container">
                <a
                  href={upiUri || '#'}
                  className="phonepe-app-btn phonepe-btn-green"
                  onClick={handlePaymentConfirm}
                >
                  <span className="phonepe-btn-icon">🟢</span>
                  <span className="phonepe-btn-text">
                    {isHi ? 'GPay / Paytm / BHIM या किसी भी UPI ऐप से भुगतान करें' : 'Pay via GPay / Paytm / BHIM or any UPI App'}
                  </span>
                  <span className="phonepe-btn-arrow">→</span>
                </a>

                {errorMessage && (
                  <div className="phonepe-error-msg">
                    ⚠️ {errorMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Footer Trust Bar */}
            <div className="phonepe-modal-footer">
              <span className="phonepe-shield-icon">🛡️</span>
              <span>100% Encrypted & Verified NPCI UPI Network • Instant Auto Unlock</span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
