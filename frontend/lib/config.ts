// Configuration for different environments
export const config = {
  // API endpoints - Next.js proxy handles the backend routing
  api: {
    upload: '/api/upload-document',
    chat: '/api/chat',
    health: '/api/health',
    info: '/api/',
  },
  
  // Environment check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// Since we use Next.js rewrites, all API calls are relative
export const getApiUrl = (endpoint: string) => endpoint 