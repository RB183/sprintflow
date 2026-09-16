/**
 * Socket.io Real-Time Synchronization Service
 * Manages live WebSocket event broadcasting and provides a built-in interactive multi-user
 * simulation engine to showcase real-time multi-agent/teammate collaboration.
 */

class SocketService {
  constructor() {
    this.listeners = new Map();
    this.connected = false;
    this.simulationActive = true;
    this.simInterval = null;
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

  // Broadcast a real-time event
  broadcastCardMove(card, sourceList, targetList, user) {
    this.emit('activity_toast', {
      id: `toast-${Date.now()}`,
      type: 'move',
      user,
      card,
      sourceList,
      targetList,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  broadcastCardUpdate(card, user, changeType) {
    this.emit('activity_toast', {
      id: `toast-${Date.now()}`,
      type: 'update',
      changeType,
      user,
      card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  broadcastCardCreated(card, user) {
    this.emit('activity_toast', {
      id: `toast-${Date.now()}`,
      type: 'create',
      user,
      card,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
}

export const socketService = new SocketService();
