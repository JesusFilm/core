/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSSRAdminJourney
// ====================================================

export interface GetSSRAdminJourney_journey_team {
  __typename: "Team";
  id: string;
}

export interface GetSSRAdminJourney_journey {
  __typename: "Journey";
  id: string;
  template: boolean | null;
  team: GetSSRAdminJourney_journey_team | null;
}

export interface GetSSRAdminJourney {
  journey: GetSSRAdminJourney_journey;
}

export interface GetSSRAdminJourneyVariables {
  id: string;
}
