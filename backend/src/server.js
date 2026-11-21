const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const initSockets = require('./sockets');
const { PORT } = require('./config/env');

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSockets
  initSockets(server);

  // Listen on 0.0.0.0 for seamless container/cloud hosting (Render, Railway, Docker)
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SprintFlow API] Server running on port ${PORT}`);
  });

  const handleShutdown = (signal) => {
    console.log(`[SprintFlow] Received ${signal}. Gracefully shutting down...`);
    server.close(() => {
      console.log('[SprintFlow] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
