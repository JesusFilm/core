/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput, TextResponseType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseTypeUpdate
// ====================================================

export interface TextResponseTypeUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  type: TextResponseType | null;
  label: string;
  integrationId: string | null;
  routeId: string | null;
}

export interface TextResponseTypeUpdate {
  textResponseBlockUpdate: TextResponseTypeUpdate_textResponseBlockUpdate;
}

export interface TextResponseTypeUpdateVariables {
  id: string;
  input: TextResponseBlockUpdateInput;
}
