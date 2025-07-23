/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationGrowthSpacesUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IntegrationGrowthSpacesUpdate
// ====================================================

export interface IntegrationGrowthSpacesUpdate_integrationGrowthSpacesUpdate {
  __typename: "IntegrationGrowthSpaces";
  id: string | null;
}

export interface IntegrationGrowthSpacesUpdate {
  integrationGrowthSpacesUpdate: IntegrationGrowthSpacesUpdate_integrationGrowthSpacesUpdate | null;
}

export interface IntegrationGrowthSpacesUpdateVariables {
  id: string;
  input: IntegrationGrowthSpacesUpdateInput;
}
