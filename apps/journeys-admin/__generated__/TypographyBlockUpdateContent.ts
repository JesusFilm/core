/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TypographyBlockUpdateContent
// ====================================================

export interface TypographyBlockUpdateContent_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
  content: string;
}

export interface TypographyBlockUpdateContent {
  typographyBlockUpdate: TypographyBlockUpdateContent_typographyBlockUpdate;
}

export interface TypographyBlockUpdateContentVariables {
  id: string;
  content: string;
}
