"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, Volume2, Loader2, Save } from "lucide-react";
import { useAICall, type CallState } from "@/hooks/useAICall";
import { saveCallToDatabase } from "@/app/actions/callLogs";

interface WebCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessId: string;
}

export default function WebCallModal({
  isOpen,
  onClose,
  businessName,
  businessId,
}: WebCallModalProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [callState, setCallState] = useState<CallState>("idle");
  const [currentTranscription, setCurrentTranscription] = useState<string>("");
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoSavedRef = useRef(false);
  
  const isCallActive = useMemo(() => 
    ["connected", "listening", "processing", "speaking"].includes(callState)
  , [callState]);
  
  const {
    startCall,
    endCall,
    conversation,
  } = useAICall({
    onLog: (message: string) => {
      console.log("🔧 AI Call Log:", message);
    },
   
    onStateChange: (state: CallState) => {
      console.log("📞 Call State Changed:", state);
      setCallState(state);
    },
    audioElement: audioRef.current,
  });

  // Log conversation updates
  useEffect(() => {
    if (conversation?.length) {
      console.log("💬 Conversation Updated:", conversation);
    }
  }, [conversation]);

  // Save conversation to database
  const saveConversation = useCallback(async () => {
    if (!businessId) {
      console.error("❌ No business ID found");
      setSaveStatus("error");
      return;
    }

    if (!conversation?.length) {
      console.error("❌ No conversation data to save");
      setSaveStatus("error");
      return;
    }

    // If callStartTime is null, create a synthetic one based on the first conversation timestamp
    let effectiveStartTime = callStartTime;
    if (!effectiveStartTime && conversation.length > 0 && conversation[0]) {
      effectiveStartTime = conversation[0].timestamp;
    }

    if (!effectiveStartTime) {
      console.error("❌ No call start time available");
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");
    console.log("💾 Starting to save conversation...");

    try {
      const callLogEntries = conversation.map((entry, index) => ({
        message: entry.text,
        sender: (entry.role === "ai" ? "ai" : "user") as "user" | "ai",
        timestamp: new Date(effectiveStartTime + index * 2000),
        audioChunk: undefined,
        metadata: {
          role: entry.role,
          index,
          originalTimestamp: entry.timestamp,
        },
      }));

      const callData = {
        businessId: businessId,
        customerPhone: "Web Call",
        customerName: "Web Customer",
        duration: Math.floor((Date.now() - effectiveStartTime) / 1000),
        logs: callLogEntries,
        finalTranscript: conversation
          .map((entry) => `${entry.role.toUpperCase()}: ${entry.text}`)
          .join("\n\n"),
        status: "COMPLETED" as const,
        intent: "Web Call",
      };

      console.log("📋 Call data prepared:", callData);
      const result = await saveCallToDatabase(callData);

      if (result.success) {
        console.log("✅ Call saved successfully!");
        setSaveStatus("success");
        hasAutoSavedRef.current = true;
      } else {
        console.error("❌ Failed to save call:", result.error);
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("❌ Error saving call:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [businessId, conversation, callStartTime]);

  const handleStartCall = useCallback(async () => {
    if (!businessId) {
      console.error("❌ No business ID available");
      return;
    }
    
    console.log("🚀 Starting call for business:", businessId);
    setCallState("connecting");
    setCallStartTime(Date.now());
    hasAutoSavedRef.current = false;
    try {
      await startCall({ businessId });
      setCallState("connected");
    } catch (error) {
      console.error("❌ Error starting call:", error);
      setCallState("idle");
      setIsSaving(false);
    }
  }, [startCall, businessId]);

  const handleEndCall = useCallback(async () => {
    console.log("🛑 Ending call");
    setCallState("ending");
    try {
      await endCall();
      setCallState("idle");
    } catch (error) {
      console.error("❌ Error ending call:", error);
      setCallState("idle");
    } finally {
      setIsSaving(false);
    }
  }, [endCall]);

  // Set start time when call becomes active (backup)
  useEffect(() => {
    if (isCallActive && !callStartTime) {
      const startTime = Date.now();
      console.log("⏰ Setting backup call start time:", new Date(startTime));
      setCallStartTime(startTime);
      hasAutoSavedRef.current = false;
    }
  }, [isCallActive, callStartTime]);

  // Auto-save when call ends and conversation exists
  useEffect(() => {
    if (
      callState === "idle" &&
      callStartTime &&
      conversation?.length > 0 &&
      !hasAutoSavedRef.current
    ) {
      console.log("🔄 Auto-saving conversation after call ended...");
      const timer = setTimeout(() => {
        saveConversation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [callState, callStartTime, conversation?.length, saveConversation]);

  const getCallStateColor = () => {
    switch (callState) {
      case "connected":
        return "bg-green-500";
      case "listening":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "speaking":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCallStateIcon = () => {
    switch (callState) {
      case "connected":
        return <Phone className="h-6 w-6 text-white" />;
      case "listening":
        return <Mic className="h-6 w-6 text-white animate-pulse" />;
      case "processing":
        return <Loader2 className="h-6 w-6 text-white animate-spin" />;
      case "speaking":
        return <Volume2 className="h-6 w-6 text-white animate-bounce" />;
      case "error":
        return <PhoneOff className="h-6 w-6 text-white" />;
      default:
        return <Phone className="h-6 w-6 text-white" />;
    }
  };

  const getCallStateText = () => {
    switch (callState) {
      case "connected":
        return "Connected";
      case "listening":
        return "Listening...";
      case "processing":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Error";
      default:
        return "Ready to Call";
    }
  };

  const getSaveStatusIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Saving...</span>
        </div>
      );
    }

    if (saveStatus === "success") {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <Save className="h-4 w-4" />
          <span className="text-xs">Saved!</span>
        </div>
      );
    }

    if (saveStatus === "error") {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <Save className="h-4 w-4" />
          <span className="text-xs">Save Failed</span>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleEndCall();
          hasAutoSavedRef.current = false;
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🌐 Web Call
          </DialogTitle>
          <p className="text-center text-sm text-gray-600">{businessName}</p>
          <div className="flex justify-center">
            {getSaveStatusIndicator()}
          </div>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Call State Indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div
              className={`
                relative w-20 h-20 rounded-full flex items-center justify-center
                ${getCallStateColor()}
                transition-all duration-300 ease-in-out
                ${isCallActive ? 'shadow-lg scale-110' : 'shadow-md'}
              `}
            >
              {getCallStateIcon()}
              
              {isCallActive && (
                <div
                  className={`
                    absolute inset-0 rounded-full animate-ping opacity-30
                    ${getCallStateColor()}
                  `}
                />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {getCallStateText()}
              </h3>
              {currentTranscription && (
                <p className="text-sm text-gray-600 mt-2 max-w-xs">
                  "{currentTranscription}"
                </p>
              )}
              {callStartTime && isCallActive && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor((Date.now() - callStartTime) / 1000)}s
                </p>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex space-x-4">
            <Button
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={callState === "connecting" || callState === "ending"}
              className="flex items-center gap-2"
            >
              {callState === "connecting" || callState === "ending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isCallActive ? (
                <PhoneOff className="h-4 w-4" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              {isCallActive
                ? "End Call"
                : callState === "connecting"
                ? "Connecting..."
                : callState === "ending"
                ? "Ending..."
                : "Start Call"}
            </Button>
          </div>

          {/* Simple Instructions */}
          {!isCallActive && (
            <div className="text-center text-sm text-gray-500 max-w-xs space-y-1">
              <p>🎤 Click "Start Call" and speak naturally</p>
              <p>💬 Have a conversation with the AI receptionist</p>
              <p>💾 Your call will be automatically saved</p>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 text-center max-w-xs">
              Business: {businessId || "Not found"} |
              Messages: {conversation?.length || 0} |
              Auto-saved: {hasAutoSavedRef.current ? "Yes" : "No"}
            </div>
          )}
        </div>

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} style={{ display: "none" }}>
          <track kind="captions" />
        </audio>
      </DialogContent>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </Dialog>
  );
}