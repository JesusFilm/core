/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyCreatedAt
// ====================================================

export interface GetJourneyCreatedAt_journey_team {
  __typename: "Team";
  id: string;
}

export interface GetJourneyCreatedAt_journey {
  __typename: "Journey";
  id: string;
  createdAt: any;
  slug: string;
  /**
   * private title for creators
   */
  title: string;
  team: GetJourneyCreatedAt_journey_team | null;
}

export interface GetJourneyCreatedAt {
  journey: GetJourneyCreatedAt_journey;
}

export interface GetJourneyCreatedAtVariables {
  id: string;
}
