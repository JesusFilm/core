import createCache, { EmotionCache } from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

// todo: Add rtl check for stylisPlugins

// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It allows developers to easily override MUI styles with other styling solutions, like CSS modules.
export function createEmotionCache(isRTL?: boolean): EmotionCache {
  return createCache({
    key: 'css',
    prepend: true,
    stylisPlugins: isRTL === true ? [prefixer, rtlPlugin] : []
  })
}
