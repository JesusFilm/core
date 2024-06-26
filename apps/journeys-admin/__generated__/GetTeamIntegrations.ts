/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetTeamIntegrations
// ====================================================

export interface GetTeamIntegrations_team_integrations {
  __typename: "IntegrationGrowthSpaces";
  id: string;
  type: IntegrationType;
}

export interface GetTeamIntegrations_team {
  __typename: "Team";
  id: string;
  title: string;
  integrations: GetTeamIntegrations_team_integrations[];
}

export interface GetTeamIntegrations {
  team: GetTeamIntegrations_team;
}

export interface GetTeamIntegrationsVariables {
  teamId: string;
}
