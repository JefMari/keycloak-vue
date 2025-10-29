/**
 * OnLoad strategies for Keycloak initialization
 */
export const KeycloakOnLoad = {
  /**
   * Authenticate the client if the user is logged-in to Keycloak or display the login page if not.
   */
  LOGIN_REQUIRED: 'login-required',
  /**
   * Only authenticate the client if the user is already logged-in, if not authenticated, the browser is redirected back to the application and remains unauthenticated.
   */
  CHECK_SSO: 'check-sso'
} as const

export type KeycloakOnLoad = typeof KeycloakOnLoad[keyof typeof KeycloakOnLoad]

/**
 * OpenID Connect flow types
 */
export const KeycloakFlow = {
  /**
   * Standard Authorization Code flow
   */
  STANDARD: 'standard',
  /**
   * Implicit flow - access token is sent immediately after successful authentication
   */
  IMPLICIT: 'implicit',
  /**
   * Hybrid flow - combines aspects of standard and implicit flows
   */
  HYBRID: 'hybrid'
} as const

export type KeycloakFlow = typeof KeycloakFlow[keyof typeof KeycloakFlow]

/**
 * OpenID Connect response mode
 */
export const KeycloakResponseMode = {
  /**
   * OpenID Connect parameters are added in URL query string
   */
  QUERY: 'query',
  /**
   * OpenID Connect parameters are added in URL fragment (safer and recommended)
   */
  FRAGMENT: 'fragment'
} as const

export type KeycloakResponseMode = typeof KeycloakResponseMode[keyof typeof KeycloakResponseMode]

/**
 * Response type for OAuth2/OIDC
 */
export const KeycloakResponseType = {
  /**
   * Authorization code response type
   */
  CODE: 'code',
  /**
   * ID token response type
   */
  ID_TOKEN: 'id_token',
  /**
   * Access token response type
   */
  TOKEN: 'token',
  /**
   * Code and ID token response type
   */
  CODE_ID_TOKEN: 'code id_token',
  /**
   * Code and token response type
   */
  CODE_TOKEN: 'code token',
  /**
   * ID token and token response type
   */
  ID_TOKEN_TOKEN: 'id_token token',
  /**
   * Code, ID token, and token response type
   */
  CODE_ID_TOKEN_TOKEN: 'code id_token token'
} as const

export type KeycloakResponseType = typeof KeycloakResponseType[keyof typeof KeycloakResponseType]

/**
 * PKCE (Proof Key for Code Exchange) method
 */
export const KeycloakPkceMethod = {
  /**
   * SHA256-based PKCE method (recommended)
   */
  S256: 'S256'
} as const

export type KeycloakPkceMethod = typeof KeycloakPkceMethod[keyof typeof KeycloakPkceMethod]

/**
 * Keycloak adapter types
 */
export const KeycloakAdapterType = {
  /**
   * Default browser adapter
   */
  DEFAULT: 'default',
  /**
   * Cordova InAppBrowser adapter
   */
  CORDOVA: 'cordova',
  /**
   * Cordova native browser adapter
   */
  CORDOVA_NATIVE: 'cordova-native'
} as const

export type KeycloakAdapterType = typeof KeycloakAdapterType[keyof typeof KeycloakAdapterType]

/**
 * Login prompt options
 */
export const KeycloakPrompt = {
  /**
   * The Authorization Server MUST NOT display any authentication or consent user interface pages
   */
  NONE: 'none',
  /**
   * The Authorization Server SHOULD prompt the End-User for reauthentication
   */
  LOGIN: 'login',
  /**
   * The Authorization Server SHOULD prompt the End-User for consent before returning information to the Client
   */
  CONSENT: 'consent',
  /**
   * The Authorization Server SHOULD prompt the End-User to select a user account
   */
  SELECT_ACCOUNT: 'select_account'
} as const

export type KeycloakPrompt = typeof KeycloakPrompt[keyof typeof KeycloakPrompt]

/**
 * Keycloak action types
 */
export const KeycloakAction = {
  /**
   * Redirect to registration page
   */
  REGISTER: 'register',
  /**
   * Update password action
   */
  UPDATE_PASSWORD: 'UPDATE_PASSWORD',
  /**
   * Update profile action
   */
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  /**
   * Configure TOTP action
   */
  CONFIGURE_TOTP: 'CONFIGURE_TOTP',
  /**
   * Verify email action
   */
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  /**
   * Update email action
   */
  UPDATE_EMAIL: 'UPDATE_EMAIL'
} as const

export type KeycloakAction = typeof KeycloakAction[keyof typeof KeycloakAction]
