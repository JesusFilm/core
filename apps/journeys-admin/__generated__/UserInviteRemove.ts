/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UserInviteRemove
// ====================================================

export interface UserInviteRemove_userInviteRemove {
  __typename: "UserInvite";
  id: string;
  journeyId: string;
  removedAt: DateTime | null;
}

export interface UserInviteRemove {
  userInviteRemove: UserInviteRemove_userInviteRemove;
}

export interface UserInviteRemoveVariables {
  id: string;
  journeyId: string;
}
