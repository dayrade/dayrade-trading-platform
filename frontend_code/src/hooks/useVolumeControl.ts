import { useState, useCallback } from 'react';

export const useVolumeControl = (initialVolume: number = 75) => {
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    volume,
    isMuted,
    handleVolumeChange,
    handleMuteToggle
  };
};