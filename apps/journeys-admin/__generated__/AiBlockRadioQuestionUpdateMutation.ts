/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AiBlockRadioQuestionUpdateMutation
// ====================================================

export interface AiBlockRadioQuestionUpdateMutation_radioQuestionBlockUpdate {
  __typename: "RadioQuestionBlock";
  id: string;
}

export interface AiBlockRadioQuestionUpdateMutation {
  radioQuestionBlockUpdate: AiBlockRadioQuestionUpdateMutation_radioQuestionBlockUpdate;
}

export interface AiBlockRadioQuestionUpdateMutationVariables {
  id: string;
  parentBlockId: string;
}
