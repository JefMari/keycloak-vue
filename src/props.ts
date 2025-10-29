import type { PropType } from 'vue'
import type {
  KeycloakConfig,
  KeycloakInitOptions,
  KeycloakLoginOptions,
  KeycloakLogoutOptions,
  KeycloakCallbacks
} from './types'

/**
 * Vue component props for Keycloak configuration
 */
export const keycloakConfigProps = {
  /**
   * Keycloak configuration object
   */
  config: {
    type: Object as PropType<KeycloakConfig>,
    required: true
  },
  /**
   * Keycloak initialization options
   */
  initOptions: {
    type: Object as PropType<KeycloakInitOptions>,
    default: () => ({})
  },
  /**
   * Auto-initialize on mount
   */
  autoInit: {
    type: Boolean,
    default: true
  },
  /**
   * Callback events
   */
  callbacks: {
    type: Object as PropType<KeycloakCallbacks>,
    default: () => ({})
  }
} as const

/**
 * Props for Keycloak login button component
 */
export const keycloakLoginProps = {
  /**
   * Login options
   */
  options: {
    type: Object as PropType<KeycloakLoginOptions>,
    default: () => ({})
  },
  /**
   * Button text
   */
  text: {
    type: String,
    default: 'Login'
  },
  /**
   * Button disabled state
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Show loading state
   */
  loading: {
    type: Boolean,
    default: false
  }
} as const

/**
 * Props for Keycloak logout button component
 */
export const keycloakLogoutProps = {
  /**
   * Logout options
   */
  options: {
    type: Object as PropType<KeycloakLogoutOptions>,
    default: () => ({})
  },
  /**
   * Button text
   */
  text: {
    type: String,
    default: 'Logout'
  },
  /**
   * Button disabled state
   */
  disabled: {
    type: Boolean,
    default: false
  }
} as const

/**
 * Props for protected route/component
 */
export const keycloakProtectedProps = {
  /**
   * Required realm roles
   */
  realmRoles: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /**
   * Required resource roles
   */
  resourceRoles: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  /**
   * Resource name for resource roles
   */
  resource: {
    type: String,
    default: undefined
  },
  /**
   * Redirect to login if not authenticated
   */
  redirectToLogin: {
    type: Boolean,
    default: true
  },
  /**
   * Show fallback content if not authorized
   */
  showFallback: {
    type: Boolean,
    default: true
  },
  /**
   * Custom unauthorized message
   */
  unauthorizedMessage: {
    type: String,
    default: 'You are not authorized to view this content'
  }
} as const

/**
 * Props for Keycloak user profile display
 */
export const keycloakUserProps = {
  /**
   * Show username
   */
  showUsername: {
    type: Boolean,
    default: true
  },
  /**
   * Show email
   */
  showEmail: {
    type: Boolean,
    default: false
  },
  /**
   * Show full name
   */
  showFullName: {
    type: Boolean,
    default: false
  },
  /**
   * Show roles
   */
  showRoles: {
    type: Boolean,
    default: false
  },
  /**
   * Avatar size
   */
  avatarSize: {
    type: [String, Number],
    default: '40px'
  }
} as const

/**
 * Props for Keycloak token refresh component
 */
export const keycloakTokenRefreshProps = {
  /**
   * Minimum token validity in seconds before refresh
   */
  minValidity: {
    type: Number,
    default: 30
  },
  /**
   * Auto-refresh interval in seconds
   */
  refreshInterval: {
    type: Number,
    default: 60
  },
  /**
   * Enable auto-refresh
   */
  autoRefresh: {
    type: Boolean,
    default: true
  }
} as const
