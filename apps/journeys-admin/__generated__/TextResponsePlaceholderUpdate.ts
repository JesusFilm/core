/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponsePlaceholderUpdate
// ====================================================

export interface TextResponsePlaceholderUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  placeholder: string | null;
}

export interface TextResponsePlaceholderUpdate {
  textResponseBlockUpdate: TextResponsePlaceholderUpdate_textResponseBlockUpdate | null;
}

export interface TextResponsePlaceholderUpdateVariables {
  id: string;
  placeholder: string;
}
