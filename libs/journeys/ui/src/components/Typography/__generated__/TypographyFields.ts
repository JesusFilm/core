/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyAlign, TypographyColor, TypographyVariant } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL fragment: TypographyFields
// ====================================================

export interface TypographyFields {
  __typename: "TypographyBlock";
  id: string;
  journeyId: string;
  parentBlockId: string | null;
  align: TypographyAlign | null;
  color: TypographyColor | null;
  content: string;
  variant: TypographyVariant | null;
}
