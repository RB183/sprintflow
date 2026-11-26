import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { useToast } from './ToastContext';
import { firebaseAuth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

const createEntityId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const normalizeCard = (card) => ({
  ...card,
  id: card._id?.toString() || card.id,
});

export function AppProvider({ children }) {
  const toast = useToast();

  // Unique identifier for this specific browser tab instance
  const tabClientIdRef = useRef('tab_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36));

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sprintflow_auth_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(api.getToken() || localStorage.getItem('sprintflow_auth_user')));

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);

  // Active view: 'landing' (if not logged in) | 'personal' (default on login) | 'team'
  const [viewMode, setViewMode] = useState(() => (currentUser ? 'personal' : 'landing'));

  // Organizations / Spaces (Zero mock data - hydrates strictly from MongoDB)
  const [orgs, setOrgs] = useState(() => {
    const saved = localStorage.getItem('sprintflow_spaces');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [currentOrgId, setCurrentOrgId] = useState(() => {
    return localStorage.getItem('sprintflow_current_org_id') || '';
  });

  // Sub-tabs & Pages
  const [teamTab, setTeamTab] = useState('board');
  const [workspacePage, setWorkspacePage] = useState('personal');
  const [recentPages, setRecentPages] = useState(() => {
    const saved = localStorage.getItem('sprintflow_recent_pages');
    return saved ? JSON.parse(saved) : ['personal'];
  });
  const [starredOrgIds, setStarredOrgIds] = useState(() => {
    const saved = localStorage.getItem('sprintflow_starred_orgs');
    return saved ? JSON.parse(saved) : [];
  });

  // Tasks (Hydrated from MongoDB)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('sprintflow_light_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Plans & Epics (Hydrated from MongoDB)
  const [plans, setPlans] = useState([]);

  // Goals & OKRs (Hydrated from MongoDB)
  const [goals, setGoals] = useState([]);

  // Workspace Apps (Hydrated from MongoDB)
  const [apps, setApps] = useState([]);

  // Notifications (Hydrated from MongoDB)
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Chat
  const [channels, setChannels] = useState([
    { id: 'ch-general', name: 'general', description: 'Team wide announcements & discussions' },
    { id: 'ch-dev', name: 'engineering', description: 'Architecture & technical execution' },
  ]);
  const [activeChannelId, setActiveChannelId] = useState('ch-general');
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('sprintflow_light_chat');
    return saved ? JSON.parse(saved) : [];
  });

  // Users list (Registered users from MongoDB)
  const [usersList, setUsersList] = useState([]);

  // Keep currentUserRef in sync for real-time socket events
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sprintflow_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sprintflow_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (orgs.length > 0) {
      localStorage.setItem('sprintflow_spaces', JSON.stringify(orgs));
    }
  }, [orgs]);

  useEffect(() => {
    if (currentOrgId) {
      localStorage.setItem('sprintflow_current_org_id', currentOrgId);
    }
  }, [currentOrgId]);

  useEffect(() => {
    localStorage.setItem('sprintflow_starred_orgs', JSON.stringify(starredOrgIds));
  }, [starredOrgIds]);

  useEffect(() => {
    localStorage.setItem('sprintflow_recent_pages', JSON.stringify(recentPages));
  }, [recentPages]);

  // Join personal socket room on login & reconnect
  useEffect(() => {
    if (currentUser?.id) {
      socketService.joinUser(currentUser.id);
    }
  }, [currentUser?.id]);

  // Initial Auth verification
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setIsAuthLoading(false);
      return undefined;
    }

    let active = true;
    api.getCurrentUser()
      .then(({ user }) => {
        if (active && user) {
          setCurrentUser(user);
          socketService.joinUser(user.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Multi-Tab Session Synchronization & Anti-Bypass Guard
  useEffect(() => {
    let authChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        authChannel = new BroadcastChannel('sprintflow_auth_sync');
        authChannel.onmessage = (event) => {
          if (event.data?.type === 'AUTH_LOGOUT') {
            socketService.leaveUser();
            setNotifications([]);
            setUnreadNotificationsCount(0);
            api.setToken(null);
            setCurrentUser(null);
            setViewMode('landing');
          } else if (event.data?.type === 'AUTH_LOGIN' && event.data.user) {
            if (event.data.token) api.setToken(event.data.token);
            setCurrentUser(event.data.user);
            socketService.joinUser(event.data.user.id);
            setViewMode('personal');
          }
        };
      }
    } catch {}

    const handleStorageChange = (e) => {
      if (e.key === 'sprintflow_auth_user') {
        if (!e.newValue) {
          socketService.leaveUser();
          setNotifications([]);
          setUnreadNotificationsCount(0);
          api.setToken(null);
          setCurrentUser(null);
          setViewMode('landing');
        } else {
          try {
            const syncedUser = JSON.parse(e.newValue);
            setCurrentUser(syncedUser);
            socketService.joinUser(syncedUser.id);
            setViewMode('personal');
          } catch {}
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (authChannel) authChannel.close();
    };
  }, []);

  // Fetch registered users from MongoDB
  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getAllUsers();
      if (res?.users) {
        setUsersList(res.users);
      }
    } catch {}
  }, [currentUser]);

  // Fetch Organizations from MongoDB
  const fetchOrganizations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getOrganizations();
      if (res?.orgs && Array.isArray(res.orgs)) {
        const formatted = res.orgs.map((o) => ({
          ...o,
          id: o._id ? o._id.toString() : o.id,
        }));
        setOrgs(formatted);
        if (formatted.length > 0 && (!currentOrgId || !formatted.some((o) => o.id === currentOrgId))) {
          setCurrentOrgId(formatted[0].id);
        }
      }
    } catch (e) {
      console.warn('[AppContext] Failed to fetch spaces:', e.message);
    }
  }, [currentUser, currentOrgId]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const res = await api.getNotifications(30);
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadNotificationsCount(res.unreadCount ?? res.notifications.filter((n) => !n.read).length);
      }
    } catch {}
  }, [currentUser]);

  // Real-time socket event listeners
  useEffect(() => {
    const handleRemoteCardMoved = (data) => {
      if (data?.card?.id && data?.targetList) {
        setTasks((prev) =>
          prev.map((t) => (t.id === data.card.id ? { ...t, status: data.targetList } : t))
        );
      }
    };

    const handleRemoteCardCreated = (data) => {
      if (data?.card?.id) {
        setTasks((prev) => [
          data.card,
          ...prev.filter((t) => t.id !== data.card.id && t.key !== data.card.key),
        ]);
      }
    };

    const handleRemoteCardUpdated = (data) => {
      if (data?.card?.id) {
        if (data.card.archivedAt) {
          setTasks((prev) =>
            prev.filter((t) => t.id !== data.card.id && t.key !== data.card.key)
          );
          return;
        }
        setTasks((prev) => {
          const exists = prev.some((t) => t.id === data.card.id || t.key === data.card.key);
          if (!exists) return [data.card, ...prev];
          return prev.map((t) =>
            t.id === data.card.id || t.key === data.card.key ? { ...t, ...data.card } : t
          );
        });
      }
    };

    const handleRemoteCardDeleted = (data) => {
      if (data?.id) {
        setTasks((prev) => prev.filter((t) => t.id !== data.id));
      }
    };

    const handleRemoteChatMessage = (data) => {
      const msg = data?.message || data;
      if (msg && (msg.id || msg._id) && msg.text) {
        const cleanMsg = {
          ...msg,
          id: (msg.id || msg._id).toString(),
          userName: msg.userName || msg.username || msg.senderName || 'Team Member',
          username: msg.username || msg.userName || msg.senderName || 'Team Member',
          userAvatar: msg.userAvatar || msg.avatar || '',
        };
        setChatMessages((prev) => {
          if (prev.some((m) => (m.id || m._id)?.toString() === cleanMsg.id)) return prev;
          return [...prev, cleanMsg];
        });
      }
    };

    const handleNewNotification = (notif) => {
      const activeUser = currentUserRef.current;
      if (!activeUser?.id || !notif) return;
      if (notif.userId && notif.userId.toString() !== activeUser.id.toString()) return;
      setNotifications((prev) => [notif, ...prev.filter((n) => (n._id || n.id) !== (notif._id || notif.id))]);
      setUnreadNotificationsCount((prev) => prev + 1);
      toast.info(notif.title || 'New Notification', notif.message || '');
    };

    const handleSpaceInvited = (newSpace) => {
      const activeUser = currentUserRef.current;
      if (!activeUser?.id || !newSpace) return;
      const formatted = { ...newSpace, id: newSpace._id ? newSpace._id.toString() : newSpace.id };
      setOrgs((prev) => {
        const exists = prev.some((s) => s.id === formatted.id);
        if (exists) return prev.map((s) => (s.id === formatted.id ? formatted : s));
        return [formatted, ...prev];
      });
      toast.success('Added to Space', `You were added to "${formatted.name}".`);
    };

    const handleSpaceDeleted = (data) => {
      const deletedSpaceId = data?.spaceId;
      if (!deletedSpaceId) return;
      setOrgs((prev) => prev.filter((s) => s.id !== deletedSpaceId));
      if (currentOrgId === deletedSpaceId) {
        setViewMode('personal');
        toast.info('Space Removed', `The space "${data.name || ''}" was deleted.`);
      }
    };

    socketService.on('board:remote_card_moved', handleRemoteCardMoved);
    socketService.on('board:remote_card_created', handleRemoteCardCreated);
    socketService.on('board:remote_card_updated', handleRemoteCardUpdated);
    socketService.on('board:remote_card_deleted', handleRemoteCardDeleted);
    socketService.on('chat:new_message', handleRemoteChatMessage);
    socketService.on('notification:new', handleNewNotification);
    socketService.on('space:invited', handleSpaceInvited);
    socketService.on('space:deleted', handleSpaceDeleted);

    return () => {
      socketService.off('board:remote_card_moved', handleRemoteCardMoved);
      socketService.off('board:remote_card_created', handleRemoteCardCreated);
      socketService.off('board:remote_card_updated', handleRemoteCardUpdated);
      socketService.off('board:remote_card_deleted', handleRemoteCardDeleted);
      socketService.off('chat:new_message', handleRemoteChatMessage);
      socketService.off('notification:new', handleNewNotification);
      socketService.off('space:invited', handleSpaceInvited);
      socketService.off('space:deleted', handleSpaceDeleted);
    };
  }, [toast, currentOrgId]);

  // Initial loads on auth
  useEffect(() => {
    if (currentUser) {
      fetchOrganizations();
      fetchUsers();
      fetchNotifications();
    }
  }, [currentUser, fetchOrganizations, fetchUsers, fetchNotifications]);

  // Fetch live cards, plans, goals, apps when currentOrgId changes
  useEffect(() => {
    if (!currentUser || !currentOrgId) return;

    // Join space socket room
    socketService.joinBoard(currentOrgId);
    socketService.joinCanvas(currentOrgId);

    // Cards
    api.getCards({ orgId: currentOrgId })
      .then((res) => {
        if (res?.cards && Array.isArray(res.cards)) {
          const apiCards = res.cards.map((c) => ({
            ...c,
            id: c._id ? c._id.toString() : c.id,
          }));
          setTasks((prev) => {
            const other = prev.filter((t) => t.orgId !== currentOrgId);
            return [...apiCards, ...other];
          });
        }
      })
      .catch(() => {});

    // Plans
    api.getPlans(currentOrgId)
      .then((res) => {
        if (res?.plans) {
          const formatted = res.plans.map((p) => ({
            ...p,
            id: p._id ? p._id.toString() : p.id,
          }));
          setPlans(formatted);
        }
      })
      .catch(() => {});

    // Goals
    api.getGoals(currentOrgId)
      .then((res) => {
        if (res?.goals) {
          const formatted = res.goals.map((g) => ({
            ...g,
            id: g._id ? g._id.toString() : g.id,
          }));
          setGoals(formatted);
        }
      })
      .catch(() => {});

    // Apps
    api.getApps(currentOrgId)
      .then((res) => {
        if (res?.apps) setApps(res.apps);
      })
      .catch(() => {});
  }, [currentOrgId, currentUser]);

  // Navigation handlers
  const navigateTo = (pageId) => {
    setWorkspacePage(pageId);
    setRecentPages((prev) => [pageId, ...prev.filter((p) => p !== pageId)].slice(0, 10));
  };

  const setSafeViewMode = (mode) => {
    if (mode === 'landing') {
      setViewMode('landing');
      return;
    }
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setViewMode(mode);
  };

  const setSafeTeamTab = (tab) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setTeamTab(tab);
  };

  const toggleStarredOrg = (orgId) => {
    setStarredOrgIds((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  const selectOrg = (orgId) => {
    setCurrentOrgId(orgId);
    setWorkspacePage('projects');
  };

  // Spaces accessible to the current active user
  const userSpaces = orgs.filter((space) => {
    if (!currentUser) return true;
    const isOwner = space.ownerId === currentUser.id || space.ownerId?._id === currentUser.id;
    const isMember = space.members?.some((m) => (m.userId || m.id) === currentUser.id);
    return isOwner || isMember || space.role === 'admin' || space.role === 'member';
  });

  const rawCurrentOrg = orgs.find((o) => o.id === currentOrgId) || userSpaces[0] || orgs[0] || {
    id: 'space-default',
    name: 'General Workspace',
    slug: 'general',
    description: 'Sprint workspace',
    color: '#0052cc',
    role: 'admin',
    members: [],
  };

  const currentOrg = {
    ...rawCurrentOrg,
    id: rawCurrentOrg.id || rawCurrentOrg._id?.toString(),
    role: rawCurrentOrg.role || (rawCurrentOrg.ownerId === currentUser?.id ? 'admin' : 'member'),
    members: rawCurrentOrg.members || [],
    memberCount: rawCurrentOrg.members?.length || 1,
  };

  // Create a new Space
  const createSpace = async ({ name, description, color, invitedMemberIds = [], customInvites = [] }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return null;
    }

    try {
      const res = await api.createOrganization({
        name: name.trim(),
        description: description?.trim(),
        color: color || '#0052cc',
        inviteEmails: customInvites.map((e) => e.trim().toLowerCase()),
        invitedMemberIds,
      });

      if (res?.org) {
        const createdOrg = { ...res.org, id: res.org._id ? res.org._id.toString() : res.org.id };
        setOrgs((prev) => [createdOrg, ...prev.filter((o) => o.id !== createdOrg.id)]);
        setCurrentOrgId(createdOrg.id);
        toast.success('Space created', `"${createdOrg.name}" is ready.`);
        return createdOrg;
      }
    } catch (e) {
      console.error('Space creation failed:', e.message);
      toast.error('Failed to create space', e.message);
    }
    return null;
  };

  // Invite Member to Space
  const inviteMemberToSpace = useCallback(
    async (spaceId, { userId, email, role = 'member', emails = [] }) => {
      try {
        const payload = { role };
        if (userId) payload.userId = userId;
        if (email) payload.email = email.trim().toLowerCase();
        if (Array.isArray(emails) && emails.length > 0) {
          payload.emails = emails.map((e) => e.trim().toLowerCase());
        }

        const res = await api.inviteMember(spaceId, payload);
        if (res?.space) {
          const updated = { ...res.space, id: res.space._id ? res.space._id.toString() : res.space.id };
          setOrgs((prev) => prev.map((s) => (s.id === spaceId ? updated : s)));
        } else {
          // Re-fetch space members
          const membersRes = await api.getSpaceMembers(spaceId);
          if (membersRes?.members) {
            setOrgs((prev) =>
              prev.map((s) =>
                s.id === spaceId
                  ? { ...s, members: membersRes.members, memberCount: membersRes.members.length }
                  : s
              )
            );
          }
        }
        toast.success('Member invited', res?.message || 'Invitation dispatched successfully.');
        return res;
      } catch (err) {
        console.error('Invite member error:', err);
        toast.error('Invitation failed', err.message);
        throw err;
      }
    },
    [toast]
  );

  // Remove Member from Space
  const removeMemberFromSpace = useCallback(
    async (spaceId, targetUserId) => {
      try {
        await api.removeMember(spaceId, targetUserId);
        setOrgs((prev) =>
          prev.map((space) => {
            if (space.id !== spaceId) return space;
            const currentMembers = space.members || [];
            const updatedMembers = currentMembers.filter(
              (m) => (m.userId || m.id) !== targetUserId
            );
            return {
              ...space,
              members: updatedMembers,
              memberCount: updatedMembers.length,
            };
          })
        );
        toast.success('Member removed', 'User was removed from the space.');
      } catch (err) {
        console.error('Remove member error:', err);
        toast.error('Failed to remove member', err.message);
      }
    },
    [toast]
  );

  const deleteSpace = useCallback(
    async (spaceId) => {
      try {
        await api.deleteSpace(spaceId);
        setOrgs((prev) => prev.filter((s) => s.id !== spaceId));
        if (currentOrgId === spaceId) {
          const remaining = orgs.filter((s) => s.id !== spaceId);
          if (remaining.length > 0) {
            setCurrentOrgId(remaining[0].id);
            setTeamTab('board');
          } else {
            setCurrentOrgId(null);
            setViewMode('personal');
          }
        }
        toast.success('Space Deleted', 'The space and all its contents were permanently deleted.');
        return true;
      } catch (err) {
        toast.error('Failed to Delete Space', err.message || 'Only administrators can delete this space.');
        return false;
      }
    },
    [currentOrgId, orgs, setTeamTab, setViewMode, toast]
  );

  // Plans & Epics CRUD
  const addPlan = async (planData) => {
    try {
      const res = await api.createPlan({ ...planData, orgId: currentOrg.id });
      if (res?.plan) {
        const newPlan = { ...res.plan, id: res.plan._id ? res.plan._id.toString() : res.plan.id };
        setPlans((prev) => [newPlan, ...prev]);
        toast.success('Sprint plan created', `"${newPlan.title}" is active.`);
        return newPlan;
      }
    } catch (err) {
      toast.error('Failed to create plan', err.message);
    }
    return null;
  };

  const updatePlan = async (planId, updates) => {
    try {
      const res = await api.updatePlan(planId, updates);
      if (res?.plan) {
        const updated = { ...res.plan, id: res.plan._id ? res.plan._id.toString() : res.plan.id };
        setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
        toast.success('Plan updated', 'Sprint plan changes saved.');
        return updated;
      }
    } catch (err) {
      toast.error('Failed to update plan', err.message);
    }
    return null;
  };

  const deletePlan = async (planId) => {
    try {
      await api.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId && p._id !== planId));
      toast.success('Plan deleted', 'Sprint plan was removed.');
    } catch (err) {
      toast.error('Failed to delete plan', err.message);
    }
  };

  // Goals & OKRs CRUD
  const addGoal = async (goalData) => {
    try {
      const res = await api.createGoal({ ...goalData, orgId: currentOrg.id });
      if (res?.goal) {
        const newGoal = { ...res.goal, id: res.goal._id ? res.goal._id.toString() : res.goal.id };
        setGoals((prev) => [newGoal, ...prev]);
        toast.success('Goal created', `"${newGoal.title}" is tracked.`);
        return newGoal;
      }
    } catch (err) {
      toast.error('Failed to create goal', err.message);
    }
    return null;
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const res = await api.updateGoal(goalId, updates);
      if (res?.goal) {
        const updated = { ...res.goal, id: res.goal._id ? res.goal._id.toString() : res.goal.id };
        setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
        return updated;
      }
    } catch (err) {
      toast.error('Failed to update goal', err.message);
    }
    return null;
  };

  const deleteGoal = async (goalId) => {
    try {
      await api.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId && g._id !== goalId));
      toast.success('Goal deleted', 'Objective was removed.');
    } catch (err) {
      toast.error('Failed to delete goal', err.message);
    }
  };

  // Apps & Integrations
  const toggleApp = async (appId, enabled) => {
    try {
      await api.toggleApp(appId, currentOrg.id, enabled);
      setApps((prev) =>
        prev.map((a) => (a.appId === appId ? { ...a, enabled } : a))
      );
      toast.success('App updated', `${appId.toUpperCase()} integration is now ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      toast.error('Failed to update app', err.message);
    }
  };

  const configureApp = async (appId, config) => {
    try {
      const res = await api.configureApp(appId, currentOrg.id, config);
      if (res?.app) {
        setApps((prev) =>
          prev.map((a) => (a.appId === appId ? { ...a, config: res.app.config, enabled: res.app.enabled } : a))
        );
        toast.success('App configured', `${appId.toUpperCase()} settings saved to database.`);
      }
    } catch (err) {
      toast.error('Failed to configure app', err.message);
    }
  };

  // Dynamic Roadmap Epics (Synced with MongoDB plans)
  const addEpic = async ({ title, status = 'IN_PROGRESS', startDate, targetDate, deliverables = [] }) => {
    return addPlan({
      title,
      status: status === 'IN_PROGRESS' ? 'Active' : status === 'COMPLETED' ? 'Completed' : 'Upcoming',
      startDate,
      targetDate,
      deliverables,
    });
  };

  const updateEpic = async (epicId, updates) => {
    return updatePlan(epicId, updates);
  };

  const deleteEpic = async (epicId) => {
    return deletePlan(epicId);
  };

  const toggleEpicDeliverable = async (epicId, deliverableIndex) => {
    const targetPlan = plans.find((p) => p.id === epicId || p._id === epicId);
    if (!targetPlan) return;

    const total = (targetPlan.deliverables || []).length || 1;
    const newProgress = Math.min(100, Math.round(((deliverableIndex + 1) / total) * 100));
    const newStatus = newProgress === 100 ? 'Completed' : 'Active';

    await updatePlan(epicId, {
      velocityRate: targetPlan.velocityRate === 100 ? Math.round(((total - 1) / total) * 100) : newProgress,
      status: targetPlan.velocityRate === 100 ? 'Active' : newStatus,
    });
  };

  // Card & Kanban operations
  const currentOrgTasks = tasks.filter((t) => t.orgId === currentOrg.id && !t.archivedAt);
  const personalTasks = tasks.filter((t) => t.assigneeId === currentUser?.id && !t.archivedAt);

  const addTask = async (payload) => {
    const targetOrgId = payload.orgId || currentOrg.id;
    const orgTasks = tasks.filter((t) => t.orgId === targetOrgId);
    const orgPrefix = currentOrg.slug?.slice(0, 3).toUpperCase() || 'TSK';
    const nextNum = orgTasks.length + 1;
    const key = `${orgPrefix}-${nextNum.toString().padStart(2, '0')}`;

    const newTask = {
      id: createEntityId('card'),
      orgId: targetOrgId,
      key,
      title: payload.title,
      description: payload.description || '',
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      type: payload.type || 'task',
      assigneeId: payload.assigneeId || currentUser?.id,
      dueDate: payload.dueDate || '',
      order: orgTasks.length,
      tags: payload.tags || ['Frontend'],
      acceptanceCriteria: payload.acceptanceCriteria || [],
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const response = await api.createCard(newTask);
      const savedCard = response?.card ? normalizeCard(response.card) : newTask;

      if (savedCard.id !== newTask.id) {
        setTasks((prev) => prev.map((task) => (task.id === newTask.id ? savedCard : task)));
      }

      socketService.emitCardCreated({
        boardId: targetOrgId,
        card: savedCard,
        user: currentUser || { name: 'Teammate' },
      });
      return savedCard;
    } catch (err) {
      toast.error('Failed to save task', err.message || 'Please try again.');
      return newTask;
    }
  };

  const broadcastTaskUpdate = (card) => {
    socketService.emitCardUpdated({
      boardId: card.orgId,
      card,
      user: currentUser || { name: 'Teammate' },
    });
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );

    const updatedTask = tasks.find((t) => t.id === taskId);
    if (updatedTask) {
      broadcastTaskUpdate({ ...updatedTask, ...updates });
      api.updateCard(taskId, updates).catch(() => {});
    }
  };

  const deleteTask = (taskId) => {
    const movingTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (movingTask) {
      socketService.emitCardDeleted({ boardId: movingTask.orgId, id: taskId });
      api.deleteCard(taskId).catch(() => {});
    }
  };

  const archiveTask = async (taskId) => {
    const response = await api.archiveCard(taskId);
    if (!response?.card) throw new Error('The task could not be archived.');
    const archivedCard = normalizeCard(response.card);
    setTasks((prev) =>
      prev.filter((task) => task.id !== taskId && task.key !== archivedCard.key)
    );
    broadcastTaskUpdate(archivedCard);
    return archivedCard;
  };

  const restoreTask = async (taskId) => {
    const response = await api.restoreCard(taskId);
    if (!response?.card) throw new Error('The task could not be restored.');
    const restoredCard = {
      ...normalizeCard(response.card),
      archivedAt: null,
    };
    setTasks((prev) => [
      restoredCard,
      ...prev.filter((task) => task.id !== restoredCard.id && task.key !== restoredCard.key),
    ]);
    broadcastTaskUpdate(restoredCard);
    return restoredCard;
  };

  const archiveDoneTasks = async (orgId) => {
    const activeOrgId = orgId || currentOrg.id;
    const response = await api.archiveDoneCards(activeOrgId);
    const archivedCards = response?.cards || [];
    const archivedIds = new Set(archivedCards.map((card) => card._id?.toString()));
    const archivedKeys = new Set(archivedCards.map((card) => card.key));
    setTasks((prev) =>
      prev.filter(
        (task) =>
          task.orgId !== activeOrgId ||
          (!archivedIds.has(task.id) && !archivedKeys.has(task.key))
      )
    );
    archivedCards.forEach((card) => {
      broadcastTaskUpdate(normalizeCard(card));
    });
    return archivedCards.length;
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movingTask = tasks.find((t) => t.id === draggableId);
    if (!movingTask) return;

    const updatedTasks = tasks.map((t) =>
      t.id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updatedTasks);

    socketService.emitCardMoved({
      boardId: movingTask.orgId,
      card: movingTask,
      sourceList: source.droppableId,
      targetList: destination.droppableId,
      user: currentUser || { name: 'Teammate' },
    });

    api.updateCard(movingTask.id, { status: destination.droppableId }).catch(() => {});

    if (destination.droppableId === 'done' && source.droppableId !== 'done') {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0052cc', '#10b981', '#6366f1', '#f59e0b'],
      });
    }
  };

  // Chat
  const sendChatMessage = (text) => {
    if (!text.trim() || !currentUser) return;
    const orgId = currentOrgId || currentOrg?.id || currentOrg?._id || '';
    const newMessage = {
      id: createEntityId('msg'),
      channelId: activeChannelId,
      orgId: orgId.toString(),
      userId: (currentUser.id || currentUser._id)?.toString(),
      senderClientId: tabClientIdRef.current,
      userName: currentUser.name || currentUser.username || 'User',
      username: currentUser.name || currentUser.username || 'User',
      userAvatar: currentUser.avatar || '',
      role: currentOrg?.role || 'member',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    socketService.emitChatMessage({
      channelId: activeChannelId,
      orgId: orgId.toString(),
      message: newMessage,
    });
    api.sendMessage(activeChannelId, text.trim(), {
      userAvatar: currentUser.avatar || '',
      role: currentOrg?.role || 'member',
    }).catch(() => {});
  };

  // Persist chat messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sprintflow_light_chat', JSON.stringify(chatMessages.slice(-200)));
    } catch (_) {}
  }, [chatMessages]);

  // Join active chat channel socket room
  useEffect(() => {
    if (activeChannelId) {
      socketService.joinChat(activeChannelId);
    }
  }, [activeChannelId]);

  // Auth operations
  const login = (user, token) => {
    if (!user) return;
    if (token) api.setToken(token);
    setCurrentUser(user);
    socketService.joinUser(user.id);
    setViewMode('personal');
    setIsAuthModalOpen(false);

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sprintflow_auth_sync');
        channel.postMessage({ type: 'AUTH_LOGIN', user, token });
        channel.close();
      }
    } catch {}

    fetchOrganizations();
    fetchUsers();
    fetchNotifications();
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('sprintflow_auth_sync');
        channel.postMessage({ type: 'AUTH_LOGOUT' });
        channel.close();
      }
    } catch {}

    socketService.leaveUser();
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setTasks([]);
    setOrgs([]);
    setCurrentOrgId(null);

    api.logout().catch(() => {});
    signOut(firebaseAuth).catch(() => {});
    api.setToken(null);
    setCurrentUser(null);
    setViewMode('landing');
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => ((n._id === id || n.id === id) ? { ...n, read: true } : n))
    );
    setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotificationsCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
  };

  const updateCurrentUser = async (profileData) => {
    const updated = { ...currentUser, ...profileData };
    setCurrentUser(updated);

    setUsersList((prev) =>
      prev.map((u) => (u.id === currentUser?.id ? { ...u, ...profileData } : u))
    );

    try {
      await api.updateProfile(profileData);
      toast.success('Profile updated', 'Your changes have been saved.');
    } catch (e) {
      toast.error('Failed to update profile', e.message);
    }
  };

  // Members list for current space
  const currentSpaceMembers = (currentOrg.members || []).map((m) => {
    const user = usersList.find((u) => (u.id || u._id) === (m.userId || m.id));
    return {
      id: m.userId || m.id,
      userId: m.userId || m.id,
      name: user?.name || m.name || 'Team Member',
      avatar: user?.avatar || m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: m.role || 'member',
      title: user?.title || m.title || 'Team Member',
      email: user?.email || m.email || '',
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        login,
        logout,
        updateCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isMetricsOpen,
        setIsMetricsOpen,
        viewMode,
        setViewMode: setSafeViewMode,
        workspacePage,
        navigateTo,
        recentPages,
        starredOrgIds,
        toggleStarredOrg,
        orgs,
        spaces: orgs,
        userSpaces,
        currentOrg,
        currentSpace: currentOrg,
        currentOrgId,
        setCurrentOrgId,
        selectOrg,
        createSpace,
        deleteSpace,
        inviteMemberToSpace,
        removeMemberFromSpace,
        teamTab,
        setTeamTab: setSafeTeamTab,
        tasks: currentOrgTasks,
        allTasks: tasks,
        personalTasks,
        addTask,
        updateTask,
        deleteTask,
        archiveTask,
        restoreTask,
        archiveDoneTasks,
        handleDragEnd,
        // Plans & Sprint Capacity
        plans,
        addPlan,
        updatePlan,
        deletePlan,
        // Goals & OKRs
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        // Apps & Integrations
        apps,
        toggleApp,
        configureApp,
        // Roadmap Epics (Synced with Plans)
        roadmapItems: plans.map((p) => ({
          ...p,
          progress: p.velocityRate || p.progress || 0,
        })),
        allRoadmapItems: plans,
        addEpic,
        updateEpic,
        deleteEpic,
        toggleEpicDeliverable,
        // Chat
        channels,
        activeChannelId,
        setActiveChannelId,
        chatMessages: chatMessages.filter((m) => m.channelId === activeChannelId),
        sendChatMessage,
        tabClientId: tabClientIdRef.current,
        // Notifications
        notifications,
        unreadNotificationsCount,
        refreshNotifications: fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        refreshSpaces: fetchOrganizations,
        // Members & Users
        members: currentSpaceMembers.length > 0 ? currentSpaceMembers : usersList,
        allUsers: usersList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
