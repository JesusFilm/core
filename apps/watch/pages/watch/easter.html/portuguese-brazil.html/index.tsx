import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/pt'
import { getFlags } from '../../../../src/libs/getFlags'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Vídeos e recursos da Páscoa 2025 sobre Quaresma, Semana Santa e Ressurreição | Jesus Film Project"
        description="Explore o outro lado da Páscoa — repleto de traição, esperança e uma afirmação que mudou o mundo."
        openGraph={{
          title:
            'E se tudo o que você pensava sobre a Páscoa fosse apenas metade da história?',
          description:
            'Explore o outro lado da Páscoa — repleto de traição, esperança e uma afirmação que mudou o mundo.',
          url: 'https://watch.jesusfilm.org/watch/easter/portuguese-brazil',
          type: 'website',
          locale: 'pt_BR',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              width: 1400,
              height: 933,
              alt: 'Páscoa - Jesus Film Project',
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
        context.locale ?? 'pt-BR',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
