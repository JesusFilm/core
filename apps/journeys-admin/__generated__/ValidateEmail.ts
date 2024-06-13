/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ValidateEmail
// ====================================================

export interface ValidateEmail_validateEmail {
  __typename: "User";
  id: string;
  emailVerified: boolean;
}

export interface ValidateEmail {
  validateEmail: ValidateEmail_validateEmail | null;
}

export interface ValidateEmailVariables {
  email: string;
  token: string;
}
