/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SignUpBlockUpdateSubmitLabel
// ====================================================

export interface SignUpBlockUpdateSubmitLabel_signUpBlockUpdate {
  __typename: "SignUpBlock";
  id: string;
  submitLabel: string | null;
}

export interface SignUpBlockUpdateSubmitLabel {
  signUpBlockUpdate: SignUpBlockUpdateSubmitLabel_signUpBlockUpdate;
}

export interface SignUpBlockUpdateSubmitLabelVariables {
  id: string;
  submitLabel: string;
}
