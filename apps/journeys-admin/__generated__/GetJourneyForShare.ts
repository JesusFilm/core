/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyForShare
// ====================================================

export interface GetJourneyForShare_journey_team_customDomains {
  __typename: "CustomDomain";
  name: string;
}

export interface GetJourneyForShare_journey_team {
  __typename: "Team";
  id: string;
  customDomains: GetJourneyForShare_journey_team_customDomains[];
}

export interface GetJourneyForShare_journey {
  __typename: "Journey";
  id: string;
  slug: string;
  team: GetJourneyForShare_journey_team | null;
}

export interface GetJourneyForShare {
  journey: GetJourneyForShare_journey;
}

export interface GetJourneyForShareVariables {
  id: string;
}
