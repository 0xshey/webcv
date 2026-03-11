import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: { SKIP_ENV_VALIDATION: 'true' },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
