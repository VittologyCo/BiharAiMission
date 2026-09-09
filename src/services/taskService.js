import { supabase } from '../utils/supabase';
import { withAuthRetry } from '../utils/withAuthRetry';
import { classworkAssignments as defaultSeedTasks } from '../data/classworkData';

const LOCAL_STORAGE_KEY = 'bihar_ai_task_submissions';
const LOCAL_TASKS_KEY = 'bihar_ai_daily_tasks';

/**
 * Validates if a string matches standard RFC-4122 UUID format
 */
export const isValidUUID = (str) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());

/**
 * High-entropy RFC-4122 UUID v4 generator with fallbacks
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

let dynamicStorageUrl = null;

/**
 * Resolves the active storage server URL asynchronously.
 * 1. Checks build-time environment variable (all common naming variations)
 * 2. If not found or empty, fetches fresh runtime config from Cloudflare (/api/config)
 */
export const resolveStorageServerUrl = async () => {
  const envUrl = (
    process.env.REACT_APP_STORAGE_SERVER_URL ||
    process.env['REACT_APP_STORAGE_SER\\'] ||
    process.env.REACT_APP_STORAGE_SER ||
    process.env.REACT_APP_STORAGE_SERVER ||
    process.env.STORAGE_SERVER_URL ||
    ''
  ).trim();

  if (envUrl && !envUrl.includes('trycloudflare.com')) {
    return envUrl.replace(/\/+$/, '');
  }

  // Only return cached dynamic URL if it is a valid non-empty string
  if (dynamicStorageUrl && typeof dynamicStorageUrl === 'string' && dynamicStorageUrl.trim()) {
    return dynamicStorageUrl;
  }

  try {
    const res = await fetch(`/api/config?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.storageServerUrl && !data.storageServerUrl.includes('trycloudflare.com')) {
        dynamicStorageUrl = data.storageServerUrl.replace(/\/+$/, '');
        return dynamicStorageUrl;
      }
    }
  } catch (e) {
    console.warn('Runtime storage config fetch warning:', e);
  }

  return '';
};

/**
 * Returns the cached or synchronous storage server URL.
 */
export const getStorageServerUrl = () => {
  const envUrl = (
    process.env.REACT_APP_STORAGE_SERVER_URL ||
    process.env['REACT_APP_STORAGE_SER\\'] ||
    process.env.REACT_APP_STORAGE_SER ||
    process.env.REACT_APP_STORAGE_SERVER ||
    process.env.STORAGE_SERVER_URL ||
    ''
  ).trim();

  if (envUrl && !envUrl.includes('trycloudflare.com')) {
    return envUrl.replace(/\/+$/, '');
  }
  return dynamicStorageUrl || '';
};

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

    if (!error && Array.isArray(data) && data.length > 0) {
      const dbMap = new Map();
      data.forEach((t) => {
        dbMap.set(Number(t.num), {
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
          _synced: true,
        });
      });

      // Start with default seed tasks merged with Supabase versions
      const mergedMap = new Map();
      defaultSeedTasks.forEach((t) => {
        const num = Number(t.num);
        mergedMap.set(num, dbMap.has(num) ? dbMap.get(num) : t);
      });
      // Add any additional tasks created in Supabase
      dbMap.forEach((val, num) => {
        mergedMap.set(num, val);
      });

      const merged = Array.from(mergedMap.values()).sort((a, b) => a.num - b.num);
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
 * Delete a Daily Task AND cascade-delete all user submissions + uploaded files for it.
 * Steps:
 *   1. Fetch all daily_task_submissions for this task_id
 *   2. Delete each uploaded file from storage server + Supabase bucket
 *   3. Bulk-delete all submission rows from daily_task_submissions
 *   4. Remove task + submissions from localStorage
 *   5. Delete the daily_tasks row itself
 *   6. Dispatch events so all open user/admin tabs refresh via existing realtime channels
 */
export const deleteDailyTask = async (taskNum) => {
  const num = Number(taskNum);

  // ── STEP 1: Fetch all submissions for this task ────────────────────
  let submissionsForTask = [];
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_task_submissions')
        .select('id, user_email, file_url, file_name')
        .eq('task_id', num);
      if (!error && Array.isArray(data)) {
        submissionsForTask = data;
      }
    } catch (e) {
      console.warn(`[deleteDailyTask] Could not fetch submissions for task #${num}:`, e);
    }
  }

  // ── STEP 2: Delete uploaded files from storage server + Supabase bucket ──
  if (submissionsForTask.length > 0) {
    const fileDeletePromises = submissionsForTask
      .filter((s) => s.file_url || s.file_name)
      .map((s) =>
        deleteStoredFile({ fileUrl: s.file_url, fileName: s.file_name }).catch((e) =>
          console.warn(`[deleteDailyTask] File delete warning for submission ${s.id}:`, e)
        )
      );
    // Also delete from Supabase Storage bucket if stored there
    const supabaseFileRemoves = submissionsForTask
      .filter((s) => s.file_url && s.file_url.includes('task-submissions'))
      .map((s) => {
        try {
          const parts = s.file_url.split('task-submissions/');
          if (parts[1]) {
            const filePath = decodeURIComponent(parts[1].split('?')[0]);
            return supabase.storage.from('task-submissions').remove([filePath]);
          }
        } catch (e) {}
        return Promise.resolve();
      });
    await Promise.allSettled([...fileDeletePromises, ...supabaseFileRemoves]);
  }

  // ── STEP 3: Bulk-delete all submission rows from Supabase ──────────
  if (supabase && submissionsForTask.length > 0) {
    try {
      await supabase
        .from('daily_task_submissions')
        .delete()
        .eq('task_id', num);
      console.log(`[deleteDailyTask] Deleted ${submissionsForTask.length} submission(s) for task #${num}`);
    } catch (err) {
      console.warn(`[deleteDailyTask] Bulk submission delete warning for task #${num}:`, err);
    }
  }

  // ── STEP 4: Remove task + related submissions from localStorage ────
  try {
    // Remove the task itself
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    let list = raw ? JSON.parse(raw) : [...defaultSeedTasks];
    list = list.filter((t) => Number(t.num) !== num);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(list));

    // Remove all submissions for this task from localStorage
    const allLocalSubs = getLocalTaskSubmissions();
    const filteredSubs = allLocalSubs.filter((s) => Number(s.task_id) !== num);
    setLocalTaskSubmissions(filteredSubs);
  } catch (e) {
    console.error('[deleteDailyTask] Error updating localStorage:', e);
  }

  // ── STEP 5: Delete the daily_tasks row from Supabase ──────────────
  if (supabase) {
    try {
      await supabase.from('daily_tasks').delete().eq('num', num);
    } catch (err) {
      console.warn('Supabase daily_tasks delete error:', err);
    }
  }

  // ── STEP 6: Dispatch events so all open tabs refresh instantly ─────
  // (AIClasswork + AdminDashboard already listen to these)
  try {
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
    window.dispatchEvent(new Event('bihar_ai_task_submitted'));
  } catch (e) {}

  return { success: true, num, deletedSubmissions: submissionsForTask.length };
};

