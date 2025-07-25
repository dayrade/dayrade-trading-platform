// Tournament management hook for Dayrade platform
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { tournamentApi } from '@/api/tournaments';
import { useAuth } from './useAuth';
import type { Tournament, TournamentParticipant, LeaderboardEntry } from '@/types/api';

export const useTournaments = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get all tournaments
  const { 
    data: tournaments, 
    isLoading: tournamentsLoading,
    error: tournamentsError 
  } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => tournamentApi.getTournaments(),
  });

  // Get upcoming tournaments
  const { 
    data: upcomingTournaments, 
    isLoading: upcomingLoading 
  } = useQuery({
    queryKey: ['tournaments', 'upcoming'],
    queryFn: tournamentApi.getUpcomingTournaments,
  });

  // Get live tournaments
  const { 
    data: liveTournaments, 
    isLoading: liveLoading 
  } = useQuery({
    queryKey: ['tournaments', 'live'],
    queryFn: tournamentApi.getLiveTournaments,
    refetchInterval: 30000, // Refetch every 30 seconds for live tournaments
  });

  // Get completed tournaments
  const { 
    data: completedTournaments, 
    isLoading: completedLoading 
  } = useQuery({
    queryKey: ['tournaments', 'completed'],
    queryFn: tournamentApi.getCompletedTournaments,
  });

  // Get user's tournament registrations
  const { 
    data: myTournaments, 
    isLoading: myTournamentsLoading 
  } = useQuery({
    queryKey: ['tournaments', 'my-tournaments'],
    queryFn: tournamentApi.getMyTournaments,
    enabled: isAuthenticated,
  });

  // Tournament registration mutation
  const registerMutation = useMutation({
    mutationFn: ({ tournamentId, zimtraUsername }: { tournamentId: string; zimtraUsername?: string }) =>
      tournamentApi.registerForTournament(tournamentId, zimtraUsername),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments', 'my-tournaments'] });
    },
  });

  // Tournament unregistration mutation
  const unregisterMutation = useMutation({
    mutationFn: (tournamentId: string) => tournamentApi.unregisterFromTournament(tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments', 'my-tournaments'] });
    },
  });

  // Helper functions for specific tournament data
  const getTournament = useCallback((tournamentId: string) => {
    return useQuery({
      queryKey: ['tournaments', tournamentId],
      queryFn: () => tournamentApi.getTournament(tournamentId),
      enabled: !!tournamentId,
    });
  }, []);

  const getTournamentParticipants = useCallback((tournamentId: string) => {
    return useQuery({
      queryKey: ['tournaments', tournamentId, 'participants'],
      queryFn: () => tournamentApi.getParticipants(tournamentId),
      enabled: !!tournamentId,
    });
  }, []);

  const getTournamentLeaderboard = useCallback((tournamentId: string, limit?: number) => {
    return useQuery({
      queryKey: ['tournaments', tournamentId, 'leaderboard', limit],
      queryFn: () => tournamentApi.getLeaderboard(tournamentId, limit),
      enabled: !!tournamentId,
      refetchInterval: 5000, // Refetch every 5 seconds for live leaderboard
    });
  }, []);

  const getMyPerformance = useCallback((tournamentId: string) => {
    return useQuery({
      queryKey: ['tournaments', tournamentId, 'my-performance'],
      queryFn: () => tournamentApi.getMyPerformance(tournamentId),
      enabled: !!tournamentId && isAuthenticated,
      refetchInterval: 10000, // Refetch every 10 seconds for live performance
    });
  }, [isAuthenticated]);

  const getTournamentStats = useCallback((tournamentId: string) => {
    return useQuery({
      queryKey: ['tournaments', tournamentId, 'stats'],
      queryFn: () => tournamentApi.getTournamentStats(tournamentId),
      enabled: !!tournamentId,
    });
  }, []);

  // Filtered tournament queries
  const getTournamentsByDivision = useCallback((division: 'elevator' | 'crusader' | 'raider') => {
    return useQuery({
      queryKey: ['tournaments', 'division', division],
      queryFn: () => tournamentApi.getTournamentsByDivision(division),
    });
  }, []);

  // Global leaderboard
  const { 
    data: globalLeaderboard, 
    isLoading: globalLeaderboardLoading 
  } = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: tournamentApi.getGlobalLeaderboard,
  });

  // Action functions
  const registerForTournament = useCallback((tournamentId: string, zimtraUsername?: string) => {
    return registerMutation.mutateAsync({ tournamentId, zimtraUsername });
  }, [registerMutation]);

  const unregisterFromTournament = useCallback((tournamentId: string) => {
    return unregisterMutation.mutateAsync(tournamentId);
  }, [unregisterMutation]);

  // Utility functions
  const isRegisteredForTournament = useCallback((tournamentId: string): boolean => {
    if (!myTournaments) return false;
    return myTournaments.some((registration: TournamentParticipant) => 
      registration.tournamentId === tournamentId
    );
  }, [myTournaments]);

  const canRegisterForTournament = useCallback((tournament: Tournament): { canRegister: boolean; reason?: string } => {
    if (!isAuthenticated) {
      return { canRegister: false, reason: 'Must be logged in' };
    }

    if (tournament.status !== 'registration_open') {
      return { canRegister: false, reason: 'Registration is closed' };
    }

    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return { canRegister: false, reason: 'Tournament is full' };
    }

    const registrationDeadline = new Date(tournament.registrationDeadline);
    if (Date.now() > registrationDeadline.getTime()) {
      return { canRegister: false, reason: 'Registration deadline has passed' };
    }

    if (isRegisteredForTournament(tournament.id)) {
      return { canRegister: false, reason: 'Already registered' };
    }

    return { canRegister: true };
  }, [isAuthenticated, isRegisteredForTournament]);

  const getTournamentStatusBadgeColor = useCallback((status: Tournament['status']) => {
    const statusColors = {
      'draft': 'gray',
      'registration_open': 'blue',
      'registration_closed': 'yellow',
      'active': 'green',
      'completed': 'purple',
      'cancelled': 'red',
    };
    return statusColors[status] || 'gray';
  }, []);

  const getTournamentTimeRemaining = useCallback((tournament: Tournament) => {
    const now = Date.now();
    const startTime = new Date(tournament.startDate).getTime();
    const endTime = new Date(tournament.endDate).getTime();

    if (now < startTime) {
      const timeToStart = startTime - now;
      return {
        phase: 'upcoming' as const,
        timeRemaining: timeToStart,
        label: 'Starts in',
      };
    } else if (now >= startTime && now < endTime) {
      const timeToEnd = endTime - now;
      return {
        phase: 'active' as const,
        timeRemaining: timeToEnd,
        label: 'Ends in',
      };
    } else {
      return {
        phase: 'completed' as const,
        timeRemaining: 0,
        label: 'Completed',
      };
    }
  }, []);

  const formatTimeRemaining = useCallback((milliseconds: number): string => {
    if (milliseconds <= 0) return '0m';

    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  // Real-time subscriptions (placeholder for WebSocket implementation)
  const subscribeToLiveLeaderboard = useCallback((tournamentId: string, callback: (data: LeaderboardEntry[]) => void) => {
    // Placeholder: Implement WebSocket subscription
    return tournamentApi.subscribeLiveLeaderboard(tournamentId, callback);
  }, []);

  // Refresh functions
  const refreshTournaments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
  }, [queryClient]);

  const refreshLeaderboard = useCallback((tournamentId: string) => {
    queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'leaderboard'] });
  }, [queryClient]);

  return {
    // Data
    tournaments: tournaments?.data || [],
    upcomingTournaments: upcomingTournaments || [],
    liveTournaments: liveTournaments || [],
    completedTournaments: completedTournaments || [],
    myTournaments: myTournaments || [],
    globalLeaderboard: globalLeaderboard || [],

    // Loading states
    isLoading: tournamentsLoading,
    isUpcomingLoading: upcomingLoading,
    isLiveLoading: liveLoading,
    isCompletedLoading: completedLoading,
    isMyTournamentsLoading: myTournamentsLoading,
    isGlobalLeaderboardLoading: globalLeaderboardLoading,
    isRegistering: registerMutation.isPending,
    isUnregistering: unregisterMutation.isPending,

    // Errors
    error: tournamentsError,
    registerError: registerMutation.error,
    unregisterError: unregisterMutation.error,

    // Query functions
    getTournament,
    getTournamentParticipants,
    getTournamentLeaderboard,
    getMyPerformance,
    getTournamentStats,
    getTournamentsByDivision,

    // Actions
    registerForTournament,
    unregisterFromTournament,

    // Utilities
    isRegisteredForTournament,
    canRegisterForTournament,
    getTournamentStatusBadgeColor,
    getTournamentTimeRemaining,
    formatTimeRemaining,

    // Real-time
    subscribeToLiveLeaderboard,

    // Refresh
    refreshTournaments,
    refreshLeaderboard,
  };
};

// Specialized hooks for specific tournament operations
export const useTournament = (tournamentId: string) => {
  const { getTournament } = useTournaments();
  return getTournament(tournamentId);
};

export const useTournamentLeaderboard = (tournamentId: string, limit?: number) => {
  const { getTournamentLeaderboard } = useTournaments();
  return getTournamentLeaderboard(tournamentId, limit);
};

export const useMyTournamentPerformance = (tournamentId: string) => {
  const { getMyPerformance } = useTournaments();
  return getMyPerformance(tournamentId);
};

export const useTournamentsByDivision = (division: 'elevator' | 'crusader' | 'raider') => {
  const { getTournamentsByDivision } = useTournaments();
  return getTournamentsByDivision(division);
};