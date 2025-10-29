import { describe, it, expect } from 'vitest'
import { createKeycloakState, createKeycloakGetters } from '../states'
import type { KeycloakInstance } from '../types'

describe('createKeycloakState', () => {
  it('should create initial state with correct default values', () => {
    const state = createKeycloakState()

    expect(state.instance.value).toBeNull()
    expect(state.isAuthenticated.value).toBe(false)
    expect(state.isReady.value).toBe(false)
    expect(state.token.value).toBeUndefined()
    expect(state.tokenParsed.value).toBeUndefined()
    expect(state.idToken.value).toBeUndefined()
    expect(state.idTokenParsed.value).toBeUndefined()
    expect(state.refreshToken.value).toBeUndefined()
    expect(state.refreshTokenParsed.value).toBeUndefined()
    expect(state.subject.value).toBeUndefined()
    expect(state.profile.value).toBeNull()
    expect(state.realmAccess.value).toBeUndefined()
    expect(state.resourceAccess.value).toBeUndefined()
    expect(state.timeSkew.value).toBeUndefined()
    expect(state.responseMode.value).toBeUndefined()
    expect(state.flow.value).toBeUndefined()
    expect(state.adapter.value).toBeUndefined()
    expect(state.responseType.value).toBeUndefined()
    expect(state.isLoading.value).toBe(false)
    expect(state.error.value).toBeNull()
  })

  it('should create reactive refs that can be updated', () => {
    const state = createKeycloakState()

    state.isAuthenticated.value = true
    state.token.value = 'test-token'
    state.isLoading.value = true

    expect(state.isAuthenticated.value).toBe(true)
    expect(state.token.value).toBe('test-token')
    expect(state.isLoading.value).toBe(true)
  })
})

describe('createKeycloakGetters', () => {
  it('should compute isTokenExpired correctly when token is expired', () => {
    const state = createKeycloakState()
    const mockInstance = {
      isTokenExpired: () => true
    } as unknown as KeycloakInstance
    
    state.instance.value = mockInstance
    state.tokenParsed.value = { exp: Date.now() / 1000 - 100 }

    const getters = createKeycloakGetters(state)

    expect(getters.isTokenExpired.value).toBe(true)
  })

  it('should compute isTokenExpired as true when no instance', () => {
    const state = createKeycloakState()
    const getters = createKeycloakGetters(state)

    expect(getters.isTokenExpired.value).toBe(true)
  })

  it('should compute username from tokenParsed', () => {
    const state = createKeycloakState()
    state.tokenParsed.value = { preferred_username: 'john_doe' }

    const getters = createKeycloakGetters(state)

    expect(getters.username.value).toBe('john_doe')
  })

  it('should compute username from profile when tokenParsed not available', () => {
    const state = createKeycloakState()
    state.profile.value = { username: 'jane_doe' }

    const getters = createKeycloakGetters(state)

    expect(getters.username.value).toBe('jane_doe')
  })

  it('should compute email from tokenParsed', () => {
    const state = createKeycloakState()
    state.tokenParsed.value = { email: 'john@example.com' }

    const getters = createKeycloakGetters(state)

    expect(getters.email.value).toBe('john@example.com')
  })

  it('should compute email from profile when tokenParsed not available', () => {
    const state = createKeycloakState()
    state.profile.value = { email: 'jane@example.com' }

    const getters = createKeycloakGetters(state)

    expect(getters.email.value).toBe('jane@example.com')
  })

  it('should compute fullName from profile', () => {
    const state = createKeycloakState()
    state.profile.value = { firstName: 'John', lastName: 'Doe' }

    const getters = createKeycloakGetters(state)

    expect(getters.fullName.value).toBe('John Doe')
  })

  it('should compute fullName from tokenParsed when profile not available', () => {
    const state = createKeycloakState()
    state.tokenParsed.value = { name: 'Jane Doe' }

    const getters = createKeycloakGetters(state)

    expect(getters.fullName.value).toBe('Jane Doe')
  })

  it('should compute firstName from profile', () => {
    const state = createKeycloakState()
    state.profile.value = { firstName: 'John' }

    const getters = createKeycloakGetters(state)

    expect(getters.firstName.value).toBe('John')
  })

  it('should compute firstName from tokenParsed when profile not available', () => {
    const state = createKeycloakState()
    state.tokenParsed.value = { given_name: 'Jane' }

    const getters = createKeycloakGetters(state)

    expect(getters.firstName.value).toBe('Jane')
  })

  it('should compute lastName from profile', () => {
    const state = createKeycloakState()
    state.profile.value = { lastName: 'Doe' }

    const getters = createKeycloakGetters(state)

    expect(getters.lastName.value).toBe('Doe')
  })

  it('should compute lastName from tokenParsed when profile not available', () => {
    const state = createKeycloakState()
    state.tokenParsed.value = { family_name: 'Smith' }

    const getters = createKeycloakGetters(state)

    expect(getters.lastName.value).toBe('Smith')
  })

  it('should check realm role correctly', () => {
    const state = createKeycloakState()
    const mockInstance = {
      hasRealmRole: (role: string) => role === 'admin'
    } as unknown as KeycloakInstance
    
    state.instance.value = mockInstance

    const getters = createKeycloakGetters(state)

    expect(getters.hasRealmRole('admin')).toBe(true)
    expect(getters.hasRealmRole('user')).toBe(false)
  })

  it('should return false for realm role when no instance', () => {
    const state = createKeycloakState()
    const getters = createKeycloakGetters(state)

    expect(getters.hasRealmRole('admin')).toBe(false)
  })

  it('should check resource role correctly', () => {
    const state = createKeycloakState()
    const mockInstance = {
      hasResourceRole: (role: string, resource?: string) => 
        role === 'view' && resource === 'myapp'
    } as unknown as KeycloakInstance
    
    state.instance.value = mockInstance

    const getters = createKeycloakGetters(state)

    expect(getters.hasResourceRole('view', 'myapp')).toBe(true)
    expect(getters.hasResourceRole('edit', 'myapp')).toBe(false)
  })

  it('should return false for resource role when no instance', () => {
    const state = createKeycloakState()
    const getters = createKeycloakGetters(state)

    expect(getters.hasResourceRole('view', 'myapp')).toBe(false)
  })

  it('should compute realm roles from realmAccess', () => {
    const state = createKeycloakState()
    state.realmAccess.value = { roles: ['admin', 'user'] }

    const getters = createKeycloakGetters(state)

    expect(getters.realmRoles.value).toEqual(['admin', 'user'])
  })

  it('should return empty array when no realmAccess', () => {
    const state = createKeycloakState()
    const getters = createKeycloakGetters(state)

    expect(getters.realmRoles.value).toEqual([])
  })

  it('should get resource roles for a specific resource', () => {
    const state = createKeycloakState()
    state.resourceAccess.value = {
      myapp: { roles: ['view', 'edit'] }
    }

    const getters = createKeycloakGetters(state)

    expect(getters.resourceRoles('myapp')).toEqual(['view', 'edit'])
  })

  it('should return empty array for non-existent resource', () => {
    const state = createKeycloakState()
    const getters = createKeycloakGetters(state)

    expect(getters.resourceRoles('nonexistent')).toEqual([])
  })
})
