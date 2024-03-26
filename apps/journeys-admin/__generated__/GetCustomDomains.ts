/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomains
// ====================================================

export interface GetCustomDomains_customDomains_verification_verification {
  __typename: "VercelDomainVerification";
  domain: string | null;
  reason: string | null;
  type: string | null;
  value: string | null;
}

export interface GetCustomDomains_customDomains_verification {
  __typename: "CustomDomainVerification";
  verified: boolean;
  verification: (GetCustomDomains_customDomains_verification_verification | null)[] | null;
}

export interface GetCustomDomains_customDomains_configuration {
  __typename: "VercelDomainConfiguration";
  misconfigured: boolean | null;
}

export interface GetCustomDomains_customDomains_journeyCollection_journeys {
  __typename: "Journey";
  title: string;
  id: string;
}

export interface GetCustomDomains_customDomains_journeyCollection {
  __typename: "JourneyCollection";
  id: string;
  journeys: GetCustomDomains_customDomains_journeyCollection_journeys[] | null;
}

export interface GetCustomDomains_customDomains {
  __typename: "CustomDomain";
  id: string;
  apexName: string;
  verification: GetCustomDomains_customDomains_verification | null;
  configuration: GetCustomDomains_customDomains_configuration | null;
  name: string;
  journeyCollection: GetCustomDomains_customDomains_journeyCollection | null;
}

export interface GetCustomDomains {
  customDomains: GetCustomDomains_customDomains[];
}

export interface GetCustomDomainsVariables {
  teamId: string;
}
