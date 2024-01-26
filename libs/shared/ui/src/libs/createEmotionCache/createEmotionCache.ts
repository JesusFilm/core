import createCache, { EmotionCache } from '@emotion/cache'
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
  return createCache({
    key: rtl === true ? 'muirtl' : 'css',
    prepend,
    stylisPlugins: rtl === true ? [prefixer, rtlPlugin] : []
  })
}
