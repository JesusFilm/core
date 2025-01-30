/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPlausibleJourneyQrCodeScans
// ====================================================

export interface GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate_visitors | null;
}

export interface GetPlausibleJourneyQrCodeScans {
  journeysPlausibleStatsAggregate: GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate;
}

export interface GetPlausibleJourneyQrCodeScansVariables {
  id: string;
  filters: string;
  date?: string | null;
}
