import { supabase } from '../utils/supabase';
import { withAuthRetry } from '../utils/withAuthRetry';
import { classworkAssignments as defaultSeedTasks } from '../data/classworkData';

const LOCAL_STORAGE_KEY = 'bihar_ai_task_submissions';
const LOCAL_TASKS_KEY = 'bihar_ai_daily_tasks';

/**
 * Get all daily tasks (Admin created + Default 18 tasks)
 */
export const getDailyTasks = async () => {
  let localTasks = [];
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    localTasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local tasks:', e);
  }

  // Base list starts with default 18 assignments
  const taskMap = new Map();
  defaultSeedTasks.forEach((t) => taskMap.set(Number(t.num), t));
  localTasks.forEach((t) => taskMap.set(Number(t.num), t));

  if (!supabase) {
    return Array.from(taskMap.values()).sort((a, b) => a.num - b.num);
  }

  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('is_active', true)
      .order('num', { ascending: true });

    if (!error && data && data.length > 0) {
      const formatted = data.map((t) => ({
        num: t.num,
        toolName: t.tool_name,
        title: t.title,
        classwork: t.classwork,
        instructions: t.instructions,
        finalSubmission: Array.isArray(t.final_submission)
          ? t.final_submission
          : typeof t.final_submission === 'string'
          ? JSON.parse(t.final_submission || '[]')
          : [],
        category: t.category || 'AI Practical Classwork',
        id: t.id,
      }));

      formatted.forEach((t) => taskMap.set(Number(t.num), t));
      const merged = Array.from(taskMap.values()).sort((a, b) => a.num - b.num);
      try {
        localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }
  } catch (err) {
    console.warn('Supabase daily_tasks fetch failed, using local/default tasks:', err);
  }

  return Array.from(taskMap.values()).sort((a, b) => a.num - b.num);
};

/**
 * Save or Update a Daily Task (For Admin)
 */
export const saveDailyTask = async (taskData) => {
  const num = Number(taskData.num);
  const toolName = taskData.toolName || taskData.tool_name || 'AI Tool';
  const title = taskData.title || 'Practical Exercise';
  const classwork = taskData.classwork || '';
  const instructions = taskData.instructions || '';
  const finalSubmission = Array.isArray(taskData.finalSubmission)
    ? taskData.finalSubmission
    : typeof taskData.finalSubmission === 'string'
    ? taskData.finalSubmission.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];
  const category = taskData.category || 'AI Practical Classwork';

  const cleanTask = {
    num,
    toolName,
    title,
    classwork,
    instructions,
    finalSubmission,
    category,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  // 1. Update local cache
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    const existingList = raw ? JSON.parse(raw) : [...defaultSeedTasks];
    const idx = existingList.findIndex((t) => Number(t.num) === num);
    if (idx >= 0) {
      existingList[idx] = { ...existingList[idx], ...cleanTask };
    } else {
      existingList.push(cleanTask);
    }
    existingList.sort((a, b) => a.num - b.num);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(existingList));
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
  } catch (e) {
    console.error('Error saving local task:', e);
  }

  // 2. Sync to Supabase
  if (supabase) {
    try {
      await supabase.from('daily_tasks').upsert(
        {
          num,
          tool_name: toolName,
          title,
          classwork,
          instructions,
          final_submission: finalSubmission,
          category,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'num' }
      );
    } catch (err) {
      console.warn('Supabase daily_tasks upsert error:', err);
    }
  }

  return cleanTask;
};

/**
 * Delete / Deactivate a Daily Task (For Admin)
 */
export const deleteDailyTask = async (taskNum) => {
  const num = Number(taskNum);

  // 1. Update local cache
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    let list = raw ? JSON.parse(raw) : [...defaultSeedTasks];
    list = list.filter((t) => Number(t.num) !== num);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
  } catch (e) {
    console.error('Error removing local task:', e);
  }

  // 2. Sync to Supabase
  if (supabase) {
    try {
      await supabase.from('daily_tasks').delete().eq('num', num);
    } catch (err) {
      console.warn('Supabase daily_tasks delete error:', err);
    }
  }

  return { success: true, num };
};

