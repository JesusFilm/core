/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetUser
// ====================================================

export interface GetUser_me {
  __typename: "User";
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
}

export interface GetUser {
  me: GetUser_me | null;
}
