import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/ru'
import { getEasterCampaignYear } from '../../../../src/libs/easterDates'
import { getFlags } from '../../../../src/libs/getFlags'

interface EasterPageProps {
  easterYear: number
}

export default function EasterPage({
  easterYear
}: EasterPageProps): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle={`Пасха ${easterYear}: смотрите историю воскресения | Jesus Film Project`}
        description="Узнайте истинный смысл Пасхи через видео о воскресении Иисуса. Смотрите материалы о Страстной неделе, Страстной пятнице и Пасхальном воскресенье более чем на 2 000 языках."
        openGraph={{
          title: `Пасха ${easterYear}: смотрите историю воскресения`,
          description:
            'Узнайте истинный смысл Пасхи через видео о воскресении Иисуса. Смотрите более чем на 2 000 языках.',
          url: 'https://www.jesusfilm.org/watch/easter/russian',
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
        <CollectionsPage year={easterYear} />
      </SnackbarProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<EasterPageProps> = async (
  context
) => {
  return {
    props: {
      easterYear: getEasterCampaignYear(),
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'ru',
        ['apps-resources'],
        i18nConfig
      ))
    },
    revalidate: 60 * 60 * 24
  }
}
