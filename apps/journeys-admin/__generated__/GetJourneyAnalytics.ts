/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyAnalytics
// ====================================================

export interface GetJourneyAnalytics_journeySteps {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
  timeOnPage: number | null;
}

export interface GetJourneyAnalytics_journeyStepsActions {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
}

export interface GetJourneyAnalytics_journeyReferrer {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
}

export interface GetJourneyAnalytics_journeyUtmCampaign {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
}

export interface GetJourneyAnalytics_journeyVisitorsPageExits {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
}

export interface GetJourneyAnalytics_journeyActionsSums {
  __typename: "PlausibleStatsResponse";
  property: string | null;
  visitors: number | null;
}

export interface GetJourneyAnalytics_journeyAggregateVisitors_visitors {
  __typename: "PlausibleStatsAggregateValue";
  value: number | null;
}

export interface GetJourneyAnalytics_journeyAggregateVisitors {
  __typename: "PlausibleStatsAggregateResponse";
  visitors: GetJourneyAnalytics_journeyAggregateVisitors_visitors | null;
}

export interface GetJourneyAnalytics {
  journeySteps: GetJourneyAnalytics_journeySteps[] | null;
  journeyStepsActions: GetJourneyAnalytics_journeyStepsActions[] | null;
  journeyReferrer: GetJourneyAnalytics_journeyReferrer[] | null;
  journeyUtmCampaign: GetJourneyAnalytics_journeyUtmCampaign[] | null;
  journeyVisitorsPageExits: GetJourneyAnalytics_journeyVisitorsPageExits[] | null;
  journeyActionsSums: GetJourneyAnalytics_journeyActionsSums[] | null;
  journeyAggregateVisitors: GetJourneyAnalytics_journeyAggregateVisitors | null;
}

export interface GetJourneyAnalyticsVariables {
  id: string;
  period?: string | null;
  date?: string | null;
  interval?: string | null;
  limit?: number | null;
  page?: number | null;
}
