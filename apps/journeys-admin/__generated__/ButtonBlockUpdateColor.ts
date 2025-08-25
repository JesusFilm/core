/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateColor
// ====================================================

export interface ButtonBlockUpdateColor_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  color: ButtonColor | null;
}

export interface ButtonBlockUpdateColor {
  buttonBlockUpdate: ButtonBlockUpdateColor_buttonBlockUpdate;
}

export interface ButtonBlockUpdateColorVariables {
  id: string;
  color: ButtonColor;
}
