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
import {
  Phone,
  PhoneOff,
  Mic,
  Volume2,
  Loader2,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  MicVocalIcon,
} from "lucide-react";
import {
  useAICall,
  type CallState,
  type CallRecording,
} from "@/hooks/useAICall";
import { saveCallToDatabase } from "@/app/actions/callLogs";
import { generateCallSummary } from "@/app/actions/OpenaiQueries";
import { generateAppointmentFromCall } from "@/app/actions/GenerateAppointment";

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
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [callRecording, setCallRecording] = useState<CallRecording | null>(
    null
  );
  const [pendingSave, setPendingSave] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoSavedRef = useRef(false);
  const callEndedRef = useRef(false);

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
        return "Ready";
    }
  };

  const isCallActive = useMemo(
    () =>
      ["connected", "listening", "processing", "speaking"].includes(callState),
    [callState]
  );

  const { startCall, endCall, conversation, recordingStatus } = useAICall({
    onLog: (type, message, duration) => {
      console.log(
        `🔧 AI Call Log [${type}]:`,
        message,
        duration ? `(${duration}s)` : ""
      );
    },

    onStateChange: (state: CallState) => {
      console.log("📞 Call State Changed:", state);
      setCallState(state);
    },

    onRecordingComplete: (recording: CallRecording) => {
      console.log("🎙️ Recording completed:", recording);
      setCallRecording(recording);

      // If call has ended and we're waiting to save, save now with recording
      if (callEndedRef.current && pendingSave && conversation?.length > 0) {
        console.log("🔄 Call ended and recording complete, saving now...");
        saveConversation(recording);
      }
    },

    audioElement: audioRef.current,
  });

  // Log conversation updates
  useEffect(() => {
    if (conversation?.length) {
      console.log("💬 Conversation Updated:", conversation);
    }
  }, [conversation]);

  // Save conversation to database (enhanced with recording URL)
  const saveConversation = useCallback(
    async (recordingOverride?: CallRecording) => {
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
      setPendingSave(false);

      // Use override recording or current recording
      const recording = recordingOverride || callRecording;

      console.log("💾 Starting to save conversation...", {
        conversationLength: conversation.length,
        recordingUrl: recording?.url,
        recordingSize: recording?.size,
        businessId,
      });

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
          audioFileUrl: recording?.url, // This will be undefined if recording is null/undefined
          metadata: {
            recordingSize: recording?.size || 0,
            recordingDuration: recording?.duration || 0,
            recordingStatus: recordingStatus,
            hasRecording: !!recording?.url,
          },
        };

        console.log("📋 Call data prepared:", {
          ...callData,
          recordingInfo: recording
            ? {
                url: recording.url,
                size: recording.size,
                duration: recording.duration,
              }
            : "No recording",
        });
        const result = await saveCallToDatabase(callData);

        if (result.success) {
          console.log("✅ Call saved successfully with recording URL!");
          setSaveStatus("success");
          hasAutoSavedRef.current = true;

          // Generate summary after successful save
          setTimeout(() => {
            if (!result.callId) {
              console.error("❌ Cannot generate summary: Call ID is undefined");
              return;
            }
            generateCallSummary(result.callId)
              .then((summaryResult) => {
                if (summaryResult.success) {
                  console.log("📝 Summary generated:", summaryResult.summary);
                } else {
                  console.warn(
                    "⚠️ Summary generation failed:",
                    summaryResult.error
                  );
                }
              })
              .catch((err) => console.warn("Summary error:", err));
          }, 1000);
          setTimeout(() => {
            if (!result.callId) {
              console.warn('No callId available to generate summary');
              return;
            }
            generateCallSummary(result.callId)
              .then((summaryResult) => {
                if (summaryResult.success) {
                  console.log("📝 Summary generated:", summaryResult.summary);

                  // Generate appointment after summary
                  if (result.callId) {
                    generateAppointmentFromCall(result.callId)
                      .then((appointmentResult) => {
                        if (
                          appointmentResult.success &&
                          appointmentResult.shouldCreateAppointment
                        ) {
                          console.log(
                            "📅 Appointment created:",
                            appointmentResult.appointment
                          );
                        } else {
                          console.log(
                            "📅 No appointment needed:",
                            appointmentResult.error
                          );
                        }
                      })
                      .catch((err) =>
                        console.error("Appointment generation error:", err)
                      );
                  } else {
                    console.error(
                      "Cannot generate appointment: Call ID is undefined"
                    );
                  }
                }
              })
              .catch((err) => console.warn("Summary error:", err));
          }, 1000);
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
    },
    [businessId, conversation, callStartTime, callRecording, recordingStatus]
  );

  const handleStartCall = useCallback(async () => {
    if (!businessId) {
      console.error("❌ No business ID available");
      return;
    }

    console.log("🚀 Starting call for business:", businessId);
    setCallState("connecting");
    setCallStartTime(Date.now());
    setCallRecording(null); // Reset recording
    hasAutoSavedRef.current = false;
    callEndedRef.current = false;
    setPendingSave(false);
    setSaveStatus("idle");

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
    callEndedRef.current = true;

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

  // Enhanced auto-save logic - triggers save when call ends
  useEffect(() => {
    if (
      callState === "idle" &&
      callStartTime &&
      conversation?.length > 0 &&
      !hasAutoSavedRef.current &&
      callEndedRef.current
    ) {
      console.log("🔄 Call ended, checking recording status before saving...");

      // If we have a recording URL, use it
      if (callRecording?.url) {
        console.log("📼 Recording available, saving with recording");
        saveConversation();
      }
      // If recording is still processing, set pending flag and start timeout
      else if (recordingStatus === "processing" || recordingStatus === "uploading") {
        console.log("⏳ Recording still processing, will save when ready");
        setPendingSave(true);
      }
      // For all other cases, save without waiting
      else {
        console.log("💾 No recording available, saving conversation data only");
        const saveTimeout = setTimeout(() => {
          if (!hasAutoSavedRef.current) {
            saveConversation();
          }
        }, 500); // Shorter delay for non-recording saves
        
        return () => clearTimeout(saveTimeout);
      }
    }
  }, [
    callState,
    callStartTime,
    conversation?.length,
    callRecording?.url,
    recordingStatus,
    saveConversation,
  ]);

  // NEW: Separate effect to handle saving when recording completes
  useEffect(() => {
    // Only save when recording is complete AND we have a pending save
    if (
      pendingSave &&
      callRecording?.url &&
      recordingStatus === "complete" &&
      !hasAutoSavedRef.current
    ) {
      console.log("📼 Recording completed, executing pending save");
      saveConversation(callRecording);
    }
  }, [pendingSave, callRecording?.url, recordingStatus, saveConversation]);

  // Timeout fallback for stuck recordings - reduced to 5 seconds
  useEffect(() => {
    if (pendingSave) {
      const timeoutId = setTimeout(() => {
        if (pendingSave && !hasAutoSavedRef.current) {
          console.log("⚠️ Recording timeout (5s), saving without recording");
          setPendingSave(false); // Clear the pending state
          saveConversation(); // Save without recording
        }
      }, 5000); // Reduced from 15s to 5s for faster fallback

      return () => clearTimeout(timeoutId);
    }
  }, [pendingSave, saveConversation]);

  // Handle manual save button
  const handleManualSave = useCallback(async () => {
    if (conversation?.length > 0) {
      console.log("💾 Manual save triggered");
      await saveConversation();
    }
  }, [conversation?.length, saveConversation]);

  const getCallStateColor = () => {
    switch (callState) {
      case "connected":
        return "bg-green-500";
      case "listening":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "speaking":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRecordingStatusIndicator = () => {
    switch (recordingStatus) {
      case "recording":
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <MicVocalIcon className="h-4 w-4 animate-pulse" />
            <span className="text-xs">Recording...</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        );
      case "uploading":
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Upload className="h-4 w-4 animate-bounce" />
            <span className="text-xs">Uploading...</span>
          </div>
        );
      case "complete":
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Recorded!</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Recording Failed</span>
          </div>
        );
      default:
        return null;
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

    if (pendingSave) {
      return (
        <div className="flex items-center space-x-2 text-orange-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Waiting for recording...</span>
        </div>
      );
    }

    if (saveStatus === "success") {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <Save className="h-4 w-4" />
          <span className="text-xs">
            Saved{callRecording?.url ? " with recording" : ""}!
          </span>
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
          callEndedRef.current = false;
          setPendingSave(false);
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

          {/* Status Indicators */}
          <div className="flex justify-center space-x-4">
            {getRecordingStatusIndicator()}
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
                ${isCallActive ? "shadow-lg scale-110" : "shadow-md"}
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

              {/* Recording indicator overlay */}
              {recordingStatus === "recording" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
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

            {/* Manual Save Button */}
            {callState === "idle" &&
              conversation?.length > 0 &&
              !hasAutoSavedRef.current && (
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving || pendingSave}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Call
                </Button>
              )}
          </div>

          {/* Recording Info */}
          {callRecording && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center max-w-xs">
              <p className="text-sm text-green-800 font-medium">
                📼 Recording Available
              </p>
              <p className="text-xs text-green-600 mt-1">
                Duration: {callRecording.duration}s | Size:{" "}
                {Math.round(callRecording.size / 1024)}KB
              </p>
              <a
                href={callRecording.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1 block"
              >
                🎧 Listen to Recording
              </a>
              {hasAutoSavedRef.current && (
                <p className="text-xs text-green-700 mt-1 font-medium">
                  ✅ Saved to database
                </p>
              )}
            </div>
          )}

          {/* Pending Save Info */}
          {pendingSave && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center max-w-xs">
              <p className="text-sm text-orange-800 font-medium">
                ⏳ Waiting for Recording
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Call will be saved automatically once recording completes
              </p>
            </div>
          )}

          {/* Simple Instructions */}
          {!isCallActive && !conversation?.length && (
            <div className="text-center text-sm text-gray-500 max-w-xs space-y-1">
              <p>🎤 Click "Start Call" and speak naturally</p>
              <p>💬 Have a conversation with the AI receptionist</p>
              <p>🎙️ Your call will be recorded and saved automatically</p>
            </div>
          )}

          {/* Call Summary (when call ended but not saved) */}
          {callState === "idle" &&
            conversation?.length > 0 &&
            !hasAutoSavedRef.current && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center max-w-xs">
                <p className="text-sm text-blue-800 font-medium">
                  📞 Call Completed
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {conversation.length} messages exchanged
                  {callRecording && (
                    <>
                      <br />
                      Recording: {Math.round(callRecording.size / 1024)}KB
                    </>
                  )}
                </p>
              </div>
            )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-400 text-center max-w-xs">
              Business: {businessId || "Not found"} | Messages:{" "}
              {conversation?.length || 0} | Recording: {recordingStatus} |
              Auto-saved: {hasAutoSavedRef.current ? "Yes" : "No"} | Pending:{" "}
              {pendingSave ? "Yes" : "No"}
              {callRecording && (
                <div className="mt-1 text-green-600">
                  Recording URL: {callRecording.url.substring(0, 30)}...
                </div>
              )}
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
