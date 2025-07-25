import { useState, useEffect } from 'react';
import { CommentaryMessage } from '@/constants/commentators';

export const useCommentaryRotation = (messages: CommentaryMessage[], intervalMs: number = 4000) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [messages.length, intervalMs]);

  return {
    currentMessage: messages[currentMessageIndex],
    currentMessageIndex
  };
};