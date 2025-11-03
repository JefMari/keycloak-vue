---
title: Vue Router Integration
description: Integrate KeycloakVue with Vue Router using authentication guards, async initialization, and protected routes
outline: deep
---

# Vue Router Integration

This guide covers how to integrate KeycloakVue with Vue Router, including authentication guards, async initialization patterns, and IIFE usage for older browsers.

## Overview

Integrating Keycloak with Vue Router requires careful coordination between authentication initialization and router setup to ensure:

- ✅ Authentication state is available when route guards execute
- ✅ Protected routes work correctly from app startup
- ✅ Navigation works seamlessly after authentication
- ✅ Deep linking to protected routes is handled properly

## Basic Integration

### Recommended Pattern: Callback-Based Initialization

The safest approach is to initialize the router only after Keycloak is ready:

```typescript
// main.ts
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";
import { routes } from "./router/routes";

const app = createApp(App);

// Install Keycloak plugin first
app.use(
  createKeycloakPlugin({
    config: {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: "login-required",
      checkLoginIframe: false,
    },
    callbacks: {
      onReady: (authenticated) => {
        console.log("Keycloak ready, authenticated:", authenticated);

        // Create and install router after Keycloak is ready
        const router = createRouter({
          history: createWebHistory(),
          routes,
        });

        app.use(router);
        app.mount("#app");
      },
      onAuthError: (error) => {
        console.error("Keycloak authentication error:", error);
        // Handle authentication error
      },
    },
  })
);
```

## Authentication Guards

### Global Navigation Guard

Add authentication checks before navigation:

```typescript
// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useKeycloak } from "keycloak-vue";

export function setupAuthGuards(router: any) {
  router.beforeEach(
    (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const { isAuthenticated, isReady, hasRealmRole } = useKeycloak();

      // Wait for Keycloak to be ready
      if (!isReady.value) {
        // If you reach here, there might be a timing issue
        console.warn("Router guard executed before Keycloak was ready");
        return next(false);
      }

      // Check if route requires authentication
      if (to.meta.requiresAuth && !isAuthenticated.value) {
        // Redirect to login or let Keycloak handle it
        console.log("Route requires auth, but user not authenticated");
        return next(false);
      }

      // Check role-based access
      if (to.meta.requiredRoles && isAuthenticated.value) {
        const requiredRoles = Array.isArray(to.meta.requiredRoles)
          ? to.meta.requiredRoles
          : [to.meta.requiredRoles];

        const hasRequiredRole = requiredRoles.some((role) =>
          hasRealmRole(role)
        );

        if (!hasRequiredRole) {
          console.log("User lacks required roles:", requiredRoles);
          return next({ name: "Forbidden" });
        }
      }

      next();
    }
  );
}
```

### Complete Router Setup with Guards

```typescript
// main.ts - Updated with guards
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";
import { routes } from "./router/routes";
import { setupAuthGuards } from "./router/guards";

const app = createApp(App);

app.use(
  createKeycloakPlugin({
    config: {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    },
    initOptions: {
      onLoad: "login-required",
      checkLoginIframe: false,
    },
    callbacks: {
      onReady: (authenticated) => {
        // Create router
        const router = createRouter({
          history: createWebHistory(),
          routes,
        });

        // Setup authentication guards
        setupAuthGuards(router);

        // Install router and mount app
        app.use(router);
        app.mount("#app");

        console.log(
          "App initialized with authentication state:",
          authenticated
        );
      },
      onAuthError: (error) => {
        console.error("Authentication failed:", error);
        // Could show error page or retry logic
      },
    },
  })
);
```

## IIFE Pattern for Older Browsers

For browsers that don't support top-level await, wrap the initialization in an Immediately Invoked Function Expression (IIFE):

### Basic IIFE Pattern

```typescript
// main.ts - IIFE version
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";
import { routes } from "./router/routes";
import { setupAuthGuards } from "./router/guards";

// IIFE for older browser compatibility
(async () => {
  try {
    const app = createApp(App);

    // Install Keycloak plugin
    app.use(
      createKeycloakPlugin({
        config: {
          url: import.meta.env.VITE_KEYCLOAK_URL,
          realm: import.meta.env.VITE_KEYCLOAK_REALM,
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        },
        initOptions: {
          onLoad: "login-required",
          checkLoginIframe: false,
        },
        autoInit: false, // We'll initialize manually
      })
    );

    // Get Keycloak instance and initialize manually
    const keycloak = app.config.globalProperties.$keycloak;

    // Wait for Keycloak initialization
    const authenticated = await keycloak.init({
      onLoad: "login-required",
      checkLoginIframe: false,
    });

    console.log("Keycloak initialized, authenticated:", authenticated);

    // Create and setup router after Keycloak is ready
    const router = createRouter({
      history: createWebHistory(),
      routes,
    });

    setupAuthGuards(router);
    app.use(router);

    // Mount the app
    app.mount("#app");
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
})();
```

## Advanced Router Patterns

### Lazy Route Loading with Auth

```typescript
// router/routes.ts - Lazy loading with auth checks
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/admin",
    name: "AdminLayout",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: {
      requiresAuth: true,
      requiredRoles: ["admin"],
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/admin/Dashboard.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/Users.vue"),
        meta: { requiredRoles: ["admin", "user-manager"] },
      },
      {
        path: "settings",
        name: "AdminSettings",
        component: () => import("../views/admin/Settings.vue"),
        meta: { requiredRoles: ["admin", "super-admin"] },
      },
    ],
  },
];
```

