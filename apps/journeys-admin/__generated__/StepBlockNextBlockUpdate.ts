/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepBlockNextBlockUpdate
// ====================================================

export interface StepBlockNextBlockUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface StepBlockNextBlockUpdate {
  stepBlockUpdate: StepBlockNextBlockUpdate_stepBlockUpdate;
}

export interface StepBlockNextBlockUpdateVariables {
  id: string;
  nextBlockId?: string | null;
}
