/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: StepBlockPositionUpdate
// ====================================================

export interface StepBlockPositionUpdate_stepBlockUpdate {
  __typename: "StepBlock";
  id: string;
  /**
   * x is used to position the block horizontally in the journey flow diagram on
   * the editor.
   */
  x: number | null;
  /**
   * y is used to position the block vertically in the journey flow diagram on
   * the editor.
   */
  y: number | null;
}

export interface StepBlockPositionUpdate {
  stepBlockUpdate: StepBlockPositionUpdate_stepBlockUpdate;
}

export interface StepBlockPositionUpdateVariables {
  id: string;
  journeyId: string;
  x: number;
  y: number;
}
