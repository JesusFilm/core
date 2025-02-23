import * as Types from '../../../../__generated__/types';

export type GetLanguagesQueryVariables = Types.Exact<{
  languageId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  where?: Types.InputMaybe<Types.LanguagesFilter>;
}>;


export type GetLanguagesQuery = { __typename?: 'Query', languages: Array<{ __typename?: 'Language', id: string, slug?: string | null, name: Array<{ __typename?: 'LanguageName', value: string, primary: boolean }> }> };
