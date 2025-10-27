import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from 'vite-plugin-pwa';
import history from 'connect-history-api-fallback';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    middlewareMode: false,
    setupMiddlewares(middlewares) {
      middlewares.use(history());
      return middlewares;
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    mode === "analyze" && visualizer({
      filename: "dist/bundle-analysis.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'placeholder.svg', 'robots.txt'],
      manifest: {
        name: 'Naraflow - Workflow Studio',
        short_name: 'Naraflow',
        description: 'Build and manage workflow automations with AI-powered suggestions',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon',
            purpose: 'any'
          },
          {
            src: 'placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'placeholder.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'placeholder.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'placeholder.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'New Workflow',
            short_name: 'New',
            description: 'Create a new workflow',
            url: '/workflow-studio',
            icons: [{ src: 'placeholder.svg', sizes: '96x96', type: 'image/svg+xml' }]
          },
          {
            name: 'Template Marketplace',
            short_name: 'Templates',
            description: 'Browse workflow templates',
            url: '/workflow-studio?tab=templates',
            icons: [{ src: 'placeholder.svg', sizes: '96x96', type: 'image/svg+xml' }]
          },
          {
            name: 'Session Manager',
            short_name: 'Sessions',
            description: 'Manage your workflow sessions',
            url: '/workflow-studio?tab=sessions',
            icons: [{ src: 'placeholder.svg', sizes: '96x96', type: 'image/svg+xml' }]
          }
        ],
        share_target: {
          action: '/workflow-studio',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'workflow',
                accept: ['application/json', '.naraflow.json']
              }
            ]
          }
        },
        file_handlers: [
          {
            action: '/workflow-studio',
            accept: {
              'application/json': ['.naraflow.json', '.json']
            }
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/localhost:11434/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'llama-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 2 // 2 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources-cache'
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: mode === 'development',
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['react', 'react-dom'],
          // UI components
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          // Canvas and workflow
          canvas: ['@xyflow/react'],
          // AI and state management
          ai: ['zustand', '@tanstack/react-query'],
          // Charts and visualization
          charts: ['recharts'],
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Utilities
          utils: ['clsx', 'tailwind-merge', 'date-fns', 'lucide-react']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@xyflow/react',
      'zustand',
      '@tanstack/react-query'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
}));
