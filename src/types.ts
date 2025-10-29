import type Keycloak from 'keycloak-js'

/**
 * Keycloak configuration object
 */
export interface KeycloakConfig {
  /**
   * URL to the Keycloak server, for example: http://keycloak-server/auth
   */
  url: string
  /**
   * Name of the realm, for example: 'myrealm'
   */
  realm: string
  /**
   * Client identifier, for example: 'myapp'
   */
  clientId: string
}

/**
 * Keycloak initialization options
 */
export interface KeycloakInitOptions {
  /**
   * Adds a cryptographic nonce to verify that the authentication response matches the request.
   * @default true
   */
  useNonce?: boolean
  /**
   * Specifies an action to do on load.
   */
  onLoad?: 'login-required' | 'check-sso'
  /**
   * Set an initial value for the token.
   */
  token?: string
  /**
   * Set an initial value for the refresh token.
   */
  refreshToken?: string
  /**
   * Set an initial value for the id token (only together with token or refreshToken).
   */
  idToken?: string
  /**
   * Set an initial value for skew between local time and Keycloak server in seconds.
   */
  timeSkew?: number
  /**
   * Set to enable/disable monitoring login state.
   * @default true
   */
  checkLoginIframe?: boolean
  /**
   * Set the interval to check login state (in seconds).
   * @default 5
   */
  checkLoginIframeInterval?: number
  /**
   * Set the OpenID Connect response mode to send to Keycloak server at login request.
   * Valid values are query or fragment.
   * @default 'fragment'
   */
  responseMode?: 'query' | 'fragment'
  /**
   * Set the OpenID Connect flow.
   * @default 'standard'
   */
  flow?: 'standard' | 'implicit' | 'hybrid'
  /**
   * Configures the Proof Key for Code Exchange (PKCE) method to use.
   * @default 'S256'
   */
  pkceMethod?: 'S256' | false
  /**
   * Specifies a default uri to redirect to after login or logout.
   */
  redirectUri?: string
  /**
   * Specifies an uri to redirect to after silent check-sso.
   */
  silentCheckSsoRedirectUri?: string
  /**
   * Enables fall back to regular check-sso when silent check-sso is not supported by the browser.
   * @default true
   */
  silentCheckSsoFallback?: boolean
  /**
   * Set the OpenID Connect scope parameter.
   */
  scope?: string
  /**
   * Enables logging messages from Keycloak to the console.
   * @default false
   */
  enableLogging?: boolean
  /**
   * Set a timeout in milliseconds for waiting for message responses from the Keycloak server.
   * @default 10000
   */
  messageReceiveTimeout?: number
  /**
   * Sets the 'ui_locales' query param in compliance with section 3.1.2.1 of the OIDC 1.0 specification.
   */
  locale?: string
  /**
   * Allows you to override the way that redirects and other browser-related functions will be handled.
   */
  adapter?: 'default' | 'cordova' | 'cordova-native' | KeycloakAdapter | any
}

/**
 * Keycloak login options
 */
export interface KeycloakLoginOptions {
  /**
   * Specifies the uri to redirect to after login.
   */
  redirectUri?: string
  /**
   * By default the login screen is displayed if the user is not logged-in to Keycloak.
   * To only authenticate to the application if the user is already logged-in and not display the
   * login page if the user is not logged-in, set this option to `'none'`. To always require
   * re-authentication and ignore SSO, set this option to `'login'`.
   */
  prompt?: 'none' | 'login' | 'consent' | 'select_account'
  /**
   * If value is 'register' then user is redirected to registration page, otherwise to login page.
   */
  action?: 'register' | string
  /**
   * Used to pre-fill the username/email field on the login form.
   */
  loginHint?: string
  /**
   * Used to tell Keycloak which IDP the user wants to authenticate with.
   */
  idpHint?: string
  /**
   * Sets the 'ui_locales' query param in compliance with section 3.1.2.1 of the OIDC 1.0 specification.
   */
  locale?: string
  /**
   * Specifies the desired Keycloak locale for the UI.
   */
  kcLocale?: string
  /**
   * Used to tell Keycloak to skip showing the login page and automatically redirect to the specified identity provider instead.
   */
  scope?: string
  /**
   * Specifies maximum time since the authentication of user happened.
   */
  maxAge?: number
  /**
   * Override the scope configured in init.
   */
  acrValues?: string
  /**
   * Contains the information about acr claim.
   */
  acr?: {
    values: string[]
    essential: boolean
  }
  /**
   * Specifies arguments that are passed to the Cordova in-app-browser.
   */
  cordovaOptions?: Record<string, string>
}

/**
 * Keycloak logout options
 */
export interface KeycloakLogoutOptions {
  /**
   * Specifies the uri to redirect to after logout.
   */
  redirectUri?: string
}

/**
 * Keycloak account options
 */
export interface KeycloakAccountOptions {
  /**
   * Specifies the uri to redirect to when redirecting back to the application.
   */
  redirectUri?: string
}

/**
 * Keycloak register options
 */
export interface KeycloakRegisterOptions extends KeycloakLoginOptions {
  action?: 'register'
}

/**
 * Keycloak adapter interface for custom adapters
 */
export interface KeycloakAdapter {
  login(options?: KeycloakLoginOptions): Promise<void>
  logout(options?: KeycloakLogoutOptions): Promise<void>
  register(options?: KeycloakRegisterOptions): Promise<void>
  accountManagement(): Promise<void>
  redirectUri(options: { redirectUri: string }, encodeHash: boolean): string
}

/**
 * Parsed token structure
 */
export interface KeycloakTokenParsed {
  exp?: number
  iat?: number
  nonce?: string
  sub?: string
  session_state?: string
  realm_access?: KeycloakRoles
  resource_access?: Record<string, KeycloakRoles>
  [key: string]: any
}

/**
 * Keycloak roles structure
 */
export interface KeycloakRoles {
  roles: string[]
}

/**
 * Keycloak user profile
 */
export interface KeycloakProfile {
  id?: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  emailVerified?: boolean
  totp?: boolean
  createdTimestamp?: number
  [key: string]: any
}

/**
 * Keycloak error
 */
export interface KeycloakError {
  error: string
  error_description: string
}

/**
 * Keycloak instance type
 */
export type KeycloakInstance = Keycloak

/**
 * Keycloak callback events
 */
export interface KeycloakCallbacks {
  /**
   * Called when the adapter is initialized.
   */
  onReady?: (authenticated: boolean) => void
  /**
   * Called when a user is successfully authenticated.
   */
  onAuthSuccess?: () => void
  /**
   * Called if there was an error during authentication.
   */
  onAuthError?: (error: KeycloakError) => void
  /**
   * Called when the token is refreshed.
   */
  onAuthRefreshSuccess?: () => void
  /**
   * Called if there was an error while trying to refresh the token.
   */
  onAuthRefreshError?: () => void
  /**
   * Called if the user is logged out.
   */
  onAuthLogout?: () => void
  /**
   * Called when the access token is expired.
   */
  onTokenExpired?: () => void
}

/**
 * Keycloak resource access
 */
export interface KeycloakResourceAccess {
  [key: string]: KeycloakRoles
}

/**
 * Keycloak realm access
 */
export interface KeycloakRealmAccess extends KeycloakRoles {}
