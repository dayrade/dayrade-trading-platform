// Centralized API exports for Dayrade platform
export { authApi } from './auth';
export { tournamentApi } from './tournaments';
export { tradingApi } from './trading';
export { paymentApi } from './payments';
export { chatApi } from './chat';
export { adminApi } from './admin';

// Additional API modules (to be implemented)
export * from './rewards';
export * from './notifications';
export * from './analytics';
export * from './integrations/index';

// Re-export common utilities
export { apiClient, wsManager } from '@/lib/api';
export { authService } from '@/services/authService';