"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Volume2, Loader2, Mic } from "lucide-react";
import { useAICall, type CallState, type CallLog } from "@/hooks/useAICall";

interface CallTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessId?: string;
}

export default function CallTestingModal({ isOpen, onClose, businessName, businessId }: CallTestingModalProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const addLog = useCallback((type: CallLog['type'], message: string, duration?: number) => {
    const log: CallLog = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      duration
    };
    setCallLogs(prev => [...prev, log]);
    console.log(`[${type.toUpperCase()}] ${message}`, duration ? `(${duration}ms)` : '');
  }, []);

  const { startCall, endCall, conversation, realTimeConversation, clearTranscript } = useAICall({
    onLog: addLog,
    onTranscriptionUpdate: setCurrentTranscription,
    onStateChange: setCallState,
    audioElement: audioRef.current,
  });

  // Reset call
  const resetCall = useCallback(() => {
    endCall();
    setCallLogs([]);
    setCurrentTranscription('');
  }, [endCall]);

  // Check if call is in progress
  const isCallInProgress = callState !== 'idle' && callState !== 'error';

  // Cleanup on modal close
  useEffect(() => {
    if (!isOpen) {
      endCall();
    }
  }, [isOpen, endCall]);

  const getStateIcon = () => {
    switch (callState) {
      case 'connected':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'listening':
        return <Mic className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'speaking':
        return <Volume2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <PhoneOff className="h-5 w-5 text-red-500" />;
      default:
        return <Phone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStateText = () => {
    switch (callState) {
      case 'connected':
        return 'Connected';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'AI Speaking...';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test AI Receptionist Call - {businessName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-1">
          {/* Call Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Call Controls</span>
                <Badge variant={callState === 'idle' ? 'secondary' : callState === 'error' ? 'destructive' : 'default'}>
                  {getStateIcon()}
                  {getStateText()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {!isCallInProgress ? (
                  <Button
                    onClick={() => startCall({ businessId })}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Start Call
                  </Button>
                ) : (
                  <Button
                    onClick={endCall}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                )}
                
                <Button
                  onClick={resetCall}
                  variant="outline"
                  disabled={isCallInProgress}
                >
                  Reset
                </Button>
              </div>

              {callState === 'listening' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">🎤 Listening for your voice...</p>
                  <p className="text-sm text-green-700">Speak naturally - I'll process your speech after 2 seconds of silence</p>
                </div>
              )}
              {currentTranscription && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">You said:</p>
                  <p className="text-sm text-blue-700">{currentTranscription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Transcript - DURING CALL */}
          {isCallInProgress && realTimeConversation.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Live Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {realTimeConversation.map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="flex items-start gap-2 text-sm p-2 rounded-md bg-gray-50">
                      <Badge
                        variant={entry.role === 'user' ? 'default' : 'secondary'}
                        className="text-xs min-w-[45px] justify-center"
                      >
                        {entry.role === 'user' ? '👤' : '🤖'} {entry.role}
                      </Badge>
                      <span className="flex-1 leading-relaxed">{entry.text}</span>
                      <span className="text-xs text-gray-400 min-w-[50px]">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call Logs */
          }
          <Card>
            <CardHeader>
              <CardTitle>Call Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {callLogs.length === 0 ? (
                  <p className="text-sm text-gray-500">No activity yet. Start a test call!</p>
                ) : (
                  callLogs.map((log, index) => (
                    <div key={`${log.timestamp}-${index}`} className="flex items-start gap-2 text-sm">
                      <span className="text-xs text-gray-400 min-w-[60px]">
                        {log.timestamp}
                      </span>
                      <Badge 
                        variant={
                          log.type === 'user' ? 'default' : 
                          log.type === 'ai' ? 'secondary' : 
                          'outline'
                        }
                        className="text-xs"
                      >
                        {log.type}
                      </Badge>
                      <span className="flex-1">{log.message}</span>
                      {log.duration && (
                        <span className="text-xs text-gray-400">
                          {log.duration}ms
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post-call Transcript */}
          {callState === 'idle' && conversation?.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transcript</CardTitle>
                <Button variant="outline" size="sm" onClick={clearTranscript}>Clear</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversation.map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="flex items-start gap-2 text-sm">
                      <Badge
                        variant={entry.role === 'user' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {entry.role}
                      </Badge>
                      <span className="flex-1">{entry.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Start Call" and allow microphone access</li>
              <li>Speak your question clearly (e.g., "What are your business hours?")</li>
              <li>The AI will automatically detect when you stop speaking</li>
              <li>Wait for the AI to process and respond with audio</li>
              <li>Continue the conversation naturally - the call stays active</li>
              <li>Click "End Call" when finished or "Reset" to clear the log</li>
            </ol>
          </CardContent>
        </Card>

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} style={{ display: 'none' }}>
          <track kind="captions" />
        </audio>
      </DialogContent>
    </Dialog>
  );
}
