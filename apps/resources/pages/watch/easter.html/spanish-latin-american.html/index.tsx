import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/es'
import { getFlags } from '../../../../src/libs/getFlags'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Pascua 2026: mira gratis la historia de la resurrección | Jesus Film Project"
        description="Descubre el verdadero significado de la Pascua con videos gratis sobre la resurrección de Jesús. Mira Semana Santa, Viernes Santo y Domingo de Resurrección en más de 2,000 idiomas."
        openGraph={{
          title: 'Pascua 2026: mira gratis la historia de la resurrección',
          description:
            'Descubre el verdadero significado de la Pascua con videos gratis sobre la resurrección de Jesús. Mira en más de 2,000 idiomas.',
          url: 'https://www.jesusfilm.org/watch/easter/spanish-latin-american',
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
        context.locale ?? 'es',
        ['apps-resources'],
        i18nConfig
      ))
    }
  }
}
