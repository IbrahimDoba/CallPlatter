import { getSession } from "next-auth/react";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Session cache to prevent multiple calls
let sessionCache: any = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5000; // 5 seconds

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
    // Use cached session if available and not expired
    const now = Date.now();
    let session = sessionCache;
    
    if (!session || (now - sessionCacheTime) > SESSION_CACHE_DURATION) {
      session = await getSession();
      sessionCache = session;
      sessionCacheTime = now;
    }
    
    if (!session?.user) {
      throw new Error('Authentication required');
    }

    // Add session info to headers for server validation
    headers['Authorization'] = `Bearer ${session.user.id}`; // Using user ID as token for now
    headers['x-user-id'] = session.user.id;
    headers['x-user-email'] = session.user.email || '';
    headers['x-user-business-id'] = session.user.businessId || '';
    headers['x-user-role'] = session.user.role;
    headers['x-user-name'] = session.user.name || '';
    
    // Also add x-business-id for compatibility
    if (session.user.businessId) {
      headers['x-business-id'] = session.user.businessId;
    }
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
    verifyEmail: (data: { email: string; otp: string }) => apiRequest('/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    }),
    resendOTP: (data: { email: string }) => apiRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    }),
    forgotPassword: (data: { email: string }) => apiRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    }),
    verifyResetOTP: (data: { email: string; otp: string }) => apiRequest('/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false,
    }),
    resetPassword: (data: { email: string; resetToken: string; newPassword: string }) => apiRequest('/reset-password', {
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
    // CRM Imports
    getCRMImports: () => apiRequest('/agent/crm-imports'),
    deleteCRMImport: (id: string) => apiRequest(`/agent/crm-imports/${id}`, {
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

  // Voice management
  voice: {
    update: (data: { voice?: string; voiceId?: string; voiceName?: string }) => apiRequest('/voice/voice', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    getVoices: () => apiRequest('/voice/voices'),
  },

};
