import { useState, useRef, useCallback, useEffect } from 'react';

export type CallState = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'error';

export interface CallLog {
  timestamp: string;
  type: 'user' | 'ai' | 'system';
  message: string;
  duration?: number;
}

export interface TranscriptEntry {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface UseAICallProps {
  onLog: (type: CallLog['type'], message: string, duration?: number) => void;
  onTranscriptionUpdate: (transcription: string) => void;
  onStateChange: (state: CallState) => void;
  /** Optional audio element to attach remote Realtime track for playback */
  audioElement?: HTMLAudioElement | null;
}

export function useAICall({ onLog, onTranscriptionUpdate, onStateChange, audioElement }: UseAICallProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<TranscriptEntry[]>([]);
  const [realTimeConversation, setRealTimeConversation] = useState<TranscriptEntry[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);
  const noiseFloorRef = useRef(0.005);
  const adaptiveThresholdRef = useRef(0.01);
  const volumeHistoryRef = useRef<number[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const conversationRef = useRef<TranscriptEntry[]>([]);
  const aiAccumRef = useRef<string>('');
  // Mark intentionally unused for now; reserved for future live transcript display
  void onTranscriptionUpdate;

  // Enhanced VAD with noise gating and adaptive thresholds
  const analyzeAudio = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return { volume: 0, isSpeech: false };

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] ?? 0; // guard for noUncheckedIndexedAccess
      const normalized = v / 255.0;
      sum += normalized * normalized;
    }
    const count = dataArray.length || 1; // avoid division by zero if length is 0
    const rms = Math.sqrt(sum / count);

    // Update volume history for adaptive threshold
    volumeHistoryRef.current.push(rms);
    if (volumeHistoryRef.current.length > 50) {
      volumeHistoryRef.current.shift();
    }

    // Calculate adaptive noise floor
    const sortedVolumes = [...volumeHistoryRef.current].sort((a, b) => a - b);
    const noiseFloor = sortedVolumes[Math.floor(sortedVolumes.length * 0.1)] || 0.005;
    noiseFloorRef.current = noiseFloor;

