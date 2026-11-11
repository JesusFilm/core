import { GetStaticProps } from 'next'
import dynamic from 'next/dynamic'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import { GetJourney, GetJourneyVariables } from '../../__generated__/GetJourney'
import {
  GetJourneysSummary,
  GetJourneysSummaryVariables
} from '../../__generated__/GetJourneysSummary'
import { IdType } from '../../__generated__/globalTypes'
import i18nConfig from '../../next-i18next.config'
import { createApolloClient } from '../../src/libs/apolloClient'
import { getFlags } from '../../src/libs/getFlags'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../../src/libs/journeyQueryOptions'
import {
  CampaignRouteProps,
  campaignStaticPropsFor,
  getBlockingStaticPaths,
  readCampaignPage
} from '../../src/libs/resolveCampaignPage'
import JourneysPage, { GET_JOURNEYS } from '../home'

import { HostedJourney } from './[journeySlug]'

// The campaign branch only renders for a Campaign Domain; collection and
// single-journey domains never download it.
const CampaignRoute = dynamic(
  async () =>
    (
      await import(
        /* webpackChunkName: "CampaignRoute" */ '../../src/components/CampaignRoute'
      )
    ).CampaignRoute
)

interface HostCollectionProps {
  host?: string
  journeys?: GetJourneysSummary['journeys']
  journey?: GetJourney['journey']
}

type HostRootPageProps = HostCollectionProps | CampaignRouteProps

// `/` on a custom domain: its campaign's landing page, else its only
// journey, else its journey collection.
function HostRootPage(props: HostRootPageProps): ReactElement {
  if ('kind' in props) return <CampaignRoute {...props} />
  const { journeys, journey, host } = props
  if (journey == null) return <JourneysPage journeys={journeys ?? []} />

  const { rtl, locale } = getJourneyRTL(journey)
  return (
    <HostedJourney
      journey={journey}
      host={host ?? ''}
      locale={locale}
      rtl={rtl}
    />
  )
}

/** The domain's journey collection, or its only journey, or not found. */
const hostRootStaticProps: GetStaticProps<HostCollectionProps> = async (
  context
) => {
  const apolloClient = createApolloClient()
  const { data } = await apolloClient.query<
    GetJourneysSummary,
    GetJourneysSummaryVariables
  >({
    query: GET_JOURNEYS,
    variables: {
      options: {
        hostname: context.params?.hostname as string,
        journeyCollection: true
      }
    }
  })
  // Apollo Client 4 types `data` as optional. The default `none` error
  // policy rejects rather than resolving without data, so this narrows
  // the type rather than guarding a reachable branch.
  if (data == null) throw new Error('GetJourneysSummary returned no data')

  if (data.journeys === null) {
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
            hostname: context.params?.hostname?.toString() ?? '',
            status: JOURNEY_STATUS_EXCLUDE_DRAFT
          }
        }
      })
      // Apollo Client 4 types `data` as optional. The default `none` error
      // policy rejects rather than resolving without data, so this narrows
      // the type rather than guarding a reachable branch.
      if (journeyData == null) throw new Error('GetJourney returned no data')

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
        },
        revalidate: 60
      }
    } catch {
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
  }
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      )),
      journeys: data.journeys
    },
    revalidate: 60
  }
}

// Campaign Domain first: its published campaign owns `/`. Also the route of
// `_lang/[lang]`: the collection and a journey ignore the tag.
export const getStaticProps: GetStaticProps<HostRootPageProps> = async (
  context
) => {
  const result = await readCampaignPage(context)
  if (result.kind === 'notACampaign') return await hostRootStaticProps(context)
  return await campaignStaticPropsFor(result, context.locale)
}

export const getStaticPaths = getBlockingStaticPaths

export default HostRootPage
