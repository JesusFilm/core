/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SignUpFields
// ====================================================

export interface SignUpFields_action_NavigateAction {
  __typename: "NavigateAction";
  gtmEventName: string | null;
}

export interface SignUpFields_action_NavigateToBlockAction {
  __typename: "NavigateToBlockAction";
  gtmEventName: string | null;
  blockId: string;
}

export interface SignUpFields_action_NavigateToJourneyAction {
  __typename: "NavigateToJourneyAction";
  gtmEventName: string | null;
  journeyId: string;
}

export interface SignUpFields_action_LinkAction {
  __typename: "LinkAction";
  gtmEventName: string | null;
  url: string;
}

export type SignUpFields_action = SignUpFields_action_NavigateAction | SignUpFields_action_NavigateToBlockAction | SignUpFields_action_NavigateToJourneyAction | SignUpFields_action_LinkAction;

export interface SignUpFields {
  __typename: "SignUpBlock";
  id: string;
  parentBlockId: string | null;
  action: SignUpFields_action | null;
}
