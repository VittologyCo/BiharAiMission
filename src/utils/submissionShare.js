/**
 * submissionShare.js
 * Utility to encode, decode, and format submission details for public WhatsApp sharing.
 * Bypasses login requirements by packaging a compact, secure, URL-safe UTF-8 payload.
 */

export const encodeSubmissionForShare = (sub) => {
  if (!sub) return '';
  try {
    const compactObj = {
      n: sub.full_name || sub.name || '',
      e: sub.email || '',
      m: sub.mobile || '',
      g: sub.gender || '',
      a: sub.age || '',
      r: sub.role_type || '',
      d: sub.designation || '',
      dp: sub.department || '',
      o: sub.organization || '',
      x: sub.experience ?? '',
      dt: sub.district || '',
      b: sub.block_city || '',
      s: sub.state || 'Bihar',
      i: Array.isArray(sub.interests) ? sub.interests : (sub.interests ? [sub.interests] : []),
      it: sub.intent || '',
      c: sub.contribution || '',
      li: sub.linkedin || '',
      p: sub.portfolio || '',
      t: sub.created_at || new Date().toISOString(),
      id: sub.id || ''
    };
    const jsonStr = JSON.stringify(compactObj);
    const bytes = new TextEncoder().encode(jsonStr);
    let binString = '';
    bytes.forEach((b) => {
      binString += String.fromCharCode(b);
    });
    const b64 = btoa(binString);
    return encodeURIComponent(b64);
  } catch (err) {
    console.error('Encode share error:', err);
    return '';
  }
};

export const decodeSubmissionFromShare = (encodedStr) => {
  if (!encodedStr) return null;
  try {
    const decodedUri = decodeURIComponent(encodedStr);
    const binString = atob(decodedUri);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    const jsonStr = new TextDecoder().decode(bytes);
    const compact = JSON.parse(jsonStr);
    return {
      full_name: compact.n || '',
      email: compact.e || '',
      mobile: compact.m || '',
      gender: compact.g || '',
      age: compact.a || '',
      role_type: compact.r || '',
      designation: compact.d || '',
      department: compact.dp || '',
      organization: compact.o || '',
      experience: compact.x ?? '',
      district: compact.dt || '',
      block_city: compact.b || '',
      state: compact.s || 'Bihar',
      interests: Array.isArray(compact.i) ? compact.i : (compact.i ? [compact.i] : []),
      intent: compact.it || '',
      contribution: compact.c || '',
      linkedin: compact.li || '',
      portfolio: compact.p || '',
      created_at: compact.t || '',
      id: compact.id || ''
    };
  } catch (err) {
    console.error('Decode share error:', err);
    return null;
  }
};

export const generateWhatsAppShareText = (sub, publicUrl) => {
  if (!sub) return '';
  const lines = [
    `📋 *BIHAR AI MISSION — CANDIDATE SUBMISSION*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Name:* ${sub.full_name || sub.name || 'N/A'}`,
    `📧 *Email:* ${sub.email || 'N/A'}`,
    `📱 *Mobile:* ${sub.mobile || 'N/A'}`,
    `⚧ *Gender:* ${sub.gender || 'N/A'} | *Age:* ${sub.age || 'N/A'}`,
    ``,
    `💼 *Role Type:* ${sub.role_type || 'N/A'}`,
    `🏷️ *Designation:* ${sub.designation || 'N/A'}`,
    `🏢 *Organization:* ${sub.organization || 'N/A'}`,
    `🏛️ *Department:* ${sub.department || 'N/A'}`,
    `⏳ *Experience:* ${sub.experience !== undefined && sub.experience !== null && sub.experience !== '' ? `${sub.experience} Years` : 'N/A'}`,
    ``,
    `📍 *Location:* ${[sub.block_city, sub.district, sub.state || 'Bihar'].filter(Boolean).join(', ')}`,
  ];

  if (sub.interests && sub.interests.length > 0) {
    const list = Array.isArray(sub.interests) ? sub.interests.join(', ') : sub.interests;
    lines.push(`🎯 *Interests:* ${list}`);
  }

  if (sub.intent) {
    lines.push(`💡 *Intent:* ${sub.intent}`);
  }

  if (sub.contribution) {
    lines.push(`🤝 *Proposed Contribution:* ${sub.contribution}`);
  }

  if (sub.linkedin) {
    lines.push(`🔗 *LinkedIn:* ${sub.linkedin}`);
  }

  if (publicUrl) {
    lines.push(``);
    lines.push(`🌐 *View Complete Verified Profile Online:*`);
    lines.push(publicUrl);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Official Civic AI & Digital Literacy Initiative — Bihar AI Mission_`);

  return lines.join('\n');
};
