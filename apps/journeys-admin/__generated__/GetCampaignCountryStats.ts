/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCampaignCountryStats
// ====================================================

export interface GetCampaignCountryStats_campaign_countryStats_countries {
  __typename: "CampaignCountryStat";
  /**
   * ISO 3166-1 alpha-2 code as reported by Plausible.
   */
  countryCode: string;
  /**
   * English display name resolved server-side; null when the code is not recognised.
   */
  countryName: string | null;
  /**
   * Unique visitors (the product-facing "views" number).
   */
  visitors: number;
  /**
   * Total step pageviews.
   */
  pageviews: number;
}

export interface GetCampaignCountryStats_campaign_countryStats {
  __typename: "CampaignCountryStats";
  from: any;
  to: any;
  /**
   * Sum of visitors over every row, including rows with an unknown country.
   */
  totalVisitors: number;
  /**
   * Sum of pageviews over every row, including rows with an unknown country.
   */
  totalPageviews: number;
  countries: GetCampaignCountryStats_campaign_countryStats_countries[];
}

export interface GetCampaignCountryStats_campaign {
  __typename: "Campaign";
  id: string;
  /**
   * Country breakdown of this campaign's published share-journey traffic. Live Plausible read — request it only where needed.
   */
  countryStats: GetCampaignCountryStats_campaign_countryStats;
}

export interface GetCampaignCountryStats {
  /**
   * Read a single Campaign by id. Returns both `draft` and `published` rows — use this for in-team authenticated reads. Anonymous viewers must use `campaignBySlug`, which only returns published campaigns.
   * 
   * Auth: caller must be a member of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the campaign's team.
   */
  campaign: GetCampaignCountryStats_campaign;
}

export interface GetCampaignCountryStatsVariables {
  id: string;
}
