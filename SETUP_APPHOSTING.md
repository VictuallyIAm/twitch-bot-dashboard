# Bot Dashboard - App Hosting Setup

## Overview

This project has been configured to use Firebase App Hosting instead of static hosting, which allows for:

- Full-stack development with Express.js backend
- Server-side functionality and APIs
- Integration with Firebase Functions for advanced features
- Better scalability and performance

## Architecture

### Frontend

- **Vue.js 3** with Composition API
- **Vuetify** for UI components
- **TypeScript** for type safety
- **Vite** for build tooling

### Backend

- **Express.js** server (`server.js`)
- **Firebase Functions** with Express integration (`functions/src/index.ts`)
- **Firebase Admin SDK** for authentication and Firestore
- **TypeScript** for Functions

## Project Structure

```
├── src/                     # Vue.js frontend
│   ├── services/
│   │   └── api.ts          # API service for backend communication
│   └── ...
├── functions/              # Firebase Functions
│   └── src/
│       └── index.ts        # Express API with Firebase Functions
├── server.js              # Express server for App hosting
├── firebase.json          # Firebase configuration (App hosting)
├── package.json           # Main dependencies
└── nodemon.json           # Development configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
cd functions && npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
```

### 3. Firebase Configuration

Update the CORS origins in `functions/src/index.ts` to match your domain:

```typescript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.web.app", "https://your-domain.firebaseapp.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
```

## Development

### Run Frontend Only (Vite dev server)

```bash
npm run dev
```

### Run Full Stack (Express server)

```bash
npm run build
npm start
```

### Run with Auto-reload

```bash
npm run dev:server
```

### Run Firebase Functions Locally

```bash
npm run functions:dev
```

## Available Scripts

- `npm run dev` - Run Vite development server
- `npm run build` - Build for production
- `npm start` - Start Express server
- `npm run dev:server` - Start Express server with auto-reload
- `npm run functions:dev` - Run Firebase Functions emulator
- `npm run functions:deploy` - Deploy Functions to Firebase

## API Endpoints

### Server Endpoints (server.js)

- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `GET /*` - Serve Vue.js app (SPA routing)

### Firebase Functions Endpoints

- `GET /api/user/profile` - Get user profile (requires auth)
- `GET /api/bot/config` - Get bot configuration (requires auth)
- `POST /api/bot/config` - Update bot configuration (requires auth)
- `GET /api/bot/commands` - Get bot commands (requires auth)
- `POST /api/bot/commands` - Create bot command (requires auth)
- `PUT /api/bot/commands/:id` - Update bot command (requires auth)
- `DELETE /api/bot/commands/:id` - Delete bot command (requires auth)

## Authentication

The API uses Firebase Authentication with Bearer tokens:

```typescript
// In your Vue.js components
import { apiService } from "@/services/api";

// All API calls automatically include the auth token
const userProfile = await apiService.getUserProfile();
```

## Database Schema

### Bot Configurations (`botConfigs` collection)

```javascript
{
  botName: string,
  twitchChannel: string,
  enabled: boolean,
  userId: string,
  updatedAt: string
}
```

### Bot Commands (`botCommands` collection)

```javascript
{
  name: string,
  response: string,
  enabled: boolean,
  userId: string,
  createdAt: string,
  updatedAt: string
}
```

## Deployment

### Using Firebase App Hosting

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**

   ```bash
   firebase deploy
   ```

3. **Deploy Functions separately (if needed):**
   ```bash
   firebase deploy --only functions
   ```

## Environment-Specific Configuration

### Development

- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3000` (Express server)
- Functions: `http://localhost:5001` (Firebase emulator)

### Production

- All served from the same domain via App hosting
- API endpoints available at `/api/*`
- Static assets served from `/`

## Security Features

- **Helmet.js** for security headers
- **CORS** configured for specific origins
- **Firebase Authentication** for API protection
- **Request validation** and sanitization
- **Rate limiting** (can be added)

## Performance Optimizations

- **Gzip compression** enabled
- **Static asset caching** configured
- **Code splitting** for large bundles
- **Lazy loading** for Vue components

## Monitoring and Logging

- **Morgan** for HTTP request logging
- **Firebase Functions logging** for cloud functions
- **Error tracking** with proper error boundaries

## Troubleshooting

### Common Issues

1. **CORS errors**: Check origin configuration in Express middleware
2. **Authentication errors**: Verify Firebase config and token generation
3. **Build errors**: Ensure all dependencies are installed
4. **Function deployment**: Check Firebase project permissions

### Debug Commands

```bash
# Check server logs
npm start

# Test API endpoints
curl http://localhost:3000/api/health

# Check Firebase Functions logs
firebase functions:log
```

## Next Steps

1. **Add more API endpoints** as needed
2. **Implement rate limiting** for production
3. **Add monitoring** and analytics
4. **Set up CI/CD pipeline** for automated deployments
5. **Add tests** for both frontend and backend
6. **Implement caching strategies** for better performance
