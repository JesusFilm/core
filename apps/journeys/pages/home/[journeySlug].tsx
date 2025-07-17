import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { JourneyPageWrapper } from '../../src/components/JourneyPageWrapper'
import { JourneyRenderer } from '../../src/components/JourneyRenderer'
import { createApolloClient } from '../../src/libs/apolloClient'

interface JourneyPageProps {
  journey: Journey
  locale: string
  rtl: boolean
}

function JourneyPage({ journey, locale, rtl }: JourneyPageProps): ReactElement {
  const router = useRouter()
  const isIframe = typeof window !== 'undefined' && window.self !== window.top
  if (isIframe) {
    void router.push('/embed/[journeySlug]', `/embed/${journey.slug}`)
  }

  // Get journey-specific fonts if they exist
  const defaultFonts = ['Montserrat', 'Open Sans', 'El Messiri']
  const journeyFonts = getSortedValidFonts([
    ...defaultFonts,
    journey?.journeyTheme?.headerFont ?? '',
    journey?.journeyTheme?.bodyFont ?? '',
    journey?.journeyTheme?.labelFont ?? ''
  ])

  function getSortedValidFonts(fonts: string[]): string[] {
    return [...new Set(fonts.filter((font) => font !== ''))].sort()
  }

  function formatFontName(font: string): string {
    return font.trim().replace(/ /g, '+')
  }

  const fontsParam = journeyFonts
    .map((font) => `family=${formatFontName(font)}:wght@400;500;600;700;800`)
    .join('&')

  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontsParam}&display=swap`

  return (
    <>
      <Head>
        <link
          rel="alternate"
          type="application/json+oembed"
          href={`https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/api/oembed?url=https%3A%2F%2F${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }%2F${journey.slug}&format=json`}
          title={journey.seoTitle ?? undefined}
        />
        <link rel="stylesheet" href={googleFontsUrl} />
      </Head>
      <NextSeo
        nofollow
        noindex
        title={journey.seoTitle ?? undefined}
        description={journey.seoDescription ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? undefined,
          url: `https://${
            process.env.NEXT_PUBLIC_VERCEL_URL ?? 'your.nextstep.is'
          }/${journey.slug}`,
          description: journey.seoDescription ?? undefined,
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
      <JourneyPageWrapper journey={journey} rtl={rtl} locale={locale}>
        <JourneyRenderer />
      </JourneyPageWrapper>
    </>
  )
}

export const getStaticProps: GetStaticProps<JourneyPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug?.toString() ?? '',
        idType: IdType.slug
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
        ...(await serverSideTranslations(
          locale ?? 'en',
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
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default JourneyPage
