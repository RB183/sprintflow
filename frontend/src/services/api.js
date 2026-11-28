/**
 * API Service Layer
 * Interacts with the SprintFlow Production Express API & WebSocket Engine
 */

const normalizeApiBase = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (!envUrl) return 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_BASE = normalizeApiBase();

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

  getToken() {
    return this.token;
  }

  async authRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Authentication request failed');
    }
    return data;
  }

  register(userData) {
    return this.authRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  login(credentials) {
    return this.authRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  firebaseLogin(idToken) {
    return this.authRequest('/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  getCurrentUser() {
    return this.authRequest('/auth/me');
  }

  updateProfile(profileData) {
    return this.authRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  logout() {
    return this.authRequest('/auth/logout', { method: 'POST' });
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
        credentials: 'include',
        referrerPolicy: 'no-referrer',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[API] Request to ${endpoint} failed:`, err.message);
      return null;
    }
  }

  // Organizations / Spaces
  async getOrganizations() {
    return this.request('/orgs');
  }

  async createOrganization(orgData) {
    return this.request('/orgs', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  async getSpaceMembers(orgId) {
    return this.request(`/orgs/${orgId}/members`);
  }

  async getAllUsers() {
    return this.request('/users');
  }

  async inviteMember(orgId, memberData) {
    return this.request(`/orgs/${orgId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async removeMember(orgId, userId) {
    return this.request(`/orgs/${orgId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async deleteSpace(spaceId) {
    return this.authRequest(`/spaces/${spaceId}`, {
      method: 'DELETE',
    });
  }

  async deleteOrganization(orgId) {
    return this.authRequest(`/orgs/${orgId}`, {
      method: 'DELETE',
    });
  }

  async generateInviteLink(orgId, role = 'member') {
    return this.request(`/orgs/${orgId}/invite-link`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async joinByInvite(token) {
    return this.request(`/orgs/join/${token}`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications(limit = 30) {
    return this.request(`/notifications?limit=${limit}`);
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Card operations
  async getCards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/cards${queryString ? `?${queryString}` : ''}`);
  }

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

  async addCardComment(cardId, text) {
    return this.request(`/cards/${cardId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Canvas
  async getCanvas(orgId) {
    return this.request(`/orgs/${orgId}/canvas`);
  }

  async saveCanvasSnapshot(orgId, snapshotData) {
    return this.request(`/orgs/${orgId}/canvas/snapshot`, {
      method: 'POST',
      body: JSON.stringify({ snapshotData }),
    });
  }

  // Chat
  async getChannels(orgId) {
    return this.request(`/orgs/${orgId}/channels`);
  }

  async getMessages(channelId, orgId) {
    return this.request(`/channels/${channelId}/messages${orgId ? `?orgId=${orgId}` : ''}`);
  }

  async sendMessage(channelId, text, extra = {}) {
    return this.request(`/channels/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, ...extra }),
    });
  }

  // Plans & Sprint Capacity
  async getPlans(orgId) {
    return this.request(`/plans${orgId ? `?orgId=${orgId}` : ''}`);
  }

  async createPlan(planData) {
    return this.request('/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(planId, planData) {
    return this.request(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(planId) {
    return this.request(`/plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // Goals & OKRs
  async getGoals(orgId) {
    return this.request(`/goals${orgId ? `?orgId=${orgId}` : ''}`);
  }

  async createGoal(goalData) {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateGoal(goalId, goalData) {
    return this.request(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  }

  async deleteGoal(goalId) {
    return this.request(`/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  // Workspace Apps & Integrations
  async getApps(orgId) {
    return this.request(`/apps${orgId ? `?orgId=${orgId}` : ''}`);
  }

  async toggleApp(appId, orgId, enabled) {
    return this.request(`/apps/${appId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ orgId, enabled }),
    });
  }

  async configureApp(appId, orgId, config) {
    return this.request(`/apps/${appId}/config`, {
      method: 'PUT',
      body: JSON.stringify({ orgId, config }),
    });
  }
}

export const api = new ApiService();
