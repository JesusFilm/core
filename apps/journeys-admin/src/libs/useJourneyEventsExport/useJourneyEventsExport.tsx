import { gql, useLazyQuery, useMutation } from '@apollo/client'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import {
  GetJourneyEvents_journeyEventsConnection_edges as JourneyEventEdge,
  GetJourneyEvents_journeyEventsConnection_edges_node as JourneyEventNode
} from '../../../__generated__/GetJourneyEvents'

import { FILTERED_EVENTS } from './utils/constants'
import { processContactsCsv } from './utils/processContactsCsv/processContactsCsv'
import { processCsv } from './utils/processCsv'
import { transformEvents } from './utils/transformEvents'

function hasValidEventContactData(event: JourneyEvent): boolean {
  const hasName = event.visitorName != null && String(event.visitorName).trim() !== ''
  const hasEmail = event.visitorEmail != null && String(event.visitorEmail).trim() !== ''
  const hasPhone = event.visitorPhone != null && String(event.visitorPhone).trim() !== ''
  
  return hasName || hasEmail || hasPhone
}

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

export const GET_JOURNEY_CONTACTS = gql`
  query GetJourneyContacts(
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
          visitorName
          visitorEmail
          visitorPhone
          journeySlug
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

export interface JourneyEvent
  extends Omit<
    JourneyEventNode,
    '__typename' | 'journey' | 'visitor' | 'progress'
  > {
  slug?: string | null
  name?: string | null
  email?: string | null
}

export interface ExtendedJourneyEventsFilter {
  typenames?: string[]
  periodRangeStart?: string
  periodRangeEnd?: string
}

export interface ExportJourneyEventsParams {
  journeyId: string
  filter: ExtendedJourneyEventsFilter
}

export interface JourneyContact {
  visitorId: string
  visitorName?: string | null
  visitorEmail?: string | null
  visitorPhone?: string | null
  journeyId: string
  journeySlug?: string | null
  firstEventAt?: string | null
  lastEventAt?: string | null
  totalEvents?: number | null
}

export interface JourneyContactsFilter {
  periodRangeStart?: string
  periodRangeEnd?: string
}

export interface ExportJourneyContactsParams {
  journeyId: string
  filter: JourneyContactsFilter
  contactDataFields: string[]
}

export function useJourneyEventsExport(): {
  exportJourneyEvents: (params: ExportJourneyEventsParams) => Promise<void>
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
  }: ExportJourneyEventsParams): Promise<void> {
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
      
      // Filter out events that don't have meaningful contact data
      const validEventData = eventData.filter(hasValidEventContactData)
      
      if (validEventData.length === 0) {
        throw new Error(t('No events found with contact data'))
      }

      const journeySlug = events[0]?.node.journeySlug ?? ''
      processCsv(validEventData, journeySlug, t)

      // Log the export (fire and forget, don't block on this)
      createEventsExportLog({
        variables: {
          input: {
            journeyId,
            eventsFilter: filter?.typenames ?? [],
            dateRangeStart: filter?.periodRangeStart,
            dateRangeEnd: filter?.periodRangeEnd
          }
        }
      }).catch((error) => {
        // Log the error but don't throw - export logging failure shouldn't block the export
        console.warn('Failed to log events export:', error)
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

export function useJourneyContactsExport(): {
  exportJourneyContacts: (params: ExportJourneyContactsParams) => Promise<void>
  downloading: boolean
  progress: number
} {
  const { t } = useTranslation('apps-journeys-admin')
  const [getJourneyContacts] = useLazyQuery(GET_JOURNEY_CONTACTS)

  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  async function exportJourneyContacts({
    journeyId,
    filter,
    contactDataFields
  }: ExportJourneyContactsParams): Promise<void> {
    const events: JourneyEventEdge[] = []
    let cursor: string | null = null
    let hasNextPage = false

    const filterArg = omitBy(
      {
        periodRangeStart: filter?.periodRangeStart,
        periodRangeEnd: filter?.periodRangeEnd
      },
      isNil
    )

    try {
      setDownloading(true)
      setProgress(0)

      do {
        const { data } = await getJourneyContacts({
          variables: {
            journeyId,
            filter: filterArg,
            first: 20000,
            after: cursor
          }
        })

        if (data?.journeyEventsConnection == null) {
          throw new Error(t('Failed to retrieve contacts for export.'))
        }

        const edges = data?.journeyEventsConnection.edges ?? []
        events.push(...edges)

        setProgress(
          Math.floor((events.length / Math.max(events.length, 1)) * 100)
        )

        cursor = data?.journeyEventsConnection.pageInfo.endCursor
        hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
      } while (hasNextPage)

      // Extract unique contacts from events
      const contactMap = new Map<string, JourneyContact>()

      events.forEach((edge) => {
        const node = edge.node
        const visitorId = node.visitorId

        if (!visitorId) return // Skip events without visitorId

        if (!contactMap.has(visitorId)) {
          contactMap.set(visitorId, {
            visitorId,
            visitorName: node.visitorName ?? null,
            visitorEmail: node.visitorEmail ?? null,
            visitorPhone: node.visitorPhone ?? null,
            journeyId: node.journeyId,
            journeySlug: node.journeySlug ?? null,
            firstEventAt: node.createdAt as string,
            lastEventAt: node.createdAt as string,
            totalEvents: 1
          })
        } else {
          // Update existing contact with latest event info
          const existingContact = contactMap.get(visitorId)!
          existingContact.lastEventAt = node.createdAt as string
          existingContact.totalEvents = (existingContact.totalEvents ?? 0) + 1
        }
      })

      const contacts: JourneyContact[] = Array.from(contactMap.values())
      setProgress(100)

      const journeySlug = contacts[0]?.journeySlug ?? ''
      processContactsCsv(contacts, journeySlug, t, contactDataFields)
    } catch {
      throw new Error(t('Failed to retrieve contacts for export.'))
    } finally {
      setDownloading(false)
    }
  }

  return { exportJourneyContacts, downloading, progress }
}
