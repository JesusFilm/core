/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCampaignStats
// ====================================================

export interface GetCampaignStats_campaignStats_all_countries {
  __typename: "CampaignCountryStat";
  countryCode: string;
  visitors: number;
}

export interface GetCampaignStats_campaignStats_all {
  __typename: "CampaignStatsScope";
  /**
   * Sum of per-journey unique visitors; includes visitors whose country is unknown.
   */
  totalVisitors: number;
  /**
   * Every known country by visitors, highest first.
   */
  countries: GetCampaignStats_campaignStats_all_countries[];
}

export interface GetCampaignStats_campaignStats_regions_countries {
  __typename: "CampaignCountryStat";
  countryCode: string;
  visitors: number;
}

export interface GetCampaignStats_campaignStats_regions {
  __typename: "CampaignRegionStats";
  regionId: string;
  totalVisitors: number;
  /**
   * Every known country by visitors, highest first.
   */
  countries: GetCampaignStats_campaignStats_regions_countries[];
}

export interface GetCampaignStats_campaignStats {
  __typename: "CampaignStats";
  all: GetCampaignStats_campaignStats_all;
  /**
   * Every region, listed and orphan alike, in region order.
   */
  regions: GetCampaignStats_campaignStats_regions[];
}

export interface GetCampaignStats {
  /**
   * The Campaign's visitor stats from one cached Plausible sweep over every linked journey that is not deleted (draft, published and archived all count; a trashed or deleted journey does not), summed by the campaign's regions: total visitors and visitors by ISO alpha-2 country for the whole campaign and for each region. The server reads Plausible with the service key; the caller never does.
   * 
   * Auth: a published campaign is readable by anyone, anonymous or authenticated; a draft only with campaign Read.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve, or the campaign is a draft the caller cannot read.
   * - Plausible failure with nothing cached: the query errors; with a cached sweep, that sweep is served however old, and a stale one is refreshed in the background (a failed refresh is not retried for a few minutes). One journey's Plausible failure does not fail the sweep: that journey keeps its last rows, or counts as no visitors.
   */
  campaignStats: GetCampaignStats_campaignStats;
}

export interface GetCampaignStatsVariables {
  id: string;
}
