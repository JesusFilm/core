/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseLabelUpdate
// ====================================================

export interface TextResponseLabelUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  label: string;
}

export interface TextResponseLabelUpdate {
  textResponseBlockUpdate: TextResponseLabelUpdate_textResponseBlockUpdate | null;
}

export interface TextResponseLabelUpdateVariables {
  id: string;
  journeyId: string;
  input: TextResponseBlockUpdateInput;
}
