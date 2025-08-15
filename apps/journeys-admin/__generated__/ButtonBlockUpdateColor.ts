/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateColor
// ====================================================

export interface ButtonBlockUpdateColor_buttonBlockUpdate_settings {
  __typename: "ButtonBlockSettings";
  /**
   * Color of the button
   */
  color: string | null;
}

export interface ButtonBlockUpdateColor_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  settings: ButtonBlockUpdateColor_buttonBlockUpdate_settings | null;
}

export interface ButtonBlockUpdateColor {
  buttonBlockUpdate: ButtonBlockUpdateColor_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateColorVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}
