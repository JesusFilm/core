/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomain
// ====================================================

export interface GetCustomDomain_customDomains_verification {
  __typename: "Verification";
  domain: string;
  type: string;
  value: string;
}

export interface GetCustomDomain_customDomains {
  __typename: "CustomDomain";
  name: string;
  apexName: string;
  verified: boolean;
  verification: GetCustomDomain_customDomains_verification | null;
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
