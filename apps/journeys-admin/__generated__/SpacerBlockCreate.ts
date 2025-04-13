/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SpacerBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SpacerBlockCreate
// ====================================================

export interface SpacerBlockCreate_spacerBlockCreate {
  __typename: "SpacerBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  spacing: number | null;
}

export interface SpacerBlockCreate {
  spacerBlockCreate: SpacerBlockCreate_spacerBlockCreate;
}

export interface SpacerBlockCreateVariables {
  input: SpacerBlockCreateInput;
}
