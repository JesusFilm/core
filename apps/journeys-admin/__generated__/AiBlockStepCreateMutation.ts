/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockCreateInput, CardBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockStepCreateMutation
// ====================================================

export interface AiBlockStepCreateMutation_stepBlockCreate {
  __typename: "StepBlock";
  id: string;
}

export interface AiBlockStepCreateMutation_cardBlockCreate {
  __typename: "CardBlock";
  id: string;
}

export interface AiBlockStepCreateMutation {
  stepBlockCreate: AiBlockStepCreateMutation_stepBlockCreate;
  cardBlockCreate: AiBlockStepCreateMutation_cardBlockCreate;
}

export interface AiBlockStepCreateMutationVariables {
  input: StepBlockCreateInput;
  cardInput: CardBlockCreateInput;
}
