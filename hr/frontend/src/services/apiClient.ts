/**
 * Centralized API Client & Service Connector
 * 
 * Supports dual modes:
 * - MOCK MODE (default): Runs standalone with instant feedback, zero backend required.
 * - LIVE MODE (VITE_USE_MOCK=false): Routes requests to VITE_API_URL with Bearer token authentication.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK !== 'false';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('hr_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `API Request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}
