# KeycloakVue

[![npm version](https://badge.fury.io/js/keycloak-vue.svg)](https://badge.fury.io/js/keycloak-vue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)

A comprehensive Vue 3.5+ wrapper for [keycloak-js](https://www.keycloak.org/securing-apps/javascript-adapter) using the Composition API. This library provides a seamless integration of Keycloak authentication into your Vue applications with full TypeScript support.

## 📚 Documentation

**For complete documentation, examples, and API reference, visit:**

### **[📖 https://jefmari.github.io/keycloak-vue/](https://jefmari.github.io/keycloak-vue/)**

---

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔧 Basic Usage](#-basic-usage)
- [📚 Documentation](#-documentation-1)
- [🔗 Links](#-links)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

- ✨ **Vue 3.5+ Composition API** - Built for modern Vue applications
- 🔒 **Type-Safe** - Full TypeScript definitions for all Keycloak types, props, and constants
- 🎯 **Reactive State** - Reactive authentication state using Vue's reactivity system
- 🔌 **Plugin System** - Easy integration with Vue's plugin system
- 🛡️ **Vue Router Integration** - Built-in support for route guards and authentication flows
- 🌐 **IIFE Compatible** - Supports older browsers without top-level await
- 🎨 **Flexible** - Use as a plugin or composable
- 📦 **Tree-Shakeable** - Import only what you need
- 🚀 **SSO Ready** - Full support for Single Sign-On features
- 🔄 **Token Management** - Automatic token refresh capabilities

## 🚀 Quick Start

Get started in just 2 steps:

### 1. Install the package

```bash
npm install keycloak-vue keycloak-js
```

### 2. Setup the plugin

```typescript
// main.ts
import { createApp } from "vue";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";

const app = createApp(App);

app.use(
  createKeycloakPlugin({
    config: {
      url: "https://your-keycloak-server",
      realm: "your-realm",
      clientId: "your-client-id",
    },
    initOptions: {
      onLoad: "login-required",
    },
  })
);

app.mount("#app");
```

### 3. Use in components

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const { isAuthenticated, username, login, logout } = useKeycloak();
</script>

<template>
  <div v-if="isAuthenticated">
    <p>Welcome, {{ username }}!</p>
    <button @click="logout()">Logout</button>
  </div>
  <div v-else>
    <button @click="login()">Login</button>
  </div>
</template>
```

That's it! 🎉

## 📦 Installation

```bash
npm install keycloak-vue keycloak-js
```

or

```bash
yarn add keycloak-vue keycloak-js
```

or

```bash
pnpm add keycloak-vue keycloak-js
```

## 🔧 Basic Usage

### Plugin Setup (Recommended)

```typescript
// main.ts
import { createApp } from "vue";
import { createKeycloakPlugin } from "keycloak-vue";
import App from "./App.vue";

const app = createApp(App);

app.use(
  createKeycloakPlugin({
    config: {
      url: "https://your-keycloak-server",
      realm: "your-realm",
      clientId: "your-client-id",
    },
    initOptions: {
      onLoad: "login-required",
      checkLoginIframe: false,
    },
  })
);

app.mount("#app");
```

### Using the Composable

```vue
<script setup lang="ts">
import { useKeycloak } from "keycloak-vue";

const {
  isAuthenticated,
  isReady,
  username,
  token,
  login,
  logout,
  hasRealmRole,
} = useKeycloak();
</script>

<template>
  <div v-if="isReady">
    <div v-if="isAuthenticated">
      <p>Welcome, {{ username }}!</p>
      <button @click="logout()">Logout</button>

      <div v-if="hasRealmRole('admin')">
        <p>Admin content</p>
      </div>
    </div>
    <div v-else>
      <button @click="login()">Login</button>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
```

## 📚 Documentation

### 🌟 **[Complete Documentation Site](https://jefmari.github.io/keycloak-vue/)**

Our documentation includes:

- **[📖 Getting Started Guide](https://jefmari.github.io/keycloak-vue/guide/getting-started.html)** - Step-by-step setup
- **[⚙️ Configuration](https://jefmari.github.io/keycloak-vue/guide/config.html)** - All configuration options
- **[🎯 API Reference](https://jefmari.github.io/keycloak-vue/api/)** - Complete API documentation
- **[💡 Examples](https://jefmari.github.io/keycloak-vue/examples/)** - Real-world use cases
- **[🔧 Advanced Usage](https://jefmari.github.io/keycloak-vue/guide/manual-init.html)** - Manual initialization and more

### Quick Links

| Topic                 | Description                   | Link                                                                          |
| --------------------- | ----------------------------- | ----------------------------------------------------------------------------- |
| 🚀 Installation       | How to install and setup      | [Guide](https://jefmari.github.io/keycloak-vue/guide/installation.html)       |
| 🔌 Plugin Setup       | Vue plugin configuration      | [Guide](https://jefmari.github.io/keycloak-vue/guide/plugin-setup.html)       |
| 🎯 Composable         | Using `useKeycloak()`         | [API](https://jefmari.github.io/keycloak-vue/api/use-keycloak.html)           |
| 🔄 Token Refresh      | Automatic token refresh       | [Example](https://jefmari.github.io/keycloak-vue/examples/token-refresh.html) |
| 🛡️ Protected APIs     | Making authenticated requests | [Example](https://jefmari.github.io/keycloak-vue/examples/protected-api.html) |
| 👥 Role-Based Access  | User roles and permissions    | [Example](https://jefmari.github.io/keycloak-vue/examples/role-based.html)    |
| 🛣️ Router Integration | Vue Router guards             | [Guide](https://jefmari.github.io/keycloak-vue/guide/router-integration.html) |

## 🔗 Links

- **[📖 Documentation](https://jefmari.github.io/keycloak-vue/)** - Complete documentation
- **[📦 NPM Package](https://www.npmjs.com/package/keycloak-vue)** - Package on NPM
- **[🐙 GitHub Repository](https://github.com/JefMari/keycloak-vue)** - Source code
- **[🔐 Keycloak](https://www.keycloak.org/)** - Official Keycloak website
- **[📘 Keycloak JS Adapter](https://www.keycloak.org/securing-apps/javascript-adapter)** - Official JS adapter docs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Released under the [MIT License](LICENSE).
