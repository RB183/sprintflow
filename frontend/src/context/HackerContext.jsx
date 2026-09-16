import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MOCK_CURRENT_USER,
  MOCK_ORGS,
  MOCK_TASKS,
  MOCK_ROADMAP,
  MOCK_CHAT_CHANNELS,
  MOCK_CHAT_MESSAGES,
  MOCK_TEAM_MEMBERS,
} from '../data/hackerMockData';

const HackerContext = createContext(null);

export function HackerProvider({ children }) {
  const [currentUser] = useState(MOCK_CURRENT_USER);
  const [orgs, setOrgs] = useState(() => {
    const saved = localStorage.getItem('hacker_orgs');
    return saved ? JSON.parse(saved) : MOCK_ORGS;
  });

  const [currentOrgId, setCurrentOrgId] = useState(() => {
    return localStorage.getItem('hacker_active_org_id') || 'org-1';
  });

  // Default view is 'personal' (Personal Workspace)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('hacker_view_mode') || 'personal';
  });

  // Active sub-tab inside team space: 'board' | 'roadmap' | 'canvas' | 'chat'
  const [teamTab, setTeamTab] = useState('board');

  // Tasks (All tasks across all orgs)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('hacker_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  // Roadmap Items
  const [roadmapItems, setRoadmapItems] = useState(() => {
    const saved = localStorage.getItem('hacker_roadmap');
    return saved ? JSON.parse(saved) : MOCK_ROADMAP;
  });

  // Chat channels & messages
  const [channels] = useState(MOCK_CHAT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState('ch-1');
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('hacker_chat_msgs');
    return saved ? JSON.parse(saved) : MOCK_CHAT_MESSAGES;
  });

  // Command palette modal state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hacker_orgs', JSON.stringify(orgs));
  }, [orgs]);

  useEffect(() => {
    localStorage.setItem('hacker_active_org_id', currentOrgId);
  }, [currentOrgId]);

  useEffect(() => {
    localStorage.setItem('hacker_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('hacker_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('hacker_chat_msgs', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentOrg = orgs.find((o) => o.id === currentOrgId) || orgs[0];

  // Personal tasks (tasks assigned to current user OR created by user across all orgs)
  const personalTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  // Current Org Tasks
  const currentOrgTasks = tasks.filter((t) => t.orgId === currentOrgId);

  // Add Task
  const addTask = (taskPayload) => {
    const orgTargetId = taskPayload.orgId || currentOrgId;
    const orgTasks = tasks.filter((t) => t.orgId === orgTargetId);
    const org = orgs.find((o) => o.id === orgTargetId);

    const newTask = {
      id: `task-${Date.now()}`,
      orgId: orgTargetId,
      key: `${(org?.slug || 'TASK').substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      title: taskPayload.title || 'Untitled Task',
      description: taskPayload.description || '',
      status: taskPayload.status || 'todo',
      priority: taskPayload.priority || 'medium',
      type: taskPayload.type || 'task',
      assigneeId: taskPayload.assigneeId || currentUser.id,
      dueDate: taskPayload.dueDate || new Date().toISOString().split('T')[0],
      order: orgTasks.length,
      tags: taskPayload.tags || ['General'],
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  // Update Task Status / Fields
  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  // Delete Task
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Drag and Drop reorder for Kanban
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const destStatus = destination.droppableId; // 'todo' | 'in_progress' | 'done'
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
  };

  // Send Terminal Chat Message
  const sendChatMessage = (text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newMsg = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      username: currentUser.username,
      role: currentOrg.role,
      text: text.trim(),
      timestamp: timeStr,
    };

    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Switch Organization
  const selectOrg = (orgId) => {
    setCurrentOrgId(orgId);
    setViewMode('team');
  };

  return (
    <HackerContext.Provider
      value={{
        currentUser,
        orgs,
        currentOrg,
        selectOrg,
        viewMode,
        setViewMode,
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
        members: MOCK_TEAM_MEMBERS,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
      }}
    >
      {children}
    </HackerContext.Provider>
  );
}

export function useHacker() {
  const context = useContext(HackerContext);
  if (!context) {
    throw new Error('useHacker must be used within a HackerProvider');
  }
  return context;
}