    // Adaptive threshold based on recent volume history
    const recentAverage = volumeHistoryRef.current.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, volumeHistoryRef.current.length);
    adaptiveThresholdRef.current = Math.max(noiseFloor * 2, recentAverage * 0.3, 0.008);

    // Enhanced speech detection with noise gating
    const isAboveNoiseFloor = rms > noiseFloor * 1.5;
    const isAboveThreshold = rms > adaptiveThresholdRef.current;
    const isSpeech = isAboveNoiseFloor && isAboveThreshold;

    return { volume: rms, isSpeech };
  }, []);

  // Legacy processing disabled in Realtime mode (removed)

  // Voice Activity Detection (visual/UX only in Realtime mode)
  const startVAD = useCallback(() => {
    if (vadIntervalRef.current) return;
    let consecutiveSpeechFrames = 0;
    let consecutiveSilenceFrames = 0;
    const SPEECH_FRAMES_THRESHOLD = 3;
    const SILENCE_FRAMES_THRESHOLD = 25;
    let isCurrentlySpeaking = false;
    vadIntervalRef.current = window.setInterval(() => {
      if (isProcessingRef.current) return;
      const { isSpeech } = analyzeAudio();
      if (isSpeech) {
        consecutiveSpeechFrames++;
        consecutiveSilenceFrames = 0;
        if (!isCurrentlySpeaking && consecutiveSpeechFrames >= SPEECH_FRAMES_THRESHOLD) {
          isCurrentlySpeaking = true;
          onStateChange('listening');
        }
      } else {
        consecutiveSpeechFrames = 0;
        consecutiveSilenceFrames++;
        if (isCurrentlySpeaking && consecutiveSilenceFrames >= SILENCE_FRAMES_THRESHOLD) {
          isCurrentlySpeaking = false;
          onStateChange('processing');
          setTimeout(() => onStateChange('listening'), 300);
        }
      }
    }, 50);
  }, [analyzeAudio, onStateChange]);

  const stopVAD = useCallback(() => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
  }, []);

  // Enhanced audio processing setup
  const setupAudioProcessing = useCallback(async (mediaStream: MediaStream) => {
    try {
      const AudioContextClass = (
        (window.AudioContext
          ? window.AudioContext
          : (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext
      );
      const audioContext = new AudioContextClass({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      
      // Configure analyser for VAD
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      // Connect audio processing chain
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      onLog('system', 'Audio processing chain initialized');
    } catch (error) {
      console.error('Error setting up audio processing:', error);
      onLog('system', `Audio processing setup failed: ${error}`);
    }
  }, [onLog]);

  // Start call via WebRTC directly to OpenAI Realtime using ephemeral token
  const startCall = useCallback(async (opts?: { businessId?: string }) => {
    try {
      onStateChange('connecting');
      onLog('system', 'Starting call...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = mediaStream;
      await setupAudioProcessing(mediaStream);

      // 1) Mint ephemeral token from our backend
      const tokenResp = await fetch('/api/ai-receptionist/realtime/ephemeral-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-realtime-preview-2024-12-17', businessId: opts?.businessId })
      });
      if (!tokenResp.ok) {
        let details = '';
        try {
          const errJson = await tokenResp.json();
          details = errJson?.details || JSON.stringify(errJson);
        } catch {
          try { details = await tokenResp.text(); } catch {}
        }
        throw new Error(`Failed to mint ephemeral token: ${tokenResp.status}${details ? ` - ${details}` : ''}`);
      }
      const { token, firstMessage, usedConfig, applied } = await tokenResp.json();
      if (!token) throw new Error('No ephemeral token returned');
      try {
        onLog('system', `Config from server: usedConfig=${usedConfig ? 'yes' : 'no'} voice=${applied?.voice || 'n/a'} model=gpt-4o-realtime-preview-2024-12-17 transcriptionModel=${applied?.transcriptionModel || 'whisper-1'} temp=${typeof applied?.temperature === 'number' ? applied.temperature : 'default'}`);
        // Also console log raw object for debugging
        // eslint-disable-next-line no-console
        console.log('[ai] applied config', { usedConfig, applied });
      } catch {}

      // 2) Create PeerConnection and add local audio track
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      mediaStream.getTracks().forEach((t) => pc.addTrack(t, mediaStream));

      // 3) Prepare remote audio playback
      pc.ontrack = (event) => {
        const incoming = event.streams[0];
        if (!incoming) return;
        const el = audioElement || currentAudioRef.current || new Audio();
        currentAudioRef.current = el;
        el.autoplay = true;
        // Type assertion to satisfy TS libraries without srcObject on HTMLAudioElement
        (el as HTMLMediaElement & { srcObject: MediaStream | null }).srcObject = incoming as MediaStream;
        // If element is not in DOM, call play() explicitly
        el.play().catch(() => {/* autoplay gate */});
      };

      // 3b) Capture text events via data channel for post-call transcript
      const attachMessageHandler = (channel: RTCDataChannel) => {
        channel.onmessage = (msg) => {
          try {
            const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
            const type: string | undefined = data?.type;
            
            if (!type) {
              onLog('system', 'rtc:event <no type field>');
              return;
            }

            onLog('system', `rtc:event ${type}`);

            switch (type) {
              case 'response.audio_transcript.delta': {
                // AI speaking - accumulate text
                const delta: string = data?.delta || '';
                if (delta) aiAccumRef.current += delta;
                break;
              }
              case 'response.audio_transcript.done': {
                // AI finished speaking
                const raw = aiAccumRef.current.trim();
                const END_MARKER = '<END_CALL>';
                const hasEnd = raw.includes(END_MARKER);
                const aiText = hasEnd ? raw.replaceAll(END_MARKER, '').trim() : raw;
                if (aiText) {
                  const entry: TranscriptEntry = { 
                    role: 'ai', 
                    text: aiText, 
                    timestamp: Date.now() 
                  };
                  conversationRef.current.push(entry);
                  onLog('ai', aiText);
                  setRealTimeConversation(prev => [...prev, entry]);
                }
                aiAccumRef.current = '';
                // If model indicated the conversation is over, end call after a short delay
                if (hasEnd) {
                  onLog('system', 'AI indicated call completion. Ending shortly...');
                  // Allow a brief window for the last audio to finish rendering
                  setTimeout(() => {
                    endCall();
                  }, 1500);
                }
                break;
              }
              case 'conversation.item.input_audio_transcription.completed': {
                // User transcript completed
                const userText: string = data?.transcript || '';
                if (userText) {
                  const entry: TranscriptEntry = { 
                    role: 'user', 
                    text: userText, 
                    timestamp: Date.now() 
                  };
                  conversationRef.current.push(entry);
                  onLog('user', userText);
                  setRealTimeConversation(prev => [...prev, entry]);
                }
                break;
              }
              case 'response.done': {
                // Response fully completed
                onStateChange('listening');
                break;
              }
              case 'input_audio_buffer.speech_started': {
                onStateChange('listening');
                break;
              }
              case 'input_audio_buffer.speech_stopped': {
                onStateChange('processing');
                break;
              }
              case 'error': {
                onLog('system', `Realtime API error: ${data?.error?.message || 'Unknown error'}`);
                onStateChange('error');
                break;
              }
              default: {
                // Log other events for debugging
                if (type.includes('session') || type.includes('response') || type.includes('conversation')) {
                  onLog('system', `Unhandled event: ${type}`);
                }
                break;
              }
            }
          } catch (error) {
            onLog('system', `Error parsing message: ${String(error)}`);
          }
        };
      };

      // Provider may open a channel; handle it
      pc.ondatachannel = (e: RTCDataChannelEvent) => {
        const channel = e.channel;
        attachMessageHandler(channel);
      };

      // Proactively create the expected channel label
      const dc = pc.createDataChannel('oai-events');
      dc.onopen = () => {
        onLog('system', 'Data channel open');
        // Optionally request input transcription and server VAD
        try {
          const payload = {
            type: 'session.update',
            session: {
              input_audio_transcription: { model: 'whisper-1' },
              turn_detection: { type: 'server_vad' }
            }
          };
          dc.send(JSON.stringify(payload));
        } catch {}
        // Trigger initial greeting once the session is ready
        try {
          if (firstMessage && typeof firstMessage === 'string' && firstMessage.trim().length > 0) {
            dc.send(JSON.stringify({
              type: 'response.create',
              response: {
                modalities: ['audio', 'text'],
                instructions: firstMessage
              }
            }));
            onLog('ai', `(greeting) ${firstMessage}`);
          }
        } catch {}
      };
      attachMessageHandler(dc);

      // 4) Create SDP offer and send to OpenAI Realtime
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp || ''
      });
      if (!sdpResponse.ok) {
        const text = await sdpResponse.text();
        throw new Error(`SDP exchange failed: ${sdpResponse.status} ${text}`);
      }
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

      setIsRecording(true);
      onStateChange('connected');
      onLog('system', 'Realtime session established');
      // In Realtime mode, model manages VAD/turn-taking; keep our VAD indicators light
      onStateChange('listening');
      // Start lightweight VAD for UI feedback
      startVAD();

    } catch (error) {
      console.error('Error starting call:', error);
      onLog('system', `Failed to start call: ${error}`);
      onStateChange('error');
    }
  }, [onLog, onStateChange, setupAudioProcessing, audioElement, startVAD]);

  // End call and cleanup
  const endCall = useCallback(() => {
    onLog('system', 'Ending call...');
    
    stopVAD();
    
    if (pcRef.current) {
      try { pcRef.current.getSenders().forEach(s => s.track?.stop()); } catch {}
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    
    // Use ref to access current stream value without dependency
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause(); } catch {}
      currentAudioRef.current.srcObject = null;
      currentAudioRef.current = null;
    }
    
    analyserRef.current = null;
    isProcessingRef.current = false;
    setIsRecording(false);
    // Flush conversation ref to state for UI consumption post-call
    setConversation([...conversationRef.current]);
    
    onStateChange('idle');
    onLog('system', 'Call ended');
  }, [onLog, onStateChange, stopVAD]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    startCall,
    endCall,
    isRecording,
    conversation,
    realTimeConversation,
    clearTranscript: () => {
      conversationRef.current = [];
      setConversation([]);
      aiAccumRef.current = '';
      setRealTimeConversation([]);
    }
  };
}
