/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserTeamInviteCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserTeamInviteCreate
// ====================================================

export interface UserTeamInviteCreate_userTeamInviteCreate {
  __typename: "UserTeamInvite";
  email: string;
  id: string;
  teamId: string;
}

export interface UserTeamInviteCreate {
  userTeamInviteCreate: UserTeamInviteCreate_userTeamInviteCreate | null;
}

export interface UserTeamInviteCreateVariables {
  teamId: string;
  input?: UserTeamInviteCreateInput | null;
}
