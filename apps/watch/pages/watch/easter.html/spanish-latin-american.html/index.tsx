import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/es'
import { getFlags } from '../../../../src/libs/getFlags'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Pascua 2025 videos y recursos sobre Cuaresma, Semana Santa, Resurrección | Jesus Film Project"
        description="Explora el otro lado de la Pascua — lleno de traición, esperanza y una afirmación que cambió el mundo."
        openGraph={{
          title:
            '¿Y si todo lo que pensabas sobre la Pascua es solo la mitad de la historia?',
          description:
            'Explora el otro lado de la Pascua — lleno de traición, esperanza y una afirmación que cambió el mundo.',
          url: 'https://watch.jesusfilm.org/watch/easter/spanish-latin-american',
          type: 'website',
          locale: 'es_LA',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              width: 1400,
              height: 933,
              alt: 'Pascua - Jesus Film Project',
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
        <LanguageProvider>
          <CollectionsPage />
        </LanguageProvider>
      </SnackbarProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'es',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
