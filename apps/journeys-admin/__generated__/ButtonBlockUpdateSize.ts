/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateSize
// ====================================================

export interface ButtonBlockUpdateSize_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  size: ButtonSize | null;
}

export interface ButtonBlockUpdateSize {
  buttonBlockUpdate: ButtonBlockUpdateSize_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateSizeVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}
