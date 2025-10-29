# Enums

Enumeration constants for Keycloak configuration.

## KeycloakOnLoad

Specifies the initial authentication behavior.

```typescript
enum KeycloakOnLoad {
  LOGIN_REQUIRED = 'login-required',
  CHECK_SSO = 'check-sso'
}
```

### Values

**`LOGIN_REQUIRED`**
- Redirect to login page if not authenticated
- User must authenticate before accessing the application

**`CHECK_SSO`**
- Check SSO status without forcing login
- Silent authentication check

### Usage

```typescript
import { KeycloakOnLoad, createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    onLoad: KeycloakOnLoad.CHECK_SSO
  }
}))
```

## KeycloakFlow

OAuth2 flow type.

```typescript
enum KeycloakFlow {
  STANDARD = 'standard',
  IMPLICIT = 'implicit',
  HYBRID = 'hybrid'
}
```

### Values

**`STANDARD`** (Recommended)
- Authorization Code Flow
- Most secure option
- Requires client secret (public clients use PKCE)

**`IMPLICIT`** (Deprecated)
- Implicit Flow
- Less secure, tokens in URL
- Not recommended for new applications

**`HYBRID`**
- Hybrid Flow
- Combination of standard and implicit

### Usage

```typescript
import { KeycloakFlow, createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    flow: KeycloakFlow.STANDARD
  }
}))
```

## KeycloakResponseMode

How authentication responses are returned.

```typescript
enum KeycloakResponseMode {
  QUERY = 'query',
  FRAGMENT = 'fragment'
}
```

### Values

**`QUERY`**
- Tokens in query string
- `?code=xxx&state=yyy`

**`FRAGMENT`** (Recommended)
- Tokens in URL fragment
- `#code=xxx&state=yyy`
- More secure as fragments aren't sent to server

### Usage

```typescript
import { KeycloakResponseMode, createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    responseMode: KeycloakResponseMode.FRAGMENT
  }
}))
```

## KeycloakPkceMethod

PKCE (Proof Key for Code Exchange) method.

```typescript
enum KeycloakPkceMethod {
  S256 = 'S256'
}
```

### Values

**`S256`** (Recommended)
- SHA-256 hash method
- Enhanced security for public clients
- Prevents authorization code interception

### Usage

```typescript
import { KeycloakPkceMethod, createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    pkceMethod: KeycloakPkceMethod.S256
  }
}))
```

## KeycloakAdapterType

Adapter type for different platforms.

```typescript
enum KeycloakAdapterType {
  DEFAULT = 'default',
  CORDOVA = 'cordova',
  CORDOVA_NATIVE = 'cordova-native'
}
```

### Values

**`DEFAULT`**
- Standard web browser adapter
- For web applications

**`CORDOVA`**
- Apache Cordova adapter
- For hybrid mobile apps

**`CORDOVA_NATIVE`**
- Native Cordova adapter
- Uses in-app browser

### Usage

```typescript
import { KeycloakAdapterType, createKeycloakPlugin } from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: { /* ... */ },
  initOptions: {
    adapter: KeycloakAdapterType.DEFAULT
  }
}))
```

## KeycloakPrompt

Login prompt behavior.

```typescript
enum KeycloakPrompt {
  NONE = 'none',
  LOGIN = 'login',
  CONSENT = 'consent',
  SELECT_ACCOUNT = 'select_account'
}
```

### Values

**`NONE`**
- No prompts
- Silent authentication

**`LOGIN`**
- Always show login page
- Force re-authentication

**`CONSENT`**
- Show consent screen
- Request user permission

**`SELECT_ACCOUNT`**
- Show account selection
- Choose between multiple accounts

### Usage

```typescript
import { KeycloakPrompt, useKeycloak } from 'keycloak-vue'

const { login } = useKeycloak()

login({
  prompt: KeycloakPrompt.LOGIN
})
```

## KeycloakAction

Login action type.

```typescript
enum KeycloakAction {
  REGISTER = 'register'
}
```

### Values

**`REGISTER`**
- Show registration page
- New user signup

### Usage

```typescript
import { KeycloakAction, useKeycloak } from 'keycloak-vue'

const { login } = useKeycloak()

login({
  action: KeycloakAction.REGISTER
})
```

## Complete Examples

### Secure Production Setup

```typescript
import {
  createKeycloakPlugin,
  KeycloakOnLoad,
  KeycloakFlow,
  KeycloakResponseMode,
  KeycloakPkceMethod
} from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: {
    url: 'https://keycloak.example.com',
    realm: 'production',
    clientId: 'prod-app'
  },
  initOptions: {
    onLoad: KeycloakOnLoad.CHECK_SSO,
    flow: KeycloakFlow.STANDARD,
    responseMode: KeycloakResponseMode.FRAGMENT,
    pkceMethod: KeycloakPkceMethod.S256
  }
}))
```

### Development Setup

```typescript
import {
  createKeycloakPlugin,
  KeycloakOnLoad,
  KeycloakFlow
} from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: {
    url: 'http://localhost:8080',
    realm: 'dev',
    clientId: 'dev-app'
  },
  initOptions: {
    onLoad: KeycloakOnLoad.CHECK_SSO,
    flow: KeycloakFlow.STANDARD,
    enableLogging: true
  }
}))
```

### Login with Options

```typescript
import { useKeycloak, KeycloakPrompt, KeycloakAction } from 'keycloak-vue'

const { login } = useKeycloak()

// Force login
const forceLogin = () => {
  login({ prompt: KeycloakPrompt.LOGIN })
}

// Show registration
const register = () => {
  login({ action: KeycloakAction.REGISTER })
}

// Select account
const selectAccount = () => {
  login({ prompt: KeycloakPrompt.SELECT_ACCOUNT })
}
```

### Mobile App Setup

```typescript
import {
  createKeycloakPlugin,
  KeycloakAdapterType,
  KeycloakOnLoad
} from 'keycloak-vue'

app.use(createKeycloakPlugin({
  config: {
    url: 'https://keycloak.example.com',
    realm: 'mobile',
    clientId: 'mobile-app'
  },
  initOptions: {
    onLoad: KeycloakOnLoad.CHECK_SSO,
    adapter: KeycloakAdapterType.CORDOVA
  }
}))
```

## Best Practices

1. **Use Standard Flow** - `KeycloakFlow.STANDARD` for new applications
2. **Enable PKCE** - Always use `KeycloakPkceMethod.S256`
3. **Fragment Mode** - Use `KeycloakResponseMode.FRAGMENT` for security
4. **Check SSO First** - Start with `KeycloakOnLoad.CHECK_SSO`
5. **Type Safety** - Import enums for type-safe configuration

## Next Steps

- Review [Types](/api/types)
- Check [Constants](/api/constants)
- Explore [Examples](/examples/)
