'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { socketManager } from '@/lib/socket';

interface SocketContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinBusiness: (businessId: string) => void;
  leaveBusiness: (businessId: string) => void;
  emitNewCall: (callData: any) => void;
  emitCallStatusUpdate: (updateData: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null);

  const updateConnectionStatus = React.useCallback(() => {
    setIsConnected(socketManager.isConnected());
  }, []);

  const connect = React.useCallback(() => {
    const socket = socketManager.connect();
    
    if (socket) {
      // Set up connection status listeners
      socket.on('connect', updateConnectionStatus);
      socket.on('disconnect', updateConnectionStatus);
      
      updateConnectionStatus();
    }
  }, [updateConnectionStatus]);

  const disconnect = React.useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setCurrentBusinessId(null);
  }, []);

  const joinBusiness = (businessId: string) => {
    if (currentBusinessId && currentBusinessId !== businessId) {
      socketManager.leaveBusiness(currentBusinessId);
    }
    
    socketManager.joinBusiness(businessId);
    setCurrentBusinessId(businessId);
  };

  const leaveBusiness = (businessId: string) => {
    socketManager.leaveBusiness(businessId);
    if (currentBusinessId === businessId) {
      setCurrentBusinessId(null);
    }
  };

  const emitNewCall = (callData: any) => {
    socketManager.emitNewCall(callData);
  };

  const emitCallStatusUpdate = (updateData: any) => {
    socketManager.emitCallStatusUpdate(updateData);
  };

  // Auto-connect when session is available
  useEffect(() => {
    if (session?.user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [session, connect, disconnect]);

  // Set up global event listeners for real-time updates
  useEffect(() => {
    const handleCallUpdated = (event: CustomEvent) => {
      console.log('Call updated event received:', event.detail);
      // You can add global state updates here if needed
    };

    const handleNewCall = (event: CustomEvent) => {
      console.log('New call event received:', event.detail);
      // You can add global state updates here if needed
    };

    window.addEventListener('call-updated', handleCallUpdated as EventListener);
    window.addEventListener('new-call', handleNewCall as EventListener);

    return () => {
      window.removeEventListener('call-updated', handleCallUpdated as EventListener);
      window.removeEventListener('new-call', handleNewCall as EventListener);
    };
  }, []);

  const value: SocketContextType = {
    isConnected,
    connect,
    disconnect,
    joinBusiness,
    leaveBusiness,
    emitNewCall,
    emitCallStatusUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
