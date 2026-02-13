/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SpacerSpacingUpdate
// ====================================================

export interface SpacerSpacingUpdate_spacerBlockUpdate {
  __typename: "SpacerBlock";
  id: string;
  spacing: number | null;
}

export interface SpacerSpacingUpdate {
  spacerBlockUpdate: SpacerSpacingUpdate_spacerBlockUpdate;
}

export interface SpacerSpacingUpdateVariables {
  id: string;
  spacing: number;
}
