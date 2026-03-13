import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../next-i18next.config'
import { CollectionsPage } from '../../../src/components/CollectionsPage/languages/en'
import { getFlags } from '../../../src/libs/getFlags'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Easter 2026: Watch the Resurrection Story Free | Jesus Film Project"
        description="Discover the true meaning of Easter through free videos about the resurrection of Jesus. Watch Holy Week, Good Friday and Easter Sunday in 2,000+ languages."
        openGraph={{
          title: 'Easter 2026: Watch the Resurrection Story Free',
          description:
            'Discover the true meaning of Easter through free videos about the resurrection of Jesus. Watch in 2,000+ languages.',
          url: 'https://www.jesusfilm.org/watch/easter',
          type: 'website',
          locale: 'en_US',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              width: 1400,
              height: 933,
              alt: 'Easter - Jesus Film Project',
              type: 'image/jpeg'
            }
          ],
          site_name: 'Jesus Film Project'
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? {
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
              }
            : undefined
        }
        twitter={{
          site: '@JesusFilm',
          cardType: 'summary_large_image',
          handle: '@JesusFilm'
        }}
      />
      <SnackbarProvider>
        <CollectionsPage />
      </SnackbarProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-resources'],
        i18nConfig
      ))
    }
  }
}
