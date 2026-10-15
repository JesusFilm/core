import createEmotionServer from '@emotion/server/create-instance'
import type { documentGetInitialProps } from '@mui/material-nextjs/v15-pagesRouter'
import { ComponentType, ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { getPageRTL } from '../getPageRTL'

type EmotionPlugin = NonNullable<
  NonNullable<Parameters<typeof documentGetInitialProps>[1]>['plugins']
>[number]

type PageRTLProps = Parameters<typeof getPageRTL>[0]

/**
 * A `documentGetInitialProps` plugin that serves right-to-left pages (PRD §2,
 * §11) their CSS compiled right-to-left. The document builds its cache before
 * any page has rendered, so it cannot know the page's language; this plugin
 * holds a second, RTL cache and swaps it in for the render of a page whose
 * props say RTL, then adds that cache's critical styles to the document head.
 * Left-to-right pages never touch it and keep the document's own cache.
 *
 * Create one per request: the cache accumulates the styles it renders.
 */
export function createRtlEmotionPlugin(): EmotionPlugin {
  const cache = createEmotionCache({ rtl: true })
  const { extractCriticalToChunks } = createEmotionServer(cache)

  return {
    enhanceApp: (App) =>
      function RtlEmotionApp(props: {
        pageProps?: PageRTLProps
      }): ReactElement {
        const Page = App as ComponentType<Record<string, unknown>>
        if (!getPageRTL(props.pageProps ?? {})) return <Page {...props} />
        return <Page {...props} emotionCache={cache} />
      },
    resolveProps: async (initialProps) => {
      const { styles } = extractCriticalToChunks(initialProps.html)
      const rtlStyleTags = styles
        .filter((style) => style.css.trim() !== '')
        .map((style) => {
          // A layer order rule is prefixed with the cache key so Emotion hydrates it.
          const isLayerOrderRule =
            style.css.startsWith('@layer') && !/\{.*\}/.test(style.css)
          return (
            <style
              key={style.key}
              data-emotion={`${isLayerOrderRule ? `${cache.key} ` : ''}${style.key} ${style.ids.join(' ')}`}
              dangerouslySetInnerHTML={{ __html: style.css }}
              nonce={cache.nonce}
            />
          )
        })
      if (rtlStyleTags.length === 0) return initialProps
      const { emotionStyleTags = [] } = initialProps as {
        emotionStyleTags?: ReactElement[]
      }
      return {
        ...initialProps,
        emotionStyleTags: [...emotionStyleTags, ...rtlStyleTags]
      } as typeof initialProps
    }
  }
}
