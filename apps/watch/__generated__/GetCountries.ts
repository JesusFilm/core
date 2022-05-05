/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountries
// ====================================================

export interface GetCountries_countries_name {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountries_countries_slug {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountries_countries_continent {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetCountries_countries_languages {
  __typename: "Language";
  id: string;
}

export interface GetCountries_countries {
  __typename: "Country";
  id: string;
  name: GetCountries_countries_name[];
  /**
   * slug is a permanent link to the country. It should only be appended, not edited or deleted
   */
  slug: GetCountries_countries_slug[];
  continent: GetCountries_countries_continent[];
  languages: GetCountries_countries_languages[];
  population: number;
  image: string;
  latitude: number;
  longitude: number;
}

export interface GetCountries {
  countries: GetCountries_countries[];
}

export interface GetCountriesVariables {
  languageId?: string | null;
}
