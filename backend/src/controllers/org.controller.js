const Organization = require('../models/Organization');
const OrgMember = require('../models/OrgMember');

exports.getUserOrganizations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const memberships = await OrgMember.find({ userId }).populate('orgId');
    const orgs = memberships.map((m) => ({
      ...m.orgId.toObject(),
      role: m.role,
    }));
    res.json({ success: true, orgs });
  } catch (err) {
    next(err);
  }
};

exports.createOrganization = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    const userId = req.user.id;

    const org = await Organization.create({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      ownerId: userId,
    });

    await OrgMember.create({
      userId,
      orgId: org._id,
      role: 'admin',
    });

    res.status(201).json({ success: true, org: { ...org.toObject(), role: 'admin' } });
  } catch (err) {
    next(err);
  }
};

exports.inviteMember = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { userId, role = 'member' } = req.body;

    // Check existing membership
    let membership = await OrgMember.findOne({ orgId, userId });
    if (membership) {
      membership.role = role;
      await membership.save();
    } else {
      membership = await OrgMember.create({ orgId, userId, role });
    }

    res.status(200).json({ success: true, membership });
  } catch (err) {
    next(err);
  }
};
