"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Volume2, Loader2, Mic, Save } from "lucide-react";
import { useAICall, type CallState } from "@/hooks/useAICall";
import { saveCallToDatabase, getBusinessById } from "@/app/actions/callLogs";
import { useSession } from "next-auth/react";

interface CallTestingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessId?: string;
}

export default function CallTestingModal({
  isOpen,
  onClose,
  businessName,
  businessId,
}: CallTestingModalProps) {
  const { data: session } = useSession();
  const [callState, setCallState] = useState<CallState>("idle");
  const [currentTranscription, setCurrentTranscription] = useState<string>("");
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoSavedRef = useRef(false); // Add this ref to track if we've already auto-saved

  const {
    startCall,
    endCall,
    conversation,
    clearTranscript,
  } = useAICall({
    onLog: () => {}, // No-op callback to satisfy hook requirements
    onStateChange: setCallState,
    audioElement: audioRef.current,
  });

  // Verify business on load
  useEffect(() => {
    if (session?.user?.businessId) {
      getBusinessById(session.user.businessId).then((result) => {
        if (result.success && result.business) {
          // Business verified successfully
        } else {
          // Business not found
        }
      });
    }
  }, [session?.user?.businessId]); // Add dependency

  // Save conversation to database when call ends
  const saveConversation = useCallback(async () => {
    if (!session?.user?.businessId) {
      setSaveStatus("error");
      return;
    }

    if (!conversation?.length) {
      setSaveStatus("error");
      return;
    }

    // If callStartTime is null, create a synthetic one based on the first conversation timestamp
    let effectiveStartTime = callStartTime;
    if (!effectiveStartTime && conversation.length > 0 && conversation[0]) {
      effectiveStartTime = conversation[0].timestamp;
    }

    if (!effectiveStartTime) {
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Create call log entries with proper typing
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
        businessId: session.user.businessId,
        customerPhone: "Test Call",
        customerName: "Test Customer",
        duration: Math.floor((Date.now() - effectiveStartTime) / 1000),
        logs: callLogEntries,
        finalTranscript: conversation
          .map((entry) => `${entry.role.toUpperCase()}: ${entry.text}`)
          .join("\n\n"),
        status: "COMPLETED" as const,
        intent: "Test Call",
      };

      const result = await saveCallToDatabase(callData);

      if (result.success) {
        setSaveStatus("success");
        hasAutoSavedRef.current = true; // Mark as saved
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [session?.user?.businessId, conversation, callStartTime]); // Add missing dependencies

  // Reset call
  const resetCall = useCallback(() => {
    endCall();
    setCurrentTranscription("");
    setCallStartTime(null);
    setSaveStatus("idle");
    hasAutoSavedRef.current = false; // Reset auto-save flag
  }, [endCall]);

  // Check if call is in progress
  const isCallInProgress = callState !== "idle" && callState !== "error";

  // Keep component mounted; dialog controls visibility via open prop to preserve hooks order

  // Start timing when call starts
  useEffect(() => {
    // Set start time when call becomes active
    if (
      (callState === "connected" ||
        callState === "listening" ||
        callState === "processing" ||
        callState === "speaking") &&
      !callStartTime
    ) {
      const startTime = Date.now();
      setCallStartTime(startTime);
      hasAutoSavedRef.current = false; // Reset auto-save flag when call starts
    }
  }, [callState, callStartTime]);

  // Auto-save when call ends and conversation exists - FIX THE INFINITE LOOP HERE
  useEffect(() => {
    // Only auto-save if:
    // 1. Call just ended (idle state)
    // 2. We have a call start time (call actually happened)
    // 3. We have conversation data
    // 4. We haven't already auto-saved this conversation
    if (
      callState === "idle" &&
      callStartTime &&
      conversation?.length > 0 &&
      !hasAutoSavedRef.current
    ) {
      // Small delay to ensure all data is processed
      const timer = setTimeout(() => {
        saveConversation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [callState, callStartTime, conversation?.length, saveConversation]); // Keep dependencies but use ref to prevent re-runs

  const getStateIcon = () => {
    switch (callState) {
      case "connected":
        return <Phone className="h-5 w-5 text-green-500" />;
      case "listening":
        return <Mic className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "speaking":
        return <Volume2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <PhoneOff className="h-5 w-5 text-red-500" />;
      default:
        return <Phone className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStateText = () => {
    switch (callState) {
      case "connected":
        return "Connected";
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "speaking":
        return "AI Speaking...";
      case "error":
        return "Error";
      default:
        return "Ready";
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "success":
        return "Saved!";
      case "error":
        return "Save Failed";
      default:
        return "Not Saved";
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          endCall();
          hasAutoSavedRef.current = false;
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
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
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      callState === "idle"
                        ? "secondary"
                        : callState === "error"
                          ? "destructive"
                          : "default"
                    }
                  >
                    {getStateIcon()}
                    {getStateText()}
                  </Badge>
                  <Badge
                    variant={
                      saveStatus === "success"
                        ? "default"
                        : saveStatus === "error"
                          ? "destructive"
                          : "secondary"
                    }
                    className={getSaveStatusColor()}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    {getSaveStatusText()}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {!isCallInProgress ? (
                  <Button
                    onClick={() => startCall({ businessId })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Start Call
                  </Button>
                ) : (
                  <Button
                    onClick={() => endCall()}
                    className="bg-red-600 hover:bg-red-700"
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

                {callState === "idle" && conversation?.length > 0 && (
                  <Button
                    onClick={() => {
                      hasAutoSavedRef.current = false; // Allow manual save even after auto-save
                      saveConversation();
                    }}
                    disabled={isSaving}
                    variant="outline"
                    className="bg-purple-50 hover:bg-purple-100"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Saving..." : "Manual Save"}
                  </Button>
                )}
              </div>

              {callState === "listening" && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    🎤 Listening for your voice...
                  </p>
                  <p className="text-sm text-green-700">
                    Speak naturally - I'll process your speech after 2 seconds
                    of silence
                  </p>
                </div>
              )}

              {currentTranscription && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">You said:</p>
                  <p className="text-sm text-blue-700">
                    {currentTranscription}
                  </p>
                </div>
              )}

              {callStartTime && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    📞 Call Duration:
                  </p>
                  <p className="text-sm text-gray-700">
                    {Math.floor((Date.now() - callStartTime) / 1000)} seconds
                  </p>
                </div>
              )}

              {/* Session Debug Info */}
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">
                  🔍 Debug Info:
                </p>
                <p className="text-xs text-yellow-700">
                  Business ID: {session?.user?.businessId || "Not found"} |
                  Conversation: {conversation?.length || 0} messages |
                  Auto-saved: {hasAutoSavedRef.current ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Transcript - DURING CALL */}
          {isCallInProgress  && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Live Conversation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversation.map((entry, idx) => (
                    <div
                      key={`${entry.timestamp}-${idx}`}
                      className="flex items-start gap-2 text-sm p-2 rounded-md bg-gray-50"
                    >
                      <Badge
                        variant={
                          entry.role === "user" ? "default" : "secondary"
                        }
                        className="text-xs min-w-[45px] justify-center"
                      >
                        {entry.role === "user" ? "👤" : "🤖"} {entry.role}
                      </Badge>
                      <span className="flex-1 leading-relaxed">
                        {entry.text}
                      </span>
                      <span className="text-xs text-gray-400 min-w-[50px]">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post-call Transcript */}
          {callState === "idle" && conversation?.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Final Transcript ({conversation.length} messages)
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearTranscript}>
                  Clear
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {conversation.map((entry, idx) => (
                    <div
                      key={`${entry.timestamp}-${idx}`}
                      className="flex items-start gap-2 text-sm p-2 rounded-md bg-gray-50"
                    >
                      <Badge
                        variant={
                          entry.role === "user" ? "default" : "secondary"
                        }
                        className="text-xs min-w-[45px] justify-center"
                      >
                        {entry.role === "user" ? "👤" : "🤖"}
                      </Badge>
                      <span className="flex-1 leading-relaxed">
                        {entry.text}
                      </span>
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
              <li>
                <strong>Start Call:</strong> Click "Start Call" and allow
                microphone access
              </li>
              <li>
                <strong>Speak:</strong> Say something like "What are your
                business hours?"
              </li>
              <li>
                <strong>Wait for AI:</strong> The AI will automatically detect
                when you stop speaking
              </li>
              <li>
                <strong>Continue:</strong> Have a natural conversation - the
                call stays active
              </li>
              <li>
                <strong>End Call:</strong> Click "End Call" when finished
              </li>
              <li>
                <strong>Auto-Save:</strong> The conversation will automatically
                save to the database
              </li>
              <li>
                <strong>Manual Save:</strong> You can also click "Manual Save"
                to save again
              </li>
              <li>
                <strong>Check Dashboard:</strong> Visit your calls page to see
                the saved conversation!
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} style={{ display: "none" }}>
          <track kind="captions" />
        </audio>
      </DialogContent>
    </Dialog>
  );
}
