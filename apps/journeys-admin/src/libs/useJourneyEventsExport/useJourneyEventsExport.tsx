import {
  MutationHookOptions,
  gql,
  useLazyQuery
  // useMutation
} from '@apollo/client'
import { stringify } from 'csv-stringify/sync'
import { format } from 'date-fns'
import { useTranslation } from 'next-i18next'

import {
  GetJourneyEvents,
  GetJourneyEventsVariables
} from '../../../__generated__/GetJourneyEvents'

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
          label
          value
          typename
          progress
          messagePlatform
          journey {
            slug
          }
          visitor {
            email
            name
          }
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

const EVENT_CSV_OPTIONS = {
  header: true,
  columns: [
    { key: 'typename', header: 'Event Type' },
    { key: 'label', header: 'Label' },
    { key: 'value', header: 'Value' },
    { key: 'progress', header: 'Video Progress' },
    { key: 'messagePlatform', header: 'Message Platform' },
    { key: 'journeyId', header: 'Journey ID' },
    { key: 'slug', header: 'Slug' },
    { key: 'visitorId', header: 'Visitor ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' }
    //TODO: visitor phone
  ]
}

const ALL_EVENT_TYPES = [
  'ButtonClickEvent',
  'ChatOpenEvent',
  'JourneyViewEvent',
  'RadioQuestionSubmissionEvent',
  'SignUpSubmissionEvent',
  'StepViewEvent',
  'StepNextEvent',
  'StepPreviousEvent',
  'TextResponseSubmissionEvent',
  'VideoStartEvent',
  'VideoPlayEvent',
  'VideoPauseEvent',
  'VideoCompleteEvent',
  'VideoExpandEvent',
  'VideoCollapseEvent',
  'VideoProgressEvent'
]

const FILTERED_EVENTS = ALL_EVENT_TYPES.filter((event) => {
  if (
    event === 'StepViewEvent' ||
    event === 'StepNextEvent' ||
    event === 'StepPreviousEvent' ||
    event === 'VideoExpandEvent' ||
    event === 'VideoCollapseEvent'
  ) {
    return false
  } else {
    return event
  }
})

export function useJourneyEventsExport(): {
  exportJourneyEvents: ({
    journeyId,
    filter
  }: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>) => Promise<void>
} {
  const { t } = useTranslation('apps-journeys-admin')
  const [getJourneyEvents] = useLazyQuery(GET_JOURNEY_EVENTS_EXPORT)

  function handleCsvProcessing(eventData: any[]): void {
    const journeySlug = eventData[0]?.journey?.slug

    const csv = stringify(eventData, EVENT_CSV_OPTIONS)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const today = format(new Date(), 'yyyy-MM-dd')
    const fileName = `[${today}] ${journeySlug}.csv`
    const link = document.createElement('a')

    link.target = '_blank'
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  async function exportJourneyEvents({
    journeyId,
    filter
  }: Pick<GetJourneyEventsVariables, 'journeyId' | 'filter'>): Promise<void> {
    const events: any[] = []
    let cursor: string | null = null
    let hasNextPage = false

    try {
      do {
        const { data } = await getJourneyEvents({
          variables: {
            journeyId,
            filter: {
              ...filter,
              typenames: FILTERED_EVENTS
            },
            first: 50,
            after: cursor
          }
        })

        if (data?.journeyEventsConnection == null) {
          throw new Error(t('Failed to retrieve data for export.'))
        }

        const edges = data?.journeyEventsConnection.edges ?? []
        events.push(...edges)

        cursor = data?.journeyEventsConnection.pageInfo.endCursor
        hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
      } while (hasNextPage)

      const eventData = events.map((edge) => {
        return {
          ...edge.node,
          slug: edge.node.journey?.slug,
          name: edge.node.visitor?.name,
          email: edge.node.visitor?.email
        }
      })

      handleCsvProcessing(eventData)
      // TODO: Update exportHistory
    } catch (e) {
      throw new Error(t('Failed to retrieve data for export.'))
    }
  }

  return {
    exportJourneyEvents
  }
}
