# Installation

## Package Manager

Install KeycloakVue using your preferred package manager:

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

::: tip
Both `keycloak-vue` and `keycloak-js` are required. The official Keycloak JavaScript adapter is a peer dependency.
:::

## Requirements

- **Vue**: 3.5 or higher
- **Node.js**: 16 or higher (recommended)
- **TypeScript**: 4.5 or higher (optional, but recommended)

## Browser Support

KeycloakVue supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

::: warning IE11 Not Supported
Internet Explorer 11 is not supported as Vue 3 requires modern JavaScript features.
:::

## TypeScript

KeycloakVue is written in TypeScript and includes complete type definitions. No additional `@types` packages are needed.

```typescript
import type { UseKeycloakReturn, KeycloakConfig } from 'keycloak-vue'
```

## CDN

While not recommended for production, you can use KeycloakVue via CDN:

```html
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/keycloak-js/dist/keycloak.min.js"></script>
<script src="https://unpkg.com/keycloak-vue"></script>
```

## Next Steps

Once installed, proceed to [Plugin Setup](/guide/plugin-setup) to configure Keycloak in your application.
