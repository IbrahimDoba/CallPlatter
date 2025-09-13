import { getSession } from "next-auth/react";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// Generic API request function that handles session authentication
export async function apiRequest(
  endpoint: string, 
  options: ApiRequestOptions = {}
) {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const url = `${SERVER_BASE_URL}/api${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (requireAuth) {
    const session = await getSession();
    
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Add session info to headers for server validation
    headers['Authorization'] = `Bearer ${session.user.id}`; // Using user ID as token for now
    headers['x-user-id'] = session.user.id;
    headers['x-user-email'] = session.user.email || '';
    headers['x-user-business-id'] = session.user.businessId;
    headers['x-user-role'] = session.user.role;
    headers['x-user-name'] = session.user.name || '';
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Specific API functions
export const api = {
  // Appointments
  appointments: {
    list: () => apiRequest('/appointments'),
    create: (data: any) => apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Calls
  calls: {
    list: () => apiRequest('/calls'),
  },

  // Dashboard
  dashboard: {
    stats: () => apiRequest('/dashboard/stats'),
  },

  // Settings
  settings: {
    get: () => apiRequest('/settings'),
    update: (data: any) => apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  },

  // Upload recording
  uploadRecording: {
    upload: (formData: FormData) => {
      return apiRequest('/upload-call-recording', {
        method: 'POST',
        body: formData,
        headers: {} as Record<string, string>, // Don't set Content-Type for FormData
      });
    },
    delete: (fileKey: string) => apiRequest(`/upload-call-recording?key=${fileKey}`, {
      method: 'DELETE',
    }),
  },

  // Auth (signup doesn't require session)
  auth: {
    signup: (data: any) => apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    }),
  },

  // Webhooks (typically don't require session)
  webhooks: {
    appointments: {
      get: () => apiRequest('/webhooks/appointments', { requireAuth: false }),
      post: (data: any) => apiRequest('/webhooks/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
        requireAuth: false,
      }),
    },
  },

  // Agent configuration
  agent: {
    getConfig: () => apiRequest('/agent/config'),
    saveConfig: (data: any) => apiRequest('/agent/config', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    // Business Memories
    getMemories: () => apiRequest('/agent/memories'),
    createMemory: (data: any) => apiRequest('/agent/memories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    updateMemory: (id: string, data: any) => apiRequest(`/agent/memories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    deleteMemory: (id: string) => apiRequest(`/agent/memories/${id}`, {
      method: 'DELETE',
    }),
  },

  // OpenAI services
  openai: {
    generateSummary: (callId: string) => apiRequest('/openai/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ callId }),
    }),
  },

  // Extended appointments functionality
  appointmentsExtended: {
    updateStatus: (appointmentId: string, status: string) => apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
    generateFromCall: (callId: string) => apiRequest('/appointments/generate-from-call', {
      method: 'POST',
      body: JSON.stringify({ callId }),
    }),
  },

  // Extended calls functionality  
  callsExtended: {
    list: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.set('page', page.toString());
      if (limit) params.set('limit', limit.toString());
      const query = params.toString() ? `?${params.toString()}` : '';
      return apiRequest(`/calls${query}`);
    },
  },
};
