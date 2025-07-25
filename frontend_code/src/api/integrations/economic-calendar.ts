// Economic calendar integration API endpoints
import { apiClient } from '@/lib/api';

export const economicCalendarApi = {
  /**
   * Get economic events
   * @public
   */
  async getEvents(): Promise<any[]> {
    // Placeholder: GET /api/integrations/economic-calendar/events
    return apiClient.get<any[]>('/integrations/economic-calendar/events');
  }
};