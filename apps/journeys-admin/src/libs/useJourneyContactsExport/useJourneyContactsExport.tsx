import { gql, useLazyQuery } from '@apollo/client'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { processContactsCsv } from './utils/processContactsCsv/processContactsCsv'

const ACCEPTED_EVENT_TYPES = [
  'RadioQuestionSubmissionEvent',
  'TextResponseSubmissionEvent'
]

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
          typename
          label
          value
          blockId
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

export interface JourneyEventNode {
  visitorId: string
  visitorName?: string | null
  visitorEmail?: string | null
  visitorPhone?: string | null
  createdAt: string
  typename: string
  label?: string | null
  value?: string | unknown
  blockId?: string | null
}

export interface JourneyEventEdge {
  cursor: string
  node: JourneyEventNode
}

export interface JourneyContact {
  visitorId: string
  visitorName?: string | null
  visitorEmail?: string | null
  visitorPhone?: string | null
  responseFields?: Record<string, string>
  responseFieldLabels?: Record<string, string>
}

export type FlattenedContact = Record<string, string | null | undefined>

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

  async function* fetchEventsPaginated(
    journeyId: string,
    filterArg: any
  ): AsyncGenerator<JourneyEventEdge[], void, unknown> {
    let cursor: string | null = null
    let hasNextPage = true

    while (hasNextPage) {
      const { data, error } = await getJourneyContacts({
        variables: {
          journeyId,
          filter: filterArg,
          first: 1000, // Smaller chunks for better memory management
          after: cursor
        }
      })

      if (error) {
        console.error('GraphQL error:', error)
        throw new Error(t('GraphQL error: {{error}}', { error: error.message }))
      }

      if (data?.journeyEventsConnection == null) {
        console.error('No journeyEventsConnection in response')
        throw new Error(t('No journey events connection found in response'))
      }

      const edges = data?.journeyEventsConnection.edges ?? []
      yield edges

      cursor = data?.journeyEventsConnection.pageInfo.endCursor
      hasNextPage = data?.journeyEventsConnection.pageInfo.hasNextPage
    }
  }

  // Process edges incrementally
  function processEdges(
    edges: JourneyEventEdge[],
    contactMap: Map<string, JourneyContact>,
    responseFieldMap: Map<
      string,
      Map<
        string,
        { value: string; createdAt: string; blockId?: string; label: string }
      >
    >
  ): void {
    edges.forEach((edge) => {
      const node = edge.node
      const visitorId = node.visitorId

      // Collect contact data (name, email, phone) from any event
      if (!contactMap.has(visitorId)) {
        contactMap.set(visitorId, {
          visitorId: node.visitorId,
          visitorName: node.visitorName ?? null,
          visitorEmail: node.visitorEmail ?? null,
          visitorPhone: node.visitorPhone ?? null,
          responseFields: {},
          responseFieldLabels: {}
        })
      } else {
        // Update contact data with any new information
        const existing = contactMap.get(visitorId)!
        contactMap.set(visitorId, {
          visitorId: node.visitorId,
          visitorName: existing.visitorName ?? node.visitorName ?? null,
          visitorEmail: existing.visitorEmail ?? node.visitorEmail ?? null,
          visitorPhone: existing.visitorPhone ?? node.visitorPhone ?? null,
          responseFields: { ...existing.responseFields },
          responseFieldLabels: { ...existing.responseFieldLabels }
        })
      }

      // Collect response field data
      if (
        ACCEPTED_EVENT_TYPES.includes(node.typename) &&
        node.label &&
        node.value
      ) {
        if (!responseFieldMap.has(visitorId)) {
          responseFieldMap.set(visitorId, new Map())
        }

        const userResponses = responseFieldMap.get(visitorId)!
        // Use blockId + label as the key to handle multiple fields with same label
        const fieldKey = `${node.blockId || 'no-block'}-${node.label}`
        const existingResponse = userResponses.get(fieldKey)

        // Keep the latest response for each field (by blockId + label)
        if (
          !existingResponse ||
          new Date(node.createdAt) > new Date(existingResponse.createdAt)
        ) {
          userResponses.set(fieldKey, {
            value:
              typeof node.value === 'string'
                ? node.value
                : JSON.stringify(node.value),
            createdAt: node.createdAt,
            blockId: node.blockId ?? undefined,
            label: node.label
          })
        }
      }
    })
  }

  async function exportJourneyContacts({
    journeyId,
    filter,
    contactDataFields
  }: ExportJourneyContactsParams): Promise<void> {
    console.log('contactDataFields', contactDataFields)

    const filterArg = {
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

      // Extract unique contacts from events, separating contact data from response fields
      const contactMap = new Map<string, JourneyContact>()
      const responseFieldMap = new Map<
        string,
        Map<
          string,
          { value: string; createdAt: string; blockId?: string; label: string }
        >
      >()

      // Process events incrementally instead of loading all into memory
      for await (const edges of fetchEventsPaginated(journeyId, filterArg)) {
        processEdges(edges, contactMap, responseFieldMap)
        setProgress((p) => Math.min(p + 10, 90))
      }

      // Second pass: add response field data to contacts
      contactMap.forEach((contact, visitorId) => {
        const userResponses = responseFieldMap.get(visitorId)
        if (userResponses) {
          userResponses.forEach((response, fieldKey) => {
            // Use the fieldKey (blockId-label) for the response field key
            contact.responseFields![fieldKey] = response.value
            contact.responseFieldLabels![fieldKey] = response.label
          })
        }
      })

      const contacts = Array.from(contactMap.values())

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
