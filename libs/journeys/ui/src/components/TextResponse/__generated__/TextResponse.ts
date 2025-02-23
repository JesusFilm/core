import * as Types from '../../../../__generated__/types';

export type TextResponseSubmissionEventCreateMutationVariables = Types.Exact<{
  input: Types.TextResponseSubmissionEventCreateInput;
}>;


export type TextResponseSubmissionEventCreateMutation = { __typename?: 'Mutation', textResponseSubmissionEventCreate: { __typename?: 'TextResponseSubmissionEvent', id: string } };
