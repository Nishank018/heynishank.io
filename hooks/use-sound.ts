"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SoundAsset,
  UseSoundOptions,
  UseSoundReturn,
} from "@/lib/sound-types";

export function useSound(
  sound: SoundAsset,
  options: UseSoundOptions = {}
): UseSoundReturn {
  const {
    volume = 1,
    playbackRate = 1,
    interrupt = false,
    soundEnabled = true,
    onPlay,
    onEnd,
    onPause,
    onStop,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(sound.duration ?? null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio into browser memory on mount
  useEffect(() => {
    if (typeof window === "undefined" || !sound?.dataUri) return;

    try {
      const audio = new Audio(sound.dataUri);
      audio.preload = "auto";
      audio.load();
      preloadedAudioRef.current = audio;

      const handleLoadedMetadata = () => {
        if (!isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.pause();
        audio.src = "";
        preloadedAudioRef.current = null;
      };
    } catch {
      // Audio element creation error ignored
    }
  }, [sound.dataUri]);

  const stop = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch {
        // Already stopped
      }
      activeAudioRef.current = null;
    }
    setIsPlaying(false);
    onStop?.();
  }, [onStop]);

  const play = useCallback(
    (overrides?: { volume?: number; playbackRate?: number }) => {
      if (!soundEnabled || typeof window === "undefined" || !sound?.dataUri) return;

      const finalVolume = Math.max(0, Math.min(1, overrides?.volume ?? volume));
      const finalRate = overrides?.playbackRate ?? playbackRate;

      try {
        if (interrupt && activeAudioRef.current) {
          stop();
        }

        let audio = preloadedAudioRef.current;
        if (!audio || !audio.src) {
          audio = new Audio(sound.dataUri);
          audio.preload = "auto";
          preloadedAudioRef.current = audio;
        }

        audio.pause();
        audio.currentTime = 0;
        audio.volume = finalVolume;
        audio.playbackRate = finalRate;

        audio.onplay = () => {
          setIsPlaying(true);
          onPlay?.();
        };

        audio.onended = () => {
          setIsPlaying(false);
          onEnd?.();
        };

        audio.onerror = () => {
          setIsPlaying(false);
        };

        activeAudioRef.current = audio;

        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Secondary fallback attempt with fresh Audio element
            try {
              const fresh = new Audio(sound.dataUri);
              fresh.volume = finalVolume;
              fresh.playbackRate = finalRate;
              fresh.play().catch(() => {});
            } catch {
              // ignore
            }
            setIsPlaying(false);
          });
        }
      } catch {
        // Playback catch
      }
    },
    [sound.dataUri, soundEnabled, volume, playbackRate, interrupt, stop, onPlay, onEnd]
  );

  const pause = useCallback(() => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  useEffect(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.pause();
          activeAudioRef.current.src = "";
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return [play, { stop, pause, isPlaying, duration, sound }] as const;
}
