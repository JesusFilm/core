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
   * The average time users spend on viewing a single page. Requires an
   * `event:page` filter or `event:page` property in the breakdown endpoint.
   */
  timeOnPage: number | null;
}
