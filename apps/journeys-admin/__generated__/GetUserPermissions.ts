/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole, UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetUserPermissions
// ====================================================

export interface GetUserPermissions_adminJourney_team_userTeams_user {
  __typename: "User";
  email: string;
}

export interface GetUserPermissions_adminJourney_team_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetUserPermissions_adminJourney_team_userTeams_user;
}

export interface GetUserPermissions_adminJourney_team {
  __typename: "Team";
  id: string;
  userTeams: GetUserPermissions_adminJourney_team_userTeams[];
}

export interface GetUserPermissions_adminJourney_userJourneys_user {
  __typename: "User";
  email: string;
}

export interface GetUserPermissions_adminJourney_userJourneys {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  user: GetUserPermissions_adminJourney_userJourneys_user | null;
}

export interface GetUserPermissions_adminJourney {
  __typename: "Journey";
  id: string;
  template: boolean | null;
  team: GetUserPermissions_adminJourney_team | null;
  userJourneys: GetUserPermissions_adminJourney_userJourneys[] | null;
}

export interface GetUserPermissions {
  adminJourney: GetUserPermissions_adminJourney;
}

export interface GetUserPermissionsVariables {
  id: string;
}