/**
 * Get all local submissions cached in browser, upgrading any legacy IDs to valid UUIDs
 */
export const getLocalTaskSubmissions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        const cleaned = parsed.map((s) => {
          if (s && (!s.id || !isValidUUID(s.id))) {
            changed = true;
            return { ...s, id: generateUUID() };
          }
          return s;
        });
        if (changed) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
          } catch (e) {}
        }
        return cleaned;
      }
    }
    return [];
  } catch (e) {
    console.error('Error reading local task submissions:', e);
    return [];
  }
};

/**
 * Save submissions array to localStorage, ensuring all IDs are valid UUIDs
 */
export const setLocalTaskSubmissions = (subs) => {
  try {
    const safeSubs = Array.isArray(subs)
      ? subs.map((s) => {
          if (s && (!s.id || !isValidUUID(s.id))) {
            return { ...s, id: generateUUID() };
          }
          return s;
        })
      : [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeSubs));
  } catch (e) {
    console.error('Error saving local task submissions:', e);
  }
};

/**
 * Upload task file directly to Supabase Storage (100% Free, Open Source, Permanent URLs)
 * Falls back to local object URL if offline
 */
export const uploadFileToDrive = async ({ file, userName, userEmail, taskTitle, oldFileUrl, oldFileName }) => {
  // Client-side 50MB check for dedicated server, 10MB fallback
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress or reduce file size.`);
  }

  const formattedSize = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : `${(file.size / 1024).toFixed(1)} KB`;

  // 1. First priority: Dedicated 24/7 Local / Ngrok Storage Server
  const rawServerUrl = await resolveStorageServerUrl();
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
      if (oldFileUrl) formData.append('oldFileUrl', oldFileUrl);
      if (oldFileName) formData.append('oldFileName', oldFileName);

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
  const cleanEmail = String(userEmail).toLowerCase().trim();

  // 1. Read existing local submissions for this user
  const allLocal = getLocalTaskSubmissions();
  const userLocal = allLocal.filter(
    (s) => s.user_email && s.user_email.toLowerCase() === cleanEmail
  );

  // 2. Fetch remote submissions from Supabase if online
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .ilike('user_email', cleanEmail)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Supabase is authoritative!
        // Only keep local submissions that are actively pending sync (< 60s old)
        const now = Date.now();
        const pendingLocal = userLocal.filter((s) => {
          if (!s._pendingSync) return false;
          const age = now - new Date(s.updated_at || s.created_at || 0).getTime();
          return age < 60000;
        });

        const mergedMap = new Map();
        data.forEach((sub) => {
          mergedMap.set(Number(sub.task_id), { ...sub, _synced: true });
        });

        pendingLocal.forEach((localSub) => {
          const tId = Number(localSub.task_id);
          if (!mergedMap.has(tId)) {
            mergedMap.set(tId, localSub);
          }
        });

        const mergedSubs = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0)
        );

        // Update local storage so deleted records in Supabase are purged from local storage too
        try {
          const otherUserSubs = allLocal.filter(
            (s) => !s.user_email || s.user_email.toLowerCase() !== cleanEmail
          );
          setLocalTaskSubmissions([...otherUserSubs, ...mergedSubs]);
        } catch (e) {}

        return mergedSubs;
      }
    } catch (err) {
      console.warn('Supabase task fetch failed, falling back to local cache:', err);
    }
  }

  return userLocal;
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

      if (!error && Array.isArray(data)) {
        // Supabase is authoritative!
        // Only keep local submissions that are actively pending sync (< 60s old)
        const now = Date.now();
        const pendingLocal = getLocalTaskSubmissions().filter((s) => {
          if (!s._pendingSync) return false;
          const age = now - new Date(s.updated_at || s.created_at || 0).getTime();
          return age < 60000;
        });

        const mergedMap = new Map();
        data.forEach((sub) => {
          const key = `${(sub.user_email || '').toLowerCase()}_${sub.task_id}`;
          mergedMap.set(key, { ...sub, _synced: true });
        });

        pendingLocal.forEach((sub) => {
          const key = `${(sub.user_email || '').toLowerCase()}_${sub.task_id}`;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, sub);
          }
        });

        const allMerged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0)
        );

        // Purge any submissions that were deleted from Supabase from local storage too
        try {
          setLocalTaskSubmissions(allMerged);
        } catch (e) {}

        return allMerged;
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

  // 1. Delete from Dedicated 24/7 Storage Server (Ngrok tunnel or local IP)
  const dedicatedServerUrl = await resolveStorageServerUrl();
  if (dedicatedServerUrl && (fileUrl?.includes('/files/') || fileName)) {
    try {
      const cleanServerUrl = dedicatedServerUrl.replace(/\/+$/, '');
      const deleteEndpoint = `${cleanServerUrl}/delete-file`;
      await fetch(deleteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      oldFileUrl: existingSub?.file_url || null,
      oldFileName: existingSub?.file_name || null,
    });
  }

  const submissionId = existingSub?.id && isValidUUID(existingSub.id) ? existingSub.id : generateUUID();
  const submissionUserId = (user?.id && isValidUUID(user.id)) ? user.id : null;

  const newSubmission = {
    id: submissionId,
    user_id: submissionUserId || submissionId,
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
    _pendingSync: true,
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

  // Multi-tier Supabase Sync
  if (supabase) {
    let authUserId = (user?.id && isValidUUID(user.id)) ? user.id : null;
    let authEmail = (userEmail || '').toLowerCase().trim();
    try {
      const sessionRes = await supabase.auth.getSession();
      if (sessionRes?.data?.session?.user) {
        if (sessionRes.data.session.user.id && isValidUUID(sessionRes.data.session.user.id)) {
          authUserId = sessionRes.data.session.user.id;
        }
        authEmail = sessionRes.data.session.user.email?.toLowerCase().trim() || authEmail;
      }
    } catch (e) {}

    const submissionPayload = {
      id: submissionId,
      ...(authUserId ? { user_id: authUserId } : {}),
      user_email: authEmail,
      user_name: userName,
      user_district: userDistrict,
      user_designation: userDesignation,
      task_id: Number(taskId),
      task_title: taskTitle,
      category: category || 'AI Practical Classwork',
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
    };

    let remoteSaved = false;

    // Strategy A: SECURITY DEFINER RPC (bypasses RLS smoothly)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_candidate_task', {
        submission_data: submissionPayload,
      });
      if (!rpcError && rpcData?.success) {
        remoteSaved = true;
        newSubmission._synced = true;
        delete newSubmission._pendingSync;
        if (rpcData?.submission?.id) {
          newSubmission.id = rpcData.submission.id;
        }
        console.log('✅ Task submission persisted via submit_candidate_task RPC');
      } else if (rpcError) {
        console.warn('RPC submit_candidate_task warning:', rpcError.message || rpcError);
      }
    } catch (rpcEx) {
      console.warn('RPC submit_candidate_task notice:', rpcEx?.message || rpcEx);
    }

    // Strategy B: Direct public.daily_task_submissions upsert with resilient fallback
    if (!remoteSaved) {
      try {
        const { data: upsertData, error: upsertErr } = await withAuthRetry(
          () =>
            supabase
              .from('daily_task_submissions')
              .upsert(submissionPayload, { onConflict: 'user_email,task_id' })
              .select('*'),
          { isWrite: true, idempotent: true }
        );

        if (!upsertErr) {
          remoteSaved = true;
          newSubmission._synced = true;
          delete newSubmission._pendingSync;
          if (Array.isArray(upsertData) && upsertData[0]?.id) {
            newSubmission.id = upsertData[0].id;
          }
          console.log('✅ Task submission persisted via direct upsert');
        } else {
          console.warn('Supabase task direct upsert with ID warning:', upsertErr.message);

          // Fallback: upsert WITHOUT id property so Postgres column DEFAULT gen_random_uuid() handles it
          const noIdPayload = { ...submissionPayload };
          delete noIdPayload.id;

          const { data: fallbackData, error: fallbackErr } = await supabase
            .from('daily_task_submissions')
            .upsert(noIdPayload, { onConflict: 'user_email,task_id' })
            .select('*');

          if (!fallbackErr) {
            remoteSaved = true;
            newSubmission._synced = true;
            delete newSubmission._pendingSync;
            if (Array.isArray(fallbackData) && fallbackData[0]?.id) {
              newSubmission.id = fallbackData[0].id;
            }
            console.log('✅ Task submission persisted via direct fallback upsert');
          } else {
            console.warn('Supabase task direct fallback upsert error:', fallbackErr.message);
          }
        }
      } catch (err) {
        console.warn('Supabase task submission sync note (saved locally):', err?.message || err);
      }
    }

    if (remoteSaved) {
      try {
        const currentSubs = getLocalTaskSubmissions();
        const subIndex = currentSubs.findIndex(
          (s) =>
            s.id === newSubmission.id ||
            (Number(s.task_id) === Number(taskId) &&
              (s.user_email || '').toLowerCase() === authEmail.toLowerCase())
        );
        if (subIndex >= 0) {
          currentSubs[subIndex] = { ...currentSubs[subIndex], ...newSubmission, _synced: true };
          delete currentSubs[subIndex]._pendingSync;
        } else {
          currentSubs.unshift({ ...newSubmission, _synced: true });
        }
        setLocalTaskSubmissions(currentSubs);

        window.dispatchEvent(new CustomEvent('bihar_ai_task_submitted', { detail: newSubmission }));
        window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
      } catch (e) {}
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
      if (submissionId && isValidUUID(submissionId)) {
        await supabase
          .from('daily_task_submissions')
          .update(updatedFields)
          .eq('id', submissionId);
      }
      if (userEmail && taskId) {
        await supabase
          .from('daily_task_submissions')
          .update(updatedFields)
          .ilike('user_email', String(userEmail).toLowerCase().trim())
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

  // 2. Delete file from Supabase storage bucket 'task-submissions' if exists
  if (supabase?.storage && fileUrl) {
    try {
      if (fileUrl.includes('task-submissions')) {
        const parts = fileUrl.split('task-submissions/');
        if (parts[1]) {
          const filePath = decodeURIComponent(parts[1].split('?')[0]);
          await supabase.storage.from('task-submissions').remove([filePath]);
        }
      }
    } catch (stErr) {
      console.warn('Supabase storage delete error:', stErr);
    }
  }

  // 3. Delete from local storage
  const allSubs = getLocalTaskSubmissions();
  const cleanEmail = String(userEmail || '').toLowerCase().trim();
  const filtered = allSubs.filter(
    (s) =>
      !(
        (submissionId && s.id === submissionId) ||
        (Number(s.task_id) === Number(taskId) &&
          (s.user_email || '').toLowerCase().trim() === cleanEmail)
      )
  );
  setLocalTaskSubmissions(filtered);

  // 4. Delete from Supabase
  if (supabase) {
    try {
      if (submissionId && isValidUUID(submissionId)) {
        await supabase.from('daily_task_submissions').delete().eq('id', submissionId);
      }
      if (cleanEmail && taskId) {
        await supabase
          .from('daily_task_submissions')
          .delete()
          .ilike('user_email', cleanEmail)
          .eq('task_id', Number(taskId));
      }
    } catch (err) {
      console.warn('Supabase task delete error:', err);
    }
  }

  // Dispatch update event
  try {
    window.dispatchEvent(new Event('bihar_ai_tasks_updated'));
    window.dispatchEvent(new Event('bihar_ai_task_submitted'));
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
    .sort((a, b) => (b.total - a.total) || (b.approved - a.approved) || (new Date(b.lastSubmission || 0) - new Date(a.lastSubmission || 0)))
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
};

/**
 * Fetch Real-time Leaderboard with Candidate Designations and Task Details
 * Queries both daily_task_submissions and user_details from Supabase
 */
export const fetchRealtimeLeaderboardData = async () => {
  let allSubs = [];
  let userDetailsMap = {};

  // 1. Fetch all submissions from Supabase with authoritative DB truth
  if (supabase) {
    try {
      const { data: subsData, error: subsError } = await supabase
        .from('daily_task_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!subsError && Array.isArray(subsData)) {
        const now = Date.now();
        const pendingLocal = getLocalTaskSubmissions().filter((s) => {
          if (!s._pendingSync) return false;
          const age = now - new Date(s.updated_at || s.created_at || 0).getTime();
          return age < 60000;
        });

        const mergedMap = new Map();
        subsData.forEach((sub) => {
          const key = `${(sub.user_email || '').toLowerCase()}_${sub.task_id}`;
          mergedMap.set(key, sub);
        });

        pendingLocal.forEach((sub) => {
          const key = `${(sub.user_email || '').toLowerCase()}_${sub.task_id}`;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, sub);
          }
        });

        allSubs = Array.from(mergedMap.values());
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

  // Also listen to local window & storage events
  const handleStorageChange = (e) => {
    if (!e || !e.key || e.key === LOCAL_STORAGE_KEY || e.key === 'bihar_ai_user') {
      refreshAndNotify();
    }
  };

  window.addEventListener('bihar_ai_task_submitted', refreshAndNotify);
  window.addEventListener('bihar_ai_tasks_updated', refreshAndNotify);
  window.addEventListener('bihar_ai_profile_updated', refreshAndNotify);
  window.addEventListener('storage', handleStorageChange);

  // Periodic heartbeat poll every 10s for rock-solid live update
  const pollTimer = setInterval(refreshAndNotify, 10000);

  // Return unsubscribe cleanup handler
  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    clearInterval(pollTimer);
    window.removeEventListener('bihar_ai_task_submitted', refreshAndNotify);
    window.removeEventListener('bihar_ai_tasks_updated', refreshAndNotify);
    window.removeEventListener('bihar_ai_profile_updated', refreshAndNotify);
    window.removeEventListener('storage', handleStorageChange);
  };
};