/**
 * Get all local submissions cached in browser
 */
export const getLocalTaskSubmissions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading local task submissions:', e);
    return [];
  }
};

/**
 * Save submissions array to localStorage
 */
export const setLocalTaskSubmissions = (subs) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subs));
  } catch (e) {
    console.error('Error saving local task submissions:', e);
  }
};

/**
 * Upload task file directly to Supabase Storage (100% Free, Open Source, Permanent URLs)
 * Falls back to local object URL if offline
 */
export const uploadFileToDrive = async ({ file, userName, userEmail, taskTitle }) => {
  // Client-side 50MB check for dedicated server, 10MB fallback
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress or reduce file size.`);
  }

  const formattedSize = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : `${(file.size / 1024).toFixed(1)} KB`;

  // 1. First priority: Dedicated 24/7 Local / Cloudflare Storage Server
  const rawServerUrl = process.env.REACT_APP_STORAGE_SERVER_URL || 'https://tennis-stronger-trademark-dinner.trycloudflare.com';
  if (rawServerUrl) {
    try {
      const cleanServerUrl = rawServerUrl.replace(/\/+$/, '');
      const uploadEndpoint = cleanServerUrl.endsWith('/upload') || cleanServerUrl.endsWith('/api/upload')
        ? cleanServerUrl
        : `${cleanServerUrl}/upload`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userName', userName || 'Candidate');
      formData.append('userEmail', userEmail || 'candidate');
      formData.append('taskTitle', taskTitle || 'Assignment');

      console.log('📡 Attempting upload to Storage Server:', uploadEndpoint);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const res = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        const data = await res.json();
        if (data.fileUrl) {
          console.log('✅ File successfully uploaded to Dedicated 24/7 Storage Server (100GB Disk):', data.fileUrl);
          return {
            fileUrl: data.fileUrl,
            fileName: data.fileName || file.name,
            fileSize: data.fileSize || formattedSize,
            driveFileId: null,
          };
        }
      } else {
        const errText = await res.text().catch(() => 'Server error');
        console.warn(`Storage server returned HTTP ${res.status}:`, errText);
      }
    } catch (serverErr) {
      console.warn('Dedicated storage server attempt failed, falling back to Supabase:', serverErr.message);
    }
  }

  // 2. Second priority: Upload directly to Supabase Storage (Bucket: task-submissions)
  if (supabase && supabase.storage) {
    try {
      const cleanEmail = String(userEmail || 'candidate').replace(/[^a-zA-Z0-9]/g, '_');
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const storagePath = `${cleanEmail}/${Date.now()}_${cleanFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('task-submissions')
          .getPublicUrl(storagePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          console.log('✅ File uploaded to Supabase Storage:', publicUrlData.publicUrl);
          return {
            fileUrl: publicUrlData.publicUrl,
            fileName: file.name,
            fileSize: formattedSize,
            driveFileId: null,
          };
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload notice:', uploadError.message);
      }
    } catch (supaErr) {
      console.warn('Supabase storage upload error:', supaErr.message);
    }
  }

  // 3. Fallback: Local object preview for offline testing
  return {
    fileUrl: URL.createObjectURL(file),
    fileName: file.name,
    fileSize: formattedSize,
    driveFileId: `local-${Date.now()}`,
  };
};

/**
 * Fetch all task submissions for a particular user
 */
