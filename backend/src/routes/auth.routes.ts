import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateUser } from '../middleware/tournament.middleware';
import { authenticateToken, requireRole, requireAdmin, getAllowedRoles } from '../middleware/auth.middleware';
import { Logger } from '../utils/logger';
import { DatabaseService } from '../services/database.service';

const router = Router();
const logger = new Logger('AuthRoutes');

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, username, country, timezone, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    // If role is provided, validate it
    if (role && !AuthService.isValidRole(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles are: ${AuthService.getAllowedRoles().join(', ')}`
      });
    }

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      username,
      country,
      timezone
    });

    // If registration successful and role was provided, assign the role
    if (result.success && result.userId && role) {
      const roleResult = await AuthService.assignRole(result.userId, role);
      if (!roleResult.success) {
        logger.warn(`Failed to assign role ${role} to user ${result.userId}: ${roleResult.message}`);
      }
    }

    if (result.success) {
      return res.status(201).json({
        ...result,
        assignedRole: role || AuthService.getDefaultRole()
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await AuthService.login({
      email,
      password,
      deviceInfo: req.headers['user-agent'],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }

  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }

  } catch (error) {
    logger.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// User logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await AuthService.logout(refreshToken);

    return res.status(200).json(result);

  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user details from database
    const result = await AuthService.getUserProfile(req.user.id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        user: result.user
      });
    } else {
      return res.status(404).json(result);
    }

  } catch (error) {
    logger.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Auth callback for email invitations
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { token_hash, type } = req.query;

    if (!token_hash || type !== 'invite') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/?message=invalid_token`);
    }

    // Redirect to frontend with token for processing
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/auth/set-password?token_hash=${token_hash}&type=${type}`);

  } catch (error) {
    logger.error('Auth callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8081'}/?message=invalid_token`);
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is running',
    timestamp: new Date().toISOString()
  });
});

// Send email verification code
router.post('/send-verification-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await AuthService.sendEmailVerificationCode(email);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    logger.error('Send verification code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify email with code
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    const result = await AuthService.verifyEmailCode(email, code);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    logger.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await AuthService.requestPasswordReset(email);

    return res.status(200).json(result);

  } catch (error) {
    logger.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    const result = await AuthService.resetPassword(token, newPassword);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    logger.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Set password from invitation
router.post('/set-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    const db = DatabaseService.getInstance().getClient();

    // Verify and use the invitation token to set password
    const { data, error } = await db.auth.verifyOtp({
      token_hash: token,
      type: 'invite'
    });

    if (error || !data.user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation token'
      });
    }

    // Update user password
    const { error: updateError } = await db.auth.admin.updateUserById(
      data.user.id,
      { password }
    );

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to set password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password set successfully. Account activated.'
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get allowed roles (public endpoint)
router.get('/roles', getAllowedRoles);

// Assign role to user (admin only)
router.post('/assign-role', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    const result = await AuthService.assignRole(userId, role);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    logger.error('Role assignment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user role (authenticated users can check their own role)
router.get('/my-role', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role,
        isValidRole: AuthService.isValidRole(req.user.role),
        allowedRoles: AuthService.getAllowedRoles()
      }
    });

  } catch (error) {
    logger.error('Get user role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;