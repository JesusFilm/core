/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserJourneyRole } from "./globalTypes";

// ====================================================
// GraphQL fragment: InviteUserModalFields
// ====================================================

export interface InviteUserModalFields_user {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
}

export interface InviteUserModalFields {
  __typename: "UserJourney";
  id: string;
  role: UserJourneyRole;
  user: InviteUserModalFields_user | null;
}
