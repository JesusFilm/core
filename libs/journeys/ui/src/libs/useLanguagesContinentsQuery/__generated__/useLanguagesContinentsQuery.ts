import * as Types from '../../../../__generated__/globalTypes';

export type GetLanguagesContinentsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetLanguagesContinentsQuery = { languages: Array<{ __typename: 'Language', id: string, name: Array<{ __typename: 'LanguageName', value: string }>, countryLanguages: Array<{ __typename: 'CountryLanguage', country: { __typename: 'Country', continent: { __typename: 'Continent', id: string } } }> }> };
