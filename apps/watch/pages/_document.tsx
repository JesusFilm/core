import {
  DocumentHeadTags,
  type DocumentHeadTagsProps,
  documentGetInitialProps
} from '@mui/material-nextjs/v14-pagesRouter'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

export default class MyDocument extends Document<DocumentHeadTagsProps> {
  render(): ReactElement {
    const pageProps = this.props.__NEXT_DATA__?.props?.pageProps
    const language = pageProps?.content?.variant?.language
    const bcp47 = language?.bcp47 ?? null
    const languageName =
      language?.name?.find((name) => name && !name.primary)?.value ?? null

    return (
      // TODO: Remove scroll snap after easter 2025 campaign
      <Html lang={bcp47 ?? undefined} style={{ scrollSnapType: 'y proximity' }}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" href="/watch/assets/favicon-32.png" sizes="32x32" />
          <link
            rel="icon"
            href="/watch/assets/favicon-180.png"
            sizes="192x192"
          />
          <link rel="apple-touch-icon" href="/watch/assets/favicon-180.png" />
          <meta
            name="msapplication-TileImage"
            content="/watch/assets/favicon-180.png"
          />
          {languageName && <meta name="language" content={languageName} />}
          {/* Inject MUI styles first to match with the prepend: true configuration. */}
          <DocumentHeadTags {...this.props} />
        </Head>
        <body style={{ margin: 0, backgroundColor: '#0E0D0D' }}>
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
  return await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({})
  })
}
