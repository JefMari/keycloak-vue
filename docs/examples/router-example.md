---
title: Vue Router Example
description: Complete Vue application example with Keycloak authentication and Vue Router integration
outline: deep
---

# Vue Router Example

This example demonstrates a complete Vue application with Keycloak authentication and Vue Router integration.

## Project Structure

```
src/
├── main.ts                # App initialization with IIFE
├── App.vue                # Root component
├── router/
│   ├── index.ts           # Router configuration
│   ├── routes.ts          # Route definitions
│   └── guards.ts          # Authentication guards
├── views/
│   ├── Home.vue           # Public home page
│   ├── Dashboard.vue      # Protected dashboard
│   ├── Profile.vue        # User profile
│   └── Admin.vue          # Admin-only page
├── components/
│   ├── AuthNav.vue        # Navigation with auth state
│   └── LoadingScreen.vue  # Loading component
└── layouts/
    ├── DefaultLayout.vue  # Default layout
    └── AdminLayout.vue    # Admin layout
```

## Implementation

### 1. Main Application Entry (IIFE Pattern)

```typescript
// src/main.ts
import { createApp } from "vue";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";
import { createAppRouter } from "./router";
import LoadingScreen from "./components/LoadingScreen.vue";

// IIFE for older browser compatibility
(async () => {
  try {
    // Show loading screen immediately
    const loadingApp = createApp(LoadingScreen);
    loadingApp.mount("#app");

    const app = createApp(App);

    // Install Keycloak plugin
    app.use(
      createKeycloakPlugin({
        config: {
          url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
          realm: import.meta.env.VITE_KEYCLOAK_REALM || "demo",
          clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "vue-app",
        },
        initOptions: {
          onLoad: "check-sso",
          checkLoginIframe: false,
          pkceMethod: "S256",
        },
        callbacks: {
          onReady: (authenticated) => {
            console.log("✅ Keycloak ready, authenticated:", authenticated);

            // Create router after Keycloak is ready
            const router = createAppRouter();
            app.use(router);

            // Unmount loading screen and mount main app
            loadingApp.unmount();
            app.mount("#app");
          },
          onAuthError: (error) => {
            console.error("❌ Keycloak auth error:", error);
            loadingApp.unmount();

            // Show error state
            const errorDiv = document.createElement("div");
            errorDiv.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
              <h1>Authentication Error</h1>
              <p>Failed to initialize authentication. Please try again.</p>
              <button onclick="location.reload()">Retry</button>
            </div>
          `;
            document.body.appendChild(errorDiv);
          },
        },
      })
    );
  } catch (error) {
    console.error("💥 Failed to initialize app:", error);
    document.body.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>App Failed to Load</h1>
        <p>Please refresh the page to try again.</p>
        <button onclick="location.reload()">Refresh</button>
      </div>
    `;
  }
})();
```

### 2. Router Configuration

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { setupAuthGuards } from "./guards";

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });

  // Setup authentication guards
  setupAuthGuards(router);

  return router;
}
```

### 3. Route Definitions

```typescript
// src/router/routes.ts
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
    meta: {
      title: "Home",
      public: true,
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      title: "Dashboard",
      requiresAuth: true,
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/Profile.vue"),
    meta: {
      title: "Profile",
      requiresAuth: true,
    },
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: {
      title: "Admin",
      requiresAuth: true,
      requiredRoles: ["admin"],
    },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/Admin.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/Users.vue"),
        meta: {
          requiredRoles: ["admin", "user-manager"],
        },
      },
    ],
  },
  {
    path: "/forbidden",
    name: "Forbidden",
    component: () => import("../views/Forbidden.vue"),
    meta: {
      title: "Access Denied",
      public: true,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("../views/NotFound.vue"),
    meta: {
      title: "Page Not Found",
      public: true,
    },
  },
];
```

### 4. Authentication Guards

```typescript
// src/router/guards.ts
import type {
  Router,
  NavigationGuardNext,
  RouteLocationNormalized,
} from "vue-router";
import { useKeycloak } from "keycloak-vue";

