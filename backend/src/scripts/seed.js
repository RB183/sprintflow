/**
 * SprintFlow Enterprise Database Seeder
 * Populates MongoDB with default spaces, boards, cards, and team members.
 * Run via: npm run seed (or node backend/src/scripts/seed.js)
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('../config/env');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Card = require('../models/Card');
const Channel = require('../models/Channel');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    console.log(`[Database Seeder] Connecting to MongoDB: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('[Database Seeder] Connected successfully.');

    console.log('[Database Seeder] Purging existing test records...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Card.deleteMany({});
    await Channel.deleteMany({});
    await Message.deleteMany({});

    console.log('[Database Seeder] Seeding default enterprise users...');
    const users = await User.create([
      {
        name: 'Alex Chen',
        email: 'alex.chen@team.io',
        title: 'Lead Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sarah Lin',
        email: 'sarah.lin@team.io',
        title: 'Senior Distributed Systems Engineer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'David Kumar',
        email: 'david.kumar@team.io',
        title: 'Staff Cryptography Engineer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@team.io',
        title: 'Principal Systems Architect',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
    ]);

    const leadUser = users[0];

    console.log('[Database Seeder] Seeding Spaces & Organizations...');
    const orgs = await Organization.create([
      {
        name: 'CyberCore Labs',
        slug: 'cybercore-labs',
        description: 'Zero-knowledge verification, EVM execution clients, and consensus research',
        color: '#0052cc',
        ownerId: leadUser._id.toString(),
      },
      {
        name: 'AeroDynamics Platform',
        slug: 'aerodynamics-platform',
        description: 'Real-time telemetry, mission control dashboards, and sensor simulation',
        color: '#6366f1',
        ownerId: leadUser._id.toString(),
      },
      {
        name: 'NeuralMesh AI',
        slug: 'neuralmesh-ai',
        description: 'Decentralized transformer inference and tensor parallelism clusters',
        color: '#10b981',
        ownerId: leadUser._id.toString(),
      },
    ]);

    const cyberOrg = orgs[0];

    console.log('[Database Seeder] Seeding Cards & Kanban Boards...');
    await Card.create([
      {
        title: 'Deploy zero-knowledge zk-SNARK verifier contract to testnet',
        key: 'CYB-01',
        description: 'Implement Groth16 verification with sub-100k gas execution for privacy-preserving state proofs.',
        orgId: cyberOrg._id.toString(),
        status: 'in_progress',
        priority: 'urgent',
        type: 'feature',
        order: 0,
        assigneeId: leadUser._id.toString(),
        dueDate: '2026-11-20',
        tags: ['zk-proofs', 'solidity', 'testnet'],
        acceptanceCriteria: [
          { text: 'Circuit verification under 90k gas units', done: true },
          { text: 'Audit multi-scalar multiplication algorithm', done: true },
          { text: 'Automated test suite with 100% test coverage', done: false },
        ],
        comments: [
          {
            userId: leadUser._id.toString(),
            userName: leadUser.name,
            userAvatar: leadUser.avatar,
            text: 'Benchmarking on Sepolia completed. Gas consumption is currently at 86,400.',
            createdAt: new Date(),
          },
        ],
      },
      {
        title: 'Reverse engineer binary firmware for ARM TrustZone exploit chain',
        key: 'CYB-02',
        description: 'Extract secure monitor calls and identify memory corruption primitives in bootloader stage 2.',
        orgId: cyberOrg._id.toString(),
        status: 'in_progress',
        priority: 'high',
        type: 'bug',
        order: 1,
        assigneeId: users[1]._id.toString(),
        dueDate: '2026-11-22',
        tags: ['reverse-engineering', 'firmware', 'arm'],
        acceptanceCriteria: [
          { text: 'Ghidra symbolic disassembly map complete', done: true },
          { text: 'POC exploit script in python', done: false },
        ],
      },
      {
        title: 'Optimize Redis cache cluster invalidation for live user sessions',
        key: 'CYB-03',
        description: 'Implement Bloom filters to reduce cache stampedes during burst traffic cycles.',
        orgId: cyberOrg._id.toString(),
        status: 'todo',
        priority: 'medium',
        type: 'task',
        order: 0,
        assigneeId: users[2]._id.toString(),
        dueDate: '2026-11-25',
        tags: ['backend', 'redis', 'performance'],
      },
      {
        title: 'Migrate WebSocket engine to binary protobuf serialization',
        key: 'CYB-04',
        description: 'Replace JSON-encoded payloads over Socket.io with compact binary proto buffers.',
        orgId: cyberOrg._id.toString(),
        status: 'done',
        priority: 'high',
        type: 'feature',
        order: 0,
        assigneeId: users[3]._id.toString(),
        dueDate: '2026-11-15',
        tags: ['socket', 'protobuf', 'optimization'],
      },
    ]);

    console.log('[Database Seeder] Seeding Chat Channels & Messages...');
    const generalChannel = await Channel.create({
      name: 'general',
      orgId: cyberOrg._id,
      topic: 'Team wide announcements and updates',
    });

    await Message.create([
      {
        channelId: generalChannel._id,
        senderId: leadUser._id,
        senderName: leadUser.name,
        text: 'Welcome to SprintFlow Enterprise. All nodes and channels synchronized.',
      },
    ]);

    console.log('----------------------------------------------------');
    console.log('✅ SprintFlow database seeded successfully!');
    console.log('   Users: 4');
    console.log('   Spaces: 3');
    console.log('   Cards: 4');
    console.log('   Channels: 1');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

seedData();
