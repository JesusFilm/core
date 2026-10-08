/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionCountryAdd
// ====================================================

export interface CampaignRegionCountryAdd_campaignRegionCountryAdd_country_name {
  __typename: "CountryName";
  value: string;
}

export interface CampaignRegionCountryAdd_campaignRegionCountryAdd_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: CampaignRegionCountryAdd_campaignRegionCountryAdd_country_name[];
}

export interface CampaignRegionCountryAdd_campaignRegionCountryAdd {
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
  country: CampaignRegionCountryAdd_campaignRegionCountryAdd_country;
}

export interface CampaignRegionCountryAdd {
  /**
   * Add a country chip to a Campaign Region’s card, appended last in chip order. The id is an api-languages Country id; flag and translated name resolve from the owner.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: regionId does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `countryId`): not an api-languages country, already on the region, or the region already has 250 countries.
   */
  campaignRegionCountryAdd: CampaignRegionCountryAdd_campaignRegionCountryAdd;
}

export interface CampaignRegionCountryAddVariables {
  regionId: string;
  countryId: string;
}
