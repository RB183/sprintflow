# 🚀 SprintFlow — Enterprise Agile Project Management Platform

A high-performance, 100% free agile project management platform and collaborative whiteboard suite built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io.

[![Live Demo](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel&logoColor=white)](https://sprintflow-two.vercel.app/)
[![Backend API](https://img.shields.io/badge/Render-Backend%20Live-46e3b7?style=for-the-badge&logo=render&logoColor=black)](https://sprintflow-backend-knol.onrender.com/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
---

## 🌐 Live Deployments

- **🚀 Web Application (Frontend):** [https://sprintflow-two.vercel.app/](https://sprintflow-two.vercel.app/)
- Live Backend API URL: https://sprintflow-backend-knol.onrender.com
- Live Backend Health Check: https://sprintflow-backend-knol.onrender.com/health 

---

## 🌟 Key Features

- **⚡ 100% Free Forever**: No paywalls, trial limits, or seat restrictions.
- **☀️ Modern Light & Dark Themes**: High-contrast, accessibility-tested UI inspired by modern enterprise SaaS.
- **📋 Personal Workspace**: Aggregated cross-organizational task feed showing all assigned tasks with instant status cycling.
- **🏢 Multi-Organization / Team Spaces**: Effortless team switching with role-based permissions (*Admin* vs *Member*).
- **📊 Drag & Drop Kanban Board**: Fluid vertical and horizontal card movements powered by `@hello-pangea/dnd`.
- **🗺️ Sprint Roadmap Timeline**: Visual epic milestones, execution progress bars, and deliverable checklists.
- **🎨 Live Drawing Whiteboard (Canvas)**: HTML5 canvas for system architectures, flowcharts, decision diamonds, and connectors with PNG export and cloud auto-save.
- **💬 Real-Time Team Chat**: Channel-based team communication stream synced via WebSockets.
- **🔐 Secure Authentication**: JWT session security, Bcrypt password hashing, and optional Google SSO via Firebase.

---

## 📁 Repository Structure

```
sprintflow/
├── frontend/             # React (Vite) + Tailwind CSS + Socket.io Client
└── backend/              # Node.js + Express.js + Mongoose (MongoDB Atlas) + Socket.io
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm
- MongoDB Atlas cluster or local MongoDB instance

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/RB183/sprintflow.git
cd sprintflow

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Run Locally
From the root directory:
```bash
# Start frontend dev server (http://localhost:5173)
npm run dev:frontend

# Start backend server (http://localhost:5000)
npm run dev:backend
```

---

## 📄 License
MIT License © 2026 RB183
