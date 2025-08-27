import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(businessId?: string): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      
      if (businessId) {
        this.joinBusiness(businessId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected to WebSocket server after ${attemptNumber} attempts`);
      if (businessId) {
        this.joinBusiness(businessId);
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBusiness(businessId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-business', businessId);
      console.log(`Joined business room: ${businessId}`);
    }
  }

  leaveBusiness(businessId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-business', businessId);
      console.log(`Left business room: ${businessId}`);
    }
  }

  onCallUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('call-updated', callback);
    }
  }

  offCallUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('call-updated', callback);
    }
  }

  onNewCall(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-call', callback);
    }
  }

  offNewCall(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('new-call', callback);
    }
  }

  emitNewCall(callData: any) {
    if (this.socket?.connected) {
      this.socket.emit('new-call', callData);
    }
  }

  emitCallStatusUpdate(updateData: any) {
    if (this.socket?.connected) {
      this.socket.emit('call-status-update', updateData);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create a singleton instance
export const socketManager = new SocketManager();

// Export the class for testing purposes
export { SocketManager };
