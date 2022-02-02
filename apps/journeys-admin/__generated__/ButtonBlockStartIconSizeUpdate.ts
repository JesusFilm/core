/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockStartIconSizeUpdate
// ====================================================

export interface ButtonBlockStartIconSizeUpdate_buttonBlockUpdate_startIcon {
  __typename: "Icon";
  size: IconSize | null;
}

export interface ButtonBlockStartIconSizeUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  startIcon: ButtonBlockStartIconSizeUpdate_buttonBlockUpdate_startIcon | null;
}

export interface ButtonBlockStartIconSizeUpdate {
  buttonBlockUpdate: ButtonBlockStartIconSizeUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockStartIconSizeUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}
