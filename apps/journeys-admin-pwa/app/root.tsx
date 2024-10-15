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
import { ReactElement, ReactNode, useContext, useEffect, useState } from 'react'
import { RxDatabase } from 'rxdb'

import { ClientStyleContext } from '../libs/ClientStyleContext/ClientStyleContext'

import { ThemeProvider } from './components/ThemeProvider'
import { initializeRxDB } from './services/initializeRxDB'

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

    useEnhancedEffect(() => {
      emotionCache.sheet.container = document.head
      emotionCache.sheet.flush()
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
  const [rxDatabase, setRxDatabase] = useState<RxDatabase | null>(null)

  useEffect(() => {
    async function initRxDatabase(): Promise<void> {
      try {
        const { database } = await initializeRxDB()
        setRxDatabase(database)
      } catch (error) {
        console.error('Failed to initialize RxDB:', error)
      }
    }
    void initRxDatabase()
  }, [])

  return (
    <Document>
      <ThemeProvider>
        <Outlet context={{ rxDatabase }} />
      </ThemeProvider>
    </Document>
  )
}
