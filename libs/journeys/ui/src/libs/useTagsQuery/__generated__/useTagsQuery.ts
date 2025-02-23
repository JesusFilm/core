import * as Types from '../../../../__generated__/types';

export type GetTagsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', tags: Array<{ __typename?: 'Tag', id: string, service?: Types.Service | null, parentId?: string | null, name: Array<{ __typename?: 'TagName', value: string, primary: boolean }> }> };
