/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: UserTeams
// ====================================================

export interface UserTeams_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface UserTeams_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: UserTeams_userTeams_user;
}

export interface UserTeams {
  userTeams: UserTeams_userTeams[];
}

export interface UserTeamsVariables {
  teamId: string;
}
