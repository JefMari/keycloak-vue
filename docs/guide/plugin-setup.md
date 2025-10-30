# Plugin Setup

The recommended way to use KeycloakVue is through Vue's plugin system. This automatically initializes Keycloak and makes the composable available throughout your application.

## Basic Configuration

```typescript
// main.ts
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import App from './App.vue'

const app = createApp(App)

app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'login-required'
  }
}))

app.mount('#app')
```

## Plugin Options

### `config`

Keycloak server configuration (required):

```typescript
{
  url: string        // Keycloak server URL
  realm: string      // Realm name
  clientId: string   // Client ID
}
```

### `initOptions`

Initialization options (optional):

```typescript
{
  onLoad?: 'login-required' | 'check-sso',
  checkLoginIframe?: boolean,
  checkLoginIframeInterval?: number,
  responseMode?: 'query' | 'fragment',
  flow?: 'standard' | 'implicit' | 'hybrid',
  pkceMethod?: 'S256' | false,
  redirectUri?: string,
  silentCheckSsoRedirectUri?: string,
  // ... and more
}
```

### `callbacks`

Event callbacks (optional):

```typescript
{
  onReady?: (authenticated: boolean) => void,
  onAuthSuccess?: () => void,
  onAuthError?: (error: unknown) => void,
  onAuthRefreshSuccess?: () => void,
  onAuthRefreshError?: () => void,
  onAuthLogout?: () => void,
  onTokenExpired?: () => void
}
```

## Common Configurations

### Login Required

Redirect to login page if not authenticated:

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'login-required',
    checkLoginIframe: false
  }
}))
```

### Check SSO

Check authentication status without forcing login:

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
  }
}))
```

### With Callbacks

Handle authentication events:

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'check-sso'
  },
  callbacks: {
    onReady: (authenticated) => {
      console.log('Keycloak ready:', authenticated)
    },
    onAuthSuccess: () => {
      console.log('Authentication successful')
    },
    onAuthError: (error) => {
      console.error('Authentication error:', error)
    },
    onTokenExpired: () => {
      console.log('Token expired, refreshing...')
    }
  }
}))
```

## Environment Variables

For different environments, use environment variables:

```typescript
// .env.development
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=dev-realm
VITE_KEYCLOAK_CLIENT_ID=dev-client

// .env.production
VITE_KEYCLOAK_URL=https://keycloak.example.com
VITE_KEYCLOAK_REALM=prod-realm
VITE_KEYCLOAK_CLIENT_ID=prod-client
```

```typescript
// main.ts
app.use(createKeycloakPlugin({
  config: {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  }
}))
```

## Async Initialization Patterns

### Problem with Immediate App Mounting

When using `autoInit: false`, you might encounter issues if you mount your app immediately without waiting for Keycloak to initialize:

```typescript
// ❌ PROBLEMATIC - App mounts before Keycloak is ready
const initApp = async () => {
  const app = createApp(App)
  
  app.use(createKeycloakPlugin({
    config: { /* ... */ },
    initOptions: { onLoad: 'login-required' },
    autoInit: false  // Keycloak won't initialize automatically
  }))
  
  // App mounts immediately, but Keycloak isn't ready yet
  app.mount('#app')  // This can cause authentication issues
}
```

### Solution 1: Use Callback-Based Initialization (Recommended)

The best approach is to use `autoInit: true` with callbacks to mount your app only after Keycloak is ready:

```typescript
// ✅ RECOMMENDED - Wait for Keycloak before mounting
const initApp = async () => {
  const app = createApp(App)
  
  app.use(createKeycloakPlugin({
    config: {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    autoInit: true, // Let the plugin handle initialization
    callbacks: {
      onReady: (authenticated) => {
        console.log('Keycloak ready, authenticated:', authenticated)
        
        // Initialize router and other plugins after Keycloak is ready
        const router = createRouter({ /* ... */ })
        app.use(router)
        app.use(otherPlugins)
        
        // Mount the app only when Keycloak is ready
        app.mount('#app')
      },
      onAuthError: (error) => {
        console.error('Keycloak auth error:', error)
        // Handle authentication error - redirect to error page
      }
    }
  }))
}

initApp()
```

### Solution 2: Manual Initialization with autoInit: false

If you need more control, you can manually initialize Keycloak:

```typescript
// ✅ ALTERNATIVE - Manual initialization
const initApp = async () => {
  const app = createApp(App)
  
  // Install plugin first
  app.use(createKeycloakPlugin({
    config: {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    autoInit: false
  }))
  
  // Get Keycloak instance and manually initialize
  const { $keycloak } = app.config.globalProperties
  
  try {
    // Wait for Keycloak to initialize
    await $keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false
    })
    
    // Initialize other plugins after Keycloak is ready
    const router = createRouter({ /* ... */ })
    app.use(router)
    app.use(otherPlugins)
    
    // Mount the app
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error)
    // Handle initialization error
  }
}

initApp()
```

### Why This Matters

Proper async initialization ensures that:

- ✅ Authentication state is available when components mount
- ✅ Route guards work correctly from the start
- ✅ Protected API calls have valid tokens
- ✅ User experience is consistent across page refreshes
- ✅ No race conditions between Keycloak and Vue Router

### Common Pitfalls to Avoid

1. **Mounting before Keycloak is ready** - Causes authentication state issues
2. **Not handling authentication errors** - Users may see broken UI
3. **Initializing router before Keycloak** - Route guards may not work correctly
4. **Missing error boundaries** - App crashes on authentication failures

## Next Steps

- Learn about the [Composable API](/guide/composable)
- Configure [Init Options](/guide/init-options)
- Explore [Examples](/examples/)
