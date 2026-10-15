import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { campaignFontsHref } from '@core/journeys/ui/Campaign/libs/campaignFontsHref'
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
import { getFlags } from '../../src/libs/getFlags'
import { isJourneyNotFoundError } from '../../src/libs/isJourneyNotFoundError'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../../src/libs/journeyQueryOptions'

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

  const googleFontsUrl = campaignFontsHref(journey?.journeyTheme)

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
        idType: IdType.slug,
        options: {
          status: JOURNEY_STATUS_EXCLUDE_DRAFT
        }
      }
    })
    // Apollo Client 4 types `data` as optional. The default `none` error
    // policy rejects rather than resolving without data, so this narrows
    // the type rather than guarding a reachable branch.
    if (data == null) throw new Error('GetJourney returned no data')

    const { rtl, locale } = getJourneyRTL(data.journey)
    return {
      props: {
        flags: await getFlags(),
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
    if (isJourneyNotFoundError(e)) {
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
