// Market data integration API endpoints
import { apiClient } from '@/lib/api';

export const marketDataApi = {
  /**
   * Get live market data
   * @public
   */
  async getLiveData(symbols: string[]): Promise<any[]> {
    // Placeholder: GET /api/integrations/market-data/live
    return apiClient.get<any[]>(`/integrations/market-data/live?symbols=${symbols.join(',')}`);
  }
};