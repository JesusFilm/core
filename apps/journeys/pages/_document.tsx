import {
  DocumentHeadTags,
  documentGetInitialProps
} from '@mui/material-nextjs/v15-pagesRouter'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ReactElement } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { getLocaleRTL } from '@core/shared/ui/rtl'
import { getTheme } from '@core/shared/ui/themes'

import { ThemeMode, ThemeName } from '../__generated__/globalTypes'

interface CampaignPageProps {
  campaign?: { language?: { bcp47?: string | null } | null } | null
}

/**
 * The document's `lang` and `dir` (PRD §2, §11): on a campaign page the
 * resolved Page Language's bcp47 and the RTL lookup on it (`ltr` when there
 * is none), read from the page props the route rendered with; every other
 * page keeps the app default.
 */
export function documentLanguage(
  pageProps: CampaignPageProps | undefined,
  fallback: { rtl: boolean }
): { lang: string; dir: string } {
  const bcp47 = pageProps?.campaign?.language?.bcp47
  if (bcp47 == null) return { lang: 'en', dir: fallback.rtl ? 'rtl' : '' }
  return { lang: bcp47, dir: getLocaleRTL(bcp47) ? 'rtl' : 'ltr' }
}

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
    const { lang, dir } = documentLanguage(
      this.props.__NEXT_DATA__.props.pageProps as CampaignPageProps,
      this.props
    )
    return (
      <Html lang={lang} dir={dir} style={{ overscrollBehaviorY: 'none' }}>
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
  const initialProps = await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({})
  })

  // No journey is resolvable at _document level, so RTL falls back to the
  // default locale. Previously spelled as an always-undefined local.
  const { rtl, locale } = getJourneyRTL(undefined)

  return {
    ...initialProps,
    rtl,
    locale
  }
}
