/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamFilterInput, UserTeamRole } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetUserTeamsAndInvites
// ====================================================

export interface GetUserTeamsAndInvites_userTeams_user {
  __typename: "User";
  email: string;
  firstName: string;
  id: string;
  imageUrl: string | null;
  lastName: string | null;
}

export interface GetUserTeamsAndInvites_userTeams {
  __typename: "UserTeam";
  id: string | null;
  role: UserTeamRole | null;
  user: GetUserTeamsAndInvites_userTeams_user | null;
}

export interface GetUserTeamsAndInvites_userTeamInvites {
  __typename: "UserTeamInvite";
  email: string | null;
  id: string | null;
  teamId: string | null;
}

export interface GetUserTeamsAndInvites {
  userTeams: GetUserTeamsAndInvites_userTeams[] | null;
  userTeamInvites: GetUserTeamsAndInvites_userTeamInvites[] | null;
}

export interface GetUserTeamsAndInvitesVariables {
  teamId: string;
  where: UserTeamFilterInput;
}
