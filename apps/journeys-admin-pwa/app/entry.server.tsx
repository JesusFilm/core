import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import type { EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

import { ThemeProvider } from './components/ThemeProvider'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Response {
  const cache = createEmotionCache({})
  const emotion = createEmotionServer(cache)

  function MuiRemixServer(): ReactElement {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider>
          <RemixServer context={remixContext} url={request.url} />
        </ThemeProvider>
      </CacheProvider>
    )
  }

  const html = renderToString(<MuiRemixServer />)
  const { styles } = emotion.extractCriticalToChunks(html)

  let stylesHTML = ''
  if (styles.length > 0) {
    stylesHTML = styles
      .map(
        (style) =>
          `<style data-emotion="${style.key} ${style.ids.join(' ')}">${
            style.css
          }</style>`
      )
      .join('')
  }

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(
    `<!DOCTYPE html>${html.replace(/<\/head>/, `${stylesHTML}</head>`)}`,
    {
      status: responseStatusCode,
      headers: responseHeaders
    }
  )
}
