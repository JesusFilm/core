/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationGrowthSpaceCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IntegrationGrowthSpacesCreate
// ====================================================

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate {
  __typename: "IntegrationGrowthSpace";
  id: string;
}

export interface IntegrationGrowthSpacesCreate {
  integrationGrowthSpacesCreate: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate;
}

export interface IntegrationGrowthSpacesCreateVariables {
  teamId: string;
  input: IntegrationGrowthSpaceCreateInput;
}
