/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PlausibleJourneyAggregateVisitorsFields
// ====================================================

export interface PlausibleJourneyAggregateVisitorsFields_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface PlausibleJourneyAggregateVisitorsFields {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: PlausibleJourneyAggregateVisitorsFields_visitors | null;
}
