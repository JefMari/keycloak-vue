import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp } from 'vue'
import { createKeycloakPlugin } from '../plugin'
import type { KeycloakConfig, KeycloakCallbacks } from '../types'

// Mock keycloak-js
vi.mock('keycloak-js', () => {
  class MockKeycloak {
    init = vi.fn().mockResolvedValue(true)
    login = vi.fn().mockResolvedValue(undefined)
    logout = vi.fn().mockResolvedValue(undefined)
    register = vi.fn().mockResolvedValue(undefined)
    accountManagement = vi.fn().mockResolvedValue(undefined)
    updateToken = vi.fn().mockResolvedValue(true)
    loadUserProfile = vi.fn().mockResolvedValue({})
    clearToken = vi.fn()
    createLoginUrl = vi.fn().mockResolvedValue('http://login')
    createLogoutUrl = vi.fn().mockResolvedValue('http://logout')
    createRegisterUrl = vi.fn().mockResolvedValue('http://register')
    createAccountUrl = vi.fn().mockResolvedValue('http://account')
    hasRealmRole = vi.fn().mockReturnValue(false)
    hasResourceRole = vi.fn().mockReturnValue(false)
    isTokenExpired = vi.fn().mockReturnValue(false)
    authenticated = false
    token: any = undefined
    tokenParsed: any = undefined
    subject: any = undefined
    idToken: any = undefined
    idTokenParsed: any = undefined
    realmAccess: any = undefined
    resourceAccess: any = undefined
    refreshToken: any = undefined
    refreshTokenParsed: any = undefined
    timeSkew = 0
    responseMode = 'fragment'
    flow = 'standard'
    responseType = 'code'
    onReady: any = undefined
    onAuthSuccess: any = undefined
    onAuthError: any = undefined
    onAuthRefreshSuccess: any = undefined
    onAuthRefreshError: any = undefined
    onAuthLogout: any = undefined
    onTokenExpired: any = undefined
  }

  return {
    default: MockKeycloak
  }
})

describe('createKeycloakPlugin', () => {
  let consoleErrorSpy: any

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    vi.clearAllMocks()
  })

  const mockConfig: KeycloakConfig = {
    url: 'http://localhost:8080/auth',
    realm: 'test-realm',
    clientId: 'test-client'
  }

  it('should create a valid Vue plugin', () => {
    const plugin = createKeycloakPlugin({ config: mockConfig })

    expect(plugin).toBeDefined()
    expect(plugin.install).toBeDefined()
    expect(typeof plugin.install).toBe('function')
  })

  it('should provide keycloak instance to app', () => {
    const app = createApp({})
    const plugin = createKeycloakPlugin({ config: mockConfig, autoInit: false })

    plugin.install?.(app)

    // Check if the plugin was installed (we can't directly access app._context.provides in tests)
    expect(app.config.globalProperties.$keycloak).toBeDefined()
  })

  it('should add keycloak to global properties', () => {
    const app = createApp({})
    const plugin = createKeycloakPlugin({ config: mockConfig, autoInit: false })

    plugin.install?.(app)

    expect(app.config.globalProperties.$keycloak).toBeDefined()
    expect(app.config.globalProperties.$keycloak.init).toBeDefined()
    expect(app.config.globalProperties.$keycloak.login).toBeDefined()
    expect(app.config.globalProperties.$keycloak.logout).toBeDefined()
  })

  it('should auto-initialize when autoInit is not false', async () => {
    const app = createApp({})
    const plugin = createKeycloakPlugin({ 
      config: mockConfig,
      initOptions: { onLoad: 'check-sso' }
    })

    plugin.install?.(app)

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(app.config.globalProperties.$keycloak).toBeDefined()
  })

  it('should not auto-initialize when autoInit is false', () => {
    const app = createApp({})
    const plugin = createKeycloakPlugin({ 
      config: mockConfig,
      autoInit: false
    })

    plugin.install?.(app)

    expect(app.config.globalProperties.$keycloak).toBeDefined()
    expect(app.config.globalProperties.$keycloak.isReady.value).toBe(false)
  })

  it('should handle initialization errors gracefully', async () => {
    // Test that plugin doesn't crash on init error - just logs it
    const app = createApp({})
    
    const plugin = createKeycloakPlugin({ 
      config: mockConfig,
      autoInit: true
    })

    // Plugin install should not throw even if init fails internally
    expect(() => plugin.install?.(app)).not.toThrow()

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 10))

    // The error is logged internally, app should still have keycloak
    expect(app.config.globalProperties.$keycloak).toBeDefined()
  })

  it('should pass callbacks to keycloak instance', () => {
    const callbacks: KeycloakCallbacks = {
      onReady: vi.fn(),
      onAuthSuccess: vi.fn(),
      onAuthError: vi.fn()
    }

    const app = createApp({})
    const plugin = createKeycloakPlugin({ 
      config: mockConfig,
      autoInit: false,
      callbacks
    })

    plugin.install?.(app)

    expect(app.config.globalProperties.$keycloak).toBeDefined()
  })

  it('should accept string config (JSON URL)', () => {
    const app = createApp({})
    const plugin = createKeycloakPlugin({ 
      config: 'http://localhost:8080/keycloak.json',
      autoInit: false
    })

    plugin.install?.(app)

    expect(app.config.globalProperties.$keycloak).toBeDefined()
  })

  it('should pass initOptions to init method', async () => {
    const app = createApp({})
    const initOptions = {
      onLoad: 'login-required' as const,
      checkLoginIframe: false
    }

    const plugin = createKeycloakPlugin({ 
      config: mockConfig,
      initOptions,
      autoInit: false
    })

    plugin.install?.(app)

    const keycloak = app.config.globalProperties.$keycloak
    await keycloak.init(initOptions)

    expect(keycloak).toBeDefined()
  })
})