export const getUserTaskSubmissions = async (userEmail) => {
  if (!userEmail) return [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .ilike('user_email', String(userEmail).trim())
        .order('created_at', { ascending: false });

      if (!error) {
        const remoteSubs = data || [];
        // Update local cache so it matches database precisely
        try {
          const currentAll = getLocalTaskSubmissions().filter(
            (s) => s.user_email && s.user_email.toLowerCase() !== String(userEmail).toLowerCase()
          );
          setLocalTaskSubmissions([...currentAll, ...remoteSubs]);
        } catch (e) {}
        return remoteSubs;
      }
    } catch (err) {
      console.warn('Supabase task fetch failed, falling back to local cache:', err);
    }
  }

  return getLocalTaskSubmissions().filter(
    (s) => s.user_email && s.user_email.toLowerCase() === String(userEmail || '').toLowerCase()
  );
};

/**
 * Fetch ALL task submissions across all candidates (for Admin Dashboard)
 */
export const getAllTaskSubmissions = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        // Update local storage to match database truth
        try {
          setLocalTaskSubmissions(data || []);
        } catch (e) {}
        return data || [];
      }
    } catch (err) {
      console.warn('Supabase admin task fetch error, falling back to local cache:', err);
    }
  }

  return getLocalTaskSubmissions();
};

/**
 * Delete a stored file from Dedicated Storage Server and/or Supabase Storage
 */
export const deleteStoredFile = async ({ fileUrl, fileName }) => {
  if (!fileUrl && !fileName) return false;

  // 1. Delete from Dedicated 24/7 Storage Server (Cloudflare tunnel or local IP)
  const dedicatedServerUrl = process.env.REACT_APP_STORAGE_SERVER_URL || 'https://tennis-stronger-trademark-dinner.trycloudflare.com';
  if (dedicatedServerUrl && (fileUrl?.includes('/files/') || fileName)) {
    try {
      const cleanServerUrl = dedicatedServerUrl.replace(/\/+$/, '');
      const deleteEndpoint = `${cleanServerUrl}/delete-file`;
      await fetch(deleteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, fileName }),
      });
      console.log('🗑️ Successfully deleted previous file from Dedicated 24/7 Storage Server:', fileName || fileUrl);
    } catch (err) {
      console.warn('Failed to delete file from dedicated storage server:', err.message);
    }
  }

  // 2. Delete from Supabase Storage bucket (if stored there)
  if (supabase && supabase.storage && fileUrl && fileUrl.includes('task-submissions')) {
    try {
      const parts = fileUrl.split('/task-submissions/');
      if (parts.length > 1) {
        const storagePath = decodeURIComponent(parts[1]);
        await supabase.storage.from('task-submissions').remove([storagePath]);
        console.log('🗑️ Successfully deleted file from Supabase Storage:', storagePath);
      }
    } catch (supaErr) {
      console.warn('Failed to delete file from Supabase storage:', supaErr.message);
    }
  }

  return true;
};

/**
 * Submit or Re-submit a task (uploads file to storage server and automatically purges old file on resubmit)
 */
