---
title: Init Options
description: Configure Keycloak initialization options including authentication flows, token handling, and security settings
outline: deep
---

# Init Options

Configure how Keycloak initializes and authenticates users in your application.

## Interface

```typescript
interface KeycloakInitOptions {
  useNonce?: boolean
  onLoad?: 'login-required' | 'check-sso'
  token?: string
  refreshToken?: string
  idToken?: string
  timeSkew?: number
  checkLoginIframe?: boolean
  checkLoginIframeInterval?: number
  responseMode?: 'query' | 'fragment'
  flow?: 'standard' | 'implicit' | 'hybrid'
  pkceMethod?: 'S256' | false
  redirectUri?: string
  silentCheckSsoRedirectUri?: string
  silentCheckSsoFallback?: boolean
  scope?: string
  enableLogging?: boolean
  messageReceiveTimeout?: number
  locale?: string
  adapter?: 'default' | 'cordova' | 'cordova-native' | KeycloakAdapter
}
```

## Common Options

### onLoad

- **Type:** `'login-required' | 'check-sso'`
- **Default:** `undefined`

Specifies the initial authentication behavior.

**`'login-required'`** - Redirect to login if not authenticated:
```typescript
initOptions: {
  onLoad: 'login-required'
}
```

**`'check-sso'`** - Check authentication status without forcing login:
```typescript
initOptions: {
  onLoad: 'check-sso'
}
```

### checkLoginIframe

- **Type:** `boolean`
- **Default:** `true`

Enable/disable login status checking via iframe.

```typescript
initOptions: {
  checkLoginIframe: false  // Disable for better performance
}
```

::: tip
Disable `checkLoginIframe` if you're handling token refresh manually or experiencing performance issues.
:::

### redirectUri

- **Type:** `string`
- **Default:** Current URL

URL to redirect to after authentication.

```typescript
initOptions: {
  redirectUri: 'http://localhost:3000/dashboard'
}
```

### silentCheckSsoRedirectUri

- **Type:** `string`
- **Default:** `undefined`

URL for silent SSO checks. Requires a special HTML page.

```typescript
initOptions: {
  onLoad: 'check-sso',
  silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
}
```

Create `public/silent-check-sso.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Silent Check SSO</title>
</head>
<body>
  <script>
    parent.postMessage(location.href, location.origin)
  </script>
</body>
</html>
```

## Security Options

### pkceMethod

- **Type:** `'S256' | false`
- **Default:** `'S256'`

PKCE (Proof Key for Code Exchange) method for enhanced security.

```typescript
initOptions: {
  pkceMethod: 'S256'  // Recommended
}
```

### flow

- **Type:** `'standard' | 'implicit' | 'hybrid'`
- **Default:** `'standard'`

OAuth2 flow to use.

```typescript
initOptions: {
  flow: 'standard'  // Recommended for most applications
}
```

::: warning
The `implicit` flow is deprecated and should not be used for new applications.
:::

### responseMode

- **Type:** `'query' | 'fragment'`
- **Default:** `'fragment'`

How authentication responses are returned.

```typescript
initOptions: {
  responseMode: 'fragment'  // More secure
}
```

## Token Options

### token

- **Type:** `string`
- **Default:** `undefined`

Initialize with an existing token.

```typescript
initOptions: {
  token: 'existing-token',
  refreshToken: 'existing-refresh-token'
}
```

### timeSkew

- **Type:** `number`
- **Default:** `0`

Time difference (in seconds) between client and server.

```typescript
initOptions: {
  timeSkew: 0
}
```

## UI Options

### locale

- **Type:** `string`
- **Default:** Browser default

Set the language for Keycloak UI.

```typescript
initOptions: {
  locale: 'en'  // 'fr', 'de', 'es', etc.
}
```

### scope

- **Type:** `string`
- **Default:** `'openid'`

OAuth2 scopes to request.

```typescript
initOptions: {
  scope: 'openid profile email'
}
```

## Advanced Options

### checkLoginIframeInterval

- **Type:** `number`
- **Default:** `5`

Interval (in seconds) to check login status via iframe.

```typescript
initOptions: {
  checkLoginIframe: true,
  checkLoginIframeInterval: 5  // Check every 5 seconds
}
```

### enableLogging

- **Type:** `boolean`
- **Default:** `false`

Enable Keycloak adapter logging.

```typescript
initOptions: {
  enableLogging: true  // Useful for debugging
}
```

### messageReceiveTimeout

- **Type:** `number`
- **Default:** `10000`

Timeout (in milliseconds) for iframe messages.

```typescript
initOptions: {
  messageReceiveTimeout: 10000
}
```

### adapter

- **Type:** `'default' | 'cordova' | 'cordova-native' | KeycloakAdapter`
- **Default:** `'default'`

Adapter type for different platforms.

```typescript
// For Cordova apps
initOptions: {
  adapter: 'cordova'
}
```

## Complete Examples

### Production App

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'https://keycloak.example.com',
    realm: 'production',
    clientId: 'prod-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    flow: 'standard',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
  }
}))
```

### Development App

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'dev',
    clientId: 'dev-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: false,
    enableLogging: true
  }
}))
```

### Secure Public App

```typescript
app.use(createKeycloakPlugin({
  config: {
    url: 'https://auth.example.com',
    realm: 'public',
    clientId: 'public-app'
  },
  initOptions: {
    onLoad: 'check-sso',
    checkLoginIframe: true,
    checkLoginIframeInterval: 10,
    pkceMethod: 'S256',
    responseMode: 'fragment',
    scope: 'openid profile email'
  }
}))
```

## Best Practices

1. **Use PKCE** - Always enable `pkceMethod: 'S256'` for security
2. **Standard Flow** - Use `flow: 'standard'` for new applications
3. **Disable iframe** - Set `checkLoginIframe: false` for better performance
4. **Silent SSO** - Use `silentCheckSsoRedirectUri` for seamless authentication
5. **Environment-specific** - Use different options for dev/prod

## Next Steps

- Configure [Callbacks](/guide/callbacks)
- Learn about [Token Management](/examples/token-refresh)
- Explore [Protected API Calls](/examples/protected-api)
