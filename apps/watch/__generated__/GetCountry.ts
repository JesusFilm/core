/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountry
// ====================================================

export interface GetCountry_country_name {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountry_country_slug {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountry_country_continent {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountry_country_languages_name {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountry_country_languages {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetCountry_country_languages_name[];
}

export interface GetCountry_country {
  __typename: "Country";
  id: string;
  name: GetCountry_country_name[];
  /**
   * slug is a permanent link to the country. It should only be appended, not edited or deleted
   */
  slug: GetCountry_country_slug[];
  continent: GetCountry_country_continent[];
  languages: GetCountry_country_languages[];
  population: number;
  image: string;
  latitude: number;
  longitude: number;
}

export interface GetCountry {
  country: GetCountry_country;
}

export interface GetCountryVariables {
  id: string;
  languageId?: string | null;
}
