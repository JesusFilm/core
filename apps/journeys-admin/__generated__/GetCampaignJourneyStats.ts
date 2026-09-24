/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PlausibleStatsAggregateFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaignJourneyStats
// ====================================================

export interface GetCampaignJourneyStats_journeysPlausibleStatsAggregate_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetCampaignJourneyStats_journeysPlausibleStatsAggregate_pageviews {
  __typename: "PlausibleStatsAggregateValue";
  value: number;
}

export interface GetCampaignJourneyStats_journeysPlausibleStatsAggregate {
  __typename: "PlausibleStatsAggregateResponse";
  /**
   * The number of unique visitors.
   */
  visitors: GetCampaignJourneyStats_journeysPlausibleStatsAggregate_visitors | null;
  /**
   * The number of pageview events.
   */
  pageviews: GetCampaignJourneyStats_journeysPlausibleStatsAggregate_pageviews | null;
}

export interface GetCampaignJourneyStats {
  journeysPlausibleStatsAggregate: GetCampaignJourneyStats_journeysPlausibleStatsAggregate;
}

export interface GetCampaignJourneyStatsVariables {
  id: string;
  where: PlausibleStatsAggregateFilter;
}
