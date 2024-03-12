/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomain
// ====================================================

export interface GetCustomDomain_customDomains_verification_verification {
  __typename: "VercelDomainVerification";
  domain: string | null;
  reason: string | null;
  type: string | null;
  value: string | null;
}

export interface GetCustomDomain_customDomains_verification {
  __typename: "CustomDomainVerification";
  verified: boolean;
  verification: (GetCustomDomain_customDomains_verification_verification | null)[] | null;
}

export interface GetCustomDomain_customDomains_journeyCollection_journeys {
  __typename: "Journey";
  title: string;
  id: string;
}

export interface GetCustomDomain_customDomains_journeyCollection {
  __typename: "JourneyCollection";
  id: string;
  journeys: (GetCustomDomain_customDomains_journeyCollection_journeys | null)[];
}

export interface GetCustomDomain_customDomains {
  __typename: "CustomDomain";
  id: string;
  apexName: string;
  allowOutsideJourneys: boolean;
  verification: GetCustomDomain_customDomains_verification | null;
  teamId: string;
  name: string;
  journeyCollection: GetCustomDomain_customDomains_journeyCollection | null;
}

export interface GetCustomDomain {
  customDomains: GetCustomDomain_customDomains[];
}

export interface GetCustomDomainVariables {
  teamId: string;
}
