const AppIntegration = require('../models/AppIntegration');

const DEFAULT_APPS = [
  {
    appId: 'github',
    name: 'GitHub VCS & PR Sync',
    desc: 'Link commits, branch statuses, and automated PR merge webhooks to tasks.',
    category: 'Developer Tools',
    icon: 'GitBranch',
  },
  {
    appId: 'slack',
    name: 'Slack Notification Dispatcher',
    desc: 'Stream sprint progress, blocker alerts, and card assignments to Slack channels.',
    category: 'Communication',
    icon: 'MessageSquare',
  },
  {
    appId: 'webhooks',
    name: 'Custom Webhooks & Automation',
    desc: 'Trigger HTTP webhooks on card creation, moves, and completion events.',
    category: 'Automation',
    icon: 'Webhook',
  },
  {
    appId: 'canvas_sync',
    name: 'Architecture Canvas Live Mesh',
    desc: 'Real-time WebSocket synchronization for system architecture whiteboard drawings.',
    category: 'Collaboration',
    icon: 'Layout',
  },
  {
    appId: 'csv_export',
    name: 'Automated Data & CSV Exporter',
    desc: 'One-click scheduled snapshot export of all sprint telemetry, cards, and velocity logs.',
    category: 'Telemetry',
    icon: 'Download',
  },
];

exports.getApps = async (req, res, next) => {
  try {
    const { orgId } = req.query;
    let integrations = [];
    if (orgId && orgId.match(/^[0-9a-fA-F]{24}$/)) {
      integrations = await AppIntegration.find({ orgId });
    }

    const appMap = new Map();
    integrations.forEach((item) => {
      appMap.set(item.appId, item);
    });

    const apps = DEFAULT_APPS.map((app) => {
      const integration = appMap.get(app.appId);
      return {
        ...app,
        enabled: integration ? integration.enabled : false,
        config: integration ? integration.config : {},
        updatedAt: integration ? integration.updatedAt : null,
      };
    });

    res.json({ success: true, apps });
  } catch (err) {
    next(err);
  }
};

exports.toggleApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { orgId, enabled } = req.body;

    const targetOrgId = orgId || req.user.currentOrgId;
    if (!targetOrgId) {
      return res.status(400).json({ message: 'orgId is required' });
    }

    const appMeta = DEFAULT_APPS.find((a) => a.appId === appId) || { name: appId };

    const integration = await AppIntegration.findOneAndUpdate(
      { orgId: targetOrgId, appId },
      {
        orgId: targetOrgId,
        appId,
        name: appMeta.name,
        enabled: Boolean(enabled),
        updatedBy: req.user.id,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, app: integration });
  } catch (err) {
    next(err);
  }
};

exports.configureApp = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { orgId, config } = req.body;

    const targetOrgId = orgId || req.user.currentOrgId;
    if (!targetOrgId) {
      return res.status(400).json({ message: 'orgId is required' });
    }

    const appMeta = DEFAULT_APPS.find((a) => a.appId === appId) || { name: appId };

    const integration = await AppIntegration.findOneAndUpdate(
      { orgId: targetOrgId, appId },
      {
        orgId: targetOrgId,
        appId,
        name: appMeta.name,
        config: config || {},
        updatedBy: req.user.id,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, app: integration });
  } catch (err) {
    next(err);
  }
};
