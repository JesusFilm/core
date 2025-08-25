/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockSettingsInput, ButtonAlignment } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateAlignment
// ====================================================

export interface ButtonBlockUpdateAlignment_buttonBlockUpdate_settings {
  __typename: "ButtonBlockSettings";
  alignment: ButtonAlignment | null;
}

export interface ButtonBlockUpdateAlignment_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  settings: ButtonBlockUpdateAlignment_buttonBlockUpdate_settings | null;
}

export interface ButtonBlockUpdateAlignment {
  buttonBlockUpdate: ButtonBlockUpdateAlignment_buttonBlockUpdate;
}

export interface ButtonBlockUpdateAlignmentVariables {
  id: string;
  settings: ButtonBlockSettingsInput;
}
