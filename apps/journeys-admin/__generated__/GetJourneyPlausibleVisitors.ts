/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyPlausibleVisitors
// ====================================================

export interface GetJourneyPlausibleVisitors_journeyAggregateVisitors_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetJourneyPlausibleVisitors_journeyAggregateVisitors {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetJourneyPlausibleVisitors_journeyAggregateVisitors_visitors | null;
}

export interface GetJourneyPlausibleVisitors {
  journeyAggregateVisitors: GetJourneyPlausibleVisitors_journeyAggregateVisitors;
}

export interface GetJourneyPlausibleVisitorsVariables {
  id: string;
  date?: string | null;
}
