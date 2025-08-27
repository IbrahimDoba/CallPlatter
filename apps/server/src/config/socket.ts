import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

export interface SocketConfig {
  cors: {
    origin: string;
    methods: string[];
    credentials: boolean;
  };
  transports: ('websocket' | 'polling')[];
}

export const socketConfig: SocketConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
};

export function createSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: socketConfig.cors,
    transports: socketConfig.transports,
  });

  return io;
}