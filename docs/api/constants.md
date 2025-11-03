# Constants

Default values and constants used in KeycloakVue.

## DEFAULT_INIT_OPTIONS

Default initialization options.

```typescript
const DEFAULT_INIT_OPTIONS: KeycloakInitOptions = {
  useNonce: true,
  checkLoginIframe: true,
  checkLoginIframeInterval: 5,
  responseMode: 'fragment',
  flow: 'standard',
  pkceMethod: 'S256',
  silentCheckSsoFallback: true,
  enableLogging: false,
  messageReceiveTimeout: 10000
}
```

### Properties

| Property | Default | Description |
|----------|---------|-------------|
| `useNonce` | `true` | Use nonce for security |
| `checkLoginIframe` | `true` | Enable login status checking |
| `checkLoginIframeInterval` | `5` | Check interval in seconds |
| `responseMode` | `'fragment'` | Response mode |
| `flow` | `'standard'` | OAuth2 flow |
| `pkceMethod` | `'S256'` | PKCE method |
| `silentCheckSsoFallback` | `true` | Fallback for silent SSO |
| `enableLogging` | `false` | Enable debug logging |
| `messageReceiveTimeout` | `10000` | Timeout in milliseconds |

### Usage

```typescript
import { DEFAULT_INIT_OPTIONS, createKeycloakPlugin } from 'keycloak-vue'

// Use defaults
app.use(createKeycloakPlugin({
  config: { /* ... */ }
  // DEFAULT_INIT_OPTIONS are applied automatically
}))

// Override specific options
app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    ...DEFAULT_INIT_OPTIONS,
    checkLoginIframe: false,
    enableLogging: true
  }
}))
```

## DEFAULT_MIN_VALIDITY

Default minimum token validity in seconds.

```typescript
const DEFAULT_MIN_VALIDITY = 5
```

Used when calling `updateToken()` without specifying minimum validity.

### Usage

```typescript
import { DEFAULT_MIN_VALIDITY, useKeycloak } from 'keycloak-vue'

const { updateToken } = useKeycloak()

// Uses DEFAULT_MIN_VALIDITY (5 seconds)
await updateToken()

// Or specify custom validity
await updateToken(30)
```

## KEYCLOAK_INJECTION_KEY

Vue injection key for Keycloak instance.

```typescript
const KEYCLOAK_INJECTION_KEY: InjectionKey<KeycloakState> = Symbol('keycloak')
```

Used internally by the plugin to provide/inject the Keycloak instance.

### Usage

```typescript
import { inject } from 'vue'
import { KEYCLOAK_INJECTION_KEY } from 'keycloak-vue'

// In a component (normally you'd use useKeycloak() instead)
const keycloakState = inject(KEYCLOAK_INJECTION_KEY)
```

## Token Validity Constants

### Recommended Values

```typescript
// Minimum token validity for different scenarios

// Quick operations (API calls)
const MIN_VALIDITY_SHORT = 5  // 5 seconds

// Medium operations (form submissions)
const MIN_VALIDITY_MEDIUM = 30  // 30 seconds

// Long operations (file uploads)
const MIN_VALIDITY_LONG = 60  // 60 seconds

// Very long operations (batch processing)
const MIN_VALIDITY_VERY_LONG = 300  // 5 minutes
```

### Usage Example

```typescript
import { useKeycloak } from 'keycloak-vue'

const { updateToken } = useKeycloak()

// Before API call
await updateToken(5)

// Before file upload
await updateToken(60)

// Before batch operation
await updateToken(300)
```

## Refresh Intervals

### Recommended Intervals

```typescript
// Token refresh check intervals

// Aggressive refresh (high-security apps)
const REFRESH_INTERVAL_AGGRESSIVE = 30000  // 30 seconds

// Normal refresh (standard apps)
const REFRESH_INTERVAL_NORMAL = 60000  // 1 minute

// Relaxed refresh (low-frequency apps)
const REFRESH_INTERVAL_RELAXED = 300000  // 5 minutes
```

### Usage Example

