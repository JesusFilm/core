/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput, TypographyAlign } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateColor
// ====================================================

export interface TypographyBlockUpdateColor_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  align: TypographyAlign | null;
}

export interface TypographyBlockUpdateColor {
  typographyBlockUpdate: TypographyBlockUpdateColor_typographyBlockUpdate;
}

export interface TypographyBlockUpdateColorVariables {
  id: string;
  journeyId: string;
  input: TypographyBlockUpdateInput;
}
