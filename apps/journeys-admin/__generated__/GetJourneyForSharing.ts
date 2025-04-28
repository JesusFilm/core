/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyForSharing
// ====================================================

export interface GetJourneyForSharing_journey_team_customDomains {
  __typename: "CustomDomain";
  name: string;
}

export interface GetJourneyForSharing_journey_team {
  __typename: "Team";
  id: string;
  customDomains: GetJourneyForSharing_journey_team_customDomains[];
}

export interface GetJourneyForSharing_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  team: GetJourneyForSharing_journey_team | null;
}

export interface GetJourneyForSharing {
  journey: GetJourneyForSharing_journey;
}

export interface GetJourneyForSharingVariables {
  id: string;
}
