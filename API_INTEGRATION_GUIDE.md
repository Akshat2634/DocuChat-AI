# Frontend-Backend API Integration Guide

## Overview
This guide explains how to integrate your Next.js frontend with the FastAPI backend for the DocuChat AI application.

## What Was Fixed

### 1. **File Extension Issue**
- **Problem**: The `theme.ts` file contained JSX but had a `.ts` extension
- **Solution**: Renamed to `theme.tsx` to allow JSX syntax

### 2. **Server-Side Rendering (SSR) Issues**
- **Problem**: `localStorage` was being accessed during server-side rendering
- **Solution**: Added checks for `typeof window !== 'undefined'` before accessing browser APIs

### 3. **API Endpoint Integration**
- **Problem**: Frontend and backend API formats didn't match
- **Solution**: Updated API functions to match backend expectations

## Backend API Endpoints

Your backend provides these endpoints:

| Endpoint | Method | Parameters | Description |
|----------|--------|------------|-------------|
| `/` | GET | None | API information and health |
| `/health` | GET | None | Health check |
| `/chat/{user_id}` | POST | `query` (URL param) | Chat completion |
| `/upload-document/{user_id}` | POST | `file` (form data) | Document upload |

## Frontend API Functions

The updated `frontend/lib/api.ts` provides:

- `uploadDocuments(files, userId)` - Upload multiple documents
- `sendChatMessage(message, userId)` - Send chat messages
- `checkBackendHealth()` - Check backend status
- `getApiInfo()` - Get API information
- `generateUserId()` - Generate UUIDs for user sessions
- `isValidUUID(uuid)` - Validate UUID format

## Setup Instructions

### 1. Start the Backend
```bash
cd backend
python main.py
# Backend should be running on http://localhost:8000
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
# Frontend will be running on http://localhost:3000
```

### 3. Test the Integration

Visit `http://localhost:3000/test` to access the API test page where you can:

- Check backend health status
- View API information
- Test chat functionality
- Test document upload
- See real-time responses

## Key Configuration Changes

### Next.js API Proxying (`next.config.mjs`)
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8000/:path*', // Proxy to Backend
    },
  ]
}
```

This configuration routes all `/api/*` requests from the frontend to the backend server.

### Updated API Functions

#### Chat Function
- **Before**: Sent message in JSON body
- **After**: Sends query as URL parameter (matches backend expectation)

#### Upload Function  
- **Before**: Sent multiple files as "files" parameter
- **After**: Uploads files individually with "file" parameter (matches backend expectation)

## Testing Steps

1. **Health Check**: Verify the backend is reachable
2. **API Info**: Confirm API endpoints are accessible
3. **User ID Generation**: Test UUID generation for sessions
4. **Chat Test**: Send a test message and verify response
5. **File Upload**: Upload a test document and verify processing

## Error Handling

The integration includes comprehensive error handling:

- Network failures are caught and displayed
- Invalid responses are handled gracefully
- Loading states provide user feedback
- Detailed error messages help with debugging

## Production Considerations

For production deployment:

1. **Environment Variables**: Replace hardcoded `http://localhost:8000` with environment variables
2. **CORS Configuration**: Ensure backend CORS settings allow your frontend domain
3. **Error Logging**: Add proper error logging and monitoring
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Authentication**: Add proper user authentication and authorization

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check backend CORS middleware configuration
2. **404 Errors**: Verify backend server is running and endpoints are correct
3. **Network Errors**: Check if frontend can reach backend URL
4. **UUID Errors**: Ensure user IDs are properly formatted UUIDs

### Debug Tools

- Browser Developer Tools Network tab
- Backend server logs
- The test page at `/test` for real-time API testing

## Next Steps

1. Test the integration with real documents
2. Implement proper error handling in your main application
3. Add user authentication and session management
4. Deploy both frontend and backend to production
5. Set up monitoring and logging

The integration is now complete and ready for testing! 