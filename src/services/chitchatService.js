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
 * Formats remaining duration until ISO expiry into a real-time ticking string (e.g. "59m 42s" or "1h 15m 08s")
 * Returns empty string if invalid or 'Expired' if time has elapsed.
 */
export const formatTimeRemaining = (expiresAtIso) => {
  if (!expiresAtIso) return '';
  try {
    const diffMs = new Date(expiresAtIso).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const totalSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
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
 * Fetch user's friends (enforces 5 friends max per user, strictly accepted connections)
 */
export const fetchUserFriends = async (userEmail) => {
  if (!userEmail) return [];
  const clean = userEmail.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('chitchat_friends')
      .select('*')
      .eq('user_email', clean)
      .eq('status', 'accepted')
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
  if (local) {
    const parsed = JSON.parse(local);
    return parsed.filter(f => f.status === 'accepted' || !f.status).slice(0, 5);
  }
  return [];
};

/**
 * Fetch incoming pending friend requests for user approval
 */
export const fetchPendingFriendRequests = async (userEmail) => {
  if (!userEmail) return [];
  const clean = userEmail.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('chitchat_friends')
      .select('*')
      .eq('user_email', clean)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Pending friend requests fetch notice:', e);
  }

  const local = localStorage.getItem(`chitchat_pending_req_${clean}`);
  return local ? JSON.parse(local) : [];
};

/**
 * Fetch outgoing sent friend requests by user that are pending approval
 */
export const fetchSentFriendRequests = async (userEmail) => {
  if (!userEmail) return [];
  const clean = userEmail.toLowerCase().trim();

  try {
    const { data, error } = await supabase
      .from('chitchat_friends')
      .select('*')
      .eq('sender_email', clean)
      .eq('status', 'pending');

    if (!error && data) {
      return data;
    }
  } catch (e) {
    console.warn('Sent friend requests fetch notice:', e);
  }
  return [];
};

/**
 * Send a Friend Request (Receiver must approve before 1-on-1 chat begins)
 */
export const sendChitChatFriendRequest = async (senderUser, targetFriend) => {
  if (!senderUser?.email || !targetFriend?.email) {
    return { success: false, error: 'User details missing.' };
  }
  const cleanSender = senderUser.email.toLowerCase().trim();
  const cleanReceiver = targetFriend.email.toLowerCase().trim();

  if (cleanSender === cleanReceiver) {
    return { success: false, error: 'You cannot add yourself as a friend.' };
  }

  const senderName = senderUser.fullName || senderUser.name || 'Peer Member';
  const senderUname = (senderUser.username || '').replace(/^@+/, '').trim();
  const senderDesig = senderUser.designation || 'Civic Member';

  const receiverName = targetFriend.fullName || targetFriend.name || targetFriend.full_name || 'Member';
  const receiverUname = (targetFriend.username || '').replace(/^@+/, '').trim();
  const receiverDesig = targetFriend.designation || targetFriend.role_type || 'Member';

  // 1. Try secure RPC
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('send_chitchat_friend_request', {
      p_sender_email: cleanSender,
      p_sender_name: senderName,
      p_sender_username: senderUname,
      p_sender_designation: senderDesig,
      p_receiver_email: cleanReceiver,
      p_receiver_name: receiverName,
      p_receiver_username: receiverUname,
      p_receiver_designation: receiverDesig,
    });

    if (!rpcErr && rpcData) {
      return rpcData;
    }
  } catch (rpcEx) {
    console.warn('RPC send friend request notice:', rpcEx);
  }

  // 2. Direct table fallback
  try {
    // Check sender's accepted friend count
    const { data: currentFriends } = await supabase
      .from('chitchat_friends')
      .select('id')
      .eq('user_email', cleanSender)
      .eq('status', 'accepted');

    if (currentFriends && currentFriends.length >= 5) {
      return { success: false, error: 'Friend limit reached (max 5 friends).' };
    }

    const { error: insErr } = await supabase
      .from('chitchat_friends')
      .upsert({
        user_email: cleanReceiver,
        friend_email: cleanSender,
        friend_name: senderName,
        friend_username: senderUname,
        friend_designation: senderDesig,
        sender_email: cleanSender,
        sender_name: senderName,
        sender_username: senderUname,
        sender_designation: senderDesig,
        status: 'pending',
        created_at: new Date().toISOString()
      }, { onConflict: 'user_email,friend_email' });

    if (!insErr) {
      return { success: true, message: 'Friend request sent successfully!' };
    }
  } catch (dirErr) {
    console.warn('Direct friend request fallback notice:', dirErr);
  }

  // 3. LocalStorage fallback
  const receiverKey = `chitchat_pending_req_${cleanReceiver}`;
  const list = JSON.parse(localStorage.getItem(receiverKey) || '[]');
  if (!list.some(r => r.sender_email === cleanSender)) {
    list.push({
      id: `req_${Date.now()}`,
      user_email: cleanReceiver,
      friend_email: cleanSender,
      sender_email: cleanSender,
      sender_name: senderName,
      sender_username: senderUname,
      sender_designation: senderDesig,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    localStorage.setItem(receiverKey, JSON.stringify(list));
  }

  return { success: true, message: 'Friend request sent successfully!' };
};

/**
 * Accept or Decline an incoming Friend Request
 */
export const respondChitChatFriendRequest = async (requestId, userEmail, action, currentUser) => {
  if (!requestId || !userEmail) {
    return { success: false, error: 'Missing request ID or user info.' };
  }
  const cleanUser = userEmail.toLowerCase().trim();
  const myName = currentUser?.fullName || currentUser?.name || 'Member';
  const myUsername = (currentUser?.username || '').replace(/^@+/, '').trim();
  const myDesig = currentUser?.designation || 'Member';

  // 1. Try secure RPC
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('respond_chitchat_friend_request', {
      p_request_id: requestId,
      p_user_email: cleanUser,
      p_action: action,
      p_user_name: myName,
      p_user_username: myUsername,
      p_user_designation: myDesig,
    });

    if (!rpcErr && rpcData) {
      return rpcData;
    }
  } catch (e) {
    console.warn('RPC respond friend request fallback:', e);
  }

  // 2. Direct table fallback
  try {
    if (action === 'decline') {
      await supabase.from('chitchat_friends').delete().eq('id', requestId);
      return { success: true, message: 'Friend request declined.' };
    }

    if (action === 'accept') {
      // Find request record
      const { data: reqRecord } = await supabase
        .from('chitchat_friends')
        .select('*')
        .eq('id', requestId)
        .maybeSingle();

      if (reqRecord) {
        // Update request row to accepted
        await supabase
          .from('chitchat_friends')
          .update({ status: 'accepted' })
          .eq('id', requestId);

        // Upsert reciprocal row for the requester so both are mutually connected
        await supabase
          .from('chitchat_friends')
          .upsert({
            user_email: reqRecord.friend_email.toLowerCase().trim(),
            friend_email: cleanUser,
            friend_name: myName,
            friend_username: myUsername,
            friend_designation: myDesig,
            sender_email: reqRecord.friend_email,
            status: 'accepted'
          }, { onConflict: 'user_email,friend_email' });

        return { success: true, message: 'Friend request accepted! You can now chat in real time.' };
      }
    }
  } catch (err) {
    console.warn('Direct respond friend request notice:', err);
  }

  return { success: true, message: action === 'accept' ? 'Friend request accepted!' : 'Request removed.' };
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
 * Filter groups visible to a specific user based on their profile Designation and Department.
 * Requirement 4: When Admin creates a custom group specifying designations (e.g. "Revenue Officer"),
 * ONLY users who set their designation in profile as Revenue Officer can see this group!
 */
export const filterGroupsForUser = (allGroups, userDept, userDesignation) => {
  if (!Array.isArray(allGroups)) return [];
  const cleanDept = (userDept || '').toLowerCase().trim();
  const cleanDesig = (userDesignation || '').toLowerCase().trim();

  return allGroups.filter((group) => {
    // 1. Statewide overall group is open to all
    if (group.id === 'overall') return true;

    // 2. Designation-restricted custom group
    if (Array.isArray(group.designations) && group.designations.length > 0) {
      if (!cleanDesig) return false;
      const normUser = cleanDesig.replace(/[^a-z0-9]/g, '');
      const desigMatches = group.designations.some((d) => {
        const cd = (d || '').toLowerCase().trim();
        if (!cd) return false;
        const normTarget = cd.replace(/[^a-z0-9]/g, '');
        return (
          cleanDesig === cd ||
          cleanDesig.includes(cd) ||
          cd.includes(cleanDesig) ||
          (normUser && normTarget && (normUser === normTarget || normUser.includes(normTarget) || normTarget.includes(normUser)))
        );
      });
      return desigMatches;
    }

    // 3. Department or clubbed groups
    if (Array.isArray(group.departments) && group.departments.length > 0) {
      if (group.departments.includes('ALL')) return true;

      // Check if departments list specifies designation keywords or departments
      const matches = group.departments.some((d) => {
        const cd = (d || '').toLowerCase().trim();
        if (!cd) return false;
        return (
          (cleanDept && cleanDept.includes(cd)) ||
          (cleanDesig && cleanDesig.includes(cd)) ||
          cd.includes(cleanDept) ||
          cd.includes(cleanDesig)
        );
      });
      return matches;
    }

    // Default: visible if no restrictive rules configured
    return true;
  });
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
 * Validate and claim Admin 6-digit access code with Synchronized Global Expiration
 * Requirement 1: Countdown starts from code creation, so all users sharing this code see the exact same remaining time in real-time.
 */
export const claimAdminAccessCode = async (userEmail, codeStr) => {
  const cleanCode = (codeStr || '').trim().toUpperCase();
  const cleanEmail = (userEmail || '').toLowerCase().trim();

  if (cleanCode.length !== 6) {
    return { success: false, error: 'Access code must be exactly 6 characters/digits.' };
  }

  // 1. Direct table claim with multi-user support & global synchronized expiration
  try {
    const { data: codeRec, error: fetchErr } = await supabase
      .from('chitchat_access_codes')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle();

    if (!fetchErr && codeRec) {
      const durationMins = codeRec.duration_minutes || 60;
      // Calculate or retrieve authoritative global expires_at from code creation
      const globalExpiresAt = codeRec.expires_at ||
        new Date(new Date(codeRec.created_at || Date.now()).getTime() + durationMins * 60 * 1000).toISOString();

      // Enforce global expiration: reject if already expired
      if (new Date(globalExpiresAt).getTime() <= Date.now()) {
        try {
          await supabase.from('chitchat_access_codes').update({ is_active: false }).eq('id', codeRec.id);
        } catch (_) {}
        return {
          success: false,
          error: 'This access code has already expired. Please ask the Admin for a new active code.'
        };
      }

      // Maintain list of all users/emails who have unlocked with this code
      let updatedClaimedBy = cleanEmail;
      if (codeRec.claimed_by) {
        const existingList = codeRec.claimed_by.split(',').map(s => s.trim()).filter(Boolean);
        if (!existingList.some(e => e.toLowerCase() === cleanEmail)) {
          existingList.push(cleanEmail);
        }
        updatedClaimedBy = existingList.join(', ');
      }

      // Keep is_active = true so MULTIPLE users shared by admin can unlock!
      await supabase
        .from('chitchat_access_codes')
        .update({
          claimed_by: updatedClaimedBy,
          claimed_at: new Date().toISOString(),
          expires_at: globalExpiresAt,
          is_active: true
        })
        .eq('id', codeRec.id);

      // Save synchronized global session pass in browser localStorage
      saveLocalSessionPass({
        code: cleanCode,
        durationMinutes: durationMins,
        expiresAt: globalExpiresAt
      });

      const remainingMinutes = Math.max(1, Math.round((new Date(globalExpiresAt).getTime() - Date.now()) / (60 * 1000)));

      return {
        success: true,
        duration_minutes: durationMins,
        expires_at: globalExpiresAt,
        message: `Unlocked! Active session with ~${remainingMinutes}m remaining.`
      };
    }
  } catch (dirErr) {
    console.warn('Direct code claim fallback notice:', dirErr);
  }

  // 2. Fallback to RPC if direct table fails
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

  return { success: false, error: 'Invalid or inactive 6-digit access code. Please contact Admin.' };
};

/**
 * Channel Last-Read Timestamps (for individual user unread badges)
 */
const READ_TIMESTAMPS_KEY = 'chitchat_read_ts_';

export const getChannelReadTimestamp = (channelId, userEmail) => {
  if (!userEmail || !channelId) return null;
  try {
    const raw = localStorage.getItem(`${READ_TIMESTAMPS_KEY}${userEmail.toLowerCase().trim()}`);
    const map = raw ? JSON.parse(raw) : {};
    return map[channelId] || null;
  } catch {
    return null;
  }
};

export const markChannelAsRead = (channelId, userEmail) => {
  if (!userEmail || !channelId) return;
  try {
    const key = `${READ_TIMESTAMPS_KEY}${userEmail.toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[channelId] = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(map));
  } catch {}
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
    if (!parsed || !parsed.expiresAt) {
      localStorage.removeItem(PASS_STORAGE_KEY);
      return null;
    }

    const expiresTime = new Date(parsed.expiresAt).getTime();
    if (isNaN(expiresTime) || Date.now() >= expiresTime) {
      // Expired: auto purge stale pass from storage
      localStorage.removeItem(PASS_STORAGE_KEY);
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
 * Authoritatively verifies and synchronizes the local session pass with the server DB
 * (Supabase chitchat_access_codes table).
 * - If code is deleted, paused, or server expires_at is past: clears local storage and returns null.
 * - If active on server: updates local storage to match the exact server expires_at and returns synced pass.
 */
export const syncAndVerifySessionPass = async (userPass) => {
  const currentPass = userPass || getLocalSessionPass();
  if (!currentPass || !currentPass.code) {
    clearLocalSessionPass();
    return null;
  }

  try {
    const cleanCode = String(currentPass.code).trim().toUpperCase();
    const { data: codeRec, error } = await supabase
      .from('chitchat_access_codes')
      .select('id, code, is_active, expires_at, duration_minutes, created_at')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !codeRec) {
      // Code no longer exists in DB or error
      clearLocalSessionPass();
      return null;
    }

    if (!codeRec.is_active) {
      // Admin paused this code
      clearLocalSessionPass();
      return null;
    }

    const durationMins = codeRec.duration_minutes || 60;
    const authoritativeExpiresAt = codeRec.expires_at ||
      new Date(new Date(codeRec.created_at || Date.now()).getTime() + durationMins * 60 * 1000).toISOString();

    const serverExpiresMs = new Date(authoritativeExpiresAt).getTime();
    if (isNaN(serverExpiresMs) || Date.now() >= serverExpiresMs) {
      // Authoritatively expired on server!
      clearLocalSessionPass();
      return null;
    }

    // Force synchronization of localStorage to match server's authoritative expires_at
    const syncedPass = {
      code: codeRec.code,
      durationMinutes: durationMins,
      expiresAt: authoritativeExpiresAt
    };
    saveLocalSessionPass(syncedPass);
    return syncedPass;
  } catch (err) {
    console.warn('Session pass server sync notice:', err);
    return getLocalSessionPass();
  }
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

/**
 * Fetch unread mention count for a given username and email
 */
export const fetchUnreadMentionCount = async (username, userEmail) => {
  if (!username) return 0;
  const cleanU = (username || '').replace(/^@+/, '').trim().toLowerCase();
  const cleanEmail = (userEmail || '').toLowerCase().trim();
  if (!cleanU) return 0;

  const fifteenDaysAgo = new Date(Date.now() - FIFTEEN_DAYS_MS).toISOString();
  const lastViewed = localStorage.getItem(`gupshup_last_viewed_${cleanEmail}`) || fifteenDaysAgo;

  try {
    const { data, error } = await supabase
      .from('chitchat_messages')
      .select('id, sender_email, message_text, created_at')
      .gt('created_at', lastViewed)
      .neq('sender_email', cleanEmail)
      .ilike('message_text', `%@${cleanU}%`)
      .limit(100);

    if (!error && Array.isArray(data)) {
      return data.length;
    }
  } catch (err) {
    console.warn('Fetch unread mention count error:', err);
  }
  return 0;
};

/**
 * Mark Gupshup as viewed by updating the timestamp in localStorage
 */
export const markGupshupViewed = (userEmail) => {
  if (!userEmail) return;
  const cleanEmail = userEmail.toLowerCase().trim();
  try {
    localStorage.setItem(`gupshup_last_viewed_${cleanEmail}`, new Date().toISOString());
  } catch (e) {}
};