export const submitTaskWork = async ({
  user,
  taskId,
  taskTitle,
  category,
  file,
  notes,
}) => {
  const userEmail = user?.email || 'candidate@biharaimission.org';
  const userName = user?.fullName || user?.full_name || 'Civic Candidate';
  const userDistrict = user?.district || 'Bihar';
  const userDesignation = user?.designation || user?.role_type || user?.role || 'Civic Participant';

  // 1. Check if there was an existing submission with a file to replace
  const allSubs = getLocalTaskSubmissions();
  const existingSub = allSubs.find(
    (s) =>
      Number(s.task_id) === Number(taskId) &&
      s.user_email &&
      s.user_email.toLowerCase() === userEmail.toLowerCase()
  );

  // If a new file is uploaded and an old file existed, delete the old file from server & Supabase
  if (file && existingSub && existingSub.file_url) {
    console.log('🔄 Replacing existing file. Cleaning up old file from storage server...');
    await deleteStoredFile({
      fileUrl: existingSub.file_url,
      fileName: existingSub.file_name,
    });
  }

  let fileData = null;
  if (file) {
    fileData = await uploadFileToDrive({
      file,
      userName,
      userEmail,
      taskTitle: taskTitle || `Task-${taskId}`,
    });
  }

  const newSubmission = {
    id: existingSub?.id || `sub_${Date.now()}_${taskId}`,
    user_id: user?.id || `user_${Date.now()}`,
    user_email: userEmail,
    user_name: userName,
    user_district: userDistrict,
    user_designation: userDesignation,
    task_id: Number(taskId),
    task_title: taskTitle,
    category: category || 'Practical Classwork',
    file_url: fileData ? fileData.fileUrl : existingSub?.file_url || null,
    file_name: fileData ? fileData.fileName : existingSub?.file_name || null,
    file_size: fileData ? fileData.fileSize : existingSub?.file_size || null,
    drive_file_id: fileData ? fileData.driveFileId : existingSub?.drive_file_id || null,
    notes: notes !== undefined ? notes : existingSub?.notes || '',
    status: 'PENDING', // Reset to PENDING for admin review
    admin_feedback: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: existingSub?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Update localStorage
  const existingIdx = allSubs.findIndex(
    (s) =>
      Number(s.task_id) === Number(taskId) &&
      s.user_email &&
      s.user_email.toLowerCase() === userEmail.toLowerCase()
  );

  if (existingIdx >= 0) {
    allSubs[existingIdx] = { ...allSubs[existingIdx], ...newSubmission };
  } else {
    allSubs.unshift(newSubmission);
  }
  setLocalTaskSubmissions(allSubs);

  // Dispatch events for immediate real-time UI updates
  try {
    window.dispatchEvent(new CustomEvent('bihar_ai_task_submitted', { detail: newSubmission }));
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
  } catch (e) {}

  // Sync to Supabase with silent 401 retry
  if (supabase) {
    try {
      await withAuthRetry(
        () =>
          supabase.from('daily_task_submissions').upsert(
            {
              user_email: userEmail,
              user_name: userName,
              user_district: userDistrict,
              task_id: Number(taskId),
              task_title: taskTitle,
              category: category || 'Practical Classwork',
              file_url: newSubmission.file_url,
              file_name: newSubmission.file_name,
              file_size: newSubmission.file_size,
              drive_file_id: newSubmission.drive_file_id,
              notes: newSubmission.notes,
              status: 'PENDING',
              admin_feedback: null,
              reviewed_by: null,
              reviewed_at: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_email,task_id' }
          ),
        { isWrite: true, idempotent: true }
      );
    } catch (err) {
      console.warn('Supabase task submission upsert error:', err);
    }
  }

  return newSubmission;
};

/**
 * Review a task submission (Approve or Reject with feedback)
 * When rejected: automatically purges the invalid file from the storage server & Supabase
 */
export const reviewTaskSubmission = async ({
  submissionId,
  userEmail,
  taskId,
  status, // 'APPROVED' | 'REJECTED'
  adminFeedback,
  reviewedBy,
}) => {
  const allSubs = getLocalTaskSubmissions();
  const existingSub = allSubs.find(
    (s) =>
      s.id === submissionId ||
      (Number(s.task_id) === Number(taskId) &&
        s.user_email &&
        s.user_email.toLowerCase() === String(userEmail || '').toLowerCase())
  );

  // If rejecting, remove the file from storage server so disk space is freed up
  if (status === 'REJECTED' && existingSub && existingSub.file_url) {
    console.log('🗑️ Task rejected by admin. Deleting rejected file from storage server...');
    await deleteStoredFile({
      fileUrl: existingSub.file_url,
      fileName: existingSub.file_name,
    });
  }

  const updatedFields = {
    status,
    admin_feedback: adminFeedback || null,
    reviewed_by: reviewedBy || 'Admin',
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Clear file details on rejection so candidate must submit clean replacement
    ...(status === 'REJECTED'
      ? { file_url: null, file_name: null, file_size: null, drive_file_id: null }
      : {}),
  };

  // 1. Update local storage
  const index = allSubs.findIndex(
    (s) =>
      s.id === submissionId ||
      (Number(s.task_id) === Number(taskId) &&
        s.user_email &&
        s.user_email.toLowerCase() === String(userEmail || '').toLowerCase())
  );

  if (index >= 0) {
    allSubs[index] = { ...allSubs[index], ...updatedFields };
    setLocalTaskSubmissions(allSubs);
  }

  // 2. Update Supabase
  if (supabase) {
    try {
      if (submissionId && !submissionId.startsWith('sub_')) {
        await supabase
          .from('daily_task_submissions')
          .update(updatedFields)
          .eq('id', submissionId);
      } else {
        await supabase
          .from('daily_task_submissions')
          .update(updatedFields)
          .eq('user_email', userEmail)
          .eq('task_id', Number(taskId));
      }
    } catch (err) {
      console.warn('Supabase task review error:', err);
    }
  }

  // Dispatch update event
  try {
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
  } catch (e) {}

  return { success: true, status, adminFeedback };
};

/**
 * Completely delete a task submission (removes record from DB and deletes file from storage server)
 */
export const deleteTaskSubmission = async ({ submissionId, userEmail, taskId, fileUrl, fileName }) => {
  // 1. Delete file from storage server
  await deleteStoredFile({ fileUrl, fileName });

  // 2. Delete from local storage
  const allSubs = getLocalTaskSubmissions();
  const filtered = allSubs.filter(
    (s) =>
      !(
        s.id === submissionId ||
        (Number(s.task_id) === Number(taskId) &&
          s.user_email &&
          s.user_email.toLowerCase() === String(userEmail || '').toLowerCase())
      )
  );
  setLocalTaskSubmissions(filtered);

  // 3. Delete from Supabase
  if (supabase) {
    try {
      if (submissionId && !submissionId.startsWith('sub_')) {
        await supabase.from('daily_task_submissions').delete().eq('id', submissionId);
      } else {
        await supabase
          .from('daily_task_submissions')
          .delete()
          .eq('user_email', userEmail)
          .eq('task_id', Number(taskId));
      }
    } catch (err) {
      console.warn('Supabase task delete error:', err);
    }
  }

  // Dispatch update event
  try {
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
  } catch (e) {}

  return { success: true };
};

/**
 * Get Submission Leaderboard — aggregated by user, sorted by most submissions
 * Returns: [{ rank, email, name, designation, organization, district, total, approved, pending, rejected, tasks, latestTask, lastSubmission }]
 */
export const getSubmissionLeaderboard = (allSubmissions, userDetailsMap = {}) => {
  const userMap = new Map();

  (allSubmissions || []).forEach((sub) => {
    const email = (sub.user_email || '').toLowerCase().trim();
    if (!email) return;

    const uDet = userDetailsMap[email] || {};

    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        name: sub.user_name || uDet.full_name || email.split('@')[0],
        designation:
          sub.user_designation ||
          uDet.designation ||
          uDet.role_type ||
          'Civic Participant',
        organization: uDet.organization || uDet.department || '',
        district: sub.user_district || uDet.district || 'Bihar',
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        tasks: [],
        latestTask: null,
        lastSubmission: sub.updated_at || sub.created_at || '',
      });
    }

    const entry = userMap.get(email);
    entry.total += 1;

    const status = (sub.status || 'PENDING').toUpperCase();
    if (status === 'APPROVED') entry.approved += 1;
    else if (status === 'REJECTED') entry.rejected += 1;
    else entry.pending += 1;

    // Track detailed task uploaded
    const taskItem = {
      taskId: Number(sub.task_id),
      taskTitle: sub.task_title || `Task #${sub.task_id}`,
      status,
      fileName: sub.file_name || null,
      fileUrl: sub.file_url || null,
      submittedAt: sub.updated_at || sub.created_at || '',
    };
    entry.tasks.push(taskItem);

    // Track most recent submission
    const subDate = sub.updated_at || sub.created_at || '';
    if (!entry.latestTask || subDate >= entry.lastSubmission) {
      entry.lastSubmission = subDate;
      entry.latestTask = taskItem;
    }

    // Refresh name/district/designation if better data available
    if (sub.user_name && sub.user_name !== email.split('@')[0]) {
      entry.name = sub.user_name;
    }
    if (sub.user_designation && sub.user_designation !== 'Civic Participant') {
      entry.designation = sub.user_designation;
    } else if (uDet.designation) {
      entry.designation = uDet.designation;
    }
    if (sub.user_district && sub.user_district !== 'Bihar') {
      entry.district = sub.user_district;
    } else if (uDet.district) {
      entry.district = uDet.district;
    }
  });

  return Array.from(userMap.values())
    .sort((a, b) => b.approved - a.approved || b.total - a.total)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
};

