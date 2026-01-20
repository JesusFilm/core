/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationGoogleUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IntegrationGoogleUpdate
// ====================================================

export interface IntegrationGoogleUpdate_integrationGoogleUpdate {
  __typename: "IntegrationGoogle";
  id: string;
}

export interface IntegrationGoogleUpdate {
  integrationGoogleUpdate: IntegrationGoogleUpdate_integrationGoogleUpdate;
}

export interface IntegrationGoogleUpdateVariables {
  id: string;
  input: IntegrationGoogleUpdateInput;
}
