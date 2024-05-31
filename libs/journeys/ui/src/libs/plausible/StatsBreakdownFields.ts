import { gql } from '@apollo/client'

export const STATS_BREAKDOWN_FIELDS = gql`
  fragment StatsBreakdownFields on PlausibleStatsResponse {
    property
    visits
    pageviews
    bounceRate
    visitDuration
  }
`
