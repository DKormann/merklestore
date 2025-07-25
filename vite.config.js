import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Determine base path
  const base = command === 'build' && env.BUILD_TARGET === 'gh-pages'
    ? '/merklestore/'
    : '/';

  return {
    base,
    define: {
      'process.env': {}
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2020',
        define: {
          global: 'globalThis',
        },
        supported: {
          bigint: true,
        },
      },
    },
    build: {
      target: 'es2020',
      outDir: 'docs',
      emptyOutDir: true,
      rollupOptions: {
        input: '/index.html',
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          generatedCode: {
            preset: 'es2015',
            constBindings: true,
          },
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    server: {
      origin: 'http://localhost:5173',
    },
    esbuild: {
      target: 'es2020',
      supported: {
        'bigint': true,
      },
    },
  };
});