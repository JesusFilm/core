/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserInviteRemove
// ====================================================

export interface UserInviteRemove_userInviteRemove {
  __typename: "UserInvite";
  id: string | null;
  journeyId: string | null;
  removedAt: any | null;
}

export interface UserInviteRemove {
  userInviteRemove: UserInviteRemove_userInviteRemove | null;
}

export interface UserInviteRemoveVariables {
  id: string;
  journeyId: string;
}
