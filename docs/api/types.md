---
title: Types
description: Complete TypeScript type definitions for KeycloakVue including interfaces, token types, and configuration options
outline: deep
---

# Types

Complete TypeScript type definitions for KeycloakVue.

## Core Types

### KeycloakConfig

Configuration for connecting to Keycloak server.

```typescript
interface KeycloakConfig {
  url: string        // Keycloak server URL
  realm: string      // Realm name
  clientId: string   // Client ID
}
```

### KeycloakInitOptions

Options for initializing Keycloak.

```typescript
interface KeycloakInitOptions {
  useNonce?: boolean
  onLoad?: 'login-required' | 'check-sso'
  token?: string
  refreshToken?: string
  idToken?: string
  timeSkew?: number
  checkLoginIframe?: boolean
  checkLoginIframeInterval?: number
  responseMode?: 'query' | 'fragment'
  flow?: 'standard' | 'implicit' | 'hybrid'
  pkceMethod?: 'S256' | false
  redirectUri?: string
  silentCheckSsoRedirectUri?: string
  silentCheckSsoFallback?: boolean
  scope?: string
  enableLogging?: boolean
  messageReceiveTimeout?: number
  locale?: string
  adapter?: 'default' | 'cordova' | 'cordova-native' | KeycloakAdapter
}
```

### KeycloakLoginOptions

Options for login redirect.

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

### KeycloakLogoutOptions

Options for logout.

```typescript
interface KeycloakLogoutOptions {
  redirectUri?: string
}
```

### KeycloakRegisterOptions

Options for registration redirect.

```typescript
interface KeycloakRegisterOptions {
  redirectUri?: string
  locale?: string
}
```

### KeycloakAccountOptions

Options for account management.

```typescript
interface KeycloakAccountOptions {
  redirectUri?: string
}
```

## Token Types

### KeycloakTokenParsed

Parsed JWT token.

```typescript
interface KeycloakTokenParsed {
  exp?: number                    // Expiration time
  iat?: number                    // Issued at time
  auth_time?: number              // Authentication time
  jti?: string                    // JWT ID
  iss?: string                    // Issuer
  aud?: string | string[]         // Audience
  sub?: string                    // Subject
  typ?: string                    // Token type
  azp?: string                    // Authorized party
  session_state?: string          // Session state
  acr?: string                    // Authentication context class reference
  'allowed-origins'?: string[]    // Allowed origins
  realm_access?: KeycloakRoles    // Realm roles
  resource_access?: KeycloakResourceAccess  // Resource roles
  scope?: string                  // Scopes
  email_verified?: boolean        // Email verification status
  name?: string                   // Full name
  preferred_username?: string     // Username
  given_name?: string            // First name
  family_name?: string           // Last name
  email?: string                 // Email address
  [key: string]: unknown         // Additional custom claims
}
```

### KeycloakRoles

Role information.

```typescript
interface KeycloakRoles {
  roles: string[]
}
```

### KeycloakResourceAccess

Resource-specific role assignments.

```typescript
interface KeycloakResourceAccess {
  [resource: string]: KeycloakRoles
}
```

## Profile Types

### KeycloakProfile

User profile information.

```typescript
interface KeycloakProfile {
  id?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  emailVerified?: boolean
  totp?: boolean
  createdTimestamp?: number
  attributes?: { [key: string]: string[] }
}
```

## Plugin Types

### KeycloakPluginOptions

Options for creating the Keycloak plugin.

```typescript
interface KeycloakPluginOptions {
  config: KeycloakConfig
  initOptions?: KeycloakInitOptions
  callbacks?: KeycloakCallbacks
}
```

### KeycloakCallbacks

Event callbacks.

```typescript
interface KeycloakCallbacks {
  onReady?: (authenticated: boolean) => void
  onAuthSuccess?: () => void
  onAuthError?: (error: unknown) => void
  onAuthRefreshSuccess?: () => void
  onAuthRefreshError?: () => void
  onAuthLogout?: () => void
  onTokenExpired?: () => void
}
```

## Composable Types

### UseKeycloakReturn

Return type of `useKeycloak()` composable.

