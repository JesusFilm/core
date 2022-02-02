/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, IconSize } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockEndIconSizeUpdate
// ====================================================

export interface ButtonBlockEndIconSizeUpdate_buttonBlockUpdate_endIcon {
  __typename: "Icon";
  size: IconSize | null;
}

export interface ButtonBlockEndIconSizeUpdate_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  endIcon: ButtonBlockEndIconSizeUpdate_buttonBlockUpdate_endIcon | null;
}

export interface ButtonBlockEndIconSizeUpdate {
  buttonBlockUpdate: ButtonBlockEndIconSizeUpdate_buttonBlockUpdate | null;
}

export interface ButtonBlockEndIconSizeUpdateVariables {
  id: string;
  journeyId: string;
  input: ButtonBlockUpdateInput;
}
