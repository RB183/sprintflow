import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_BOARDS } from '../data/mockData';
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

  // Organizations / Teams
  const [orgs, setOrgs] = useState(MOCK_ORGS);
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

  const currentOrg = orgs.find((o) => o.id === currentOrgId) || orgs[0];

  // Personal tasks
  const personalTasks = tasks.filter(
    (t) => t.assigneeId === currentUser?.id || t.assigneeId === 'usr-root' || !currentUser
  );

  // Org Tasks
  const currentOrgTasks = tasks.filter((t) => t.orgId === currentOrgId);

  // Add Task
  const addTask = (payload) => {
    const targetOrgId = payload.orgId || currentOrgId;
    const org = orgs.find((o) => o.id === targetOrgId);

    const newTask = {
      id: `task-${Date.now()}`,
      orgId: targetOrgId,
      key: `${(org?.slug || 'TASK').substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      title: payload.title || 'Untitled Task',
      description: payload.description || '',
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      type: payload.type || 'task',
      assigneeId: currentUser?.id || 'usr-root',
      dueDate: payload.dueDate || new Date().toISOString().split('T')[0],
      order: tasks.filter((t) => t.orgId === targetOrgId).length,
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
      .filter((t) => t.orgId === currentOrgId && t.status === destStatus && t.id !== draggableId)
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
        currentOrg,
        selectOrg,
        teamTab,
        setTeamTab,
        tasks: currentOrgTasks,
        allTasks: tasks,
        personalTasks,
        addTask,
        updateTask,
        deleteTask,
        handleDragEnd,
        roadmapItems: roadmapItems.filter((r) => r.orgId === currentOrgId),
        channels: channels.filter((c) => c.orgId === currentOrgId || !c.orgId),
        activeChannelId,
        setActiveChannelId,
        chatMessages: chatMessages.filter((m) => m.channelId === activeChannelId),
        sendChatMessage,
        members: MOCK_USERS,
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
