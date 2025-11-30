import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from './jwt';
import { env } from '../config/env';

let io: Server;

export function initializeWebSocket(server: HTTPServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User ${userId} connected via WebSocket`);

    // Join user to their personal room
    socket.join(userId);

    socket.on('disconnect', () => {
      console.log(`❌ User ${userId} disconnected from WebSocket`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
}

// Helper to emit notifications to specific user
export function notifyUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(userId).emit(event, data);
  }
}
