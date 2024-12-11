/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyAnalytics
// ====================================================

export interface GetJourneyAnalytics_journeySteps {
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

export interface GetJourneyAnalytics_journeyStepsActions {
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
}

export interface GetJourneyAnalytics_journeyReferrer {
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
}

export interface GetJourneyAnalytics_journeyUtmCampaign {
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
}

export interface GetJourneyAnalytics_journeyVisitorsPageExits {
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
}

export interface GetJourneyAnalytics_journeyActionsSums {
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
}

export interface GetJourneyAnalytics_journeyAggregateVisitors_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetJourneyAnalytics_journeyAggregateVisitors {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetJourneyAnalytics_journeyAggregateVisitors_visitors | null;
}

export interface GetJourneyAnalytics {
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeySteps: GetJourneyAnalytics_journeySteps[];
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeyStepsActions: GetJourneyAnalytics_journeyStepsActions[];
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeyReferrer: GetJourneyAnalytics_journeyReferrer[];
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeyUtmCampaign: GetJourneyAnalytics_journeyUtmCampaign[];
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeyVisitorsPageExits: GetJourneyAnalytics_journeyVisitorsPageExits[];
  /**
   * This endpoint allows you to break down your stats by some property.
   * If you are familiar with SQL family databases, this endpoint corresponds to
   * running `GROUP BY` on a certain property in your stats, then ordering by the
   * count.
   * Check out the [properties](https: // plausible.io/docs/stats-api#properties)
   * section for a reference of all the properties you can use in this query.
   * This endpoint can be used to fetch data for `Top sources`, `Top pages`,
   * `Top countries` and similar reports.
   * Currently, it is only possible to break down on one property at a time.
   * Using a list of properties with one query is not supported. So if you want
   * a breakdown by both `event:page` and `visit:source` for example, you would
   * have to make multiple queries (break down on one property and filter on
   * another) and then manually/programmatically group the results together in one
   * report. This also applies for breaking down by time periods. To get a daily
   * breakdown for every page, you would have to break down on `event:page` and
   * make multiple queries for each date.
   */
  journeyActionsSums: GetJourneyAnalytics_journeyActionsSums[];
  journeyAggregateVisitors: GetJourneyAnalytics_journeyAggregateVisitors;
}

export interface GetJourneyAnalyticsVariables {
  id: string;
  period?: string | null;
  date?: string | null;
  interval?: string | null;
  limit?: number | null;
  page?: number | null;
}
