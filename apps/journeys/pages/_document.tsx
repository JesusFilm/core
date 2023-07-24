import { ReactElement, FunctionComponent } from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import createEmotionServer from '@emotion/server/create-instance'
import type { EmotionCache } from '@emotion/cache'
import type { Enhancer, AppType } from 'next/dist/shared/lib/utils'
import { createEmotionCache } from '@core/shared/ui/createEmotionCache'
import { getJourneyRTL } from '@core/journeys/ui/rtl'

export default class MyDocument extends Document<{
  emotionStyleTags: ReactElement[]
  rtl: boolean
  locale: string
}> {
  render(): ReactElement {
    return (
      <Html lang="en" dir={this.props.rtl ? 'rtl' : ''}>
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
          {/* Inject MUI styles first to match with the prepend: true configuration. */}
          {this.props.emotionStyleTags}
          {/* <meta name="theme-color" content="#26262E" /> */}
        </Head>
        <body>
          {/* <body style={{ backgroundColor: '#26262E' }}> */}
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
  const { extractCriticalToChunks } = createEmotionServer(cache)

  let pageProps

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: ((App: FunctionComponent<{ emotionCache: EmotionCache }>) => {
        return function EnhanceApp(props) {
          pageProps = props.pageProps.journey
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
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ))

  const { rtl, locale } = getJourneyRTL(pageProps)

  return {
    ...initialProps,
    emotionStyleTags,
    rtl,
    locale
  }
}
