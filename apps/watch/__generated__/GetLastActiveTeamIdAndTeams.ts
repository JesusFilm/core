/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetLastActiveTeamIdAndTeams
// ====================================================

export interface GetLastActiveTeamIdAndTeams_getJourneyProfile {
  __typename: "JourneyProfile";
  id: string | null;
  lastActiveTeamId: string | null;
}

export interface GetLastActiveTeamIdAndTeams_teams_userTeams_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  imageUrl: string | null;
  email: string;
}

export interface GetLastActiveTeamIdAndTeams_teams_userTeams {
  __typename: "UserTeam";
  id: string | null;
  user: GetLastActiveTeamIdAndTeams_teams_userTeams_user | null;
  role: UserTeamRole | null;
}

export interface GetLastActiveTeamIdAndTeams_teams_customDomains {
  __typename: "CustomDomain";
  id: string | null;
  name: string | null;
}

export interface GetLastActiveTeamIdAndTeams_teams {
  __typename: "Team";
  id: string | null;
  title: string | null;
  publicTitle: string | null;
  userTeams: GetLastActiveTeamIdAndTeams_teams_userTeams[] | null;
  customDomains: GetLastActiveTeamIdAndTeams_teams_customDomains[] | null;
}

export interface GetLastActiveTeamIdAndTeams {
  getJourneyProfile: GetLastActiveTeamIdAndTeams_getJourneyProfile | null;
  teams: GetLastActiveTeamIdAndTeams_teams[] | null;
}
