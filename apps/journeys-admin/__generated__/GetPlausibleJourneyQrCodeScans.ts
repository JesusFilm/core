/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPlausibleJourneyQrCodeScans
// ====================================================

export interface GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number | null;
}

export interface GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate {
  __typename: "PlausibleStatsAggregateResponse";
  visitors: GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate_visitors | null;
}

export interface GetPlausibleJourneyQrCodeScans {
  journeysPlausibleStatsAggregate: GetPlausibleJourneyQrCodeScans_journeysPlausibleStatsAggregate | null;
}

export interface GetPlausibleJourneyQrCodeScansVariables {
  id: string;
  filters: string;
  date?: string | null;
}
