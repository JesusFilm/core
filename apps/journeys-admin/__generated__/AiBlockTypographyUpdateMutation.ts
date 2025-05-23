/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TypographyBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockTypographyUpdateMutation
// ====================================================

export interface AiBlockTypographyUpdateMutation_typographyBlockUpdate {
  __typename: "TypographyBlock";
  id: string;
}

export interface AiBlockTypographyUpdateMutation {
  typographyBlockUpdate: AiBlockTypographyUpdateMutation_typographyBlockUpdate;
}

export interface AiBlockTypographyUpdateMutationVariables {
  id: string;
  input: TypographyBlockUpdateInput;
}
