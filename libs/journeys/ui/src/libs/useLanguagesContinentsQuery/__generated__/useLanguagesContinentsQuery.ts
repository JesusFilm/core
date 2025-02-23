import * as Types from '../../../../__generated__/types';

export type GetLanguagesContinentsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetLanguagesContinentsQuery = { __typename?: 'Query', languages: Array<{ __typename?: 'Language', id: string, name: Array<{ __typename?: 'LanguageName', value: string }>, countryLanguages: Array<{ __typename?: 'CountryLanguage', country: { __typename?: 'Country', continent: { __typename?: 'Continent', id: string } } }> }> };
