import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';

const logger = new Logger('TicketSourceService');

export interface TicketSourceEvent {
  id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity: number;
  availableTickets: number;
  priceRange: {
    min: number;
    max: number;
  };
  categories: TicketCategory[];
  status: 'active' | 'inactive' | 'sold_out' | 'cancelled';
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  capacity: number;
  available: number;
  description?: string;
}

export interface BookingRequest {
  eventId: string;
  categoryId: string;
  quantity: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  paymentInfo?: {
    method: 'card' | 'bank_transfer';
    reference?: string;
  };
}

export interface Booking {
  id: string;
  eventId: string;
  categoryId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  tickets: Ticket[];
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  eventId: string;
  categoryId: string;
  seatNumber?: string;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  issuedAt: string;
}

export interface WebhookPayload {
  event: 'booking.created' | 'booking.updated' | 'booking.cancelled' | 'ticket.used';
  data: Booking | Ticket;
  timestamp: string;
  signature: string;
}

export class TicketSourceService {
  private client: AxiosInstance;
  private apiKey: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.TICKETSOURCE_API_KEY || '';
    this.webhookSecret = process.env.TICKETSOURCE_WEBHOOK_SECRET || '';
    
    if (!this.apiKey) {
      throw new Error('TICKETSOURCE_API_KEY environment variable is required');
    }

    this.client = axios.create({
      baseURL: process.env.TICKETSOURCE_API_URL || 'https://api.ticketsource.co.uk/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
    logger.info('TicketSource service initialized');
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`TicketSource API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('TicketSource API request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`TicketSource API response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('TicketSource API response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Event Management
  async getEvents(): Promise<TicketSourceEvent[]> {
    try {
      const response = await this.client.get('/events');
      return response.data.events || [];
    } catch (error) {
      logger.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async getEvent(eventId: string): Promise<TicketSourceEvent> {
    try {
      const response = await this.client.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch event ${eventId}:`, error);
      throw error;
    }
  }

  async createEvent(eventData: Partial<TicketSourceEvent>): Promise<TicketSourceEvent> {
    try {
      const response = await this.client.post('/events', eventData);
      logger.info(`Event created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: Partial<TicketSourceEvent>): Promise<TicketSourceEvent> {
    try {
      const response = await this.client.put(`/events/${eventId}`, eventData);
      logger.info(`Event updated: ${eventId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update event ${eventId}:`, error);
      throw error;
    }
  }

  // Booking Management
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    try {
      const response = await this.client.post('/bookings', bookingData);
      logger.info(`Booking created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create booking:', error);
      throw error;
    }
  }

  async getBooking(bookingId: string): Promise<Booking> {
    try {
      const response = await this.client.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch booking ${bookingId}:`, error);
      throw error;
    }
  }

  async getBookingsByEvent(eventId: string): Promise<Booking[]> {
    try {
      const response = await this.client.get(`/events/${eventId}/bookings`);
      return response.data.bookings || [];
    } catch (error) {
      logger.error(`Failed to fetch bookings for event ${eventId}:`, error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      const response = await this.client.post(`/bookings/${bookingId}/cancel`, { reason });
      logger.info(`Booking cancelled: ${bookingId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to cancel booking ${bookingId}:`, error);
      throw error;
    }
  }

  async refundBooking(bookingId: string, amount?: number): Promise<Booking> {
    try {
      const response = await this.client.post(`/bookings/${bookingId}/refund`, { amount });
      logger.info(`Booking refunded: ${bookingId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to refund booking ${bookingId}:`, error);
      throw error;
    }
  }

  // Ticket Management
  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const response = await this.client.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async validateTicket(ticketId: string): Promise<{ valid: boolean; ticket?: Ticket; reason?: string }> {
    try {
      const response = await this.client.post(`/tickets/${ticketId}/validate`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to validate ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async useTicket(ticketId: string): Promise<Ticket> {
    try {
      const response = await this.client.post(`/tickets/${ticketId}/use`);
      logger.info(`Ticket used: ${ticketId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to use ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Tournament-specific methods
  async createTournamentEvent(tournamentData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    capacity: number;
    price: number;
    venue?: string;
  }): Promise<TicketSourceEvent> {
    try {
      const eventData: Partial<TicketSourceEvent> = {
        name: tournamentData.name,
        description: tournamentData.description,
        venue: tournamentData.venue || 'Online Tournament',
        startDate: tournamentData.startDate,
        endDate: tournamentData.endDate,
        capacity: tournamentData.capacity,
        categories: [
          {
            id: '', // Will be generated by TicketSource
            name: 'Tournament Entry',
            price: tournamentData.price,
            capacity: tournamentData.capacity,
            available: tournamentData.capacity,
            description: 'Entry ticket for the trading tournament',
          },
        ],
        status: 'active' as const,
      };

      return await this.createEvent(eventData);
    } catch (error) {
      logger.error('Failed to create tournament event:', error);
      throw error;
    }
  }

  async registerTournamentParticipant(
    eventId: string,
    participantData: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    }
  ): Promise<Booking> {
    try {
      const event = await this.getEvent(eventId);
      const category = event.categories[0]; // Assuming first category is tournament entry

      const bookingData: BookingRequest = {
        eventId,
        categoryId: category.id,
        quantity: 1,
        customerInfo: participantData,
      };

      return await this.createBooking(bookingData);
    } catch (error) {
      logger.error('Failed to register tournament participant:', error);
      throw error;
    }
  }

  // Webhook validation
  validateWebhook(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Failed to validate webhook signature:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connected: boolean;
      responseTime: number;
      error?: string;
    };
  }> {
    const startTime = Date.now();

    try {
      await this.client.get('/health');
      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        details: {
          connected: true,
          responseTime,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        details: {
          connected: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}