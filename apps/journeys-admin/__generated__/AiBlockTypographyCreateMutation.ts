/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockTypographyCreateMutation
// ====================================================

export interface AiBlockTypographyCreateMutation_typographyBlockCreate {
  __typename: "TypographyBlock";
  id: string;
}

export interface AiBlockTypographyCreateMutation {
  typographyBlockCreate: AiBlockTypographyCreateMutation_typographyBlockCreate;
}

export interface AiBlockTypographyCreateMutationVariables {
  input: TypographyBlockCreateInput;
}
