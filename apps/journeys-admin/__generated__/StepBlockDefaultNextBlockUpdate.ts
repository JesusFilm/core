/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockDefaultNextBlockUpdate
// ====================================================

export interface StepBlockDefaultNextBlockUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}

export interface StepBlockDefaultNextBlockUpdate {
  stepBlockUpdate: StepBlockDefaultNextBlockUpdate_stepBlockUpdate;
}

export interface StepBlockDefaultNextBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: StepBlockUpdateInput;
}
