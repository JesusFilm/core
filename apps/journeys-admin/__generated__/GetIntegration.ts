/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetIntegration
// ====================================================

export interface GetIntegration_integrations_IntegrationGrowthSpaces_team {
  __typename: "Team";
  id: string;
}

export interface GetIntegration_integrations_IntegrationGrowthSpaces_routes {
  __typename: "IntegrationGrowthSpacesRoute";
  id: string | null;
  name: string | null;
}

export interface GetIntegration_integrations_IntegrationGrowthSpaces {
  __typename: "IntegrationGrowthSpaces";
  id: string;
  team: GetIntegration_integrations_IntegrationGrowthSpaces_team;
  type: IntegrationType;
  accessId: string | null;
  accessSecretPart: string | null;
  routes: GetIntegration_integrations_IntegrationGrowthSpaces_routes[] | null;
}

export interface GetIntegration_integrations_IntegrationGoogle_team {
  __typename: "Team";
  id: string;
}

export interface GetIntegration_integrations_IntegrationGoogle_user {
  __typename: "AuthenticatedUser";
  id: string;
  email: string;
}

export interface GetIntegration_integrations_IntegrationGoogle {
  __typename: "IntegrationGoogle";
  id: string;
  team: GetIntegration_integrations_IntegrationGoogle_team;
  type: IntegrationType;
  user: GetIntegration_integrations_IntegrationGoogle_user | null;
  accountEmail: string | null;
}

export type GetIntegration_integrations = GetIntegration_integrations_IntegrationGrowthSpaces | GetIntegration_integrations_IntegrationGoogle;

export interface GetIntegration {
  integrations: GetIntegration_integrations[];
}

export interface GetIntegrationVariables {
  teamId: string;
}
