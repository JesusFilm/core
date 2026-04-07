/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentUser
// ====================================================

export interface GetCurrentUser_me_AnonymousUser {
  __typename: "AnonymousUser";
  id: string;
}

export interface GetCurrentUser_me_AuthenticatedUser {
  __typename: "AuthenticatedUser";
  id: string;
  email: string;
}

export type GetCurrentUser_me = GetCurrentUser_me_AnonymousUser | GetCurrentUser_me_AuthenticatedUser;

export interface GetCurrentUser {
  me: GetCurrentUser_me | null;
}
