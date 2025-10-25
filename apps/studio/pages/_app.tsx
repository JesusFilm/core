import type { AppProps } from 'next/app'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import '../styles/globals.css'

function StudioApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Studio | Jesus Film Project"
        description="Creative studio experiences from Jesus Film Project."
      />
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}
export default StudioApp

