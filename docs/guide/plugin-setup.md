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

## Next Steps

- Learn about the [Composable API](/guide/composable)
- Configure [Init Options](/guide/init-options)
- Explore [Examples](/examples/)
