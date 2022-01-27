/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput, TypographyAlign } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdate
// ====================================================

export interface TypographyBlockUpdate_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  align: TypographyAlign | null;
}

export interface TypographyBlockUpdate {
  typographyBlockUpdate: TypographyBlockUpdate_typographyBlockUpdate;
}

export interface TypographyBlockUpdateVariables {
  id: string;
  journeyId: string;
  input: TypographyBlockUpdateInput;
}
