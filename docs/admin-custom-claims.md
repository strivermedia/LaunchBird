# Firebase Admin Custom Claims Implementation

This implementation provides a complete solution for managing admin privileges using Firebase Admin SDK custom claims.

## Overview

The implementation includes:
- Firebase Functions for server-side admin operations
- Client-side utilities for interacting with the functions
- React components for admin user management
- Example scripts demonstrating the functionality

## Files Created

### 1. Firebase Functions (`functions/setAdminClaims.ts`)
- `setAdminClaims`: Set admin custom claims for users
- `getUserClaims`: Get custom claims for a user
- `listAdminUsers`: List all users with admin privileges

### 2. Client Utilities (`lib/admin-claims.ts`)
- `setAdminClaims`: Set admin claims via Firebase Functions
- `makeUserAdmin`: Convenience function to grant admin privileges
- `revokeAdminPrivileges`: Convenience function to revoke admin privileges
- `getUserClaims`: Get user claims
- `listAdminUsers`: List admin users
- `checkCurrentUserIsAdmin`: Check if current user is admin

### 3. React Component (`components/Admin/AdminUserManagement.tsx`)
- Complete UI for managing admin users
- Grant/revoke admin privileges
- View current admin users
- Check user claims

### 4. Example Script (`examples/set-admin-claims-example.ts`)
- Direct Firebase Admin SDK usage examples
- Demonstrates the exact functionality requested

## Usage

### Basic Example (Direct Firebase Admin SDK)

```typescript
import { getAuth } from 'firebase-admin/auth'

// Assuming 'uid' is the user's unique ID you want to make an admin
const userUid = 'FHZydNkowSV5NdClwIONYLSrUDd2'

getAuth()
  .setCustomUserClaims(userUid, { admin: true })
  .then(() => {
    console.log(`Custom claim 'admin: true' set for user: ${userUid}`)
    // The new custom claims will propagate to the user's ID token
    // the next time a new one is issued. You might want to notify the user
    // to sign out and sign back in, or refresh their token on the client-side.
  })
  .catch((error) => {
    console.error('Error setting custom claims:', error)
  })
```

### Using Client Utilities

```typescript
import { makeUserAdmin, checkCurrentUserIsAdmin } from '@/lib/admin-claims'

// Make a user an admin
const userUid = 'FHZydNkowSV5NdClwIONYLSrUDd2'
await makeUserAdmin(userUid)

// Check if current user is admin
const isAdmin = await checkCurrentUserIsAdmin()
```

### Using React Component

```tsx
import AdminUserManagement from '@/components/Admin/AdminUserManagement'

// In your admin page
export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AdminUserManagement />
    </div>
  )
}
```

## Security Considerations

1. **Authorization**: Only existing admins can modify admin status
2. **Authentication**: All functions require user authentication
3. **Input Validation**: User UIDs are validated before processing
4. **Error Handling**: Comprehensive error handling and logging

## Firebase Security Rules

To protect your Firestore data based on admin claims, use rules like:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admins full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Allow regular users limited access
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## Deployment

1. **Deploy Firebase Functions**:
   ```bash
   firebase deploy --only functions
   ```

2. **Set up Firebase Admin SDK**:
   - Ensure your Firebase project has the Admin SDK enabled
   - Set up service account credentials if needed

3. **Environment Variables**:
   - Make sure your Firebase configuration is properly set up
   - Set any required environment variables for your functions

## Testing

The implementation includes comprehensive error handling and can be tested using:

1. **Firebase Emulator Suite** (for local development)
2. **Firebase Console** (to verify custom claims)
3. **Client-side testing** (using the React component)

## Important Notes

1. **Token Refresh**: Custom claims only propagate to the client when a new token is issued. Users may need to sign out and sign back in to see changes.

2. **Rate Limiting**: Firebase has rate limits for custom claims operations. Implement appropriate caching and rate limiting in production.

3. **Monitoring**: Monitor function execution logs for any errors or unauthorized access attempts.

4. **Backup**: Consider implementing a backup strategy for admin user lists in case of data loss.

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Ensure the requesting user has admin privileges
2. **"User not found" errors**: Verify the user UID exists in Firebase Auth
3. **Claims not updating**: Users may need to refresh their authentication token

### Debug Steps

1. Check Firebase Functions logs in the Firebase Console
2. Verify user authentication status
3. Check custom claims in Firebase Auth console
4. Test with Firebase emulator for local development 