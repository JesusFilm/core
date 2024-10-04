import { ReactNode, startTransition, useMemo, useState } from 'react'
import * as ReactDOM from 'react-dom/client'
import { RemixBrowser } from '@remix-run/react'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

import ClientStyleContext from '../libs/ClientStyleContext/ClientStyleContext'

interface ClientCacheProviderProps {
  children: ReactNode
}
function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache({}))

  const clientStyleContextValue = useMemo(
    () => ({
      reset() {
        setCache(createEmotionCache({}))
      }
    }),
    []
  )

  return (
    <ClientStyleContext.Provider value={clientStyleContextValue}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  )
}

const hydrate = () => {
  startTransition(() => {
    ReactDOM.hydrateRoot(
      document,
      <ClientCacheProvider>
        <ThemeProvider theme={adminLight}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <RemixBrowser />
        </ThemeProvider>
      </ClientCacheProvider>
    )
  })
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate)
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  setTimeout(hydrate, 1)
}
