/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MeInput } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMe
// ====================================================

export interface GetMe_me {
  __typename: "User";
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  superAdmin: boolean | null;
  emailVerified: boolean;
}

export interface GetMe {
  me: GetMe_me | null;
}

export interface GetMeVariables {
  input?: MeInput | null;
}
