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

  // Listen
  server.listen(PORT, () => {
    console.log(`[SprintFlow API] Server running on http://localhost:${PORT}`);
  });
};

startServer();
