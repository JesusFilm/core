/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionCreate
// ====================================================

export interface CampaignRegionCreate_campaignRegionCreate_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignRegionCreate_campaignRegionCreate_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignRegionCreate_campaignRegionCreate_countries_country_name[];
}

export interface CampaignRegionCreate_campaignRegionCreate_countries {
  __typename: "CampaignRegionCountry";
  id: string;
  regionId: string;
  /**
   * api-languages Country id.
   */
  countryId: string;
  order: number;
  /**
   * The api-languages Country, resolved through federation: flag and translated name live there.
   */
  country: CampaignRegionCreate_campaignRegionCreate_countries_country;
}

export interface CampaignRegionCreate_campaignRegionCreate {
  __typename: "CampaignRegion";
  id: string;
  campaignId: string;
  /**
   * Required, at most 60 characters.
   */
  name: string;
  /**
   * Unique within the campaign. Changing it breaks links already shared to the region page.
   */
  slug: string;
  order: number;
  /**
   * Whether the region appears on the Region Switcher.
   */
  listed: boolean;
  /**
   * Region Countries in chip order.
   */
  countries: CampaignRegionCreate_campaignRegionCreate_countries[];
}

export interface CampaignRegionCreate {
  /**
   * Add a Campaign Region from the Region Switcher’s "+ Add": born named "New region" in the campaign default language, slugged from that name (`new-region`, `new-region-2`, …), appended last, listed, with no lines or countries and one Share Language row for the campaign default language with no journey yet. Nothing is copied: every region renders the shared Region Page.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Idempotent per id: a retry with the id of an existing region of the same campaign returns that region.
   * 
   * Errors:
   * - NOT_FOUND: campaignId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT: a concurrent create took the id or the derived slug; retry.
   */
  campaignRegionCreate: CampaignRegionCreate_campaignRegionCreate;
}

export interface CampaignRegionCreateVariables {
  campaignId: string;
  id?: string | null;
}
