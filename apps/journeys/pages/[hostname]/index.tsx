import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'
import type { CampaignPublic, WorldMapShapes } from '@core/journeys/ui/Campaign'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import { GetJourney, GetJourneyVariables } from '../../__generated__/GetJourney'
import {
  GetJourneysSummary,
  GetJourneysSummaryVariables
} from '../../__generated__/GetJourneysSummary'
import { CampaignPageKind, IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { CampaignPageWrapper } from '../../src/components/CampaignPageWrapper'
import { createApolloClient } from '../../src/libs/apolloClient'
import {
  campaignPageCacheControl,
  fetchCampaignPublicInPageLanguageByHostname
} from '../../src/libs/getCampaignPublic'
import { getFlags } from '../../src/libs/getFlags'
import { getWorldMap } from '../../src/libs/getWorldMap'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../../src/libs/journeyQueryOptions'
import JourneysPage, { GET_JOURNEYS } from '../home'

import { HostJourneyPage } from './[journeySlug]'

interface HostJourneysPageProps {
  host?: string
  journeys: GetJourneysSummary['journeys']
  journey?: GetJourney['journey']
  campaign?: CampaignPublic
  worldMap?: WorldMapShapes
}

function HostJourneysPage({
  journeys,
  journey,
  campaign,
  worldMap,
  host
}: HostJourneysPageProps): ReactElement {
  if (campaign != null)
    return (
      <CampaignPageWrapper
        campaign={campaign}
        pageKind={CampaignPageKind.landing}
        worldMap={worldMap}
        basePath=""
      />
    )

  if (journey == null) return <JourneysPage journeys={journeys} />

  const { rtl, locale } = getJourneyRTL(journey)
  return (
    <HostJourneyPage
      journey={journey}
      host={host ?? ''}
      locale={locale}
      rtl={rtl}
    />
  )
}

// The collection and journey branches keep the 60 s shared-cache window the
// static page gave them.
const SHARED_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300'
const NOT_FOUND_CACHE_CONTROL = 'public, s-maxage=1'

// Rendered per request: a Campaign Root's landing page is decided in the
// visitor's Page Language (`?lang` → cookie → `Accept-Language` → default),
// exactly as at `/campaign/<slug>`, and cached per `campaignPageCacheControl`.
export const getServerSideProps: GetServerSideProps<
  HostJourneysPageProps
> = async (context) => {
  const apolloClient = createApolloClient()
  const hostname = context.params?.hostname as string

  // Campaign Root first: a published root campaign owns `/`, else today's
  // collection logic below runs unchanged.
  const root = await fetchCampaignPublicInPageLanguageByHostname(
    apolloClient,
    hostname,
    {
      param: context.query.lang,
      cookie: context.req.cookies[CAMPAIGN_LANGUAGE_COOKIE],
      acceptLanguage: context.req.headers['accept-language']
    }
  )
  if (root != null) {
    context.res.setHeader(
      'Cache-Control',
      campaignPageCacheControl(root.language, root.campaign.languages.length)
    )
    return {
      props: {
        flags: await getFlags(),
        ...(await serverSideTranslations(
          context.locale ?? 'en',
          ['apps-journeys', 'libs-journeys-ui'],
          i18nConfig
        )),
        journeys: [],
        campaign: root.campaign,
        worldMap: await getWorldMap()
      }
    }
  }

  const { data } = await apolloClient.query<
    GetJourneysSummary,
    GetJourneysSummaryVariables
  >({
    query: GET_JOURNEYS,
    variables: {
      options: {
        hostname,
        journeyCollection: true
      }
    }
  })
  // Apollo Client 4 types `data` as optional. The default `none` error
  // policy rejects rather than resolving without data, so this narrows
  // the type rather than guarding a reachable branch.
  if (data == null) throw new Error('GetJourneysSummary returned no data')

  if (data.journeys === null) {
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
  } else if (data.journeys.length === 1) {
    try {
      const { data: journeyData } = await apolloClient.query<
        GetJourney,
        GetJourneyVariables
      >({
        query: GET_JOURNEY,
        variables: {
          id: data.journeys[0].slug.toString(),
          idType: IdType.slug,
          options: {
            hostname,
            status: JOURNEY_STATUS_EXCLUDE_DRAFT
          }
        }
      })
      // Apollo Client 4 types `data` as optional. The default `none` error
      // policy rejects rather than resolving without data, so this narrows
      // the type rather than guarding a reachable branch.
      if (journeyData == null) throw new Error('GetJourney returned no data')

      context.res.setHeader('Cache-Control', SHARED_CACHE_CONTROL)
      return {
        props: {
          flags: await getFlags(),
          host: context.params?.host?.toString() ?? '',
          ...(await serverSideTranslations(
            context.locale ?? 'en',
            ['apps-journeys', 'libs-journeys-ui'],
            i18nConfig
          )),
          journey: journeyData.journey,
          journeys: []
        }
      }
    } catch {
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
  }
  context.res.setHeader('Cache-Control', SHARED_CACHE_CONTROL)
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      )),
      journeys: data.journeys
    }
  }
}

export default HostJourneysPage
