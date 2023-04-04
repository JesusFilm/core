/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockLockUpdate
// ====================================================

export interface StepBlockLockUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
}

export interface StepBlockLockUpdate {
  stepBlockUpdate: StepBlockLockUpdate_stepBlockUpdate;
}

export interface StepBlockLockUpdateVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
}
