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

interface UseAICallProps {
  onLog: (type: CallLog["type"], message: string, duration?: number) => void;
  onStateChange: (state: CallState) => void;
  audioElement?: HTMLAudioElement | null;
}

export function useAICall({
  onLog,
  onStateChange,
  audioElement,
}: UseAICallProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<TranscriptEntry[]>([]);

  // Refs for cleanup and state management
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const conversationRef = useRef<TranscriptEntry[]>([]);
  const aiAccumRef = useRef<string>("");
  const endCallRef = useRef<(opts?: { silent?: boolean }) => void>(() => {});
  const isEndingRef = useRef(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start WebRTC call to OpenAI Realtime API
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

        // Get user audio stream with optimal settings
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000, // OpenAI prefers 24kHz
            channelCount: 1, // Mono audio
          },
        });

        streamRef.current = mediaStream;

        // Mint ephemeral token from backend
        const tokenResp = await fetch(
          "/api/ai-receptionist/realtime/ephemeral-token",
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

        // Create WebRTC peer connection with STUN servers for better connectivity
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
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed"
          ) {
            if (!isEndingRef.current) {
              onLog("system", "Connection lost, attempting to reconnect...");
              // Could implement reconnection logic here if needed
            }
          }
        };

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
        };

        // Add local audio track
        mediaStream.getTracks().forEach((track) => {
          pc.addTrack(track, mediaStream);

          // Handle track ending (e.g., user revokes microphone permission)
          track.onended = () => {
            if (!isEndingRef.current) {
              onLog("system", "Audio track ended unexpectedly");
              onStateChange("error");
            }
          };
        });

        // Handle remote audio from OpenAI
        pc.ontrack = (event) => {
          console.log("Received remote track");
          const remoteStream = event.streams[0];
          if (!remoteStream) return;

          const audioEl =
            audioElement || currentAudioRef.current || new Audio();
          currentAudioRef.current = audioEl;
          audioEl.autoplay = true;
          (audioEl as any).srcObject = remoteStream;
          audioEl.play().catch((err) => {
            console.warn("Audio autoplay failed:", err);
            // This is common due to browser autoplay policies
          });
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
                  break;

                case "input_audio_buffer.speech_started":
                  onStateChange("listening");
                  break;

                case "input_audio_buffer.speech_stopped":
                  onStateChange("processing");
                  break;

                case "response.audio_transcript.delta": {
                  // Accumulate AI response text
                  const delta = data?.delta || "";
                  if (delta) aiAccumRef.current += delta;
                  onStateChange("speaking");
                  break;
                }

                case "response.audio_transcript.done": {
                  // AI finished speaking - save transcript
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

                  onStateChange("connected"); // Back to connected state, ready for more input

                  // End call if AI indicated completion
                  if (hasEndMarker) {
                    onLog("system", "AI indicated call completion");
                    setTimeout(() => endCallRef.current?.(), 1500);
                  }

                  aiAccumRef.current = "";
                  break;
                }

                case "conversation.item.input_audio_transcription.completed": {
                  // User speech transcribed
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
                  // Log rate limit info for debugging
                  onLog(
                    "system",
                    `Rate limits updated: ${JSON.stringify(data.rate_limits)}`
                  );
                  break;

                default:
                  // Log other important events for debugging
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

          // Send initial greeting if configured
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

          // Set up keep-alive mechanism using session.update to prevent timeouts
          keepAliveIntervalRef.current = setInterval(() => {
            if (dataChannel.readyState === "open" && !isEndingRef.current) {
              try {
                // Send a non-disruptive session update as keep-alive
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
          }, 20000); // Send keep-alive every 20 seconds
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
    [onLog, onStateChange, audioElement]
  );

  // End call and cleanup
  const endCall = useCallback(
    (opts?: { silent?: boolean }) => {
      if (isEndingRef.current) return; // Prevent multiple calls
      isEndingRef.current = true;

      onLog("system", "Ending call...");

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

      // Stop remote audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        (currentAudioRef.current as any).srcObject = null;
        currentAudioRef.current = null;
      }

      if (!opts?.silent) {
        setIsRecording(false);
        onStateChange("idle");
        onLog("system", "Call ended");
      }

      // Reset ending flag after a delay
      setTimeout(() => {
        isEndingRef.current = false;
      }, 1000);
    },
    [onLog, onStateChange]
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
    clearTranscript: () => {
      conversationRef.current = [];
      setConversation([]);
      aiAccumRef.current = "";
    },
  };
}
