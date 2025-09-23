import { gql, useLazyQuery, useMutation } from '@apollo/client'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import {
  GetJourneyEventsVariables,
  GetJourneyEvents_journeyEventsConnection_edges as JourneyEventEdge,
  GetJourneyEvents_journeyEventsConnection_edges_node as JourneyEventNode
} from '../../../__generated__/GetJourneyEvents'

import { FILTERED_EVENTS } from './utils/constants'
import { processCsv } from './utils/processCsv'
import { transformEvents } from './utils/transformEvents'

export const GET_JOURNEY_EVENTS_COUNT = gql`
  query GetJourneyEventsCount($journeyId: ID!, $filter: JourneyEventsFilter) {
    journeyEventsCount(journeyId: $journeyId, filter: $filter)
  }
`

export const GET_JOURNEY_EVENTS_EXPORT = gql`
  query GetJourneyEvents(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $first: Int
    $after: String
  ) {
    journeyEventsConnection(
      journeyId: $journeyId
      filter: $filter
      first: $first
      after: $after
    ) {
      edges {
        cursor
        node {
          journeyId
          visitorId
          label
          value
          typename
          progress
          journeySlug
          visitorName
          visitorEmail
          visitorPhone
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
  }
`

export const CREATE_EVENTS_EXPORT_LOG = gql`
  mutation CreateEventsExportLog($input: JourneyEventsExportLogInput!) {
    createJourneyEventsExportLog(input: $input) {
      id
    }
  }
`

export interface JourneyEvent
  extends Omit<
    JourneyEventNode,
    '__typename' | 'journey' | 'visitor' | 'progress'
  > {
  slug?: string | null
  name?: string | null
  email?: string | null
}

export function useJourneyEventsExport(): {
  exportJourneyEvents: ({
    journeyId,
    filter
  }: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>) => Promise<void>
  downloading: boolean
  progress: number
} {
  const { t } = useTranslation('apps-journeys-admin')
  const [getJourneyEventsCount] = useLazyQuery(GET_JOURNEY_EVENTS_COUNT)
  const [getJourneyEvents] = useLazyQuery(GET_JOURNEY_EVENTS_EXPORT)
  const [createEventsExportLog] = useMutation(CREATE_EVENTS_EXPORT_LOG)

  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function exportJourneyEvents({
    journeyId,
    filter
  }: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>): Promise<void> {
    const events: JourneyEventEdge[] = []
    let cursor: string | null = null
    let hasNextPage = false
    let total = 0

    const filterTypenames = filter?.typenames ?? []
    const typenames =
      filterTypenames.length > 0
        ? FILTERED_EVENTS.filter((event) => {
            if (filterTypenames.includes(event)) {
              return true
            }
            return false
          })
        : FILTERED_EVENTS

    const filterArg = {
      typenames,
      ...omitBy(
        {
          periodRangeStart: filter?.periodRangeStart,
          periodRangeEnd: filter?.periodRangeEnd
        },
        isNil
      )
    }

    try {
      setDownloading(true)
      setProgress(0)

      const { data } = await getJourneyEventsCount({
        variables: {
          journeyId,
          filter: filterArg
        }
      })

      total = data.journeyEventsCount ?? 0

      do {
        const { data } = await getJourneyEvents({
          variables: {
            journeyId,
            filter: filterArg,
            first: 20000,
            after: cursor
          }
        })

        if (data?.journeyEventsConnection == null) {
          throw new Error(t('Failed to retrieve data for export.'))
        }

        const edges = data?.journeyEventsConnection.edges ?? []
        events.push(...edges)

        setProgress(Math.floor((events.length / total) * 100))

        cursor = data?.journeyEventsConnection.pageInfo.endCursor
        hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
      } while (hasNextPage)

      const eventData = transformEvents(events)

      const journeySlug = events[0]?.node.journeySlug ?? ''
      processCsv(eventData, journeySlug, t)

      void createEventsExportLog({
        variables: {
          input: {
            journeyId,
            eventsFilter: filter?.typenames ?? [],
            dateRangeStart: filter?.periodRangeStart,
            dateRangeEnd: filter?.periodRangeEnd
          }
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new Error(t('Failed to retrieve data for export.'))
    } finally {
      setDownloading(false)
    }
  }

  return { exportJourneyEvents, downloading, progress }
}