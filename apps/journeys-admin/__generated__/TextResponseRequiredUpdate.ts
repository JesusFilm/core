/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseRequiredUpdate
// ====================================================

export interface TextResponseRequiredUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  required: boolean | null;
}

export interface TextResponseRequiredUpdate {
  textResponseBlockUpdate: TextResponseRequiredUpdate_textResponseBlockUpdate;
}

export interface TextResponseRequiredUpdateVariables {
  id: string;
  required?: boolean | null;
}
