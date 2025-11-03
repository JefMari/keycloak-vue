---
title: Async Initialization Patterns
description: Handle asynchronous Keycloak initialization to avoid race conditions and ensure reliable authentication state
outline: deep
---

# Async Initialization Patterns

Learn how to properly handle asynchronous Keycloak initialization in your Vue application to avoid race conditions and ensure reliable authentication state.

## Overview

When integrating Keycloak with Vue applications, timing is critical. Authentication state must be available before components mount and route guards execute. This guide covers patterns to handle async initialization safely.

## The Problem with Immediate App Mounting

### What Goes Wrong

When using `autoInit: false`, you might encounter issues if you mount your app immediately without waiting for Keycloak to initialize:

```typescript
// ❌ PROBLEMATIC - App mounts before Keycloak is ready
const initApp = async () => {
  const app = createApp(App)
  
  app.use(createKeycloakPlugin({
    config: { 
      url: 'http://localhost:8080',
      realm: 'my-realm',
      clientId: 'my-app'
    },
    initOptions: { onLoad: 'login-required' },
    autoInit: false  // Keycloak won't initialize automatically
  }))
  
  // App mounts immediately, but Keycloak isn't ready yet
  app.mount('#app')  // This can cause authentication issues
}
```

### Common Issues

- **Route guards fail**: Navigation guards execute before auth state is available
- **Components render incorrectly**: Auth-dependent components show wrong state
- **API calls fail**: Requests made without valid tokens
- **User experience issues**: Flickering between authenticated/unauthenticated states

## Solution 1: Callback-Based Initialization (Recommended)

The best approach is to use `autoInit: true` with callbacks to mount your app only after Keycloak is ready:

```typescript
// ✅ RECOMMENDED - Wait for Keycloak before mounting
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import { createRouter } from './router'
import App from './App.vue'

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
        const router = createRouter()
        app.use(router)
        
        // Add other plugins
        app.use(otherPlugins)
        
        // Mount the app only when Keycloak is ready
        app.mount('#app')
      },
      onAuthError: (error) => {
        console.error('Keycloak auth error:', error)
        // Handle authentication error - redirect to error page
        showErrorPage(error)
      }
    }
  }))
}

initApp()
```

### Benefits of Callback-Based Approach

- **Guaranteed timing**: App mounts only after auth is ready
- **Error handling**: Built-in error callback for auth failures
- **Clean separation**: Clear distinction between setup and runtime
- **Framework integration**: Works well with Vue Router and other plugins

## Solution 2: Manual Initialization

If you need more control over the initialization process:

```typescript
// ✅ ALTERNATIVE - Manual initialization
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import { createRouter } from './router'
import App from './App.vue'

const initApp = async () => {
  const app = createApp(App)
  
  // Install plugin first (without auto-init)
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
    autoInit: false // We'll initialize manually
  }))
  
  // Get Keycloak instance and manually initialize
  const { $keycloak } = app.config.globalProperties
  
  try {
    // Wait for Keycloak to initialize
    const authenticated = await $keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false
    })
    
    console.log('Keycloak initialized, authenticated:', authenticated)
    
    // Initialize other plugins after Keycloak is ready
    const router = createRouter()
    app.use(router)
    app.use(otherPlugins)
    
    // Mount the app
    app.mount('#app')
    
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error)
    // Handle initialization error
    showErrorPage(error)
  }
}

initApp()
```

### When to Use Manual Initialization

- **Complex setup logic**: When you need custom logic between steps
- **Error recovery**: Advanced error handling and retry mechanisms
- **Testing**: Easier to mock and test individual steps
- **Progressive enhancement**: Loading states and fallback UI

## Solution 3: IIFE Pattern for Browser Compatibility

For browsers that don't support top-level await, wrap initialization in an IIFE:

```typescript
// ✅ IIFE PATTERN - For older browser compatibility
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import { createRouter } from './router'
import App from './App.vue'

// IIFE (Immediately Invoked Function Expression)
;(async () => {
  try {
    const app = createApp(App)
    
    app.use(createKeycloakPlugin({
      config: {
        url: import.meta.env.VITE_KEYCLOAK_URL,
        realm: import.meta.env.VITE_KEYCLOAK_REALM,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false
      },
      callbacks: {
        onReady: (authenticated) => {
          // Initialize router after Keycloak is ready
          const router = createRouter()
          app.use(router)
          app.mount('#app')
        },
        onAuthError: (error) => {
          console.error('Auth error:', error)
          showErrorPage(error)
        }
      }
    }))
    
  } catch (error) {
    console.error('Failed to initialize app:', error)
    showErrorPage(error)
  }
})()
```

## Advanced Patterns

### Loading Screen During Initialization

Show a loading screen while authentication initializes:

