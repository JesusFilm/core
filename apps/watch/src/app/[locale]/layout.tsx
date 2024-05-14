import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter'
import { ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { ApolloWrapper } from '../../libs/apolloClient/apolloWrapper'

import 'swiper/css'
import 'swiper/css/a11y'
import 'swiper/css/navigation'
import '../../../public/fonts/fonts.css'

export const metadata = {
  title: 'Watch | Jesus Film Project',
  description:
    'Free Gospel Video Streaming Library Watch, learn and share the gospel in over 2000 languages.'
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}): ReactNode {
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Open+Sans&display=swap"
          rel="stylesheet"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/watch/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/watch/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/watch/favicon-32x32.png"
        />
        <link rel="manifest" href="/watch/site.webmanifest" />
        <meta name="theme-color" content="#000" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID != null &&
          process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID !== '' &&
          process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN != null &&
          process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN !== '' && (
            <script id="datadog-rum">
              {`
             (function(h,o,u,n,d) {
               h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
               d=o.createElement(u);d.async=1;d.src=n
               n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
             })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js','DD_RUM')
             window.DD_RUM.onReady(function() {
               window.DD_RUM.init({
                applicationId: '${
                  process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? ''
                }',
                clientToken: '${
                  process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? ''
                }',
                site: 'datadoghq.com',
                service: 'watch',
                env: '${process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''}',
                version: '${
                  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
                }',
                sampleRate: 50,
                sessionReplaySampleRate: 10,
                trackInteractions: true,
                defaultPrivacyLevel: 'mask-user-input'
               });
             })
           `}
            </script>
          )}
        <ApolloWrapper>
          <AppRouterCacheProvider>
            <ThemeProvider
              themeName={ThemeName.website}
              themeMode={ThemeMode.light}
            >
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}
