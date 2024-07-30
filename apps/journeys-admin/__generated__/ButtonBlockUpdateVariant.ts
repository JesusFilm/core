/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput, ButtonVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateVariant
// ====================================================

export interface ButtonBlockUpdateVariant_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  variant: ButtonVariant | null;
}

export interface ButtonBlockUpdateVariant {
  buttonBlockUpdate: ButtonBlockUpdateVariant_buttonBlockUpdate | null;
}

export interface ButtonBlockUpdateVariantVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}