```typescript
// main.ts
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import App from './App.vue'
import LoadingScreen from './components/LoadingScreen.vue'

// Show loading screen immediately
const loadingApp = createApp(LoadingScreen)
loadingApp.mount('#app')

const app = createApp(App)

app.use(createKeycloakPlugin({
  config: {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  },
  callbacks: {
    onReady: (authenticated) => {
      // Remove loading screen and mount main app
      loadingApp.unmount()
      
      const router = createRouter()
      app.use(router)
      app.mount('#app')
    },
    onAuthError: (error) => {
      loadingApp.unmount()
      showErrorPage(error)
    }
  }
}))
```

### Retry Logic with Exponential Backoff

Handle network failures during initialization:

```typescript
// main.ts with retry logic
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'

async function initializeWithRetry(maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const app = createApp(App)
      
      app.use(createKeycloakPlugin({
        config: {
          url: import.meta.env.VITE_KEYCLOAK_URL,
          realm: import.meta.env.VITE_KEYCLOAK_REALM,
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
        },
        autoInit: false
      }))
      
      // Add timeout to prevent hanging
      const keycloak = app.config.globalProperties.$keycloak
      const initPromise = keycloak.init({ onLoad: 'login-required' })
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      )
      
      await Promise.race([initPromise, timeoutPromise])
      
      // Success - mount app
      const router = createRouter()
      app.use(router)
      app.mount('#app')
      break
      
    } catch (error) {
      console.error(`Initialization attempt ${attempt} failed:`, error)
      
      if (attempt === maxAttempts) {
        showErrorPage(error)
        break
      }
      
      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

initializeWithRetry()
```

### Conditional Initialization

Initialize differently based on environment or conditions:

```typescript
// main.ts with conditional logic
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'

async function initializeApp() {
  const app = createApp(App)
  
  // Check if authentication is required
  const requiresAuth = import.meta.env.VITE_REQUIRE_AUTH !== 'false'
  
  if (requiresAuth) {
    // Full Keycloak setup
    app.use(createKeycloakPlugin({
      config: {
        url: import.meta.env.VITE_KEYCLOAK_URL,
        realm: import.meta.env.VITE_KEYCLOAK_REALM,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
      },
      initOptions: {
        onLoad: import.meta.env.MODE === 'development' ? 'check-sso' : 'login-required'
      },
      callbacks: {
        onReady: (authenticated) => {
          setupAppWithAuth(app, authenticated)
        }
      }
    }))
  } else {
    // Development mode without auth
    setupAppWithoutAuth(app)
  }
}

function setupAppWithAuth(app, authenticated) {
  const router = createRouter()
  app.use(router)
  app.mount('#app')
}

function setupAppWithoutAuth(app) {
  const router = createRouterWithoutAuth()
  app.use(router)
  app.mount('#app')
}

initializeApp()
```

## Why Proper Initialization Matters

### Benefits of Correct Async Patterns

- ✅ **Authentication state is available when components mount**
- ✅ **Route guards work correctly from the start**
- ✅ **Protected API calls have valid tokens**
- ✅ **User experience is consistent across page refreshes**
- ✅ **No race conditions between Keycloak and Vue Router**
- ✅ **Proper error handling and recovery**

### Common Pitfalls to Avoid

1. **Mounting before Keycloak is ready** - Causes authentication state issues
2. **Not handling authentication errors** - Users may see broken UI
3. **Initializing router before Keycloak** - Route guards may not work correctly
4. **Missing error boundaries** - App crashes on authentication failures
5. **No loading states** - Poor user experience during initialization
6. **Ignoring network failures** - App fails silently on connection issues

## Testing Async Initialization

### Unit Testing

```typescript
// tests/initialization.test.ts
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'

describe('Async Initialization', () => {
  it('should wait for Keycloak before mounting', async () => {
    let appMounted = false
    let keycloakReady = false
    
    const app = createApp({})
    
    app.use(createKeycloakPlugin({
      config: 'http://localhost:8080/realms/test',
      callbacks: {
        onReady: (authenticated) => {
          keycloakReady = true
          app.mount('#app')
          appMounted = true
        }
      }
    }))
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(keycloakReady).toBe(true)
    expect(appMounted).toBe(true)
  })
})
```

### Integration Testing

```typescript
// tests/e2e/initialization.spec.ts
import { test, expect } from '@playwright/test'

test('app initializes with authentication', async ({ page }) => {
  // Navigate to app
  await page.goto('/')
  
  // Should show loading screen first
  await expect(page.locator('[data-testid="loading"]')).toBeVisible()
  
  // Should redirect to login or show authenticated content
  await expect(page.locator('[data-testid="app-content"]')).toBeVisible()
  
  // Should not show loading anymore
  await expect(page.locator('[data-testid="loading"]')).not.toBeVisible()
})
```

## Next Steps

- Learn about [Vue Router Integration](/guide/router-integration)
- Explore [Plugin Setup](/guide/plugin-setup)
- Check out [Examples](/examples/)