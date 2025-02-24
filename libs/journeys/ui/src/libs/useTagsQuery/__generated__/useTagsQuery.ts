import * as Types from '../../../../__generated__/globalTypes';

export type GetTagsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { tags: Array<{ __typename: 'Tag', id: string, service: Types.Service | null, parentId: string | null, name: Array<{ __typename: 'TagName', value: string, primary: boolean }> }> };
