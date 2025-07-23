/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: AcceptAllInvites
// ====================================================

export interface AcceptAllInvites_userTeamInviteAcceptAll {
  __typename: "UserTeamInvite";
  id: string | null;
}

export interface AcceptAllInvites_userInviteAcceptAll {
  __typename: "UserInvite";
  id: string | null;
}

export interface AcceptAllInvites {
  userTeamInviteAcceptAll: AcceptAllInvites_userTeamInviteAcceptAll[] | null;
  userInviteAcceptAll: AcceptAllInvites_userInviteAcceptAll[] | null;
}
