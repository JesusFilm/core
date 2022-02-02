/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockCreateInput, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockCreate
// ====================================================

export interface TypographyBlockCreate_typographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface TypographyBlockCreate {
  typographyBlockCreate: TypographyBlockCreate_typographyBlockCreate;
}

export interface TypographyBlockCreateVariables {
  input: TypographyBlockCreateInput;
}
