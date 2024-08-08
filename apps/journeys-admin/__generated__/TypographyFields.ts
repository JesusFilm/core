/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyAlign, TypographyVariant } from "./globalTypes";

// ====================================================
// GraphQL fragment: TypographyFields
// ====================================================

export interface TypographyFields {
  __typename: "TypographyBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  align: TypographyAlign | null;
  customColor: string | null;
  content: string;
  variant: TypographyVariant | null;
}
