/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PlausibleJourneyStepsFields
// ====================================================

export interface PlausibleJourneyStepsFields {
  __typename: "PlausibleStatsResponse";
  /**
   * On breakdown queries, this is the property that was broken down by.
   * On aggregate queries, this is the date the stats are for.
   */
  property: string;
  /**
   * The number of unique visitors.
   */
  visitors: number | null;
  /**
   * Bounce rate percentage.
   */
  bounceRate: number | null;
}
