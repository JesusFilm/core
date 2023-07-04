/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetUserTeams
// ====================================================

export interface GetUserTeams_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetUserTeams_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetUserTeams_userTeams_user;
}

export interface GetUserTeams {
  userTeams: GetUserTeams_userTeams[];
}

export interface GetUserTeamsVariables {
  teamId: string;
}
