import type { EmotionCache } from '@emotion/cache'
import createEmotionServer from '@emotion/server/create-instance'
import type { AppType, Enhancer } from 'next/dist/shared/lib/utils'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import { FunctionComponent, ReactElement } from 'react'

import { createEmotionCache } from '@core/shared/ui/createEmotionCache'

export default class MyDocument extends Document<{
  emotionStyleTags: ReactElement[]
}> {
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
          {this.props.emotionStyleTags}
        </Head>
        <body style={{ margin: 0 }}>
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
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = ctx.renderPage

  // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.
  const cache = createEmotionCache({})

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { extractCriticalToChunks } = createEmotionServer(cache)

  ctx.renderPage = async () =>
    await originalRenderPage({
      enhanceApp: ((App: FunctionComponent<{ emotionCache: EmotionCache }>) => {
        return function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />
        }
      }) as unknown as Enhancer<AppType>
    })

  const initialProps = await Document.getInitialProps(ctx)
  // This is important. It prevents emotion to render invalid HTML.
  // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  return {
    ...initialProps,
    emotionStyleTags
  }
}
