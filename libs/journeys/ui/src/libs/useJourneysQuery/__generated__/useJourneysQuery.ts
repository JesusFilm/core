import * as Types from '../../../../__generated__/types';

export type GetJourneysQueryVariables = Types.Exact<{
  where?: Types.InputMaybe<Types.JourneysFilter>;
}>;


export type GetJourneysQuery = { __typename?: 'Query', journeys: Array<{ __typename?: 'Journey', id: string, title: string, createdAt: any, publishedAt?: any | null, featuredAt?: any | null, trashedAt?: any | null, description?: string | null, slug: string, themeName: Types.ThemeName, themeMode: Types.ThemeMode, status: Types.JourneyStatus, seoTitle?: string | null, seoDescription?: string | null, template?: boolean | null, language: { __typename?: 'Language', id: string, name: Array<{ __typename?: 'LanguageName', value: string, primary: boolean }> }, userJourneys?: Array<{ __typename?: 'UserJourney', id: string, role: Types.UserJourneyRole, openedAt?: any | null, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, imageUrl?: string | null } | null }> | null, primaryImageBlock?: { __typename?: 'ImageBlock', id: string, parentBlockId?: string | null, parentOrder?: number | null, src?: string | null, alt: string, width: number, height: number, blurhash: string } | null, tags: Array<{ __typename?: 'Tag', id: string, parentId?: string | null, name: Array<{ __typename?: 'TagName', value: string, primary: boolean, language: { __typename?: 'Language', id: string } }> }> }> };
