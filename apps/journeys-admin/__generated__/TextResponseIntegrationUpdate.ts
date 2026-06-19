/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: TextResponseIntegrationUpdate
// ====================================================

export interface TextResponseIntegrationUpdate_textResponseBlockUpdate {
  __typename: "TextResponseBlock";
  id: string;
  integrationId: string | null;
  routeId: string | null;
}

export interface TextResponseIntegrationUpdate {
  textResponseBlockUpdate: TextResponseIntegrationUpdate_textResponseBlockUpdate;
}

export interface TextResponseIntegrationUpdateVariables {
  id: string;
  integrationId?: string | null;
  routeId?: string | null;
}
