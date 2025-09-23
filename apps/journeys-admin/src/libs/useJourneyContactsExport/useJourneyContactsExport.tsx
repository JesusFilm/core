import { gql, useLazyQuery } from '@apollo/client'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { processContactsCsv } from './utils/processContactsCsv/processContactsCsv'

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
          visitorId
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

export interface JourneyContact {
  visitorId: string
  visitorName?: string | null
  visitorEmail?: string | null
  visitorPhone?: string | null
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
    const events: any[] = []
    let cursor: string | null = null
    let hasNextPage = false

    const filterArg = {
      ...omitBy(
        {
          periodRangeStart: filter?.periodRangeStart,
          periodRangeEnd: filter?.periodRangeEnd
        },
        isNil
      )
    }

    console.log('Contacts export filter:', filterArg)

    try {
      setDownloading(true)
      setProgress(0)

      do {
        const { data, error } = await getJourneyContacts({
          variables: {
            journeyId,
            filter: filterArg,
            first: 20000,
            after: cursor
          }
        })

        if (error) {
          console.error('GraphQL error:', error)
          throw new Error(t('GraphQL error: {{error}}', { error: error.message }))
        }

        if (data?.journeyEventsConnection == null) {
          console.error('No journeyEventsConnection in response:', data)
          throw new Error(t('No journey events connection found in response'))
        }

        const edges = data?.journeyEventsConnection.edges ?? []
        console.log('Retrieved edges:', edges.length)
        events.push(...edges)
        
        setProgress((p) => Math.min(p + 10, 90))

        cursor = data?.journeyEventsConnection.pageInfo.endCursor
        hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
      } while (hasNextPage)

      // Extract unique contacts from events
      const contactMap = new Map<string, JourneyContact>()
      
      events.forEach((edge) => {
        const node = edge.node
        const visitorId = node.visitorId
        
        // Only add if we don't have this visitor yet, or if this event has more complete data
        if (!contactMap.has(visitorId)) {
          contactMap.set(visitorId, {
            visitorId: node.visitorId,
            visitorName: node.visitorName ?? null,
            visitorEmail: node.visitorEmail ?? null,
            visitorPhone: node.visitorPhone ?? null
          })
        } else {
          // Update existing contact with any new data
          const existing = contactMap.get(visitorId)!
          contactMap.set(visitorId, {
            visitorId: node.visitorId,
            visitorName: existing.visitorName ?? node.visitorName ?? null,
            visitorEmail: existing.visitorEmail ?? node.visitorEmail ?? null,
            visitorPhone: existing.visitorPhone ?? node.visitorPhone ?? null
          })
        }
      })

      const contacts = Array.from(contactMap.values())
      console.log('Extracted unique contacts:', contacts.length)

      setProgress(100)

      // Use journeyId as fallback since journeySlug is not available from events query
      const journeySlug = journeyId
      processContactsCsv(contacts, journeySlug, t, contactDataFields)
    } catch (error) {
      console.error('Contacts export error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(t('Failed to retrieve contacts for export.'))
    } finally {
      setDownloading(false)
    }
  }

  return { exportJourneyContacts, downloading, progress }
}
