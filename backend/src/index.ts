import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { rooms } from './store/roomStore.js';
import { registerSocketHandlers } from './handlers/socketHandler.js';

const PORT = Number(process.env.PORT) || 5001;
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const CLIENT_URL = rawClientUrl;
const configuredOrigins = rawClientUrl
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOriginHandler = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  // Dynamically reflect incoming origin so credentials and WebSockets always pass cleanly
  callback(null, true);
};

const app = express();
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    timestamp: Date.now(),
  });
});

// Register all Socket.IO multiplayer event listeners
registerSocketHandlers(io);

// Start listening
server.listen(PORT, () => {
  console.log(`\n🚀 DoodleSync Multiplayer Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready at http://localhost:${PORT}`);
  console.log(`🌐 Allowed Client URL: ${CLIENT_URL}\n`);
});
