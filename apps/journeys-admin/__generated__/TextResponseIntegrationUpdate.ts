/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { TextResponseBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TextResponseIntegrationUpdate
// ====================================================

export interface TextResponseIntegrationUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  integrationId: string | null;
}

export interface TextResponseIntegrationUpdate {
  textResponseBlockUpdate: TextResponseIntegrationUpdate_textResponseBlockUpdate | null;
}

export interface TextResponseIntegrationUpdateVariables {
  id: string;
  input: TextResponseBlockUpdateInput;
}