export function setupAuthGuards(router: Router) {
  // Global before guard
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const { isAuthenticated, isReady, hasRealmRole } = useKeycloak();

      // Ensure Keycloak is ready
      if (!isReady.value) {
        console.warn("🔄 Router guard executed before Keycloak was ready");
        return next(false);
      }

      // Public routes (no auth required)
      if (to.meta.public || !to.meta.requiresAuth) {
        return next();
      }

      // Check authentication for protected routes
      if (!isAuthenticated.value) {
        console.log("🔒 Route requires auth, but user not authenticated");

        // Store intended destination for redirect after login
        sessionStorage.setItem("intendedRoute", to.fullPath);

        // Let Keycloak handle login
        const { login } = useKeycloak();
        await login({
          redirectUri: `${window.location.origin}${to.fullPath}`,
        });

        return next(false);
      }

      // Check role-based access
      if (to.meta.requiredRoles) {
        const requiredRoles = Array.isArray(to.meta.requiredRoles)
          ? to.meta.requiredRoles
          : [to.meta.requiredRoles];

        const hasRequiredRole = requiredRoles.some((role) =>
          hasRealmRole(role)
        );

        if (!hasRequiredRole) {
          console.log("🚫 User lacks required roles:", requiredRoles);
          return next({ name: "Forbidden" });
        }
      }

      // All checks passed
      next();
    }
  );

  // After each navigation
  router.afterEach((to) => {
    // Update page title
    if (to.meta.title) {
      document.title = `${to.meta.title} - KeycloakVue Demo`;
    }

    // Clear intended route after successful navigation
    if (sessionStorage.getItem("intendedRoute")) {
      sessionStorage.removeItem("intendedRoute");
    }
  });
}
```

### 5. Loading Screen Component

```vue
<!-- src/components/LoadingScreen.vue -->
<template>
  <div class="loading-screen">
    <div class="loading-content">
      <div class="spinner"></div>
      <h2>Initializing Authentication...</h2>
      <p>Please wait while we set up your session.</p>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}
</style>
```

### 6. Navigation Component

```vue
<!-- src/components/AuthNav.vue -->
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const { isAuthenticated, username, hasRealmRole, login, logout } =
  useKeycloak();

const router = useRouter();
const route = useRoute();

const canAccessAdmin = computed(() => hasRealmRole("admin"));

const handleLogin = async () => {
  await login({
    redirectUri: window.location.href,
  });
};

const handleLogout = async () => {
  await logout({
    redirectUri: window.location.origin,
  });
};

const navigateToProfile = () => {
  router.push("/profile");
};
</script>

<template>
  <nav class="auth-nav">
    <div class="nav-brand">
      <router-link to="/" class="brand-link"> 🔐 KeycloakVue Demo </router-link>
    </div>

    <div class="nav-links">
      <router-link to="/" :class="{ active: route.name === 'Home' }">
        Home
      </router-link>

      <template v-if="isAuthenticated">
        <router-link
          to="/dashboard"
          :class="{ active: route.name === 'Dashboard' }"
        >
          Dashboard
        </router-link>

        <router-link
          v-if="canAccessAdmin"
          to="/admin"
          :class="{ active: route.path.startsWith('/admin') }"
        >
          Admin
        </router-link>
      </template>
    </div>

    <div class="nav-user">
      <div v-if="isAuthenticated" class="user-menu">
        <span class="username">{{ username }}</span>

        <div class="dropdown">
          <button class="dropdown-toggle">⚙️</button>
          <div class="dropdown-menu">
            <button @click="navigateToProfile">👤 Profile</button>
            <button @click="handleLogout">🚪 Logout</button>
          </div>
        </div>
      </div>

      <button v-else @click="handleLogin" class="login-btn">🔑 Login</button>
    </div>
  </nav>
</template>

