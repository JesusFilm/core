/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: StepFields
// ====================================================

export interface StepFields {
  __typename: "StepBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  /**
   * locked will be set to true if the user should not be able to manually
   * advance to the next step.
   */
  locked: boolean;
  /**
   * nextBlockId contains the preferred block to navigate to, users will have to
   * manually set the next block they want to card to navigate to
   */
  nextBlockId: string | null;
}
