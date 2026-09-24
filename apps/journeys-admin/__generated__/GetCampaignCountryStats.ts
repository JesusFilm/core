/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCampaignCountryStats
// ====================================================

export interface GetCampaignCountryStats_campaign_countryStats_countries {
  __typename: "CampaignCountryStat";
  countryCode: string;
  countryName: string | null;
  visitors: number;
  pageviews: number;
}

export interface GetCampaignCountryStats_campaign_countryStats {
  __typename: "CampaignCountryStats";
  from: any;
  to: any;
  totalVisitors: number;
  totalPageviews: number;
  countries: GetCampaignCountryStats_campaign_countryStats_countries[];
}

export interface GetCampaignCountryStats_campaign {
  __typename: "Campaign";
  id: string;
  countryStats: GetCampaignCountryStats_campaign_countryStats;
}

export interface GetCampaignCountryStats {
  campaign: GetCampaignCountryStats_campaign;
}

export interface GetCampaignCountryStatsVariables {
  id: string;
}
