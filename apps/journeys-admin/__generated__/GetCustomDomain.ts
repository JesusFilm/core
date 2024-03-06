/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomain
// ====================================================

export interface GetCustomDomain_customDomains {
  __typename: "CustomDomain";
  hostName: string;
  defaultJourneysOnly: boolean;
  id: string;
  teamId: string;
}

export interface GetCustomDomain {
  customDomains: GetCustomDomain_customDomains[] | null;
}

export interface GetCustomDomainVariables {
  teamId: string;
}
