/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput, TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AITypographyUpdate
// ====================================================

export interface AITypographyUpdate_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}

export interface AITypographyUpdate {
  typographyBlockUpdate: AITypographyUpdate_typographyBlockUpdate;
}

export interface AITypographyUpdateVariables {
  id: string;
  input: TypographyBlockUpdateInput;
}
