---
title: Using the Composable
description: Learn how to use the useKeycloak() composable for reactive authentication state and methods
outline: deep
---

# Using the Composable

The `useKeycloak()` composable provides reactive access to Keycloak authentication state and methods throughout your application.

## Basic Usage

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const {
  isAuthenticated,
  isReady,
  username,
  login,
  logout
} = useKeycloak()
</script>

<template>
  <div v-if="isReady">
    <div v-if="isAuthenticated">
      <p>Welcome, {{ username }}!</p>
      <button @click="logout()">Logout</button>
    </div>
    <div v-else>
      <button @click="login()">Login</button>
    </div>
  </div>
</template>
```

## State Properties

### Authentication Status

```typescript
const {
  isAuthenticated,  // boolean - User is authenticated
  isReady,          // boolean - Keycloak is initialized
  isLoading         // boolean - Operation in progress
} = useKeycloak()
```

### Tokens

```typescript
const {
  token,            // string | undefined - Access token
  tokenParsed,      // KeycloakTokenParsed | undefined - Parsed access token
  idToken,          // string | undefined - ID token
  idTokenParsed,    // KeycloakTokenParsed | undefined - Parsed ID token
  refreshToken      // string | undefined - Refresh token
} = useKeycloak()
```

### User Information

```typescript
const {
  username,         // string | undefined - Username
  email,            // string | undefined - Email
  firstName,        // string | undefined - First name
  lastName,         // string | undefined - Last name
  fullName,         // string | undefined - Full name
  subject,          // string | undefined - User subject/ID
  profile           // KeycloakProfile | undefined - Complete profile
} = useKeycloak()
```

### Roles and Access

```typescript
const {
  realmAccess,      // KeycloakRoles | undefined - Realm roles
  resourceAccess,   // KeycloakResourceAccess | undefined - Resource roles
  realmRoles        // string[] - Array of realm role names
} = useKeycloak()
```

## Methods

### Authentication Methods

```typescript
const { login, logout, register, accountManagement } = useKeycloak()

// Login
login({
  redirectUri: 'http://localhost:3000/dashboard',
  loginHint: 'user@example.com'
})

// Logout
logout({
  redirectUri: 'http://localhost:3000'
})

// Register
register({
  redirectUri: 'http://localhost:3000'
})

// Account Management
accountManagement()
```

### Token Management

```typescript
const { updateToken, isTokenExpired } = useKeycloak()

// Update token if it expires in less than 30 seconds
await updateToken(30)

// Check if token is expired
if (isTokenExpired.value) {
  await updateToken()
}
```

### User Profile

```typescript
const { loadUserProfile, profile } = useKeycloak()

// Load user profile
await loadUserProfile()
console.log(profile.value)
```

### Role Checking

```typescript
const { hasRealmRole, hasResourceRole } = useKeycloak()

// Check realm role
if (hasRealmRole('admin')) {
  // User has admin realm role
}

// Check resource role
if (hasResourceRole('view', 'my-resource')) {
  // User has view role for my-resource
}
```

### URL Generation

```typescript
const {
  createLoginUrl,
  createLogoutUrl,
  createRegisterUrl,
  createAccountUrl
} = useKeycloak()

const loginUrl = createLoginUrl({
  redirectUri: 'http://localhost:3000/callback'
})
```

## Common Patterns

### Loading State

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const { isReady, isLoading, isAuthenticated } = useKeycloak()
</script>

<template>
  <div v-if="!isReady">
    <p>Initializing...</p>
  </div>
  <div v-else-if="isLoading">
    <p>Loading...</p>
  </div>
  <div v-else-if="isAuthenticated">
    <!-- Authenticated content -->
  </div>
  <div v-else>
    <!-- Unauthenticated content -->
  </div>
</template>
```

### User Profile Display

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'
import { onMounted } from 'vue'

const { loadUserProfile, profile, username, email } = useKeycloak()

onMounted(async () => {
  await loadUserProfile()
})
</script>

<template>
  <div v-if="profile">
    <h2>{{ profile.firstName }} {{ profile.lastName }}</h2>
    <p>Username: {{ username }}</p>
    <p>Email: {{ email }}</p>
  </div>
</template>
```

### Conditional Rendering by Role

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const { hasRealmRole, hasResourceRole } = useKeycloak()
</script>

<template>
  <div>
    <section v-if="hasRealmRole('user')">
      <h2>User Content</h2>
    </section>
    
    <section v-if="hasRealmRole('admin')">
      <h2>Admin Content</h2>
    </section>
    
    <section v-if="hasResourceRole('view', 'reports')">
      <h2>Reports</h2>
    </section>
  </div>
</template>
```

## Next Steps

- Learn about [Manual Initialization](/guide/manual-init)
- Explore [Configuration Options](/guide/config)
- Check out [Examples](/examples/)
