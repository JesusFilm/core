/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RadioQuestionUpdate
// ====================================================

export interface RadioQuestionUpdate_radioQuestionBlockUpdate {
  __typename: "RadioQuestionBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  gridView: boolean | null;
}

export interface RadioQuestionUpdate {
  radioQuestionBlockUpdate: RadioQuestionUpdate_radioQuestionBlockUpdate;
}

export interface RadioQuestionUpdateVariables {
  id: string;
  parentBlockId: string;
  gridView?: boolean | null;
}
