/**
 * Socket.io Real-Time Synchronization Service
 * Connects to the Express / Socket.io Backend for live multi-user collaboration
 * across boards, whiteboards, and channels, with automatic reconnection and fallback.
 */

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const customSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (customSocketUrl) {
    return customSocketUrl.trim().replace(/\/$/, '');
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    if (typeof window !== 'undefined') {
      return window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin;
    }
    return 'http://localhost:5000';
  }
  try {
    const url = new URL(apiUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'http://localhost:5000';
  }
};

class SocketService {
  constructor() {
    this.listeners = new Map();
    this.socket = null;
    this.connected = false;
    this.currentUserId = null;
    this.currentBoardId = null;
    this.currentCanvasOrgId = null;
    this.currentChannelId = null;
    this.initSocket();
  }

  initSocket() {
    try {
      this.socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.connected = true;
        if (this.currentUserId) {
          this.socket.emit('user:join', this.currentUserId);
          this.socket.emit('join:user', this.currentUserId);
        }
        if (this.currentBoardId) {
          this.socket.emit('board:join', this.currentBoardId);
        }
        if (this.currentCanvasOrgId) {
          this.socket.emit('canvas:join_room', this.currentCanvasOrgId);
        }
        if (this.currentChannelId) {
          this.socket.emit('chat:join_channel', this.currentChannelId);
        }
      });

      this.socket.on('disconnect', () => {
        this.connected = false;
      });

      this.socket.on('connect_error', () => {
        this.connected = false;
      });

      // Forward remote events to local registered listeners
      const forwardEvents = [
        'board:remote_card_moved',
        'board:remote_card_created',
        'board:remote_card_updated',
        'board:remote_card_deleted',
        'canvas:remote_stroke',
        'canvas:remote_cursor',
        'canvas:remote_clear',
        'chat:new_message',
        'notification:new',
        'space:invited',
        'space:updated',
        'space:deleted',
      ];

      forwardEvents.forEach((evt) => {
        this.socket.on(evt, (data) => {
          this.emit(evt, data);
        });
      });
    } catch (err) {
      console.warn('[SocketService] WebSocket init error:', err);
    }
  }

  joinUser(userId) {
    if (!userId) return;
    this.currentUserId = userId.toString();
    if (this.socket) {
      this.socket.emit('user:join', this.currentUserId);
      this.socket.emit('join:user', this.currentUserId);
    }
  }

  leaveUser() {
    if (this.currentUserId && this.socket) {
      this.socket.emit('user:leave', this.currentUserId);
      this.socket.emit('leave:user', this.currentUserId);
    }
    this.currentUserId = null;
  }

  joinBoard(boardId) {
    if (!boardId) return;
    this.currentBoardId = boardId.toString();
    if (this.socket) {
      this.socket.emit('board:join', this.currentBoardId);
    }
  }

  joinCanvas(orgId) {
    if (!orgId) return;
    this.currentCanvasOrgId = orgId.toString();
    if (this.socket) {
      this.socket.emit('canvas:join_room', this.currentCanvasOrgId);
    }
  }

  joinChat(channelId) {
    if (!channelId) return;
    this.currentChannelId = channelId.toString();
    if (this.socket) {
      this.socket.emit('chat:join_channel', this.currentChannelId);
    }
  }

  emitCardMoved(data) {
    if (this.socket) {
      this.socket.emit('board:card_moved', data);
    }
    this.broadcastToast({
      id: `toast-${Date.now()}`,
      type: 'move',
      user: data.user,
      card: data.card,
      sourceList: data.sourceList,
      targetList: data.targetList,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  emitCardCreated(data) {
    if (this.socket) {
      this.socket.emit('board:card_created', data);
    }
    this.broadcastToast({
      id: `toast-${Date.now()}`,
      type: 'create',
      user: data.user,
      card: data.card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  emitCardUpdated(data) {
    if (this.socket) {
      this.socket.emit('board:card_updated', data);
    }
    this.broadcastToast({
      id: `toast-${Date.now()}`,
      type: 'update',
      user: data.user,
      card: data.card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  emitCardDeleted(data) {
    if (this.socket) {
      this.socket.emit('board:card_deleted', data);
    }
  }

  emitCanvasStroke(data) {
    if (this.socket) {
      this.socket.emit('canvas:draw_stroke', data);
    }
  }

  emitCanvasClear(data) {
    if (this.socket) {
      this.socket.emit('canvas:clear', data);
    }
  }

  emitChatMessage(data) {
    if (this.socket) {
      this.socket.emit('chat:send_message', data);
    }
  }

  broadcastToast(toast) {
    this.emit('activity_toast', toast);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const filtered = this.listeners.get(event).filter((cb) => cb !== callback);
    this.listeners.set(event, filtered);
  }

  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach((cb) => cb(data));
  }
}

export const socketService = new SocketService();
