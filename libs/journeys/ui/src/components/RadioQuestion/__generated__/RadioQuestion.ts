import * as Types from '../../../../__generated__/types';

export type RadioQuestionSubmissionEventCreateMutationVariables = Types.Exact<{
  input: Types.RadioQuestionSubmissionEventCreateInput;
}>;


export type RadioQuestionSubmissionEventCreateMutation = { __typename?: 'Mutation', radioQuestionSubmissionEventCreate: { __typename?: 'RadioQuestionSubmissionEvent', id: string } };
