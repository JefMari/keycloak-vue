---
title: useKeycloak
description: Main composable for accessing Keycloak functionality including authentication state, tokens, and methods
outline: deep
---

# useKeycloak

The main composable for accessing Keycloak functionality in your components.

## Type Signature

```typescript
function useKeycloak(): UseKeycloakReturn
```

## Return Value

### State Properties

All state properties are readonly refs:

| Property | Type | Description |
|----------|------|-------------|
| `instance` | `Keycloak \| undefined` | Keycloak instance |
| `isAuthenticated` | `boolean` | Authentication status |
| `isReady` | `boolean` | Initialization complete |
| `isLoading` | `boolean` | Operation in progress |
| `token` | `string \| undefined` | Access token |
| `tokenParsed` | `KeycloakTokenParsed \| undefined` | Parsed access token |
| `idToken` | `string \| undefined` | ID token |
| `idTokenParsed` | `KeycloakTokenParsed \| undefined` | Parsed ID token |
| `refreshToken` | `string \| undefined` | Refresh token |
| `subject` | `string \| undefined` | User subject/ID |
| `profile` | `KeycloakProfile \| undefined` | User profile |
| `realmAccess` | `KeycloakRoles \| undefined` | Realm roles |
| `resourceAccess` | `KeycloakResourceAccess \| undefined` | Resource roles |
| `error` | `unknown` | Last error |

### Computed Properties

| Property | Type | Description |
|----------|------|-------------|
| `isTokenExpired` | `boolean` | Token expiration status |
| `username` | `string \| undefined` | Username |
| `email` | `string \| undefined` | Email |
| `fullName` | `string \| undefined` | Full name |
| `firstName` | `string \| undefined` | First name |
| `lastName` | `string \| undefined` | Last name |
| `realmRoles` | `string[]` | Array of realm roles |

### Methods

#### init

Initialize Keycloak.

```typescript
init(options?: KeycloakInitOptions): Promise<boolean>
```

**Parameters:**
- `options` - Initialization options

**Returns:** Promise resolving to authentication status

**Example:**
```typescript
const { init } = useKeycloak()
const authenticated = await init({
  onLoad: 'check-sso'
})
```

#### login

Redirect to login page.

```typescript
login(options?: KeycloakLoginOptions): Promise<void>
```

**Parameters:**
- `options` - Login options

**Example:**
```typescript
const { login } = useKeycloak()
await login({
  redirectUri: 'http://localhost:3000/dashboard',
  loginHint: 'user@example.com'
})
```

#### logout

Logout user.

```typescript
logout(options?: KeycloakLogoutOptions): Promise<void>
```

**Parameters:**
- `options` - Logout options

**Example:**
```typescript
const { logout } = useKeycloak()
await logout({
  redirectUri: 'http://localhost:3000'
})
```

#### register

Redirect to registration page.

```typescript
register(options?: KeycloakRegisterOptions): Promise<void>
```

#### accountManagement

Open account management page.

```typescript
accountManagement(options?: KeycloakAccountOptions): Promise<void>
```

#### updateToken

Update/refresh token if needed.

```typescript
updateToken(minValidity?: number): Promise<boolean>
```

**Parameters:**
- `minValidity` - Minimum token validity in seconds (default: 5)

**Returns:** Promise resolving to true if token was refreshed

**Example:**
```typescript
const { updateToken } = useKeycloak()
// Refresh if token expires in less than 30 seconds
const refreshed = await updateToken(30)
```

#### loadUserProfile

Load user profile from Keycloak.

```typescript
loadUserProfile(): Promise<KeycloakProfile>
```

**Returns:** Promise resolving to user profile

**Example:**
```typescript
const { loadUserProfile, profile } = useKeycloak()
await loadUserProfile()
console.log(profile.value)
```

#### clearToken

Clear authentication state.

```typescript
clearToken(): void
```

#### hasRealmRole

Check if user has a specific realm role.

```typescript
hasRealmRole(role: string): boolean
```

**Parameters:**
- `role` - Role name to check

**Returns:** True if user has the role

**Example:**
```typescript
const { hasRealmRole } = useKeycloak()
if (hasRealmRole('admin')) {
  // User is admin
}
```

#### hasResourceRole

Check if user has a specific resource role.

```typescript
hasResourceRole(role: string, resource?: string): boolean
```

**Parameters:**
- `role` - Role name to check
- `resource` - Resource name (optional, uses client ID if not provided)

**Returns:** True if user has the role

**Example:**
```typescript
const { hasResourceRole } = useKeycloak()
if (hasResourceRole('view', 'reports')) {
  // User can view reports
}
```

#### URL Generation Methods

```typescript
createLoginUrl(options?: KeycloakLoginOptions): string
createLogoutUrl(options?: KeycloakLogoutOptions): string
createRegisterUrl(options?: KeycloakRegisterOptions): string
createAccountUrl(options?: KeycloakAccountOptions): string
```

## Usage Example

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const {
  isAuthenticated,
  isReady,
  username,
  hasRealmRole,
  login,
  logout,
  updateToken
} = useKeycloak()

// Refresh token periodically
setInterval(async () => {
  await updateToken(30)
}, 60000)
</script>

<template>
  <div v-if="isReady">
    <div v-if="isAuthenticated">
      <p>Welcome, {{ username }}!</p>
      <button @click="logout()">Logout</button>
      
      <section v-if="hasRealmRole('admin')">
        Admin Panel
      </section>
    </div>
    <div v-else>
      <button @click="login()">Login</button>
    </div>
  </div>
</template>
```

## Related

- [Types](/api/types)
- [Examples](/examples/)
