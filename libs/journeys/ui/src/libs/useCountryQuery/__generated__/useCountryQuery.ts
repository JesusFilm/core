import * as Types from '../../../../__generated__/globalTypes';

export type GetCountryQueryVariables = Types.Exact<{
  countryId: Types.Scalars['ID']['input'];
}>;


export type GetCountryQuery = { country: { __typename: 'Country', id: string, flagPngSrc: string | null, continent: { __typename: 'Continent', name: Array<{ __typename: 'ContinentName', value: string }> }, countryLanguages: Array<{ __typename: 'CountryLanguage', speakers: number, language: { __typename: 'Language', name: Array<{ __typename: 'LanguageName', primary: boolean, value: string }> } }> } | null };
