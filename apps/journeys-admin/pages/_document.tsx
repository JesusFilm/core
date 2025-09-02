import {
  DocumentHeadTags,
  type DocumentHeadTagsProps,
  documentGetInitialProps
} from '@mui/material-nextjs/v15-pagesRouter'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

export default class MyDocument extends Document<DocumentHeadTagsProps> {
  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Open+Sans&display=swap"
            rel="stylesheet"
          />
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
  return await documentGetInitialProps(ctx, {
    emotionCache: createEmotionCache({})
  })
}
