import * as Types from '../../../../__generated__/types';

export type StepNextEventCreateMutationVariables = Types.Exact<{
  input: Types.StepNextEventCreateInput;
}>;


export type StepNextEventCreateMutation = { __typename?: 'Mutation', stepNextEventCreate: { __typename?: 'StepNextEvent', id: string } };

export type StepPreviousEventCreateMutationVariables = Types.Exact<{
  input: Types.StepPreviousEventCreateInput;
}>;


export type StepPreviousEventCreateMutation = { __typename?: 'Mutation', stepPreviousEventCreate: { __typename?: 'StepPreviousEvent', id: string } };
