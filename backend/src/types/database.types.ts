// Database types for Supabase integration
// This file defines TypeScript interfaces for database entities

export interface User {
  id: string;
  email: string;
  password_hash: string;
  passwordHash: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date | null;
  phone_number?: string;
  avatar_url: string;
  username: string;
  role: string;
  zimtra_id?: string;
  zimtra_username?: string;
  kyc_status: KycStatus;
  kyc_approved_at: Date | null;
  email_verified: boolean;
  email_verified_at: Date | null;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason: string;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  country?: string;
  timezone: string;
  
  // Camel case aliases for compatibility
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  phoneNumber?: string;
  avatarUrl: string;
  zimtraId?: string;
  zimtraUsername?: string;
  kycStatus: KycStatus;
  kycApprovedAt: Date | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum KycStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_SUBMITTED = 'NOT_SUBMITTED'
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  type: TournamentType;
  division: TournamentDivision;
  status: TournamentStatus;
  start_date: Date;
  end_date: Date;
  registration_start: Date;
  registration_end: Date;
  max_participants?: number;
  entry_fee?: number;
  prize_pool?: number;
  starting_balance: number;
  rules?: any;
  created_at: Date;
  updated_at: Date;
  
  // Camel case aliases for compatibility
  startDate: Date;
  endDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  maxParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  startingBalance: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  participants?: TournamentParticipant[];
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TournamentType {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  CHAMPIONSHIP = 'CHAMPIONSHIP'
}

export enum TournamentDivision {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  zimtra_account_id?: string;
  status: ParticipantStatus;
  joined_at: Date;
  current_rank?: number;
  best_rank?: number;
  bestRank?: number;
  starting_balance: number;
  current_balance: number;
  total_pnl: number;
  realized_pnl: number;
  unrealized_pnl: number;
  number_of_trades: number;
  total_shares_traded: number;
  number_of_stocks_traded: number;
  total_notional_traded: number;
  win_rate: number;
  best_trade: number;
  worst_trade: number;
  average_trade_size: number;
  max_drawdown: number;
  sharpe_ratio: number;
  volatility: number;
  position_count: number;
  long_positions: number;
  short_positions: number;
  last_trade_at?: Date;
  raw_zimtra_data?: any;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  total_trades: number;
  winning_trades: number;
  total_volume: number;
  
  // Camel case aliases for compatibility
  tournamentId: string;
  userId: string;
  zimtraAccountId?: string;
  joinedAt: Date;
  registeredAt: Date;
  currentRank?: number;
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  numberOfTrades: number;
  totalSharesTraded: number;
  numberOfStocksTraded: number;
  totalNotionalTraded: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  averageTradeSize: number;
  maxDrawdown: number;
  sharpeRatio: number;
  positionCount: number;
  longPositions: number;
  shortPositions: number;
  lastTradeAt?: Date;
  rawZimtraData?: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  totalTrades: number;
  winningTrades: number;
  totalVolume: number;
  
  // Relations
  user?: User;
  tournament?: Tournament;
}

export enum ParticipantStatus {
  ACTIVE = 'ACTIVE',
  ELIMINATED = 'ELIMINATED',
  DISQUALIFIED = 'DISQUALIFIED'
}

export interface Trade {
  id: string;
  tournament_id: string;
  user_id: string;
  participant_id: string;
  zimtra_trade_id?: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  total_value: number;
  commission: number;
  executed_at: Date;
  status: TradeStatus;
  pnl?: number;
  fees?: number;
  raw_zimtra_data?: any;
  created_at: Date;
  updated_at: Date;
  
