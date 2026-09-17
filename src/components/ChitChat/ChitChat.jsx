import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import {
  isWithinNightChatHours,
  getISTClockDisplay,
  formatMessageTime,
  fetchChannelMessages,
  sendChitChatMessage,
  uploadChitChatFile,
  fetchUserFriends,
  fetchPendingFriendRequests,
  fetchSentFriendRequests,
  sendChitChatFriendRequest,
  respondChitChatFriendRequest,
  fetchChitChatGroups,
  filterGroupsForUser,
  resolveUserDepartmentGroup,
  searchRegisteredUsers,
  claimAdminAccessCode,
  getLocalSessionPass,
  saveLocalSessionPass,
  clearLocalSessionPass,
  playChatNotificationSound,
  getChannelReadTimestamp,
  markChannelAsRead,
} from '../../services/chitchatService';
import { toast } from '../../context/ToastContext';
import styles from './ChitChat.module.css';

export default function ChitChat({ currentUser, isHi = false, onGoToProfile }) {
  // ─── LOCK / TIMED SESSION STATE ───
  const [isNightHours, setIsNightHours] = useState(isWithinNightChatHours());
  const [sessionPass, setSessionPass] = useState(getLocalSessionPass());
  const [remainingTimeStr, setRemainingTimeStr] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isClaimingCode, setIsClaimingCode] = useState(false);
  const [istClock, setIstClock] = useState(getISTClockDisplay());

  // ─── CHANNELS & FRIENDS STATE ───
  const [allGroups, setAllGroups] = useState([]);
  const [myDeptGroup, setMyDeptGroup] = useState(null);
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isRespondingRequest, setIsRespondingRequest] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null); // { id, name, type, icon, subtitle }
  const [unreadCounts, setUnreadCounts] = useState({});
  const [mentionAlerts, setMentionAlerts] = useState({});
  
  // ─── SEARCH & ADD FRIENDS ───
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // ─── MESSAGES & MEDIA ───
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);
  const [mentionCandidates, setMentionCandidates] = useState([]);
  const [mobileTab, setMobileTab] = useState('chat'); // 'sidebar' | 'chat'
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const messageFeedRef = useRef(null);
  const messagesEndRef = useRef(null);
  const realtimeChannelRef = useRef(null);
  const realtimeFriendsRef = useRef(null);
  const activeChannelRef = useRef(null);

  // Keep activeChannelRef synced
  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  // User details & Verified Username State
  const myEmail = (currentUser?.email || '').toLowerCase().trim();
  const myName = currentUser?.fullName || currentUser?.full_name || 'Member';
  const initialUsername = (currentUser?.username || '').replace(/^@+/, '').trim();
  const initialDesignation = currentUser?.designation || currentUser?.role_type || currentUser?.department || 'Civic Member';

  const [actualUsername, setActualUsername] = useState(initialUsername);
  const [isCheckingUsername, setIsCheckingUsername] = useState(!initialUsername);

  const [userProfile, setUserProfile] = useState({
    username: initialUsername,
    designation: initialDesignation,
  });

  const myUsername = actualUsername || userProfile.username || initialUsername;
  const myDesignation = userProfile.designation || initialDesignation;

  // Dynamically sync verified username from Supabase user_details table in real time
  useEffect(() => {
    if (!myEmail) {
      setIsCheckingUsername(false);
      return;
    }

    // 1. Fetch current record from Supabase
    supabase
      .from('user_details')
      .select('username, designation, role_type, department')
      .eq('email', myEmail)
      .maybeSingle()
      .then(({ data }) => {
        setIsCheckingUsername(false);
        if (data) {
          const cleanU = (data.username || '').replace(/^@+/, '').trim();
          const cleanD = data.designation || data.role_type || data.department;
          setActualUsername(cleanU);
          setUserProfile((prev) => ({
            username: cleanU,
            designation: cleanD || prev.designation,
          }));
        }
      })
      .catch((err) => {
        console.warn('Error checking username in user_details:', err);
        setIsCheckingUsername(false);
      });

    // 2. Realtime listener: instantly triggers when user sets username on Profile tab
    const channelName = `chitchat-user-profile-${myEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_details',
          filter: `email=eq.${myEmail}`
        },
        (payload) => {
          if (payload?.new) {
            const cleanU = (payload.new.username || '').replace(/^@+/, '').trim();
            setActualUsername(cleanU);
            setUserProfile((prev) => ({
              ...prev,
              username: cleanU,
              designation: payload.new.designation || payload.new.role_type || prev.designation,
              department: payload.new.department || prev.department,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (_) {}
    };
  }, [myEmail]);

  // ─── 1. EVALUATE UNLOCK STATUS & COUNTDOWN TIMER ───
  const isUnlocked = Boolean(isNightHours || (sessionPass && new Date(sessionPass.expiresAt).getTime() > Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const night = isWithinNightChatHours();
      setIsNightHours(night);
      setIstClock(getISTClockDisplay());

      const currentPass = getLocalSessionPass();
      setSessionPass(currentPass);

      if (currentPass && currentPass.expiresAt) {
        const diffMs = new Date(currentPass.expiresAt).getTime() - Date.now();
        if (diffMs > 0) {
          const totalSecs = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          setRemainingTimeStr(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
        } else {
          // Pass expired!
          clearLocalSessionPass();
          setSessionPass(null);
          setRemainingTimeStr('');
          if (!night) {
            toast?.info(isHi ? 'आपकी समय-सीमा समाप्त हो गई है। चैट रात 8 बजे स्वतः अनलॉक होगी।' : 'Your access pass session has expired. Chit-Chat will unlock automatically tonight at 8:00 PM IST.');
          }
        }
      } else {
        setRemainingTimeStr('');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isHi]);

  // Handle entering 6-digit access code
  const handleUnlockWithCode = async (e) => {
    e.preventDefault();
    if (!accessCodeInput.trim() || accessCodeInput.trim().length !== 6) {
      toast?.warning(isHi ? 'कृपया 6 अंकों का मान्य एक्सेस कोड दर्ज करें।' : 'Please enter a valid 6-digit access code.');
      return;
    }
    setIsClaimingCode(true);
    try {
      const res = await claimAdminAccessCode(myEmail, accessCodeInput);
      if (res.success) {
        toast?.success(`🎉 ${res.message || 'Chit-Chat unlocked successfully!'}`);
        setAccessCodeInput('');
        setSessionPass(getLocalSessionPass());
      } else {
        toast?.error(res.error || 'Invalid or inactive access code.');
      }
    } catch (err) {
      toast?.error(err.message || 'Failed to claim access code.');
    } finally {
      setIsClaimingCode(false);
    }
  };

  // ─── 2. LOAD GROUPS & FRIENDS ───
  useEffect(() => {
    if (!isUnlocked) return;

    const loadChannelsAndFriends = async () => {
      // 1. Fetch groups
      const groups = await fetchChitChatGroups();
      setAllGroups(groups);

      // 2. Resolve user's matching department group
      const deptGroup = resolveUserDepartmentGroup(groups, currentUser?.department, myDesignation);
      setMyDeptGroup(deptGroup);

      // 3. Fetch user's accepted friends
      const friends = await fetchUserFriends(myEmail);
      setFriendsList(friends);

      // 4. Fetch incoming & sent friend requests
      const [incoming, outgoing] = await Promise.all([
        fetchPendingFriendRequests(myEmail),
        fetchSentFriendRequests(myEmail)
      ]);
      setPendingRequests(incoming);
      setSentRequests(outgoing);

      // Default active channel to Overall
      if (!activeChannel) {
        const overall = groups.find(g => g.id === 'overall') || groups[0];
        if (overall) {
          setActiveChannel({
            id: overall.id,
            name: overall.name,
            type: 'overall',
            icon: '🏛️',
            subtitle: overall.description
          });
          markChannelAsRead(overall.id, myEmail);
        }
      }
    };

    loadChannelsAndFriends();
  }, [isUnlocked, myEmail, currentUser?.department, myDesignation]);

  // ─── 3. FETCH MESSAGES FOR ACTIVE CHANNEL ───
  useEffect(() => {
    if (!isUnlocked || !activeChannel?.id) return;

    let isMounted = true;
    const channelId = activeChannel.id;
    markChannelAsRead(channelId, myEmail);

    // Fetch existing messages strictly within the 15-day window
    fetchChannelMessages(channelId).then((data) => {
      if (isMounted) {
        setMessages(data);
        scrollToBottom();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isUnlocked, activeChannel?.id, myEmail]);

  // ─── 4. GLOBAL REALTIME CHAT & NOTIFICATION LISTENERS ───
  useEffect(() => {
    if (!isUnlocked) return;
    let isMounted = true;

    try {
      // 1. Chat Messages Live Stream
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }

      const channelSub = supabase
        .channel('chitchat_live_feed')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chitchat_messages',
          },
          (payload) => {
            const newMsg = payload.new;
            if (!newMsg || !isMounted) return;

            const isFromMe = newMsg.sender_email?.toLowerCase() === myEmail.toLowerCase();
            const currentActiveId = activeChannelRef.current?.id;

            // Check if user is mentioned via @username (case-insensitive)
            const cleanMyUser = (myUsername || '').replace(/^@+/, '').trim().toLowerCase();
            const msgText = newMsg.message_text || '';
            const isTagged = Boolean(
              cleanMyUser &&
              msgText &&
              (
                new RegExp(`@${cleanMyUser}\\b`, 'i').test(msgText) ||
                msgText.toLowerCase().includes(`@${cleanMyUser}`)
              )
            );

            if (newMsg.channel_id === currentActiveId) {
              // Append to active chat
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              markChannelAsRead(currentActiveId, myEmail);
              scrollToBottom();

              if (!isFromMe && isTagged) {
                playChatNotificationSound(true);
                toast?.info(`🔔 @${newMsg.sender_username || 'Member'} tagged you: "${msgText.slice(0, 50)}..."`);
              }
            } else {
              // Message arrived on another group or friend channel
              if (isFromMe) return;

              const isDirect = newMsg.channel_type === 'direct' || newMsg.channel_id?.startsWith('dm_');
              const isForMe = !isDirect ||
                newMsg.recipient_email?.toLowerCase() === myEmail.toLowerCase() ||
                newMsg.channel_id?.includes(myEmail.toLowerCase());

              if (isForMe) {
                setUnreadCounts((prev) => ({
                  ...prev,
                  [newMsg.channel_id]: (prev[newMsg.channel_id] || 0) + 1,
                }));

                if (isTagged) {
                  setMentionAlerts((prev) => ({
                    ...prev,
                    [newMsg.channel_id]: (prev[newMsg.channel_id] || 0) + 1,
                  }));
                  playChatNotificationSound(true);
                  toast?.info(`🔔 @${newMsg.sender_username || 'Member'} mentioned you: "${msgText.slice(0, 50)}..."`);
                } else {
                  playChatNotificationSound(false);
                  toast?.info(`💬 New message from @${newMsg.sender_username || 'Member'}`);
                }
              }
            }
          }
        )
        .subscribe();

      realtimeChannelRef.current = channelSub;

      // 2. Friend Requests & Approvals Live Stream
      if (realtimeFriendsRef.current) {
        supabase.removeChannel(realtimeFriendsRef.current);
      }

      const friendsSub = supabase
        .channel('chitchat_friends_feed')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chitchat_friends'
          },
          async (payload) => {
            if (!isMounted) return;
            const rec = payload.new || payload.old;
            if (!rec) return;

            const recUser = (rec.user_email || '').toLowerCase().trim();
            const recFriend = (rec.friend_email || '').toLowerCase().trim();
            const recSender = (rec.sender_email || '').toLowerCase().trim();

            if (recUser === myEmail || recFriend === myEmail || recSender === myEmail) {
              const [updatedFriends, updatedPending, updatedSent] = await Promise.all([
                fetchUserFriends(myEmail),
                fetchPendingFriendRequests(myEmail),
                fetchSentFriendRequests(myEmail)
              ]);
              if (isMounted) {
                setFriendsList(updatedFriends);
                setPendingRequests(updatedPending);
                setSentRequests(updatedSent);
              }

              if (payload.eventType === 'INSERT' && recUser === myEmail && rec.status === 'pending') {
                playChatNotificationSound(true);
                toast?.info(`📬 New friend request from @${rec.sender_username || 'Member'}!`);
              } else if (payload.eventType === 'UPDATE' && rec.status === 'accepted') {
                playChatNotificationSound(true);
                toast?.success(`🎉 @${rec.friend_username || rec.sender_username || 'Peer'} is now your connected friend!`);
              }
            }
          }
        )
        .subscribe();

      realtimeFriendsRef.current = friendsSub;
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
    }

    return () => {
      isMounted = false;
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      if (realtimeFriendsRef.current) {
        supabase.removeChannel(realtimeFriendsRef.current);
      }
    };
  }, [isUnlocked, myEmail, myUsername]);

  // Internal smooth scroll for message feed only (never scrolls the outer window or page)
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messageFeedRef.current) {
        const el = messageFeedRef.current;
        if (smooth) {
          el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        } else {
          el.scrollTop = el.scrollHeight;
        }
      }
    }, 60);
  };

  // Select channel and clear unread & mention flags
  const selectChannel = (channelObj) => {
    setActiveChannel(channelObj);
    markChannelAsRead(channelObj.id, myEmail);
    setUnreadCounts((prev) => ({ ...prev, [channelObj.id]: 0 }));
    setMentionAlerts((prev) => ({ ...prev, [channelObj.id]: 0 }));
    setMobileTab('chat');
  };

  // ─── 5. SEARCH USERS FOR FRIEND CONNECTIONS ───
  const handleSearchUsers = async (q) => {
    setFriendSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchRegisteredUsers(q, myEmail);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (targetUser) => {
    if (friendsList.length >= 5) {
      toast?.warning(isHi ? 'मित्र सीमा पूर्ण हो चुकी है (अधिकतम 5 मित्र)।' : 'Friend limit reached. You can chat separately with up to 5 friends only.');
      return;
    }

    const res = await sendChitChatFriendRequest(
      { email: myEmail, fullName: myName, username: myUsername, designation: myDesignation },
      targetUser
    );
    if (res.success) {
      toast?.success(isHi ? `🎉 @${targetUser.username} को मित्रता अनुरोध भेजा गया!` : `🎉 Friend request sent to @${targetUser.username}!`);
      const outgoing = await fetchSentFriendRequests(myEmail);
      setSentRequests(outgoing);
      setShowFriendSearch(false);
      setFriendSearchQuery('');
      setSearchResults([]);
    } else {
      toast?.error(res.error || 'Failed to send friend request.');
    }
  };

  // Accept incoming friend request
  const handleAcceptFriendRequest = async (req) => {
    if (friendsList.length >= 5) {
      toast?.warning(isHi ? 'आपकी मित्र सूची पूर्ण है (अधिकतम 5 मित्र)।' : 'Friend limit reached (max 5 friends).');
      return;
    }
    setIsRespondingRequest(true);
    try {
      const res = await respondChitChatFriendRequest(
        req.id,
        myEmail,
        'accept',
        { fullName: myName, username: myUsername, designation: myDesignation }
      );
      if (res.success) {
        toast?.success(isHi ? `🎉 @${req.sender_username || req.friend_username} के साथ जुड़े!` : `🎉 Connected with @${req.sender_username || req.friend_username}!`);
        const [friends, incoming] = await Promise.all([
          fetchUserFriends(myEmail),
          fetchPendingFriendRequests(myEmail)
        ]);
        setFriendsList(friends);
        setPendingRequests(incoming);
      } else {
        toast?.error(res.error || 'Failed to accept friend request.');
      }
    } finally {
      setIsRespondingRequest(false);
    }
  };

  // Decline incoming friend request
  const handleDeclineFriendRequest = async (req) => {
    setIsRespondingRequest(true);
    try {
      const res = await respondChitChatFriendRequest(
        req.id,
        myEmail,
        'decline',
        { fullName: myName, username: myUsername, designation: myDesignation }
      );
      if (res.success) {
        toast?.info(isHi ? 'अनुरोध हटाया गया।' : 'Friend request declined.');
        const incoming = await fetchPendingFriendRequests(myEmail);
        setPendingRequests(incoming);
      }
    } finally {
      setIsRespondingRequest(false);
    }
  };

  // Open Direct Chat with Friend
  const openDirectFriendChat = (friend) => {
    const friendEmail = (friend.friend_email || friend.email).toLowerCase().trim();
    const participants = [myEmail, friendEmail].sort();
    const dmChannelId = `dm_${participants[0]}_${participants[1]}`;

    selectChannel({
      id: dmChannelId,
      name: friend.friend_name || friend.name || `@${friend.friend_username}`,
      type: 'direct',
      icon: '👤',
      username: friend.friend_username,
      subtitle: `@${friend.friend_username} · ${friend.friend_designation || 'Officer / Member'}`
    });
  };

  // ─── 6. @ MENTIONS AUTOCOMPLETE & FORMATTING ───
  const mentionSearchTimerRef = useRef(null);
  const [isMentionSearching, setIsMentionSearching] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageInput(val);

    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const match = textBefore.match(/@([a-zA-Z0-9_]*)$/);

    if (match) {
      const q = match[1].toLowerCase();
      const userMap = new Map();

      // 1. Local candidates (friends + recent message participants + DM recipient) — instant
      friendsList.forEach((f) => {
        if (f.friend_username) {
          userMap.set(f.friend_username.toLowerCase(), {
            name: f.friend_name || `@${f.friend_username}`,
            username: f.friend_username,
            designation: f.friend_designation || ''
          });
        }
      });

      messages.forEach((m) => {
        if (m.sender_username && m.sender_username.toLowerCase() !== myUsername.toLowerCase()) {
          userMap.set(m.sender_username.toLowerCase(), {
            name: m.sender_name || `@${m.sender_username}`,
            username: m.sender_username,
            designation: m.sender_designation || ''
          });
        }
      });

      if (activeChannel?.username) {
        userMap.set(activeChannel.username.toLowerCase(), {
          name: activeChannel.name,
          username: activeChannel.username,
          designation: ''
        });
      }

      const pool = Array.from(userMap.values());
      const localFiltered = pool.filter((u) => !q || u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q));
      setMentionCandidates(localFiltered);

      // 2. Database search — debounced 250ms, only if query has >= 1 char
      if (mentionSearchTimerRef.current) clearTimeout(mentionSearchTimerRef.current);

      if (q.length >= 1) {
        setIsMentionSearching(true);
        mentionSearchTimerRef.current = setTimeout(async () => {
          try {
            const dbResults = await searchRegisteredUsers(q, myEmail);
            if (Array.isArray(dbResults) && dbResults.length > 0) {
              setMentionCandidates((prev) => {
                const merged = new Map();
                // Keep existing local results
                prev.forEach((u) => merged.set(u.username.toLowerCase(), u));
                // Add DB results (won't overwrite local if same key)
                dbResults.forEach((u) => {
                  const uname = (u.username || '').toLowerCase();
                  if (uname && !merged.has(uname)) {
                    merged.set(uname, {
                      name: u.full_name || `@${u.username}`,
                      username: u.username,
                      designation: u.designation || u.department || ''
                    });
                  }
                });
                return Array.from(merged.values());
              });
            }
          } catch (err) {
            console.warn('Mention search error:', err);
          } finally {
            setIsMentionSearching(false);
          }
        }, 250);
      } else {
        setIsMentionSearching(false);
      }
    } else {
      setMentionCandidates([]);
      setIsMentionSearching(false);
      if (mentionSearchTimerRef.current) clearTimeout(mentionSearchTimerRef.current);
    }
  };

  const handleSelectMention = (user) => {
    const cursorPos = textInputRef.current ? textInputRef.current.selectionStart : messageInput.length;
    const textBefore = messageInput.slice(0, cursorPos);
    const textAfter = messageInput.slice(cursorPos);
    const replaced = textBefore.replace(/@([a-zA-Z0-9_]*)$/, `@${user.username} `);
    setMessageInput(replaced + textAfter);
    setMentionCandidates([]);
    setIsMentionSearching(false);
    textInputRef.current?.focus({ preventScroll: true });
  };

  // Format message text with highlighted WhatsApp-style mention pills
  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        const cleanTag = part.slice(1).toLowerCase();
        const isMe = cleanTag === myUsername.toLowerCase();
        return (
          <span
            key={idx}
            className={`${styles.mentionPill} ${isMe ? styles.mentionPillMe : ''}`}
            title={isMe ? (isHi ? 'आपको टैग किया गया है' : 'You were mentioned') : part}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // ─── 5. ATTACHMENT PICKER & UPLOAD ───
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast?.warning(isHi ? 'फ़ाइल का आकार 100MB से कम होना चाहिए।' : 'File size must be under 100MB.');
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    let type = 'file';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) type = 'image';
    else if (['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) type = 'video';
    else if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) type = 'audio';

    setPendingFile({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type,
      previewUrl: type === 'image' ? URL.createObjectURL(file) : null
    });
  };

  // ─── 6. SEND MESSAGE ───
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (isSending || (!messageInput.trim() && !pendingFile)) return;

    setIsSending(true);
    let uploadedMediaUrl = null;
    let uploadedMediaType = null;
    let uploadedFileName = null;

    try {
      // 1. Upload media to local storage server if attached
      if (pendingFile) {
        setIsUploadingMedia(true);
        try {
          const uploadRes = await uploadChitChatFile(pendingFile.file);
          if (uploadRes && uploadRes.fileUrl) {
            uploadedMediaUrl = uploadRes.fileUrl;
            uploadedMediaType = uploadRes.mediaType || pendingFile.type;
            uploadedFileName = uploadRes.originalName || pendingFile.name;
          }
        } catch (upErr) {
          console.error('File upload error:', upErr);
          toast?.error('Failed to upload attachment to storage server.');
          setIsSending(false);
          setIsUploadingMedia(false);
          return;
        } finally {
          setIsUploadingMedia(false);
        }
      }

      // 2. Build message payload
      const payload = {
        channel_id: activeChannel.id,
        channel_type: activeChannel.type,
        sender_email: myEmail,
        sender_name: myName,
        sender_username: myUsername,
        sender_designation: myDesignation,
        recipient_email: activeChannel.type === 'direct' ? activeChannel.id.replace('dm_', '').replace(myEmail, '').replace('_', '') : null,
        message_text: messageInput.trim(),
        media_url: uploadedMediaUrl,
        media_type: uploadedMediaType,
        media_filename: uploadedFileName,
      };

      const sent = await sendChitChatMessage(payload);

      // Optimistic local state update
      setMessages((prev) => [...prev, sent]);
      setMessageInput('');
      setPendingFile(null);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      toast?.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: LOADING CHECK
  // ══════════════════════════════════════════════════════════════════════════
  if (isCheckingUsername) {
    return (
      <div className={styles.gatewayContainer} style={{ minHeight: '280px' }}>
        <div style={{ textAlign: 'center', color: '#5E554D' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
          <div style={{ fontSize: '13.5px', fontWeight: '700' }}>
            {isHi ? 'प्रोफ़ाइल स्थिति जांची जा रही है…' : 'Checking profile status…'}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: USERNAME REQUIRED GATEWAY (NO USERNAME SET YET)
  // ══════════════════════════════════════════════════════════════════════════
  if (!actualUsername) {
    return (
      <div className={styles.gatewayContainer}>
        <div className={styles.lockGateway} style={{ maxWidth: '580px', borderTop: '4px solid #C1552C' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#B45309',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            border: '1.5px solid #FDE68A',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            ✍️
          </div>

          <div style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: '800',
            color: '#B45309',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            padding: '3px 10px',
            borderRadius: '12px',
            marginBottom: '10px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            ⚡ {isHi ? 'आवश्यक सूचना · यूज़रनेम आवश्यक' : 'Action Required · Username Setup'}
          </div>

          <h2 className={styles.lockTitle} style={{ fontSize: '21px', lineHeight: 1.3, marginBottom: '8px' }}>
            {isHi ? 'गप-शप शुरू करने के लिए पहले अपना यूनीक यूज़रनेम बनाएं' : 'Create Your Unique Username to Access Gup-Shup'}
          </h2>

          <p className={styles.lockDesc} style={{ fontSize: '13px', color: '#5E554D', lineHeight: 1.5, marginBottom: '18px' }}>
            {isHi
              ? 'बिहार एआई मिशन गप-शप में भाग लेने, लाइव चैट करने और @टैगिंग की सुविधा के लिए प्रत्येक सदस्य का यूनीक यूज़रनेम होना अनिवार्य है।'
              : 'To participate in Gup-Shup Chit-Chat, connect with peers, and use WhatsApp-style @mentions, you must first create your verified username.'}
          </p>

          {/* STEP-BY-STEP GUIDANCE BOX */}
          <div style={{
            background: 'var(--color-sand-50, #FBF8F3)',
            border: '1.5px solid var(--color-line, #E2D7C3)',
            borderRadius: '6px',
            padding: '16px 18px',
            textAlign: 'left',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '800', color: '#181512', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📋</span>
              <span>{isHi ? 'यूज़रनेम कैसे बनाएं (सरल चरण):' : 'How & Where to Create Your Username (4 Simple Steps):'}</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#374151', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#C1552C', color: '#FFFFFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>1</span>
                <div>
                  <strong>{isHi ? 'प्रोफ़ाइल विवरण (Profile Details) टैब पर जाएं:' : 'Go to "Profile Details" Tab:'}</strong>{' '}
                  {isHi ? 'ऊपर दिए गए पहले टैब "Profile Details" पर क्लिक करें (या नीचे दिए गए बटन को दबाएं)।' : 'Click the "Profile Details" tab at the top of your dashboard, or use the direct button below.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#C1552C', color: '#FFFFFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>2</span>
                <div>
                  <strong>{isHi ? 'यूज़रनेम सेक्शन खोजें:' : 'Find the Username Box:'}</strong>{' '}
                  {isHi ? 'प्रोफ़ाइल फॉर्म में नीचे "अपना यूनीक यूज़रनेम (@) बनाएं" वाले बॉक्स को देखें।' : 'Scroll down to the "Create Your Unique Username (@)" box in the profile form.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#C1552C', color: '#FFFFFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>3</span>
                <div>
                  <strong>{isHi ? '5 से 10 वर्णों का यूज़रनेम टाइप करें:' : 'Type Desired Handle (5–10 characters):'}</strong>{' '}
                  {isHi ? 'केवल छोटे अक्षर (a-z), अंक (0-9) और अंडरस्कोर (_)। सिस्टम तुरंत हरी टिक ✅ दिखाएगा।' : 'Use lowercase letters, numbers, and underscores. The system shows an instant green checkmark ✅ when available.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ background: '#C1552C', color: '#FFFFFF', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>4</span>
                <div>
                  <strong>{isHi ? '"Set Username" पर क्लिक करें:' : 'Click "Set Username":'}</strong>{' '}
                  {isHi ? 'आपका यूज़रनेम स्थायी रूप से लॉक हो जाएगा और गप-शप स्वतः अनलॉक हो जाएगा!' : 'Permanently lock your handle. Gup-Shup checks the backend in realtime and unlocks automatically!'}
                </div>
              </div>
            </div>
          </div>

          {/* PRIMARY ACTION CTA */}
          <button
            type="button"
            onClick={() => {
              if (typeof onGoToProfile === 'function') {
                onGoToProfile();
              } else {
                window.dispatchEvent(new CustomEvent('switch_profile_tab', { detail: 'profile' }));
              }
            }}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #C1552C, #9B3D1B)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(193, 85, 44, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>👉</span>
            <span>{isHi ? 'प्रोफ़ाइल विवरण में जाएं और यूज़रनेम बनाएं' : 'Go to Profile Details to Create Username'}</span>
            <span>⚡</span>
          </button>

          {/* REALTIME BACKEND SYNC BADGE */}
          <div style={{
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11.5px',
            color: '#166534',
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            padding: '4px 12px',
            borderRadius: '16px',
            fontWeight: '600'
          }}>
            <span>🟢</span>
            <span>{isHi ? 'रीयल-टाइम जांच सक्रिय है — यूज़रनेम बनते ही यह पेज स्वतः खुल जाएगा।' : 'Real-time check active — unlocks automatically once username is set.'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: LOCKED GATEWAY (DAYTIME & NO CODE)
  // ══════════════════════════════════════════════════════════════════════════
  if (!isUnlocked) {
    return (
      <div className={styles.gatewayContainer}>
        <div className={styles.lockGateway}>
          <div className={styles.lockIconBox}>🔒</div>
          <h2 className={styles.lockTitle}>
            {isHi ? 'गप-शप (Chit-Chat) अभी लॉक है' : 'Gup-Shup Chit-Chat is Locked'}
          </h2>
          <p className={styles.lockDesc}>
            {isHi
              ? 'बिहार एआई मिशन चित-चैट सक्रिय सहभागिता के लिए रात्रि 8:00 बजे से प्रातः 8:00 बजे तक (IST) स्वतः खुला रहता है।'
              : 'Bihar AI Mission Chit-Chat unlocks automatically every night from 8:00 PM to 8:00 AM IST for community collaboration.'}
          </p>

          <div className={styles.scheduleBox}>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabel}>🕒 {isHi ? 'भारतीय मानक समय (IST):' : 'Current IST Clock:'}</span>
              <span className={styles.scheduleValueIst}>{istClock}</span>
            </div>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabel}>🌙 {isHi ? 'रात्रि चैट अवधि:' : 'Nightly Chat Hours:'}</span>
              <span className={styles.scheduleValueHours}>8:00 PM – 8:00 AM IST</span>
            </div>
            <span className={styles.scheduleNote}>
              💡 {isHi ? 'आपकी पिछली सभी बातचीत और मीडिया सुरक्षित हैं और अनलॉक होते ही वहीं से जारी रहेंगी।' : 'Note: All your previous chat history and media are safely preserved and will immediately resume.'}
            </span>
          </div>

          <div className={styles.codeUnlockBox}>
            <label className={styles.codeLabel}>
              🔑 {isHi ? 'प्रशासक 6-अंकीय कोड से अनलॉक करें:' : 'Have an Admin 6-Digit Access Code? Unlock Anytime:'}
            </label>
            <form onSubmit={handleUnlockWithCode} className={styles.codeInputRow}>
              <input
                type="text"
                maxLength={6}
                placeholder="6-DIGIT"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase().slice(0, 6))}
                className={styles.codeInput}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={isClaimingCode || accessCodeInput.length !== 6}
                className={styles.unlockBtn}
              >
                {isClaimingCode ? (isHi ? 'जाँच हो रही है…' : 'Validating…') : (isHi ? 'अनलॉक करें' : 'Unlock Now')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const totalMentionsInSidebar = Object.values(mentionAlerts).reduce(
    (acc, v) => acc + (typeof v === 'number' ? v : (v ? 1 : 0)),
    0
  );

  const totalUnreadCount = Object.values(unreadCounts).reduce(
    (acc, v) => acc + (typeof v === 'number' ? v : (v ? 1 : 0)),
    0
  );

  // Filter groups strictly based on designation and department (Requirement 4)
  const visibleGroups = filterGroupsForUser(allGroups, currentUser?.department, myDesignation);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: ACTIVE CHIT-CHAT APPLICATION
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`${styles.container} ${mobileTab === 'sidebar' ? styles.showSidebarMobile : styles.showChatMobile}`}>
      {/* ─── LEFT SIDEBAR: CHANNELS & FRIENDS ─── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandRow}>
            <h3 className={styles.brandTitle}>
              <span>💬</span> {isHi ? 'गप-शप' : 'Gup-Shup'}
            </h3>
            {/* Quick button to return to active chat on mobile */}
            {activeChannel && (
              <button
                type="button"
                className={styles.mobileViewChatBtn}
                onClick={() => setMobileTab('chat')}
                title={isHi ? 'सक्रिय चैट पर जाएं' : 'Open active chat'}
              >
                <span>{activeChannel.name ? (activeChannel.name.length > 12 ? `${activeChannel.name.slice(0, 10)}…` : activeChannel.name) : 'Chat'}</span>
                <span>→</span>
              </button>
            )}
            {isNightHours ? (
              <span className={`${styles.sessionBadge} ${styles.sessionNight}`} title="Open during nightly chat window">
                🌙 8PM-8AM IST
              </span>
            ) : remainingTimeStr ? (
              <span className={`${styles.sessionBadge} ${styles.sessionPass}`} title="Temporary Access Code Session">
                ⏳ {remainingTimeStr}
              </span>
            ) : null}
          </div>
          <p className={styles.userSubText}>
            <span className={styles.userTag} style={{ fontSize: '13px', letterSpacing: '0.02em' }}>@{myUsername}</span>

            {/* REAL-TIME UNREAD MESSAGES NOTIFICATION BADGE BESIDE USERNAME (Requirement 2) */}
            {totalUnreadCount > 0 && (
              <span
                className={styles.userUnreadBadge}
                title={isHi ? `${totalUnreadCount} नए अपठित संदेश` : `${totalUnreadCount} unread message${totalUnreadCount > 1 ? 's' : ''}`}
              >
                <span className={styles.userUnreadDot}></span>
                <span className={styles.userUnreadIcon}>🔔</span>
                <span className={styles.userUnreadCount}>{totalUnreadCount}</span>
              </span>
            )}

            {totalMentionsInSidebar > 0 && (
              <span
                style={{
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  marginLeft: 'auto',
                  boxShadow: '0 0 6px rgba(220, 38, 38, 0.4)'
                }}
                title={isHi ? `${totalMentionsInSidebar} टैग सूचनाएं` : `${totalMentionsInSidebar} mention alerts`}
              >
                <span>@</span>
                <span>{totalMentionsInSidebar}</span>
              </span>
            )}
          </p>
        </div>

        <div className={styles.channelsScroll}>
          {/* SECTION 1: PUBLIC / COMMUNITY GROUPS */}
          <div>
            <div className={styles.sectionHeader}>
              <span>{isHi ? 'सार्वजनिक समूह' : 'Community Channels'}</span>
            </div>

            {/* OVERALL GROUP */}
            {visibleGroups.filter(g => g.id === 'overall').map((g) => (
              <button
                key={g.id}
                type="button"
                className={`${styles.channelItem} ${activeChannel?.id === g.id ? styles.channelItemActive : ''}`}
                onClick={() => selectChannel({ id: g.id, name: g.name, type: 'overall', icon: '🏛️', subtitle: g.description })}
              >
                <span className={styles.channelIcon}>🏛️</span>
                <div className={styles.channelMeta}>
                  <p className={styles.channelName}>{g.name}</p>
                  <p className={styles.channelDesc}>{isHi ? 'राज्य स्तरीय समग्र समूह' : 'Statewide General Forum'}</p>
                </div>
                {Boolean(mentionAlerts[g.id]) && (
                  <span className={styles.mentionBadge} title={isHi ? 'आपको टैग किया गया है' : 'You were mentioned'}>
                    @{typeof mentionAlerts[g.id] === 'number' && mentionAlerts[g.id] > 1 ? ` ${mentionAlerts[g.id]}` : ''}
                  </span>
                )}
                {Boolean(unreadCounts[g.id]) && (
                  <span className={styles.unreadBadge}>{unreadCounts[g.id]}</span>
                )}
              </button>
            ))}

            {/* USER'S RESPECTIVE DEPARTMENT GROUP */}
            {myDeptGroup && myDeptGroup.id !== 'overall' && visibleGroups.some(g => g.id === myDeptGroup.id) && (
              <button
                type="button"
                className={`${styles.channelItem} ${activeChannel?.id === myDeptGroup.id ? styles.channelItemActive : ''}`}
                onClick={() => selectChannel({ id: myDeptGroup.id, name: myDeptGroup.name, type: 'department', icon: '🏢', subtitle: myDeptGroup.description })}
              >
                <span className={styles.channelIcon}>🏢</span>
                <div className={styles.channelMeta}>
                  <p className={styles.channelName}>{myDeptGroup.name}</p>
                  <p className={styles.channelDesc}>{isHi ? 'आपका संबंधित विभाग' : 'Your Respective Department'}</p>
                </div>
                {Boolean(mentionAlerts[myDeptGroup.id]) && (
                  <span className={styles.mentionBadge} title={isHi ? 'आपको टैग किया गया है' : 'You were mentioned'}>
                    @{typeof mentionAlerts[myDeptGroup.id] === 'number' && mentionAlerts[myDeptGroup.id] > 1 ? ` ${mentionAlerts[myDeptGroup.id]}` : ''}
                  </span>
                )}
                {Boolean(unreadCounts[myDeptGroup.id]) && (
                  <span className={styles.unreadBadge}>{unreadCounts[myDeptGroup.id]}</span>
                )}
              </button>
            )}

            {/* ADMIN-CREATED CUSTOM GROUPS RESTRICTED BY DESIGNATION (Requirement 4) */}
            {visibleGroups.filter(g => g.id !== 'overall' && (!myDeptGroup || g.id !== myDeptGroup.id)).map((g) => (
              <button
                key={g.id}
                type="button"
                className={`${styles.channelItem} ${activeChannel?.id === g.id ? styles.channelItemActive : ''}`}
                onClick={() => selectChannel({ id: g.id, name: g.name, type: 'admin_group', icon: '⭐', subtitle: g.description })}
              >
                <span className={styles.channelIcon}>⭐</span>
                <div className={styles.channelMeta}>
                  <p className={styles.channelName}>{g.name}</p>
                  <p className={styles.channelDesc}>
                    {Array.isArray(g.designations) && g.designations.length > 0
                      ? `🎖️ ${g.designations.join(', ')}`
                      : g.description || (isHi ? 'विशेष समूह' : 'Special Cohort')}
                  </p>
                </div>
                {Boolean(mentionAlerts[g.id]) && (
                  <span className={styles.mentionBadge} title={isHi ? 'आपको टैग किया गया है' : 'You were mentioned'}>
                    @{typeof mentionAlerts[g.id] === 'number' && mentionAlerts[g.id] > 1 ? ` ${mentionAlerts[g.id]}` : ''}
                  </span>
                )}
                {Boolean(unreadCounts[g.id]) && (
                  <span className={styles.unreadBadge}>{unreadCounts[g.id]}</span>
                )}
              </button>
            ))}
          </div>

          {/* SECTION 2: 1-ON-1 FRIENDS (CAPPED AT 5) */}
          <div>
            <div className={styles.sectionHeader}>
              <span>{isHi ? 'मित्र (1-on-1)' : 'Friends (1-on-1)'} ({friendsList.length}/5)</span>
              {friendsList.length < 5 && (
                <button
                  type="button"
                  className={styles.addFriendBtn}
                  onClick={() => setShowFriendSearch(!showFriendSearch)}
                >
                  {showFriendSearch ? '✕' : '+ ' + (isHi ? 'खोजें' : 'Add')}
                </button>
              )}
            </div>

            {/* INCOMING FRIEND REQUESTS (RECEIVER APPROVAL REQUIRED) (Requirement 3) */}
            {pendingRequests.length > 0 && (
              <div className={styles.friendRequestsContainer}>
                <div className={styles.friendRequestsHeader}>
                  <span>📬 {isHi ? 'मित्रता अनुरोध' : 'Friend Requests'}</span>
                  <span className={styles.pendingBadge}>{pendingRequests.length}</span>
                </div>
                {pendingRequests.map((req) => (
                  <div key={req.id} className={styles.friendRequestCard}>
                    <div className={styles.friendRequestMeta}>
                      <p className={styles.friendRequestName}>
                        {req.sender_name || req.friend_name || 'Peer Member'}
                      </p>
                      <p className={styles.friendRequestTag}>
                        @{req.sender_username || req.friend_username}
                      </p>
                      {(req.sender_designation || req.friend_designation) && (
                        <span className={styles.friendRequestDesig}>
                          {req.sender_designation || req.friend_designation}
                        </span>
                      )}
                    </div>
                    <div className={styles.friendRequestBtns}>
                      <button
                        type="button"
                        className={styles.acceptFriendBtn}
                        onClick={() => handleAcceptFriendRequest(req)}
                        disabled={isRespondingRequest || friendsList.length >= 5}
                        title={isHi ? 'मित्रता स्वीकारें' : 'Accept Request'}
                      >
                        ✓ {isHi ? 'स्वीकारें' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        className={styles.declineFriendBtn}
                        onClick={() => handleDeclineFriendRequest(req)}
                        disabled={isRespondingRequest}
                        title={isHi ? 'अस्वीकार करें' : 'Decline'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USER SEARCH DRAWER */}
            {showFriendSearch && (
              <div className={styles.friendSearchBox}>
                <input
                  type="text"
                  placeholder={isHi ? 'यूज़रनेम (@) से खोजें…' : 'Search by @username…'}
                  value={friendSearchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className={styles.friendSearchInput}
                  autoFocus
                />
                {isSearching && <p style={{ fontSize: '11px', color: '#6B7280', margin: '6px 0 0' }}>⏳ {isHi ? 'खोज रहे हैं…' : 'Searching…'}</p>}
                {searchResults.map((usr) => {
                  const alreadyFriend = friendsList.some(f => f.friend_email === usr.email?.toLowerCase());
                  const isPendingSent = sentRequests.some(s => s.user_email === usr.email?.toLowerCase() || s.friend_email === usr.email?.toLowerCase());
                  const incomingReq = pendingRequests.find(p => p.friend_email === usr.email?.toLowerCase() || p.sender_email === usr.email?.toLowerCase());

                  return (
                    <div key={usr.id} className={styles.searchResultItem}>
                      <div>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>{usr.full_name}</p>
                        <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', color: '#B45309' }}>@{usr.username}</p>
                        {usr.designation && <span style={{ fontSize: '10px', color: '#6B7280' }}>{usr.designation}</span>}
                      </div>
                      <button
                        type="button"
                        className={styles.connectBtn}
                        disabled={alreadyFriend || isPendingSent || friendsList.length >= 5}
                        onClick={() => {
                          if (incomingReq) {
                            handleAcceptFriendRequest(incomingReq);
                          } else {
                            handleSendFriendRequest(usr);
                          }
                        }}
                      >
                        {alreadyFriend
                          ? '✓ Connected'
                          : isPendingSent
                          ? '⏳ Sent'
                          : incomingReq
                          ? '📬 Accept'
                          : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FRIENDS LIST */}
            {friendsList.length === 0 ? (
              <p style={{ fontSize: '11.5px', color: '#9CA3AF', padding: '0 8px', margin: '4px 0' }}>
                {isHi ? 'कोई मित्र नहीं जुड़ा है। 5 मित्रों तक खोजकर अनुरोध भेजें।' : 'No friends connected yet. Search by @username to add up to 5 friends.'}
              </p>
            ) : (
              friendsList.map((f) => {
                const participants = [myEmail, f.friend_email.toLowerCase()].sort();
                const dmId = `dm_${participants[0]}_${participants[1]}`;
                const isActive = activeChannel?.id === dmId;
                return (
                  <button
                    key={f.id || f.friend_email}
                    type="button"
                    className={`${styles.channelItem} ${isActive ? styles.channelItemActive : ''}`}
                    onClick={() => openDirectFriendChat(f)}
                  >
                    <span className={styles.channelIcon}>👤</span>
                    <div className={styles.channelMeta}>
                      <p className={styles.channelName}>{f.friend_name}</p>
                      <p className={styles.channelDesc}>@{f.friend_username}</p>
                    </div>
                    {Boolean(mentionAlerts[dmId]) && (
                      <span className={styles.mentionBadge} title={isHi ? 'आपको टैग किया गया है' : 'You were mentioned'}>
                        @{typeof mentionAlerts[dmId] === 'number' && mentionAlerts[dmId] > 1 ? ` ${mentionAlerts[dmId]}` : ''}
                      </span>
                    )}
                    {Boolean(unreadCounts[dmId]) && (
                      <span className={styles.unreadBadge}>{unreadCounts[dmId]}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT MAIN CHAT AREA ─── */}
      <div className={styles.chatMain}>
        {/* CHAT HEADER */}
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            {/* Mobile Back Button to return to Channels / Friends */}
            <button
              type="button"
              className={styles.mobileBackBtn}
              onClick={() => setMobileTab('sidebar')}
              title={isHi ? 'चैनल और मित्र सूची पर वापस जाएं' : 'Back to channels and friends'}
              aria-label="Back to channels"
            >
              ←
            </button>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>{activeChannel?.icon || '💬'}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4 className={styles.chatHeaderTitle}>{activeChannel?.name || 'Chit-Chat'}</h4>
              <p className={styles.chatHeaderSub}>{activeChannel?.subtitle || 'Community Channel'}</p>
            </div>
          </div>
          <div
            className={styles.disappearingNotice}
            title={isHi
              ? 'व्हाट्सएप की तरह: सभी संदेश और मीडिया 15 दिनों के बाद स्वतः हट जाते हैं।'
              : 'Like WhatsApp: All chats and media automatically disappear after 15 days to keep conversations clean and private.'}
          >
            <span>⏳</span>
            <span className={styles.disappearingNoticeText}>
              {isHi ? 'संदेश 15 दिनों में स्वतः हट जाते हैं' : 'Messages disappear after 15 days'}
            </span>
            <span className={styles.disappearingNoticeMobileText}>
              {isHi ? '15 दिन' : '15d'}
            </span>
          </div>
        </div>

        {/* MESSAGES FEED */}
        <div className={styles.messageFeed} ref={messageFeedRef}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>💬</span>
              <p style={{ fontWeight: '700', margin: '0 0 4px', color: '#181512' }}>
                {isHi ? 'अभी कोई संदेश नहीं है' : 'No messages here yet'}
              </p>
              <p style={{ fontSize: '12px', margin: 0 }}>
                {isHi ? 'बातचीत शुरू करने के लिए पहला संदेश भेजें!' : 'Send a message or media to start the conversation!'}
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_email?.toLowerCase() === myEmail;
              const isGroup = activeChannel?.type !== 'direct';
              const displayUsername = m.sender_username || (isMe ? myUsername : 'member');
              const displayDesignation = m.sender_designation || (isMe ? myDesignation : '');

              return (
                <div
                  key={m.id || `${m.sender_email}_${m.created_at}`}
                  className={`${styles.messageRow} ${isMe ? styles.messageRowMe : styles.messageRowOther}`}
                >
                  {!isMe && (
                    <div className={styles.avatar}>
                      {(displayUsername || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`${styles.bubble} ${isMe ? styles.bubbleMe : styles.bubbleOther}`}>
                    {/* In group chats (or when not me), show username and designation */}
                    {(isGroup || !isMe) && (
                      <div
                        className={styles.senderMeta}
                        style={{
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          marginBottom: '6px'
                        }}
                      >
                        <span className={styles.senderTag}>@{displayUsername}</span>
                        {displayDesignation && (
                          <span className={styles.senderDesig}>{displayDesignation}</span>
                        )}
                      </div>
                    )}

                    {/* Text content with formatted @mentions */}
                    {m.message_text && (
                      <p className={styles.messageText}>
                        {renderFormattedMessage(m.message_text)}
                      </p>
                    )}

                    {/* Media Attachments */}
                    {m.media_url && (
                      <div className={styles.mediaPreviewBox}>
                        {m.media_type === 'image' && (
                          <img
                            src={m.media_url}
                            alt="attachment"
                            className={styles.chatImage}
                            onClick={() => setActiveLightboxImg(m.media_url)}
                          />
                        )}

                        {m.media_type === 'video' && (
                          <video
                            src={m.media_url}
                            controls
                            className={styles.chatVideo}
                            preload="metadata"
                          />
                        )}

                        {m.media_type === 'audio' && (
                          <audio
                            src={m.media_url}
                            controls
                            className={styles.chatAudio}
                            preload="metadata"
                          />
                        )}

                        {m.media_type === 'file' || m.media_type === 'files' && (
                          <a
                            href={m.media_url}
                            download={m.media_filename || 'download'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.chatFileCard}
                          >
                            <span style={{ fontSize: '18px' }}>📄</span>
                            <div>
                              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700' }}>
                                {m.media_filename || 'Document'}
                              </p>
                              <span style={{ fontSize: '10.5px', color: '#6B7280' }}>
                                {isHi ? 'डाउनलोड करने के लिए क्लिक करें' : 'Click to open / download'}
                              </span>
                            </div>
                          </a>
                        )}
                      </div>
                    )}

                    <span className={styles.timestamp}>{formatMessageTime(m.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* COMPOSER / INPUT AREA */}
        <div className={styles.composer} style={{ position: 'relative' }}>
          {/* MENTION SUGGESTIONS DROPDOWN (WHATSAPP STYLE) */}
          {(mentionCandidates.length > 0 || isMentionSearching) && (
            <div className={styles.mentionPopover}>
              <div className={styles.mentionPopoverHeader}>
                <span>{isHi ? 'टैग करने के लिए सदस्य चुनें' : 'Mention a member'} (@)</span>
                {isMentionSearching && (
                  <span style={{ fontSize: '10px', color: 'var(--color-terracotta-500, #C1552C)', fontWeight: '700', marginLeft: 'auto' }}>
                    {isHi ? 'खोज रहे हैं…' : 'Searching…'}
                  </span>
                )}
              </div>
              {mentionCandidates.slice(0, 8).map((u) => (
                <button
                  key={u.username}
                  type="button"
                  className={styles.mentionItem}
                  onClick={() => handleSelectMention(u)}
                >
                  <div className={styles.mentionItemAvatar}>
                    {(u.name || u.username).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.mentionItemMeta}>
                    <span className={styles.mentionItemName}>{u.name}</span>
                    <span className={styles.mentionItemTag}>@{u.username}</span>
                    {u.designation && (
                      <span style={{ fontSize: '10.5px', color: 'var(--color-ink-muted, #5E554D)', fontWeight: '600', marginLeft: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        · {u.designation}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {mentionCandidates.length === 0 && isMentionSearching && (
                <div style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--color-ink-muted, #5E554D)', textAlign: 'center' }}>
                  {isHi ? 'डेटाबेस में खोज रहे हैं…' : 'Searching registered users…'}
                </div>
              )}
            </div>
          )}

          {/* PENDING ATTACHMENT PREVIEW */}
          {pendingFile && (
            <div className={styles.pendingAttachmentRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📎</span>
                <span>{pendingFile.name} ({pendingFile.size})</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingFile(null)}
                style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className={styles.composerRow}>
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt,.csv"
            />

            <button
              type="button"
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title={isHi ? 'फ़ाइल संलग्न करें (फोटो, वीडियो, ऑडियो, डॉक्युमेंट)' : 'Attach Image, Video, Audio, or File'}
            >
              📎
            </button>

            <input
              type="text"
              ref={textInputRef}
              placeholder={isHi ? 'संदेश लिखें… (@ से सदस्य को टैग करें, Enter से भेजें)' : 'Type a message… (Type @ to mention, Enter to send)'}
              value={messageInput}
              onChange={handleInputChange}
              className={styles.textInput}
              disabled={isSending || isUploadingMedia}
            />

            <button
              type="submit"
              disabled={isSending || isUploadingMedia || (!messageInput.trim() && !pendingFile)}
              className={styles.sendBtn}
            >
              {isUploadingMedia ? (
                isHi ? 'अपलोड हो रहा है…' : 'Uploading…'
              ) : isSending ? (
                isHi ? 'भेज रहे हैं…' : 'Sending…'
              ) : (
                <>
                  <span className={styles.sendBtnText}>{isHi ? 'भेजें' : 'Send'}</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ─── LIGHTBOX MODAL FOR IMAGES ─── */}
      {activeLightboxImg && (
        <div className={styles.lightboxBackdrop} onClick={() => setActiveLightboxImg(null)}>
          <img src={activeLightboxImg} alt="Enlarged preview" className={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
}
