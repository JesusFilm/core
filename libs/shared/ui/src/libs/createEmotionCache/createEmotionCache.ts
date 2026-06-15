import { EmotionCache } from '@emotion/cache'
import { createEmotionCache as createEmotionCacheNext } from '@mui/material-nextjs/v15-pagesRouter'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

interface EmotionCacheProps {
  rtl?: boolean
  prepend?: boolean
}
// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It allows developers to easily override MUI styles with other styling solutions, like CSS modules.
export function createEmotionCache({
  rtl,
  prepend = false
}: EmotionCacheProps): EmotionCache {
  return createEmotionCacheNext({
    key: 'css',
    prepend,
    // prefixer and rtlPlugin must come from the same stylis version emotion
    // bundles, or RTL compilation crashes — enforced by
    // createEmotionCache.spec.tsx (NES-1728)
    stylisPlugins: rtl === true ? [prefixer, rtlPlugin] : []
  })
}