  // Camel case aliases for compatibility
  tournamentId: string;
  userId: string;
  participantId: string;
  zimtraTradeId?: string;
  totalValue: number;
  executedAt: Date;
  rawZimtraData?: any;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  participant?: TournamentParticipant;
  tournament?: Tournament;
}

export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TradeStatus {
  PENDING = 'PENDING',
  EXECUTED = 'EXECUTED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  SETTLED = 'SETTLED',
  REJECTED = 'REJECTED'
}

export interface TradingPerformance {
  id: string;
  tournament_id: string;
  participant_id: string;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  max_drawdown: number;
  sharpe_ratio?: number;
  calculated_at: Date;
  recorded_at: Date;
  created_at: Date;
  updated_at: Date;
  // Additional properties for compatibility
  totalPnl?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
  usdBalance?: number;
  numberOfTrades: number;
  totalSharesTraded?: number;
  numberOfStocksTraded: number;
  totalNotionalTraded?: number;
  winRate?: number;
  bestTrade?: number;
  worstTrade?: number;
  averageTradeSize?: number;
  maxDrawdown?: number;
  sharpeRatio?: number;
  positionCount?: number;
  longPositions?: number;
  shortPositions?: number;
  rawZimtraData?: any;
  volatility?: number;
  currentPositions?: number;
  recordedAt: Date;
}

export interface SystemConfiguration {
  id: string;
  key: string;
  value: any;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum NotificationType {
  TOURNAMENT_START = 'TOURNAMENT_START',
  TOURNAMENT_END = 'TOURNAMENT_END',
  TOURNAMENT_REGISTRATION = 'TOURNAMENT_REGISTRATION',
  RANK_CHANGE = 'RANK_CHANGE',
  TRADE_EXECUTED = 'TRADE_EXECUTED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Activity Heatmap Types
export interface TradingActivity {
  id: string;
  trader_id: string;
  timestamp: Date;
  activity_score: number;
  volume_score: number;
  frequency_score: number;
  portfolio_change_score: number;
  pnl_change_score: number;
  raw_data: any;
  created_at: Date;
}

export interface ActivityHeatmapAggregate {
  id: string;
  trader_id: string;
  date: Date;
  hour: number;
  avg_activity_score: number;
  max_activity_score: number;
  total_trades: number;
  total_volume: number;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityThreshold {
  id: string;
  threshold_type: string;
  min_value: number;
  max_value: number;
  color_code: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityColorMapping {
  id: string;
  score_range_min: number;
  score_range_max: number;
  color_hex: string;
  color_name: string;
  opacity: number;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityStatistic {
  id: string;
  trader_id: string;
  date: Date;
  total_activity_score: number;
  avg_activity_score: number;
  peak_activity_hour: number;
  peak_activity_score: number;
  total_active_hours: number;
  created_at: Date;
  updated_at: Date;
}

// Email System Types
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EmailLog {
  id: number;
  template_name?: string;
  recipient_email: string;
  subject: string;
  status: EmailStatus;
  brevo_message_id?: string;
  error_message?: string;
  sent_at?: Date;
  created_at: Date;
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
  DELIVERED = 'delivered'
}

export interface EmailQueue {
  id: number;
  recipient_email: string;
  template_name: string;
  template_data: any;
  priority: number;
  max_attempts: number;
  current_attempts: number;
  status: EmailQueueStatus;
  scheduled_for?: Date;
  last_attempt_at?: Date;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

export enum EmailQueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Prisma-like types for compatibility
export type Prisma = {
  UserCreateInput: Partial<User>;
  UserUpdateInput: Partial<User>;
  TournamentCreateInput: Partial<Tournament>;
  TournamentUpdateInput: Partial<Tournament>;
  TournamentParticipantCreateInput: Partial<TournamentParticipant>;
  TournamentParticipantUpdateInput: Partial<TournamentParticipant>;
  TradeCreateInput: Partial<Trade>;
  TradeUpdateInput: Partial<Trade>;
  TradingPerformanceCreateInput: Partial<TradingPerformance>;
  TradingPerformanceUpdateInput: Partial<TradingPerformance>;
  SystemConfigurationCreateInput: Partial<SystemConfiguration>;
  SystemConfigurationUpdateInput: Partial<SystemConfiguration>;
  NotificationCreateInput: Partial<Notification>;
  NotificationUpdateInput: Partial<Notification>;
  AuditLogCreateInput: Partial<AuditLog>;
};

// Mock Prisma namespace for compatibility
export namespace Prisma {
  export interface UserWhereInput {
    id?: string;
    email?: string;
    first_name?: string;
    firstName?: string;
    last_name?: string;
    lastName?: string;
    is_active?: boolean;
    isActive?: boolean;
    is_suspended?: boolean;
    isSuspended?: boolean;
    email_verified?: boolean;
    emailVerified?: boolean;
    kyc_status?: KycStatus;
    kycStatus?: KycStatus;
    created_at?: {
      gte?: Date;
      lte?: Date;
    };
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
    AND?: UserWhereInput[];
    OR?: UserWhereInput[];
  }

  export interface UserOrderByWithRelationInput {
    id?: 'asc' | 'desc';
    email?: 'asc' | 'desc';
    first_name?: 'asc' | 'desc';
    firstName?: 'asc' | 'desc';
    last_name?: 'asc' | 'desc';
    lastName?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    updated_at?: 'asc' | 'desc';
    updatedAt?: 'asc' | 'desc';
  }

  export interface TournamentWhereInput {
    id?: string;
    name?: string;
    status?: TournamentStatus | {
      in?: TournamentStatus[];
      not?: TournamentStatus;
      notIn?: TournamentStatus[];
    };
    division?: TournamentDivision;
    start_date?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    startsAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    end_date?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    endsAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    registration_starts_at?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    registrationStartsAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    registration_ends_at?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    registrationEndsAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    prizePool?: number;
    prize_pool?: number;
    description?: string;
    tournament?: {
      status?: {
        in?: TournamentStatus[];
      };
    };
    AND?: TournamentWhereInput[];
    OR?: TournamentWhereInput[];
  }

  export interface TournamentOrderByWithRelationInput {
    id?: 'asc' | 'desc';
    name?: 'asc' | 'desc';
    start_date?: 'asc' | 'desc';
    startsAt?: 'asc' | 'desc';
    end_date?: 'asc' | 'desc';
    endsAt?: 'asc' | 'desc';
    registration_starts_at?: 'asc' | 'desc';
    registrationStartsAt?: 'asc' | 'desc';
    registration_ends_at?: 'asc' | 'desc';
    registrationEndsAt?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
  }

  export interface TournamentParticipantWhereInput {
    id?: string;
    tournament_id?: string;
    tournamentId?: string;
    user_id?: string;
    userId?: string;
    status?: ParticipantStatus;
    joined_at?: {
      gte?: Date;
      lte?: Date;
    };
    AND?: TournamentParticipantWhereInput[];
    OR?: TournamentParticipantWhereInput[];
  }

  export interface TournamentParticipantOrderByWithRelationInput {
    id?: 'asc' | 'desc';
    tournament_id?: 'asc' | 'desc';
    tournamentId?: 'asc' | 'desc';
    user_id?: 'asc' | 'desc';
    userId?: 'asc' | 'desc';
    joined_at?: 'asc' | 'desc';
    joinedAt?: 'asc' | 'desc';
    registered_at?: 'asc' | 'desc';
    registeredAt?: 'asc' | 'desc';
    current_rank?: 'asc' | 'desc';
    currentRank?: 'asc' | 'desc';
    total_pnl?: 'asc' | 'desc';
    totalPnl?: 'asc' | 'desc';
  }

  export interface TradeWhereInput {
    id?: string;
    tournament_id?: string;
    tournamentId?: string;
    user_id?: string;
    userId?: string;
    participant_id?: string;
    participantId?: string;
    symbol?: string;
    side?: TradeSide;
    status?: TradeStatus;
    executed_at?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    executedAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    created_at?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    createdAt?: {
      gte?: Date;
      lte?: Date;
      gt?: Date;
      lt?: Date;
    };
    AND?: TradeWhereInput[];
    OR?: TradeWhereInput[];
  }

  export interface TradeOrderByWithRelationInput {
    id?: 'asc' | 'desc';
    symbol?: 'asc' | 'desc';
    executed_at?: 'asc' | 'desc';
    executedAt?: 'asc' | 'desc';
    quantity?: 'asc' | 'desc';
    price?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    updated_at?: 'asc' | 'desc';
    updatedAt?: 'asc' | 'desc';
  }

  export interface TradingPerformanceWhereInput {
    id?: string;
    tournament_id?: string;
    tournamentId?: string;
    participant_id?: string;
    participantId?: string;
    user_id?: string;
    userId?: string;
    total_pnl?: {
      gte?: number;
      lte?: number;
    };
    AND?: TradingPerformanceWhereInput[];
    OR?: TradingPerformanceWhereInput[];
  }

  export interface TradingPerformanceOrderByWithRelationInput {
    id?: 'asc' | 'desc';
    tournament_id?: 'asc' | 'desc';
    tournamentId?: 'asc' | 'desc';
    participant_id?: 'asc' | 'desc';
    participantId?: 'asc' | 'desc';
    total_pnl?: 'asc' | 'desc';
    totalPnl?: 'asc' | 'desc';
    win_rate?: 'asc' | 'desc';
    winRate?: 'asc' | 'desc';
    calculated_at?: 'asc' | 'desc';
    calculatedAt?: 'asc' | 'desc';
    recorded_at?: 'asc' | 'desc';
    recordedAt?: 'asc' | 'desc';
    created_at?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
    updated_at?: 'asc' | 'desc';
    updatedAt?: 'asc' | 'desc';
  }
}

// Mock PrismaClient interface for compatibility
export interface PrismaClient {
  user: any;
  tournament: any;
  tournamentParticipant: any;
  trade: any;
  tradingPerformance: any;
  systemConfiguration: any;
  notification: any;
  auditLog: any;
  tradingActivity: any;
  activityHeatmapAggregate: any;
  activityThreshold: any;
  activityColorMapping: any;
  activityStatistic: any;
  emailTemplate: any;
  emailLog: any;
  emailQueue: any;
}