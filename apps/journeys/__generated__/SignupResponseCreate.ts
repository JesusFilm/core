/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignupResponseCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignupResponseCreate
// ====================================================

export interface SignupResponseCreate_signupResponseCreate {
  __typename: "SignupResponse";
  id: string;
  name: string;
  email: string;
}

export interface SignupResponseCreate {
  signupResponseCreate: SignupResponseCreate_signupResponseCreate;
}

export interface SignupResponseCreateVariables {
  input: SignupResponseCreateInput;
}
