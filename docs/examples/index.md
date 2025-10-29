# Examples

This section provides practical examples of common use cases with KeycloakVue.

## Available Examples

- [Token Refresh](/examples/token-refresh) - Automatic token refresh strategies
- [Protected API Calls](/examples/protected-api) - Making authenticated HTTP requests
- [Role-Based Access](/examples/role-based) - Implementing role-based rendering and navigation

## Basic Authentication Flow

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
      <h1>Welcome, {{ username }}!</h1>
      <button @click="logout()">Logout</button>
    </div>
    <div v-else>
      <h1>Please Login</h1>
      <button @click="login()">Login</button>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>
```

## User Profile Display

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'
import { onMounted } from 'vue'

const {
  isAuthenticated,
  profile,
  username,
  email,
  fullName,
  loadUserProfile
} = useKeycloak()

onMounted(async () => {
  if (isAuthenticated.value) {
    await loadUserProfile()
  }
})
</script>

<template>
  <div v-if="profile">
    <h2>User Profile</h2>
    <dl>
      <dt>Full Name:</dt>
      <dd>{{ fullName }}</dd>
      
      <dt>Username:</dt>
      <dd>{{ username }}</dd>
      
      <dt>Email:</dt>
      <dd>{{ email }}</dd>
      
      <dt>Email Verified:</dt>
      <dd>{{ profile.emailVerified ? 'Yes' : 'No' }}</dd>
    </dl>
  </div>
</template>
```

## Login with Options

```vue
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'

const { login } = useKeycloak()

const loginWithGoogle = async () => {
  await login({
    idpHint: 'google'
  })
}

const loginWithEmail = async (email: string) => {
  await login({
    loginHint: email,
    prompt: 'login'
  })
}

const register = async () => {
  await login({
    action: 'register'
  })
}
</script>

<template>
  <div>
    <button @click="loginWithGoogle">Login with Google</button>
    <button @click="loginWithEmail('user@example.com')">
      Login with Email Hint
    </button>
    <button @click="register">Register</button>
  </div>
</template>
```

## Protected Route Guard

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useKeycloak } from 'keycloak-vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('@/views/Admin.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated, isReady, hasRealmRole } = useKeycloak()
  
  if (!isReady.value) {
    // Wait for Keycloak to initialize
    return next(false)
  }
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Redirect to login
    return next('/')
  }
  
  if (to.meta.role && !hasRealmRole(to.meta.role as string)) {
    // Redirect if user doesn't have required role
    return next('/dashboard')
  }
  
  next()
})

export default router
```

## Next Steps

Explore detailed examples:

- [Token Refresh](/examples/token-refresh)
- [Protected API Calls](/examples/protected-api)
- [Role-Based Access](/examples/role-based)
