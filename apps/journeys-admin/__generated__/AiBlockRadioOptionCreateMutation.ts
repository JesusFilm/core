/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioOptionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockRadioOptionCreateMutation
// ====================================================

export interface AiBlockRadioOptionCreateMutation_radioOptionBlockCreate {
  __typename: "RadioOptionBlock";
  id: string;
}

export interface AiBlockRadioOptionCreateMutation {
  radioOptionBlockCreate: AiBlockRadioOptionCreateMutation_radioOptionBlockCreate;
}

export interface AiBlockRadioOptionCreateMutationVariables {
  input: RadioOptionBlockCreateInput;
}
