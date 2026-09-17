import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { fetchChitChatGroups, formatMessageTime, formatTimeRemaining, getChitChatStorageServerUrl } from '../../services/chitchatService';
import { useToast } from '../../context/ToastContext';
import styles from './AdminChitChatHub.module.css';

export default function AdminChitChatHub() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('codes'); // 'codes' | 'groups' | 'oversight' | 'purge'
  const [nowTick, setNowTick] = useState(Date.now());

  // ─── 1. TIMED 6-DIGIT ACCESS CODES STATE ───
  const [accessCodes, setAccessCodes] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState('60'); // minutes
  const [customDuration, setCustomDuration] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // ─── 2. GROUPS STATE ───
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupDepts, setNewGroupDepts] = useState('');
  const [newGroupDesignations, setNewGroupDesignations] = useState('');
  const [availableDesignations, setAvailableDesignations] = useState([]);
  const [selectedDesignationTags, setSelectedDesignationTags] = useState([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Group targeting mode: 'designation' (club designations) | 'specific_users' (e.g. AI Club)
  const [groupTargetMode, setGroupTargetMode] = useState('designation');
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); // array of user objects
  const [userSearchFilter, setUserSearchFilter] = useState('');
  const [designationCounts, setDesignationCounts] = useState({});

  // ─── 3. OVERSIGHT STATE ───
  const [selectedOversightGroup, setSelectedOversightGroup] = useState('overall');
  const [oversightMessages, setOversightMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // ─── 4. PURGE STATE ───
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);

  // Load access codes
  const loadAccessCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('chitchat_access_codes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        setAccessCodes(data);
      }
    } catch (err) {
      console.warn('Load codes notice:', err);
    }
  };

  // Load groups
  const loadGroups = async () => {
    const list = await fetchChitChatGroups();
    setGroups(list);
  };

  // Load distinct designations and registered users directly from user_details table
  const loadAvailableDesignationsAndUsers = async () => {
    setIsLoadingDesignations(true);
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('user_details')
        .select('email, full_name, username, designation, district')
        .order('full_name', { ascending: true })
        .limit(1000);

      if (!error && Array.isArray(data)) {
        setAllRegisteredUsers(data);
        const desigSet = new Set();
        const counts = {};
        data.forEach((row) => {
          if (row.designation && typeof row.designation === 'string') {
            const trimmed = row.designation.trim();
            if (trimmed) {
              desigSet.add(trimmed);
              counts[trimmed] = (counts[trimmed] || 0) + 1;
            }
          }
        });
        const sortFn = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        setAvailableDesignations(Array.from(desigSet).sort(sortFn));
        setDesignationCounts(counts);
      }
    } catch (err) {
      console.warn('Failed to load designations/users for group creator:', err);
    } finally {
      setIsLoadingDesignations(false);
      setIsLoadingUsers(false);
    }
  };

  // Load oversight messages
  const loadOversightMessages = async (groupId) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chitchat_messages')
        .select('*')
        .eq('channel_id', groupId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error && data) {
        setOversightMessages(data);
      }
    } catch (err) {
      console.warn('Oversight fetch notice:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadAccessCodes();
    loadGroups();
    loadAvailableDesignationsAndUsers();

    // 1-second interval to tick countdown timers in real time across the table
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    // Supabase Realtime subscription so new claims / status updates appear instantly
    const channel = supabase
      .channel('admin_live_access_codes_hub')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chitchat_access_codes' },
        () => {
          loadAccessCodes();
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (activeSubTab === 'oversight') {
      loadOversightMessages(selectedOversightGroup);
    }
  }, [activeSubTab, selectedOversightGroup]);

  // Generate 6-digit random code
  const generateRandom6Digit = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Create new access code
  const handleCreateAccessCode = async () => {
    const finalDuration = parseInt(customDuration || selectedDuration, 10);
    if (!finalDuration || isNaN(finalDuration) || finalDuration <= 0) {
      toast?.warning('Please specify a valid duration in minutes.');
      return;
    }

    setIsGeneratingCode(true);
    const newCode = generateRandom6Digit();
    const globalExpiresAt = new Date(Date.now() + finalDuration * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('chitchat_access_codes')
        .insert([{
          code: newCode,
          duration_minutes: finalDuration,
          created_by: 'Admin',
          expires_at: globalExpiresAt,
          is_active: true
        }])
        .select()
        .single();

      if (!error && data) {
        toast?.success(`🎉 Generated Code: ${newCode} (${finalDuration} mins) · Starts now!`);
        loadAccessCodes();
        setCustomDuration('');
      } else {
        toast?.error(error?.message || 'Failed to create code.');
      }
    } catch (err) {
      toast?.error(err.message || 'Error creating access code.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Delete code
  const handleDeleteCode = async (id) => {
    try {
      await supabase.from('chitchat_access_codes').delete().eq('id', id);
      toast?.info('Code deleted.');
      loadAccessCodes();
    } catch (e) {
      toast?.error('Failed to delete code.');
    }
  };

  // Pause / Reactivate code for multi-user access
  const handleToggleCodeActive = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await supabase
        .from('chitchat_access_codes')
        .update({ is_active: nextStatus })
        .eq('id', id);
      toast?.info(nextStatus ? 'Code activated for multi-user access.' : 'Code paused / deactivated.');
      loadAccessCodes();
    } catch (e) {
      toast?.error('Failed to update code status.');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast?.success(`Copied code: ${code}`);
  };

  // Create Custom / Clubbed Group (with Designation Clubbing or Specific Selected Users e.g. "AI Club")
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      toast?.warning('Please enter a group name.');
      return;
    }

    if (groupTargetMode === 'specific_users' && selectedUsers.length === 0) {
      toast?.warning('Please select at least one user for this exclusive curated group.');
      return;
    }

    if (groupTargetMode === 'designation' && selectedDesignationTags.length === 0 && !newGroupDesignations.trim()) {
      toast?.warning('Please select at least one designation to club in this group.');
      return;
    }

    const groupId = (newGroupId.trim() || `grp_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, '_');

    let deptsArray = [];
    let desigsArray = [];
    let allowedUsersArray = [];

    if (groupTargetMode === 'specific_users') {
      allowedUsersArray = selectedUsers.map(u => (u.email || u.username).toLowerCase().trim());
      // Store USER:email in departments array for zero-downtime backwards compatibility
      deptsArray = allowedUsersArray.map(u => `USER:${u}`);
      desigsArray = [];
    } else {
      const depts = newGroupDepts
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);
      deptsArray = depts.length > 0 ? depts : ['ALL'];
      const manualDesigs = newGroupDesignations
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);
      desigsArray = Array.from(new Set([...selectedDesignationTags, ...manualDesigs]));
      allowedUsersArray = [];
    }

    setIsCreatingGroup(true);
    try {
      const payloadBase = {
        id: groupId,
        name: newGroupName.trim(),
        description: newGroupDesc.trim() || null,
        departments: deptsArray,
        designations: desigsArray,
        created_by: 'Admin'
      };

      let insertError = null;

      if (allowedUsersArray.length > 0) {
        // First try inserting with allowed_users column
        const { error: colErr } = await supabase
          .from('chitchat_groups')
          .insert([{ ...payloadBase, allowed_users: allowedUsersArray }]);

        if (colErr) {
          // If allowed_users column doesn't exist yet on remote table, fallback to departments USER: prefix
          const { error: fallbackErr } = await supabase
            .from('chitchat_groups')
            .insert([payloadBase]);
          insertError = fallbackErr;
        }
      } else {
        const { error: stdErr } = await supabase
          .from('chitchat_groups')
          .insert([payloadBase]);
        insertError = stdErr;
      }

      if (!insertError) {
        toast?.success(`🎉 Group "${newGroupName}" created successfully!`);
        setNewGroupName('');
        setNewGroupId('');
        setNewGroupDesc('');
        setNewGroupDepts('');
        setNewGroupDesignations('');
        setSelectedDesignationTags([]);
        setSelectedUsers([]);
        setUserSearchFilter('');
        loadGroups();
      } else {
        toast?.error(insertError.message || 'Failed to create group.');
      }
    } catch (err) {
      toast?.error(err.message || 'Group creation error.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (id) => {
    if (id === 'overall') {
      toast?.warning('The default Overall group cannot be deleted.');
      return;
    }
    try {
      await supabase.from('chitchat_groups').delete().eq('id', id);
      toast?.info('Group deleted.');
      loadGroups();
    } catch (e) {
      toast?.error('Failed to delete group.');
    }
  };

  // Delete message in oversight
  const handleDeleteMessage = async (msgId) => {
    try {
      await supabase.from('chitchat_messages').delete().eq('id', msgId);
      toast?.info('Message deleted.');
      setOversightMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (e) {
      toast?.error('Failed to delete message.');
    }
  };

  // Trigger 15-Day Purge
  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeResult(null);
    let dbPurged = 0;
    let localPurged = 0;
    let localNotice = null;

    // 1. Purge DB
    try {
      const { data, error } = await supabase.rpc('purge_expired_chitchat');
      if (!error && typeof data === 'number') {
        dbPurged = data;
      } else {
        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
        const { data: delData, error: delErr } = await supabase
          .from('chitchat_messages')
          .delete()
          .lt('created_at', fifteenDaysAgo)
          .select('id');
        if (!delErr && Array.isArray(delData)) {
          dbPurged = delData.length;
        }
      }
    } catch (e) {
      console.warn('DB purge notice:', e);
    }

    // 2. Purge local server
    try {
      const serverUrl = getChitChatStorageServerUrl();
      const endpoints = [
        `${serverUrl}/api/chitchat/purge-15days`,
        `${serverUrl}/chitchat/purge-15days`,
        'http://localhost:5000/api/chitchat/purge-15days',
        'http://localhost:5000/chitchat/purge-15days'
      ];
      let didPurge = false;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          if (res.ok) {
            const d = await res.json();
            localPurged = d.purgedCount || 0;
            didPurge = true;
            break;
          } else if (res.status === 404) {
            localNotice = 'Storage microservice process needs restart to load new purge endpoint.';
          }
        } catch (_) {}
      }
      if (!didPurge && !localNotice) {
        localNotice = 'Local storage microservice currently offline or unreachable.';
      }
    } catch (e) {
      console.warn('Local storage purge notice:', e);
    }

    setPurgeResult({ dbPurged, localPurged, notice: localNotice });
    setIsPurging(false);

    if (localNotice) {
      toast?.info(`Supabase Chat Purge: Pruned ${dbPurged} messages older than 15 days.`);
    } else {
      toast?.success(`15-Day Purge Complete: Purged ${dbPurged} messages & ${localPurged} local media files.`);
    }
  };

  return (
    <div className={styles.hubContainer}>
      {/* HEADER */}
      <div className={styles.hubHeader}>
        <div>
          <h2 className={styles.hubTitle}>
            <span>💬</span> Chit-Chat Community Hub (Admin)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-ink-muted, #5E554D)' }}>
            Manage timed 6-digit access codes, department & clubbed groups, live chat oversight, and 15-day auto-purging.
          </p>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className={styles.hubSubTabs}>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'codes' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveSubTab('codes')}
        >
          🔑 Timed 6-Digit Access Codes
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'groups' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveSubTab('groups')}
        >
          🏛️ Department & Clubbed Groups
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'oversight' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveSubTab('oversight')}
        >
          👀 Live Chat Oversight
        </button>
        <button
          type="button"
          className={`${styles.subTabBtn} ${activeSubTab === 'purge' ? styles.subTabBtnActive : ''}`}
          onClick={() => setActiveSubTab('purge')}
        >
          🧹 15-Day Auto-Purge Status
        </button>
      </div>

      {/* ─── TAB 1: 6-DIGIT ACCESS CODES ─── */}
      {activeSubTab === 'codes' && (
        <div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Generate Timed Access Code (Multi-User Shared Pass)</h3>
            <p style={{ fontSize: '12.5px', color: '#5E554D', margin: '0 0 14px' }}>
              Create a unique 6-digit access code for your team or cohort. Once generated, you can share this single code with multiple users, officers, or community members. Each user who enters the code will unlock Chit-Chat for that exact duration, even outside the 8:00 PM – 8:00 AM IST window.
            </p>
            <div className={styles.codeGenRow}>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className={styles.selectInput}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes (1 Hour)</option>
                <option value="120">120 Minutes (2 Hours)</option>
                <option value="240">240 Minutes (4 Hours)</option>
                <option value="1440">1440 Minutes (24 Hours)</option>
              </select>

              <input
                type="number"
                placeholder="Or Custom Minutes (e.g. 45)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className={styles.textInput}
                style={{ width: '220px' }}
                min="1"
              />

              <button
                type="button"
                onClick={handleCreateAccessCode}
                disabled={isGeneratingCode}
                className={styles.primaryBtn}
              >
                {isGeneratingCode ? 'Generating…' : '✨ Generate 6-Digit Code'}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Active & Generated Access Codes</h3>
              <button type="button" onClick={loadAccessCodes} className={styles.copyBtn}>🔄 Refresh</button>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>6-Digit Code</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Users Claimed</th>
                  <th>Timing & Live Countdown</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessCodes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#9CA3AF' }}>No access codes generated yet.</td>
                  </tr>
                ) : (
                  accessCodes.map((c) => {
                    const claimedList = c.claimed_by ? c.claimed_by.split(',').map(s => s.trim()).filter(Boolean) : [];
                    const userCount = (c.claimed_count !== undefined && c.claimed_count !== null)
                      ? c.claimed_count
                      : claimedList.length;

                    const expMs = c.expires_at ? new Date(c.expires_at).getTime() : 0;
                    const isExpired = expMs > 0 && nowTick >= expMs;
                    const remainingStr = !isExpired && expMs > 0 ? formatTimeRemaining(c.expires_at) : '';

                    return (
                      <tr key={c.id}>
                        <td>
                          <span className={styles.codeBadge}>{c.code}</span>
                          <button type="button" onClick={() => handleCopyCode(c.code)} className={styles.copyBtn}>📋 Copy</button>
                        </td>
                        <td><strong>{c.duration_minutes} mins</strong></td>
                        <td>
                          {isExpired ? (
                            <span style={{ color: '#DC2626', fontWeight: '800' }}>● Expired</span>
                          ) : c.is_active ? (
                            <span style={{ color: '#16A34A', fontWeight: '800' }}>● Active (Multi-User)</span>
                          ) : (
                            <span style={{ color: '#D97706', fontWeight: '700' }}>⏸️ Paused</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              backgroundColor: userCount > 0 ? '#ECFDF5' : '#F3F4F6',
                              color: userCount > 0 ? '#065F46' : '#6B7280',
                              border: userCount > 0 ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                              cursor: userCount > 0 ? 'help' : 'default'
                            }}
                            title={userCount > 0 ? `Claimed by:\n${claimedList.join('\n')}` : 'No users have claimed this code yet'}
                          >
                            👥 {userCount} {userCount === 1 ? 'user' : 'users'}
                          </span>
                        </td>
                        <td>
                          {isExpired ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#991B1B',
                              backgroundColor: '#FEE2E2',
                              border: '1px solid #FCA5A5',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '6px'
                            }}>
                              ❌ Expired ({formatMessageTime(c.expires_at)})
                            </span>
                          ) : expMs > 0 && c.is_active ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: '#065F46',
                                backgroundColor: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '3px 9px',
                                borderRadius: '12px',
                                width: 'fit-content',
                                boxShadow: '0 1px 3px rgba(16, 185, 129, 0.15)'
                              }}>
                                ⏳ {remainingStr} left
                              </span>
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                Expires {formatMessageTime(c.expires_at)}
                              </span>
                            </div>
                          ) : expMs > 0 && !c.is_active ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#B45309',
                                backgroundColor: '#FEF3C7',
                                border: '1px solid #FDE68A',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                width: 'fit-content'
                              }}>
                                ⏸️ Paused ({remainingStr} left)
                              </span>
                              <span style={{ fontSize: '11px', color: '#6B7280' }}>
                                Original: {formatMessageTime(c.expires_at)}
                              </span>
                            </div>
                          ) : (
                            c.expires_at ? formatMessageTime(c.expires_at) : '—'
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {!isExpired && (
                              <button
                                type="button"
                                onClick={() => handleToggleCodeActive(c.id, c.is_active)}
                                style={{
                                  padding: '5px 9px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  borderRadius: '4px',
                                  border: '1px solid var(--color-line, #E2D7C3)',
                                  background: c.is_active ? '#FEF3C7' : '#DCFCE7',
                                  color: c.is_active ? '#B45309' : '#166534',
                                  cursor: 'pointer'
                                }}
                                title={c.is_active ? 'Pause / Deactivate this code' : 'Reactivate this code'}
                              >
                                {c.is_active ? '⏸️ Pause' : '▶️ Activate'}
                              </button>
                            )}
                            <button type="button" onClick={() => handleDeleteCode(c.id)} className={styles.dangerBtn}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: GROUPS MANAGER ─── */}
      {activeSubTab === 'groups' && (
        <div>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>Create Custom / Clubbed Community Group</h3>
                <p style={{ fontSize: '12.5px', color: '#5E554D', margin: '4px 0 0' }}>
                  Club multiple designations together (e.g. "Revenue Officer + Circle Officer") or create private curated groups for selected users (e.g. "AI Club").
                </p>
              </div>
            </div>

            {/* TARGETING MODE TOGGLE */}
            <div className={styles.targetModeBar}>
              <button
                type="button"
                className={`${styles.targetModeBtn} ${groupTargetMode === 'designation' ? styles.targetModeBtnActive : ''}`}
                onClick={() => {
                  setGroupTargetMode('designation');
                  if (!newGroupName.trim() || newGroupName === 'AI Club') {
                    setNewGroupName(selectedDesignationTags.length > 0 ? `${selectedDesignationTags.join(' + ')} Forum` : '');
                  }
                }}
              >
                <span>🎖️</span>
                <span>Option 1: Club Multiple Designations</span>
                {selectedDesignationTags.length > 0 && (
                  <span style={{ background: '#B45309', color: '#FFFFFF', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
                    {selectedDesignationTags.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                className={`${styles.targetModeBtn} ${groupTargetMode === 'specific_users' ? styles.targetModeBtnActive : ''}`}
                onClick={() => {
                  setGroupTargetMode('specific_users');
                  if (!newGroupName.trim() || selectedDesignationTags.some(t => newGroupName.includes(t))) {
                    setNewGroupName('AI Club');
                  }
                  if (!newGroupDesc.trim()) {
                    setNewGroupDesc('Exclusive curated AI Club for selected innovators and officers.');
                  }
                }}
              >
                <span>👥</span>
                <span>Option 2: Select Specific Users (e.g. "AI Club")</span>
                {selectedUsers.length > 0 && (
                  <span style={{ background: '#B45309', color: '#FFFFFF', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
                    {selectedUsers.length}
                  </span>
                )}
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* GROUP NAME & DESCRIPTION ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '800', color: '#292524' }}>
                      Group Name *
                    </label>
                    {groupTargetMode === 'designation' && selectedDesignationTags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setNewGroupName(`${selectedDesignationTags.join(' + ')} Forum`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C1552C',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        ✨ Suggest Combined Name
                      </button>
                    )}
                    {groupTargetMode === 'specific_users' && !newGroupName.trim() && (
                      <button
                        type="button"
                        onClick={() => setNewGroupName('AI Club')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C1552C',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        ✨ Use "AI Club"
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={groupTargetMode === 'specific_users' ? 'e.g. AI Club, Innovation Fellowship' : 'e.g. Revenue Officer + Circle Officer Forum'}
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className={styles.textInput}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '6px', color: '#292524' }}>
                    Description / Purpose
                  </label>
                  <input
                    type="text"
                    placeholder={groupTargetMode === 'specific_users' ? 'e.g. Exclusive discussion hub for AI Club members' : 'e.g. Official collaboration forum for clubbed officers across Bihar'}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    className={styles.textInput}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TARGET MODE 1: CLUB MULTIPLE DESIGNATIONS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {groupTargetMode === 'designation' && (
                <div style={{ background: '#FAF7F2', border: '1px solid #E2D7C3', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', marginBottom: '6px', color: '#92400E' }}>
                      🎖️ Add Designations to Club (Select 2, 3, or more from 166 Profile Options)
                    </label>
                    <select
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        if (!selectedDesignationTags.includes(val)) {
                          const next = [...selectedDesignationTags, val];
                          setSelectedDesignationTags(next);
                          if (!newGroupName.trim() || newGroupName.includes('Forum') || newGroupName.includes('+')) {
                            setNewGroupName(next.length === 1 ? next[0] : `${next.join(' + ')} Forum`);
                          }
                          if (!newGroupDesc.trim()) {
                            setNewGroupDesc(`Official discussion and collaboration group for ${next.join(', ')}s across Bihar.`);
                          }
                        }
                      }}
                      className={styles.textInput}
                      style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="">
                        {isLoadingDesignations
                          ? 'Loading profile designations…'
                          : `-- Click to add a designation (${availableDesignations.length} available) --`}
                      </option>
                      {availableDesignations.map((desig) => {
                        const isChosen = selectedDesignationTags.includes(desig);
                        const memberCount = designationCounts[desig] || 0;
                        return (
                          <option key={desig} value={desig} disabled={isChosen}>
                            {isChosen ? '✓ ' : '💼 '} {desig} ({memberCount} registered member{memberCount === 1 ? '' : 's'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Clubbed Designation Tags */}
                  {selectedDesignationTags.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#92400E' }}>
                          Clubbed Designations in this Group ({selectedDesignationTags.length}):
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDesignationTags([])}
                          style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Clear All
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedDesignationTags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              border: '1px solid #F59E0B',
                              borderRadius: '16px',
                              padding: '4px 12px',
                              fontSize: '12.5px',
                              fontWeight: '800'
                            }}
                          >
                            🎖️ {tag} <span style={{ opacity: 0.75, fontSize: '11px', fontWeight: 600 }}>({designationCounts[tag] || 0})</span>
                            <button
                              type="button"
                              onClick={() => setSelectedDesignationTags(selectedDesignationTags.filter(t => t !== tag))}
                              style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: '900', padding: 0, lineHeight: 1 }}
                              title="Remove designation"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#166534', background: '#F0FDF4', padding: '6px 10px', borderRadius: '4px', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>👥</span>
                        <span>
                          <strong>Combined Cohort Size:</strong> Approximately{' '}
                          <strong>{selectedDesignationTags.reduce((sum, tag) => sum + (designationCounts[tag] || 0), 0)} registered officers</strong>{' '}
                          with these {selectedDesignationTags.length} designations will automatically see and have access to this group.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '12px', color: '#78716C' }}>
                      💡 Tip: Select 2 or 3 designations from the dropdown above to club them together into one unified group.
                    </p>
                  )}

                  {/* Optional: Additional Manual Designations or Departments */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '4px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', marginBottom: '4px', color: '#5E554D' }}>
                        Additional Manual Designations (Optional, comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Circle Officer, BPRO"
                        value={newGroupDesignations}
                        onChange={(e) => setNewGroupDesignations(e.target.value)}
                        className={styles.textInput}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', marginBottom: '4px', color: '#5E554D' }}>
                        Departments to Club (Optional, comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Revenue, General Administration"
                        value={newGroupDepts}
                        onChange={(e) => setNewGroupDepts(e.target.value)}
                        className={styles.textInput}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TARGET MODE 2: SPECIFIC SELECTED USERS (e.g. AI CLUB) */}
              {/* ─────────────────────────────────────────────────────────── */}
              {groupTargetMode === 'specific_users' && (
                <div className={styles.userPickerBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#181512', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🔒</span> Select Users for this Group (e.g. "AI Club")
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#5E554D', display: 'block', marginTop: '2px' }}>
                        Only the selected users will see and use this group. Completely hidden from other registered users.
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#B45309', background: '#FEF3C7', padding: '4px 10px', borderRadius: '12px' }}>
                        👥 {selectedUsers.length} Selected
                      </span>
                      {selectedUsers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedUsers([])}
                          style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected Users Chips */}
                  {selectedUsers.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px', maxHeight: '100px', overflowY: 'auto', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2D7C3' }}>
                      {selectedUsers.map((user) => (
                        <span
                          key={user.email}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#F3ECE0',
                            color: '#181512',
                            borderRadius: '14px',
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            border: '1px solid rgba(24, 21, 18, 0.15)'
                          }}
                        >
                          <span>👤</span>
                          <span>{user.full_name || user.email}</span>
                          {user.username && <span style={{ color: '#B45309', fontFamily: 'monospace' }}>@{user.username.replace(/^@/, '')}</span>}
                          <button
                            type="button"
                            onClick={() => setSelectedUsers(selectedUsers.filter(u => u.email !== user.email))}
                            style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: '800', padding: 0 }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search input for users */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="🔍 Search users by name, email, @username, designation, district..."
                        value={userSearchFilter}
                        onChange={(e) => setUserSearchFilter(e.target.value)}
                        className={styles.textInput}
                        style={{ width: '100%', boxSizing: 'border-box', height: '36px', fontSize: '12.5px' }}
                      />
                      {userSearchFilter && (
                        <button
                          type="button"
                          onClick={() => setUserSearchFilter('')}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontWeight: '800' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {userSearchFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = allRegisteredUsers.filter((u) => {
                            const q = userSearchFilter.toLowerCase().trim();
                            return (
                              (u.full_name && u.full_name.toLowerCase().includes(q)) ||
                              (u.email && u.email.toLowerCase().includes(q)) ||
                              (u.username && u.username.toLowerCase().includes(q)) ||
                              (u.designation && u.designation.toLowerCase().includes(q)) ||
                              (u.district && u.district.toLowerCase().includes(q))
                            );
                          });
                          const map = new Map(selectedUsers.map(u => [u.email, u]));
                          filtered.forEach(u => map.set(u.email, u));
                          setSelectedUsers(Array.from(map.values()));
                        }}
                        style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #B45309', color: '#B45309', borderRadius: '4px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        + Select All Matching
                      </button>
                    )}
                  </div>

                  {/* Scrollable Checklist of registered users */}
                  <div className={styles.userListScroll}>
                    {isLoadingUsers ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#78716C', fontSize: '12px' }}>
                        Loading registered users…
                      </div>
                    ) : (
                      (() => {
                        const filtered = allRegisteredUsers.filter((u) => {
                          if (!userSearchFilter.trim()) return true;
                          const q = userSearchFilter.toLowerCase().trim();
                          return (
                            (u.full_name && u.full_name.toLowerCase().includes(q)) ||
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.username && u.username.toLowerCase().includes(q)) ||
                            (u.designation && u.designation.toLowerCase().includes(q)) ||
                            (u.district && u.district.toLowerCase().includes(q))
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#78716C', fontSize: '12.5px' }}>
                              No users match "{userSearchFilter}".
                            </div>
                          );
                        }

                        return filtered.slice(0, 100).map((user) => {
                          const isChecked = selectedUsers.some(u => u.email === user.email);
                          return (
                            <div
                              key={user.email}
                              className={`${styles.userRowItem} ${isChecked ? styles.userRowItemSelected : ''}`}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedUsers(selectedUsers.filter(u => u.email !== user.email));
                                } else {
                                  setSelectedUsers([...selectedUsers, user]);
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by parent div onClick
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <div className={styles.userAvatarMini}>
                                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ fontSize: '12.5px', color: '#181512' }}>
                                    {user.full_name || 'Candidate'}
                                  </strong>
                                  {user.username && (
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', fontFamily: 'monospace' }}>
                                      @{user.username.replace(/^@/, '')}
                                    </span>
                                  )}
                                  {user.district && (
                                    <span style={{ fontSize: '11px', color: '#78716C', background: '#F3ECE0', padding: '1px 6px', borderRadius: '3px' }}>
                                      📍 {user.district}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '11.5px', color: '#5E554D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {user.email} {user.designation ? `· 💼 ${user.designation}` : ''}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isCreatingGroup}
                  className={styles.primaryBtn}
                  style={{ padding: '10px 24px', fontSize: '13.5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <span>{isCreatingGroup ? '⏳' : groupTargetMode === 'specific_users' ? '⭐' : '🎖️'}</span>
                  <span>
                    {isCreatingGroup
                      ? 'Creating Group…'
                      : groupTargetMode === 'specific_users'
                      ? `Create "${newGroupName || 'AI Club'}" for ${selectedUsers.length} Selected User${selectedUsers.length === 1 ? '' : 's'}`
                      : `Create Group for ${selectedDesignationTags.length || 'Clubbed'} Designation${selectedDesignationTags.length === 1 ? '' : 's'}`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>Active Chit-Chat Groups ({groups.length})</h3>
              <button type="button" onClick={loadGroups} className={styles.copyBtn}>🔄 Refresh</button>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Audience / Targeting Mode</th>
                  <th>Description</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const allowedUsersList = [
                    ...(Array.isArray(g.allowed_users) ? g.allowed_users : []),
                    ...(Array.isArray(g.departments) ? g.departments.filter(d => typeof d === 'string' && d.startsWith('USER:')).map(d => d.replace(/^USER:/i, '')) : [])
                  ];
                  const isPrivateUserClub = allowedUsersList.length > 0;
                  const isClubbedDesignations = Array.isArray(g.designations) && g.designations.length > 0;

                  return (
                    <tr key={g.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{isPrivateUserClub ? '⭐' : isClubbedDesignations ? '🎖️' : '🏛️'}</span>
                          <strong>{g.name}</strong>
                          {isPrivateUserClub && (
                            <span style={{ fontSize: '10px', fontWeight: '800', background: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
                              PRIVATE CLUB
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {isPrivateUserClub ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', width: 'fit-content' }}>
                              👥 Whitelist: {allowedUsersList.length} Selected Member{allowedUsersList.length === 1 ? '' : 's'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#78716C', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={allowedUsersList.join(', ')}>
                              {allowedUsersList.slice(0, 3).join(', ')}{allowedUsersList.length > 3 ? ` +${allowedUsersList.length - 3} more` : ''}
                            </span>
                          </div>
                        ) : isClubbedDesignations ? (
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400E', display: 'block', marginBottom: '2px' }}>
                              🎖️ {g.designations.length} Clubbed Designation{g.designations.length === 1 ? '' : 's'}:
                            </span>
                            {g.designations.map((des, i) => (
                              <span key={`des_${i}`} style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: '3px', fontSize: '11px', marginRight: '4px', fontWeight: '700', display: 'inline-block', marginBottom: '2px' }}>
                                💼 {des}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div>
                            {Array.isArray(g.departments) && g.departments.filter(d => !d.startsWith('USER:')).map((d, i) => (
                              <span key={`dept_${i}`} style={{ background: '#F3ECE0', padding: '1px 6px', borderRadius: '3px', fontSize: '11px', marginRight: '4px', display: 'inline-block', marginBottom: '2px' }}>
                                🏢 {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: '#5E554D' }}>{g.description || '—'}</td>
                      <td>{g.created_by}</td>
                      <td>
                        {g.id !== 'overall' && (
                          <button type="button" onClick={() => handleDeleteGroup(g.id)} className={styles.dangerBtn}>Delete</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: LIVE CHAT OVERSIGHT ─── */}
      {activeSubTab === 'oversight' && (
        <div>
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Select Group to Inspect:</label>
                <select
                  value={selectedOversightGroup}
                  onChange={(e) => setSelectedOversightGroup(e.target.value)}
                  className={styles.selectInput}
                >
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={() => loadOversightMessages(selectedOversightGroup)} className={styles.copyBtn}>
                🔄 Refresh Feed
              </button>
            </div>

            {isLoadingMessages ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>Loading messages…</p>
            ) : (
              <div className={styles.oversightFeed}>
                {oversightMessages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>No messages in this group yet.</p>
                ) : (
                  oversightMessages.map(m => (
                    <div key={m.id} className={styles.oversightItem}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', fontSize: '12.5px' }}>{m.sender_name}</span>
                          <span style={{ fontFamily: 'monospace', color: '#B45309', fontSize: '11px', fontWeight: '700' }}>@{m.sender_username}</span>
                          <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>{formatMessageTime(m.created_at)}</span>
                          <span style={{ fontSize: '10px', background: '#F3ECE0', padding: '1px 5px', borderRadius: '2px' }}>{m.sender_designation}</span>
                        </div>
                        {m.message_text && <p style={{ margin: '0 0 6px', fontSize: '13px' }}>{m.message_text}</p>}
                        {m.media_url && (
                          <div style={{ fontSize: '11.5px', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📎 {m.media_type}:</span>
                            <a href={m.media_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>
                              {m.media_filename || m.media_url}
                            </a>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMessage(m.id)}
                        className={styles.dangerBtn}
                        title="Delete this message"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: 15-DAY AUTO-PURGE STATUS ─── */}
      {activeSubTab === 'purge' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>WhatsApp-Style 15-Day Auto-Purge Policy</h3>
          <p style={{ fontSize: '13px', color: '#5E554D', lineHeight: 1.6 }}>
            Bihar AI Mission strictly enforces an automatic 15-day retention window on Chit-Chat conversations and media:
          </p>
          <ul style={{ fontSize: '12.5px', color: '#374151', lineHeight: 1.6, paddingLeft: '20px' }}>
            <li><strong>Chat Text:</strong> In Supabase, messages older than 15 days from <code>NOW()</code> are automatically excluded from all query windows and pruned via <code>purge_expired_chitchat()</code>.</li>
            <li><strong>Local Server Media:</strong> Images, videos, audios, and documents stored in <code>D:\Bihar_Ai_Mission\Chit-chat\</code> are scanned every 6 hours and files older than 15 days are permanently unlinked.</li>
          </ul>

          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--color-sand-50, #FBF8F3)', border: '1px solid var(--color-line, #E2D7C3)', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '13.5px', fontWeight: '800' }}>Run 15-Day Data Purge Immediately</h4>
            <p style={{ fontSize: '12px', color: '#5E554D', margin: '0 0 12px' }}>
              Clicking below immediately deletes any database messages and local media files older than 15 days.
            </p>
            <button
              type="button"
              onClick={handleExecutePurge}
              disabled={isPurging}
              className={styles.primaryBtn}
            >
              {isPurging ? 'Purging…' : '🧹 Run Purge Now'}
            </button>

            {purgeResult && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: purgeResult.notice ? '#FFFBEB' : '#DCFCE7',
                border: purgeResult.notice ? '1px solid #FDE68A' : '1px solid #BBF7D0',
                borderRadius: '4px',
                color: purgeResult.notice ? '#92400E' : '#166534',
                fontSize: '12.5px',
                fontWeight: '600',
                lineHeight: 1.5
              }}>
                <div>✓ <strong>Supabase Purge:</strong> {purgeResult.dbPurged} messages older than 15 days successfully pruned.</div>
                {purgeResult.notice ? (
                  <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#B45309' }}>
                    ℹ️ <strong>Storage Server:</strong> {purgeResult.notice} (Run <code>npx pm2 restart bihar-storage</code> or <code>node server.js</code> on your storage host to activate remote media purging).
                  </div>
                ) : (
                  <div style={{ marginTop: '4px' }}>
                    ✓ <strong>Local Media Purge:</strong> {purgeResult.localPurged} expired files deleted from local storage.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
