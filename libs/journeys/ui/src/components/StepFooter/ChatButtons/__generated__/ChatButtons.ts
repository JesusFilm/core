import * as Types from '../../../../../__generated__/types';

export type ChatButtonEventCreateMutationVariables = Types.Exact<{
  input: Types.ChatOpenEventCreateInput;
}>;


export type ChatButtonEventCreateMutation = { __typename?: 'Mutation', chatOpenEventCreate: { __typename?: 'ChatOpenEvent', id: string } };
