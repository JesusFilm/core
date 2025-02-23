import * as Types from '../../../../__generated__/types';

export type SignUpSubmissionEventCreateMutationVariables = Types.Exact<{
  input: Types.SignUpSubmissionEventCreateInput;
}>;


export type SignUpSubmissionEventCreateMutation = { __typename?: 'Mutation', signUpSubmissionEventCreate: { __typename?: 'SignUpSubmissionEvent', id: string } };
