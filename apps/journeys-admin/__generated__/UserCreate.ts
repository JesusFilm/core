/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: UserCreate
// ====================================================

export interface UserCreate_userCreate {
  __typename: "User";
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  imageUrl: string | null;
}

export interface UserCreate {
  userCreate: UserCreate_userCreate;
}

export interface UserCreateVariables {
  input: UserCreateInput;
}
