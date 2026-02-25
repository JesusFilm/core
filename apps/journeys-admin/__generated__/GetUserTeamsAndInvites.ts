/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamFilterInput, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetUserTeamsAndInvites
// ====================================================

export interface GetUserTeamsAndInvites_userTeams_user_AuthenticatedUser {
  __typename: "AuthenticatedUser";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetUserTeamsAndInvites_userTeams_user_AnonymousUser {
  __typename: "AnonymousUser";
  id: string;
}

export type GetUserTeamsAndInvites_userTeams_user = GetUserTeamsAndInvites_userTeams_user_AuthenticatedUser | GetUserTeamsAndInvites_userTeams_user_AnonymousUser;

export interface GetUserTeamsAndInvites_userTeams {
  __typename: "UserTeam";
  id: string;
  role: UserTeamRole;
  user: GetUserTeamsAndInvites_userTeams_user;
}

export interface GetUserTeamsAndInvites_userTeamInvites {
  __typename: "UserTeamInvite";
  email: string;
  id: string;
  teamId: string;
}

export interface GetUserTeamsAndInvites {
  userTeams: GetUserTeamsAndInvites_userTeams[];
  userTeamInvites: GetUserTeamsAndInvites_userTeamInvites[];
}

export interface GetUserTeamsAndInvitesVariables {
  teamId: string;
  where: UserTeamFilterInput;
}
