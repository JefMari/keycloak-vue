import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'KeycloakVue',
  description: 'A comprehensive Vue 3.5+ wrapper for keycloak-js using the Composition API',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Usage',
          items: [
            { text: 'Plugin Setup', link: '/guide/plugin-setup' },
            { text: 'Using the Composable', link: '/guide/composable' },
            { text: 'Manual Initialization', link: '/guide/manual-init' }
          ]
        },
        {
          text: 'Configuration',
          items: [
            { text: 'Keycloak Config', link: '/guide/config' },
            { text: 'Init Options', link: '/guide/init-options' },
            { text: 'Callbacks', link: '/guide/callbacks' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'useKeycloak', link: '/api/use-keycloak' },
            { text: 'Types', link: '/api/types' },
            { text: 'Enums', link: '/api/enums' },
            { text: 'Constants', link: '/api/constants' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Token Refresh', link: '/examples/token-refresh' },
            { text: 'Protected API Calls', link: '/examples/protected-api' },
            { text: 'Role-Based Access', link: '/examples/role-based' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/keycloak-vue' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Jef Mari'
    }
  }
})
