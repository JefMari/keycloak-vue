import type { KeycloakInitOptions } from './types'

/**
 * Default Keycloak initialization options
 */
export const DEFAULT_INIT_OPTIONS: Partial<KeycloakInitOptions> = {
  useNonce: true,
  checkLoginIframe: true,
  checkLoginIframeInterval: 5,
  responseMode: 'fragment',
  flow: 'standard',
  pkceMethod: 'S256',
  silentCheckSsoFallback: true,
  enableLogging: false,
  messageReceiveTimeout: 10000,
  adapter: 'default'
} as const

/**
 * Default minimum token validity in seconds
 */
export const DEFAULT_MIN_VALIDITY = 5

/**
 * Default token update minimum validity in seconds
 */
export const DEFAULT_TOKEN_MIN_VALIDITY = 30

/**
 * Keycloak token storage keys (if needed for custom implementations)
 */
export const KEYCLOAK_STORAGE_KEYS = {
  TOKEN: 'kc_token',
  REFRESH_TOKEN: 'kc_refresh_token',
  ID_TOKEN: 'kc_id_token'
} as const

/**
 * Keycloak event names
 */
export const KEYCLOAK_EVENT_TYPES = {
  READY: 'onReady',
  AUTH_SUCCESS: 'onAuthSuccess',
  AUTH_ERROR: 'onAuthError',
  AUTH_REFRESH_SUCCESS: 'onAuthRefreshSuccess',
  AUTH_REFRESH_ERROR: 'onAuthRefreshError',
  AUTH_LOGOUT: 'onAuthLogout',
  TOKEN_EXPIRED: 'onTokenExpired'
} as const

/**
 * Default scopes for OpenID Connect
 */
export const DEFAULT_SCOPE = 'openid'

/**
 * Keycloak URL endpoints (relative to realm)
 */
export const KEYCLOAK_ENDPOINTS = {
  LOGIN: '/protocol/openid-connect/auth',
  LOGOUT: '/protocol/openid-connect/logout',
  TOKEN: '/protocol/openid-connect/token',
  USERINFO: '/protocol/openid-connect/userinfo',
  REGISTER: '/protocol/openid-connect/registrations',
  ACCOUNT: '/account'
} as const

/**
 * HTTP headers for Keycloak requests
 */
export const KEYCLOAK_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept'
} as const

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_URLENCODED: 'application/x-www-form-urlencoded'
} as const

/**
 * Common HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const

/**
 * Keycloak plugin injection key
 */
export const KEYCLOAK_INJECTION_KEY = Symbol('keycloak')
