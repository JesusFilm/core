/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpSubmissionEventCreateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: SignUpSubmissionEventCreate
// ====================================================

export interface SignUpSubmissionEventCreate_signUpSubmissionEventCreate {
  __typename: "SignUpSubmissionEvent";
  id: string | null;
}

export interface SignUpSubmissionEventCreate {
  signUpSubmissionEventCreate: SignUpSubmissionEventCreate_signUpSubmissionEventCreate | null;
}

export interface SignUpSubmissionEventCreateVariables {
  input: SignUpSubmissionEventCreateInput;
}
