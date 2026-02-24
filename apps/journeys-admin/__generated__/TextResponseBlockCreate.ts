/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockCreateInput, TextResponseType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseBlockCreate
// ====================================================

export interface TextResponseBlockCreate_textResponseBlockCreate {
  __typename: "TextResponseBlock";
  id: string;
  parentBlockId: string | null;
  parentOrder: number | null;
  required: boolean | null;
  label: string;
  placeholder: string | null;
  hint: string | null;
  minRows: number | null;
  type: TextResponseType | null;
  routeId: string | null;
  integrationId: string | null;
  hideLabel: boolean | null;
}

export interface TextResponseBlockCreate {
  textResponseBlockCreate: TextResponseBlockCreate_textResponseBlockCreate;
}

export interface TextResponseBlockCreateVariables {
  input: TextResponseBlockCreateInput;
}
