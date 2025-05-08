/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockRadioOptionMutation
// ====================================================

export interface AiBlockRadioOptionMutation_radioOptionBlockUpdate {
  __typename: "RadioOptionBlock";
  id: string;
}

export interface AiBlockRadioOptionMutation {
  radioOptionBlockUpdate: AiBlockRadioOptionMutation_radioOptionBlockUpdate;
}

export interface AiBlockRadioOptionMutationVariables {
  id: string;
  input: RadioOptionBlockUpdateInput;
}
