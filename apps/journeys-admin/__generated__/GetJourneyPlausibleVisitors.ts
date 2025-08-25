/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyPlausibleVisitors
// ====================================================

export interface GetJourneyPlausibleVisitors_journeyAggregateVisitors_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number | null;
}

export interface GetJourneyPlausibleVisitors_journeyAggregateVisitors {
  __typename: "PlausibleStatsAggregateResponse";
  visitors: GetJourneyPlausibleVisitors_journeyAggregateVisitors_visitors | null;
}

export interface GetJourneyPlausibleVisitors {
  journeyAggregateVisitors: GetJourneyPlausibleVisitors_journeyAggregateVisitors | null;
}

export interface GetJourneyPlausibleVisitorsVariables {
  id: string;
  date?: string | null;
}
