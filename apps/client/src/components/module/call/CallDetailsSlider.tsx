"use client";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Trash2, Star, User, Loader2, Calendar, PhoneOff } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { deleteCall } from "@/app/actions/callLogs";
import { format } from "date-fns";
import { AudioPlayer } from "../audio/AudioPlayer";
import { generateAppointmentFromSummary } from "@/app/actions/GenerateAppointment";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface CallDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  call: {
    id: string;
    contact?: string;
    customerName?: string | null;
    customerPhone?: string | null;
    duration: string | number;
    timestamp?: string;
    createdAt?: string;
    status: "TEST" | "COMPLETED" | "MISSED" | "IN_PROGRESS";
    summary?: string | null;
    transcript?: string | null;
    logs?: Array<{
      id: string;
      message: string;
      sender: "ai" | "user";
      audioChunk?: string;
      createdAt?: string;
    }>;
    audioFileUrl?: string | null;
  } | null;
}

export function CallDetailPanel({
  isOpen,
  onClose,
  call,
}: CallDetailPanelProps) {
  console.log("[CallDetails] Rendering with props:", {
    isOpen,
    callId: call?.id,
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGeneratingAppointment, setIsGeneratingAppointment] = useState(false);

  // Log when call details change
  useEffect(() => {
    if (call) {
      console.log("[CallDetails] Call data loaded:", {
        id: call.id,
        status: call.status,
        hasAudio: !!call.audioFileUrl,
        transcriptLength: call.transcript?.length || 0,
        logsLength: call.logs?.length || 0,
      });
    }
  }, [
    call,
    call?.id,
    call?.status,
    call?.audioFileUrl,
    call?.transcript?.length,
    call?.logs?.length,
  ]);

  const handleGenerateAppointment = async () => {
    if (!call?.summary) {
      toast.error("No summary available to generate appointment");
      return;
    }

    setIsGeneratingAppointment(true);
    try {
      const result = await generateAppointmentFromSummary(
        call.id,
        call.summary
      );

      if (result.success && result.shouldCreateAppointment) {
        toast.success("Appointment created successfully from call summary");
      } else {
        toast.error(
          result.error || "Could not create appointment from this call"
        );
      }
    } catch (error) {
      toast.error("Failed to generate appointment");
    } finally {
      setIsGeneratingAppointment(false);
    }
  };

  // Log panel open/close state changes
  useEffect(() => {
    console.log(`[CallDetails] Panel ${isOpen ? "opened" : "closed"}`);
  }, [isOpen]);

  const handleDelete = async () => {
    if (!call) {
      console.warn("[CallDetails] Attempted to delete but no call is selected");
      return;
    }

    console.log("[CallDetails] Starting deletion of call:", call.id);
    setIsDeleting(true);
    try {
      console.log("[CallDetails] Sending delete request for call:", call.id);
      const result = await deleteCall(call.id);
      console.log("[CallDetails] Call deleted successfully:", call.id);
      if (result.success) {
        toast.success("Call deleted successfully");
        onClose();
        // You might want to refresh the calls list here if needed
      } else {
        toast.error(result.error || "Failed to delete call");
      }
    } catch (error) {
      console.error("[CallDetails] Error deleting call:", error);
      toast.error("An error occurred while deleting the call");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!call) return null;

  const formatDuration = (
    seconds: number | string | null | undefined
  ): string => {
    if (!seconds) return "--:--";

    let totalSeconds: number;
    if (typeof seconds === "string") {
      // If it's already formatted (MM:SS), return as is
      if (seconds.includes(":")) return seconds;
      totalSeconds = Number.parseInt(seconds);
    } else {
      totalSeconds = seconds;
    }

    if (isNaN(totalSeconds)) return "--:--";

    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusVariant = (status: string) => {
    console.log(`[CallDetails] Getting status variant for: ${status}`);
    switch (status) {
      case "COMPLETED":
        return "default";
      case "MISSED":
        return "destructive";
      case "IN_PROGRESS":
        return "secondary";
      case "TEST":
      default:
        return "secondary";
    }
  };


  const getDisplayName = () => {
    if (!call) {
      console.warn("[CallDetails] No call data available for display name");
      return "Unknown Caller";
    }
    const name = call.customerName || formatPhoneNumber(call.customerPhone || '') || "Unknown Caller";
    console.log(`[CallDetails] Generated display name: ${name}`);
    return name;
  };

  const getAllMessages = () => {
    console.log("[CallDetails] Getting all messages for call:", call?.id);
    const messages: Array<{
      id: string;
      message: string;
      speaker: "agent" | "caller";
      timestamp?: string;
      audioChunk?: string;
    }> = [];

    if (!call) {
      console.warn("[CallDetails] No call data available to get messages");
      return [];
    }

    // Add transcript messages (transcript is stored as a string, not array)
    if (call.transcript && typeof call.transcript === 'string') {
      // Parse the transcript string into individual messages
      const transcriptLines = call.transcript.split('\n').filter(line => line.trim());
      transcriptLines.forEach((line, index) => {
        const match = line.match(/^(AI|HUMAN|USER):\s*(.+)$/);
        if (match && match[1] && match[2]) {
          const [, speaker, message] = match;
          messages.push({
            id: `transcript-${index}`,
            message: message.trim(),
            speaker: speaker === 'AI' ? 'agent' : 'caller',
            timestamp: undefined,
          });
        }
      });
    }

    // Add log messages and convert format
    if (call.logs && Array.isArray(call.logs)) {
      call.logs.forEach((log) => {
        messages.push({
          id: log.id,
          message: log.message,
          speaker:
            log.sender === "ai" ? "agent" : "caller",
          timestamp: log.createdAt,
          audioChunk: log.audioChunk,
        });
      });
    }

    // Sort messages by timestamp if available
    return messages.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  };

  const messages = getAllMessages();

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full lg:min-w-[800px] max-w-[90vw] ml-auto mt-0 rounded-l-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-left">
                    {getDisplayName()}
                    <Badge
                      variant={getStatusVariant(call.status)}
                      className="ml-2"
                    >
                      {call.status}
                    </Badge>
                  </DrawerTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete call</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>
                <DrawerDescription className="flex items-center gap-2 mt-1">
                  {formatDistanceToNow(
                    new Date(call.timestamp || call.createdAt || ""),
                    { addSuffix: true }
                  )}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Call Summary */}
            {/* Call Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-orange-600 dark:text-orange-400 text-lg font-bold">
                  Call Summary
                </h3>
                {call.summary && (
                  <Button
                    onClick={handleGenerateAppointment}
                    disabled={isGeneratingAppointment}
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50 hover:border-orange-400"
                  >
                    {isGeneratingAppointment ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3 w-3 mr-1" />
                        Generate Appointment
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-3">
                {call.summary ? (
                  <div className="border-orange-200 dark:border-orange-800">
                    <p className="text-orange-900 dark:text-orange-100 text-md whitespace-pre-line">
                      {call.summary?.replace(/\*\*/g, "")}
                    </p>
                  </div>
                ) : (
                  <p className="text-orange-600 dark:text-orange-400 text-sm">
                    No summary available for this call
                  </p>
                )}
              </div>
            </div>

            {/* Audio Player Section - REPLACED AudioUploader */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                Call Recording
              </h3>
              <AudioPlayer
                audioUrl={call.audioFileUrl || undefined}
                callDuration={call.duration}
              />
            </div>

            {/* Transcript/Conversation */}
            {messages.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">
                  Conversation
                </h3>

                {/* Default agent greeting if no messages */}
                {messages.length === 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-blue-600">
                        Agent
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-4">
                      {"You've reached upfirst. How can I help you today?"}
                    </p>
                  </>
                )}

                {messages.map((entry, index) => (
                  <div key={entry.id || index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {entry.speaker === "agent" ? (
                        <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          entry.speaker === "agent"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      >
                        {entry.speaker === "agent" ? "Agent" : "Caller"}
                      </span>
                      {entry.timestamp && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.timestamp), "HH:mm")}
                        </span>
                      )}
                    </div>
                    <div className="pl-4 space-y-2">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {entry.message}
                      </p>
                      {entry.audioChunk && (
                        <audio
                          src={entry.audioChunk}
                          controls
                          className="w-full h-8"
                        >
                          <track
                            kind="captions"
                            srcLang="en"
                            label="English"
                            default
                          />
                        </audio>
                      )}
                    </div>
                  </div>
                ))}

                {/* Call ended indicator */}
                <div className="flex justify-center pt-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <PhoneOff className="h-5 w-5" />
                    <span className="text-sm font-medium">Call Ended</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground">
              This action cannot be undone. This will permanently delete this
              call record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}