### Route-Level Guards

```typescript
// In a route component
<script setup lang="ts">
import { useKeycloak } from 'keycloak-vue'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { isAuthenticated, hasRealmRole } = useKeycloak()
const router = useRouter()

onMounted(() => {
  // Component-level auth check
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }

  // Role-specific check
  if (!hasRealmRole('admin')) {
    router.push('/forbidden')
    return
  }
})
</script>
```

### Dynamic Route Registration

```typescript
// router/dynamic.ts - Register routes based on user roles
import type { Router } from "vue-router";
import { useKeycloak } from "keycloak-vue";

export function registerDynamicRoutes(router: Router) {
  const { hasRealmRole, realmRoles } = useKeycloak();

  // Admin routes
  if (hasRealmRole("admin")) {
    router.addRoute({
      path: "/admin/advanced",
      name: "AdminAdvanced",
      component: () => import("../views/admin/Advanced.vue"),
      meta: { requiresAuth: true, requiredRoles: ["admin"] },
    });
  }

  // Manager routes
  if (hasRealmRole("manager")) {
    router.addRoute({
      path: "/manager",
      name: "ManagerDashboard",
      component: () => import("../views/Manager.vue"),
      meta: { requiresAuth: true, requiredRoles: ["manager"] },
    });
  }

  console.log("Dynamic routes registered for roles:", realmRoles.value);
}
```

## Navigation Helpers

### Authenticated Navigation Component

```vue
<!-- components/AuthNav.vue -->
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";
import { useRouter } from "vue-router";

const { isAuthenticated, username, logout, hasRealmRole } = useKeycloak();
const router = useRouter();

const handleLogout = async () => {
  try {
    await logout({
      redirectUri: window.location.origin,
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const navigateToProfile = () => {
  router.push("/profile");
};
</script>

<template>
  <nav class="auth-nav">
    <div v-if="isAuthenticated" class="user-menu">
      <span>Welcome, {{ username }}</span>

      <router-link to="/dashboard">Dashboard</router-link>

      <router-link v-if="hasRealmRole('admin')" to="/admin">
        Admin
      </router-link>

      <button @click="navigateToProfile">Profile</button>
      <button @click="handleLogout">Logout</button>
    </div>

    <div v-else class="guest-menu">
      <router-link to="/">Home</router-link>
    </div>
  </nav>
</template>
```

## Testing Router Integration

### Test Setup

```typescript
// tests/router.test.ts
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createKeycloakPlugin } from "keycloak-vue";
import { routes } from "../router/routes";

const createTestApp = (authenticated = false) => {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  const mockKeycloakPlugin = createKeycloakPlugin({
    config: "http://localhost:8080/realms/test",
    autoInit: false,
  });

  return { router, mockKeycloakPlugin };
};

describe("Router Integration", () => {
  it("should redirect unauthenticated users from protected routes", async () => {
    const { router } = createTestApp(false);

    await router.push("/dashboard");

    // Should not navigate to protected route
    expect(router.currentRoute.value.path).not.toBe("/dashboard");
  });

  it("should allow authenticated users to access protected routes", async () => {
    const { router } = createTestApp(true);

    await router.push("/dashboard");

    expect(router.currentRoute.value.path).toBe("/dashboard");
  });
});
```

## Best Practices

### ✅ Do's

- **Initialize router after Keycloak**: Always wait for Keycloak to be ready
- **Use callback-based initialization**: More reliable than manual timing
- **Implement proper error handling**: Handle auth failures gracefully
- **Add route guards**: Protect routes at the router level
- **Use IIFE for older browsers**: Ensure compatibility
- **Test auth flows**: Verify protected routes work correctly

### ❌ Don'ts

- **Don't mount app before Keycloak is ready**: Causes race conditions
- **Don't ignore authentication errors**: Users will see broken UI
- **Don't skip route guards**: Security vulnerability
- **Don't hardcode redirect URLs**: Use environment variables
- **Don't forget error boundaries**: App crashes are bad UX

## Troubleshooting

### Common Issues

1. **Route guards executed before Keycloak ready**

   - Solution: Use callback-based initialization

2. **Deep links to protected routes don't work**

   - Solution: Ensure `redirectUri` includes the attempted path

3. **Authentication state not available in guards**

   - Solution: Check initialization order

4. **IIFE not working in older browsers**

   - Solution: Ensure proper polyfills are loaded

5. **Router navigation after login doesn't work**
   - Solution: Use proper redirect URLs in Keycloak config

### Debug Helpers

```typescript
// utils/debug.ts
export function debugAuth() {
  const { isReady, isAuthenticated, error } = useKeycloak();

  console.log("🔍 Auth Debug Info:", {
    ready: isReady.value,
    authenticated: isAuthenticated.value,
    error: error.value?.message,
    currentRoute: useRoute().path,
  });
}
```

## Next Steps

- Learn about [Async Initialization Patterns](/guide/async-initialization)
- Explore [Callbacks](/guide/callbacks)
- Check [Protected API Examples](/examples/protected-api)
- See [Role-Based Access](/examples/role-based)
