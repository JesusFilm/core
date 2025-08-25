/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUserInvites
// ====================================================

export interface GetUserInvites_userInvites {
  __typename: "UserInvite";
  id: string | null;
  journeyId: string | null;
  email: string | null;
  acceptedAt: any | null;
  removedAt: any | null;
}

export interface GetUserInvites {
  userInvites: GetUserInvites_userInvites[] | null;
}

export interface GetUserInvitesVariables {
  journeyId: string;
}
