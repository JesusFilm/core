/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockStepUpdateMutation
// ====================================================

export interface AiBlockStepUpdateMutation_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
}

export interface AiBlockStepUpdateMutation {
  stepBlockUpdate: AiBlockStepUpdateMutation_stepBlockUpdate;
}

export interface AiBlockStepUpdateMutationVariables {
  id: string;
  input: StepBlockUpdateInput;
}
