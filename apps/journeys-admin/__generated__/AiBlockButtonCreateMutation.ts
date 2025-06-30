/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockButtonCreateMutation
// ====================================================

export interface AiBlockButtonCreateMutation_buttonBlockCreate {
  __typename: "ButtonBlock";
  id: string;
}

export interface AiBlockButtonCreateMutation {
  buttonBlockCreate: AiBlockButtonCreateMutation_buttonBlockCreate;
}

export interface AiBlockButtonCreateMutationVariables {
  input: ButtonBlockCreateInput;
}
