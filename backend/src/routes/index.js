const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const orgController = require('../controllers/org.controller');
const cardController = require('../controllers/card.controller');
const canvasController = require('../controllers/canvas.controller');
const chatController = require('../controllers/chat.controller');

// Public Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/demo', authController.demoLogin);

// Protected routes
router.use(authMiddleware);

// User Personal Workspace
router.get('/users/me/tasks', userController.getPersonalTasks);

// Organizations
router.get('/orgs', orgController.getUserOrganizations);
router.post('/orgs', orgController.createOrganization);

// Cards / Kanban
router.post('/cards', cardController.createCard);
router.put('/cards/:id', cardController.updateCard);
router.delete('/cards/:id', cardController.deleteCard);
router.patch('/cards/reorder', cardController.reorderCards);

// Canvas Whiteboard
router.get('/orgs/:orgId/canvas', canvasController.getCanvas);
router.post('/orgs/:orgId/canvas/snapshot', canvasController.saveCanvasSnapshot);

// Chat
router.get('/orgs/:orgId/channels', chatController.getChannels);
router.get('/channels/:channelId/messages', chatController.getMessages);
router.post('/channels/:channelId/messages', chatController.sendMessage);

module.exports = router;
