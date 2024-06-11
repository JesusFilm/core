/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseBlockCreate
// ====================================================

export interface TextResponseBlockCreate_textResponseBlockCreate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  label: string;
  hint: string | null;
  minRows: number | null;
}

export interface TextResponseBlockCreate {
  textResponseBlockCreate: TextResponseBlockCreate_textResponseBlockCreate;
}

export interface TextResponseBlockCreateVariables {
  input: TextResponseBlockCreateInput;
}
