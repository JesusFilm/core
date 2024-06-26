/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { IntegrationType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetIntegration
// ====================================================

export interface GetIntegration_integrations_routes {
  __typename: "GrowthSpacesRoute";
  id: string;
  name: string;
}

export interface GetIntegration_integrations {
  __typename: "IntegrationGrowthSpaces";
  id: string;
  teamId: string;
  type: IntegrationType;
  accessId: string;
  accessSecretPart: string;
  routes: GetIntegration_integrations_routes[];
}

export interface GetIntegration {
  integrations: GetIntegration_integrations[];
}

export interface GetIntegrationVariables {
  teamId: string;
}
