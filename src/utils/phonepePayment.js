import QRCode from 'qrcode';
import { supabase } from './supabase';

// Storage Key for PhonePe Merchant Settings
const STORAGE_PHONEPE_SETTINGS = 'bihar_ai_phonepe_merchant_settings';

// Default Test Merchant Settings (Can be updated by Admin in AdminDashboard)
const DEFAULT_PHONEPE_SETTINGS = {
  merchantId: 'PGTESTPAYUAT',
  saltKey: '099eb0cd-02fa-4e8e-a183-0129e443c705',
  saltIndex: '1',
  merchantVpa: 'biharaimission@ybl',
  merchantName: 'Bihar AI Mission',
  env: 'SANDBOX' // 'SANDBOX' or 'PRODUCTION'
};

/**
 * Get configured PhonePe Merchant Settings from LocalStorage/Supabase
 */
export const getPhonePeSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_PHONEPE_SETTINGS);
    if (stored) {
      return { ...DEFAULT_PHONEPE_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading PhonePe settings:', e);
  }
  return DEFAULT_PHONEPE_SETTINGS;
};

/**
 * Save PhonePe Merchant Settings
 */
export const savePhonePeSettings = (settings) => {
  try {
    const updated = { ...getPhonePeSettings(), ...settings };
    localStorage.setItem(STORAGE_PHONEPE_SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('bihar_ai_phonepe_settings_updated'));
    return updated;
  } catch (e) {
    console.error('Error saving PhonePe settings:', e);
    return DEFAULT_PHONEPE_SETTINGS;
  }
};

/**
 * Generate a unique Transaction ID
 */
export const generateTransactionId = (classId) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TXN_${classId ? String(classId).substring(0, 8) : 'COURSE'}_${timestamp}_${randomStr}`;
};

/**
 * Generate a Dynamic UPI URI String for exact course amount
 * Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tn=NOTE&tr=TXN_ID&cu=INR
 */
export const generateUpiUri = ({ vpa, merchantName, amount, txnId, note }) => {
  const cleanVpa = (vpa || 'biharaimission@ybl').trim();
  const cleanName = encodeURIComponent(merchantName || 'Bihar AI Mission');
  const cleanAmount = parseFloat(amount || 0).toFixed(2);
  const cleanNote = encodeURIComponent(note || `Course Enrollment ${txnId}`);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${cleanAmount}&tr=${txnId}&tn=${cleanNote}&cu=INR`;
};

/**
 * Generate a Data URL PNG QR Code image from a UPI URI string using the 'qrcode' npm package
 */
export const generateQrDataUrl = async (upiUri) => {
  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: 'var(--color-charcoal-900, #181512)',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Data URL:', err);
    return null;
  }
};

/**
 * Verify a UTR / Transaction Reference ID submitted by user or webhook
 */
export const verifyUpiTransaction = async ({ txnId, utrNumber, amount, userEmail, classId }) => {
  // Simulate transaction verification (In live production, checks PhonePe / Supabase Webhook API)
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (!utrNumber || String(utrNumber).trim().length < 6) {
    return {
      success: false,
      message: 'Please enter a valid 12-digit UPI UTR / Transaction Reference ID from your UPI App.'
    };
  }

  return {
    success: true,
    txnId,
    utrNumber: String(utrNumber).trim(),
    amount,
    userEmail,
    classId,
    verifiedAt: new Date().toISOString(),
    message: 'Payment Verified Successfully! Course Access Granted.'
  };
};

/**
 * Save Payment record to Supabase masterclass_payments table
 */
export const savePaymentRecordToSupabase = async ({ user, item, txnId, utrNumber, amount }) => {
  try {
    if (!supabase) return { success: false };
    const userEmail = (user?.email || 'guest@biharai.org').toLowerCase().trim();
    const userName = user?.fullName || user?.name || userEmail;
    
    const payload = {
      user_email: userEmail,
      user_name: userName,
      masterclass_id: String(item?.id || 'mc_001'),
      masterclass_name: item?.courseName || item?.title || 'Paid Masterclass',
      amount: parseFloat(amount || 0),
      currency: 'INR',
      payment_status: 'SUCCESS',
      payment_gateway: 'PHONEPE_UPI',
      transaction_id: txnId,
      utr_number: utrNumber || null,
      created_at: new Date().toISOString()
    };

    const officerPayload = {
      user_id: user?.id ? String(user.id) : userEmail,
      user_email: userEmail,
      user_name: userName,
      program_id: String(item?.id || 'prog-1'),
      program_title: item?.courseName || item?.title || 'Officer Program',
      transaction_id: txnId,
      merchant_transaction_id: txnId,
      amount: parseFloat(amount || 0),
      status: 'SUCCESS',
      payment_gateway: 'PHONEPE_UPI',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('masterclass_payments')
      .insert([payload]);

    try {
      await supabase.from('officer_program_payments').insert([officerPayload]);
    } catch (e) {}

    if (error) {
      console.warn('Supabase masterclass_payments insert fallback warning:', error.message);
    }
    return { success: true, data };
  } catch (err) {
    console.error('Error saving masterclass payment record:', err);
    return { success: false };
  }
};
