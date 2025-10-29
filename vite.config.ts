import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: 'src',
      outDir: 'dist',
      tsconfigPath: './tsconfig.app.json',
      copyDtsFiles: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'KeycloakVue',
      fileName: (format) => `keycloak-vue.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['vue', 'keycloak-js'],
      output: {
        // Provide global variables to use in the UMD build
        globals: {
          vue: 'Vue',
          'keycloak-js': 'Keycloak'
        },
        exports: 'named'
      }
    }
  }
})
