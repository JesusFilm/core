import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/ru'
import { getFlags } from '../../../../src/libs/getFlags'
import { LanguageProvider } from '../../../../src/libs/languageContext/LanguageContext'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Пасха 2025: видео и материалы о Великом посте, Страстной неделе, Воскресении | Jesus Film Project"
        description="Откройте для себя другую сторону Пасхи — историю, наполненную предательством, надеждой и утверждением, изменившим мир."
        openGraph={{
          title:
            'Что если всё, что вы думали о Пасхе — это только половина истории?',
          description:
            'Откройте для себя другую сторону Пасхи — историю, наполненную предательством, надеждой и утверждением, изменившим мир.',
          url: 'https://watch.jesusfilm.org/watch/easter/russian',
          type: 'website',
          locale: 'ru_RU',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              width: 1400,
              height: 933,
              alt: 'Пасха - Jesus Film Project',
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
        context.locale ?? 'ru',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
