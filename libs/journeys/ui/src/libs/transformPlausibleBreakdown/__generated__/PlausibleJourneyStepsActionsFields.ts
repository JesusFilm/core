/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: PlausibleJourneyStepsActionsFields
// ====================================================

export interface PlausibleJourneyStepsActionsFields {
  __typename: "PlausibleStatsResponse";
  /**
   * On breakdown queries, this is the property that was broken down by.
   * On aggregate queries, this is the date the stats are for.
   */
  property: string;
  /**
   * The number of events (pageviews + custom events). When filtering by a goal,
   *  this metric corresponds to "Total Conversions" in the dashboard.
   */
  events: number | null;
  /**
   * The average time users spend on viewing a single page. Requires an
   * `event:page` filter or `event:page` property in the breakdown endpoint.
   */
  timeOnPage: number | null;
}
