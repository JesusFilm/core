/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput, TypographyAlign } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateAlign
// ====================================================

export interface TypographyBlockUpdateAlign_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  align: TypographyAlign | null;
}

export interface TypographyBlockUpdateAlign {
  typographyBlockUpdate: TypographyBlockUpdateAlign_typographyBlockUpdate;
}

export interface TypographyBlockUpdateAlignVariables {
  id: string;
  input: TypographyBlockUpdateInput;
}
