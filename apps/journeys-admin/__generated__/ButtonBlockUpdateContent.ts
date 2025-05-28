/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateContent
// ====================================================

export interface ButtonBlockUpdateContent_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  label: string | null;
}

export interface ButtonBlockUpdateContent {
  buttonBlockUpdate: ButtonBlockUpdateContent_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateContentVariables {
  id: string;
  label: string;
}
