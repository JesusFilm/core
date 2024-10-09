import { EmotionCache, withEmotionCache } from '@emotion/react'
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import { ReactElement, ReactNode, useContext } from 'react'

import { ClientStyleContext } from '../libs/ClientStyleContext/ClientStyleContext'

import { ThemeProvider } from './components/ThemeProvider'

interface DocumentProps {
  children: ReactNode
  title?: string
}

const Document = withEmotionCache(
  (
    { children, title }: DocumentProps,
    emotionCache: EmotionCache
  ): ReactElement => {
    const clientStyleData = useContext(ClientStyleContext)

    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head

      // re-inject tags (Emotion handles this for you)
      emotionCache.sheet.flush()

      // reset cache to reapply global styles
      clientStyleData.reset()
    }, [clientStyleData, emotionCache])

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {title != null && <title>{title}</title>}
          <Meta />
          <Links />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    )
  }
)

export default function App(): ReactElement {
  return (
    <Document>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </Document>
  )
}
