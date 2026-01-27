import { type UserConfig, mergeConfig } from 'vite'

const viteConfig = (config: UserConfig) => {
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Split vendor chunks
            if (id.includes('node_modules')) {
              // React and React DOM
              if (
                id.includes('/react/') ||
                id.includes('\\react\\') ||
                id.includes('/react-dom/') ||
                id.includes('\\react-dom\\')
              ) {
                return 'react-vendor'
              }
              // React Router
              if (id.includes('react-router')) {
                return 'react-router'
              }
              // Styled Components
              if (id.includes('styled-components')) {
                return 'styled-components'
              }
              // Highlight.js
              if (id.includes('highlight.js')) {
                return 'highlight.js'
              }
              // HLS.js
              if (id.includes('hls.js')) {
                return 'hls.js'
              }
              // Mux/video libraries
              if (id.includes('@mux') || id.includes('mux')) {
                return 'mux-vendor'
              }
              // CodeMirror (large code editor)
              if (id.includes('codemirror')) {
                return 'codemirror'
              }
              // Lodash
              if (id.includes('lodash')) {
                return 'lodash'
              }
              // React Select
              if (id.includes('react-select')) {
                return 'react-select'
              }
              // Markdown parser
              if (id.includes('markdown-it')) {
                return 'markdown-it'
              }
              // Popper.js (tooltip positioning)
              if (id.includes('@popperjs') || id.includes('popperjs')) {
                return 'popperjs'
              }
              // Strapi vendor
              if (id.includes('@strapi')) {
                return 'strapi-vendor'
              }
              // All other node_modules
              return 'vendor'
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  })
}

export default viteConfig
