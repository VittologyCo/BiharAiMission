import { supabase } from '../utils/supabase';

// Standard 15-day window for WhatsApp-style disappearing messages
export const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

/**
 * Checks if current time is within Indian Standard Time (IST) 8:00 PM - 8:00 AM window
 */
export const isWithinNightChatHours = () => {
  try {
    const now = new Date();
    const istHourStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: 'numeric',
    }).format(now);
    const hour = parseInt(istHourStr, 10);
    return hour >= 20 || hour < 8;
  } catch (e) {
    const utcHours = new Date().getUTCHours();
    const utcMinutes = new Date().getUTCMinutes();
    const istMinutes = (utcHours * 60 + utcMinutes + 330) % 1440;
    const istHour = Math.floor(istMinutes / 60);
    return istHour >= 20 || istHour < 8;
  }
};

/**
 * Returns formatted IST current time string
 */
export const getISTClockDisplay = () => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString();
  }
};

/**
 * Formats chat message timestamp to friendly IST format (e.g. "Today 10:15 PM")
 */
export const formatMessageTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    if (isToday) return `Today, ${timeStr}`;

    const dateStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
    }).format(date);

    return `${dateStr}, ${timeStr}`;
  } catch {
    return '';
  }
};

/**
 * Resolve local storage server URL for Chit-Chat file uploads
 */
export const getChitChatStorageServerUrl = () => {
  const envUrl = (
    process.env.REACT_APP_STORAGE_SERVER_URL ||
    process.env.STORAGE_SERVER_URL ||
    'http://localhost:5000'
  ).trim().replace(/\/+$/, '');
  return envUrl;
};

/**
 * Upload image, video, audio, or document to the local storage server (D:\Bihar_Ai_Mission\Chit-chat)
 */
