import { useState, useRef, useCallback, useEffect } from "react";

export type CallState =
  | "idle"
  | "connecting"
  | "connected"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "ending";

export interface CallLog {
  timestamp: string;
  type: "user" | "ai" | "system";
  message: string;
  duration?: number;
}

export interface TranscriptEntry {
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface CallRecording {
  url: string;
  duration: number;
  size: number;
}

interface UseAICallProps {
  onLog: (type: CallLog["type"], message: string, duration?: number) => void;
  onStateChange: (state: CallState) => void;
  onRecordingComplete?: (recording: CallRecording) => void;
  audioElement?: HTMLAudioElement | null;
}

export function useAICall({
  onLog,
  onStateChange,
  onRecordingComplete,
  audioElement,
}: UseAICallProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<TranscriptEntry[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "recording" | "processing" | "uploading" | "complete" | "error">("idle");

  // Refs for cleanup and state management
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const conversationRef = useRef<TranscriptEntry[]>([]);
  const aiAccumRef = useRef<string>("");
  const endCallRef = useRef<(opts?: { silent?: boolean }) => void>(() => {});
  const isEndingRef = useRef(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const userSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const remoteSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const isRemoteConnectedRef = useRef(false);

  // Enhanced audio context setup with proper mixing architecture
  const setupRecording = useCallback(async (userStream: MediaStream) => {
    try {
      // Clean up any existing audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      // Create new audio context with proper sample rate
      const audioContext = new AudioContext({
        sampleRate: 24000,
        latencyHint: 'interactive'
      });
      audioContextRef.current = audioContext;

      // Create destination for recording (this will be our final mixed output)
      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;
      
      // Create gain node for mixing both user and AI audio
      const gainNode = audioContext.createGain();
      gainNodeRef.current = gainNode;
      gainNode.gain.value = 1.0;
      gainNode.connect(destination);

      // Connect user audio immediately
      const userSource = audioContext.createMediaStreamSource(userStream);
      userSourceRef.current = userSource;
      userSource.connect(gainNode);

      onLog("system", "Audio mixing setup complete - ready for recording");
      return destination.stream;
    } catch (error) {
      console.error("Failed to setup audio context:", error);
      onLog("system", `Audio setup failed: ${error}`);
      // Fallback to direct user stream
      return userStream;
    }
  }, [onLog]);

  // Improved remote audio connection
  const addRemoteAudioToRecording = useCallback(async (remoteStream: MediaStream) => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      onLog("system", "Audio context not ready for remote audio");
      return;
    }

    try {
      // Store remote stream reference
      remoteStreamRef.current = remoteStream;

      // Clean up existing remote source if any
      if (remoteSourceRef.current) {
        remoteSourceRef.current.disconnect();
      }

      // Create source from remote stream
      const remoteSource = audioContextRef.current.createMediaStreamSource(remoteStream);
      remoteSourceRef.current = remoteSource;
      
      // Create gain for AI voice (slightly lower volume)
      const remoteGain = audioContextRef.current.createGain();
      remoteGain.gain.value = 0.7; // Balanced volume for AI voice
      
      // Connect: remoteSource -> remoteGain -> mainGain -> destination
      remoteSource.connect(remoteGain);
      remoteGain.connect(gainNodeRef.current);
      
      isRemoteConnectedRef.current = true;
      onLog("system", "AI audio successfully added to recording mix");
      
    } catch (error) {
      console.error("Failed to add remote audio to recording:", error);
      onLog("system", `Remote audio connection failed: ${error}`);
    }
  }, [onLog]);

  // Enhanced recording start with better error handling
  const startRecording = useCallback(async (userStream: MediaStream) => {
    try {
      recordedChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();
      isRemoteConnectedRef.current = false;
      
      onLog("system", "Setting up recording infrastructure...");
      
      // Setup recording stream with audio context
      const recordingStream = await setupRecording(userStream);
      
      // Determine best available codec
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              throw new Error('No supported audio format found');
            }
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      let chunkCount = 0;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          chunkCount++;
          console.log(`Recording chunk ${chunkCount}: ${event.data.size} bytes`);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, processing recording...");
        onLog("system", `Recording stopped - ${chunkCount} chunks captured`);
        processRecording();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingStatus("error");
        onLog("system", "Recording error occurred");
      };
      
      // Start recording with smaller time slices for better data integrity
      mediaRecorder.start(250); // Smaller chunks for better reliability
      setRecordingStatus("recording");
      onLog("system", `Recording started (${mimeType}) - waiting for AI audio...`);
      
      // If we already have remote stream, connect it now
      if (remoteStreamRef.current) {
        await addRemoteAudioToRecording(remoteStreamRef.current);
      }
      
    } catch (error) {
      console.error("Failed to start recording:", error);
      setRecordingStatus("error");
      onLog("system", `Recording failed: ${error}`);
    }
  }, [setupRecording, onLog, addRemoteAudioToRecording]);

  // Stop recording with validation
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log("Stopping MediaRecorder...");
      mediaRecorderRef.current.stop();
      setRecordingStatus("processing");
      onLog("system", "Stopping recording...");
    } else {
      onLog("system", "Recording was not active");
    }
  }, [onLog]);

  // Enhanced recording processing with better validation
  const processRecording = useCallback(async () => {
    if (recordedChunksRef.current.length === 0) {
      setRecordingStatus("error");
      onLog("system", "No recording data available");
      return;
    }

    try {
      setRecordingStatus("processing");
      
      console.log(`Processing ${recordedChunksRef.current.length} recording chunks`);
      
      // Create audio blob with explicit type
      const firstChunk = recordedChunksRef.current[0];
      let mimeType = firstChunk?.type || 'audio/webm;codecs=opus';
      
      const audioBlob = new Blob(recordedChunksRef.current, { 
        type: mimeType
      });
      
      const duration = recordingStartTimeRef.current 
        ? Math.round((Date.now() - recordingStartTimeRef.current) / 1000)
        : 0;
      
      onLog("system", `Processing: ${Math.round(audioBlob.size / 1024)}KB, ${duration}s, AI audio: ${isRemoteConnectedRef.current ? 'Yes' : 'No'}`);
      
      // Enhanced validation
      if (audioBlob.size === 0) {
        throw new Error("Recording is empty");
      }
      
      if (audioBlob.size < 500) {
        onLog("system", "Warning: Recording seems very small");
      }

      if (!isRemoteConnectedRef.current) {
        onLog("system", "Warning: AI audio may not be included in recording");
      }
      
      // Upload to server
      setRecordingStatus("uploading");
      await uploadRecording(audioBlob, duration, mimeType);
      
    } catch (error) {
      console.error("Failed to process recording:", error);
      setRecordingStatus("error");
      onLog("system", `Recording processing failed: ${error}`);
    }
  }, [onLog]);

  // Enhanced upload with better error handling and logging
  const uploadRecording = useCallback(async (audioBlob: Blob, duration: number, mimeType: string) => {
    try {
      const formData = new FormData();
      
      // Determine file extension from mime type
      let extension = '.webm';
      if (mimeType.includes('mp4')) extension = '.mp4';
      else if (mimeType.includes('ogg')) extension = '.ogg';
      
      const filename = `call-recording-${Date.now()}${extension}`;
      const callId = `call-${Date.now()}`;
      
      // Append comprehensive metadata
      formData.append('audio', audioBlob, filename);
      formData.append('duration', duration.toString());
      formData.append('callId', callId);
      formData.append('timestamp', new Date().toISOString());
      formData.append('mimeType', mimeType);
      formData.append('originalSize', audioBlob.size.toString());
      formData.append('hasRemoteAudio', isRemoteConnectedRef.current.toString());
      
      console.log(`Uploading recording: ${filename}`, {
        size: audioBlob.size,
        duration,
        mimeType,
        hasRemoteAudio: isRemoteConnectedRef.current
      });
      
      onLog("system", `Uploading ${filename} (${Math.round(audioBlob.size / 1024)}KB)...`);
      
      const response = await fetch('/api/upload-call-recording', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload failed: ${response.status}`, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Upload result:", result);
      
      if (!result.url) {
        throw new Error("No URL returned from upload");
      }
      
      const { url, size } = result;
      
      setRecordingStatus("complete");
      onLog("system", `Recording uploaded: ${url} (${Math.round(size / 1024)}KB)`);
      
      const recording: CallRecording = {
        url,
        duration,
        size,
      };
      
      onRecordingComplete?.(recording);
      
      return recording;
      
    } catch (error) {
      console.error("Upload failed:", error);
      setRecordingStatus("error");
      onLog("system", `Recording upload failed: ${error}`);
      throw error;
    }
  }, [onLog, onRecordingComplete]);

  // Start WebRTC call with improved remote audio handling
  const startCall = useCallback(
    async (opts?: { businessId?: string }) => {
      try {
        onStateChange("connecting");
        onLog("system", "Starting call...");

        // Reset state
        isEndingRef.current = false;
        conversationRef.current = [];
        setConversation([]);
        aiAccumRef.current = "";
        setRecordingStatus("idle");
        recordedChunksRef.current = [];
        isRemoteConnectedRef.current = false;

        // Get user audio stream with optimal settings
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000,
            channelCount: 1,
          },
        });

        streamRef.current = mediaStream;

        // Mint ephemeral token from backend
        const tokenResp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ai-receptionist/realtime/ephemeral-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-4o-realtime-preview-2024-12-17",
              businessId: opts?.businessId,
            }),
          }
        );

        if (!tokenResp.ok) {
          const error = await tokenResp.text();
          throw new Error(
            `Failed to mint ephemeral token: ${tokenResp.status} - ${error}`
          );
        }

        const { token, firstMessage, usedConfig, applied } =
          await tokenResp.json();
        if (!token) throw new Error("No ephemeral token returned");

        onLog(
          "system",
          `Config loaded: ${usedConfig ? "custom" : "default"} (voice: ${applied?.voice || "alloy"})`
        );

        // Create WebRTC peer connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        pcRef.current = pc;

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc.connectionState);
          if (pc.connectionState === "connected") {
            onLog("system", "WebRTC connection established");
          } else if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            if (!isEndingRef.current) {
              onLog("system", "Connection lost, attempting to reconnect...");
            }
          }
        };

        // Add local audio track
        mediaStream.getTracks().forEach((track) => {
          pc.addTrack(track, mediaStream);
          track.onended = () => {
            if (!isEndingRef.current) {
              onLog("system", "Audio track ended unexpectedly");
              onStateChange("error");
            }
          };
        });

        // CRITICAL FIX: Enhanced remote audio handling
        pc.ontrack = (event) => {
          console.log("Received remote track from OpenAI");
          const remoteStream = event.streams[0];
          if (!remoteStream) {
            console.warn("No remote stream in track event");
            return;
          }

          // Store reference to remote stream
          remoteStreamRef.current = remoteStream;

          // Setup audio playback
          const audioEl = audioElement || currentAudioRef.current || new Audio();
          currentAudioRef.current = audioEl;
          audioEl.autoplay = true;
          (audioEl as any).srcObject = remoteStream;
          audioEl.play().catch((err) => {
            console.warn("Audio autoplay failed:", err);
          });

          // CRITICAL: Add remote audio to recording mix immediately
          if (recordingStatus === "recording" && audioContextRef.current) {
            console.log("Adding remote audio to existing recording...");
            addRemoteAudioToRecording(remoteStream);
          } else {
            console.log("Recording not active yet, remote stream stored for later");
          }

          onLog("system", "AI audio stream received and configured");
        };

        // Handle OpenAI server events via data channel
        const handleServerEvents = (channel: RTCDataChannel) => {
          channel.onmessage = (msg) => {
            try {
              const data = JSON.parse(msg.data);
              const type = data?.type;

              if (!type) return;

              switch (type) {
                case "session.created":
                  onLog("system", "Realtime session created");
                  // Start recording after session is established
                  if (recordingStatus === "idle") {
                    setTimeout(() => {
                      startRecording(mediaStream);
                    }, 500); // Small delay to ensure everything is set up
                  }
                  break;

                case "input_audio_buffer.speech_started":
                  onStateChange("listening");
                  break;

                case "input_audio_buffer.speech_stopped":
                  onStateChange("processing");
                  break;

                case "response.audio_transcript.delta": {
                  const delta = data?.delta || "";
                  if (delta) aiAccumRef.current += delta;
                  onStateChange("speaking");
                  break;
                }

                case "response.audio_transcript.done": {
                  const rawText = aiAccumRef.current.trim();
                  const END_MARKER = "<END_CALL>";
                  const hasEndMarker = rawText.includes(END_MARKER);
                  const aiText = hasEndMarker
                    ? rawText.replace(END_MARKER, "").trim()
                    : rawText;

                  if (aiText) {
                    const entry: TranscriptEntry = {
                      role: "ai",
                      text: aiText,
                      timestamp: Date.now(),
                    };
                    conversationRef.current.push(entry);
                    setConversation((prev) => [...prev, entry]);
                    onLog("ai", aiText);
                  }

                  onStateChange("connected");

                  if (hasEndMarker) {
                    onLog("system", "AI indicated call completion");
                    setTimeout(() => endCallRef.current?.(), 1500);
                  }

                  aiAccumRef.current = "";
                  break;
                }

                case "conversation.item.input_audio_transcription.completed": {
                  const userText = data?.transcript || "";
                  if (userText) {
                    const entry: TranscriptEntry = {
                      role: "user",
                      text: userText,
                      timestamp: Date.now(),
                    };
                    conversationRef.current.push(entry);
                    setConversation((prev) => [...prev, entry]);
                    onLog("user", userText);
                  }
                  break;
                }

                case "error": {
                  const errorMessage = data?.error?.message || "Unknown error";
                  onLog("system", `Realtime API error: ${errorMessage}`);
                  console.error("Realtime API error:", data.error);
                  if (!isEndingRef.current) {
                    onStateChange("error");
                  }
                  break;
                }

                case "rate_limits.updated":
                  onLog(
                    "system",
                    `Rate limits: ${JSON.stringify(data.rate_limits)}`
                  );
                  break;

                default:
                  if (
                    type.includes("session") ||
                    type.includes("response") ||
                    type.includes("error")
                  ) {
                    console.log(`Realtime event: ${type}`, data);
                  }
                  break;
              }
            } catch (error) {
              console.error("Error parsing server event:", error);
              onLog("system", `Error parsing server event: ${error}`);
            }
          };

          channel.onerror = (error) => {
            console.error("Data channel error:", error);
            onLog("system", "Data channel error occurred");
          };

          channel.onclose = () => {
            console.log("Data channel closed");
            if (!isEndingRef.current) {
              onLog("system", "Data channel closed unexpectedly");
            }
          };
        };

        // Handle data channel from OpenAI
        pc.ondatachannel = (event) => {
          console.log("Received data channel from OpenAI");
          handleServerEvents(event.channel);
        };

        // Create our own data channel
        const dataChannel = pc.createDataChannel("oai-events", {
          ordered: true,
        });

        dataChannel.onopen = () => {
          console.log("Data channel opened");
          onLog("system", "Data channel connected");

          if (firstMessage?.trim()) {
            dataChannel.send(
              JSON.stringify({
                type: "response.create",
                response: {
                  modalities: ["audio", "text"],
                  instructions: firstMessage,
                },
              })
            );
            onLog("ai", `(greeting) ${firstMessage}`);
          }

          // Set up keep-alive mechanism
          keepAliveIntervalRef.current = setInterval(() => {
            if (dataChannel.readyState === "open" && !isEndingRef.current) {
              try {
                dataChannel.send(
                  JSON.stringify({
                    type: "session.update",
                    session: {
                      turn_detection: {
                        type: "server_vad",
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500,
                      },
                    },
                  })
                );
              } catch (error) {
                console.warn("Keep-alive failed:", error);
              }
            }
          }, 20000);
        };

        handleServerEvents(dataChannel);

        // WebRTC SDP exchange with OpenAI
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(
          "https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/sdp",
            },
            body: offer.sdp || "",
          }
        );

        if (!sdpResponse.ok) {
          const error = await sdpResponse.text();
          throw new Error(
            `SDP exchange failed: ${sdpResponse.status} ${error}`
          );
        }

        const answerSdp = await sdpResponse.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        setIsRecording(true);
        onStateChange("connected");
        onLog("system", "Realtime session established");
      } catch (error) {
        console.error("Error starting call:", error);
        onLog("system", `Failed to start call: ${error}`);
        onStateChange("error");

        // Cleanup on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }
      }
    },
    [onLog, onStateChange, audioElement, recordingStatus, startRecording, addRemoteAudioToRecording]
  );

  // Enhanced cleanup with comprehensive audio context management
  const endCall = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (isEndingRef.current) return;
      isEndingRef.current = true;

      onLog("system", "Ending call and cleaning up...");

      // Stop recording first
      stopRecording();

      // Clear keep-alive interval
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }

      // Close peer connection
      if (pcRef.current) {
        pcRef.current.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        pcRef.current.close();
        pcRef.current = null;
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }

      // Enhanced audio context cleanup
      if (userSourceRef.current) {
        userSourceRef.current.disconnect();
        userSourceRef.current = null;
      }

      if (remoteSourceRef.current) {
        remoteSourceRef.current.disconnect();
        remoteSourceRef.current = null;
      }

      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }

      if (destinationRef.current) {
        destinationRef.current.disconnect();
        destinationRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
          audioContextRef.current = null;
        } catch (error) {
          console.warn("Error closing audio context:", error);
        }
      }

      // Stop remote audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        (currentAudioRef.current as any).srcObject = null;
        currentAudioRef.current = null;
      }

      // Reset state
      remoteStreamRef.current = null;
      isRemoteConnectedRef.current = false;

      if (!opts?.silent) {
        setIsRecording(false);
        onStateChange("idle");
        onLog("system", "Call ended - all resources cleaned up");
      }

      // Reset ending flag after a delay
      setTimeout(() => {
        isEndingRef.current = false;
      }, 1000);
    },
    [onLog, onStateChange, stopRecording]
  );

  // Setup cleanup ref
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCallRef.current?.({ silent: true });
    };
  }, []);

  return {
    startCall,
    endCall,
    isRecording,
    conversation,
    recordingStatus,
    clearTranscript: () => {
      conversationRef.current = [];
      setConversation([]);
      aiAccumRef.current = "";
    },
  };
}