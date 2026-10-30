import createEmotionServer from '@emotion/server/create-instance'
import type { documentGetInitialProps } from '@mui/material-nextjs/v15-pagesRouter'
import { ComponentType, ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { getPageRTL } from '../getPageRTL'

type EmotionPlugin = NonNullable<
  NonNullable<Parameters<typeof documentGetInitialProps>[1]>['plugins']
>[number]

type CampaignPageProps = Pick<Parameters<typeof getPageRTL>[0], 'campaign'>

/**
 * A `documentGetInitialProps` plugin that serves right-to-left campaign pages
 * (glossary: Page Language resolution) their CSS compiled right-to-left.
 * The document builds its cache before any page has rendered, so it cannot know the page's language;
 * this plugin holds a second, RTL cache and swaps it in for the render of a
 * campaign page whose Page Language is RTL, then adds that cache's critical
 * styles to the document head. Every other page, an RTL journey page
 * included, never touches it and keeps the document's own cache.
 *
 * Create one per request: the cache accumulates the styles it renders.
 */
export function createRtlEmotionPlugin(): EmotionPlugin {
  const cache = createEmotionCache({ rtl: true })
  const emotionServer = createEmotionServer(cache)

  return {
    enhanceApp: (App) =>
      function RtlEmotionApp(props: {
        pageProps?: CampaignPageProps
      }): ReactElement {
        const Page = App as ComponentType<Record<string, unknown>>
        if (!getPageRTL({ campaign: props.pageProps?.campaign }))
          return <Page {...props} />
        return <Page {...props} emotionCache={cache} />
      },
    resolveProps: (initialProps) => {
      const { styles } = emotionServer.extractCriticalToChunks(
        initialProps.html
      )
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
      if (rtlStyleTags.length === 0) return Promise.resolve(initialProps)
      const { emotionStyleTags = [] } = initialProps as {
        emotionStyleTags?: ReactElement[]
      }
      return Promise.resolve({
        ...initialProps,
        emotionStyleTags: [...emotionStyleTags, ...rtlStyleTags]
      } as typeof initialProps)
    }
  }
}
