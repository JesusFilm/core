/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationGrowthSpacesCreateInput, IntegrationType } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: IntegrationGrowthSpacesCreate
// ====================================================

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_team {
  __typename: "Team";
  id: string | null;
}

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_routes {
  __typename: "IntegrationGrowthSpacesRoute";
  id: string | null;
  name: string | null;
}

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate {
  __typename: "IntegrationGrowthSpaces";
  id: string | null;
  team: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_team | null;
  type: IntegrationType | null;
  accessId: string | null;
  accessSecretPart: string | null;
  routes: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_routes[] | null;
}

export interface IntegrationGrowthSpacesCreate {
  integrationGrowthSpacesCreate: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate | null;
}

export interface IntegrationGrowthSpacesCreateVariables {
  input: IntegrationGrowthSpacesCreateInput;
}
