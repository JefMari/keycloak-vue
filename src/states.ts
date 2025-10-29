import { ref, computed, shallowRef, type Ref, type ComputedRef } from 'vue'
import type {
  KeycloakInstance,
  KeycloakProfile,
  KeycloakTokenParsed,
  KeycloakResourceAccess,
  KeycloakRealmAccess
} from './types'

/**
 * Keycloak reactive state
 */
export interface KeycloakState {
  /**
   * Keycloak instance (shallow ref for performance)
   */
  instance: Ref<KeycloakInstance | null>
  /**
   * Is the user authenticated
   */
  isAuthenticated: Ref<boolean>
  /**
   * Is Keycloak initialized
   */
  isReady: Ref<boolean>
  /**
   * Current access token
   */
  token: Ref<string | undefined>
  /**
   * Parsed access token
   */
  tokenParsed: Ref<KeycloakTokenParsed | undefined>
  /**
   * Current ID token
   */
  idToken: Ref<string | undefined>
  /**
   * Parsed ID token
   */
  idTokenParsed: Ref<KeycloakTokenParsed | undefined>
  /**
   * Current refresh token
   */
  refreshToken: Ref<string | undefined>
  /**
   * Parsed refresh token
   */
  refreshTokenParsed: Ref<KeycloakTokenParsed | undefined>
  /**
   * User subject (user ID)
   */
  subject: Ref<string | undefined>
  /**
   * User profile
   */
  profile: Ref<KeycloakProfile | null>
  /**
   * Realm roles
   */
  realmAccess: Ref<KeycloakRealmAccess | undefined>
  /**
   * Resource roles
   */
  resourceAccess: Ref<KeycloakResourceAccess | undefined>
  /**
   * Time skew between browser and Keycloak server
   */
  timeSkew: Ref<number | undefined>
  /**
   * Response mode used
   */
  responseMode: Ref<string | undefined>
  /**
   * Flow used
   */
  flow: Ref<string | undefined>
  /**
   * Adapter type used
   */
  adapter: Ref<string | undefined>
  /**
   * Response type used
   */
  responseType: Ref<string | undefined>
  /**
   * Is loading (during initialization or token refresh)
   */
  isLoading: Ref<boolean>
  /**
   * Last error that occurred
   */
  error: Ref<Error | null>
}

/**
 * Create Keycloak reactive state
 */
export function createKeycloakState(): KeycloakState {
  const instance = shallowRef<KeycloakInstance | null>(null)
  const isAuthenticated = ref(false)
  const isReady = ref(false)
  const token = ref<string | undefined>()
  const tokenParsed = ref<KeycloakTokenParsed | undefined>()
  const idToken = ref<string | undefined>()
  const idTokenParsed = ref<KeycloakTokenParsed | undefined>()
  const refreshToken = ref<string | undefined>()
  const refreshTokenParsed = ref<KeycloakTokenParsed | undefined>()
  const subject = ref<string | undefined>()
  const profile = ref<KeycloakProfile | null>(null)
  const realmAccess = ref<KeycloakRealmAccess | undefined>()
  const resourceAccess = ref<KeycloakResourceAccess | undefined>()
  const timeSkew = ref<number | undefined>()
  const responseMode = ref<string | undefined>()
  const flow = ref<string | undefined>()
  const adapter = ref<string | undefined>()
  const responseType = ref<string | undefined>()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  return {
    instance,
    isAuthenticated,
    isReady,
    token,
    tokenParsed,
    idToken,
    idTokenParsed,
    refreshToken,
    refreshTokenParsed,
    subject,
    profile,
    realmAccess,
    resourceAccess,
    timeSkew,
    responseMode,
    flow,
    adapter,
    responseType,
    isLoading,
    error
  }
}

/**
 * Computed getters for Keycloak state
 */
export interface KeycloakGetters {
  /**
   * Check if token is expired
   */
  isTokenExpired: ComputedRef<boolean>
  /**
   * Get username from token or profile
   */
  username: ComputedRef<string | undefined>
  /**
   * Get email from token or profile
   */
  email: ComputedRef<string | undefined>
  /**
   * Get full name from profile
   */
  fullName: ComputedRef<string | undefined>
  /**
   * Get first name from profile
   */
  firstName: ComputedRef<string | undefined>
  /**
   * Get last name from profile
   */
  lastName: ComputedRef<string | undefined>
  /**
   * Check if user has realm role
   */
  hasRealmRole: (role: string) => boolean
  /**
   * Check if user has resource role
   */
  hasResourceRole: (role: string, resource?: string) => boolean
  /**
   * Get all realm roles
   */
  realmRoles: ComputedRef<string[]>
  /**
   * Get all resource roles for a specific resource
   */
  resourceRoles: (resource: string) => string[]
}

/**
 * Create Keycloak computed getters
 */
export function createKeycloakGetters(state: KeycloakState): KeycloakGetters {
  const isTokenExpired = computed(() => {
    if (!state.instance.value || !state.tokenParsed.value) return true
    return state.instance.value.isTokenExpired(0)
  })

  const username = computed(() => {
    return state.tokenParsed.value?.preferred_username || state.profile.value?.username
  })

  const email = computed(() => {
    return state.tokenParsed.value?.email || state.profile.value?.email
  })

  const fullName = computed(() => {
    if (state.profile.value?.firstName && state.profile.value?.lastName) {
      return `${state.profile.value.firstName} ${state.profile.value.lastName}`
    }
    return state.tokenParsed.value?.name
  })

  const firstName = computed(() => {
    return state.profile.value?.firstName || state.tokenParsed.value?.given_name
  })

  const lastName = computed(() => {
    return state.profile.value?.lastName || state.tokenParsed.value?.family_name
  })

  const hasRealmRole = (role: string): boolean => {
    if (!state.instance.value) return false
    return state.instance.value.hasRealmRole(role)
  }

  const hasResourceRole = (role: string, resource?: string): boolean => {
    if (!state.instance.value) return false
    return state.instance.value.hasResourceRole(role, resource)
  }

  const realmRoles = computed(() => {
    return state.realmAccess.value?.roles || []
  })

  const resourceRoles = (resource: string): string[] => {
    return state.resourceAccess.value?.[resource]?.roles || []
  }

  return {
    isTokenExpired,
    username,
    email,
    fullName,
    firstName,
    lastName,
    hasRealmRole,
    hasResourceRole,
    realmRoles,
    resourceRoles
  }
}
