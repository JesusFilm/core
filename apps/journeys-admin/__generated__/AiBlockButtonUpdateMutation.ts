/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ButtonBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockButtonUpdateMutation
// ====================================================

export interface AiBlockButtonUpdateMutation_buttonBlockUpdate {
  __typename: "ButtonBlock";
  id: string;
}

export interface AiBlockButtonUpdateMutation {
  buttonBlockUpdate: AiBlockButtonUpdateMutation_buttonBlockUpdate | null;
}

export interface AiBlockButtonUpdateMutationVariables {
  id: string;
  input: ButtonBlockUpdateInput;
}
