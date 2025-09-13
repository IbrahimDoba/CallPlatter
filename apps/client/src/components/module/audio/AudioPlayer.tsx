import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  callDuration?: number | string;
  className?: string;
}

export function AudioPlayer({ audioUrl, callDuration, className = "" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("[AudioPlayer] Props received:", {
      audioUrl,
      callDuration,
      hasAudioRef: !!audioRef.current
    });
  }, [audioUrl, callDuration]);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl || !audioRef.current) {
      console.log("[AudioPlayer] Missing audioUrl or audioRef:", { audioUrl, hasRef: !!audioRef.current });
      return;
    }

    const audio = audioRef.current;
    
    console.log("[AudioPlayer] Setting up audio listeners for URL:", audioUrl);
    
    const handleLoadStart = () => {
      console.log("[AudioPlayer] Audio load started");
      setIsLoading(true);
      setError(null);
      setCanPlay(null);
    };
    
    const handleCanPlay = () => {
      console.log("[AudioPlayer] Audio can play");
      setCanPlay(true);
      setIsLoading(false);
    };
    
    const handleLoadedData = () => {
      console.log("[AudioPlayer] Audio data loaded, duration:", audio.duration);
      setIsLoading(false);
      setDuration(audio.duration);
      setError(null);
      setCanPlay(true);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      console.log("[AudioPlayer] Audio playback ended");
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      console.error("[AudioPlayer] Audio error:", {
        error: target?.error,
        networkState: target?.networkState,
        readyState: target?.readyState,
        src: target?.src
      });
      setIsLoading(false);
      setError("Failed to load audio");
      setIsPlaying(false);
      setCanPlay(false);
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlay); // Additional event
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('loadedmetadata', handleLoadedData); // Additional event
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set crossOrigin and preload attributes
    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    
    // Set the source and load
    audio.src = audioUrl;
    audio.load();

    return () => {
      console.log("[AudioPlayer] Cleaning up audio listeners");
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('loadedmetadata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) {
      console.log("[AudioPlayer] Cannot play - missing ref or URL");
      return;
    }

    const audio = audioRef.current;
    console.log("[AudioPlayer] Play/Pause clicked, current state:", {
      isPlaying,
      canPlay,
      readyState: audio.readyState,
      networkState: audio.networkState,
      src: audio.src
    });

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        console.log("[AudioPlayer] Audio paused");
      } else {
        // Check if audio is ready to play
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          await audio.play();
          setIsPlaying(true);
          console.log("[AudioPlayer] Audio playing");
        } else {
          // Wait for audio to be ready
          console.log("[AudioPlayer] Audio not ready, waiting...");
          setIsLoading(true);
          await new Promise<void>((resolve, reject) => {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              resolve();
            };
            const onError = () => {
              audio.removeEventListener('canplay', onCanPlay);
              audio.removeEventListener('error', onError);
              reject(new Error('Audio failed to load'));
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('error', onError);
          });
          setIsLoading(false);
          await audio.play();
          setIsPlaying(true);
          console.log("[AudioPlayer] Audio playing after wait");
        }
      }
    } catch (err) {
      console.error("[AudioPlayer] Playback error:", err);
      setError(`Playback failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    console.log("[AudioPlayer] Seeked to:", seekTime);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    console.log("[AudioPlayer] Mute toggled:", newMuted);
  };

  // Generate waveform bars (simulated based on duration)
  const generateWaveform = () => {
    const barCount = 60;
    const bars = [];
    
    for (let i = 0; i < barCount; i++) {
      const progress = duration ? currentTime / duration : 0;
      const isActive = i / barCount <= progress;
      
      // Create varied heights for visual appeal
      const heightVariations = [2, 3, 4, 5, 6, 4, 3, 2, 4, 5];
      const height: number = heightVariations[i % heightVariations.length] || 2;
      
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 cursor-pointer hover:opacity-80 ${
            isActive 
              ? 'bg-blue-500' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`}
          style={{ height: `${height * 4}px` }}
        />
      );
    }
    
    return bars;
  };

  if (!audioUrl) {
    console.log("[AudioPlayer] No audio URL provided");
    return (
      <div className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <Volume2 className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">No recording available</p>
          {callDuration && (
            <p className="text-xs text-gray-400">
              Call duration: {typeof callDuration === 'string' ? callDuration : formatTime(Number(callDuration))}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show "not supported" only if we've confirmed the audio can't play
  if (canPlay === false && !isLoading) {
    console.log("[AudioPlayer] Audio cannot play, showing fallback");
    return (
      <div className={`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <Volume2 className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">Recording format not supported for playback</p>
          <a 
            href={audioUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-600 underline"
          >
            Open in new tab
          </a>
          {callDuration && (
            <p className="text-xs text-gray-400">
              Call duration: {typeof callDuration === 'string' ? callDuration : formatTime(Number(callDuration))}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    console.log("[AudioPlayer] Showing error state:", error);
    return (
      <div className={`bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <VolumeX className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log("[AudioPlayer] Retry clicked");
                setError(null);
                setCanPlay(null);
                setIsLoading(true);
                if (audioRef.current) {
                  audioRef.current.load();
                }
              }}
            >
              Retry
            </Button>
            <a 
              href={audioUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-600 underline px-2 py-1"
            >
              Open in new tab
            </a>
          </div>
        </div>
      </div>
    );
  }

  console.log("[AudioPlayer] Rendering player controls");

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      >
        <track
          kind="captions"
          src=""
          srcLang="en"
          label="English"
          default
        />
      </audio>
      
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
          <div>URL: {audioUrl}</div>
          <div>Can Play: {canPlay?.toString()}</div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Error: {error || 'None'}</div>
          <div>Ready State: {audioRef.current?.readyState}</div>
        </div>
      )}

      {/* Controls Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="h-10 w-10 rounded-full p-0 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>

          {/* Time Display */}
          <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {formatTime(currentTime)}{duration && Number.isFinite(duration) ? ` / ${formatTime(duration)}` : ''}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-gray-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-500" />
              )}
            </Button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Waveform Progress Bar */}
      <button 
        type="button"
        className="w-full flex items-center justify-center space-x-1 h-12 cursor-pointer bg-gray-50 dark:bg-gray-800 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={handleSeek}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const mockEvent = { currentTarget: e.currentTarget } as React.MouseEvent<HTMLButtonElement>;
            handleSeek(mockEvent);
          }
        }}
      >
        {generateWaveform()}
      </button>

      {/* Progress Bar */}
      <div className="space-y-2">
        <button 
          type="button"
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer hover:h-3 transition-all p-0 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleSeek}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const mockEvent = { currentTarget: e.currentTarget } as React.MouseEvent<HTMLButtonElement>;
              handleSeek(mockEvent);
            }
          }}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-150"
            style={{
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </button>
      </div>
    </div>
  );
}