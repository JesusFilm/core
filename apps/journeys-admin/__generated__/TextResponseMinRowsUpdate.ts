/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseMinRowsUpdate
// ====================================================

export interface TextResponseMinRowsUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  minRows: number | null;
}

export interface TextResponseMinRowsUpdate {
  textResponseBlockUpdate: TextResponseMinRowsUpdate_textResponseBlockUpdate;
}

export interface TextResponseMinRowsUpdateVariables {
  id: string;
  minRows?: number | null;
}
