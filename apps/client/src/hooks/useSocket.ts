import { useEffect, useRef, useState, useCallback } from 'react';
import { socketManager } from '@/lib/socket';

interface UseSocketOptions {
  businessId?: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  joinBusiness: (businessId: string) => void;
  leaveBusiness: (businessId: string) => void;
  emitNewCall: (callData: any) => void;
  emitCallStatusUpdate: (updateData: any) => void;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { businessId, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef<{
    callUpdated?: (data: any) => void;
    newCall?: (data: any) => void;
  }>({});

  const updateConnectionStatus = useCallback(() => {
    setIsConnected(socketManager.isConnected());
  }, []);

  const connect = useCallback(() => {
    const socket = socketManager.connect(businessId);
    
    // Set up connection status listeners
    socket?.on('connect', updateConnectionStatus);
    socket?.on('disconnect', updateConnectionStatus);
    
    updateConnectionStatus();
  }, [businessId, updateConnectionStatus]);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
  }, []);

  const joinBusiness = useCallback((businessId: string) => {
    socketManager.joinBusiness(businessId);
  }, []);

  const leaveBusiness = useCallback((businessId: string) => {
    socketManager.leaveBusiness(businessId);
  }, []);

  const emitNewCall = useCallback((callData: any) => {
    socketManager.emitNewCall(callData);
  }, []);

  const emitCallStatusUpdate = useCallback((updateData: any) => {
    socketManager.emitCallStatusUpdate(updateData);
  }, []);

  // Set up event listeners
  const setupEventListeners = useCallback(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    // Call updated event
    callbacksRef.current.callUpdated = (data: any) => {
      console.log('Call updated via WebSocket:', data);
      // You can add custom logic here or emit a custom event
      window.dispatchEvent(new CustomEvent('call-updated', { detail: data }));
    };

    // New call event
    callbacksRef.current.newCall = (data: any) => {
      console.log('New call via WebSocket:', data);
      // You can add custom logic here or emit a custom event
      window.dispatchEvent(new CustomEvent('new-call', { detail: data }));
    };

    socketManager.onCallUpdated(callbacksRef.current.callUpdated);
    socketManager.onNewCall(callbacksRef.current.newCall);
  }, []);

  // Clean up event listeners
  const cleanupEventListeners = useCallback(() => {
    if (callbacksRef.current.callUpdated) {
      socketManager.offCallUpdated(callbacksRef.current.callUpdated);
    }
    if (callbacksRef.current.newCall) {
      socketManager.offNewCall(callbacksRef.current.newCall);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
      setupEventListeners();
    }

    return () => {
      cleanupEventListeners();
      disconnect();
    };
  }, [autoConnect, connect, disconnect, setupEventListeners, cleanupEventListeners]);

  // Update connection status when businessId changes
  useEffect(() => {
    if (businessId && isConnected) {
      joinBusiness(businessId);
    }
  }, [businessId, isConnected, joinBusiness]);

  return {
    isConnected,
    connect,
    disconnect,
    joinBusiness,
    leaveBusiness,
    emitNewCall,
    emitCallStatusUpdate,
  };
}
