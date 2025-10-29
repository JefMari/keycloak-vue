# Callbacks

Handle Keycloak authentication events with callback functions.

## Interface

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

## Available Callbacks

### onReady

Called when Keycloak initialization is complete.

```typescript
callbacks: {
  onReady: (authenticated) => {
    console.log('Keycloak ready, authenticated:', authenticated)
    if (authenticated) {
      // User is logged in
      console.log('User is authenticated')
    } else {
      // User is not logged in
      console.log('User is not authenticated')
    }
  }
}
```

**Use cases:**
- Initialize app after authentication
- Show/hide UI elements
- Redirect based on authentication status

### onAuthSuccess

Called when authentication succeeds.

```typescript
callbacks: {
  onAuthSuccess: () => {
    console.log('Login successful')
    // Redirect to dashboard
    router.push('/dashboard')
  }
}
```

**Use cases:**
- Track successful logins
- Redirect after login
- Load user-specific data

### onAuthError

Called when authentication fails.

```typescript
callbacks: {
  onAuthError: (error) => {
    console.error('Authentication failed:', error)
    // Show error message
    showNotification('Login failed. Please try again.')
  }
}
```

**Use cases:**
- Display error messages
- Log authentication failures
- Redirect to error page

### onAuthRefreshSuccess

Called when token refresh succeeds.

```typescript
callbacks: {
  onAuthRefreshSuccess: () => {
    console.log('Token refreshed successfully')
  }
}
```

**Use cases:**
- Track token refreshes
- Update UI state
- Log refresh events

### onAuthRefreshError

Called when token refresh fails.

```typescript
callbacks: {
  onAuthRefreshError: () => {
    console.error('Token refresh failed')
    // Redirect to login
    router.push('/login')
  }
}
```

**Use cases:**
- Handle expired sessions
- Redirect to login
- Clear app state

### onAuthLogout

Called when user logs out.

```typescript
callbacks: {
  onAuthLogout: () => {
    console.log('User logged out')
    // Clear local storage
    localStorage.clear()
    // Redirect to home
    router.push('/')
  }
}
```

**Use cases:**
- Clear user data
- Reset app state
- Redirect after logout

### onTokenExpired

Called when the token expires.

```typescript
callbacks: {
  onTokenExpired: () => {
    console.log('Token expired, refreshing...')
    const { updateToken } = useKeycloak()
    updateToken(30).catch(() => {
      console.error('Failed to refresh token')
    })
  }
}
```

**Use cases:**
- Automatically refresh token
- Show session expiration warning
- Redirect to login if refresh fails

## Complete Example

```typescript
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import router from './router'
import App from './App.vue'

const app = createApp(App)

app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false
  },
  callbacks: {
    onReady: (authenticated) => {
      console.log('Keycloak ready:', authenticated)
      if (authenticated) {
        console.log('User is logged in')
      }
    },
    onAuthSuccess: () => {
      console.log('Authentication successful')
      router.push('/dashboard')
    },
    onAuthError: (error) => {
      console.error('Authentication error:', error)
    },
    onAuthRefreshSuccess: () => {
      console.log('Token refreshed')
    },
    onAuthRefreshError: () => {
      console.error('Token refresh failed')
      router.push('/login')
    },
    onAuthLogout: () => {
      console.log('User logged out')
      localStorage.clear()
      router.push('/')
    },
    onTokenExpired: () => {
      console.log('Token expired, refreshing...')
    }
  }
}))

app.use(router)
app.mount('#app')
```

## Practical Examples

### Analytics Tracking

Track authentication events:

```typescript
callbacks: {
  onAuthSuccess: () => {
    analytics.track('Login Success')
  },
  onAuthError: (error) => {
    analytics.track('Login Error', { error })
  },
  onAuthLogout: () => {
    analytics.track('Logout')
  }
}
```

### Loading State Management

Show/hide loading indicators:

```typescript
import { ref } from 'vue'

const isInitializing = ref(true)

callbacks: {
  onReady: (authenticated) => {
    isInitializing.value = false
    console.log('App ready, authenticated:', authenticated)
  }
}
```

### Error Notifications

Display user-friendly error messages:

```typescript
import { useNotification } from '@/composables/useNotification'

const { showError, showSuccess } = useNotification()

callbacks: {
  onAuthSuccess: () => {
    showSuccess('Successfully logged in!')
  },
  onAuthError: (error) => {
    showError('Login failed. Please try again.')
  },
  onAuthRefreshError: () => {
    showError('Session expired. Please log in again.')
  }
}
```

### Automatic Token Refresh

Keep user authenticated:

```typescript
callbacks: {
  onTokenExpired: async () => {
    const { updateToken } = useKeycloak()
    try {
      await updateToken(30)
      console.log('Token refreshed automatically')
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // Redirect to login
      router.push('/login')
    }
  }
}
```

### Session Management

Track user session:

```typescript
callbacks: {
  onAuthSuccess: () => {
    sessionStorage.setItem('lastLogin', new Date().toISOString())
  },
  onAuthLogout: () => {
    sessionStorage.clear()
    localStorage.removeItem('userPreferences')
  }
}
```

### Router Integration

Redirect based on authentication:

```typescript
import router from './router'

callbacks: {
  onReady: (authenticated) => {
    if (authenticated) {
      const returnUrl = sessionStorage.getItem('returnUrl')
      if (returnUrl) {
        router.push(returnUrl)
        sessionStorage.removeItem('returnUrl')
      } else {
        router.push('/dashboard')
      }
    }
  },
  onAuthLogout: () => {
    router.push('/')
  }
}
```

### Composable Integration

Use composables in callbacks:

```typescript
import { useUserStore } from '@/stores/user'

callbacks: {
  onAuthSuccess: async () => {
    const userStore = useUserStore()
    await userStore.loadUserData()
  },
  onAuthLogout: () => {
    const userStore = useUserStore()
    userStore.clearUserData()
  }
}
```

## Best Practices

1. **Keep callbacks simple** - Avoid complex logic in callbacks
2. **Handle errors** - Always include error handling in callbacks
3. **Don't block initialization** - Callbacks should be fast and non-blocking
4. **Use for side effects** - Callbacks are great for tracking, logging, and notifications
5. **Centralize logic** - Keep business logic in stores/composables, not callbacks

## Callback Order

The callbacks are typically triggered in this order:

1. **onReady** - After initialization
2. **onAuthSuccess** / **onAuthError** - After authentication attempt
3. **onAuthRefreshSuccess** / **onAuthRefreshError** - When token is refreshed
4. **onTokenExpired** - When token expires
5. **onAuthLogout** - When user logs out

## TypeScript Support

Full TypeScript support for all callbacks:

```typescript
import type { KeycloakCallbacks } from 'keycloak-vue'

const callbacks: KeycloakCallbacks = {
  onReady: (authenticated: boolean) => {
    console.log('Ready:', authenticated)
  },
  onAuthError: (error: unknown) => {
    console.error('Error:', error)
  }
}

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  callbacks
}))
```

## Next Steps

- Learn about [Token Refresh](/examples/token-refresh)
- Explore [Router Guards](/examples/router-guards)
- Check out [Error Handling](/guide/error-handling)
