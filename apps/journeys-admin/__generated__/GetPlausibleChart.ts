/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PlausibleStatsTimeseriesFilter, PlausibleStatsAggregateFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetPlausibleChart
// ====================================================

export interface GetPlausibleChart_journeysPlausibleStatsTimeseries {
  __typename: "PlausibleStatsResponse";
  /**
   * Bounce rate percentage.
   */
  bounceRate: number | null;
  /**
   * The number of visits/sessions.
   */
  visits: number | null;
  /**
   * The number of unique visitors.
   */
  visitors: number | null;
  /**
   * Visit duration in seconds.
   */
  visitDuration: number | null;
  /**
   * The number of pageviews divided by the number of visits.
   * Returns a floating point number. Currently only supported in Aggregate and
   * Timeseries endpoints.
   */
  viewsPerVisit: number | null;
  /**
   * The number of pageview events.
   */
  pageviews: number | null;
  /**
   * On breakdown queries, this is the property that was broken down by.
   * On aggregate queries, this is the date the stats are for.
   */
  property: string;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
  change: number | null;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_visits {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
  change: number | null;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_pageviews {
  __typename: "PlausibleStatsAggregateValue";
  change: number | null;
  value: number;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_viewsPerVisit {
  __typename: "PlausibleStatsAggregateValue";
  change: number | null;
  value: number;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_bounceRate {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
  change: number | null;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate_visitDuration {
  __typename: "PlausibleStatsAggregateValue";
  change: number | null;
  value: number;
}

export interface GetPlausibleChart_journeysPlausibleStatsAggregate {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetPlausibleChart_journeysPlausibleStatsAggregate_visitors | null;
  /**
   * The number of visits/sessions.
   */
  visits: GetPlausibleChart_journeysPlausibleStatsAggregate_visits | null;
  /**
   * The number of pageview events.
   */
  pageviews: GetPlausibleChart_journeysPlausibleStatsAggregate_pageviews | null;
  /**
   * The number of pageviews divided by the number of visits.
   * Returns a floating point number. Currently only supported in Aggregate and
   * Timeseries endpoints.
   */
  viewsPerVisit: GetPlausibleChart_journeysPlausibleStatsAggregate_viewsPerVisit | null;
  /**
   * Bounce rate percentage.
   */
  bounceRate: GetPlausibleChart_journeysPlausibleStatsAggregate_bounceRate | null;
  /**
   * Visit duration in seconds.
   */
  visitDuration: GetPlausibleChart_journeysPlausibleStatsAggregate_visitDuration | null;
}

export interface GetPlausibleChart {
  /**
   * This endpoint provides timeseries data over a certain time period.
   * If you are familiar with the Plausible dashboard, this endpoint
   * corresponds to the main visitor graph.
   */
  journeysPlausibleStatsTimeseries: GetPlausibleChart_journeysPlausibleStatsTimeseries[];
  journeysPlausibleStatsAggregate: GetPlausibleChart_journeysPlausibleStatsAggregate;
}

export interface GetPlausibleChartVariables {
  whereTimeseries: PlausibleStatsTimeseriesFilter;
  whereAggregate: PlausibleStatsAggregateFilter;
  id: string;
}
