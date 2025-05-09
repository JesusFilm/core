/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockStepCreateMutation
// ====================================================

export interface AiBlockStepCreateMutation_stepBlockCreate {
  __typename: "StepBlock";
  id: string;
}

export interface AiBlockStepCreateMutation {
  stepBlockCreate: AiBlockStepCreateMutation_stepBlockCreate;
}

export interface AiBlockStepCreateMutationVariables {
  input: StepBlockCreateInput;
}
