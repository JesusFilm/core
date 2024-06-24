/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationGrowthSpaceUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IntegrationGrowthSpacesUpdate
// ====================================================

export interface IntegrationGrowthSpacesUpdate_integrationGrowthSpacesUpdate {
  __typename: "IntegrationGrowthSpace";
  id: string;
}

export interface IntegrationGrowthSpacesUpdate {
  integrationGrowthSpacesUpdate: IntegrationGrowthSpacesUpdate_integrationGrowthSpacesUpdate;
}

export interface IntegrationGrowthSpacesUpdateVariables {
  id: string;
  input: IntegrationGrowthSpaceUpdateInput;
}
