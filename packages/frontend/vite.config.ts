import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/mocks/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'src/main.ts',
        'src/router/**',
        'src/api/**',
        'src/mocks/fixtures.ts',
        'src/mocks/handlers.ts',
        'src/mocks/server.ts',
        'src/mocks/setup.ts',
        '**/*.d.ts',
      ],
    },
  },
})
