/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PlausibleStatsBreakdownFilter, IdType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPlausibleStatsBreakdown
// ====================================================

export interface GetPlausibleStatsBreakdown_journeysPlausibleStatsBreakdown {
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

export interface GetPlausibleStatsBreakdown {
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * 
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * 
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * 
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeysPlausibleStatsBreakdown: GetPlausibleStatsBreakdown_journeysPlausibleStatsBreakdown[];
}

export interface GetPlausibleStatsBreakdownVariables {
  where: PlausibleStatsBreakdownFilter;
  id: string;
  idType?: IdType | null;
}