```typescript
import { onMounted, onUnmounted } from 'vue'
import { useKeycloak } from 'keycloak-vue'

const REFRESH_INTERVAL = 60000  // 1 minute

const { updateToken } = useKeycloak()
let intervalId: number

onMounted(() => {
  intervalId = setInterval(async () => {
    await updateToken(30)
  }, REFRESH_INTERVAL)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
```

## Timeout Constants

### Recommended Timeouts

```typescript
// Operation timeouts

// Quick timeout (health checks)
const TIMEOUT_SHORT = 5000  // 5 seconds

// Standard timeout (API calls)
const TIMEOUT_STANDARD = 10000  // 10 seconds

// Long timeout (file operations)
const TIMEOUT_LONG = 30000  // 30 seconds

// Extended timeout (batch operations)
const TIMEOUT_EXTENDED = 60000  // 1 minute
```

## Scope Constants

### Common Scopes

```typescript
// OAuth2 scopes

const SCOPE_OPENID = 'openid'
const SCOPE_PROFILE = 'profile'
const SCOPE_EMAIL = 'email'
const SCOPE_ADDRESS = 'address'
const SCOPE_PHONE = 'phone'
const SCOPE_OFFLINE_ACCESS = 'offline_access'

// Common combinations
const SCOPE_BASIC = 'openid profile email'
const SCOPE_FULL = 'openid profile email address phone'
```

### Usage Example

```typescript
import { createKeycloakPlugin } from 'keycloak-vue'

const SCOPE_BASIC = 'openid profile email'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    scope: SCOPE_BASIC
  }
}))
```

## Complete Configuration Example

```typescript
import {
  createKeycloakPlugin,
  DEFAULT_INIT_OPTIONS,
  DEFAULT_MIN_VALIDITY,
  KeycloakOnLoad,
  KeycloakFlow,
  KeycloakPkceMethod
} from 'keycloak-vue'

// Custom constants
const REFRESH_INTERVAL = 60000  // 1 minute
const TOKEN_MIN_VALIDITY = 30   // 30 seconds
const SCOPE = 'openid profile email'

app.use(createKeycloakPlugin({
  config: {
    url: '',
    realm: '',
    clientId: ''
  },
  initOptions: {
    ...DEFAULT_INIT_OPTIONS,
    onLoad: KeycloakOnLoad.CHECK_SSO,
    flow: KeycloakFlow.STANDARD,
    pkceMethod: KeycloakPkceMethod.S256,
    scope: SCOPE,
    checkLoginIframe: false
  },
  callbacks: {
    onTokenExpired: async () => {
      const { updateToken } = useKeycloak()
      await updateToken(TOKEN_MIN_VALIDITY)
    }
  }
}))
```

## Environment-Specific Constants

```typescript
// Development
const DEV_CONFIG = {
  url: 'http://localhost:8080',
  realm: 'dev',
  clientId: 'dev-app',
  enableLogging: true,
  checkLoginIframe: false
}

// Staging
const STAGING_CONFIG = {
  url: 'https://keycloak-staging.example.com',
  realm: 'staging',
  clientId: 'staging-app',
  enableLogging: false,
  checkLoginIframe: true
}

// Production
const PROD_CONFIG = {
  url: 'https://keycloak.example.com',
  realm: 'production',
  clientId: 'prod-app',
  enableLogging: false,
  checkLoginIframe: true
}

// Select config based on environment
const config = import.meta.env.MODE === 'production' 
  ? PROD_CONFIG 
  : import.meta.env.MODE === 'staging'
  ? STAGING_CONFIG
  : DEV_CONFIG
```

## Best Practices

1. **Use Defaults** - Start with `DEFAULT_INIT_OPTIONS` and override as needed
2. **Environment Variables** - Use environment variables for configuration
3. **Document Constants** - Add comments explaining custom constants
4. **Type Safety** - Import constants for type-safe values
5. **Centralize Configuration** - Keep all constants in one place

## Next Steps

- Review [Types](/api/types)
- Check [Enums](/api/enums)
- Explore [Configuration](/guide/config)
