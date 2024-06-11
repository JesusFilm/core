/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GoogleAuthInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: getGoogleAccessToken
// ====================================================

export interface getGoogleAccessToken_getGoogleAccessToken {
  __typename: "GoogleAuthResponse";
  id: string;
  accessToken: string;
}

export interface getGoogleAccessToken {
  getGoogleAccessToken: getGoogleAccessToken_getGoogleAccessToken;
}

export interface getGoogleAccessTokenVariables {
  input: GoogleAuthInput;
}
