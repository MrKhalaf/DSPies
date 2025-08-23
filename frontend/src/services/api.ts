/**
 * API service for communicating with the FastAPI backend.
 * Handles HTTP requests and Server-Sent Events streaming.
 */

import { RunRequest, RunResponse, Run, Config, Event } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new optimization run
   */
  async createRun(request: RunRequest): Promise<RunResponse> {
    const response = await fetch(`${this.baseUrl}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get complete run data
   */
  async getRun(runId: string): Promise<Run> {
    const response = await fetch(`${this.baseUrl}/api/run/${runId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get replay data (events only)
   */
  async getReplayData(runId: string): Promise<{ events: Event[] }> {
    const response = await fetch(`${this.baseUrl}/api/run/${runId}/replay`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get application configuration
   */
  async getConfig(): Promise<Config> {
    const response = await fetch(`${this.baseUrl}/api/config`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Stream run events via Server-Sent Events
   */
  streamRunEvents(runId: string, onEvent: (event: Event) => void, onError?: (error: Error) => void): () => void {
    const eventSource = new EventSource(`${this.baseUrl}/api/run/${runId}/stream`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
        onError?.(new Error('Failed to parse event data'));
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      onError?.(new Error('Connection error'));
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;