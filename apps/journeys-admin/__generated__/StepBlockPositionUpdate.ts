/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { StepBlockPositionUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: StepBlockPositionUpdate
// ====================================================

export interface StepBlockPositionUpdate_stepBlockPositionUpdate {
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
  stepBlockPositionUpdate: StepBlockPositionUpdate_stepBlockPositionUpdate[];
}

export interface StepBlockPositionUpdateVariables {
  input: StepBlockPositionUpdateInput[];
}
