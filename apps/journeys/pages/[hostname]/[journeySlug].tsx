import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import PlausibleProvider from 'next-plausible'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { Conductor } from '../../src/components/Conductor'
import { createApolloClient } from '../../src/libs/apolloClient'

interface HostJourneyPageProps {
  host: string
  journey: Journey
  locale: string
  rtl: boolean
}

function HostJourneyPage({
  host,
  journey,
  locale,
  rtl
}: HostJourneyPageProps): ReactElement {
  const router = useRouter()
  const isIframe = typeof window !== 'undefined' && window.self !== window.top
  if (isIframe) {
    void router.push('/embed/[journeySlug]', `/embed/${journey.slug}`)
  }
  return (
    <PlausibleProvider
      enabled
      trackLocalhost
      trackFileDownloads
      trackOutboundLinks
      manualPageviews
      customDomain="/plausible"
      domain={`api-journeys-journey-${journey.id}${
        journey.team?.id != null ? `,api-journeys-team-${journey.team.id}` : ''
      }`}
    >
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
      </Head>
      <NextSeo
        nofollow
        noindex
        title={journey.seoTitle ?? undefined}
        description={journey.seoDescription ?? undefined}
        openGraph={{
          type: 'website',
          title: journey.seoTitle ?? undefined,
          url: `https://${host}/${journey.slug}`,
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
      />
      <JourneyProvider value={{ journey }}>
        <ThemeProvider
          themeName={journey.themeName}
          themeMode={journey.themeMode}
          rtl={rtl}
          locale={locale}
        >
          {journey.blocks != null && (
            <Conductor blocks={transformer(journey.blocks)} />
          )}
        </ThemeProvider>
      </JourneyProvider>
    </PlausibleProvider>
  )
}

export const getStaticProps: GetStaticProps<HostJourneyPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug?.toString() ?? '',
        idType: IdType.slug,
        options: {
          hostname: context.params?.hostname?.toString() ?? ''
        }
      }
    })
    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
        host: context.params?.host?.toString() ?? '',
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
        notFound: true,
        revalidate: 1
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

export default HostJourneyPage
