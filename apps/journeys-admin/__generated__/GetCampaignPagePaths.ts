/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetCampaignPagePaths
// ====================================================

export interface GetCampaignPagePaths_campaign_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
}

export interface GetCampaignPagePaths_campaign_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
}

export interface GetCampaignPagePaths_campaign_languages {
  __typename: "CampaignLanguage";
  id: string;
  language: GetCampaignPagePaths_campaign_languages_language;
}

export interface GetCampaignPagePaths_campaign_regions {
  __typename: "CampaignRegion";
  id: string;
  /**
   * Unique within the campaign. Changing it breaks links already shared to the region page.
   */
  slug: string;
}

export interface GetCampaignPagePaths_campaign {
  __typename: "Campaign";
  id: string;
  /**
   * Globally unique. The permanent Campaign Address is `/campaign/<slug>` on the root domain. Generated from the title; author-editable.
   */
  slug: string;
  status: CampaignStatus;
  /**
   * The Campaign Domain, as a list of at most one: the Custom Domain that belongs to this campaign. Once set it is the campaign’s only address and `/campaign/<slug>` on the root domain is NOT_FOUND. Settings reads this to show and manage the domain.
   */
  customDomains: GetCampaignPagePaths_campaign_customDomains[];
  /**
   * Page Languages in selector order.
   */
  languages: GetCampaignPagePaths_campaign_languages[];
  /**
   * Every Campaign Region, listed and orphan, in switcher order.
   */
  regions: GetCampaignPagePaths_campaign_regions[];
}

export interface GetCampaignPagePaths {
  /**
   * Read one Campaign by id in its full admin shape, draft or published.
   * 
   * Auth: campaign Read — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaign: GetCampaignPagePaths_campaign;
}

export interface GetCampaignPagePathsVariables {
  id: string;
}
