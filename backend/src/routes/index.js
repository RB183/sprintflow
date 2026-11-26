const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const orgController = require('../controllers/org.controller');
const cardController = require('../controllers/card.controller');
const canvasController = require('../controllers/canvas.controller');
const chatController = require('../controllers/chat.controller');
const notificationController = require('../controllers/notification.controller');
const planController = require('../controllers/plan.controller');
const goalController = require('../controllers/goal.controller');
const appController = require('../controllers/app.controller');

// Public Auth routes with strict rate limiting
router.use('/auth', authRateLimiter);
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/firebase', authController.firebaseLogin);
router.post('/auth/logout', authController.logout);

// Protected routes
router.use(authMiddleware);

// User Profile & Personal Workspace
router.get('/auth/me', authController.me);
router.put('/auth/profile', authController.updateProfile);
router.get('/users', userController.getAllUsers);
router.get('/users/me/tasks', userController.getPersonalTasks);

// Organizations / Spaces (Admins & Members)
router.get('/orgs', orgController.getUserOrganizations);
router.post('/orgs', orgController.createOrganization);
router.get('/orgs/:orgId/members', orgController.getSpaceMembers);
router.post('/orgs/:orgId/members', orgController.inviteMember);
router.delete('/orgs/:orgId/members/:userId', orgController.removeMember);
router.delete('/orgs/:orgId', orgController.deleteOrganization);
router.post('/orgs/:orgId/invite', orgController.inviteMember);
router.post('/orgs/:orgId/invite-link', orgController.generateInviteLink);
router.post('/orgs/join/:token', orgController.joinByInvite);

// Aliases for /spaces
router.get('/spaces', orgController.getUserOrganizations);
router.post('/spaces', orgController.createOrganization);
router.get('/spaces/:orgId/members', orgController.getSpaceMembers);
router.post('/spaces/:orgId/members', orgController.inviteMember);
router.delete('/spaces/:orgId/members/:userId', orgController.removeMember);
router.delete('/spaces/:orgId', orgController.deleteOrganization);
router.post('/spaces/:orgId/invite', orgController.inviteMember);
router.post('/spaces/:orgId/invite-link', orgController.generateInviteLink);
router.post('/spaces/join/:token', orgController.joinByInvite);

// Notifications
router.get('/notifications', notificationController.getUserNotifications);
router.patch('/notifications/read-all', notificationController.markAllAsRead);
router.patch('/notifications/:id/read', notificationController.markAsRead);

// Cards / Kanban
router.get('/orgs/:orgId/activity', cardController.getOrganizationActivity);
router.patch('/cards/archive-done', cardController.archiveDoneCards);
router.patch('/cards/:id/archive', cardController.archiveCard);
router.patch('/cards/:id/restore', cardController.restoreCard);
router.get('/cards', cardController.getCards);
router.post('/cards', cardController.createCard);
router.put('/cards/:id', cardController.updateCard);
router.delete('/cards/:id', cardController.deleteCard);
router.patch('/cards/reorder', cardController.reorderCards);
router.post('/cards/:id/comments', cardController.addComment);

// Plans & Sprint Capacity (MilestoneEpics)
router.get('/plans', planController.getPlans);
router.post('/plans', planController.createPlan);
router.put('/plans/:id', planController.updatePlan);
router.delete('/plans/:id', planController.deletePlan);

// Goals & OKRs
router.get('/goals', goalController.getGoals);
router.post('/goals', goalController.createGoal);
router.put('/goals/:id', goalController.updateGoal);
router.delete('/goals/:id', goalController.deleteGoal);

// Workspace Apps & Integrations
router.get('/apps', appController.getApps);
router.post('/apps/:appId/toggle', appController.toggleApp);
router.put('/apps/:appId/config', appController.configureApp);

// Canvas Whiteboard
router.get('/orgs/:orgId/canvas', canvasController.getCanvas);
router.post('/orgs/:orgId/canvas/snapshot', canvasController.saveCanvasSnapshot);

// Chat
router.get('/orgs/:orgId/channels', chatController.getChannels);
router.get('/channels/:channelId/messages', chatController.getMessages);
router.post('/channels/:channelId/messages', chatController.sendMessage);

module.exports = router;
