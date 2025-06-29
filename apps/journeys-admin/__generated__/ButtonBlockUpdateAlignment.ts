/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockClassNamesInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateAlignment
// ====================================================

export interface ButtonBlockUpdateAlignment_buttonBlockUpdate_classNames {
  __typename: "ButtonBlockClassNames";
  /**
   * Tailwind class names for the button block
   */
  self: string;
}

export interface ButtonBlockUpdateAlignment_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  /**
   * classNames is an object of tailwind class names for the block
   */
  classNames: ButtonBlockUpdateAlignment_buttonBlockUpdate_classNames | null;
}

export interface ButtonBlockUpdateAlignment {
  buttonBlockUpdate: ButtonBlockUpdateAlignment_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateAlignmentVariables {
  id: string;
  classNames: ButtonBlockClassNamesInput;
}
