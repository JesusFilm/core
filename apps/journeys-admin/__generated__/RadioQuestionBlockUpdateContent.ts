/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioQuestionBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RadioQuestionBlockUpdateContent
// ====================================================

export interface RadioQuestionBlockUpdateContent_radioQuestionBlockUpdate {
  __typename: "RadioQuestionBlock";
  id: string;
  label: string;
  description: string | null;
}

export interface RadioQuestionBlockUpdateContent {
  radioQuestionBlockUpdate: RadioQuestionBlockUpdateContent_radioQuestionBlockUpdate;
}

export interface RadioQuestionBlockUpdateContentVariables {
  id: string;
  journeyId: string;
  input: RadioQuestionBlockUpdateInput;
}
