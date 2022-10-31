/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountry
// ====================================================

export interface GetCountry_country_name {
  __typename: "Translation";
  value: string;
}

export interface GetCountry_country {
  __typename: "Country";
  id: string;
  name: GetCountry_country_name[];
}

export interface GetCountry {
  country: GetCountry_country;
}

export interface GetCountryVariables {
  id: string;
  languageId: string;
}
