/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateVariant
// ====================================================

export interface TypographyBlockUpdateVariant_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  variant: TypographyVariant | null;
}

export interface TypographyBlockUpdateVariant {
  typographyBlockUpdate: TypographyBlockUpdateVariant_typographyBlockUpdate;
}

export interface TypographyBlockUpdateVariantVariables {
  id: string;
  input: TypographyBlockUpdateInput;
}
