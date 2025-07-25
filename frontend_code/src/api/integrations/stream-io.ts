// Stream.io integration API endpoints
import { apiClient } from '@/lib/api';

export const streamIoApi = {
  /**
   * Initialize Stream.io user
   * @internal
   */
  async initializeUser(): Promise<any> {
    // Placeholder: POST /api/integrations/stream/users
    return apiClient.post<any>('/integrations/stream/users');
  }
};