/**
 * Fetch Real-time Leaderboard with Candidate Designations and Task Details
 * Queries both daily_task_submissions and user_details from Supabase
 */
export const fetchRealtimeLeaderboardData = async () => {
  let allSubs = [];
  let userDetailsMap = {};

  // 1. Fetch all submissions (Remote Supabase or Local Fallback)
  if (supabase) {
    try {
      const { data: subsData, error: subsError } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!subsError && Array.isArray(subsData)) {
        allSubs = subsData;
        setLocalTaskSubmissions(subsData);
      } else {
        allSubs = getLocalTaskSubmissions();
      }
    } catch (e) {
      allSubs = getLocalTaskSubmissions();
    }

    // 2. Fetch user profile details for rich designations & organizations
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('user_details')
        .select('email, full_name, designation, role_type, organization, department, district');

      if (!usersError && Array.isArray(usersData)) {
        usersData.forEach((u) => {
          if (u.email) {
            userDetailsMap[u.email.toLowerCase().trim()] = u;
          }
        });
      }
    } catch (e) {
      console.warn('Error fetching user_details for leaderboard:', e);
    }
  } else {
    allSubs = getLocalTaskSubmissions();
  }

  // Also merge any local profile cache if available
  try {
    const localUser = JSON.parse(localStorage.getItem('bihar_ai_user') || '{}');
    if (localUser.email) {
      const em = localUser.email.toLowerCase().trim();
      userDetailsMap[em] = {
        ...(userDetailsMap[em] || {}),
        full_name: localUser.fullName || localUser.full_name,
        designation: localUser.designation,
        district: localUser.district,
      };
    }
  } catch (e) {}

  return getSubmissionLeaderboard(allSubs, userDetailsMap);
};

