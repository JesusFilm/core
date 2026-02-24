/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesContinents
// ====================================================

export interface GetLanguagesContinents_languages_name {
  __typename: "LanguageName";
  value: string;
}

export interface GetLanguagesContinents_languages_countryLanguages_country_continent {
  __typename: "Continent";
  id: string;
}

export interface GetLanguagesContinents_languages_countryLanguages_country {
  __typename: "Country";
  continent: GetLanguagesContinents_languages_countryLanguages_country_continent;
}

export interface GetLanguagesContinents_languages_countryLanguages {
  __typename: "CountryLanguage";
  country: GetLanguagesContinents_languages_countryLanguages_country;
}

export interface GetLanguagesContinents_languages {
  __typename: "Language";
  id: string;
  name: GetLanguagesContinents_languages_name[];
  countryLanguages: GetLanguagesContinents_languages_countryLanguages[];
}

export interface GetLanguagesContinents {
  languages: GetLanguagesContinents_languages[];
}
