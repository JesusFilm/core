/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCountry
// ====================================================

export interface GetCountry_country_continent_name {
  __typename: "ContinentName";
  value: string;
}

export interface GetCountry_country_continent {
  __typename: "Continent";
  name: GetCountry_country_continent_name[];
}

export interface GetCountry_country_countryLanguages_language_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface GetCountry_country_countryLanguages_language {
  __typename: "Language";
  name: GetCountry_country_countryLanguages_language_name[];
}

export interface GetCountry_country_countryLanguages {
  __typename: "CountryLanguage";
  language: GetCountry_country_countryLanguages_language;
  speakers: number;
}

export interface GetCountry_country {
  __typename: "Country";
  id: string;
  flagPngSrc: string | null;
  continent: GetCountry_country_continent;
  countryLanguages: GetCountry_country_countryLanguages[];
}

export interface GetCountry {
  country: GetCountry_country | null;
}

export interface GetCountryVariables {
  countryId: string;
}
