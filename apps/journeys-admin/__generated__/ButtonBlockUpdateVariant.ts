/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ButtonBlockUpdateVariant
// ====================================================

export interface ButtonBlockUpdateVariant_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
  variant: ButtonVariant | null;
}

export interface ButtonBlockUpdateVariant {
  buttonBlockUpdate: ButtonBlockUpdateVariant_buttonBlockUpdate;
}

export interface ButtonBlockUpdateVariantVariables {
  id: string;
  variant: ButtonVariant;
}
