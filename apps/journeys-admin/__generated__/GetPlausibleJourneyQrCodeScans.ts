/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPlausibleJourneyQrCodeScans
// ====================================================

export interface GetPlausibleJourneyQrCodeScans_journeyAggregateVisitors_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetPlausibleJourneyQrCodeScans_journeyAggregateVisitors {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetPlausibleJourneyQrCodeScans_journeyAggregateVisitors_visitors | null;
}

export interface GetPlausibleJourneyQrCodeScans {
  journeyAggregateVisitors: GetPlausibleJourneyQrCodeScans_journeyAggregateVisitors;
}

export interface GetPlausibleJourneyQrCodeScansVariables {
  id: string;
  filters: string;
  date?: string | null;
}
