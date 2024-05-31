/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: StatsBreakdownFields
// ====================================================

export interface StatsBreakdownFields {
  __typename: "PlausibleStatsResponse";
  /**
   * On breakdown queries, this is the property that was broken down by.
   * On aggregate queries, this is the date the stats are for.
   */
  property: string;
  /**
   * The number of visits/sessions.
   */
  visits: number | null;
  /**
   * The number of pageview events.
   */
  pageviews: number | null;
  /**
   * Bounce rate percentage.
   */
  bounceRate: number | null;
  /**
   * Visit duration in seconds.
   */
  visitDuration: number | null;
}
