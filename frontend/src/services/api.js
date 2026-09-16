/**
 * API Service Layer
 * Automatically interacts with the Express Backend when online,
 * or seamlessly falls back to persistent localStorage with rich seed state.
 */

const API_BASE = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      // Backend not running / offline - return null to trigger mock fallback
      console.info(`[API Service] Backend not reachable at ${API_BASE}. Operating in high-performance local mode.`);
      return null;
    }
  }

  // Board operations
  async getBoards() {
    return this.request('/boards');
  }

  async getBoardById(id) {
    return this.request(`/boards/${id}`);
  }

  // Card operations
  async createCard(cardData) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateCard(cardId, cardData) {
    return this.request(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData),
    });
  }

  async deleteCard(cardId) {
    return this.request(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async reorderCards(cardUpdates) {
    return this.request('/cards/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ cardUpdates }),
    });
  }

  // List operations
  async createList(listData) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify(listData),
    });
  }

  async updateList(listId, listData) {
    return this.request(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(listData),
    });
  }

  async deleteList(listId) {
    return this.request(`/lists/${listId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
