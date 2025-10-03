import type { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { SnackbarProvider } from 'notistack'
import type { ReactElement } from 'react'

import i18nConfig from '../../../../next-i18next.config'
import { CollectionsPage } from '../../../../src/components/CollectionsPage/languages/fr'
import { getFlags } from '../../../../src/libs/getFlags'

export default function EasterPage(): ReactElement {
  return (
    <>
      <NextSeo
        titleTemplate="%s | Jesus Film Project"
        defaultTitle="Pâques 2025 - vidéos et ressources sur le Carême, la Semaine Sainte, la Résurrection | Jesus Film Project"
        description="Explorez l'autre côté de Pâques — une histoire de trahison, d'espérance et d'une affirmation qui a changé le monde."
        openGraph={{
          title:
            "Et si tout ce que vous pensiez savoir sur Pâques n'était que la moitié de l'histoire ?",
          description:
            "Explorez l'autre côté de Pâques — une histoire de trahison, d'espérance et d'une affirmation qui a changé le monde.",
          url: 'https://watch.jesusfilm.org/watch/easter/french',
          type: 'website',
          locale: 'fr_FR',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1482424917728-d82d29662023?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGNocmlzdHxlbnwwfHwwfHx8MA%3D%3D',
              width: 1400,
              height: 933,
              alt: 'Pâques - Jesus Film Project',
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
        context.locale ?? 'fr',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}
