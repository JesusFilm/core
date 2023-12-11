import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement, useMemo } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { GetJourneySlugs } from '../../__generated__/GetJourneySlugs'
import { StepFields } from '../../__generated__/StepFields'
import i18nConfig from '../../next-i18next.config'
import { EmbeddedPreview } from '../../src/components/EmbeddedPreview'
import { createApolloClient } from '../../src/libs/apolloClient'
import { GET_JOURNEY, GET_JOURNEY_SLUGS } from '../[journeySlug]'

interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

function JourneyPage({ journey, locale, rtl }: JourneyPageProps): ReactElement {
  const blocks = useMemo(() => {
    return transformer(journey.blocks ?? [])
  }, [journey])

  const theme =
    blocks.length > 0
      ? getStepTheme(blocks[0] as TreeBlock<StepFields>, journey)
      : { themeName: journey.themeName, themeMode: journey.themeMode }
  return (
    <>
      <NextSeo
        title={journey.title}
        nofollow
        noindex
        description={journey.description ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? journey.title,
          url: `https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/embed/${journey.slug}`,
          description:
            journey.seoDescription ?? journey.description ?? undefined,
          images:
            journey.primaryImageBlock?.src != null
              ? [
                  {
                    url: journey.primaryImageBlock.src,
                    width: journey.primaryImageBlock.width,
                    height: journey.primaryImageBlock.height,
                    alt: journey.primaryImageBlock.alt,
                    type: 'image/jpeg'
                  }
                ]
              : []
        }}
        facebook={
          process.env.NEXT_PUBLIC_FACEBOOK_APP_ID != null
            ? {
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
              }
            : undefined
        }
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <style jsx global>{`
        body {
          background: transparent !important;
        }
      `}</style>
      <JourneyProvider value={{ journey, variant: 'embed' }}>
        <ThemeProvider {...theme} rtl={rtl} locale={locale}>
          {journey.blocks != null && (
            <EmbeddedPreview blocks={transformer(journey.blocks)} />
          )}
        </ThemeProvider>
      </JourneyProvider>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)

    return {
      props: {
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journey: data.journey,
        locale,
        rtl
      },
      revalidate: 60
    }
  } catch (e) {
    if (e.message === 'journey not found') {
      return {
        props: {
          ...(await serverSideTranslations(
            context.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          ))
        },
        notFound: true
      }
    }
    throw e
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<GetJourneySlugs>({
    query: GET_JOURNEY_SLUGS
  })

  const paths = data.journeys.map(({ slug: journeySlug }) => ({
    params: { journeySlug }
  }))

  return {
    paths,
    fallback: 'blocking'
  }
}

export default JourneyPage