```typescript
interface UseKeycloakReturn {
  // State
  instance: Readonly<Ref<Keycloak | undefined>>
  isAuthenticated: Readonly<Ref<boolean>>
  isReady: Readonly<Ref<boolean>>
  isLoading: Readonly<Ref<boolean>>
  token: Readonly<Ref<string | undefined>>
  tokenParsed: Readonly<Ref<KeycloakTokenParsed | undefined>>
  idToken: Readonly<Ref<string | undefined>>
  idTokenParsed: Readonly<Ref<KeycloakTokenParsed | undefined>>
  refreshToken: Readonly<Ref<string | undefined>>
  subject: Readonly<Ref<string | undefined>>
  profile: Readonly<Ref<KeycloakProfile | undefined>>
  realmAccess: Readonly<Ref<KeycloakRoles | undefined>>
  resourceAccess: Readonly<Ref<KeycloakResourceAccess | undefined>>
  error: Readonly<Ref<unknown>>
  
  // Computed
  isTokenExpired: ComputedRef<boolean>
  username: ComputedRef<string | undefined>
  email: ComputedRef<string | undefined>
  fullName: ComputedRef<string | undefined>
  firstName: ComputedRef<string | undefined>
  lastName: ComputedRef<string | undefined>
  realmRoles: ComputedRef<string[]>
  
  // Methods
  init: (options?: KeycloakInitOptions) => Promise<boolean>
  login: (options?: KeycloakLoginOptions) => Promise<void>
  logout: (options?: KeycloakLogoutOptions) => Promise<void>
  register: (options?: KeycloakRegisterOptions) => Promise<void>
  accountManagement: (options?: KeycloakAccountOptions) => Promise<void>
  updateToken: (minValidity?: number) => Promise<boolean>
  loadUserProfile: () => Promise<KeycloakProfile>
  clearToken: () => void
  hasRealmRole: (role: string) => boolean
  hasResourceRole: (role: string, resource?: string) => boolean
  createLoginUrl: (options?: KeycloakLoginOptions) => string
  createLogoutUrl: (options?: KeycloakLogoutOptions) => string
  createRegisterUrl: (options?: KeycloakRegisterOptions) => string
  createAccountUrl: (options?: KeycloakAccountOptions) => string
}
```

## Adapter Types

### KeycloakAdapter

Custom adapter interface.

```typescript
interface KeycloakAdapter {
  login: (options?: KeycloakLoginOptions) => Promise<void>
  logout: (options?: KeycloakLogoutOptions) => Promise<void>
  register: (options?: KeycloakRegisterOptions) => Promise<void>
  accountManagement: () => Promise<void>
  redirectUri: (options: { redirectUri?: string }, encodeHash: boolean) => string
}
```

## Type Guards

### isTokenExpired

Check if token is expired.

```typescript
function isTokenExpired(tokenParsed?: KeycloakTokenParsed, minValidity: number = 0): boolean {
  if (!tokenParsed?.exp) return true
  const expiresIn = tokenParsed.exp - Math.ceil(Date.now() / 1000)
  return expiresIn < minValidity
}
```

## Usage Examples

### Type-safe Configuration

```typescript
import type { KeycloakPluginOptions } from 'keycloak-vue'

const options: KeycloakPluginOptions = {
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false
  }
}

app.use(createKeycloakPlugin(options))
```

### Type-safe Composable

```typescript
import type { UseKeycloakReturn } from 'keycloak-vue'
import { useKeycloak } from 'keycloak-vue'

const keycloak: UseKeycloakReturn = useKeycloak()
```

### Type-safe Token Parsing

```typescript
import type { KeycloakTokenParsed } from 'keycloak-vue'
import { useKeycloak } from 'keycloak-vue'

const { tokenParsed } = useKeycloak()

if (tokenParsed.value) {
  const token: KeycloakTokenParsed = tokenParsed.value
  console.log('Username:', token.preferred_username)
  console.log('Email:', token.email)
  console.log('Roles:', token.realm_access?.roles)
}
```

### Type-safe Profile

```typescript
import type { KeycloakProfile } from 'keycloak-vue'
import { useKeycloak } from 'keycloak-vue'

const { profile, loadUserProfile } = useKeycloak()

await loadUserProfile()

if (profile.value) {
  const userProfile: KeycloakProfile = profile.value
  console.log('Name:', userProfile.firstName, userProfile.lastName)
  console.log('Email:', userProfile.email)
}
```

## Generic Types

### With Custom Claims

Extend token types with custom claims:

```typescript
interface CustomTokenParsed extends KeycloakTokenParsed {
  organization?: string
  department?: string
  roles?: string[]
}

const { tokenParsed } = useKeycloak()
const customToken = tokenParsed.value as CustomTokenParsed

console.log('Organization:', customToken.organization)
console.log('Department:', customToken.department)
```

## Next Steps

- Explore [Enums](/api/enums)
- Check [Constants](/api/constants)
- See [Usage Examples](/examples/)
