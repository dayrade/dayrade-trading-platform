import { Request, Response, NextFunction } from 'express';

// Define enums locally since we can't import from Prisma client
enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

enum TournamentDivision {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL'
}

// Authentication middleware
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement JWT token validation
  // For now, we'll assume user is authenticated and add userId to request
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }

  // Extract token and validate (placeholder implementation)
  const token = authHeader.substring(7);
  
  // TODO: Verify JWT token and extract user information
  // For now, we'll mock this
  try {
    // Mock user extraction from token
    (req as any).user = {
      id: 'user-123', // This would come from JWT payload
      email: 'user@example.com',
      role: 'USER'
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
};

// Admin authorization middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  
  next();
};

// Simple validation helpers
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isValidDecimal = (value: string): boolean => {
  return /^\d+(\.\d{1,2})?$/.test(value);
};

// Tournament validation middleware
export const validateCreateTournament = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];
  const { name, description, startDate, endDate, registrationOpenDate, registrationCloseDate, 
          maxParticipants, entryFee, prizePool, division, tradingSymbols, rules } = req.body;

  // Required fields
  if (!name || typeof name !== 'string' || name.length < 3 || name.length > 100) {
    errors.push('Tournament name must be between 3 and 100 characters');
  }

  if (!startDate || !isValidDate(startDate)) {
    errors.push('Start date must be a valid ISO 8601 date');
  } else if (new Date(startDate) <= new Date()) {
    errors.push('Start date must be in the future');
  }

  if (!endDate || !isValidDate(endDate)) {
    errors.push('End date must be a valid ISO 8601 date');
  } else if (new Date(endDate) <= new Date(startDate)) {
    errors.push('End date must be after start date');
  }

  if (!registrationOpenDate || !isValidDate(registrationOpenDate)) {
    errors.push('Registration open date must be a valid ISO 8601 date');
  }

  if (!registrationCloseDate || !isValidDate(registrationCloseDate)) {
    errors.push('Registration close date must be a valid ISO 8601 date');
  } else if (new Date(registrationCloseDate) >= new Date(startDate)) {
    errors.push('Registration must close before tournament starts');
  }

  if (!division || !Object.values(TournamentDivision).includes(division)) {
    errors.push(`Division must be one of: ${Object.values(TournamentDivision).join(', ')}`);
  }

  if (!tradingSymbols || !Array.isArray(tradingSymbols) || tradingSymbols.length === 0) {
    errors.push('At least one trading symbol is required');
  } else if (!tradingSymbols.every((symbol: any) => typeof symbol === 'string' && symbol.length > 0)) {
    errors.push('All trading symbols must be non-empty strings');
  }

  // Optional fields
  if (description && (typeof description !== 'string' || description.length > 1000)) {
    errors.push('Description must not exceed 1000 characters');
  }

  if (maxParticipants && (!Number.isInteger(maxParticipants) || maxParticipants < 2 || maxParticipants > 10000)) {
    errors.push('Max participants must be between 2 and 10000');
  }

  if (entryFee && !isValidDecimal(entryFee.toString())) {
    errors.push('Entry fee must be a valid decimal with up to 2 decimal places');
  }

  if (prizePool && !isValidDecimal(prizePool.toString())) {
    errors.push('Prize pool must be a valid decimal with up to 2 decimal places');
  }

  if (rules && (typeof rules !== 'string' || rules.length > 5000)) {
    errors.push('Rules must not exceed 5000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validateUpdateTournament = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];
  const { name, description, maxParticipants, entryFee, prizePool, rules } = req.body;

  if (!isValidUUID(req.params.id)) {
    errors.push('Tournament ID must be a valid UUID');
  }

  if (name && (typeof name !== 'string' || name.length < 3 || name.length > 100)) {
    errors.push('Tournament name must be between 3 and 100 characters');
  }

  if (description && (typeof description !== 'string' || description.length > 1000)) {
    errors.push('Description must not exceed 1000 characters');
  }

  if (maxParticipants && (!Number.isInteger(maxParticipants) || maxParticipants < 2 || maxParticipants > 10000)) {
    errors.push('Max participants must be between 2 and 10000');
  }

  if (entryFee && !isValidDecimal(entryFee.toString())) {
    errors.push('Entry fee must be a valid decimal with up to 2 decimal places');
  }

  if (prizePool && !isValidDecimal(prizePool.toString())) {
    errors.push('Prize pool must be a valid decimal with up to 2 decimal places');
  }

  if (rules && (typeof rules !== 'string' || rules.length > 5000)) {
    errors.push('Rules must not exceed 5000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validateTournamentId = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: 'Tournament ID must be a valid UUID'
    });
  }
  next();
};

export const validateRegisterParticipant = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];

  if (!isValidUUID(req.params.id)) {
    errors.push('Tournament ID must be a valid UUID');
  }

  if (!req.body.userId || !isValidUUID(req.body.userId)) {
    errors.push('User ID must be a valid UUID');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

export const validatePerformanceData = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];
  const { participantId, totalReturn, totalReturnPercentage, totalTrades, winningTrades, 
          losingTrades, winRate, sharpeRatio, maxDrawdown, volatility } = req.body;

  if (!participantId || !isValidUUID(participantId)) {
    errors.push('Participant ID must be a valid UUID');
  }

  if (totalReturn === undefined || isNaN(parseFloat(totalReturn))) {
    errors.push('Total return must be a valid decimal');
  }

  if (totalReturnPercentage === undefined || isNaN(parseFloat(totalReturnPercentage))) {
    errors.push('Total return percentage must be a valid decimal');
  }

  if (!Number.isInteger(totalTrades) || totalTrades < 0) {
    errors.push('Total trades must be a non-negative integer');
  }

  if (!Number.isInteger(winningTrades) || winningTrades < 0) {
    errors.push('Winning trades must be a non-negative integer');
  }

  if (!Number.isInteger(losingTrades) || losingTrades < 0) {
    errors.push('Losing trades must be a non-negative integer');
  }

  if (winRate === undefined || isNaN(parseFloat(winRate)) || parseFloat(winRate) < 0 || parseFloat(winRate) > 100) {
    errors.push('Win rate must be between 0 and 100');
  }

  if (sharpeRatio !== undefined && isNaN(parseFloat(sharpeRatio))) {
    errors.push('Sharpe ratio must be a valid decimal');
  }

  if (maxDrawdown !== undefined && isNaN(parseFloat(maxDrawdown))) {
    errors.push('Max drawdown must be a valid decimal');
  }

  if (volatility !== undefined && isNaN(parseFloat(volatility))) {
    errors.push('Volatility must be a valid decimal');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Rate limiting middleware
export const rateLimitMiddleware = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requests.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    next();
  };
};

// Error handling middleware
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', error);
  
  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'A record with this data already exists'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.message
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};