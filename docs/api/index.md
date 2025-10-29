# API Reference

## Overview

KeycloakVue provides a comprehensive API for integrating Keycloak authentication into Vue 3 applications.

## Main Exports

### Functions

- [`createKeycloakPlugin()`](/api/use-keycloak#createkeycloakplugin) - Create Vue plugin
- [`initKeycloak()`](/api/use-keycloak#initkeycloak) - Initialize Keycloak manually
- [`useKeycloak()`](/api/use-keycloak) - Main composable

### Types

See [Types](/api/types) for complete type definitions including:

- `KeycloakConfig`
- `KeycloakInitOptions`
- `KeycloakLoginOptions`
- `KeycloakLogoutOptions`
- `KeycloakTokenParsed`
- `KeycloakProfile`
- And many more...

### Enums

See [Enums](/api/enums) for all available enums:

- `KeycloakOnLoad`
- `KeycloakFlow`
- `KeycloakResponseMode`
- `KeycloakPkceMethod`
- `KeycloakAdapterType`
- `KeycloakPrompt`
- `KeycloakAction`

### Constants

See [Constants](/api/constants) for default values and injection keys:

- `DEFAULT_INIT_OPTIONS`
- `DEFAULT_MIN_VALIDITY`
- `KEYCLOAK_INJECTION_KEY`

## Quick Reference

```typescript
import {
  // Main functions
  createKeycloakPlugin,
  initKeycloak,
  useKeycloak,
  
  // Types
  type KeycloakConfig,
  type KeycloakInitOptions,
  type UseKeycloakReturn,
  
  // Enums
  KeycloakOnLoad,
  KeycloakFlow,
  
  // Constants
  DEFAULT_INIT_OPTIONS,
  KEYCLOAK_INJECTION_KEY
} from 'keycloak-vue'
```
