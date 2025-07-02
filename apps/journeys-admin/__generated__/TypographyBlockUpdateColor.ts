/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockSettingsInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateColor
// ====================================================

export interface TypographyBlockUpdateColor_typographyBlockUpdate_settings {
  __typename: "TypographyBlockSettings";
  color: string | null;
}

export interface TypographyBlockUpdateColor_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  settings: TypographyBlockUpdateColor_typographyBlockUpdate_settings;
}

export interface TypographyBlockUpdateColor {
  typographyBlockUpdate: TypographyBlockUpdateColor_typographyBlockUpdate;
}

export interface TypographyBlockUpdateColorVariables {
  id: string;
  settings: TypographyBlockSettingsInput;
}
