/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: GetLastActiveTeamIdAndTeams
// ====================================================

export interface GetLastActiveTeamIdAndTeams_getJourneyProfile {
  __typename: "JourneyProfile";
  id: string;
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
  id: string;
  user: GetLastActiveTeamIdAndTeams_teams_userTeams_user;
  role: UserTeamRole;
}

export interface GetLastActiveTeamIdAndTeams_teams_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
}

export interface GetLastActiveTeamIdAndTeams_teams {
  __typename: "Team";
  id: string;
  title: string;
  publicTitle: string | null;
  userTeams: GetLastActiveTeamIdAndTeams_teams_userTeams[];
  customDomains: GetLastActiveTeamIdAndTeams_teams_customDomains[];
}

export interface GetLastActiveTeamIdAndTeams {
  getJourneyProfile: GetLastActiveTeamIdAndTeams_getJourneyProfile | null;
  teams: GetLastActiveTeamIdAndTeams_teams[];
}
