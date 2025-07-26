// API Types and Interfaces for Dayrade Platform

// Base Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'moderator' | 'admin';
  zimtraId?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  division: 'elevator' | 'crusader' | 'raider';
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  status: 'draft' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled';
  ticketSourceEventId?: string;
  zimtraTournamentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  registeredAt: string;
  ticketSourceBookingId?: string;
  zimtraAccountId?: string;
  startingBalance: number;
  currentPnL: number;
  currentBalance: number;
  totalTrades: number;
  finalRank?: number;
  finalPnL?: number;
}

// Trading Types
export interface TradingPerformance {
  id: string;
  tournamentId: string;
  userId: string;
  recordedAt: string;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  usdBalance: number;
  stocksTraded: number;
  totalSharesTraded: number;
  numberOfTrades: number;
  totalNotionalTraded: number;
  winRate?: number;
  bestTrade?: number;
  worstTrade?: number;
  currentPositions?: any;
}

export interface Trade {
  id: string;
  tournamentId: string;
  userId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  executedAt: string;
  pnl?: number;
  zimtraTradeId?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalPnL: number;
  realizedPnL: number;
  unrealizedPnL: number;
  numberOfTrades: number;
  winRate: number;
  bestTrade: number;
  change24h: number;
}

// Payment & TicketSource Types
export interface TicketPurchaseRequest {
  tournamentId: string;
  zimtraUsername: string;
  discordUsername?: string;
}

export interface TicketResponse {
  ticketSourceEventId: string;
  bookingId: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  currency: string;
}

export interface PaymentWebhook {
  eventType: 'booking.created' | 'booking.cancelled' | 'booking.refunded';
  data: {
    bookingId: string;
    customer: {
      email: string;
      firstName: string;
      lastName: string;
    };
    customFields: Record<string, string>;
    event: {
      id: string;
      name: string;
    };
    totalAmount: number;
  };
}

// Chat & Commentary Types
export interface ChatMessage {
  id: string;
  tournamentId: string;
  userId: string;
  messageText: string;
  messageType: 'user_message' | 'system_message' | 'commentary';
  streamMessageId?: string;
  isModerated: boolean;
  moderationReason?: string;
  sentimentScore?: number;
  relevanceScore?: number;
  createdAt: string;
}

export interface Commentary {
  id: string;
  tournamentId: string;
  personality: 'bull' | 'bear' | 'sage' | 'rocket';
  commentaryText: string;
  triggerEvent?: string;
  triggerData?: any;
  audioUrl?: string;
  audioDuration?: number;
  scheduledAt?: string;
  playedAt?: string;
  source: 'trading' | 'economic' | 'chat';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Economic Calendar Types
export interface EconomicEvent {
  id: string;
  name: string;
  description?: string;
  country: string;
  eventTime: string;
  impactLevel: 'low' | 'medium' | 'high';
  forecastValue?: number;
  actualValue?: number;
  previousValue?: number;
  affectedSymbols?: string[];
  createdAt: string;
}

// Rewards Types
export interface Reward {
  id: string;
  userId: string;
  type: 'cash' | 'zimtra_account' | 'tournament_ticket' | 'achievement';
  title: string;
  description: string;
  value: number;
  currency?: string;
  status: 'pending' | 'claimed' | 'expired';
  expiresAt?: string;
  claimedAt?: string;
  createdAt: string;
}

export interface ReferralStats {
  id: string;
  userId: string;
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  commissionsEarned: number;
  tier: number;
  tierProgress: any;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageParticipants: number;
  topPerformers: LeaderboardEntry[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    api: 'online' | 'offline';
    database: 'online' | 'offline';
    redis: 'online' | 'offline';
    websocket: 'online' | 'offline';
    ticketSource: 'online' | 'offline';
    zimtra: 'online' | 'offline';
    streamIo: 'online' | 'offline';
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
  };
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'tournament_start' | 'tournament_end' | 'trade_alert' | 'prize_won' | 'system_alert';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  tournamentUpdates: boolean;
  tradeAlerts: boolean;
  prizeNotifications: boolean;
  marketingEmails: boolean;
}

// File Upload Types
export interface FileUpload {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  category: 'avatar' | 'document' | 'tournament_media';
  uploadedAt: string;
}

// Integration Types
export interface ZimtraAccount {
  id: string;
  userId: string;
  zimtraId: string;
  username: string;
  accountType: 'sim' | 'live';
  balance: number;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface StreamChannel {
  id: string;
  tournamentId: string;
  channelType: 'tournament' | 'general' | 'announcements';
  name: string;
  members: string[];
  moderators: string[];
  createdAt: string;
}