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
  id: string;
}

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_routes {
  __typename: "IntegrationGrowthSpacesRoute";
  id: string | null;
  name: string | null;
}

export interface IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate {
  __typename: "IntegrationGrowthSpaces";
  id: string;
  team: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_team;
  type: IntegrationType;
  accessId: string | null;
  accessSecretPart: string | null;
  routes: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate_routes[] | null;
}

export interface IntegrationGrowthSpacesCreate {
  integrationGrowthSpacesCreate: IntegrationGrowthSpacesCreate_integrationGrowthSpacesCreate;
}

export interface IntegrationGrowthSpacesCreateVariables {
  input: IntegrationGrowthSpacesCreateInput;
}
