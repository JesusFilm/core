import { useLazyQuery } from '@apollo/client'
import { useTranslation } from 'next-i18next'

import { VariablesOf, graphql } from '@core/shared/gql'

import { downloadCsv } from './utils/processContactsCsv/processContactsCsv'

export const GET_JOURNEY_VISITOR_EXPORT = graphql(`
  query GetJourneyVisitorExport(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $select: JourneyVisitorExportSelect
    $timezone: String
  ) {
    csv: journeyVisitorExport(
      journeyId: $journeyId
      filter: $filter
      select: $select
      timezone: $timezone
    )
  }
`)

export interface ExportJourneyContactsParams {
  journeyId: string
  filter: VariablesOf<typeof GET_JOURNEY_VISITOR_EXPORT>['filter']
}

export function useJourneyContactsExport(): {
  exportJourneyContacts: (params: ExportJourneyContactsParams) => Promise<void>
  downloading: boolean
} {
  const { t } = useTranslation('apps-journeys-admin')
  const [getJourneyVisitorExport, { loading: downloading }] = useLazyQuery(
    GET_JOURNEY_VISITOR_EXPORT,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'no-cache'
    }
  )

  async function exportJourneyContacts({
    journeyId,
    filter
  }: ExportJourneyContactsParams): Promise<void> {
    try {
      // Get user's timezone to format dates consistently with frontend display
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      const { data, error } = await getJourneyVisitorExport({
        variables: {
          journeyId,
          filter,
          timezone: userTimezone
        }
      })

      if (error) {
        console.error('GraphQL error:', error)
        throw new Error(t('GraphQL error: {{error}}', { error: error.message }))
      }

      if (data?.csv != null) {
        downloadCsv(data.csv, `${journeyId}_contacts`)
      }
    } catch (error) {
      console.error('Contacts export error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(t('Failed to retrieve contacts for export.'))
    }
  }

  return { exportJourneyContacts, downloading }
}
