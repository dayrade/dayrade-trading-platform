import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token required'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of roles that are allowed to access the endpoint
 */
export const requireRole = (allowedRoles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validate that the user's role is in the system's allowed roles
    if (!AuthService.isValidRole(userRole)) {
      logger.warn(`User ${req.user?.id} has invalid role: ${userRole}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid user role'
      });
    }

    // Check if user's role is in the allowed roles for this endpoint
    if (!rolesArray.includes(userRole)) {
      logger.warn(`Access denied for user ${req.user?.id} with role ${userRole}. Required roles: ${rolesArray.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        details: `Required roles: ${rolesArray.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = requireRole('super_admin');

/**
 * Middleware to require moderator or higher role
 */
export const requireModerator = requireRole(['super_admin', 'moderator']);

/**
 * Middleware to require any authenticated user (user or higher)
 */
export const requireUser = requireRole(['super_admin', 'admin', 'moderator', 'user']);

/**
 * Middleware to require admin or higher role
 */
export const requireAdmin = requireRole(['super_admin', 'admin']);

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    return next();
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    // Invalid token, but don't fail - just continue without authentication
    logger.warn('Optional auth failed:', error);
  }
  
  next();
};

/**
 * Get system allowed roles endpoint
 */
export const getAllowedRoles = (req: Request, res: Response) => {
  try {
    const allowedRoles = AuthService.getAllowedRoles();
    res.json({
      success: true,
      data: {
        allowedRoles,
        defaultRole: AuthService.getDefaultRole()
      }
    });
  } catch (error) {
    logger.error('Error getting allowed roles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get allowed roles'
    });
  }
};