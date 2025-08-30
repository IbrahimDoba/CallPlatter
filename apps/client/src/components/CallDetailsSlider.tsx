"use client";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X, Trash2, Play, Pause, Star, User } from "lucide-react";
import { AudioUploader } from "./AudioUploader";
import { useState } from "react";
import { toast } from "sonner";
import { deleteCall } from "@/app/actions/callLogs";
import { format } from "date-fns";

interface CallDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  call: {
    id: string;
    contact?: string;
    customerName?: string;
    customerPhone?: string;
    duration: string | number;
    timestamp?: string;
    createdAt?: string;
    status: "TEST" | "COMPLETED" | "MISSED" | "IN_PROGRESS";
    summary?: string;
    transcript?: Array<{
      speaker: "agent" | "caller";
      message: string;
      timestamp?: string;
    }>;
    logs?: Array<{
      id: string;
      message: string;
      sender: "ai" | "user";
      audioChunk?: string;
      createdAt?: string;
    }>;
    audioFileUrl?: string;
  } | null;
}

export function CallDetailPanel({
  isOpen,
  onClose,
  call,
}: CallDetailPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(call?.audioFileUrl || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (!call) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteCall(call.id);
      if (result.success) {
        toast.success('Call deleted successfully');
        onClose();
        // You might want to refresh the calls list here if needed
      } else {
        toast.error(result.error || 'Failed to delete call');
      }
    } catch (error) {
      console.error('Error deleting call:', error);
      toast.error('An error occurred while deleting the call');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (!call) return null;

  const formatDuration = (seconds: number | string | null | undefined): string => {
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
    if (!call) return 'Unknown Caller';
    if (call.customerName) return call.customerName;
    if (call.customerPhone) return call.customerPhone;
    return 'Unknown Caller';
  };

  const getTimestamp = () => {
    return call.timestamp || call.createdAt || "";
  };

  const getAllMessages = () => {
    const messages: Array<{
      id: string;
      message: string;
      speaker: "agent" | "caller";
      timestamp?: string;
      audioChunk?: string;
    }> = [];

    // Add transcript messages
    if (call.transcript && Array.isArray(call.transcript)) {
      call.transcript.forEach((entry, index) => {
        messages.push({
          id: `transcript-${index}`,
          message: entry.message,
          speaker: entry.speaker,
          timestamp: entry.timestamp,
        });
      });
    }

    // Add log messages and convert format
    if (call.logs && Array.isArray(call.logs)) {
      call.logs.forEach((log) => {
        messages.push({
          id: log.id,
          message: log.message,
          speaker:
            log.sender === "ai" ? "agent" : ("caller" as "agent" | "caller"),
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement actual audio playback logic
  };

  const messages = getAllMessages();

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full  lg:min-w-[800px] max-w-[90vw] ml-auto mt-0 rounded-l-lg" >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DrawerHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <DrawerTitle className="text-left">
                    {getDisplayName()}
                    <Badge variant={getStatusVariant(call.status)} className="ml-2">
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
                  {formatDistanceToNow(new Date(call.timestamp || call.createdAt || ''), { addSuffix: true })}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Call Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                Call Summary
              </h3>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">Name</p>
                    <p className="text-orange-900 dark:text-orange-100">
                      {call.customerName || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">Phone</p>
                    <p className="text-orange-900 dark:text-orange-100">
                      {call.customerPhone || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">Duration</p>
                    <p className="text-orange-900 dark:text-orange-100">
                      {formatDuration(call.duration)}
                    </p>
                  </div>
                </div>
                {call.summary && (
                  <div className="mt-2 pt-3 border-t border-orange-200 dark:border-orange-800">
                    <p className="text-orange-600 dark:text-orange-400 text-xs font-medium mb-1">Summary</p>
                    <p className="text-orange-900 dark:text-orange-100 text-sm">
                      {call.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Uploader Section */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Call Recording</h3>
              <AudioUploader 
                onUploadComplete={(url) => {
                  setAudioUrl(url);
                  // Here you would typically update the call record with the new audio URL
                  // Example: updateCallAudio(call.id, url);
                }}
                initialAudioUrl={audioUrl}
                callId={call.id}
              />
            </div>

            {/* Audio Player */}
            {(call.audioFileUrl || call.duration) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Call Recording
                </h3>
                {call.audioFileUrl ? (
                  <audio src={call.audioFileUrl} controls className="w-full">
                    <track
                      kind="captions"
                      srcLang="en"
                      label="English"
                      default
                    />
                  </audio>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-transparent"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Waveform visualization */}
                    <div className="flex-1 flex items-center gap-0.5 h-8">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-0.5 rounded-full transition-colors ${
                            i < 20
                              ? "bg-blue-400 h-6"
                              : i < 35
                                ? "bg-blue-300 h-4"
                                : "bg-gray-300 h-2"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs text-muted-foreground font-mono">
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                )}
              </div>
            )}

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
                      <div className="w-2 h-2 bg-blue-500 rounded-full"/>
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
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogAction>
              This action cannot be undone. This will permanently delete this call record.
            </AlertDialogAction>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
}