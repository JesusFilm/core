/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RadioQuestionResponseCreateInput } from "../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: RadioQuestionResponseCreate
// ====================================================

export interface RadioQuestionResponseCreate_radioQuestionResponseCreate {
  __typename: "RadioQuestionResponse";
  id: string;
  radioOptionBlockId: string;
}

export interface RadioQuestionResponseCreate {
  radioQuestionResponseCreate: RadioQuestionResponseCreate_radioQuestionResponseCreate;
}

export interface RadioQuestionResponseCreateVariables {
  input: RadioQuestionResponseCreateInput;
}
