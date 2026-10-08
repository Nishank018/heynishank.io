export interface PlaySoundOptions {
  volume?: number;
  playbackRate?: number;
  onEnd?: () => void;
}

export interface SoundPlayback {
  stop: () => void;
}

export async function playSound(
  dataUri: string,
  options: PlaySoundOptions = {}
): Promise<SoundPlayback> {
  const { volume = 1, playbackRate = 1, onEnd } = options;

  if (typeof window === "undefined") {
    return { stop: () => {} };
  }

  const audio = new Audio(dataUri);
  audio.volume = Math.max(0, Math.min(1, volume));
  audio.playbackRate = playbackRate;

  audio.onended = () => {
    onEnd?.();
  };

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn("Audio playback prevented:", err);
    });
  }

  return {
    stop: () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // ignore
      }
    },
  };
}
