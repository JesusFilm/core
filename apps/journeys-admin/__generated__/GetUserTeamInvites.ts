/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserTeamInvites
// ====================================================

export interface GetUserTeamInvites_userTeamInvites {
  __typename: "UserTeamInvite";
  email: string;
  id: string;
  teamId: string;
}

export interface GetUserTeamInvites {
  userTeamInvites: GetUserTeamInvites_userTeamInvites[];
}

export interface GetUserTeamInvitesVariables {
  teamId: string;
}