export const uploadChitChatFile = async (file) => {
  if (!file) throw new Error('No file selected');
  const serverUrl = getChitChatStorageServerUrl();
  const formData = new FormData();
  formData.append('file', file);

  const endpoints = [
    `${serverUrl}/api/chitchat/upload`,
    `${serverUrl}/chitchat/upload`,
    'http://localhost:5000/api/chitchat/upload',
    'http://localhost:5000/chitchat/upload'
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.fileUrl) {
          return data;
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  // Graceful fallback for local offline testing if server is still starting
  console.warn('Local storage server offline notice. Using base64 preview fallback for chat.', lastError);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ext = (file.name || '').split('.').pop().toLowerCase();
      let mediaType = 'files';
      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) mediaType = 'image';
      else if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) mediaType = 'video';
      else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) mediaType = 'audio';

      resolve({
        success: true,
        fileUrl: reader.result,
        fileName: file.name,
        originalName: file.name,
        mediaType: mediaType,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Fetch messages for a channel strictly filtered to the last 15 days
 */
export const fetchChannelMessages = async (channelId) => {
  if (!channelId) return [];
  const fifteenDaysAgoISO = new Date(Date.now() - FIFTEEN_DAYS_MS).toISOString();

  try {
    const { data, error } = await supabase
      .from('chitchat_messages')
      .select('*')
      .eq('channel_id', channelId)
      .gte('created_at', fifteenDaysAgoISO)
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) {
      console.warn('Supabase fetch messages notice:', error.message);
      // Local fallback
      const cached = localStorage.getItem(`chitchat_cache_${channelId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.filter(m => new Date(m.created_at).getTime() > Date.now() - FIFTEEN_DAYS_MS);
      }
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Fetch channel messages error:', err);
    return [];
  }
};

/**
 * Send a chat message
 */
export const sendChitChatMessage = async (msgPayload) => {
  const finalPayload = {
    ...msgPayload,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('chitchat_messages')
      .insert([finalPayload])
      .select()
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Direct supabase send notice:', err);
  }

  // Backup to localStorage
  try {
    const key = `chitchat_cache_${msgPayload.channel_id}`;
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.push(finalPayload);
    localStorage.setItem(key, JSON.stringify(prev));
  } catch (e) {}

  return finalPayload;
};

/**
 * Fetch user's friends (enforces 5 friends max per user)
 */
export const fetchUserFriends = async (userEmail) => {
  if (!userEmail) return [];
  const clean = userEmail.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('chitchat_friends')
      .select('*')
      .eq('user_email', clean)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Friends fetch notice:', e);
  }

  // Local fallback
  const local = localStorage.getItem(`chitchat_friends_${clean}`);
  return local ? JSON.parse(local).slice(0, 5) : [];
};

/**
 * Add a friend with strict 5-friend limit
 */
export const addChitChatFriend = async (userEmail, friendData) => {
  if (!userEmail || !friendData?.email) {
    return { success: false, error: 'User details missing.' };
  }
  const cleanUser = userEmail.toLowerCase().trim();
  const cleanFriend = friendData.email.toLowerCase().trim();

  if (cleanUser === cleanFriend) {
    return { success: false, error: 'You cannot add yourself as a friend.' };
  }

  // 1. Try secure RPC
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('add_chitchat_friend', {
      p_user_email: cleanUser,
      p_friend_email: cleanFriend,
      p_friend_name: friendData.fullName || friendData.name || 'Peer Member',
      p_friend_username: (friendData.username || '').replace(/^@+/, ''),
      p_friend_designation: friendData.designation || 'Member',
    });

    if (!rpcErr && rpcData) {
      return rpcData;
    }
  } catch (rpcEx) {
    console.warn('RPC add friend fallback:', rpcEx);
  }

  // 2. Direct query fallback
  try {
    const { data: existing } = await supabase
      .from('chitchat_friends')
      .select('id')
      .eq('user_email', cleanUser);

    if (existing && existing.length >= 5) {
      return {
        success: false,
        error: 'Friend limit reached. You can chat separately with up to 5 friends only.'
      };
    }

    const { error: insErr } = await supabase
      .from('chitchat_friends')
      .upsert({
        user_email: cleanUser,
        friend_email: cleanFriend,
        friend_name: friendData.fullName || friendData.name || 'Peer Member',
        friend_username: (friendData.username || '').replace(/^@+/, ''),
        friend_designation: friendData.designation || 'Member',
      }, { onConflict: 'user_email,friend_email' });

    if (!insErr) {
      return { success: true, message: 'Friend added successfully!' };
    }
  } catch (insEx) {
    console.warn('Direct insert friend fallback:', insEx);
  }

  // 3. LocalStorage fallback
  const key = `chitchat_friends_${cleanUser}`;
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  if (list.length >= 5) {
    return { success: false, error: 'Friend limit reached (Max 5 friends).' };
  }
  if (!list.some(f => f.friend_email === cleanFriend)) {
    list.push({
      friend_email: cleanFriend,
      friend_name: friendData.fullName || friendData.name,
      friend_username: (friendData.username || '').replace(/^@+/, ''),
      friend_designation: friendData.designation,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(list));
  }
  return { success: true, message: 'Friend added successfully!' };
};

/**
 * Fetch department groups & admin custom groups
 */
export const fetchChitChatGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('chitchat_groups')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Groups fetch notice:', err);
  }

  // Built-in standard groups fallback
  return [
    {
      id: 'overall',
      name: '🏛️ All Bihar AI Community (समग्र राज्य समूह)',
      description: 'Open statewide forum for all registered members across Bihar.',
      departments: ['ALL']
    },
    {
      id: 'dept_it_ai',
      name: '💻 Information Technology & AI',
      description: 'Dedicated hub for IT, software, AI engineers, and technical cadres.',
      departments: ['Information Technology', 'Science & Technology', 'Technical']
    },
    {
      id: 'dept_education',
      name: '🎓 Education & Academic Research',
      description: 'Teachers, professors, researchers, students, and academic leaders.',
      departments: ['Education', 'Higher Education', 'Research']
    },
    {
      id: 'dept_healthcare',
      name: '🏥 Health & Family Welfare',
      description: 'Doctors, medical professionals, healthcare officers, and hospital staff.',
      departments: ['Health', 'Medical', 'Family Welfare']
    },
    {
      id: 'dept_agriculture',
      name: '🌾 Agriculture & Rural Development',
      description: 'Agricultural officers, rural development managers, and farm innovators.',
      departments: ['Agriculture', 'Rural Development', 'Panchayati Raj']
    },
    {
      id: 'dept_revenue_admin',
      name: '⚖️ General Administration & Revenue',
      description: 'Administrative officers, revenue officers, district administration, and governance.',
      departments: ['General Administration', 'Revenue', 'Police', 'Finance']
    }
  ];
};

/**
 * Resolve user's respective department group from their profile department/designation
 */
export const resolveUserDepartmentGroup = (allGroups, userDept, userDesignation) => {
  if (!allGroups || allGroups.length === 0) return null;
  const rawTarget = `${userDept || ''} ${userDesignation || ''}`.toLowerCase();

  // Find exact or partial match in group departments array
  const matched = allGroups.find(g => {
    if (g.id === 'overall') return false;
    if (Array.isArray(g.departments)) {
      return g.departments.some(d => d && rawTarget.includes(d.toLowerCase()));
    }
    return false;
  });

  return matched || allGroups.find(g => g.id === 'dept_it_ai') || allGroups[1] || allGroups[0];
};

/**
 * Search registered users with a set @username for friend discovery
 */
export const searchRegisteredUsers = async (queryText, currentEmail) => {
  const cleanQuery = (queryText || '').replace(/^@+/, '').trim().toLowerCase();
  if (!cleanQuery) return [];

  try {
    const { data, error } = await supabase
      .from('user_details')
      .select('id, full_name, username, email, designation, department, district')
      .not('username', 'is', null)
      .neq('username', '')
      .or(`username.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`)
      .limit(10);

    if (!error && Array.isArray(data)) {
      return data.filter(u => u.email?.toLowerCase() !== currentEmail?.toLowerCase());
    }
  } catch (err) {
    console.warn('Search users notice:', err);
  }
  return [];
};

/**
 * Validate and claim Admin 6-digit access code
 */
export const claimAdminAccessCode = async (userEmail, codeStr) => {
  const cleanCode = (codeStr || '').trim().toUpperCase();
  const cleanEmail = (userEmail || '').toLowerCase().trim();

  if (cleanCode.length !== 6) {
    return { success: false, error: 'Access code must be exactly 6 characters/digits.' };
  }

  // 1. Try RPC
  try {
    const { data, error } = await supabase.rpc('claim_chitchat_code', {
      p_user_email: cleanEmail,
      p_code: cleanCode
    });

    if (!error && data) {
      if (data.success && data.expires_at) {
        saveLocalSessionPass({
          code: cleanCode,
          durationMinutes: data.duration_minutes || 60,
          expiresAt: data.expires_at
        });
      }
      return data;
    }
  } catch (rpcErr) {
    console.warn('RPC claim code fallback:', rpcErr);
  }

  // 2. Direct table fallback
  try {
    const { data: codeRec, error: fetchErr } = await supabase
      .from('chitchat_access_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle();

    if (!fetchErr && codeRec) {
      const durationMins = codeRec.duration_minutes || 60;
      const expiresAt = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

      await supabase
        .from('chitchat_access_codes')
        .update({
          claimed_by: cleanEmail,
          claimed_at: new Date().toISOString(),
          expires_at: expiresAt,
          is_active: false
        })
        .eq('id', codeRec.id);

      saveLocalSessionPass({
        code: cleanCode,
        durationMinutes: durationMins,
        expiresAt: expiresAt
      });

      return {
        success: true,
        duration_minutes: durationMins,
        expires_at: expiresAt,
        message: `Unlocked! Access granted for ${durationMins} minutes.`
      };
    }
  } catch (dirErr) {
    console.warn('Direct code claim fallback:', dirErr);
  }

  return { success: false, error: 'Invalid or already claimed 6-digit code. Please contact Admin.' };
};

/**
 * Local Session Pass Management
 */
const PASS_STORAGE_KEY = 'bihar_ai_chitchat_session_pass';

export const getLocalSessionPass = () => {
  try {
    const raw = localStorage.getItem(PASS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.expiresAt) return null;

    const expiresTime = new Date(parsed.expiresAt).getTime();
    if (Date.now() > expiresTime) {
      // Expired
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const saveLocalSessionPass = (passData) => {
  try {
    localStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(passData));
  } catch (e) {}
};

export const clearLocalSessionPass = () => {
  try {
    localStorage.removeItem(PASS_STORAGE_KEY);
  } catch (e) {}
};

/**
 * Synthesizes a gentle web audio chime for chat notifications and @mentions (zero external dependencies)
 */
export const playChatNotificationSound = (isMention = false) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isMention) {
      // Double upbeat chime for @mention
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.12); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Gentle water-drop tone for normal incoming message
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // AudioContext blocked or uninitialized - silently ignore
  }
};

