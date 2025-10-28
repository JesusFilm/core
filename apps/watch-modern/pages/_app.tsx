import type { AppProps } from 'next/app'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'
import '../styles/globals.css'

import { initAuth } from '../src/libs/auth/initAuth'

initAuth()

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
        <Component {...pageProps} />
    </>
  )
}
export default StudioApp

