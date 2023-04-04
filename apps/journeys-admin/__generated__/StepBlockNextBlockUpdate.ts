/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockNextBlockUpdate
// ====================================================

export interface StepBlockNextBlockUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to when a
   * NavigateAction occurs or if the user manually tries to advance to the next
   * step. If no nextBlockId is set it will automatically navigate to the next
   * step in the journey based on parentOrder.
   */
  nextBlockId: string | null;
}

export interface StepBlockNextBlockUpdate {
  stepBlockUpdate: StepBlockNextBlockUpdate_stepBlockUpdate;
}

export interface StepBlockNextBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
}
