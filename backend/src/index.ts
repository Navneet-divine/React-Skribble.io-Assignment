import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { rooms } from './store/roomStore.js';
import { registerSocketHandlers } from './handlers/socketHandler.js';

const PORT = Number(process.env.PORT) || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', '*'],
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
