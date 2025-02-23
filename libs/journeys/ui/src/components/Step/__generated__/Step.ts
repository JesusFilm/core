import * as Types from '../../../../__generated__/types';

export type StepViewEventCreateMutationVariables = Types.Exact<{
  input: Types.StepViewEventCreateInput;
}>;


export type StepViewEventCreateMutation = { __typename?: 'Mutation', stepViewEventCreate: { __typename?: 'StepViewEvent', id: string } };