/**
 * Realtime Subscription for Leaderboard
 * Listens to Supabase postgres_changes on daily_task_submissions & user_details
 * Returns an unsubscribe callback function
 */
export const subscribeToLeaderboardRealtime = (onUpdateCallback) => {
  let channel = null;

  const refreshAndNotify = async () => {
    try {
      const updated = await fetchRealtimeLeaderboardData();
      if (typeof onUpdateCallback === 'function') {
        onUpdateCallback(updated);
      }
    } catch (e) {
      console.warn('Error in real-time leaderboard update:', e);
    }
  };

  if (supabase) {
    try {
      channel = supabase
        .channel('public:daily_task_submissions_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_task_submissions' },
          () => refreshAndNotify()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_details' },
          () => refreshAndNotify()
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime subscription error:', err);
    }
  }

  // Also listen to local window events
  window.addEventListener('bihar_ai_task_submitted', refreshAndNotify);
  window.addEventListener('bihar_ai_tasks_updated', refreshAndNotify);
  window.addEventListener('bihar_ai_profile_updated', refreshAndNotify);

  // Return unsubscribe cleanup handler
  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    window.removeEventListener('bihar_ai_task_submitted', refreshAndNotify);
    window.removeEventListener('bihar_ai_tasks_updated', refreshAndNotify);
    window.removeEventListener('bihar_ai_profile_updated', refreshAndNotify);
  };
};
