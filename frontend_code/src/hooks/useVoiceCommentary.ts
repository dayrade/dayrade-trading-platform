import { useState, useEffect } from 'react';

export interface VoiceCommentaryConfig {
  enabled: boolean;
  budget: number;
  usedBudget: number;
  costPerMinute: number;
  emergencyStop: boolean;
  autoCommentary: boolean;
  commentaryInterval: number; // minutes
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
    volume: number;
  };
}

export interface VoiceCommentaryStats {
  totalMinutesUsed: number;
  totalCost: number;
  sessionsToday: number;
  averageSessionLength: number;
  lastActivity: string;
}

const defaultConfig: VoiceCommentaryConfig = {
  enabled: false,
  budget: 100.00,
  usedBudget: 0,
  costPerMinute: 0.25,
  emergencyStop: false,
  autoCommentary: true,
  commentaryInterval: 5,
  voiceSettings: {
    voice: 'en-US-Neural2-D',
    speed: 1.0,
    pitch: 0.0,
    volume: 0.8
  }
};

const mockStats: VoiceCommentaryStats = {
  totalMinutesUsed: 45.5,
  totalCost: 11.38,
  sessionsToday: 8,
  averageSessionLength: 5.7,
  lastActivity: '2 minutes ago'
};

export const useVoiceCommentary = () => {
  const [config, setConfig] = useState<VoiceCommentaryConfig>(defaultConfig);
  const [stats, setStats] = useState<VoiceCommentaryStats>(mockStats);
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    duration: number;
    cost: number;
  } | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    if (isActive && !config.emergencyStop) {
      const interval = setInterval(() => {
        setCurrentSession(prev => {
          if (!prev) return null;
          
          const duration = (Date.now() - prev.startTime.getTime()) / 1000 / 60; // minutes
          const cost = duration * config.costPerMinute;
          
          return {
            ...prev,
            duration,
            cost
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive, config.emergencyStop, config.costPerMinute]);

  const startCommentary = async () => {
    if (config.emergencyStop || !config.enabled) {
      throw new Error('Commentary is disabled or emergency stop is active');
    }

    if (config.usedBudget >= config.budget) {
      throw new Error('Budget limit reached');
    }

    setIsActive(true);
    setCurrentSession({
      startTime: new Date(),
      duration: 0,
      cost: 0
    });

    // Simulate API call to start voice synthesis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, sessionId: `session_${Date.now()}` });
      }, 500);
    });
  };

  const stopCommentary = async () => {
    if (currentSession) {
      const finalCost = currentSession.cost;
      
      setConfig(prev => ({
        ...prev,
        usedBudget: prev.usedBudget + finalCost
      }));

      setStats(prev => ({
        ...prev,
        totalMinutesUsed: prev.totalMinutesUsed + currentSession.duration,
        totalCost: prev.totalCost + finalCost,
        sessionsToday: prev.sessionsToday + 1,
        lastActivity: 'Just now'
      }));
    }

    setIsActive(false);
    setCurrentSession(null);

    // Simulate API call to stop voice synthesis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  };

  const emergencyStop = async () => {
    setConfig(prev => ({ ...prev, emergencyStop: true }));
    if (isActive) {
      await stopCommentary();
    }
    
    // Simulate emergency stop API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Emergency stop activated' });
      }, 100);
    });
  };

  const resetEmergencyStop = () => {
    setConfig(prev => ({ ...prev, emergencyStop: false }));
  };

  const updateConfig = (updates: Partial<VoiceCommentaryConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const generateCommentary = async (data: {
    topPerformers: any[];
    marketData: any;
    tournamentStatus: string;
  }) => {
    // Simulate commentary generation based on current data
    const commentary = generateCommentaryText(data);
    
    if (config.enabled && !config.emergencyStop) {
      // Simulate text-to-speech API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            text: commentary,
            audioUrl: `https://api.voice.com/audio/${Date.now()}`,
            duration: commentary.length * 0.1 // Estimate duration
          });
        }, 1000);
      });
    }
    
    return { success: false, error: 'Commentary disabled' };
  };

  return {
    config,
    stats,
    isActive,
    currentSession,
    startCommentary,
    stopCommentary,
    emergencyStop,
    resetEmergencyStop,
    updateConfig,
    generateCommentary
  };
};

function generateCommentaryText(data: {
  topPerformers: any[];
  marketData: any;
  tournamentStatus: string;
}): string {
  const { topPerformers, tournamentStatus } = data;
  
  const templates = [
    `The tournament is currently ${tournamentStatus.toLowerCase()}. Leading the pack is ${topPerformers[0]?.name || 'our top trader'} with impressive gains.`,
    `Market activity is heating up! ${topPerformers[0]?.name || 'The leader'} maintains their position while ${topPerformers[1]?.name || 'second place'} is closing the gap.`,
    `Exciting developments in today's trading session. We're seeing strong performance from ${topPerformers[0]?.name || 'our frontrunner'} with consistent profitable trades.`,
    `The competition is fierce! ${topPerformers.length} traders are actively competing, with ${topPerformers[0]?.name || 'our leader'} setting the pace.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export default useVoiceCommentary;