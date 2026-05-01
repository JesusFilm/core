// Browser-safe stub for @mui/material-nextjs/v15-pagesRouter.
// The real package uses Node-only modules (html-tokenize, buffer-from) that
// cannot run in a browser/Vite environment. Storybook doesn't need SSR
// emotion-cache injection, so these are safe no-ops or thin wrappers.
import createCache from '@emotion/cache'

export function AppCacheProvider({ children }) {
  return children
}

export function DocumentHeadTags() {
  return null
}

export async function documentGetInitialProps(ctx) {
  return ctx.defaultGetInitialProps(ctx)
}

// MUI's createEmotionCache is a thin wrapper around @emotion/cache's createCache.
export function createEmotionCache(options) {
  return createCache(options)
}
