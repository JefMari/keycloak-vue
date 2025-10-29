import { inject, readonly } from 'vue'
import Keycloak from 'keycloak-js'
import type {
  KeycloakConfig,
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakAccountOptions,
  KeycloakRegisterOptions,
  KeycloakProfile,
  KeycloakCallbacks,
  KeycloakInstance
} from './types'
import {
  createKeycloakState,
  createKeycloakGetters,
  type KeycloakState,
  type KeycloakGetters
} from './states'
import { KEYCLOAK_INJECTION_KEY, DEFAULT_MIN_VALIDITY } from './constants'

/**
 * Global Keycloak state (singleton)
 */
let globalState: KeycloakState | null = null
let globalGetters: KeycloakGetters | null = null

/**
 * Keycloak composable return type
 */
export interface UseKeycloakReturn extends KeycloakState, KeycloakGetters {
  /**
   * Initialize Keycloak
   */
  init: (options?: KeycloakInitOptions) => Promise<boolean>
  /**
   * Login user
   */
  login: (options?: KeycloakLoginOptions) => Promise<void>
  /**
   * Logout user
   */
  logout: (options?: KeycloakLogoutOptions) => Promise<void>
  /**
   * Register new user
   */
  register: (options?: KeycloakRegisterOptions) => Promise<void>
  /**
   * Open account management
   */
  accountManagement: (options?: KeycloakAccountOptions) => Promise<void>
  /**
   * Update token if needed
   */
  updateToken: (minValidity?: number) => Promise<boolean>
  /**
   * Load user profile
   */
  loadUserProfile: () => Promise<KeycloakProfile>
  /**
   * Clear authentication state
   */
  clearToken: () => void
  /**
   * Create login URL
   */
  createLoginUrl: (options?: KeycloakLoginOptions) => Promise<string>
  /**
   * Create logout URL
   */
  createLogoutUrl: (options?: KeycloakLogoutOptions) => Promise<string>
  /**
   * Create register URL
   */
  createRegisterUrl: (options?: KeycloakRegisterOptions) => Promise<string>
  /**
   * Create account URL
   */
  createAccountUrl: (options?: KeycloakAccountOptions) => Promise<string>
}

/**
 * Update state from Keycloak instance
 */
function updateState(state: KeycloakState, instance: KeycloakInstance) {
  state.isAuthenticated.value = instance.authenticated || false
  state.token.value = instance.token
  state.tokenParsed.value = instance.tokenParsed as any
  state.idToken.value = instance.idToken
  state.idTokenParsed.value = instance.idTokenParsed as any
  state.refreshToken.value = instance.refreshToken
  state.refreshTokenParsed.value = instance.refreshTokenParsed as any
  state.subject.value = instance.subject
  state.realmAccess.value = instance.realmAccess as any
  state.resourceAccess.value = instance.resourceAccess as any
  state.timeSkew.value = instance.timeSkew ?? undefined
  state.responseMode.value = instance.responseMode
  state.flow.value = instance.flow
  state.responseType.value = instance.responseType
}

/**
 * Setup Keycloak callbacks
 */
function setupCallbacks(
  instance: KeycloakInstance,
  state: KeycloakState,
  callbacks?: KeycloakCallbacks
) {
  instance.onReady = (authenticated) => {
    state.isReady.value = true
    state.isLoading.value = false
    updateState(state, instance)
    if (callbacks?.onReady && authenticated !== undefined) {
      callbacks.onReady(authenticated)
    }
  }

  instance.onAuthSuccess = () => {
    updateState(state, instance)
    callbacks?.onAuthSuccess?.()
  }

  instance.onAuthError = (error) => {
    state.error.value = new Error(error?.error_description || error?.error || 'Authentication error')
    state.isLoading.value = false
    if (callbacks?.onAuthError && error) {
      callbacks.onAuthError(error)
    }
  }

  instance.onAuthRefreshSuccess = () => {
    updateState(state, instance)
    callbacks?.onAuthRefreshSuccess?.()
  }

  instance.onAuthRefreshError = () => {
    state.isAuthenticated.value = false
    callbacks?.onAuthRefreshError?.()
  }

  instance.onAuthLogout = () => {
    state.isAuthenticated.value = false
    state.profile.value = null
    callbacks?.onAuthLogout?.()
  }

  instance.onTokenExpired = () => {
    callbacks?.onTokenExpired?.()
  }
}

/**
 * Create Keycloak instance
 */
function createKeycloakInstance(config: KeycloakConfig | string): KeycloakInstance {
  if (typeof config === 'string') {
    return new Keycloak(config)
  }
  return new Keycloak(config)
}

/**
 * Initialize Keycloak with provided config
 */
