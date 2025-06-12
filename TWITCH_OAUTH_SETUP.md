# Twitch OAuth Integration Setup

## Overview

This guide will help you set up Twitch OAuth authentication for your Firebase Functions using Google Cloud Secret Manager to securely store your Twitch application credentials.

## Prerequisites

1. Firebase project with Functions enabled
2. Google Cloud project (same as Firebase project)
3. Twitch Developer account and application
4. Google Cloud CLI installed and authenticated

## Step 1: Create Twitch Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in the details:
   - **Name**: Your Bot Dashboard
   - **OAuth Redirect URLs**:
     - For development: `http://localhost:5001/your-project-id/us-central1/api/auth/twitch/callback`
     - For production: `https://your-project-id.cloudfunctions.net/api/auth/twitch/callback`
   - **Category**: Application Integration
4. Click "Create"
5. Copy your **Client ID** and **Client Secret**

## Step 2: Enable Google Cloud Secret Manager

1. Open Google Cloud Console
2. Navigate to your Firebase project
3. Enable the Secret Manager API:
   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

## Step 3: Create Secrets in Secret Manager

### Using Google Cloud Console

1. Go to [Secret Manager](https://console.cloud.google.com/security/secret-manager)
2. Create the following secrets:

#### twitch-client-id

- Click "Create Secret"
- Name: `twitch-client-id`
- Secret value: Your Twitch Client ID
- Click "Create Secret"

#### twitch-client-secret

- Click "Create Secret"
- Name: `twitch-client-secret`
- Secret value: Your Twitch Client Secret
- Click "Create Secret"

#### twitch-redirect-uri

- Click "Create Secret"
- Name: `twitch-redirect-uri`
- Secret value: Your callback URL (e.g., `https://your-project-id.cloudfunctions.net/api/auth/twitch/callback`)
- Click "Create Secret"

### Using Google Cloud CLI

```bash
# Set your project ID
export PROJECT_ID="your-firebase-project-id"

# Create twitch-client-id secret
echo -n "your-twitch-client-id" | gcloud secrets create twitch-client-id --data-file=-

# Create twitch-client-secret secret
echo -n "your-twitch-client-secret" | gcloud secrets create twitch-client-secret --data-file=-

# Create twitch-redirect-uri secret
echo -n "https://your-project-id.cloudfunctions.net/api/auth/twitch/callback" | gcloud secrets create twitch-redirect-uri --data-file=-
```

## Step 4: Grant Permissions to Cloud Functions

### Using Google Cloud Console

1. For each secret, click on it
2. Go to "Permissions" tab
3. Click "Grant Access"
4. Add the Cloud Functions service account:
   - Principal: `your-project-id@appspot.gserviceaccount.com`
   - Role: `Secret Manager Secret Accessor`

### Using Google Cloud CLI

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant access to secrets
gcloud secrets add-iam-policy-binding twitch-client-id \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding twitch-client-secret \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding twitch-redirect-uri \
    --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

## Step 5: Update Firebase Functions Configuration

The functions are already configured to use the secrets. Make sure your `functions/src/services/twitchAuth.ts` and main function file are properly set up.

## Step 6: Deploy Functions

```bash
cd functions
npm run deploy
```

## OAuth Flow Endpoints

After deployment, you'll have the following endpoints available:

### Direct OAuth Flow (Browser redirects)

- **Start OAuth**: `GET /auth/twitch?state=optional-state`
- **OAuth Callback**: `GET /auth/twitch/callback`

### API-based OAuth Flow (for SPAs)

- **Get Auth URL**: `GET /api/auth/twitch/url?state=optional-state`
- **Exchange Code**: `POST /api/auth/twitch/token`
- **Refresh Token**: `POST /api/auth/twitch/refresh` (requires auth)
- **Validate Token**: `GET /api/auth/twitch/validate` (requires auth)

## Frontend Integration

### Option 1: Direct Redirect (Simple)

```html
<!-- Login button -->
<a href="/auth/twitch">Login with Twitch</a>
```

### Option 2: API-based (SPA-friendly)

```javascript
// Get auth URL
const response = await fetch("/api/auth/twitch/url");
const { authUrl } = await response.json();

// Redirect user to Twitch
window.location.href = authUrl;

// After user returns with code, exchange it
const tokenResponse = await fetch("/api/auth/twitch/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "auth-code-from-callback" }),
});

const { firebaseToken, user } = await tokenResponse.json();

// Use Firebase token to sign in
import { signInWithCustomToken } from "firebase/auth";
await signInWithCustomToken(auth, firebaseToken);
```

### Option 3: Vue.js Integration

```typescript
// In your Vue component
import { signInWithCustomToken } from "firebase/auth";
import { useFirebaseAuth } from "vuefire";

const auth = useFirebaseAuth();

const loginWithTwitch = async () => {
  try {
    // Get auth URL
    const response = await fetch("/api/auth/twitch/url");
    const { authUrl } = await response.json();

    // Redirect to Twitch
    window.location.href = authUrl;
  } catch (error) {
    console.error("Error starting Twitch OAuth:", error);
  }
};

// Handle callback (call this when page loads with auth code)
const handleTwitchCallback = async (code: string) => {
  try {
    const response = await fetch("/api/auth/twitch/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const { firebaseToken } = await response.json();

    // Sign in with Firebase
    await signInWithCustomToken(auth!, firebaseToken);

    // Redirect to dashboard
    this.$router.push("/dashboard");
  } catch (error) {
    console.error("Error completing Twitch OAuth:", error);
  }
};
```

## Database Schema

After successful authentication, user data is stored in Firestore:

### `users/{uid}` document:

```javascript
{
  twitchId: "12345678",
  twitchLogin: "username",
  displayName: "Display Name",
  email: "user@example.com",
  profileImageUrl: "https://...",
  broadcasterType: "",
  description: "User description",
  viewCount: 1234,
  twitchCreatedAt: "2020-01-01T00:00:00Z",
  lastLogin: "2024-01-01T00:00:00Z",
  accessToken: "encrypted_token", // Store encrypted in production
  refreshToken: "encrypted_refresh_token", // Store encrypted in production
  tokenExpiresAt: "2024-01-01T01:00:00Z"
}
```

## Security Considerations

1. **Token Storage**: In production, encrypt access and refresh tokens before storing in Firestore
2. **Redirect URI**: Ensure redirect URIs are exact matches in Twitch app settings
3. **State Parameter**: Use state parameter to prevent CSRF attacks
4. **Token Validation**: Regularly validate and refresh tokens
5. **Scopes**: Only request necessary scopes from Twitch

## Environment-Specific Configuration

### Development

- Redirect URI: `http://localhost:5001/project-id/us-central1/api/auth/twitch/callback`
- Use Firebase emulator for local testing

### Production

- Redirect URI: `https://project-id.cloudfunctions.net/api/auth/twitch/callback`
- Ensure HTTPS is used for all endpoints

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Check Twitch app settings match exactly
2. **"Secret not found"**: Verify secret names and permissions
3. **"Unauthorized"**: Check service account permissions for Secret Manager
4. **"Invalid code"**: Authorization codes expire quickly, exchange immediately

### Debug Commands

```bash
# Test secret access
gcloud secrets versions access latest --secret="twitch-client-id"

# Check function logs
firebase functions:log

# Test local emulator
firebase emulators:start --only functions
```

## Additional Scopes

You can request additional Twitch scopes by modifying the `scope` parameter in `twitchAuth.ts`:

```typescript
scope: 'user:read:email channel:read:subscriptions moderation:read', // Add more scopes
```

Common Twitch scopes:

- `user:read:email` - Read user email
- `channel:read:subscriptions` - Read channel subscriptions
- `channel:manage:broadcast` - Manage broadcasts
- `chat:read` - Read chat messages
- `chat:edit` - Send chat messages

Refer to [Twitch API Scopes](https://dev.twitch.tv/docs/authentication/scopes) for the complete list.
