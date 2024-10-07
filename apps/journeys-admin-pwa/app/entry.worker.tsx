import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import type { EntryContext } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import { ReactElement } from 'react'
import { renderToString } from 'react-dom/server'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
): Response {
  const cache = createEmotionCache({})
  const emotionServer = createEmotionServer(cache)

  function MuiRemixServer(): ReactElement {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider theme={adminLight}>
          <CssBaseline />
          <RemixServer context={remixContext} url={request.url} />
        </ThemeProvider>
      </CacheProvider>
    )
  }

  // Render the component to a string.
  const html = renderToString(<MuiRemixServer />)

  // Grab the CSS from emotion
  const { styles } = emotionServer.extractCriticalToChunks(html)

  let stylesHTML = ''

  styles.forEach(({ key, ids, css }) => {
    const emotionKey = `${key} ${ids.join(' ')}`
    const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`
    stylesHTML = `${stylesHTML}${newStyleTag}`
  })

  // Add the Emotion style tags after the insertion point meta tag
  const markup = html.replace(
    /<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
    `<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders
  })
}
