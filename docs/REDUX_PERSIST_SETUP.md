# Redux Persist Setup

This document explains how Redux Persist is configured in the application for secure state persistence.

## Overview

Redux Persist automatically saves and restores Redux state to/from localStorage, ensuring that user data (authentication, cart, etc.) persists across page refreshes and browser sessions.

## Security Features

### 1. **Encrypted Storage for Sensitive Data**
- Authentication data (tokens, user info) is encrypted before being stored in localStorage
- Uses `redux-persist-transform-encrypt` for AES encryption
- Encryption key is configured via `NEXT_PUBLIC_ENCRYPTION_KEY` environment variable

### 2. **Selective Persistence**
- Only necessary data is persisted:
  - **Auth**: `token`, `refreshToken`, `user` (encrypted)
  - **Cart**: `items` (not encrypted, as it's not sensitive)
- UI state (like `isOpen`, `isAuthenticated`) is not persisted as it's derived

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_ENCRYPTION_KEY=your-secret-encryption-key-minimum-32-characters
```

**Important**: 
- Use a strong, random key in production
- Generate using: `openssl rand -base64 32`
- Never commit the actual key to version control

### Store Configuration

The store is configured in `store/index.ts`:

- **Auth Persist Config**: Encrypts token, refreshToken, and user data
- **Cart Persist Config**: Stores cart items (unencrypted)
- **Root Config**: Excludes API cache from persistence

## How It Works

1. **On Login/Registration**: 
   - `setCredentials` action saves user and token to Redux state
   - Redux Persist automatically encrypts and saves to localStorage

2. **On Page Load**:
   - `PersistGate` component waits for state rehydration
   - Encrypted data is decrypted and restored to Redux state
   - App continues with authenticated state

3. **On Logout**:
   - `logout` action clears Redux state
   - Redux Persist automatically clears persisted data

## API Integration

The `baseApi` is configured to:
- Get tokens from Redux state (preferred)
- Fallback to localStorage for initial load
- Automatically handle token expiration (401 errors)

## Usage Examples

### Accessing Persisted State

```typescript
import { useAppSelector } from "@/store/hooks";

const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
const { items } = useAppSelector((state) => state.cart);
```

### Updating Auth State

```typescript
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, updateToken, updateUser, logout } from "@/store/slices/authSlice";

// Login
dispatch(setCredentials({ user, token, refreshToken }));

// Update token (e.g., after refresh)
dispatch(updateToken({ token: newToken, refreshToken: newRefreshToken }));

// Update user info
dispatch(updateUser({ name: "New Name" }));

// Logout
dispatch(logout());
```

## Benefits

1. **Automatic Persistence**: No manual localStorage management needed
2. **Secure**: Sensitive data is encrypted
3. **Type-Safe**: Full TypeScript support
4. **Selective**: Only necessary data is persisted
5. **SSR Compatible**: Works with Next.js server-side rendering

## Troubleshooting

### State Not Persisting
- Check browser localStorage is enabled
- Verify encryption key is set correctly
- Check browser console for errors

### Encryption Errors
- Ensure `NEXT_PUBLIC_ENCRYPTION_KEY` is at least 32 characters
- Check that the key hasn't changed (would cause decryption failure)

### Token Not Found in API Calls
- Verify Redux state is properly rehydrated
- Check `baseApi.ts` token retrieval logic
- Ensure `PersistGate` has completed loading

## Migration Notes

If you're migrating from manual localStorage:
- Old localStorage keys (`auth_token`, `user_data`) are no longer used
- Redux Persist stores data under `persist:root` key
- The `initializeAuth` action has been removed (handled by PersistGate)

