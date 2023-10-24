/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyTeam
// ====================================================

export interface GetJourneyTeam_journey_team {
  __typename: "Team";
  title: string;
  publicTitle: string | null;
}

export interface GetJourneyTeam_journey {
  __typename: "Journey";
  team: GetJourneyTeam_journey_team | null;
}

export interface GetJourneyTeam {
  journey: GetJourneyTeam_journey;
}

export interface GetJourneyTeamVariables {
  journeyId: string;
}
