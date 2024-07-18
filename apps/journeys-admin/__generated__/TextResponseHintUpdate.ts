/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseHintUpdate
// ====================================================

export interface TextResponseHintUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  hint: string | null;
}

export interface TextResponseHintUpdate {
  textResponseBlockUpdate: TextResponseHintUpdate_textResponseBlockUpdate | null;
}

export interface TextResponseHintUpdateVariables {
  id: string;
  input: TextResponseBlockUpdateInput;
}
