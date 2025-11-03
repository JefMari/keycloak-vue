---
title: Keycloak Config
description: Configure connection settings to your Keycloak server including URL, realm, and client ID
outline: deep
---

# Keycloak Config

The Keycloak configuration defines the connection to your Keycloak server.

## Interface

```typescript
interface KeycloakConfig {
  url: string        // Keycloak server URL
  realm: string      // Realm name
  clientId: string   // Client ID
}
```

## Properties

### url

- **Type:** `string`
- **Required:** Yes

The base URL of your Keycloak server.

**Examples:**
```typescript
// Development
url: 'http://localhost:8080'

// Production
url: 'https://keycloak.example.com'

// With path
url: 'https://auth.example.com/auth'
```

### realm

- **Type:** `string`
- **Required:** Yes

The name of the Keycloak realm to use for authentication.

**Example:**
```typescript
realm: 'my-application-realm'
```

### clientId

- **Type:** `string`
- **Required:** Yes

The client ID configured in Keycloak for your application.

**Example:**
```typescript
clientId: 'vue-app'
```

## Complete Example

```typescript
import { createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'my-realm',
    clientId: 'my-app'
  }
}))
```

## Environment Variables

It's recommended to use environment variables for configuration:

```typescript
// .env.development
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=dev-realm
VITE_KEYCLOAK_CLIENT_ID=dev-client

// .env.production
VITE_KEYCLOAK_URL=https://keycloak.example.com
VITE_KEYCLOAK_REALM=prod-realm
VITE_KEYCLOAK_CLIENT_ID=prod-client
```

```typescript
// main.ts
app.use(createKeycloakPlugin({
  config: {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  }
}))
```

## Common Configurations

### Local Development

```typescript
config: {
  url: 'http://localhost:8080',
  realm: 'master',
  clientId: 'vue-app'
}
```

### Docker Compose

```typescript
config: {
  url: 'http://keycloak:8080',
  realm: 'my-realm',
  clientId: 'my-app'
}
```

### Production

```typescript
config: {
  url: 'https://auth.mycompany.com',
  realm: 'production',
  clientId: 'prod-app'
}
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your Keycloak client is configured with:
- Valid redirect URIs
- Web origins set correctly

### Connection Refused

Check that:
- Keycloak server is running
- URL is correct and accessible
- No firewall blocking the connection

### Realm Not Found

Verify that:
- Realm name matches exactly (case-sensitive)
- Realm is enabled in Keycloak admin console

## Next Steps

- Configure [Init Options](/guide/init-options)
- Set up [Callbacks](/guide/callbacks)
- Learn about the [Composable](/guide/composable)
