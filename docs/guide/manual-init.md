# Manual Initialization

If you prefer not to use the plugin system, you can initialize Keycloak manually.

## Basic Manual Initialization

```typescript
import { initKeycloak } from 'keycloak-vue'

// Initialize Keycloak
const keycloak = initKeycloak({
  url: 'http://localhost:8080',
  realm: 'my-realm',
  clientId: 'my-app'
})

// Initialize manually
const authenticated = await keycloak.init({
  onLoad: 'check-sso'
})

console.log('Authenticated:', authenticated)
```

## In Vue Application

```typescript
// src/keycloak/index.ts
import { initKeycloak } from 'keycloak-vue'

export const keycloak = initKeycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
})

export async function initializeKeycloak() {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      checkLoginIframe: false
    })
    
    console.log('Keycloak initialized:', authenticated)
    return authenticated
  } catch (error) {
    console.error('Keycloak initialization failed:', error)
    throw error
  }
}
```

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { initializeKeycloak } from './keycloak'

async function bootstrap() {
  await initializeKeycloak()
  
  const app = createApp(App)
  app.mount('#app')
}

bootstrap()
```

## With Event Callbacks

```typescript
import { initKeycloak } from 'keycloak-vue'

const keycloak = initKeycloak({
  url: 'http://localhost:8080',
  realm: 'my-realm',
  clientId: 'my-app'
})

// Set up event callbacks
keycloak.onReady = (authenticated) => {
  console.log('Keycloak ready:', authenticated)
}

keycloak.onAuthSuccess = () => {
  console.log('Authentication successful')
}

keycloak.onAuthError = (error) => {
  console.error('Authentication error:', error)
}

keycloak.onAuthRefreshSuccess = () => {
  console.log('Token refreshed')
}

keycloak.onAuthRefreshError = () => {
  console.error('Token refresh failed')
}

keycloak.onAuthLogout = () => {
  console.log('User logged out')
}

keycloak.onTokenExpired = () => {
  console.log('Token expired')
  keycloak.updateToken(30)
}

// Initialize
await keycloak.init({
  onLoad: 'check-sso'
})
```

## Using with Vue Provide/Inject

```typescript
// src/keycloak/index.ts
import { initKeycloak } from 'keycloak-vue'
import type { InjectionKey } from 'vue'
import type Keycloak from 'keycloak-js'

export const keycloakKey: InjectionKey<Keycloak> = Symbol('keycloak')

export const keycloak = initKeycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
})
```

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { keycloak, keycloakKey } from './keycloak'

async function bootstrap() {
  await keycloak.init({
    onLoad: 'check-sso'
  })
  
  const app = createApp(App)
  app.provide(keycloakKey, keycloak)
  app.mount('#app')
}

bootstrap()
```

```vue
<!-- Component.vue -->
<script setup lang="ts">
import { inject } from 'vue'
import { keycloakKey } from '@/keycloak'

const keycloak = inject(keycloakKey)

const login = () => {
  keycloak?.login()
}

const logout = () => {
  keycloak?.logout()
}
</script>

<template>
  <div>
    <button v-if="keycloak?.authenticated" @click="logout">
      Logout
    </button>
    <button v-else @click="login">
      Login
    </button>
  </div>
</template>
```

## Comparison with Plugin

### Plugin Approach (Recommended)

✅ Automatic initialization  
✅ Built-in reactive state  
✅ Easy to use with `useKeycloak()`  
✅ Consistent across components  

```typescript
app.use(createKeycloakPlugin({ config, initOptions }))
```

### Manual Approach

✅ More control over initialization  
✅ Custom setup logic  
❌ More boilerplate code  
❌ Need to manage state yourself  

```typescript
const keycloak = initKeycloak(config)
await keycloak.init(initOptions)
```

## When to Use Manual Initialization

Use manual initialization when you need:

- Custom initialization logic
- Multiple Keycloak instances
- Integration with existing authentication systems
- Fine-grained control over the initialization process

For most applications, the plugin approach is recommended.

## Next Steps

- Learn about [Configuration Options](/guide/config)
- Explore [Callbacks](/guide/callbacks)
- Check out [Examples](/examples/)
