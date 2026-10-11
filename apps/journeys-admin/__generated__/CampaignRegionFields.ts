/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CampaignRegionFields
// ====================================================

export interface CampaignRegionFields_countries_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignRegionFields_countries_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignRegionFields_countries_country_name[];
}

export interface CampaignRegionFields_countries {
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
  country: CampaignRegionFields_countries_country;
}

export interface CampaignRegionFields {
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
  countries: CampaignRegionFields_countries[];
}
