/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseHideLabelUpdate
// ====================================================

export interface TextResponseHideLabelUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  hideLabel: boolean | null;
}

export interface TextResponseHideLabelUpdate {
  textResponseBlockUpdate: TextResponseHideLabelUpdate_textResponseBlockUpdate | null;
}

export interface TextResponseHideLabelUpdateVariables {
  id: string;
  hideLabel: boolean;
}
