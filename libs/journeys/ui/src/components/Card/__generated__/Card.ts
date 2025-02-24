import * as Types from '../../../../__generated__/globalTypes';

export type StepNextEventCreateMutationVariables = Types.Exact<{
  input: Types.StepNextEventCreateInput;
}>;


export type StepNextEventCreateMutation = { stepNextEventCreate: { __typename: 'StepNextEvent', id: string } };

export type StepPreviousEventCreateMutationVariables = Types.Exact<{
  input: Types.StepPreviousEventCreateInput;
}>;


export type StepPreviousEventCreateMutation = { stepPreviousEventCreate: { __typename: 'StepPreviousEvent', id: string } };
