import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
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
import JourneysPage, { GET_JOURNEYS } from '../home'

import ImportedHostJourneyPage from './[journeySlug]'

interface HostJourneyPageProps {
  journey: GetJourney['journey']
  host: string | undefined
}

function HostJourneyPage({
  journey,
  host
}: HostJourneyPageProps): ReactElement {
  const { rtl, locale } = getJourneyRTL(journey)
  return (
    <ImportedHostJourneyPage
      journey={journey}
      host={host ?? ''}
      locale={locale}
      rtl={rtl}
    />
  )
}

interface HostJourneysPageProps {
  host?: string
  journeys: GetJourneysSummary['journeys']
  journey?: GetJourney['journey']
}

function HostJourneysPage({
  journeys,
  journey,
  host
}: HostJourneysPageProps): ReactElement {
  return journey != null ? (
    <HostJourneyPage journey={journey} host={host} />
  ) : (
    <JourneysPage journeys={journeys} />
  )
}

export const getStaticProps: GetStaticProps<HostJourneysPageProps> = async (
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
            hostname: context.params?.hostname?.toString() ?? ''
          }
        }
      })
      return {
        props: {
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default HostJourneysPage
