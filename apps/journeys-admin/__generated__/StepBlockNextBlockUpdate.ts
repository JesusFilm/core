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
   * step. If no nextBlockId is set it can be assumed that this step represents
   * the end of the current journey.
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
