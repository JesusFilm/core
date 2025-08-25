/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomains
// ====================================================

export interface GetCustomDomains_customDomains_journeyCollection_journeys {
  __typename: "Journey";
  /**
   * private title for creators
   */
  title: string;
  id: string;
}

export interface GetCustomDomains_customDomains_journeyCollection {
  __typename: "JourneyCollection";
  id: string | null;
  journeys: GetCustomDomains_customDomains_journeyCollection_journeys[] | null;
}

export interface GetCustomDomains_customDomains {
  __typename: "CustomDomain";
  id: string | null;
  apexName: string | null;
  name: string | null;
  journeyCollection: GetCustomDomains_customDomains_journeyCollection | null;
}

export interface GetCustomDomains {
  customDomains: GetCustomDomains_customDomains[] | null;
}

export interface GetCustomDomainsVariables {
  teamId: string;
}
