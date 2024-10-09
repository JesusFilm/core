import { CacheProvider } from '@emotion/react'
import { RemixBrowser } from '@remix-run/react'
import { ReactElement, ReactNode, useState } from 'react'
import { hydrateRoot } from 'react-dom/client'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { ThemeProvider } from './components/ThemeProvider'

interface ClientCacheProviderProps {
  children: ReactNode
}

function ClientCacheProvider({
  children
}: ClientCacheProviderProps): ReactElement {
  const [cache] = useState(() => createEmotionCache({}))

  return <CacheProvider value={cache}>{children}</CacheProvider>
}

hydrateRoot(
  document,
  <ClientCacheProvider>
    <ThemeProvider>
      <RemixBrowser />
    </ThemeProvider>
  </ClientCacheProvider>
)
