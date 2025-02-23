import * as Types from '../../../../__generated__/types';

export type ButtonClickEventCreateMutationVariables = Types.Exact<{
  input: Types.ButtonClickEventCreateInput;
}>;


export type ButtonClickEventCreateMutation = { __typename?: 'Mutation', buttonClickEventCreate: { __typename?: 'ButtonClickEvent', id: string } };

export type ChatOpenEventCreateMutationVariables = Types.Exact<{
  input: Types.ChatOpenEventCreateInput;
}>;


export type ChatOpenEventCreateMutation = { __typename?: 'Mutation', chatOpenEventCreate: { __typename?: 'ChatOpenEvent', id: string } };
