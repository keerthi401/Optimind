/**
 * OptiMind AI Frontend API Client
 * Reusable, type-safe fetch wrapper with timeouts, structured error handling, and authorization header injection.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

export interface HealthCheckData {
  status: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  services?: {
    database: { connected: boolean; mode: string; host: string | null };
    aiEngine: { configured: boolean; provider: string; model: string };
    ocrEngine: { available: boolean; provider: string };
    storage: { uploadDirExists: boolean; maxFileSizeBytes: number };
  };
}

export class ApiError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('optimind_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('optimind_token', token);
  } else {
    localStorage.removeItem('optimind_token');
  }
}

/**
 * Core fetch execution function with timeout and structured response extraction.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 25000, headers = {}, ...customConfig } = options;

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getAuthToken();
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  const isFormData = customConfig.body instanceof FormData;
  const contentHeaders: Record<string, string> = isFormData
    ? {}
    : { 'Content-Type': 'application/json', Accept: 'application/json' };

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...contentHeaders,
      ...authHeaders,
      ...(headers as Record<string, string>),
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    let parsedBody: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      parsedBody = await response.json();
    } else {
      parsedBody = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        parsedBody?.error?.message ||
        parsedBody?.message ||
        `Request failed with status ${response.status} (${response.statusText})`;
      const errorCode = parsedBody?.error?.code || `HTTP_${response.status}`;

      throw new ApiError(errorMessage, response.status, errorCode);
    }

    return parsedBody as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your network and try again.', 408, 'TIMEOUT');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'Unable to connect to the backend server. Please verify the service is running.',
      0,
      'NETWORK_FAILURE'
    );
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  checkHealth: async (): Promise<ApiResponse<HealthCheckData>> => {
    return request<ApiResponse<HealthCheckData>>('/health');
  },

  // Auth endpoints
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      api.post<ApiResponse<{ token: string; user: any }>>('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', data),
    guest: () =>
      api.post<ApiResponse<{ token: string; user: any }>>('/auth/guest'),
    getProfile: () =>
      api.get<ApiResponse<{ user: any }>>('/auth/profile'),
  },

  // AI Explainer & Visual endpoints
  ai: {
    explain: (data: { topic: string; subject?: string; difficulty?: string; format?: string }) =>
      api.post<ApiResponse<any>>('/ai/explain', data),
    visualize: (data: { topic: string; subject?: string; difficulty?: string }) =>
      api.post<ApiResponse<any>>('/ai/visualize', data),
    saveExplanation: (data: any) =>
      api.post<ApiResponse<any>>('/ai/save-explanation', data),
    getSaved: () =>
      api.get<ApiResponse<any[]>>('/ai/saved'),
  },

  // Documents & RAG
  documents: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post<ApiResponse<any>>('/documents/upload', formData);
    },
    list: () =>
      api.get<ApiResponse<any[]>>('/documents'),
    get: (id: string) =>
      api.get<ApiResponse<any>>(`/documents/${id}`),
    delete: (id: string) =>
      api.delete<ApiResponse<any>>(`/documents/${id}`),
  },

  rag: {
    ask: (data: { question: string; documentId?: string | null }) =>
      api.post<ApiResponse<{ answer: string; sources: any[]; hasSufficientEvidence: boolean }>>('/rag/ask', data),
  },

  // Quizzes
  quizzes: {
    generate: (data: { topic: string; subject?: string; difficulty?: string; documentId?: string | null }) =>
      api.post<ApiResponse<any>>('/quizzes/generate', data),
    list: () =>
      api.get<ApiResponse<any[]>>('/quizzes'),
    get: (id: string) =>
      api.get<ApiResponse<any>>(`/quizzes/${id}`),
    submit: (id: string, answers: number[]) =>
      api.post<ApiResponse<any>>(`/quizzes/${id}/submit`, { answers }),
    getRecentAttempts: () =>
      api.get<ApiResponse<any[]>>('/quizzes/attempts/recent'),
  },

  // Roadmaps
  roadmaps: {
    generate: (data: { goal: string; subject?: string; skillLevel?: string; hoursPerWeek?: number; targetDurationWeeks?: number }) =>
      api.post<ApiResponse<any>>('/roadmaps/generate', data),
    getCurrent: () =>
      api.get<ApiResponse<any>>('/roadmaps/current'),
    updateMilestone: (roadmapId: string, milestoneId: string, status: string) =>
      api.patch<ApiResponse<any>>(`/roadmaps/${roadmapId}/milestones/${milestoneId}`, { status }),
  },

  // Progress
  progress: {
    getSummary: () =>
      api.get<ApiResponse<any>>('/progress/summary'),
    logActivity: (data: { topic: string; activityType: string; durationMinutes?: number; masteryScore?: number }) =>
      api.post<ApiResponse<any>>('/progress/log-activity', data),
  },
};

export default api;
