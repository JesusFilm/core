/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCampaignCountries
// ====================================================

export interface GetCampaignCountries_countries_name {
  __typename: "CountryName";
  value: string;
}

export interface GetCampaignCountries_countries {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  name: GetCampaignCountries_countries_name[];
}

export interface GetCampaignCountries {
  countries: GetCampaignCountries_countries[];
}
