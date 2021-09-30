/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SignUpFields
// ====================================================

export interface SignUpFields_action {
  __typename: "LinkAction" | "NavigateAction" | "NavigateToBlockAction" | "NavigateToJourneyAction";
  gtmEventName: string | null;
}

export interface SignUpFields {
  __typename: "SignupBlock";
  id: string;
  parentBlockId: string | null;
  action: SignUpFields_action | null;
}
