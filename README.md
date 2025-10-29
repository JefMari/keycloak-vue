# KeycloakVue

A comprehensive Vue 3.5+ wrapper for [keycloak-js](https://www.keycloak.org/securing-apps/javascript-adapter) using the Composition API. This library provides a seamless integration of Keycloak authentication into your Vue applications with full TypeScript support.

## Features

- ✨ **Vue 3.5+ Composition API** - Built for modern Vue applications
- 🔒 **Type-Safe** - Full TypeScript definitions for all Keycloak types, props, and constants
- 🎯 **Reactive State** - Reactive authentication state using Vue's reactivity system
- 🔌 **Plugin System** - Easy integration with Vue's plugin system
- 🎨 **Flexible** - Use as a plugin or composable
- 📦 **Tree-Shakeable** - Import only what you need
- 🚀 **SSO Ready** - Full support for Single Sign-On features
- 🔄 **Token Management** - Automatic token refresh capabilities

## Installation

```bash
npm install keycloak-vue keycloak-js
```

or

```bash
yarn add keycloak-vue keycloak-js
```

or

```bash
pnpm add keycloak-vue keycloak-js
```

## Quick Start

### Plugin Setup (Recommended)

```typescript
// main.ts
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import App from './App.vue'

const app = createApp(App)

app.use(createKeycloakPlugin({
  config: {
    url: 'http://keycloak-server',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'login-required',
    checkLoginIframe: false
  }
}))

app.mount('#app')
```

### Using in Components

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const {
  isAuthenticated,
  isReady,
  username,
  token,
  login,
  logout,
  hasRealmRole
} = useKeycloak()
</script>

<template>
  <div v-if="isReady">
    <div v-if="isAuthenticated">
      <p>Welcome, {{ username }}!</p>
      <button @click="logout()">Logout</button>
      
      <div v-if="hasRealmRole('admin')">
        <p>Admin content</p>
      </div>
    </div>
    <div v-else>
      <button @click="login()">Login</button>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>
```

## Manual Initialization

If you prefer not to use the plugin system:

```typescript
import { initKeycloak } from 'keycloak-vue'

const keycloak = initKeycloak({
  url: 'http://keycloak-server',
  realm: 'my-realm',
  clientId: 'my-app'
})

// Initialize manually
await keycloak.init({
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
})
```

## API Reference

### useKeycloak()

Returns the Keycloak composable with the following properties and methods:

#### State Properties

- `instance` - Keycloak instance (readonly)
- `isAuthenticated` - Authentication status (readonly)
- `isReady` - Initialization status (readonly)
- `isLoading` - Loading state during operations (readonly)
- `token` - Current access token (readonly)
- `tokenParsed` - Parsed access token (readonly)
- `idToken` - ID token (readonly)
- `idTokenParsed` - Parsed ID token (readonly)
- `refreshToken` - Refresh token (readonly)
- `subject` - User subject/ID (readonly)
- `profile` - User profile (readonly)
- `realmAccess` - Realm roles (readonly)
- `resourceAccess` - Resource roles (readonly)
- `error` - Last error that occurred (readonly)

#### Computed Properties

- `isTokenExpired` - Check if token is expired
- `username` - Get username from token or profile
- `email` - Get email from token or profile
- `fullName` - Get full name from profile
- `firstName` - Get first name from profile
- `lastName` - Get last name from profile
- `realmRoles` - Get all realm roles

#### Methods

- `init(options?)` - Initialize Keycloak
- `login(options?)` - Redirect to login
- `logout(options?)` - Logout user
- `register(options?)` - Redirect to registration
- `accountManagement(options?)` - Open account management
- `updateToken(minValidity?)` - Refresh token if needed
- `loadUserProfile()` - Load user profile
- `clearToken()` - Clear authentication state
- `hasRealmRole(role)` - Check if user has realm role
- `hasResourceRole(role, resource?)` - Check if user has resource role
- `createLoginUrl(options?)` - Create login URL
- `createLogoutUrl(options?)` - Create logout URL
- `createRegisterUrl(options?)` - Create registration URL
- `createAccountUrl(options?)` - Create account management URL

## Configuration Options

### KeycloakConfig

```typescript
interface KeycloakConfig {
  url: string        // Keycloak server URL
  realm: string      // Realm name
  clientId: string   // Client ID
}
```

### KeycloakInitOptions

```typescript
interface KeycloakInitOptions {
  useNonce?: boolean                    // Default: true
  onLoad?: 'login-required' | 'check-sso'
  token?: string
  refreshToken?: string
  idToken?: string
  timeSkew?: number
  checkLoginIframe?: boolean            // Default: true
  checkLoginIframeInterval?: number     // Default: 5
  responseMode?: 'query' | 'fragment'   // Default: 'fragment'
  flow?: 'standard' | 'implicit' | 'hybrid'  // Default: 'standard'
  pkceMethod?: 'S256' | false          // Default: 'S256'
  redirectUri?: string
  silentCheckSsoRedirectUri?: string
  silentCheckSsoFallback?: boolean     // Default: true
  scope?: string
  enableLogging?: boolean              // Default: false
  messageReceiveTimeout?: number       // Default: 10000
  locale?: string
  adapter?: 'default' | 'cordova' | 'cordova-native' | KeycloakAdapter
}
```

### KeycloakLoginOptions

```typescript
interface KeycloakLoginOptions {
  redirectUri?: string
  prompt?: 'none' | 'login' | 'consent' | 'select_account'
  action?: 'register' | string
  loginHint?: string
  idpHint?: string
  locale?: string
  scope?: string
  maxAge?: number
  acrValues?: string
  acr?: {
    values: string[]
    essential: boolean
  }
}
```

## Examples

### Auto Token Refresh

```typescript
import { useKeycloak } from 'keycloak-vue'
import { onMounted, onUnmounted } from 'vue'

const { updateToken } = useKeycloak()

let refreshInterval: number

onMounted(() => {
  // Refresh token every 60 seconds if it expires in less than 30 seconds
  refreshInterval = setInterval(async () => {
    try {
      await updateToken(30)
    } catch (error) {
      console.error('Failed to refresh token:', error)
    }
  }, 60000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})
```

### Protected API Calls

```typescript
import { useKeycloak } from 'keycloak-vue'

const { token, updateToken } = useKeycloak()

async function fetchProtectedData() {
  // Ensure token is valid
  await updateToken(30)
  
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${token.value}`
    }
  })
  
  return response.json()
}
```

### Role-Based Rendering

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const { hasRealmRole, hasResourceRole } = useKeycloak()
</script>

<template>
  <div>
    <section v-if="hasRealmRole('user')">
      User content
    </section>
    
    <section v-if="hasRealmRole('admin')">
      Admin content
    </section>
    
    <section v-if="hasResourceRole('view', 'my-resource')">
      Resource-specific content
    </section>
  </div>
</template>
```

### Callbacks

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'http://keycloak-server',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  callbacks: {
    onReady: (authenticated) => {
      console.log('Keycloak ready, authenticated:', authenticated)
    },
    onAuthSuccess: () => {
      console.log('Authentication successful')
    },
    onAuthError: (error) => {
      console.error('Authentication error:', error)
    },
    onAuthRefreshSuccess: () => {
      console.log('Token refreshed')
    },
    onAuthRefreshError: () => {
      console.error('Token refresh failed')
    },
    onAuthLogout: () => {
      console.log('User logged out')
    },
    onTokenExpired: () => {
      console.log('Token expired')
    }
  }
}))
```

## Exports

The library exports all types, enums, constants, and utilities:

```typescript
// Main functions
export { createKeycloakPlugin, initKeycloak, useKeycloak }

// Types
export type * from './types'

// Enums/Constants
export {
  KeycloakOnLoad,
  KeycloakFlow,
  KeycloakResponseMode,
  KeycloakPkceMethod,
  KeycloakAdapterType,
  KeycloakPrompt,
  KeycloakAction
} from './enums'

// Constants
export {
  DEFAULT_INIT_OPTIONS,
  DEFAULT_MIN_VALIDITY,
  KEYCLOAK_INJECTION_KEY
} from './constant'

// Props for components
export {
  keycloakConfigProps,
  keycloakLoginProps,
  keycloakLogoutProps,
  keycloakProtectedProps
} from './props'
```

## TypeScript

This library is written in TypeScript and provides comprehensive type definitions for all Keycloak types, including:

- `KeycloakConfig`
- `KeycloakInitOptions`
- `KeycloakLoginOptions`
- `KeycloakLogoutOptions`
- `KeycloakTokenParsed`
- `KeycloakProfile`
- `KeycloakAdapter`
- And many more...

## Browser Support

This library supports all modern browsers that are compatible with Vue 3 and Keycloak JS:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Related

- [Keycloak](https://www.keycloak.org/)
- [Keycloak JavaScript Adapter](https://www.keycloak.org/securing-apps/javascript-adapter)
- [Vue 3](https://vuejs.org/)
