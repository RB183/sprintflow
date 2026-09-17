import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import {
  MOCK_ORGS,
  MOCK_TASKS,
  MOCK_ROADMAP,
  MOCK_CHAT_CHANNELS,
  MOCK_CHAT_MESSAGES,
} from '../data/hackerMockData';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sprintflow_auth_user');
    return saved ? JSON.parse(saved) : null; // null means guest on landing page
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active view: 'landing' (if not logged in) | 'personal' (default on login) | 'team'
  const [viewMode, setViewMode] = useState(() => {
    return currentUser ? 'personal' : 'landing';
  });

  // Organizations / Spaces
  const [orgs, setOrgs] = useState(() => {
    const saved = localStorage.getItem('sprintflow_spaces');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure members array exists on all spaces (migration from older local state)
        return parsed.map((space) => {
          const defaultOrg = MOCK_ORGS.find((o) => o.id === space.id);
          return {
            ...space,
            members: space.members || defaultOrg?.members || [
              { userId: 'usr-1', role: 'admin' },
              { userId: 'usr-root', role: 'admin' },
            ],
            ownerId: space.ownerId || defaultOrg?.ownerId || 'usr-1',
          };
        });
      } catch {
        return MOCK_ORGS;
      }
    }
    return MOCK_ORGS;
  });
  const [currentOrgId, setCurrentOrgId] = useState('org-1');

  // Active sub-tab inside team space: 'board' | 'roadmap' | 'canvas' | 'chat'
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

  // Tasks
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('sprintflow_light_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  // Roadmap Items
  const [roadmapItems, setRoadmapItems] = useState(MOCK_ROADMAP);

  // Chat
  const [channels] = useState(MOCK_CHAT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('ch-1');
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('sprintflow_light_chat');
    return saved ? JSON.parse(saved) : MOCK_CHAT_MESSAGES;
  });

  // Save changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sprintflow_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sprintflow_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sprintflow_spaces', JSON.stringify(orgs));
  }, [orgs]);

  useEffect(() => {
    localStorage.setItem('sprintflow_light_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sprintflow_light_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('sprintflow_recent_pages', JSON.stringify(recentPages));
  }, [recentPages]);

  useEffect(() => {
    localStorage.setItem('sprintflow_starred_orgs', JSON.stringify(starredOrgIds));
  }, [starredOrgIds]);

  const login = (user) => {
    const activeUser = user || MOCK_USERS[0];
    setCurrentUser(activeUser);
    setViewMode('personal');
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setViewMode('landing');
  };

  // Spaces accessible to the current active user
  const userSpaces = orgs.filter((space) => {
    if (!currentUser) return true;
    if (currentUser.id === 'usr-root') return true;
    return space.members?.some((m) => m.userId === currentUser.id) || space.ownerId === currentUser.id;
  });

  // Ensure currentOrg is accessible or fall back to first user space
  const rawCurrentOrg = orgs.find((o) => o.id === currentOrgId) || userSpaces[0] || orgs[0];
  const userMemberRecord = rawCurrentOrg?.members?.find((m) => m.userId === (currentUser?.id || 'usr-1'));
  const currentOrg = {
    ...rawCurrentOrg,
    role: userMemberRecord?.role || rawCurrentOrg?.role || 'member',
    memberCount: rawCurrentOrg?.members?.length || rawCurrentOrg?.memberCount || 1,
  };

  // Users list (persisted to support dynamically added members via link/invite)
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('sprintflow_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  useEffect(() => {
    localStorage.setItem('sprintflow_all_users', JSON.stringify(usersList));
  }, [usersList]);

  // Create a new Space
  const createSpace = ({ name, description, color, invitedMemberIds = [], customInvites = [] }) => {
    const activeUserId = currentUser?.id || 'usr-1';
    const newSpaceId = `space-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'space';
    
    // Process custom invites (email/name)
    const newMembersFromCustom = [];
    if (customInvites && customInvites.length > 0) {
      customInvites.forEach((invite) => {
        const emailOrName = typeof invite === 'string' ? invite.trim() : invite.email || invite.name;
        if (!emailOrName) return;
        const existing = usersList.find((u) => u.email?.toLowerCase() === emailOrName.toLowerCase() || u.name?.toLowerCase() === emailOrName.toLowerCase());
        if (existing) {
          newMembersFromCustom.push({ userId: existing.id, role: 'member' });
        } else {
          const newUserId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const displayName = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;
          const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
          const newUser = {
            id: newUserId,
            name: formattedName,
            email: emailOrName.includes('@') ? emailOrName : `${emailOrName.toLowerCase()}@team.io`,
            role: 'member',
            title: 'Guest Collaborator',
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            color: '#6366f1',
          };
          setUsersList((prev) => [...prev, newUser]);
          newMembersFromCustom.push({ userId: newUserId, role: 'member' });
        }
      });
    }

    const membersList = [
      { userId: activeUserId, role: 'admin' },
      ...(activeUserId !== 'usr-root' ? [{ userId: 'usr-root', role: 'admin' }] : []),
      ...invitedMemberIds
        .filter((id) => id !== activeUserId && id !== 'usr-root')
        .map((userId) => ({ userId, role: 'member' })),
      ...newMembersFromCustom,
    ];

    const newSpace = {
      id: newSpaceId,
      name: name.trim(),
      slug,
      description: description?.trim() || 'Collaborative team space',
      color: color || '#0052cc',
      ownerId: activeUserId,
      role: 'admin',
      memberCount: membersList.length,
      activeTasks: 0,
      members: membersList,
      inviteLink: `${window.location.origin}/join/${slug}-${newSpaceId}`,
    };

    setOrgs((prev) => [...prev, newSpace]);
    setCurrentOrgId(newSpaceId);
    setViewMode('team');
    setTeamTab('board');
    setWorkspacePage('projects');

    return newSpace;
  };

  // Invite Member to a Space (supports userId or email/custom person)
  const inviteMemberToSpace = (spaceId, { userId, email, name, role = 'member' }) => {
    let targetUserId = userId;

    if (!targetUserId && (email || name)) {
      const emailOrName = (email || name).trim();
      const existing = usersList.find((u) => u.email?.toLowerCase() === emailOrName.toLowerCase() || u.name?.toLowerCase() === emailOrName.toLowerCase());
      if (existing) {
        targetUserId = existing.id;
      } else {
        targetUserId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const displayName = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        const newUser = {
          id: targetUserId,
          name: formattedName,
          email: emailOrName.includes('@') ? emailOrName : `${emailOrName.toLowerCase()}@team.io`,
          role: 'member',
          title: 'Guest Collaborator',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          color: '#6366f1',
        };
        setUsersList((prev) => [...prev, newUser]);
      }
    }

    if (!targetUserId) return;

    setOrgs((prev) =>
      prev.map((space) => {
        if (space.id !== spaceId) return space;
        const currentMembers = space.members || [];
        const existingIndex = currentMembers.findIndex((m) => m.userId === targetUserId);
        let updatedMembers;
        if (existingIndex >= 0) {
          updatedMembers = currentMembers.map((m, idx) =>
            idx === existingIndex ? { ...m, role } : m
          );
        } else {
          updatedMembers = [...currentMembers, { userId: targetUserId, role }];
        }
        return {
          ...space,
          members: updatedMembers,
          memberCount: updatedMembers.length,
        };
      })
    );
  };

  // Personal tasks
  const personalTasks = tasks.filter(
    (t) => t.assigneeId === currentUser?.id || t.assigneeId === 'usr-root' || !currentUser
  );

  // Org Tasks
  const currentOrgTasks = tasks.filter((t) => t.orgId === currentOrg.id);

  // Add Task
  const addTask = (payload) => {
    const targetOrgId = payload.orgId || currentOrg.id;
    const org = orgs.find((o) => o.id === targetOrgId) || currentOrg;

    const newTask = {
      id: `task-${Date.now()}`,
      orgId: targetOrgId,
      key: `${(org?.slug || 'TASK').substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      title: payload.title || 'Untitled Task',
      description: payload.description || '',
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      type: payload.type || 'task',
      assigneeId: payload.assigneeId || currentUser?.id || 'usr-root',
      dueDate: payload.dueDate || new Date().toISOString().split('T')[0],
      order: tasks.filter((t) => t.orgId === targetOrgId && t.status === (payload.status || 'todo')).length,
      tags: payload.tags || ['Feature'],
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Drag and Drop
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStatus = destination.droppableId;
    const movingTask = tasks.find((t) => t.id === draggableId);
    if (!movingTask) return;

    const columnTasks = tasks
      .filter((t) => t.orgId === currentOrg.id && t.status === destStatus && t.id !== draggableId)
      .sort((a, b) => a.order - b.order);

    columnTasks.splice(destination.index, 0, {
      ...movingTask,
      status: destStatus,
    });

    const updatedColumnTasks = columnTasks.map((t, idx) => ({
      ...t,
      order: idx,
    }));

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    updatedColumnTasks.forEach((t) => taskMap.set(t.id, t));

    setTasks(Array.from(taskMap.values()));

    if (destStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0052cc', '#10b981', '#6366f1', '#f59e0b'],
      });
    }
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      username: currentUser?.name || 'Guest User',
      role: currentOrg.role,
      text: text.trim(),
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const selectOrg = (orgId) => {
    setCurrentOrgId(orgId);
    setViewMode('team');
    setWorkspacePage('projects');
  };

  const navigateTo = (page) => {
    setWorkspacePage(page);
    setRecentPages((previous) => [page, ...previous.filter((item) => item !== page)].slice(0, 6));
  };

  const toggleStarredOrg = (orgId) => {
    setStarredOrgIds((previous) =>
      previous.includes(orgId) ? previous.filter((id) => id !== orgId) : [...previous, orgId]
    );
  };

  // Get active members for current space
  const currentSpaceMembers = (currentOrg.members || []).map((m) => {
    const user = usersList.find((u) => u.id === m.userId);
    return {
      id: m.userId,
      name: user?.name || m.userId,
      email: user?.email || '',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: m.role || 'member',
      title: user?.title || 'Team Member',
      color: user?.color || '#6366f1',
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        viewMode,
        setViewMode,
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
        selectOrg,
        createSpace,
        inviteMemberToSpace,
        teamTab,
        setTeamTab,
        tasks: currentOrgTasks,
        allTasks: tasks,
        personalTasks,
        addTask,
        updateTask,
        deleteTask,
        handleDragEnd,
        roadmapItems: roadmapItems.filter((r) => r.orgId === currentOrg.id),
        channels: channels.filter((c) => c.orgId === currentOrg.id || !c.orgId),
        activeChannelId,
        setActiveChannelId,
        chatMessages: chatMessages.filter((m) => m.channelId === activeChannelId),
        sendChatMessage,
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
