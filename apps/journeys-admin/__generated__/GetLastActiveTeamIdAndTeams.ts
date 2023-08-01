/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLastActiveTeamIdAndTeams
// ====================================================

export interface GetLastActiveTeamIdAndTeams_getJourneyProfile {
  __typename: "JourneyProfile";
  lastActiveTeamId: string | null;
}

export interface GetLastActiveTeamIdAndTeams_teams {
  __typename: "Team";
  id: string;
  title: string;
}

export interface GetLastActiveTeamIdAndTeams {
  getJourneyProfile: GetLastActiveTeamIdAndTeams_getJourneyProfile | null;
  teams: GetLastActiveTeamIdAndTeams_teams[];
}
