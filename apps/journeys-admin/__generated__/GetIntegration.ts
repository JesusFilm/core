/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetIntegration
// ====================================================

export interface GetIntegration_integrations_team {
  __typename: "Team";
  id: string | null;
}

export interface GetIntegration_integrations_routes {
  __typename: "IntegrationGrowthSpacesRoute";
  id: string | null;
  name: string | null;
}

export interface GetIntegration_integrations {
  __typename: "IntegrationGrowthSpaces";
  id: string | null;
  team: GetIntegration_integrations_team | null;
  type: IntegrationType | null;
  accessId: string | null;
  accessSecretPart: string | null;
  routes: GetIntegration_integrations_routes[] | null;
}

export interface GetIntegration {
  integrations: GetIntegration_integrations[] | null;
}

export interface GetIntegrationVariables {
  teamId: string;
}
