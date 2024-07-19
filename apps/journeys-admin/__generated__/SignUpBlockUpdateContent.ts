/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpBlockUpdateContent
// ====================================================

export interface SignUpBlockUpdateContent_signUpBlockUpdate {
  __typename: "SignUpBlock";
  id: string;
  submitLabel: string | null;
}

export interface SignUpBlockUpdateContent {
  signUpBlockUpdate: SignUpBlockUpdateContent_signUpBlockUpdate | null;
}

export interface SignUpBlockUpdateContentVariables {
  id: string;
  input: SignUpBlockUpdateInput;
}
