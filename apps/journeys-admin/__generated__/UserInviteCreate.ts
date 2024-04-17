/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserInviteCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserInviteCreate
// ====================================================

export interface UserInviteCreate_userInviteCreate {
  __typename: "UserInvite";
  id: string;
  email: string;
  removedAt: DateTime | null;
  acceptedAt: DateTime | null;
}

export interface UserInviteCreate {
  userInviteCreate: UserInviteCreate_userInviteCreate | null;
}

export interface UserInviteCreateVariables {
  journeyId: string;
  input: UserInviteCreateInput;
}
