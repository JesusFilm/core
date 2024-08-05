/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateContent
// ====================================================

export interface ButtonBlockUpdateContent_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  label: string;
}

export interface ButtonBlockUpdateContent {
  buttonBlockUpdate: ButtonBlockUpdateContent_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateContentVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}
