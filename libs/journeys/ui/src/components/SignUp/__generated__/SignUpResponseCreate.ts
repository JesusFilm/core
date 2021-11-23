/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpResponseCreateInput } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpResponseCreate
// ====================================================

export interface SignUpResponseCreate_signUpResponseCreate {
  __typename: "SignUpResponse";
  id: string;
  name: string;
  email: string;
}

export interface SignUpResponseCreate {
  signUpResponseCreate: SignUpResponseCreate_signUpResponseCreate;
}

export interface SignUpResponseCreateVariables {
  input: SignUpResponseCreateInput;
}
