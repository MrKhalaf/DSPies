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
    console.log('Creating run with request:', request);
    console.log('API URL:', `${this.baseUrl}/api/run`);
    
    const response = await fetch(`${this.baseUrl}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('API Error:', error);
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Run created:', result);
    return result;
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
    const streamUrl = `${this.baseUrl}/api/run/${runId}/stream`;
    console.log('Starting SSE stream:', streamUrl);
    
    const eventSource = new EventSource(streamUrl);
    
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };
    
    eventSource.onmessage = (event) => {
      console.log('SSE event received:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('Parsed SSE data:', data);
        onEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error, 'Raw data:', event.data);
        onError?.(new Error('Failed to parse event data'));
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      console.error('EventSource readyState:', eventSource.readyState);
      
      // Only report as error if connection failed, not if it closed normally
      if (eventSource.readyState === EventSource.CONNECTING) {
        onError?.(new Error('Connection error'));
      } else if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed normally');
      }
    };

    // Return cleanup function
    return () => {
      console.log('Closing SSE connection');
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