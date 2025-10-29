# Getting Started

Welcome to KeycloakVue! This guide will help you integrate Keycloak authentication into your Vue 3 application.

## What is KeycloakVue?

KeycloakVue is a comprehensive Vue 3.5+ wrapper for [keycloak-js](https://www.keycloak.org/securing-apps/javascript-adapter) that provides:

- **Modern Vue 3 Integration** - Built with the Composition API
- **Full TypeScript Support** - Complete type definitions
- **Reactive Authentication State** - Leverages Vue's reactivity
- **Flexible Usage** - Use as a plugin or composable
- **Token Management** - Automatic refresh capabilities

## Prerequisites

Before you begin, ensure you have:

- Vue 3.5 or higher
- A running Keycloak server
- A configured Keycloak realm and client

## Installation

Install both `keycloak-vue` and `keycloak-js`:

::: code-group

```bash [npm]
npm install keycloak-vue keycloak-js
```

```bash [yarn]
yarn add keycloak-vue keycloak-js
```

```bash [pnpm]
pnpm add keycloak-vue keycloak-js
```

:::

## Basic Setup

### 1. Configure the Plugin

In your `main.ts` or `main.js` file:

```typescript
import { createApp } from 'vue'
import { createKeycloakPlugin } from 'keycloak-vue'
import App from './App.vue'

const app = createApp(App)

app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  },
  initOptions: {
    onLoad: 'login-required',
    checkLoginIframe: false
  }
}))

app.mount('#app')
```

### 2. Use in Your Components

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
      <button @click="login()">Login</button>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>
```

## Next Steps

- Learn about [Plugin Setup](/guide/plugin-setup)
- Explore the [Composable API](/guide/composable)
- Check out [Examples](/examples/)
