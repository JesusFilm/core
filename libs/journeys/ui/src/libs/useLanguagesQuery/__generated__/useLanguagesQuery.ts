import * as Types from '../../../../__generated__/globalTypes';

export type GetLanguagesQueryVariables = Types.Exact<{
  languageId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  where?: Types.InputMaybe<Types.LanguagesFilter>;
}>;


export type GetLanguagesQuery = { languages: Array<{ __typename: 'Language', id: string, slug: string | null, name: Array<{ __typename: 'LanguageName', value: string, primary: boolean }> }> };
