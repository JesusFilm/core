/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseLabelUpdate
// ====================================================

export interface TextResponseLabelUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  label: string;
}

export interface TextResponseLabelUpdate {
  textResponseBlockUpdate: TextResponseLabelUpdate_textResponseBlockUpdate;
}

export interface TextResponseLabelUpdateVariables {
  id: string;
  label: string;
}
