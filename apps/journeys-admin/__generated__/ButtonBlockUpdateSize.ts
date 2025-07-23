/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateSize
// ====================================================

export interface ButtonBlockUpdateSize_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  size: ButtonSize | null;
}

export interface ButtonBlockUpdateSize {
  buttonBlockUpdate: ButtonBlockUpdateSize_buttonBlockUpdate;
}

export interface ButtonBlockUpdateSizeVariables {
  id: string;
  size: ButtonSize;
}