<style scoped>
.auth-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.brand-link {
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
  color: #4f46e5;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
  background: #f3f4f6;
  color: #4f46e5;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
  color: #374151;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.dropdown-toggle:hover {
  background: #f3f4f6;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  padding: 0.5rem;
  display: none;
  z-index: 10;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-menu button:hover {
  background: #f3f4f6;
}

.login-btn {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.login-btn:hover {
  background: #4338ca;
}
</style>
```

### 7. Dashboard View

```vue
<!-- src/views/Dashboard.vue -->
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";
import { onMounted, ref } from "vue";

const { username, email, realmRoles, updateToken, loadUserProfile, profile } =
  useKeycloak();

const lastTokenRefresh = ref<Date | null>(null);

onMounted(async () => {
  // Load user profile on component mount
  try {
    await loadUserProfile();
    console.log("✅ User profile loaded");
  } catch (error) {
    console.error("❌ Failed to load user profile:", error);
  }
});

const refreshToken = async () => {
  try {
    const refreshed = await updateToken(30);
    lastTokenRefresh.value = new Date();
    console.log("Token refreshed:", refreshed);
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
};
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>👋 Welcome to your Dashboard</h1>
      <p>
        Hello, <strong>{{ username }}</strong
        >!
      </p>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h3>📧 Profile Information</h3>
        <div v-if="profile" class="profile-info">
          <p>
            <strong>Name:</strong> {{ profile.firstName }}
            {{ profile.lastName }}
          </p>
          <p><strong>Email:</strong> {{ profile.email }}</p>
          <p><strong>Username:</strong> {{ profile.username }}</p>
        </div>
        <p v-else class="loading">Loading profile...</p>
      </div>

      <div class="card">
        <h3>🛡️ Your Roles</h3>
        <div v-if="realmRoles.length > 0" class="roles-list">
          <span v-for="role in realmRoles" :key="role" class="role-badge">
            {{ role }}
          </span>
        </div>
        <p v-else class="no-roles">No roles assigned</p>
      </div>

      <div class="card">
        <h3>🔑 Token Management</h3>
        <button @click="refreshToken" class="refresh-btn">Refresh Token</button>
        <p v-if="lastTokenRefresh" class="refresh-info">
          Last refreshed: {{ lastTokenRefresh.toLocaleTimeString() }}
        </p>
      </div>

      <div class="card">
        <h3>🎯 Quick Actions</h3>
        <div class="actions">
          <router-link to="/profile" class="action-btn">
            View Profile
          </router-link>
          <router-link
            v-if="realmRoles.includes('admin')"
            to="/admin"
            class="action-btn admin"
          >
            Admin Panel
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.card h3 {
  margin: 0 0 1rem;
  color: #374151;
  font-size: 1.125rem;
}

.profile-info p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.refresh-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #059669;
}

.refresh-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: inline-block;
  text-align: center;
  padding: 0.75rem;
  background: #f3f4f6;
  color: #374151;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.admin {
  background: #fef3c7;
  color: #92400e;
}

.action-btn.admin:hover {
  background: #fde68a;
}

.loading,
.no-roles {
  color: #6b7280;
  font-style: italic;
}
</style>
```

### 8. Environment Configuration

```bash
# .env.local
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=demo
VITE_KEYCLOAK_CLIENT_ID=vue-app
```

## Best Practices

1. **IIFE Pattern** - Use IIFE for older browser compatibility when top-level await isn't supported
2. **Loading States** - Always show loading indicators during authentication initialization
3. **Error Boundaries** - Implement proper error handling for auth failures and app crashes
4. **Route Guards** - Protect routes at the router level with proper authentication checks
5. **Role-Based Access** - Implement granular permissions using Keycloak roles
6. **Deep Linking** - Support direct navigation to protected routes with automatic login redirect
7. **Token Management** - Ensure tokens are valid before navigation and refresh when needed
8. **Graceful Degradation** - Provide fallback UI for authentication failures
