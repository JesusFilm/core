/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseBlockUpdateContent
// ====================================================

export interface TextResponseBlockUpdateContent_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  submitLabel: string | null;
}

export interface TextResponseBlockUpdateContent {
  textResponseBlockUpdate: TextResponseBlockUpdateContent_textResponseBlockUpdate | null;
}

export interface TextResponseBlockUpdateContentVariables {
  id: string;
  journeyId: string;
  input: TextResponseBlockUpdateInput;
}
