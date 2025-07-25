// Base API configuration and utilities for Dayrade platform
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'placeholder-supabase-url';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-supabase-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base API client configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// HTTP client with authentication
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Placeholder: Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return {
        ...this.defaultHeaders,
        'Authorization': `Bearer ${session.access_token}`,
      };
    }
    return this.defaultHeaders;
  }

  async get<T>(endpoint: string): Promise<T> {
    // Placeholder: Implement GET request with error handling
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async post<T, D = any>(endpoint: string, data?: D): Promise<T> {
    // Placeholder: Implement POST request with body
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async put<T, D = any>(endpoint: string, data?: D): Promise<T> {
    // Placeholder: Implement PUT request for updates
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    // Placeholder: Implement DELETE request
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();

// WebSocket connection for real-time updates
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(endpoint: string): void {
    // Placeholder: Establish WebSocket connection for real-time data
    try {
      this.ws = new WebSocket(`ws://localhost:3001${endpoint}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect(endpoint);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  }

  private handleReconnect(endpoint: string): void {
    // Placeholder: Implement reconnection logic
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(endpoint);
      }, 1000 * this.reconnectAttempts);
    }
  }

  send(data: any): void {
    // Placeholder: Send data through WebSocket
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    // Placeholder: Clean disconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsManager = new WebSocketManager();