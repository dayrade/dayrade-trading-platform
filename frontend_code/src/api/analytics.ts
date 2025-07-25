// Analytics API endpoints for Dayrade platform
import { apiClient } from '@/lib/api';

export const analyticsApi = {
  /**
   * Get platform analytics
   * @internal (admin only)
   */
  async getPlatformAnalytics(): Promise<any> {
    // Placeholder: GET /api/analytics/platform
    return apiClient.get<any>('/analytics/platform');
  }
};