/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioQuestionBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: AiBlockRadioQuestionCreateMutation
// ====================================================

export interface AiBlockRadioQuestionCreateMutation_radioQuestionBlockCreate {
  __typename: "RadioQuestionBlock";
  id: string;
}

export interface AiBlockRadioQuestionCreateMutation {
  radioQuestionBlockCreate: AiBlockRadioQuestionCreateMutation_radioQuestionBlockCreate;
}

export interface AiBlockRadioQuestionCreateMutationVariables {
  input: RadioQuestionBlockCreateInput;
}
