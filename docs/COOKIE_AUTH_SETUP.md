# Cookie-Based Authentication Setup

This document explains how cookie-based authentication is configured in the application.

## Overview

The application uses **httpOnly cookies** for authentication instead of storing tokens in localStorage or Redux. This provides better security as cookies cannot be accessed via JavaScript, preventing XSS attacks.

## Key Features

### 1. **Automatic Cookie Handling**
- Cookies are sent automatically with every request via `credentials: "include"`
- No manual token handling needed
- Backend sets httpOnly cookies on login/register
- Backend clears cookies on logout

### 2. **Automatic Token Refresh**
- On 401 Unauthorized, the base query automatically calls `/auth/refresh`
- Refresh endpoint receives cookies automatically
- If refresh succeeds, original request is retried
- If refresh fails, user is logged out and redirected to login

### 3. **Request Queuing**
- When multiple requests get 401 simultaneously, only one refresh call is made
- Other requests are queued and retried after successful refresh
- Prevents multiple concurrent refresh attempts

### 4. **No Token Storage**
- Tokens are **never** stored in:
  - localStorage
  - Redux state
  - JavaScript variables
  - Request headers (Authorization header removed)
- Only user data is stored in Redux (persisted)

## Implementation Details

### Base API Configuration (`store/api/baseApi.ts`)

```typescript
// Base query with credentials: "include" to send cookies
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Important: Include cookies
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    // No Authorization header - cookies handle authentication
    return headers;
  },
});
```

### Auto-Refresh Logic

1. **401 Detection**: When any API call returns 401
2. **Queue Requests**: If refresh is already in progress, queue the request
3. **Call Refresh**: POST to `/auth/refresh` (cookies sent automatically)
4. **Retry Requests**: On success, retry original request and all queued requests
5. **Logout on Failure**: If refresh fails, clear auth state and redirect to login

### Request Queuing Example

If 15 GET requests are made simultaneously and one gets 401:
1. First 401 triggers refresh
2. Remaining 14 requests are queued
3. After refresh succeeds, all 15 requests are retried
4. Only one refresh call is made, not 15

## Auth State Management

### Redux State (`store/slices/authSlice.ts`)

```typescript
interface AuthState {
  user: User | null;  // Only user data, no tokens
  isAuthenticated: boolean;
}
```

### What's Persisted

- ✅ **User data** (name, email, role, etc.) - persisted with encryption
- ❌ **Tokens** - NOT persisted (stored in httpOnly cookies by backend)

## API Endpoints

### Login (`POST /auth/login`)
- Backend sets httpOnly cookies (access token + refresh token)
- Returns user data only (no tokens in response)
- Frontend stores user data in Redux

### Register (`POST /auth/register`)
- Backend sets httpOnly cookies
- Returns user data only
- Frontend stores user data in Redux

### Refresh (`POST /auth/refresh`)
- Called automatically by baseApi on 401
- Backend validates refresh token from cookie
- Backend sets new access token in cookie
- No manual calls needed

### Logout (`POST /auth/logout`)
- Backend clears cookies
- Frontend clears Redux state
- Redirects to login page

## Security Benefits

1. **XSS Protection**: httpOnly cookies cannot be accessed via JavaScript
2. **CSRF Protection**: Cookies are sent automatically, but CSRF tokens should be used
3. **No Token Leakage**: Tokens never appear in:
   - localStorage
   - Redux DevTools
   - Network request headers (Authorization header)
   - JavaScript console

## Migration from Token-Based Auth

### Removed
- ❌ `token` and `refreshToken` from Redux state
- ❌ Authorization header in API calls
- ❌ localStorage token storage
- ❌ Manual token refresh logic
- ❌ Token reading from cookies

### Kept
- ✅ User data in Redux (persisted)
- ✅ Auto-refresh logic (now uses cookies)
- ✅ Request queuing (improved)

## Backend Requirements

Your backend must:

1. **Set Cookies on Login/Register**:
   ```javascript
   res.cookie('accessToken', token, { 
     httpOnly: true, 
     secure: true,  // HTTPS only
     sameSite: 'strict' 
   });
   res.cookie('refreshToken', refreshToken, { 
     httpOnly: true, 
     secure: true,
     sameSite: 'strict' 
   });
   ```

2. **Read Cookies for Authentication**:
   - Read `accessToken` cookie for protected routes
   - Read `refreshToken` cookie for `/auth/refresh` endpoint

3. **Clear Cookies on Logout**:
   ```javascript
   res.clearCookie('accessToken');
   res.clearCookie('refreshToken');
   ```

## Testing

### Verify Cookie-Based Auth

1. **Login**: Check Network tab - cookies should be set
2. **API Calls**: Check Network tab - no Authorization header, cookies sent automatically
3. **Token Expiry**: Make request with expired token - should auto-refresh
4. **Multiple Requests**: Make 15 requests simultaneously with expired token - should queue and retry
5. **Logout**: Check Network tab - cookies should be cleared

### Common Issues

**Issue**: 401 errors even after login
- **Solution**: Ensure backend sets cookies with correct domain/path
- **Solution**: Ensure `credentials: "include"` is set in fetchBaseQuery

**Issue**: Refresh doesn't work
- **Solution**: Ensure `/auth/refresh` endpoint reads refresh token from cookie
- **Solution**: Ensure backend sets new access token in cookie on refresh

**Issue**: CORS errors
- **Solution**: Backend must allow credentials: `Access-Control-Allow-Credentials: true`
- **Solution**: Backend must allow origin: `Access-Control-Allow-Origin: <your-frontend-url>`

## Best Practices

1. ✅ **Never read tokens from cookies in JavaScript** (they're httpOnly)
2. ✅ **Don't create custom token refresh logic** (baseApi handles it)
3. ✅ **Don't pass tokens in request bodies or query parameters**
4. ✅ **Use `credentials: "include"`** in all API calls
5. ✅ **Let backend handle cookie security** (httpOnly, secure, sameSite)