export function initKeycloak(
  config: KeycloakConfig | string,
  callbacks?: KeycloakCallbacks
): UseKeycloakReturn {
  if (!globalState) {
    globalState = createKeycloakState()
    globalGetters = createKeycloakGetters(globalState)
  }

  const state = globalState
  const getters = globalGetters!

  // Create instance if not exists
  if (!state.instance.value) {
    state.instance.value = createKeycloakInstance(config)
    setupCallbacks(state.instance.value, state, callbacks)
  }

  const init = async (options?: KeycloakInitOptions): Promise<boolean> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }

    try {
      state.isLoading.value = true
      state.error.value = null
      const authenticated = await state.instance.value.init(options || {})
      updateState(state, state.instance.value)
      return authenticated
    } catch (error) {
      state.error.value = error instanceof Error ? error : new Error(String(error))
      throw error
    } finally {
      state.isLoading.value = false
    }
  }

  const login = async (options?: KeycloakLoginOptions): Promise<void> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    await state.instance.value.login(options as any)
  }

  const logout = async (options?: KeycloakLogoutOptions): Promise<void> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    await state.instance.value.logout(options)
  }

  const register = async (options?: KeycloakRegisterOptions): Promise<void> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    await state.instance.value.register(options as any)
  }

  const accountManagement = async (_options?: KeycloakAccountOptions): Promise<void> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    await state.instance.value.accountManagement()
  }

  const updateToken = async (minValidity: number = DEFAULT_MIN_VALIDITY): Promise<boolean> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }

    try {
      const refreshed = await state.instance.value.updateToken(minValidity)
      if (refreshed) {
        updateState(state, state.instance.value)
      }
      return refreshed
    } catch (error) {
      state.error.value = error instanceof Error ? error : new Error(String(error))
      throw error
    }
  }

  const loadUserProfile = async (): Promise<KeycloakProfile> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }

    try {
      const profile = await state.instance.value.loadUserProfile()
      state.profile.value = profile
      return profile
    } catch (error) {
      state.error.value = error instanceof Error ? error : new Error(String(error))
      throw error
    }
  }

  const clearToken = (): void => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    state.instance.value.clearToken()
    updateState(state, state.instance.value)
  }

  const createLoginUrl = async (options?: KeycloakLoginOptions): Promise<string> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    return state.instance.value.createLoginUrl(options as any)
  }

  const createLogoutUrl = async (options?: KeycloakLogoutOptions): Promise<string> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    return state.instance.value.createLogoutUrl(options as any)
  }

  const createRegisterUrl = async (options?: KeycloakRegisterOptions): Promise<string> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    return state.instance.value.createRegisterUrl(options as any)
  }

  const createAccountUrl = async (options?: KeycloakAccountOptions): Promise<string> => {
    if (!state.instance.value) {
      throw new Error('Keycloak instance not initialized')
    }
    return state.instance.value.createAccountUrl(options)
  }

  return {
    // State
    instance: readonly(state.instance) as typeof state.instance,
    isAuthenticated: readonly(state.isAuthenticated),
    isReady: readonly(state.isReady),
    token: readonly(state.token),
    tokenParsed: readonly(state.tokenParsed) as typeof state.tokenParsed,
    idToken: readonly(state.idToken),
    idTokenParsed: readonly(state.idTokenParsed) as typeof state.idTokenParsed,
    refreshToken: readonly(state.refreshToken),
    refreshTokenParsed: readonly(state.refreshTokenParsed) as typeof state.refreshTokenParsed,
    subject: readonly(state.subject),
    profile: readonly(state.profile),
    realmAccess: readonly(state.realmAccess) as typeof state.realmAccess,
    resourceAccess: readonly(state.resourceAccess) as typeof state.resourceAccess,
    timeSkew: readonly(state.timeSkew),
    responseMode: readonly(state.responseMode),
    flow: readonly(state.flow),
    adapter: readonly(state.adapter),
    responseType: readonly(state.responseType),
    isLoading: readonly(state.isLoading),
    error: readonly(state.error),
    // Getters
    ...getters,
    // Methods
    init,
    login,
    logout,
    register,
    accountManagement,
    updateToken,
    loadUserProfile,
    clearToken,
    createLoginUrl,
    createLogoutUrl,
    createRegisterUrl,
    createAccountUrl
  }
}

/**
 * Use Keycloak composable
 */
export function useKeycloak(): UseKeycloakReturn {
  const keycloak = inject<UseKeycloakReturn>(KEYCLOAK_INJECTION_KEY)
  if (!keycloak) {
    throw new Error(
      'Keycloak not initialized. Make sure to install the plugin with app.use(createKeycloakPlugin(config))'
    )
  }
  return keycloak
}
