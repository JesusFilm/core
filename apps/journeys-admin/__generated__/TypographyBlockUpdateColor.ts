/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyColor } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateColor
// ====================================================

export interface TypographyBlockUpdateColor_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  color: TypographyColor | null;
}

export interface TypographyBlockUpdateColor {
  typographyBlockUpdate: TypographyBlockUpdateColor_typographyBlockUpdate;
}

export interface TypographyBlockUpdateColorVariables {
  id: string;
  color: TypographyColor;
}
