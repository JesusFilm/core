/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockCreateInput, TypographyAlign, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockCreate
// ====================================================

export interface TypographyBlockCreate_typographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  customColor: string | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface TypographyBlockCreate {
  typographyBlockCreate: TypographyBlockCreate_typographyBlockCreate;
}

export interface TypographyBlockCreateVariables {
  input: TypographyBlockCreateInput;
}
