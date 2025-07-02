/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyAlign, TypographyColor, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL fragment: TypographyFields
// ====================================================

export interface TypographyFields_settings {
  __typename: "TypographyBlockSettings";
  color: string | null;
}

export interface TypographyFields {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
  settings: TypographyFields_settings;
}
