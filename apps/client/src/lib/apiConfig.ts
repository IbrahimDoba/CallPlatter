// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we have an explicit API URL set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, default to same domain
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In development, use relative URL (Next.js will proxy to server)
  return '/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    WAITLIST: '/waitlist',
    HEALTH: '/health',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Specific API endpoints
export const API_ENDPOINTS = {
  WAITLIST: buildApiUrl(API_CONFIG.ENDPOINTS.WAITLIST),
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
};

// Debug helper (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    WAITLIST_URL: API_ENDPOINTS.WAITLIST,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  });
}
