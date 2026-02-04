/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCurrentUser
// ====================================================

export interface GetCurrentUser_me {
  __typename: "User";
  id: string;
  userId: string;
  email: string | null;
  firstName: string;
  lastName: string | null;
  emailVerified: boolean;
}

export interface GetCurrentUser {
  me: GetCurrentUser_me | null;
}
