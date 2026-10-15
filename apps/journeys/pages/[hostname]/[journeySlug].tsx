import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import type {
  CampaignPublic,
  CampaignRegion,
  WorldMapShapes
} from '@core/journeys/ui/Campaign'
import { matchRegionSlug } from '@core/journeys/ui/Campaign/libs/matchRegionSlug'
import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign/libs/resolvePageLanguage'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  GetJourney,
  GetJourneyVariables,
  GetJourney_journey as Journey
} from '../../__generated__/GetJourney'
import { CampaignPageKind, IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { JourneyPageWrapper } from '../../src/components/JourneyPageWrapper'
import { JourneyRenderer } from '../../src/components/JourneyRenderer'
import { createApolloClient } from '../../src/libs/apolloClient'
import {
  campaignPageCacheControl,
  fetchCampaignPublicInPageLanguageByHostname
} from '../../src/libs/getCampaignPublic'
import { getFlags } from '../../src/libs/getFlags'
import { getWorldMap } from '../../src/libs/getWorldMap'
import { isJourneyNotFoundError } from '../../src/libs/isJourneyNotFoundError'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../../src/libs/journeyQueryOptions'

// The campaign branch only renders for a Campaign Root domain; journey visitors
// never download it.
const CampaignPageWrapper = dynamic(
  async () =>
    (
      await import(
        /* webpackChunkName: "CampaignPageWrapper" */ '../../src/components/CampaignPageWrapper'
      )
    ).CampaignPageWrapper
)

interface HostJourneyPageProps {
  host: string
  journey: Journey
  locale: string
  rtl: boolean
}

interface HostSlugPageProps {
  host: string
  journey?: Journey
  locale?: string
  rtl?: boolean
  campaign?: CampaignPublic
  region?: CampaignRegion
  worldMap?: WorldMapShapes
}

export function HostJourneyPage({
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
      <JourneyPageWrapper journey={journey} rtl={rtl} locale={locale}>
        <JourneyRenderer />
      </JourneyPageWrapper>
    </>
  )
}

// `/<segment>` on a domain is a region of its Campaign Root first, then a
// journey slug (a region outranks a journey with the same spelling).
function HostSlugPage({
  campaign,
  region,
  worldMap,
  journey,
  host,
  locale,
  rtl
}: HostSlugPageProps): ReactElement {
  if (campaign != null && region != null)
    return (
      <CampaignPageWrapper
        campaign={campaign}
        pageKind={CampaignPageKind.regionTemplate}
        region={region}
        worldMap={worldMap}
        basePath=""
      />
    )

  if (journey == null) return <></>

  return (
    <HostJourneyPage
      host={host}
      journey={journey}
      locale={locale ?? 'en'}
      rtl={rtl ?? false}
    />
  )
}

// The journey branch keeps the 60 s shared-cache window the static page gave
// it.
const SHARED_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'
const NOT_FOUND_CACHE_CONTROL = 'public, s-maxage=1'

// Rendered per request: a region of the domain's Campaign Root is decided in
// the visitor's Page Language (`?lang` → cookie → `Accept-Language` →
// default), exactly as at `/campaign/<slug>/<region>`, and cached per
// `campaignPageCacheControl`. Any other segment is a journey slug.
export const getServerSideProps: GetServerSideProps<HostSlugPageProps> = async (
  context
) => {
  const apolloClient = createApolloClient()

  const root = await fetchCampaignPublicInPageLanguageByHostname(
    apolloClient,
    context.params?.hostname?.toString() ?? '',
    {
      param: context.query.lang,
      cookie: context.req.cookies[CAMPAIGN_LANGUAGE_COOKIE],
      acceptLanguage: context.req.headers['accept-language']
    }
  )
  const region =
    root == null
      ? null
      : matchRegionSlug(
          context.params?.journeySlug?.toString(),
          root.campaign.regions
        )
  if (root != null && region != null) {
    context.res.setHeader(
      'Cache-Control',
      campaignPageCacheControl(root.language, root.campaign.languages.length)
    )
    return {
      props: {
        flags: await getFlags(),
        host: context.params?.host?.toString() ?? '',
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        campaign: root.campaign,
        region,
        worldMap: await getWorldMap()
      }
    }
  }

  try {
    const { data } = await apolloClient.query<GetJourney, GetJourneyVariables>({
      query: GET_JOURNEY,
      variables: {
        id: context.params?.journeySlug?.toString() ?? '',
        idType: IdType.slug,
        options: {
          hostname: context.params?.hostname?.toString() ?? '',
          status: JOURNEY_STATUS_EXCLUDE_DRAFT
        }
      }
    })
    // Apollo Client 4 types `data` as optional. The default `none` error
    // policy rejects rather than resolving without data, so this narrows
    // the type rather than guarding a reachable branch.
    if (data == null) throw new Error('GetJourney returned no data')

    const { rtl, locale } = getJourneyRTL(data.journey)
    context.res.setHeader('Cache-Control', SHARED_CACHE_CONTROL)
    return {
      props: {
        flags: await getFlags(),
        hostname: context.params?.hostname?.toString() ?? '',
        host: context.params?.host?.toString() ?? '',
        ...(await serverSideTranslations(
          locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journey: data.journey,
        locale,
        rtl
      }
    }
  } catch (e) {
    if (isJourneyNotFoundError(e)) {
      context.res.setHeader('Cache-Control', NOT_FOUND_CACHE_CONTROL)
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

export default HostSlugPage
