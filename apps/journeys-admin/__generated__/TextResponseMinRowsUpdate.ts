/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseMinRowsUpdate
// ====================================================

export interface TextResponseMinRowsUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  minRows: number | null;
}

export interface TextResponseMinRowsUpdate {
  textResponseBlockUpdate: TextResponseMinRowsUpdate_textResponseBlockUpdate | null;
}

export interface TextResponseMinRowsUpdateVariables {
  id: string;
  journeyId: string;
  input: TextResponseBlockUpdateInput;
}
