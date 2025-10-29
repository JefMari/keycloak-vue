import type { App, Plugin } from 'vue'
import type {
  KeycloakConfig,
  KeycloakInitOptions,
  KeycloakCallbacks
} from './types'
import { initKeycloak } from './composable'
import { KEYCLOAK_INJECTION_KEY } from './constants'

/**
 * Keycloak plugin options
 */
export interface KeycloakPluginOptions {
  /**
   * Keycloak configuration
   */
  config: KeycloakConfig | string
  /**
   * Initialization options
   */
  initOptions?: KeycloakInitOptions
  /**
   * Auto-initialize on plugin install
   */
  autoInit?: boolean
  /**
   * Callback events
   */
  callbacks?: KeycloakCallbacks
}

/**
 * Create KeycloakVue plugin
 */
export function createKeycloakPlugin(options: KeycloakPluginOptions): Plugin {
  return {
    install(app: App) {
      const keycloak = initKeycloak(options.config, options.callbacks)

      // Provide to all components
      app.provide(KEYCLOAK_INJECTION_KEY, keycloak)

      // Auto-initialize if requested
      if (options.autoInit !== false) {
        keycloak.init(options.initOptions).catch((error) => {
          console.error('Failed to initialize Keycloak:', error)
        })
      }

      // Add to global properties for Options API
      app.config.globalProperties.$keycloak = keycloak
    }
  }
}

// Export default
export default {
  createKeycloakPlugin
}
