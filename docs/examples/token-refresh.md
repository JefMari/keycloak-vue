---
title: Token Refresh
description: Implement automatic token refresh to keep users authenticated without interruption using KeycloakVue
outline: deep
---

# Token Refresh

Learn how to implement automatic token refresh to keep users authenticated without interruption.

## Basic Token Refresh

The simplest approach is to refresh the token periodically:

```typescript
import { useKeycloak } from "keycloak-vue";
import { onMounted, onUnmounted } from "vue";

const { updateToken } = useKeycloak();

let refreshInterval: number;

onMounted(() => {
  // Check every 60 seconds if token needs refresh (expires in < 30 seconds)
  refreshInterval = setInterval(async () => {
    try {
      await updateToken(30);
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }, 60000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
});
```

## Global Token Refresh

Set up token refresh once in your app:

```typescript
// src/keycloak/tokenRefresh.ts
import { useKeycloak } from "keycloak-vue";

export function setupTokenRefresh() {
  const { updateToken, isAuthenticated } = useKeycloak();

  // Refresh token every 60 seconds if authenticated
  setInterval(async () => {
    if (isAuthenticated.value) {
      try {
        const refreshed = await updateToken(30);
        if (refreshed) {
          console.log("Token refreshed successfully");
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    }
  }, 60000);
}
```

```typescript
// main.ts
import { createApp } from "vue";
import { createKeycloakPlugin } from "keycloak-vue";
import { setupTokenRefresh } from "./keycloak/tokenRefresh";
import App from "./App.vue";

const app = createApp(App);

app.use(
  createKeycloakPlugin({
    config: {
      url: "http://localhost:8080",
      realm: "my-realm",
      clientId: "my-app",
    },
    callbacks: {
      onReady: () => {
        setupTokenRefresh();
      },
    },
  })
);

app.mount("#app");
```

## Token Expiration Callback

Use the `onTokenExpired` callback to handle token expiration:

```typescript
app.use(
  createKeycloakPlugin({
    config: {
      url: "http://localhost:8080",
      realm: "my-realm",
      clientId: "my-app",
    },
    callbacks: {
      onTokenExpired: async () => {
        console.log("Token expired, refreshing...");
        const { updateToken } = useKeycloak();
        try {
          await updateToken(30);
          console.log("Token refreshed successfully");
        } catch (error) {
          console.error("Failed to refresh token:", error);
        }
      },
    },
  })
);
```

## Refresh Before API Calls

Ensure token is valid before making API calls:

```typescript
import { useKeycloak } from "keycloak-vue";

const { token, updateToken } = useKeycloak();

async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Refresh token if it expires in less than 30 seconds
  await updateToken(30);

  return fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token.value}`,
    },
  });
}

// Usage
const response = await apiCall("/api/data");
const data = await response.json();
```

## Axios Interceptor

Automatically refresh token for Axios requests:

```typescript
// src/api/axios.ts
import axios from "axios";
import { useKeycloak } from "keycloak-vue";

const apiClient = axios.create({
  baseURL: "/api",
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    const { token, updateToken } = useKeycloak();

    // Refresh token if needed
    await updateToken(30);

    // Add token to headers
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { updateToken, login } = useKeycloak();

      try {
        // Try to refresh token
        await updateToken(0);

        // Retry the original request
        return apiClient(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await login();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

## Check Token Expiration

Check if token is expired before operations:

```typescript
import { useKeycloak } from "keycloak-vue";

const { isTokenExpired, updateToken } = useKeycloak();

async function performOperation() {
  if (isTokenExpired.value) {
    console.log("Token is expired, refreshing...");
    try {
      await updateToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      return;
    }
  }

  // Proceed with operation
  console.log("Performing operation...");
}
```

## Composable for Token Refresh

Create a reusable composable:

```typescript
// src/composables/useTokenRefresh.ts
import { useKeycloak } from "keycloak-vue";
import { onMounted, onUnmounted } from "vue";

export function useTokenRefresh(minValidity = 30, intervalMs = 60000) {
  const { updateToken, isAuthenticated } = useKeycloak();
  let refreshInterval: number;

  const startRefresh = () => {
    refreshInterval = setInterval(async () => {
      if (isAuthenticated.value) {
        try {
          await updateToken(minValidity);
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }
    }, intervalMs);
  };

  const stopRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  };

  onMounted(startRefresh);
  onUnmounted(stopRefresh);

  return {
    startRefresh,
    stopRefresh,
  };
}
```

Usage:

```vue
<script setup lang="ts">
import { useTokenRefresh } from "@/composables/useTokenRefresh";

// Automatically refresh token every 60 seconds
// if it expires in less than 30 seconds
useTokenRefresh(30, 60000);
</script>
```

## Best Practices

1. **Set Appropriate Intervals** - Refresh frequently enough to prevent expiration, but not so often that it impacts performance
2. **Handle Errors** - Always handle token refresh failures gracefully
3. **Minimum Validity** - Use a minimum validity of at least 30 seconds to account for network latency
4. **Centralize Logic** - Keep token refresh logic in one place for consistency
5. **Silent Refresh** - Token refresh happens silently without user interaction
