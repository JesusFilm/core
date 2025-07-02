import {
  DocumentHeadTags,
  documentGetInitialProps
} from '@mui/material-nextjs/v14-pagesRouter'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ReactElement } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { getTheme } from '@core/shared/ui/themes'

import { ThemeMode, ThemeName } from '../__generated__/globalTypes'
import { JourneyFields } from '../__generated__/JourneyFields'

export default class MyDocument extends Document<{
  emotionStyleTags: ReactElement[]
  rtl: boolean
  locale: string
}> {
  theme = getTheme({
    themeName: ThemeName.base,
    themeMode: ThemeMode.light
  })

  render(): ReactElement {
    return (
      <Html
        lang="en"
        dir={this.props.rtl ? 'rtl' : ''}
        style={{ overscrollBehaviorY: 'none' }}
      >
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          {this.props.rtl && this.props.locale !== 'ur' ? (
            <>
              <link
                href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@400;700&display=swap"
                rel="stylesheet"
              />
              <link
                href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&family=Tajawal:wght@400;700&display=swap"
                rel="preload"
                as="style"
              />
            </>
          ) : (
            <>
              <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
                rel="stylesheet"
              />
              <link
                href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
                rel="preload"
                as="style"
              />
            </>
          )}
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <meta
            name="theme-color"
            content={this.theme.palette.background.default}
          />
          {/* Inject MUI styles first to match with the prepend: true configuration. */}
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  let pageProps: Pick<JourneyFields, 'language'> | undefined

  const initialProps = await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({})
  })

  const { rtl, locale } = getJourneyRTL(pageProps)

  return {
    ...initialProps,
    rtl,
    locale
  }
}
