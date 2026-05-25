import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Vitest config — small enough that we don't pull vite-tsconfig-paths;
// just mirror the single `@/*` alias from tsconfig.json so imports like
// `@/lib/brand` resolve in tests the same way they do in the app.
export default defineConfig({
  test: {
    // Only run *.test.ts files under tests/ — keeps the app's source
    // tree free of test files and avoids accidentally importing
    // server-only modules in unit tests.
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
