---
title: Protected API Calls
description: Learn how to make authenticated HTTP requests with proper token management using KeycloakVue
outline: deep
---

# Protected API Calls

Learn how to make authenticated HTTP requests with proper token management.

## Basic API Call with Token

Add the access token to your API requests:

```typescript
import { useKeycloak } from 'keycloak-vue'

const { token, updateToken } = useKeycloak()

async function fetchData() {
  // Ensure token is valid
  await updateToken(30)
  
  const response = await fetch('/api/data', {
    headers: {
      'Authorization': `Bearer ${token.value}`
    }
  })
  
  return response.json()
}
```

## Reusable API Client

Create a reusable function for API calls:

```typescript
// src/api/client.ts
import { useKeycloak } from 'keycloak-vue'

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { token, updateToken } = useKeycloak()
  
  // Refresh token if needed
  await updateToken(30)
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return response.json()
}
```

Usage:

```typescript
import { apiCall } from '@/api/client'

// GET request
const users = await apiCall<User[]>('/api/users')

// POST request
const newUser = await apiCall<User>('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John', email: 'john@example.com' })
})
```

## Axios Integration

Set up Axios with automatic token injection:

```typescript
// src/api/axios.ts
import axios from 'axios'
import { useKeycloak } from 'keycloak-vue'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const { token, updateToken } = useKeycloak()
    
    // Refresh token if it expires in less than 30 seconds
    await updateToken(30)
    
    // Add token to headers
    if (token.value) {
      config.headers.Authorization = `Bearer ${token.value}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { updateToken, login } = useKeycloak()
      
      try {
        // Try to refresh token
        await updateToken(0)
        
        // Retry the original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await login()
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
```

Usage:

```typescript
import apiClient from '@/api/axios'

// GET request
const response = await apiClient.get('/users')
const users = response.data

// POST request
const newUser = await apiClient.post('/users', {
  name: 'John',
  email: 'john@example.com'
})

// PUT request
await apiClient.put(`/users/${userId}`, {
  name: 'Jane'
})

// DELETE request
await apiClient.delete(`/users/${userId}`)
```

## Composable for API Calls

Create a composable for making API calls:

```typescript
// src/composables/useApi.ts
import { ref } from 'vue'
import { useKeycloak } from 'keycloak-vue'

export function useApi<T>() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)
  
  const { token, updateToken } = useKeycloak()
  
  const execute = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    loading.value = true
    error.value = null
    
    try {
      // Ensure token is valid
      await updateToken(30)
      
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token.value}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      data.value = result
      return result
    } catch (e) {
      error.value = e as Error
      return null
    } finally {
      loading.value = false
    }
  }
  
  return {
    loading,
    error,
    data,
    execute
  }
}
```

Usage:

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'

interface User {
  id: string
  name: string
  email: string
}

const { loading, error, data, execute } = useApi<User[]>()

const loadUsers = async () => {
  await execute('/api/users')
}

const createUser = async (user: Omit<User, 'id'>) => {
  await execute('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  })
  // Reload users
  await loadUsers()
}
</script>

<template>
  <div>
    <button @click="loadUsers">Load Users</button>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="data">
      <ul>
        <li v-for="user in data" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
  </div>
</template>
```

## File Upload

Upload files with authentication:

```typescript
import { useKeycloak } from 'keycloak-vue'

async function uploadFile(file: File) {
  const { token, updateToken } = useKeycloak()
  
  await updateToken(30)
  
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.value}`
    },
    body: formData
  })
  
  return response.json()
}
```

## WebSocket with Token

Authenticate WebSocket connections:

```typescript
import { useKeycloak } from 'keycloak-vue'

function createAuthenticatedWebSocket() {
  const { token } = useKeycloak()
  
  const ws = new WebSocket(`ws://localhost:8080/ws?token=${token.value}`)
  
  ws.onopen = () => {
    console.log('WebSocket connected')
  }
  
  ws.onmessage = (event) => {
    console.log('Message received:', event.data)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
  
  ws.onclose = () => {
    console.log('WebSocket closed')
  }
  
  return ws
}
```

## Error Handling

Handle common API errors:

```typescript
import { useKeycloak } from 'keycloak-vue'

async function apiCallWithErrorHandling(endpoint: string) {
  const { token, updateToken, login } = useKeycloak()
  
  try {
    await updateToken(30)
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.status === 401) {
      // Unauthorized - redirect to login
      await login()
      throw new Error('Authentication required')
    }
    
    if (response.status === 403) {
      // Forbidden - insufficient permissions
      throw new Error('Insufficient permissions')
    }
    
    if (response.status === 404) {
      // Not found
      throw new Error('Resource not found')
    }
    
    if (!response.ok) {
      // Other errors
      throw new Error(`API error: ${response.statusText}`)
    }
    
    return response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}
```

## Best Practices

1. **Always Refresh Token** - Call `updateToken()` before API requests
2. **Handle 401 Responses** - Redirect to login when authentication fails
3. **Centralize API Logic** - Use a single API client for consistency
4. **Error Handling** - Properly handle and display API errors
5. **Type Safety** - Use TypeScript for type-safe API calls
6. **Loading States** - Show loading indicators during API calls
